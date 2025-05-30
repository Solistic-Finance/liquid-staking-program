use crate::{
    checks::{
        check_freeze_authority, check_mint_authority, check_mint_empty, check_token_mint,
        check_token_owner,
    },
    error::SolisticError,
    events::admin::InitializeEvent,
    require_lte,
    state::{
        fee::FeeCents, liq_pool::LiqPool, stake_system::StakeSystem,
        validator_system::ValidatorSystem, Fee,
    },
    State, ID,
};
use anchor_lang::{prelude::*, solana_program::program_pack::Pack};
use anchor_spl::token::{spl_token, Mint, TokenAccount};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(zero)]
    pub state: Box<Account<'info, State>>,

    #[account(
        seeds = [
            &state.key().to_bytes(),
            State::RESERVE_SEED
        ],
        bump,
    )]
    pub reserve_pda: SystemAccount<'info>,

    /// CHECK: Manual account data management (fixed item size list)
    #[account(
        zero,
        owner = ID,
    )]
    pub stake_list: UncheckedAccount<'info>,

    /// CHECK: Manual account data management (fixed item size list)
    #[account(
        zero,
        owner = ID,
    )]
    pub validator_list: UncheckedAccount<'info>,

    pub ssol_mint: Box<Account<'info, Mint>>,

    pub operational_sol_account: SystemAccount<'info>,

    pub lp_mint: Box<Account<'info, Mint>>,
    
    pub sol_leg_pda: SystemAccount<'info>,
    
    pub ssol_leg: Box<Account<'info, TokenAccount>>,

    #[account(token::mint = ssol_mint)]
    pub treasury_ssol_account: Box<Account<'info, TokenAccount>>,

    pub clock: Sysvar<'info, Clock>,
    
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, AnchorSerialize, AnchorDeserialize)]
pub struct InitializeData {
    pub admin_authority: Pubkey,
    pub validator_manager_authority: Pubkey,
    pub min_stake: u64,
    pub rewards_fee: Fee,

    pub liq_pool: LiqPoolInitializeData,
    pub additional_stake_record_space: u32,
    pub additional_validator_record_space: u32,
    pub slots_for_stake_delta: u64,
    pub pause_authority: Pubkey,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, AnchorSerialize, AnchorDeserialize)]
pub struct LiqPoolInitializeData {
    pub lp_liquidity_target: u64,
    pub lp_max_fee: Fee,
    pub lp_min_fee: Fee,
    pub lp_treasury_cut: Fee,
}

impl<'info> Initialize<'info> {
    pub fn state(&self) -> &State {
        &self.state
    }

    pub fn state_address(&self) -> &Pubkey {
        self.state.to_account_info().key
    }

    fn check_reserve_pda(&mut self, required_lamports: u64) -> Result<()> {
        require_eq!(self.reserve_pda.lamports(), required_lamports);
        Ok(())
    }

    fn check_ssol_mint(&mut self) -> Result<u8> {
        let (authority_address, authority_bump_seed) =
            State::find_ssol_mint_authority(self.state_address());

        check_mint_authority(&self.ssol_mint, &authority_address, "ssol_mint")?;
        check_mint_empty(&self.ssol_mint, "ssol_mint")?;
        check_freeze_authority(&self.ssol_mint, "ssol_mint")?;
        Ok(authority_bump_seed)
    }

