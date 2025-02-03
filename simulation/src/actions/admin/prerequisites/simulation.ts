import { BN } from "bn.js";
import { initialize } from "../../../instructions/baseInstructions/admin";
import { InitializeDataParam, SSolInitParam } from "../../../types";
import { 
    connectionDevnet as connection,
    // connection, 
    admin, 
    cranker,
} from "../../../config";
import { preRequisiteSetup } from "../../../instructions/prerequisite";

const simulate = async () => {
    let intParam : SSolInitParam = await preRequisiteSetup(connection, admin)
    const initializeData: InitializeDataParam = {
        adminAuthority: admin.publicKey,
        validatorManagerAuthority: admin.publicKey,
        minStake: new BN(10000000), //0.01 SOL
        rewardsFee: { numerator: 1, denominator: 100 }, // 1%
        liqPool: {
            lpLiquidityTarget: new BN(50000000000), // 50SOL
            lpMaxFee: { basisPoints: new BN(10) }, // 0.1%
            lpMinFee: { basisPoints: new BN(1) }, // 0.01%
            lpTreasuryCut: { basisPoints: new BN(1) }, // 0.01% 
        },
        additionalStakeRecordSpace: 10,
        additionalValidatorRecordSpace: 10,
        slotsForStakeDelta: new BN(3000),
        pauseAuthority: admin.publicKey,
    };
    
    await initialize(connection, admin, initializeData, intParam)

    // // deleteValidator from index 0
    // const addValidatorParam1 = {
    //     score: 5,
    //     voteAccount: voteAccount[0]
    // }

    // await  addValidator(connection, admin, addValidatorParam1)

    // const addValidatorParam2 = {
    //     score: 4,
    //     voteAccount: voteAccount[1]
    // }

    // await  addValidator(connection, admin, addValidatorParam2)

    // const depositNewStakeAccountParam: DepositNewStakeParam = {
    //     validatorIndex: 0,
    //     amount: 10_000_000_000
    // }
    // await depositNewStakeAccount(connection, bhargav, bhargavStakeAccount, depositNewStakeAccountParam)

    // const depositNewStakeAccountParam1: DepositNewStakeParam = {
    //     validatorIndex: 1,
    //     amount: 5_000_000_000
    // }
    
    // await depositNewStakeAccount(connection, bhargav, bhargavStakeAccount1, depositNewStakeAccountParam1)

    // const updateActiveParam: UpdateActiveParam = {
    //     stakeIndex: 0,
    //     validatorIndex: 0
    // }
    // await updateActive(connection, cranker, bhargavStakeAccount.publicKey, updateActiveParam)

    // const updateActiveParam2: UpdateActiveParam = {
    //     stakeIndex: 1,
    //     validatorIndex: 1
    // }
    // await updateActive(connection, cranker, bhargavStakeAccount1.publicKey, updateActiveParam2)

    // const withdrawStakeAccountParam: WithdrawStakeAccountParam = {
    //     stakeIndex: 0,
    //     validatorIndex: 1,
    //     ssolAmount: new BN(10 ** 9),
    //     beneficiary: voteAccount[1],
    //     splitStakeAccount: splitStakeAccount,
    // }
    // await withdrawStakeAccount(connection, cranker, bhargavStakeAccount, withdrawStakeAccountParam)

    // const depositParam: DepositParam = {
    //     amount: new BN(10 ** 9),
    // }
    // await deposit(connection, bhargav, depositParam)

    // const orderUnstakeParam: OrderUnstakeParam = {
    //     ssolAmount: new BN(10 ** 9),
    //     newTicketAccount: newTicketAccountKeypair,
    // }
    // await orderUnstake(connection, cranker, orderUnstakeParam)
}

simulate().then(() => {
    console.log("Simulation completed")
}).catch((err) => {
    console.log("Error in simulation : ", err)
})