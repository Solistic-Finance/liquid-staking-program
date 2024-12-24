use anchor_lang::prelude::*;

#[event]
pub struct ClaimEvent {
    pub state: Pubkey,
    pub epoch: u64,
    pub ticket: Pubkey,
    pub beneficiary: Pubkey,
    pub circulating_ticket_balance: u64,
    pub circulating_ticket_count: u64,
    pub reserve_balance: u64,
    pub user_balance: u64,
    pub amount: u64,
}

#[event]
pub struct OrderUnstakeEvent {
    pub state: Pubkey,
    pub ticket_epoch: u64,
    pub ticket: Pubkey,
    pub beneficiary: Pubkey,
    pub circulating_ticket_balance: u64,
    pub circulating_ticket_count: u64,
    pub user_ssol_balance: u64,
    pub burned_ssol_amount: u64,
    pub sol_amount: u64,
    pub fee_bp_cents: u32,
    // SSOL price used
    pub total_virtual_staked_lamports: u64,
    pub ssol_supply: u64,
}
