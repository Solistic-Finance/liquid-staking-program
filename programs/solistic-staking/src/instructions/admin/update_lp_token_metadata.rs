use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use anchor_spl::metadata::Metadata;
use crate::state::liq_pool::LiqPool;
use crate::State;

use super::initialize_metadata_account;

#[derive(Accounts)]
pub struct UpdateLpMintTokenMetadata<'info> {
    #[account(mut)]    
    pub payer: Signer<'info>,
    pub state: Box<Account<'info, State>>,
    #[account( address = state.liq_pool.lp_mint )]
    pub lp_mint: Account<'info, Mint>,
    /// CHECK: PDA
    #[account(
        seeds = [
            &state.key().to_bytes(),
            LiqPool::LP_MINT_AUTHORITY_SEED
        ],
        bump = state.liq_pool.lp_mint_authority_bump_seed
    )]
    pub lp_mint_authority: UncheckedAccount<'info>,
    /// CHECK: metadata acccount for ssol mint
    #[account(mut)]
    pub lp_mint_metadata_account: UncheckedAccount<'info>,
    /// Sysvar for token mint and ATA creation
    pub rent: Sysvar<'info, Rent>,
    /// Program to create the position manager state account
    pub system_program: Program<'info, System>,
    /// Program to create NFT metadata
    /// CHECK: Metadata program address constraint applied
    pub metadata_program: Program<'info, Metadata>,
}

impl<'info> UpdateLpMintTokenMetadata<'info>{
    pub fn process(&mut self, name: String, symbol: String, uri: String) -> Result<()> {
        let seeds = [
            &self.state.key().to_bytes(),
            LiqPool::LP_MINT_AUTHORITY_SEED,
            &[self.state.liq_pool.lp_mint_authority_bump_seed],
        ];
        initialize_metadata_account(
            &self.payer,
            &self.lp_mint_authority.to_account_info(),
            &self.lp_mint.to_account_info(),
            &self.lp_mint_metadata_account,
            &self.metadata_program,
            &self.system_program,
            &self.rent,
            name,
            symbol,
            uri,
            &[&seeds]
        )?;
        Ok(())
    }
}
