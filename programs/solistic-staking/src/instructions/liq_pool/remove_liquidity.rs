use crate::{
    calc::proportional, checks::check_token_source_account, error::SolisticError,
    events::liq_pool::RemoveLiquidityEvent, state::liq_pool::LiqPool, State,
};
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::token::{
    burn, transfer as transfer_token, Burn, Mint, Token, TokenAccount, Transfer as TransferToken,
};

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    #[account(mut)]
    pub state: Box<Account<'info, State>>,

    #[account(
        mut,
        address = state.liq_pool.lp_mint
    )]
    pub lp_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        token::mint = state.liq_pool.lp_mint
    )]
    pub burn_from: Box<Account<'info, TokenAccount>>,
    pub burn_from_authority: Signer<'info>,

    #[account(mut)]
    pub transfer_sol_to: SystemAccount<'info>,

    #[account(
        mut,
        token::mint = state.ssol_mint
    )]
    pub transfer_ssol_to: Box<Account<'info, TokenAccount>>,

    // legs
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

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> RemoveLiquidity<'info> {
    pub fn process(&mut self, tokens: u64) -> Result<()> {
        require!(!self.state.paused, SolisticError::ProgramIsPaused);

        check_token_source_account(&self.burn_from, self.burn_from_authority.key, tokens)
            .map_err(|e| e.with_account_name("burn_from"))?;

        let user_lp_balance = self.burn_from.amount;
        let user_sol_balance = self.transfer_sol_to.lamports();
        let user_ssol_balance = self.transfer_ssol_to.amount;

        let sol_leg_balance = self.liq_pool_sol_leg_pda.lamports();
        let ssol_leg_balance = self.liq_pool_ssol_leg.amount;

        // Update virtual lp_supply by real one
        let lp_mint_supply = self.lp_mint.supply;
        if lp_mint_supply > self.state.liq_pool.lp_supply {
            // impossible to happen unless bug
            msg!("Someone minted lp tokens without our permission or bug found");
        } else {
            // maybe burn
            self.state.liq_pool.lp_supply = lp_mint_supply;
        }
        msg!("sSOL-SOL-LP total supply:{}", lp_mint_supply);

        let sol_out_amount = proportional(
            tokens,
            sol_leg_balance - self.state.rent_exempt_for_token_acc,
            self.state.liq_pool.lp_supply, // Use virtual amount
        )?;
        let ssol_out_amount = proportional(
            tokens,
            ssol_leg_balance,
            self.state.liq_pool.lp_supply, // Use virtual amount
        )?;

        require_gte!(
            sol_out_amount + self.state.ssol_to_sol(ssol_out_amount)?,
            self.state.min_withdraw,
            SolisticError::WithdrawAmountIsTooLow,
        );
        msg!(
            "SOL out amount:{}, sSOL out amount:{}",
            sol_out_amount,
            ssol_out_amount
        );

        if sol_out_amount > 0 {
            msg!("transfer SOL");
            transfer(
                CpiContext::new_with_signer(
                    self.system_program.to_account_info(),
                    Transfer {
                        from: self.liq_pool_sol_leg_pda.to_account_info(),
                        to: self.transfer_sol_to.to_account_info(),
                    },
                    &[&[
                        &self.state.key().to_bytes(),
                        LiqPool::SOL_LEG_SEED,
                        &[self.state.liq_pool.sol_leg_bump_seed],
                    ]],
                ),
                sol_out_amount,
            )?;
        }

        if ssol_out_amount > 0 {
            msg!("transfer sSOL");
            transfer_token(
                CpiContext::new_with_signer(
                    self.token_program.to_account_info(),
                    TransferToken {
                        from: self.liq_pool_ssol_leg.to_account_info(),
                        to: self.transfer_ssol_to.to_account_info(),
                        authority: self.liq_pool_ssol_leg_authority.to_account_info(),
                    },
                    &[&[
                        &self.state.key().to_bytes(),
                        LiqPool::SSOL_LEG_AUTHORITY_SEED,
                        &[self.state.liq_pool.ssol_leg_authority_bump_seed],
                    ]],
                ),
                ssol_out_amount,
            )?;
        }

        burn(
            CpiContext::new(
                self.token_program.to_account_info(),
                Burn {
                    mint: self.lp_mint.to_account_info(),
                    from: self.burn_from.to_account_info(),
                    authority: self.burn_from_authority.to_account_info(),
                },
            ),
            tokens,
        )?;
        self.state.liq_pool.on_lp_burn(tokens);

        emit!(RemoveLiquidityEvent {
            state: self.state.key(),
            sol_leg_balance,
            ssol_leg_balance,
            user_lp_balance,
            user_sol_balance,
            user_ssol_balance,
            lp_mint_supply,
            lp_burned: tokens,
            sol_out_amount,
            ssol_out_amount,
        });

        Ok(())
    }
}
