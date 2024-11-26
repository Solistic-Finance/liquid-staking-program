import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { interfaces } from "mocha";

interface InitializeDataParam {
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

interface ChangeAuthorityData {
    admin: PublicKey,
    validatorManager: PublicKey,
    operationalSolAccount: PublicKey,
    treasuryMsolAccount: PublicKey,
    pauseAuthority: PublicKey
}

interface AddValidatorParam {
    score: number,
    voteAccount: PublicKey,
}

export {
    InitializeDataParam,
    ChangeAuthorityData,
    AddValidatorParam
}