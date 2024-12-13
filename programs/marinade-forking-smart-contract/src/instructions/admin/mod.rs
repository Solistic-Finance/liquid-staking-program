pub mod change_authority;
pub mod config_lp;
pub mod config_marinade;
pub mod config_validator_system;
pub mod emergency_pause;
pub mod initialize;
pub mod realloc_stake_list;
pub mod realloc_validator_list;
pub mod update_lp_token_metadata;
pub mod update_msol_token_metadata;

pub use change_authority::*;
pub use config_lp::*;
pub use config_marinade::*;
pub use config_validator_system::*;
pub use emergency_pause::*;
pub use initialize::*;
pub use realloc_stake_list::*;
pub use realloc_validator_list::*;
pub use update_lp_token_metadata::*;
pub use update_msol_token_metadata::*;

use anchor_lang::prelude::*;
use anchor_spl::metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3, Metadata};
use mpl_token_metadata::types::{Creator, DataV2};
pub fn initialize_metadata_account<'info>(
    payer: &Signer<'info>,
    authority: &AccountInfo<'info>,
    mint: &AccountInfo<'info>,
    metadata_account: &UncheckedAccount<'info>,
    metadata_program: &Program<'info, Metadata>,
    system_program: &Program<'info, System>,
    rent: &Sysvar<'info, Rent>,
    name: String,
    symbol: String,
    uri: String,
    signers_seeds: &[&[&[u8]]],
) -> Result<()> {
    let accounts = CreateMetadataAccountsV3{
        metadata: metadata_account.to_account_info(),
        mint: mint.clone(),
        mint_authority: authority.clone(),
        payer: payer.to_account_info(),
        update_authority: authority.clone(),
        system_program: system_program.to_account_info(),
        rent: rent.to_account_info(),
    };
    let ctx = CpiContext::new_with_signer(
        metadata_program.to_account_info(),
        accounts,
        signers_seeds,
    );
    let data: DataV2 = DataV2 {
        name,
        symbol,
        uri,
        seller_fee_basis_points: 0,
        creators: Some(vec![Creator {address:authority.key(), verified: true, share: 100 }]),
        collection: None,
        uses: None,
    };
    create_metadata_accounts_v3(
        ctx,
        data,
        true,
        true,
        None,
    )?;

    Ok(())
}

