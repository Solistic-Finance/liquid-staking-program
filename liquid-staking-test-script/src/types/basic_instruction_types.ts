import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

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


interface InitializeAccount {
    stateAccount: Keypair,
    msolMint: PublicKey,
    stakeList: Keypair,
    validatorList: Keypair,
    operationalSolAccount: Keypair,
    treasuryMsolAccount: PublicKey,
    lpMint: PublicKey,
    mSolLeg: PublicKey,
}


export {
    InitializeDataParam,
    InitializeAccount
}