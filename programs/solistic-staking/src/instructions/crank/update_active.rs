//get staking rewards & update sSOL price

use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::stake_history;
use anchor_spl::stake::{withdraw, Stake, StakeAccount, Withdraw};
use anchor_spl::token::{mint_to, Mint, MintTo, Token};

use crate::events::crank::UpdateActiveEvent;
use crate::events::U64ValueChange;
use crate::state::stake_system::StakeList;
use crate::state::validator_system::ValidatorList;
use crate::BeginOutput;
use crate::{
    error::SolisticError,
    state::stake_system::StakeSystem,
    State,
};


#[derive(Accounts)]
pub struct UpdateActive<'info> {
    #[account(
        mut,
        has_one = treasury_ssol_account,
        has_one = ssol_mint
    )]
    pub state: Box<Account<'info, State>>,
    #[account(
        mut,
        address = state.stake_system.stake_list.account,
    )]
    pub stake_list: Account<'info, StakeList>,

    #[account(
        mut,
        address = state.validator_system.validator_list.account,
    )]
    pub validator_list: Account<'info, ValidatorList>,

    #[account(mut)]
    pub stake_account: Box<Account<'info, StakeAccount>>,
    /// CHECK: PDA
    #[account(
        seeds = [
            &state.key().to_bytes(),
            StakeSystem::STAKE_WITHDRAW_SEED
        ],
        bump = state.stake_system.stake_withdraw_bump_seed
    )]
    pub stake_withdraw_authority: UncheckedAccount<'info>, // for getting non delegated SOLs
    #[account(
        mut,
        seeds = [
            &state.key().to_bytes(),
            State::RESERVE_SEED
        ],
        bump = state.reserve_bump_seed
    )]
    pub reserve_pda: SystemAccount<'info>, // all non delegated SOLs (if some attacker transfers it to stake) are sent to reserve_pda

    #[account(mut)]
    pub ssol_mint: Box<Account<'info, Mint>>,
    /// CHECK: PDA
    #[account(
        seeds = [
            &state.key().to_bytes(),
            State::SSOL_MINT_AUTHORITY_SEED
        ],
        bump = state.ssol_mint_authority_bump_seed
    )]
    pub ssol_mint_authority: UncheckedAccount<'info>,
    /// CHECK: in code
    #[account(mut)]
    pub treasury_ssol_account: UncheckedAccount<'info>, //receives 1% from staking rewards protocol fee

    pub clock: Sysvar<'info, Clock>,
    /// CHECK: have no CPU budget to parse
    #[account(address = stake_history::ID)]
    pub stake_history: UncheckedAccount<'info>,

    pub stake_program: Program<'info, Stake>,

    pub token_program: Program<'info, Token>,
}


impl<'info> UpdateActive<'info> {

    fn begin(&mut self, stake_index: u32) -> Result<BeginOutput> {
        let is_treasury_ssol_ready_for_transfer = self
            .state
            .get_treasury_ssol_balance(&self.treasury_ssol_account)
            .is_some();

        let virtual_reserve_balance =
            self.state.available_reserve_balance + self.state.rent_exempt_for_token_acc;

        // impossible to happen check outside bug
        if self.reserve_pda.lamports() < virtual_reserve_balance {
            msg!(
                "Warning: Reserve must have {} lamports but got {}",
                virtual_reserve_balance,
                self.reserve_pda.lamports()
            );
        }
        // Update reserve balance
        self.state.available_reserve_balance = self
            .reserve_pda
            .lamports()
            .saturating_sub(self.state.rent_exempt_for_token_acc);
        // Update sSOL supply
        // impossible to happen check outside bug (ssol mint auth is a PDA)
        if self.ssol_mint.supply > self.state.ssol_supply {
            msg!(
                "Warning: sSOL minted {} lamports outside of solistic",
                self.ssol_mint.supply - self.state.ssol_supply
            );
            self.state.staking_sol_cap = 0;
        }
        self.state.ssol_supply = self.ssol_mint.supply;

        let stake = self.state.stake_system.get_checked(
            &self.stake_list.to_account_info().data.as_ref().borrow(),
            stake_index,
            self.stake_account.to_account_info().key,
        )?;
        /*if stake.last_update_epoch == self.clock.epoch {
            msg!("Double update for stake {}", stake.stake_account);
            return Ok(()); // Not error. Maybe parallel update artifact
        }*/

        Ok(BeginOutput {
            stake,
            is_treasury_ssol_ready_for_transfer,
        })
    }

