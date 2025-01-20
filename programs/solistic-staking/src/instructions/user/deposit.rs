use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::token::{
    mint_to, transfer as transfer_tokens, Mint, MintTo, Token, TokenAccount,
    Transfer as TransferTokens,
};

use crate::error::SolisticError;
use crate::events::user::DepositEvent;
use crate::state::liq_pool::LiqPool;
use crate::{require_lte, State};

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        has_one = ssol_mint
    )]
    pub state: Box<Account<'info, State>>,

    #[account(mut)]
    pub ssol_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        seeds = [
            &state.key().to_bytes(),
            LiqPool::SOL_LEG_SEED
        ],
        bump = state.liq_pool.sol_leg_bump_seed
    )]
    pub liq_pool_sol_leg_pda: SystemAccount<'info>,

    #[account(
        mut,
        address = state.liq_pool.ssol_leg
    )]
    pub liq_pool_ssol_leg: Box<Account<'info, TokenAccount>>,
    /// CHECK: PDA
    #[account(
        seeds = [
            &state.key().to_bytes(),
            LiqPool::SSOL_LEG_AUTHORITY_SEED
        ],
        bump = state.liq_pool.ssol_leg_authority_bump_seed
    )]
    pub liq_pool_ssol_leg_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [
            &state.key().to_bytes(),
            State::RESERVE_SEED
        ],
        bump = state.reserve_bump_seed
    )]
    pub reserve_pda: SystemAccount<'info>,

    #[account(
        mut,
        owner = system_program::ID
    )]
    pub transfer_from: Signer<'info>,

    /// user sSOL Token account to send the sSOL
    #[account(
        mut,
        token::mint = state.ssol_mint
    )]
    pub mint_to: Box<Account<'info, TokenAccount>>,

    /// CHECK: PDA
    #[account(
        seeds = [
            &state.key().to_bytes(),
            State::SSOL_MINT_AUTHORITY_SEED
        ],
        bump = state.ssol_mint_authority_bump_seed
    )]
    pub ssol_mint_authority: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> Deposit<'info> {
    // fn deposit_sol()
    pub fn process(&mut self, lamports: u64) -> Result<()> {
        require!(!self.state.paused, SolisticError::ProgramIsPaused);

        require_gte!(
            lamports,
            self.state.min_deposit,
            SolisticError::DepositAmountIsTooLow
        );
        let user_sol_balance = self.transfer_from.lamports();
        require_gte!(
            user_sol_balance,
            lamports,
            SolisticError::NotEnoughUserFunds
        );

        // store for event log
        let user_ssol_balance = self.mint_to.amount;
        let reserve_balance = self.reserve_pda.lamports();
        let sol_leg_balance = self.liq_pool_sol_leg_pda.lamports();

        // impossible to happen check outside bug (ssol mint auth is a PDA)
        require_lte!(
            self.ssol_mint.supply,
            self.state.ssol_supply,
            SolisticError::UnregisteredSsolMinted
        );

        let total_virtual_staked_lamports = self.state.total_virtual_staked_lamports();
        let ssol_supply = self.state.ssol_supply;

        //compute how many sSOL to sell/mint for the user, base on how many lamports being deposited
        let user_ssol_buy_order = self.state.calc_ssol_from_lamports(lamports)?;
        msg!("--- user_s_sol_buy_order {}", user_ssol_buy_order);

        //First we try to "sell" sSOL to the user from the LiqPool.
        //The LiqPool needs to get rid of their sSOL because it works better if fully "unbalanced", i.e. with all SOL no sSOL
        //so, if we can, the LiqPool "sells" sSOL to the user (no fee)
        //
        // At max, we can sell all the sSOL in the LiqPool.sSOL_leg
        let ssol_leg_balance = self.liq_pool_ssol_leg.amount;
        let ssol_swapped: u64 = user_ssol_buy_order.min(ssol_leg_balance);
        msg!("--- swap_s_sol_max {}", ssol_swapped);

        //if we can sell from the LiqPool
        let sol_swapped = if ssol_swapped > 0 {
            // how much lamports go into the LiqPool?
            let sol_swapped = if user_ssol_buy_order == ssol_swapped {
                //we are fulfilling 100% the user order
                lamports //100% of the user deposit
            } else {
                // partially filled
                // then it's the lamport value of the tokens we're selling
                self.state.ssol_to_sol(ssol_swapped)?
            };

            // transfer sSOL to the user

            transfer_tokens(
                CpiContext::new_with_signer(
                    self.token_program.to_account_info(),
                    TransferTokens {
                        from: self.liq_pool_ssol_leg.to_account_info(),
                        to: self.mint_to.to_account_info(),
                        authority: self.liq_pool_ssol_leg_authority.to_account_info(),
                    },
                    &[&[
                        &self.state.key().to_bytes(),
                        LiqPool::SSOL_LEG_AUTHORITY_SEED,
                        &[self.state.liq_pool.ssol_leg_authority_bump_seed],
                    ]],
                ),
                ssol_swapped,
            )?;

            // transfer lamports to the LiqPool
            transfer(
                CpiContext::new(
                    self.system_program.to_account_info(),
                    Transfer {
                        from: self.transfer_from.to_account_info(),
                        to: self.liq_pool_sol_leg_pda.to_account_info(),
                    },
                ),
                sol_swapped,
            )?;

            sol_swapped
            //end of sale from the LiqPool
        } else {
            0
        };

        // check if we have more lamports from the user besides the amount we swapped
        let sol_deposited = lamports - sol_swapped;
        if sol_deposited > 0 {
            self.state.check_staking_cap(sol_deposited)?;

            // transfer sol_deposited to reserve
            transfer(
                CpiContext::new(
                    self.system_program.to_account_info(),
                    Transfer {
                        from: self.transfer_from.to_account_info(),
                        to: self.reserve_pda.to_account_info(),
                    },
                ),
                sol_deposited,
            )?;
            self.state.on_transfer_to_reserve(sol_deposited);
        }

        // compute how much sSOL we own the user besides the amount we already swapped
        let ssol_minted = user_ssol_buy_order - ssol_swapped;
        if ssol_minted > 0 {
            msg!("--- ssol_to_mint {}", ssol_minted);
            mint_to(
                CpiContext::new_with_signer(
                    self.token_program.to_account_info(),
                    MintTo {
                        mint: self.ssol_mint.to_account_info(),
                        to: self.mint_to.to_account_info(),
                        authority: self.ssol_mint_authority.to_account_info(),
                    },
                    &[&[
                        &self.state.key().to_bytes(),
                        State::SSOL_MINT_AUTHORITY_SEED,
                        &[self.state.ssol_mint_authority_bump_seed],
                    ]],
                ),
                ssol_minted,
            )?;
            self.state.on_ssol_mint(ssol_minted);
        }

        emit!(DepositEvent {
            state: self.state.key(),
            sol_owner: self.transfer_from.key(),
            user_sol_balance,
            user_ssol_balance,
            sol_leg_balance,
            ssol_leg_balance,
            reserve_balance,
            sol_swapped,
            ssol_swapped,
            sol_deposited,
            ssol_minted,
            total_virtual_staked_lamports,
            ssol_supply
        });

        Ok(())
    }
}
