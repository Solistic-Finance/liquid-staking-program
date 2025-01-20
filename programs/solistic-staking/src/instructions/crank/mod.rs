pub mod deactivate_stake;
pub mod merge_stakes;
pub mod redelegate;
pub mod stake_reserve;
pub mod update_active;  
pub mod update_deactivated;

pub use deactivate_stake::*;
pub use merge_stakes::*;
pub use redelegate::*;
pub use stake_reserve::*;
pub use update_active::*;
pub use update_deactivated::*;

use crate::state::stake_system::StakeRecord;


pub struct BeginOutput {
    stake: StakeRecord,
    is_treasury_ssol_ready_for_transfer: bool,
}
