import { Keypair, PublicKey } from "@solana/web3.js";

export interface StakeReserveParam {
    validatorIndex: number,
    validatorVote: PublicKey
}


export interface UpdateActiveParam {
    stakeIndex: number,
    validatorIndex: number
}

export interface UpdateDeactivatedParam {
    stakeIndex: number,
}

export interface DeactivateStakeParam {
    stakeIndex: number,
    validatorIndex: number,
    splitStakeAccount: Keypair
}

export interface MergeStakeParam {
    destinationStakeIndex: number,
    sourceStakeIndex: number,
    validatorIndex: number,
    splitStakeAccount: Keypair
}

export interface RedelegateParam {
    stakeIndex: number,
    sourceValidatorIndex: number,
    destValidatorIndex: number,
    validatorVote: PublicKey
    splitStakeAccount: Keypair,
    newRedelegateStakeAccount: Keypair,
}