use anchor_lang::prelude::*;

use crate::{
    error::SolisticError,
    events::admin::{EmergencyPauseEvent, ResumeEvent},
    State,
};

// this account struct is used for pause() and resume() instructions (see lib.rs)
#[derive(Accounts)]
pub struct EmergencyPause<'info> {
    #[account(
        mut,
        has_one = pause_authority @ SolisticError::InvalidPauseAuthority
    )]
    pub state: Account<'info, State>,
    pub pause_authority: Signer<'info>,
}

impl<'info> EmergencyPause<'info> {
    pub fn pause(&mut self) -> Result<()> {
        require!(!self.state.paused, SolisticError::AlreadyPaused);
        self.state.paused = true;
        emit!(EmergencyPauseEvent {
            state: self.state.key(),
        });

        Ok(())
    }

    pub fn resume(&mut self) -> Result<()> {
        require!(self.state.paused, SolisticError::NotPaused);
        self.state.paused = false;
        emit!(ResumeEvent {
            state: self.state.key(),
        });
        Ok(())
    }
}