    pub fn withdraw_to_reserve(&mut self, amount: u64) -> Result<()> {
        if amount > 0 {
            // Move unstaked + rewards for restaking
            withdraw(
                CpiContext::new_with_signer(
                    self.stake_program.to_account_info(),
                    Withdraw {
                        stake: self.stake_account.to_account_info(),
                        withdrawer: self.stake_withdraw_authority.to_account_info(),
                        to: self.reserve_pda.to_account_info(),
                        clock: self.clock.to_account_info(),
                        stake_history: self.stake_history.to_account_info(),
                    },
                    &[&[
                        &self.state.key().to_bytes(),
                        StakeSystem::STAKE_WITHDRAW_SEED,
                        &[self.state.stake_system.stake_withdraw_bump_seed],
                    ]],
                ),
                amount,
                None,
            )?;
            self.state.on_transfer_to_reserve(amount);
        }
        Ok(())
    }

    pub fn mint_to_treasury(&mut self, ssol_lamports: u64) -> Result<()> {
        if ssol_lamports > 0 {
            mint_to(
                CpiContext::new_with_signer(
                    self.token_program.to_account_info(),
                    MintTo {
                        mint: self.ssol_mint.to_account_info(),
                        to: self.treasury_ssol_account.to_account_info(),
                        authority: self.ssol_mint_authority.to_account_info(),
                    },
                    &[&[
                        &self.state.key().to_bytes(),
                        State::SSOL_MINT_AUTHORITY_SEED,
                        &[self.state.ssol_mint_authority_bump_seed],
                    ]],
                ),
                ssol_lamports,
            )?;
            self.state.on_ssol_mint(ssol_lamports);
        }
        Ok(())
    }

    #[inline]
    pub fn update_ssol_price(&mut self) -> Result<U64ValueChange> {
        // price is computed as:
        // total_active_balance + total_cooling_down + reserve - circulating_ticket_balance
        // DIVIDED by ssol_supply
        let old = self.state.ssol_price;
        self.state.ssol_price = self.state.ssol_to_sol(State::PRICE_DENOMINATOR)?; // store binary-denominated sSOL price
        Ok(U64ValueChange {
            old,
            new: self.state.ssol_price,
        })
    }

    // returns fees in ssol
    pub fn mint_protocol_fees(&mut self, lamports_incoming: u64) -> Result<u64> {
        // apply x% protocol fee on staking rewards (do this before updating validators' balance, so it's 1% at old, lower, price)
        let protocol_rewards_fee = self.state.reward_fee.apply(lamports_incoming);
        msg!("protocol_rewards_fee {}", protocol_rewards_fee);
        // compute sSOL amount for protocol_rewards_fee
        let fee_as_ssol_amount = self.state.calc_ssol_from_lamports(protocol_rewards_fee)?;
        self.mint_to_treasury(fee_as_ssol_amount)?;
        Ok(fee_as_ssol_amount)
    }

