use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

use crate::events::management::AddValidatorEvent;
use crate::state::validator_system::{ValidatorList, ValidatorRecord};
use crate::{error::SolisticError, State};

#[derive(Accounts)]
pub struct AddValidator<'info> {
    #[account(mut)]
    pub state: Account<'info, State>,
    #[account(address = state.validator_system.manager_authority)]
    pub manager_authority: Signer<'info>,
    #[account(
        mut,
        address = state.validator_system.validator_list.account,
    )]
    pub validator_list: Account<'info, ValidatorList>,

    /// CHECK: todo
    pub validator_vote: UncheckedAccount<'info>,

    /// CHECK: no discriminator used
    /// by initializing this account we mark the validator as added
    #[account(
        init, // will ensure it is system account
        payer = rent_payer,
        space = 0,
        seeds = [
            &state.key().to_bytes(),
            ValidatorRecord::DUPLICATE_FLAG_SEED,
            &validator_vote.key().to_bytes(),
        ],
        bump,
    )]
    pub duplication_flag: UncheckedAccount<'info>,
    #[account(
        mut,
        owner = system_program::ID
    )]
    pub rent_payer: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
    pub rent: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,
}

impl<'info> AddValidator<'info> {
    pub fn process(&mut self, score: u32) -> Result<()> {
        require!(!self.state.paused, SolisticError::ProgramIsPaused);

        msg!("Add validator {}", self.validator_vote.key);

        let state_address = self.state.key();
        self.state.validator_system.add(
            &mut self.validator_list.to_account_info().data.borrow_mut(),
            self.validator_vote.key(),
            score,
            &state_address,
            self.duplication_flag.key,
        )?;

        emit!(AddValidatorEvent {
            state: self.state.key(),
            validator: self.validator_vote.key(),
            index: self.state.validator_system.validator_count() - 1,
            score
        });

        Ok(())
    }
}
