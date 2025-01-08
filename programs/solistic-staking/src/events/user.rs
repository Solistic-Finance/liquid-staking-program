use anchor_lang::prelude::*;

#[event]
pub struct DepositStakeAccountEvent {
    pub state: Pubkey,
    pub stake: Pubkey,
    pub delegated: u64,     // lamports in the stake account delegation
    pub withdrawer: Pubkey, // withdraw auth for the stake account
    pub stake_index: u32,
    pub validator: Pubkey,
    pub validator_index: u32,
    pub validator_active_balance: u64,
    pub total_active_balance: u64,
    pub user_ssol_balance: u64,
    pub ssol_minted: u64,
    // SSOL price used
    pub total_virtual_staked_lamports: u64,
    pub ssol_supply: u64,
}

#[event]
pub struct DepositEvent {
    pub state: Pubkey,
    pub sol_owner: Pubkey,
    pub user_sol_balance: u64,
    pub user_ssol_balance: u64,
    pub sol_leg_balance: u64,
    pub ssol_leg_balance: u64,
    pub reserve_balance: u64,
    pub sol_swapped: u64,
    pub ssol_swapped: u64,
    pub sol_deposited: u64,
    pub ssol_minted: u64,
    // SSOL price used
    pub total_virtual_staked_lamports: u64,
    pub ssol_supply: u64,
}

#[event]
pub struct WithdrawStakeAccountEvent {
    pub state: Pubkey,
    pub epoch: u64,
    pub stake: Pubkey,
    pub last_update_stake_delegation: u64,
    pub stake_index: u32,
    pub validator: Pubkey,
    pub validator_index: u32,
    pub user_ssol_balance: u64,
    pub user_ssol_auth: Pubkey, // owner of the sSOL
    pub ssol_burned: u64,
    pub ssol_fees: u64,
    pub split_stake: Pubkey, // output stake account
    pub beneficiary: Pubkey, // withdraw auth for the output stake account
    pub split_lamports: u64,
    pub fee_bp_cents: u32,
    // SSOL price used
    pub total_virtual_staked_lamports: u64,
    pub ssol_supply: u64,
}
