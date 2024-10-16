use anchor_lang::{
  context::CpiContext,
  solana_program::{
      account_info::AccountInfo,
      pubkey::Pubkey,
      stake::{
          self,
          program::ID,
          state::{StakeAuthorize, StakeStateV2},
      },
  },
  Accounts, Result,
};
use borsh::BorshDeserialize;
use std::ops::Deref;

#[derive(Clone)]
pub struct StakeAccountV2(StakeStateV2);

impl anchor_lang::AccountDeserialize for StakeAccountV2 {
  fn try_deserialize(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
      Self::try_deserialize_unchecked(buf)
  }

  fn try_deserialize_unchecked(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
      StakeStateV2::deserialize(buf).map(Self).map_err(Into::into)
  }
}

impl anchor_lang::AccountSerialize for StakeAccountV2 {}

impl anchor_lang::Owner for StakeAccountV2 {
  fn owner() -> Pubkey {
      ID
  }
}

impl Deref for StakeAccountV2 {
  type Target = StakeStateV2;

  fn deref(&self) -> &Self::Target {
      &self.0
  }
}