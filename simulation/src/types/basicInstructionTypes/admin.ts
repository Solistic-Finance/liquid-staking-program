import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export interface InitializeDataParam {
    adminAuthority: PublicKey,
    validatorManagerAuthority: PublicKey,
    minStake: BN, // Example value
    rewardsFee: {
        numerator: number,
        denominator: number
    },
    liqPool: {
        lpLiquidityTarget: BN,
        lpMaxFee: {
            basisPoints: BN
        },
        lpMinFee: {
            basisPoints: BN
        },
        lpTreasuryCut: {
            basisPoints: BN
        },
    },
    additionalStakeRecordSpace: number,
    additionalValidatorRecordSpace: number,
    slotsForStakeDelta: BN,
    pauseAuthority: PublicKey,
};

export interface AddValidatorParam {
    score: number,
    voteAccount: PublicKey,
}

export interface ConfigSolisticParam {
    rewardsFee: { basisPoints: number },
    slotsForStakeDelta: BN,
    minStake: BN,
    minDeposit: BN,
    minWithdraw: BN,
    stakingSolCap: BN,
    liquiditySolCap: BN,
    withdrawStakeAccountEnabled: boolean,
    delayedUnstakeFee: { bpCents: number },
    withdrawStakeAccountFee: { bpCents: number },
    maxStakeMovedPerEpoch: { basisPoints: number },
}

export interface ConfigLpParam {
    liquidityTarget: BN,
    minFee: { basisPoints: number },  // Correct usage for Fee type
    maxFee: { basisPoints: number },
    treasuryCut: { basisPoints: number },
}

export interface ConfigValidatorSystem {
    extra_runs: number
}

export interface ChangeAuthorityData {
    admin: PublicKey,
    validatorManager: PublicKey,
    operationalSolAccount: PublicKey,
    treasurySsolAccount: PublicKey,
    pauseAuthority: PublicKey,
}

export interface RemoveValidatorParam {
    voteAccount: PublicKey,
}

export interface SetValidatorScore {
    index: number,
    validatorVote: PublicKey,
    score: number
}


export interface UpdateSsolTokenMetadata {
    stateAccount: Keypair,
    ssolMint: PublicKey,
    name: string,
    symbol: string,
    uri: string,
}

export interface UpdateLpMintTokenMetadata {
    stateAccount: Keypair,
    lpMint: PublicKey,
    name: string,
    symbol: string,
    uri: string,
}


