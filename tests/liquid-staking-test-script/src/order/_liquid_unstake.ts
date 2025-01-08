import { BN } from "bn.js";
import { connection, payer } from "../config";
import { add_liquidity, deposit, initialize, liquid_unstake, preRequisite } from "../instructions";
import { InitializeDataParam } from "../types";

export const _liquid_unstake = async () => {
    const initParam = await preRequisite(connection, payer)

    const initializeData: InitializeDataParam = {
        adminAuthority: payer.publicKey,
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

    await initialize(connection, payer, initializeData, initParam)

    const addLiquidityParam = {
        lamports: new BN(10000)
    }
    await add_liquidity(connection, payer, addLiquidityParam, initParam)

    const depositParam = {
        amount: new BN(10000)
    }
    await deposit(connection, payer, depositParam, initParam)

    const liquidUnstakeParam = {
        ssol_amount: new BN(10000)
    }
    await liquid_unstake(connection, payer, liquidUnstakeParam, initParam)
}