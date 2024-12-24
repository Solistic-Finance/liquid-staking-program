import { Keypair, PublicKey } from "@solana/web3.js";
import {
    InitializeDataParam,
    ChangeAuthorityData,
    AddValidatorParam,
    RemoveValidatorParam,
    SetValidatorScore,
    ConfigValidatorSystem,
    DepositParam,
    DepositStakeParam,
    LiquidUnstakeParam,
    AddLiquidityParam,
    RemoveLiquidityParam,
    ConfigLpParam,
    ConfigSolisticParam,
} from "./basic_instruction_types"

import {
    OrderUnstakeParam,
    ClaimParam,
    StakeReserveParam,
    UpdateActiveParam,
    UpdateDeactivatedParam,
    DeactivateStakeParam,
    EmergencyUnstakeParam,
    PartialUnstakeParam,
    MergeStakeParam,
    RedelegateParam,
    WithdrawStakeAccountParam,
    ReallocStakeListParam,
    ReallocValidatorListParam,
} from "./advanced_instruction_types"
import BN from "bn.js";

interface InitParam {
    stateAccount: Keypair,
    stakeList: Keypair,
    validatorList: Keypair,
    operationalSolAccount: Keypair,
    stakeAccount: Keypair,
    authoritySsolAcc: PublicKey,
    authorityLpAcc: PublicKey,
    reservePda: PublicKey,
    solLegPda: PublicKey,
    authoritySSolLegAcc: PublicKey,
    stakeDepositAuthority: PublicKey,
    stakeWithdrawAuthority: PublicKey,
    ssolMint: PublicKey,
    lpMint: PublicKey,
    treasurySsolAccount: PublicKey,
    sSolLeg: PublicKey,
    mint_to: PublicKey,
    mint_to_lp: PublicKey,
    burnSsolFrom: PublicKey,
}

interface ParsedStakeAccountInfo {
    address: PublicKey
    ownerAddress: PublicKey
    authorizedStakerAddress: PublicKey | null
    authorizedWithdrawerAddress: PublicKey | null
    voterAddress: PublicKey | null
    activationEpoch: BN | null
    deactivationEpoch: BN | null
    isCoolingDown: boolean
    isLockedUp: boolean
    balanceLamports: BN | null
    stakedLamports: BN | null
}

export {
    InitParam,
    InitializeDataParam,
    ChangeAuthorityData,
    AddValidatorParam,
    RemoveValidatorParam,
    SetValidatorScore,
    ConfigValidatorSystem,
    DepositParam,
    DepositStakeParam,
    LiquidUnstakeParam,
    AddLiquidityParam,
    RemoveLiquidityParam,
    ConfigLpParam,
    ConfigSolisticParam,
    OrderUnstakeParam,
    ClaimParam,
    StakeReserveParam,
    UpdateActiveParam,
    UpdateDeactivatedParam,
    DeactivateStakeParam,
    ParsedStakeAccountInfo,
    EmergencyUnstakeParam,
    PartialUnstakeParam,
    MergeStakeParam,
    RedelegateParam,
    WithdrawStakeAccountParam,
    ReallocStakeListParam,
    ReallocValidatorListParam,
}