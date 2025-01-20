//get staking rewards & update sSOL price

use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::stake_history;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::stake::{withdraw, Stake, StakeAccount, Withdraw};
use anchor_spl::token::{mint_to, Mint, MintTo, Token};

use crate::events::crank::UpdateDeactivatedEvent;
use crate::events::U64ValueChange;
use crate::state::stake_system::StakeList;
use crate::BeginOutput;
use crate::{
    error::SolisticError,
    state::stake_system::StakeSystem,
    State,
};

#[derive(Accounts)]
pub struct UpdateDeactivated<'info> {
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

    /// CHECK: not important
    #[account(
        mut,
        address = state.operational_sol_account
    )]
    pub operational_sol_account: UncheckedAccount<'info>,

    pub clock: Sysvar<'info, Clock>,
    /// CHECK: have no CPU budget to parse
    #[account(address = stake_history::ID)]
    pub stake_history: UncheckedAccount<'info>,

    pub stake_program: Program<'info, Stake>,

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}


impl<'info> UpdateDeactivated<'info> {
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

    /// Compute rewards for a single deactivated stake-account
    /// take 1% protocol fee for treasury & add the rest to validator_system.total_balance
    /// update sSOL price accordingly
    /// Optional Future Expansion: Partial: If the stake-account is a fully-deactivated stake account ready to withdraw,
    /// (cool-down period is complete) delete-withdraw the stake-account, send SOL to reserve-account
    pub fn process(&mut self, stake_index: u32) -> Result<()> {
        require!(!self.state.paused, SolisticError::ProgramIsPaused);

        let total_virtual_staked_lamports = self.state.total_virtual_staked_lamports();
        let ssol_supply = self.state.ssol_supply;
        let operational_sol_balance = self.operational_sol_account.lamports();
        let BeginOutput {
            stake,
            is_treasury_ssol_ready_for_transfer,
        } = self.begin(stake_index)?;

        let delegation = self.stake_account.delegation().ok_or_else(|| {
            error!(SolisticError::RequiredDelegatedStake).with_account_name("stake_account")
        })?;
        // require deactivated or deactivating (deactivation_epoch != u64::MAX)
        require_neq!(
            delegation.deactivation_epoch,
            std::u64::MAX,
            SolisticError::RequiredDeactivatingStake
        );

        // Jun-2023 In order to support Solana new redelegate instruction, we need to ignore stake_account.delegation().stake
        // this is because in the case of a redelegated-Deactivating account, the field stake_account.delegation().stake
        // *still contains the original stake amount*, even if the lamports() were sent to the redelegated-Activating account.
        //
        // So for deactivating accounts, in order to determine rewards received, we consider from now on:
        // (lamports - rent) versus last_update_delegated_lamports.
        //
        // For the case of redelegated-Deactivating, when we redelegate we set  last_update_delegated_lamports=0 for the account
        // that go into deactivation, so later, when we reach here last_update_delegated_lamports=0 and in (lamports - rent)
        // we will have rewards. Side note: In the rare event of somebody sending lamports to a deactivating account, we will simply
        // consider those lamports part of the rewards.

        // current lamports amount, to compare with previous
        let rent = self.stake_account.meta().unwrap().rent_exempt_reserve;
        let stake_balance_without_rent = self.stake_account.to_account_info().lamports() - rent;

        let ssol_fees = if stake_balance_without_rent >= stake.last_update_delegated_lamports {
            // if there were rewards, mint treasury fee
            // Note: this includes any extra lamports in the stake-account (MEV rewards mostly)
            let rewards = stake_balance_without_rent - stake.last_update_delegated_lamports;
            msg!("Staking rewards: {}", rewards);
            if is_treasury_ssol_ready_for_transfer {
                Some(self.mint_protocol_fees(rewards)?)
            } else {
                None
            }
        } else {
            // less than observed last time
            let slashed = stake.last_update_delegated_lamports - stake_balance_without_rent;
            msg!("Slashed {}", slashed);
            if is_treasury_ssol_ready_for_transfer {
                Some(0)
            } else {
                None
            }
        };

        // withdraw all to reserve (the stake account will be marked for deletion by the system)
        self.withdraw_to_reserve(self.stake_account.to_account_info().lamports())?;
        // but send the rent-exempt lamports part to operational_sol_account for the future recreation of this slot's account
        transfer(
            CpiContext::new_with_signer(
                self.system_program.to_account_info(),
                Transfer {
                    from: self.reserve_pda.to_account_info(),
                    to: self.operational_sol_account.to_account_info(),
                },
                &[&[
                    &self.state.key().to_bytes(),
                    State::RESERVE_SEED,
                    &[self.state.reserve_bump_seed],
                ]],
            ),
            rent,
        )?;
        self.state.on_transfer_from_reserve(rent);

        if stake.last_update_delegated_lamports != 0 {
            if stake.is_emergency_unstaking == 0 {
                // remove from delayed_unstake_cooling_down (amount is now in the reserve, is no longer cooling-down)
                self.state.stake_system.delayed_unstake_cooling_down -=
                    stake.last_update_delegated_lamports;
            } else {
                // remove from emergency_cooling_down (amount is now in the reserve, is no longer cooling-down)
                self.state.emergency_cooling_down -= stake.last_update_delegated_lamports;
            }
        }

        // We update sSOL price in case we receive "extra deactivating rewards" after the start of Delayed-unstake.
        // Those rewards went into reserve_pda, are part of sSOL price (benefit all stakers) and even might be re-staked
        // set new sSOL price
        let ssol_price_change = self.update_ssol_price()?;

        //remove deleted stake-account from our list
        self.state.stake_system.remove(
            &mut self
                .stake_list
                .to_account_info()
                .data
                .as_ref()
                .borrow_mut(),
            stake_index,
        )?;
        emit!(UpdateDeactivatedEvent {
            state: self.state.key(),
            epoch: self.clock.epoch,
            stake_index,
            stake_account: stake.stake_account,
            balance_without_rent_exempt: stake_balance_without_rent,
            last_update_delegated_lamports: stake.last_update_delegated_lamports,
            ssol_fees,
            ssol_price_change,
            reward_fee_used: self.state.reward_fee,
            operational_sol_balance,
            total_virtual_staked_lamports,
            ssol_supply,
        });

        Ok(())
    }
}
