import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

import {
    InitializeDataParam,
    AddValidatorParam,
    DepositParam,
    DepositNewStakeParam,
    DepositExistingStakeParam,
    OrderUnstakeParam,
    ClaimParam,
    WithdrawStakeAccountParam,
} from "./basicInstructionTypes"

import {
    StakeReserveParam,
    UpdateActiveParam,
    UpdateDeactivatedParam,
    DeactivateStakeParam,
    MergeStakeParam,
    RedelegateParam,
} from "./advancedInstructionTypes"

import {
    ChangeAuthorityData,
    RemoveValidatorParam,
    SetValidatorScore,
    ConfigValidatorSystem,
    LiquidUnstakeParam,
    AddLiquidityParam,
    RemoveLiquidityParam,
    ConfigLpParam,
    ConfigMarinadeParam,
} from "./basic_instruction_types"

import {
    EmergencyUnstakeParam,
    PartialUnstakeParam,
    ReallocStakeListParam,
    ReallocValidatorListParam,
} from "./advanced_instruction_types"

interface SSolInitParam {
    stateAccount: PublicKey,
    stakeList: PublicKey,
    validatorList: PublicKey,
    operationalSolAccount: PublicKey,
    stakeAccount: PublicKey ,
    authoritySSolAcc: PublicKey,
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
    payerSSolTokenAccount: PublicKey,
    payerLpTokenAccount: PublicKey,
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
    SSolInitParam,
    InitializeDataParam,
    ChangeAuthorityData,
    AddValidatorParam,
    RemoveValidatorParam,
    DepositParam,
    DepositNewStakeParam,
    DepositExistingStakeParam,
    SetValidatorScore,
    ConfigValidatorSystem,
    LiquidUnstakeParam,
    AddLiquidityParam,
    RemoveLiquidityParam,
    ConfigLpParam,
    ConfigMarinadeParam,
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