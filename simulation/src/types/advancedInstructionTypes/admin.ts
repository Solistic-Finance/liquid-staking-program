import { Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export interface EmergencyUnstakeParam {
    stake_index: number,
    validator_index: number,
}

export interface PartialUnstakeParam {
    stake_index: number,
    validator_index: number,
    desired_unstake_amount: BN,
    splitStakeAccount: Keypair
}

export interface ReallocStakeListParam {
    capacity: number,
}

export interface ReallocValidatorListParam {
    capacity: number,
}