    pub fn process(
        &mut self,
        InitializeData {
            admin_authority,
            validator_manager_authority,
            min_stake,
            rewards_fee,
            liq_pool,
            additional_stake_record_space,
            additional_validator_record_space,
            slots_for_stake_delta,
            pause_authority,
        }: InitializeData,
        reserve_pda_bump: u8,
    ) -> Result<()> {
        require_lte!(
            rewards_fee,
            State::MAX_REWARD_FEE,
            SolisticError::RewardsFeeIsTooHigh
        );
        require_keys_neq!(self.state.key(), self.stake_list.key());
        require_keys_neq!(self.state.key(), self.validator_list.key());
        require_keys_neq!(self.stake_list.key(), self.validator_list.key());
        require_gte!(
            slots_for_stake_delta,
            StakeSystem::MIN_UPDATE_WINDOW,
            SolisticError::UpdateWindowIsTooLow
        );
        let rent_exempt_for_token_acc = self.rent.minimum_balance(spl_token::state::Account::LEN);
        require_gte!(
            min_stake,
            State::MIN_STAKE_LOWER_LIMIT,
            SolisticError::MinStakeIsTooLow
        );
        self.check_reserve_pda(rent_exempt_for_token_acc)?;
        let ssol_mint_authority_bump_seed = self.check_ssol_mint()?;
        let initialized_liq_pool = self.initialize_liq_pool(liq_pool, rent_exempt_for_token_acc)?;
        self.state.set_inner(State {
            ssol_mint: *self.ssol_mint.to_account_info().key,
            admin_authority,
            operational_sol_account: *self.operational_sol_account.key,
            treasury_ssol_account: *self.treasury_ssol_account.to_account_info().key,
            reserve_bump_seed: reserve_pda_bump,
            ssol_mint_authority_bump_seed,
            rent_exempt_for_token_acc,
            reward_fee: rewards_fee,
            stake_system: StakeSystem::new(
                self.state_address(),
                *self.stake_list.key,
                &mut self.stake_list.data.as_ref().borrow_mut(),
                slots_for_stake_delta,
                min_stake,
                0,
                additional_stake_record_space,
            )?,
            validator_system: ValidatorSystem::new(
                *self.validator_list.key,
                &mut self.validator_list.data.as_ref().borrow_mut(),
                validator_manager_authority,
                additional_validator_record_space,
            )?,
            liq_pool: initialized_liq_pool,
            available_reserve_balance: 0,
            ssol_supply: 0,
            ssol_price: State::PRICE_DENOMINATOR,
            circulating_ticket_count: 0,
            circulating_ticket_balance: 0,
            lent_from_reserve: 0,
            min_deposit: 1,                 // 1 lamport
            min_withdraw: 1,                // 1 lamport
            staking_sol_cap: std::u64::MAX, // Unlimited
            emergency_cooling_down: 0,
            pause_authority,
            paused: false,
            delayed_unstake_fee: FeeCents::from_bp_cents(0),
            withdraw_stake_account_fee: FeeCents::from_bp_cents(0),
            withdraw_stake_account_enabled: false,
            last_stake_move_epoch: 0,
            stake_moved: 0,
            max_stake_moved_per_epoch: Fee::from_basis_points(10000), // 100% of total_lamports_under_control
        });

        emit!(InitializeEvent {
            state: self.state.key(),
            params: InitializeData {
                admin_authority,
                validator_manager_authority,
                min_stake,
                rewards_fee,
                liq_pool,
                additional_stake_record_space,
                additional_validator_record_space,
                slots_for_stake_delta,
                pause_authority
            },
            stake_list: self.stake_list.key(),
            validator_list: self.validator_list.key(),
            ssol_mint: self.ssol_mint.key(),
            operational_sol_account: self.operational_sol_account.key(),
            lp_mint: self.lp_mint.key(),
            lp_ssol_leg: self.ssol_leg.key(),
            treasury_ssol_account: self.treasury_ssol_account.key(),
        });

        Ok(())
    }
    
    pub fn check_lp_mint(&self) -> Result<u8> {
        require_keys_neq!(self.lp_mint.key(), self.ssol_mint.key(),);
        let (authority_address, authority_bump_seed) =
            LiqPool::find_lp_mint_authority(self.state_address());

        check_mint_authority(&self.lp_mint, &authority_address, "lp_mint")?;
        check_mint_empty(&self.lp_mint, "lp_mint")?;
        check_freeze_authority(&self.lp_mint, "lp_mint")?;

        Ok(authority_bump_seed)
    }

    pub fn check_sol_leg(&self, required_lamports: u64) -> Result<u8> {
        let (address, bump) = LiqPool::find_sol_leg_address(self.state_address());
        require_keys_eq!(self.sol_leg_pda.key(), address);
        require_eq!(self.sol_leg_pda.lamports(), required_lamports);
        Ok(bump)
    }

    pub fn check_ssol_leg(&self) -> Result<u8> {
        check_token_mint(
            &self.ssol_leg,
            &self.ssol_mint.key(),
            "liq_ssol",
        )?;
        let (ssol_authority, ssol_authority_bump_seed) =
            LiqPool::find_ssol_leg_authority(self.state_address());
        check_token_owner(&self.ssol_leg, &ssol_authority, "liq_ssol_leg")?;
        Ok(ssol_authority_bump_seed)
    }

    pub fn initialize_liq_pool(
        &self,
        LiqPoolInitializeData {
            lp_liquidity_target,
            lp_max_fee,
            lp_min_fee,
            lp_treasury_cut,
        }: LiqPoolInitializeData,
        required_sol_leg_lamports: u64,
    ) -> Result<LiqPool> {
        let lp_mint_authority_bump_seed = self.check_lp_mint()?;
        let sol_leg_bump_seed = self.check_sol_leg(required_sol_leg_lamports)?;
        let ssol_leg_authority_bump_seed = self.check_ssol_leg()?;
        let liq_pool = LiqPool {
            lp_mint: *self.lp_mint.to_account_info().key,
            lp_mint_authority_bump_seed,
            sol_leg_bump_seed,
            ssol_leg_authority_bump_seed,
            ssol_leg: *self.ssol_leg.to_account_info().key,
            lp_liquidity_target,
            lp_max_fee,
            lp_min_fee,
            treasury_cut: lp_treasury_cut,
            lp_supply: 0,
            lent_from_sol_leg: 0,
            liquidity_sol_cap: std::u64::MAX,
        };

        liq_pool.validate()?;

        Ok(liq_pool)
    }
}
