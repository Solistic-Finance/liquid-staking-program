import { 
    // connectionDevnet as connection,
    connection, 
    admin, 
} from "./config";
import { BN } from "@coral-xyz/anchor";
import { ConfigSolisticParam } from "./types";
import { configSolistic } from "./instructions/baseInstructions/admin/06_configSolistic";

const configSolisticParams = async () => {
    const configSolisticParam : ConfigSolisticParam = {
        rewardsFee: { basisPoints: 0 },
        slotsForStakeDelta: new BN (400000),  //18_000 for marinade
        minStake: new BN (10000000), //1_000_000_000 for marinade
        //extra stake delta runs 150 for marinade
        //extra stake delta runs 0 for solistic
        minDeposit: new BN (1),
        minWithdraw: new BN (1),
        stakingSolCap: new BN("18446744073709551615"),
        liquiditySolCap: new BN("18446744073709551615"),
        // lpLiquidityTarget 50_000_000_000 for solistic
        // lpLiquidityTarget 21_000_000_000_000 for marinade
        // lpMaxFee 900 for marinade
        // lpMinFee 1 for marinade
        // treasuryCut 5000 for marinade
        // lpMaxFee 10 for solistic
        // lpMinFee 1 for solistic
        // treasuryCut 1 for solistic
        withdrawStakeAccountEnabled: false,
        // withdrawStakeAccountEnabled true for marinade
        delayedUnstakeFee: { bpCents: 0 },
        withdrawStakeAccountFee: { bpCents: 0 },
        // withdrawStakeAccountFee 1500 for marinade
        maxStakeMovedPerEpoch: { basisPoints: 10000 },
    };

    await configSolistic(connection, admin, configSolisticParam)
}

configSolisticParams().then(() => {
    console.log("Config Solistic completed")
}).catch((err) => {
    console.log("Error in configSolistic : ", err)
})