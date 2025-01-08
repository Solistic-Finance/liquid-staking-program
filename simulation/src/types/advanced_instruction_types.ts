import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

interface EmergencyUnstakeParam {
    stake_index: number,
    validator_index: number,
}

interface PartialUnstakeParam {
    stake_index: number,
    validator_index: number,
    desired_unstake_amount: BN,
    splitStakeAccount: Keypair
}

interface ReallocStakeListParam {
    capacity: number,
}

interface ReallocValidatorListParam {
    capacity: number,
}

export {
    EmergencyUnstakeParam,
    PartialUnstakeParam,
    ReallocStakeListParam,
    ReallocValidatorListParam,
}