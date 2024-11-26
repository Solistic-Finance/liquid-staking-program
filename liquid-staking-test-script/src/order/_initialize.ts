import { BN } from "bn.js";
import { connection, payer } from "../config";
import { initialize, preRequisite } from "../instructions";
import { InitializeDataParam } from "../types";

export const _initialize = async () => {
    const {
        stateAccount,
        stakeList,
        validatorList,
        operationalSolAccount,
        authorityAcc,
        stakeAuthority,
        stakeAccount,
        authorityMsolAcc,
        authorityLpAcc,
        reservePda,
        solLegPda,
        authorityMSolLegAcc,
        stakeDepositAuthority,
        stakeWithdrawAuthority,
        msolMint,
        lpMint,
        treasuryMsolAccount,
        mSolLeg,
        mint_to,
        burnMsolFrom,
    } = await preRequisite(connection, payer)

    const initializeData: InitializeDataParam = {
        adminAuthority: authorityAcc.publicKey,
        validatorManagerAuthority: payer.publicKey,
        minStake: new BN(10000000), // Example value
        rewardsFee: { numerator: 1, denominator: 100 }, // 1%
        liqPool: {
            lpLiquidityTarget: new BN(50000000000),
            lpMaxFee: { basisPoints: new BN(1) },
            lpMinFee: { basisPoints: new BN(1) },
            lpTreasuryCut: { basisPoints: new BN(1) },
        },
        additionalStakeRecordSpace: 3,
        additionalValidatorRecordSpace: 3,
        slotsForStakeDelta: new BN(3000),
        pauseAuthority: payer.publicKey,
    };

    const initializeAccount = {
        stateAccount,
        msolMint,
        stakeList,
        validatorList,
        operationalSolAccount,
        treasuryMsolAccount,
        lpMint,
        mSolLeg
    }

    await initialize(connection, payer, initializeData, initializeAccount)
}