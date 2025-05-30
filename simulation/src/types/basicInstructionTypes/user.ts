import { Keypair, PublicKey } from "@solana/web3.js"
import BN from "bn.js"

export interface DepositParam {
    amount: BN,
}

export interface DepositExistingStakeParam {
    validatorIndex: number,
}

export interface DepositNewStakeParam {
    validatorIndex: number,
    amount: number,
}

export interface OrderUnstakeParam {
    ssolAmount: BN,
    newTicketAccount: Keypair,
}

export interface ClaimParam {
    newTicketAccount: PublicKey,
}

export interface WithdrawStakeAccountParam {
    stakeIndex: number,
    validatorIndex: number,
    ssolAmount: BN,
    beneficiary: PublicKey,
    splitStakeAccount: Keypair,
}

export interface LiquidUnstakeParam {
    ssol_amount: BN
}

export interface AddLiquidityParam {
    lamports: BN
}

export interface RemoveLiquidityParam {
    tokens: BN
}
