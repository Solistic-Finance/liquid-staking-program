import { BN } from "bn.js";
import { connection, payer } from "../config";
import { config_solistic, initialize, preRequisite } from "../instructions";
import { ConfigSolisticParam, InitializeDataParam } from "../types";

export const _config_solistic = async () => {
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

    const configSolisticParam : ConfigSolisticParam = {
        rewardsFee: { basisPoints: 1 },
        slotsForStakeDelta: new BN (3000),  //  minimun
        minStake: new BN (10000000),            //  minimum
        minDeposit: new BN (4),
        minWithdraw: new BN (5),
        stakingSolCap: new BN (6),
        liquiditySolCap: new BN (7),
        withdrawStakeAccountEnabled: true,
        delayedUnstakeFee: { bpCents: 8 },
        withdrawStakeAccountFee: { bpCents: 9 },
        maxStakeMovedPerEpoch: { basisPoints: 10 },
    };

    await config_solistic(connection, payer, configSolisticParam, initParam)
}