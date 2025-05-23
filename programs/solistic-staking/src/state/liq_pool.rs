use crate::{calc::proportional, error::SolisticError, require_lte, state::Fee, ID};
use anchor_lang::{prelude::*, solana_program::native_token::LAMPORTS_PER_SOL};
use anchor_spl::token::spl_token;

#[derive(Clone, AnchorSerialize, AnchorDeserialize, Debug)]
pub struct LiqPool {
    pub lp_mint: Pubkey,
    pub lp_mint_authority_bump_seed: u8,
    pub sol_leg_bump_seed: u8,
    pub ssol_leg_authority_bump_seed: u8,
    pub ssol_leg: Pubkey,

    //The next 3 values define the SOL/sSOL Liquidity pool fee curve params
    // We assume this pool is always UNBALANCED, there should be more SOL than sSOL 99% of the time
    ///Liquidity target. If the Liquidity reach this amount, the fee reaches lp_min_discount_fee
    pub lp_liquidity_target: u64, // 10_000 SOL initially
    /// Liquidity pool max fee
    pub lp_max_fee: Fee, //3% initially
    /// SOL/sSOL Liquidity pool min fee
    pub lp_min_fee: Fee, //0.3% initially
    /// Treasury cut
    pub treasury_cut: Fee, //2500 => 25% how much of the Liquid unstake fee goes to treasury_ssol_account

    pub lp_supply: u64, // virtual lp token supply. May be > real supply because of burning tokens. Use UpdateLiqPool to align it with real value
    pub lent_from_sol_leg: u64,
    pub liquidity_sol_cap: u64,
}

impl LiqPool {
    pub const LP_MINT_AUTHORITY_SEED: &'static [u8] = b"liq_mint";
    pub const SOL_LEG_SEED: &'static [u8] = b"liq_sol";
    pub const SSOL_LEG_AUTHORITY_SEED: &'static [u8] = b"liq_st_sol_authority";
    pub const SSOL_LEG_SEED: &'static str = "liq_st_sol";
    pub const MAX_FEE: Fee = Fee::from_basis_points(1000); // 10%
    pub const MIN_LIQUIDITY_TARGET: u64 = 50 * LAMPORTS_PER_SOL; // 50 SOL
    pub const MAX_TREASURY_CUT: Fee = Fee::from_basis_points(7500); // 75%

    pub fn find_lp_mint_authority(state: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[&state.to_bytes()[..32], Self::LP_MINT_AUTHORITY_SEED],
            &ID,
        )
    }

    pub fn find_sol_leg_address(state: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[&state.to_bytes()[..32], Self::SOL_LEG_SEED], &ID)
    }

    pub fn find_ssol_leg_authority(state: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[&state.to_bytes()[..32], Self::SSOL_LEG_AUTHORITY_SEED],
            &ID,
        )
    }

    pub fn default_ssol_leg_address(state: &Pubkey) -> Pubkey {
        Pubkey::create_with_seed(state, Self::SSOL_LEG_SEED, &spl_token::ID).unwrap()
    }

    pub fn delta(&self) -> u32 {
        self.lp_max_fee
            .basis_points
            .saturating_sub(self.lp_min_fee.basis_points)
    }

    ///compute a linear fee based on liquidity amount, it goes from fee(0)=max -> fee(x>=target)=min
    pub fn linear_fee(&self, lamports: u64) -> Fee {
        if lamports >= self.lp_liquidity_target {
            self.lp_min_fee
        } else {
            Fee {
                basis_points: self.lp_max_fee.basis_points
                    - proportional(self.delta() as u64, lamports, self.lp_liquidity_target).unwrap()
                        as u32,
            }
        }
    }

    pub fn on_lp_mint(&mut self, amount: u64) {
        self.lp_supply += amount
    }

    pub fn on_lp_burn(&mut self, amount: u64) {
        self.lp_supply -= amount
    }

    pub fn check_liquidity_cap(
        &self,
        transfering_lamports: u64,
        sol_leg_balance: u64,
    ) -> Result<()> {
        let result_amount = sol_leg_balance + transfering_lamports;
        require_lte!(
            result_amount,
            self.liquidity_sol_cap,
            SolisticError::LiquidityIsCapped
        );
        Ok(())
    }

    pub fn validate(&self) -> Result<()> {
        self.lp_min_fee
            .check()
            .map_err(|e| e.with_source(source!()))?;
        self.lp_max_fee
            .check()
            .map_err(|e| e.with_source(source!()))?;
        self.treasury_cut
            .check()
            .map_err(|e| e.with_source(source!()))?;
        // hard-limit, max liquid unstake-fee of 10%
        require_lte!(
            self.lp_max_fee,
            Self::MAX_FEE,
            SolisticError::LpMaxFeeIsTooHigh
        );
        require_gte!(
            self.lp_max_fee,
            self.lp_min_fee,
            SolisticError::LpFeesAreWrongWayRound
        );
        require_gte!(
            self.lp_liquidity_target,
            Self::MIN_LIQUIDITY_TARGET,
            SolisticError::LiquidityTargetTooLow
        );
        require_lte!(
            self.treasury_cut,
            Self::MAX_TREASURY_CUT,
            SolisticError::TreasuryCutIsTooHigh
        );

        Ok(())
    }
}
