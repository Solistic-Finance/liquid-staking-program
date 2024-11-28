import { BN } from "bn.js";
import { connection, payer } from "../config";
import { config_lp, initialize, preRequisite } from "../instructions";
import { InitializeDataParam } from "../types";

export const _config_lp = async () => {
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

    const configLpParam = {
        minFee: { basisPoints: 2 },  // Correct usage for Fee type
        maxFee: { basisPoints: 20 },
        liquidityTarget: new BN(70000000000),
        treasuryCut: { basisPoints: 30 },
    };
    await config_lp(connection, payer, configLpParam, initParam)
}