use crate::events::{
    admin::ConfigSolisticEvent, BoolValueChange, FeeCentsValueChange, FeeValueChange,
    U64ValueChange,
};
use crate::{
    require_lte,
    state::{stake_system::StakeSystem, Fee, FeeCents},
    SolisticError, State,
};
use anchor_lang::prelude::*;

#[derive(Clone, Copy, Debug, Default, PartialEq, AnchorSerialize, AnchorDeserialize)]
pub struct ConfigSolisticParams {
    pub rewards_fee: Option<Fee>,
    pub slots_for_stake_delta: Option<u64>,
    pub min_stake: Option<u64>,
    pub min_deposit: Option<u64>,
    pub min_withdraw: Option<u64>,
    pub staking_sol_cap: Option<u64>,
    pub liquidity_sol_cap: Option<u64>,
    pub withdraw_stake_account_enabled: Option<bool>,
    pub delayed_unstake_fee: Option<FeeCents>,
    pub withdraw_stake_account_fee: Option<FeeCents>,
    pub max_stake_moved_per_epoch: Option<Fee>,
}

#[derive(Accounts)]
pub struct ConfigSolistic<'info> {
    #[account(
        mut,
        has_one = admin_authority @ SolisticError::InvalidAdminAuthority
    )]
    pub state: Account<'info, State>,
    pub admin_authority: Signer<'info>,
}

impl<'info> ConfigSolistic<'info> {
    // fn config_solistic()
    pub fn process(
        &mut self,
        ConfigSolisticParams {
            rewards_fee,
            slots_for_stake_delta,
            min_stake,
            min_deposit,
            min_withdraw,
            staking_sol_cap,
            liquidity_sol_cap,
            withdraw_stake_account_enabled,
            delayed_unstake_fee,
            withdraw_stake_account_fee,
            max_stake_moved_per_epoch,
        }: ConfigSolisticParams,
    ) -> Result<()> {
        let rewards_fee_change = if let Some(rewards_fee) = rewards_fee {
            require_lte!(
                rewards_fee,
                State::MAX_REWARD_FEE,
                SolisticError::RewardsFeeIsTooHigh
            );
            let old = self.state.reward_fee;
            self.state.reward_fee = rewards_fee;
            Some(FeeValueChange {
                old,
                new: rewards_fee,
            })
        } else {
            None
        };

        let slots_for_stake_delta_change =
            if let Some(slots_for_stake_delta) = slots_for_stake_delta {
                require_gte!(
                    slots_for_stake_delta,
                    StakeSystem::MIN_UPDATE_WINDOW,
                    SolisticError::UpdateWindowIsTooLow
                );
                let old = self.state.stake_system.slots_for_stake_delta;
                self.state.stake_system.slots_for_stake_delta = slots_for_stake_delta;
                Some(U64ValueChange {
                    old,
                    new: slots_for_stake_delta,
                })
            } else {
                None
            };

        let min_stake_change = if let Some(min_stake) = min_stake {
            require_gte!(
                min_stake,
                State::MIN_STAKE_LOWER_LIMIT,
                SolisticError::MinStakeIsTooLow
            );
            let old = self.state.stake_system.min_stake;
            self.state.stake_system.min_stake = min_stake;
            Some(U64ValueChange {
                old,
                new: min_stake,
            })
        } else {
            None
        };

        let min_deposit_change = if let Some(min_deposit) = min_deposit {
            // It is not dangerous to skip value checks because it is deposit only action
            // We can use u64::MAX to stop accepting deposits
            // or 0 to accept 1 lamport
            let old = self.state.min_deposit;
            self.state.min_deposit = min_deposit;
            Some(U64ValueChange {
                old,
                new: min_deposit,
            })
        } else {
            None
        };

        let min_withdraw_change = if let Some(min_withdraw) = min_withdraw {
            require_lte!(
                min_withdraw,
                State::MAX_WITHDRAW_ATOM,
                SolisticError::MinWithdrawIsTooHigh
            );
            let old = self.state.min_withdraw;
            self.state.min_withdraw = min_withdraw;
            Some(U64ValueChange {
                old,
                new: min_withdraw,
            })
        } else {
            None
        };

        let staking_sol_cap_change = if let Some(staking_sol_cap) = staking_sol_cap {
            let old = self.state.staking_sol_cap;
            self.state.staking_sol_cap = staking_sol_cap;
            Some(U64ValueChange {
                old,
                new: staking_sol_cap,
            })
        } else {
            None
        };

        let liquidity_sol_cap_change = if let Some(liquidity_sol_cap) = liquidity_sol_cap {
            let old = self.state.liq_pool.liquidity_sol_cap;
            self.state.liq_pool.liquidity_sol_cap = liquidity_sol_cap;
            Some(U64ValueChange {
                old,
                new: liquidity_sol_cap,
            })
        } else {
            None
        };

        let withdraw_stake_account_enabled_change =
            if let Some(withdraw_stake_account_enabled) = withdraw_stake_account_enabled {
                let old = self.state.withdraw_stake_account_enabled;
                self.state.withdraw_stake_account_enabled = withdraw_stake_account_enabled;
                Some(BoolValueChange {
                    old,
                    new: withdraw_stake_account_enabled,
                })
            } else {
                None
            };

        let delayed_unstake_fee_change = if let Some(delayed_unstake_fee) = delayed_unstake_fee {
            require_lte!(
                delayed_unstake_fee,
                State::MAX_DELAYED_UNSTAKE_FEE,
                SolisticError::DelayedUnstakeFeeIsTooHigh
            );
            let old = self.state.delayed_unstake_fee;
            self.state.delayed_unstake_fee = delayed_unstake_fee;
            Some(FeeCentsValueChange {
                old,
                new: delayed_unstake_fee,
            })
        } else {
            None
        };

        let withdraw_stake_account_fee_change =
            if let Some(withdraw_stake_account_fee) = withdraw_stake_account_fee {
                require_lte!(
                    withdraw_stake_account_fee,
                    State::MAX_WITHDRAW_STAKE_ACCOUNT_FEE,
                    SolisticError::WithdrawStakeAccountFeeIsTooHigh
                );
                let old = self.state.withdraw_stake_account_fee;
                self.state.withdraw_stake_account_fee = withdraw_stake_account_fee;
                Some(FeeCentsValueChange {
                    old,
                    new: withdraw_stake_account_fee,
                })
            } else {
                None
            };

        let max_stake_moved_per_epoch_change =
            if let Some(max_stake_moved_per_epoch) = max_stake_moved_per_epoch {
                // Not checking for 100% because probably for some emergency case
                // we need to move the same stake multiple times,
                // for example to fix some incident
                // max_stake_moved_per_epoch.check()?;
                let old = self.state.max_stake_moved_per_epoch;
                self.state.max_stake_moved_per_epoch = max_stake_moved_per_epoch;
                Some(FeeValueChange {
                    old,
                    new: max_stake_moved_per_epoch,
                })
            } else {
                None
            };

        emit!(ConfigSolisticEvent {
            state: self.state.key(),
            rewards_fee_change,
            slots_for_stake_delta_change,
            min_stake_change,
            min_deposit_change,
            min_withdraw_change,
            staking_sol_cap_change,
            liquidity_sol_cap_change,
            withdraw_stake_account_enabled_change,
            delayed_unstake_fee_change,
            withdraw_stake_account_fee_change,
            max_stake_moved_per_epoch_change,
        });

        Ok(())
    }
}
