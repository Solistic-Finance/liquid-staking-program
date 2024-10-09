#![cfg_attr(not(debug_assertions), deny(warnings))]

use anchor_lang::prelude::*;

use error::SolisticError;

pub mod calc;
pub mod checks;
pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

#[cfg(not(feature = "no-entrypoint"))]
pub use state::State;

declare_id!("E42rv7jcez9BhqBDHxG8WaMw9PvHEToVCMrHUXbHghVN");

fn check_context<T>(ctx: &Context<T>) -> Result<()> {
    if !check_id(ctx.program_id) {
        return err!(SolisticError::InvalidProgramId);
    }
    // make sure there are no extra accounts
    if !ctx.remaining_accounts.is_empty() {
        return err!(SolisticError::UnexpectedAccount);
    }

    Ok(())
}

//-----------------------------------------------------
#[program]
pub mod solistic_finance {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: InitializeData) -> Result<()> {
        check_context(&ctx)?;
        ctx.accounts
            .process(data, *ctx.bumps.get("reserve_pda").unwrap())?;
        Ok(())
    }

    pub fn change_authority(
        ctx: Context<ChangeAuthority>,
        data: ChangeAuthorityData,
    ) -> Result<()> {
        check_context(&ctx)?;
        ctx.accounts.process(data)
    }

    // deposit AKA stake, AKA deposit_sol
    pub fn deposit(ctx: Context<Deposit>, lamports: u64) -> Result<()> {
        check_context(&ctx)?;
        ctx.accounts.process(lamports)
    }

    pub fn liquid_unstake(ctx: Context<LiquidUnstake>, msol_amount: u64) -> Result<()> {
        check_context(&ctx)?;
        ctx.accounts.process(msol_amount)
    }

    pub fn add_liquidity(ctx: Context<AddLiquidity>, lamports: u64) -> Result<()> {
        check_context(&ctx)?;
        ctx.accounts.process(lamports)
    }

    pub fn remove_liquidity(ctx: Context<RemoveLiquidity>, tokens: u64) -> Result<()> {
        check_context(&ctx)?;
        ctx.accounts.process(tokens)
    }

    pub fn config_lp(ctx: Context<ConfigLp>, params: ConfigLpParams) -> Result<()> {
        check_context(&ctx)?;
        ctx.accounts.process(params)
    }

    pub fn config_solistic(
        ctx: Context<ConfigSolistic>,
        params: ConfigSolisticParams,
    ) -> Result<()> {
        check_context(&ctx)?;
        ctx.accounts.process(params)
    }

    pub fn order_unstake(ctx: Context<OrderUnstake>, msol_amount: u64) -> Result<()> {
        check_context(&ctx)?;
        ctx.accounts.process(msol_amount)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        check_context(&ctx)?;
        ctx.accounts.process()
    }

    // emergency pauses the contract
    pub fn pause(ctx: Context<EmergencyPause>) -> Result<()> {
        check_context(&ctx)?;
        ctx.accounts.pause()
    }

    // resumes the contract
    pub fn resume(ctx: Context<EmergencyPause>) -> Result<()> {
        check_context(&ctx)?;
        ctx.accounts.resume()
    }
    
}