    /// Compute rewards for a single stake account
    /// take 1% protocol fee for treasury & add the rest to validator_system.total_balance
    /// update sSOL price accordingly
    /// Future optional expansion: Partial: If the stake-account is a fully-deactivated stake account ready to withdraw,
    /// (cool-down period is complete) delete-withdraw the stake-account, send SOL to reserve-account
    //
    // fn update_active()
    pub fn process(&mut self, stake_index: u32, validator_index: u32) -> Result<()> {
        require!(!self.state.paused, SolisticError::ProgramIsPaused);

        let total_virtual_staked_lamports = self.state.total_virtual_staked_lamports();
        let ssol_supply = self.state.ssol_supply;
        let BeginOutput {
            mut stake,
            is_treasury_ssol_ready_for_transfer,
        } = self.begin(stake_index)?;

        let delegation = self.stake_account.delegation().ok_or_else(|| {
            error!(SolisticError::RequiredDelegatedStake).with_account_name("stake_account")
        })?;

        let mut validator = self.state.validator_system.get_checked(
            &self.validator_list.to_account_info().data.as_ref().borrow(),
            validator_index,
            &delegation.voter_pubkey,
        )?;
        // record for event
        let validator_active_balance = validator.active_balance;
        let total_active_balance = self.state.validator_system.total_active_balance;

        // require stake is active (deactivation_epoch == u64::MAX)
        require_eq!(
            delegation.deactivation_epoch,
            std::u64::MAX,
            SolisticError::RequiredActiveStake
        );

        // current lamports amount, to compare with previous
        let delegated_lamports = delegation.stake;

        // we don't consider self.stake_account.meta().unwrap().rent_exempt_reserve as part of the stake
        // the reserve lamports are paid by the solistic-program/bot and return to solistic-program/bot once the account is deleted
        let stake_balance_without_rent = self.stake_account.to_account_info().lamports()
            - self.stake_account.meta().unwrap().rent_exempt_reserve;
        // normally extra-lamports in the native stake means MEV rewards
        let extra_lamports = stake_balance_without_rent.saturating_sub(delegated_lamports);
        msg!("Extra lamports in stake balance: {}", extra_lamports);
        let extra_ssol_fees = if extra_lamports > 0 {
            // by withdrawing to reserve, we add to the SOL assets under control,
            // and by that we increase the sSOL price
            self.withdraw_to_reserve(extra_lamports)?;
            // after sending to reserve, we take protocol_fees as minted sSOL
            if is_treasury_ssol_ready_for_transfer {
                Some(self.mint_protocol_fees(extra_lamports)?)
            } else {
                None
            }
        } else {
            if is_treasury_ssol_ready_for_transfer {
                Some(0)
            } else {
                None
            }
        };

        msg!("current staked lamports {}", delegated_lamports);
        let delegation_growth_ssol_fees =
            if delegated_lamports >= stake.last_update_delegated_lamports {
                // re-delegated by solana rewards
                let rewards = delegated_lamports - stake.last_update_delegated_lamports;
                msg!("Staking rewards: {}", rewards);

                let delegation_growth_ssol_fees = if is_treasury_ssol_ready_for_transfer {
                    Some(self.mint_protocol_fees(rewards)?)
                } else {
                    None
                };

                // validator active balance is updated with rewards
                validator.active_balance += rewards;
                // validator_system.total_active_balance is updated with re-delegated rewards (this impacts price-calculation)
                self.state.validator_system.total_active_balance += rewards;
                delegation_growth_ssol_fees
            } else {
                //slashed
                let slashed = stake.last_update_delegated_lamports - delegated_lamports;
                msg!("slashed {}", slashed);
                //validator balance is updated with slashed
                validator.active_balance = validator.active_balance.saturating_sub(slashed);
                self.state.validator_system.total_active_balance =
                    total_active_balance.saturating_sub(slashed);
                if is_treasury_ssol_ready_for_transfer {
                    Some(0)
                } else {
                    None
                }
            };

        // mark stake-account as visited
        stake.last_update_epoch = self.clock.epoch;
        let delegation_change = {
            let old = stake.last_update_delegated_lamports;
            stake.last_update_delegated_lamports = delegated_lamports;
            U64ValueChange {
                old,
                new: delegated_lamports,
            }
        };

        //update validator-list
        self.state.validator_system.set(
            &mut self
                .validator_list
                .to_account_info()
                .data
                .as_ref()
                .borrow_mut(),
            validator_index,
            validator,
        )?;

        // set new sSOL price
        let ssol_price_change = self.update_ssol_price()?;
        // save stake record
        self.state.stake_system.set(
            &mut self.stake_list.to_account_info().data.as_ref().borrow_mut(),
            stake_index,
            stake,
        )?;

        assert_eq!(
            self.state.available_reserve_balance + self.state.rent_exempt_for_token_acc,
            self.reserve_pda.lamports()
        );
        emit!(UpdateActiveEvent {
            state: self.state.key(),
            epoch: self.clock.epoch,
            stake_index,
            stake_account: stake.stake_account,
            validator_index,
            validator_vote: validator.validator_account,
            delegation_change,
            delegation_growth_ssol_fees,
            extra_lamports,
            extra_ssol_fees,
            validator_active_balance,
            total_active_balance,
            ssol_price_change,
            reward_fee_used: self.state.reward_fee,
            total_virtual_staked_lamports,
            ssol_supply,
        });
        Ok(())
    }
}
