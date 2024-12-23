import { PublicKey } from "@solana/web3.js";
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