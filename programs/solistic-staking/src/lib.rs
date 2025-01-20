use anchor_lang::prelude::*;

use error::SolisticError;

pub mod calc;
pub mod checks;
pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

pub use state::State;

declare_id!("Sstkf2jUrQsoZ2Co1VwMksEyEqPTcQgxyiatpLrn74n");


#[cfg(not(feature = "no-entrypoint"))]
solana_security_txt::security_txt! {
    name: "solistic-staking",
    project_url: "https://solistic.finance",
    contacts: "https://docs.solistic.finance/",
    policy: "https://docs.solistic.finance/",
    source_code: "https://github.com/Solistic-Finance/liquid-staking-program",
    preferred_languages: "en",
    auditors: "https://docs.solistic.finance/solistic-staking/audit"
}

#[program]
pub mod solistic_staking {
   
    use super::*;

    //----------------------------------------------------------------------------
    // Base Instructions
    //----------------------------------------------------------------------------
    // Includes: initialization, contract parameters
    // basic user functions: (liquid)stake, liquid-unstake
    // liq-pool: add-liquidity, remove-liquidity
    // Validator list management
    //----------------------------------------------------------------------------

    pub fn initialize(ctx: Context<Initialize>, data: InitializeData) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts
            .process(data, ctx.bumps.reserve_pda)?;
        Ok(())
    }

    pub fn change_authority(
        ctx: Context<ChangeAuthority>,
        data: ChangeAuthorityData,
    ) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(data)
    }

    pub fn add_validator(ctx: Context<AddValidator>, score: u32) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(score)
    }

    pub fn remove_validator(
        ctx: Context<RemoveValidator>,
        index: u32,
        validator_vote: Pubkey,
    ) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(index, validator_vote)
    }

    pub fn set_validator_score(
        ctx: Context<SetValidatorScore>,
        index: u32,
        validator_vote: Pubkey,
        score: u32,
    ) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(index, validator_vote, score)
    }

    pub fn config_validator_system(
        ctx: Context<ConfigValidatorSystem>,
        extra_runs: u32,
    ) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(extra_runs)
    }

    // deposit AKA stake, AKA deposit_sol
    pub fn deposit(ctx: Context<Deposit>, lamports: u64) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(lamports)
    }

    // SPL stake pool like
    pub fn deposit_stake_account(
        ctx: Context<DepositStakeAccount>,
        validator_index: u32,
    ) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(validator_index)
    }

    pub fn liquid_unstake(ctx: Context<LiquidUnstake>, ssol_amount: u64) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(ssol_amount)
    }

    pub fn add_liquidity(ctx: Context<AddLiquidity>, lamports: u64) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(lamports)
    }

    pub fn remove_liquidity(ctx: Context<RemoveLiquidity>, tokens: u64) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(tokens)
    }

    pub fn config_lp(ctx: Context<ConfigLp>, params: ConfigLpParams) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(params)
    }

    pub fn config_solistic(
        ctx: Context<ConfigSolistic>,
        params: ConfigSolisticParams,
    ) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(params)
    }

    pub fn update_ssol_token_metadata(
        ctx: Context<UpdateSsolTokenMetadata>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        ctx.accounts.process(name, symbol, uri)
    }

    pub fn update_lp_token_metadata(
        ctx: Context<UpdateLpMintTokenMetadata>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        ctx.accounts.process(name, symbol, uri)
    }

    //-------------------------------------------------------------------------------------
    // Advanced instructions: deposit-stake-account, Delayed-Unstake
    // backend/bot "crank" related functions:
    // * order_unstake (starts stake-account deactivation)
    // * withdraw (delete & withdraw from a deactivated stake-account)
    // * update (compute stake-account rewards & update sSOL price)
    //-------------------------------------------------------------------------------------

    pub fn order_unstake(ctx: Context<OrderUnstake>, ssol_amount: u64) -> Result<()> {
        ctx.accounts.process(ssol_amount)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process()
    }

    pub fn stake_reserve(ctx: Context<StakeReserve>, validator_index: u32) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(validator_index)
    }

    pub fn update_active(
        ctx: Context<UpdateActive>,
        stake_index: u32,
        validator_index: u32,
    ) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(stake_index, validator_index)
    }
    pub fn update_deactivated(ctx: Context<UpdateDeactivated>, stake_index: u32) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(stake_index)
    }

    pub fn deactivate_stake(
        ctx: Context<DeactivateStake>,
        stake_index: u32,
        validator_index: u32,
    ) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(stake_index, validator_index)
    }

    pub fn emergency_unstake(
        ctx: Context<EmergencyUnstake>,
        stake_index: u32,
        validator_index: u32,
    ) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(stake_index, validator_index)
    }

    pub fn partial_unstake(
        ctx: Context<PartialUnstake>,
        stake_index: u32,
        validator_index: u32,
        desired_unstake_amount: u64,
    ) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts
            .process(stake_index, validator_index, desired_unstake_amount)
    }

    pub fn merge_stakes(
        ctx: Context<MergeStakes>,
        destination_stake_index: u32,
        source_stake_index: u32,
        validator_index: u32,
    ) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts
            .process(destination_stake_index, source_stake_index, validator_index)
    }

    pub fn redelegate(
        ctx: Context<ReDelegate>,
        stake_index: u32,
        source_validator_index: u32,
        dest_validator_index: u32,
    ) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts
            .process(stake_index, source_validator_index, dest_validator_index)
    }

    // emergency pauses the contract
    pub fn pause(ctx: Context<EmergencyPause>) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.pause()
    }

    // resumes the contract
    pub fn resume(ctx: Context<EmergencyPause>) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.resume()
    }

    // immediate withdraw of an active stake account - feature can be enabled or disable by the DAO
    pub fn withdraw_stake_account(
        ctx: Context<WithdrawStakeAccount>,
        stake_index: u32,
        validator_index: u32,
        ssol_amount: u64,
        beneficiary: Pubkey,
    ) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts
            .process(stake_index, validator_index, ssol_amount, beneficiary)
    }

    pub fn realloc_validator_list(ctx: Context<ReallocValidatorList>, capacity: u32) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(capacity)
    }

    pub fn realloc_stake_list(ctx: Context<ReallocStakeList>, capacity: u32) -> Result<()> {
        // check_context(&ctx)?;
        ctx.accounts.process(capacity)
    }
}

