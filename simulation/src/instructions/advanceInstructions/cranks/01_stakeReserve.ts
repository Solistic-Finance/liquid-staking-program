
import { 
    Connection, 
    Keypair, 
    sendAndConfirmTransaction, 
    STAKE_CONFIG_ID, 
    StakeProgram, 
    SYSVAR_EPOCH_SCHEDULE_PUBKEY, 
    SYSVAR_STAKE_HISTORY_PUBKEY 
} from "@solana/web3.js";
import { program } from "../../../config";
import { StakeReserveParam } from "../../../types/advancedInstructionTypes";
import { 
    stateAccount, 
    validatorsList,
    stakeList,
    reservePda,
    stakeDepositAuthority,
} from "../../../config";

export const stakeReserve = async (connection: Connection, cranker: Keypair, stakeAccount: Keypair, stakeReserveParam: StakeReserveParam) => {
    const {
        validatorIndex,
        validatorVote
    } = stakeReserveParam
    
    const tx = await program.methods.stakeReserve(validatorIndex)
        .accounts({
            state: stateAccount,
            validatorList: validatorsList,
            stakeList: stakeList,
            validatorVote: validatorVote,
            reservePda: reservePda,
            stakeAccount: stakeAccount.publicKey,
            stakeDepositAuthority: stakeDepositAuthority,
            rentPayer: cranker.publicKey,
            epochSchedule: SYSVAR_EPOCH_SCHEDULE_PUBKEY,
            stakeHistory: SYSVAR_STAKE_HISTORY_PUBKEY,
            stakeConfig: STAKE_CONFIG_ID,
            stakeProgram: StakeProgram.programId
        })
        .signers([cranker])
        .transaction()

    // Set fee payer and recent blockhash
    tx.feePayer = cranker.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    try {
        // Simulate the transaction to catch errors
        const simulationResult = await connection.simulateTransaction(tx);
        console.log("stakeReserve: Simulation Result:", simulationResult);
        // Send the transaction
        const sig = await sendAndConfirmTransaction(connection, tx, [cranker, stakeAccount]);
        console.log("stakeReserve: Transaction Signature:", sig);
        const state = await program.account.state.fetch(stateAccount);
        console.log("State Account after cranking stakeReserve:", state);
    } catch (error) {
        console.log("Error in executing stakeReserve ix:", error);
        const state = await program.account.state.fetch(stateAccount);
        console.log("State Account after cranking stakeReserve:", state);
    }

}

//? Define the parameters for initializing the state
// const initializeData : InitializeDataParam = {
//     adminAuthority: authorityAcc.publicKey,
//     validatorManagerAuthority: cranker.publicKey,
//     minStake: new BN(10000000), // Example value
//     rewardsFee: { numerator: 1, denominator: 100 }, // 1%
//     liqPool: {
//         lpLiquidityTarget: new BN(50000000000),
//         lpMaxFee: { basisPoints: new BN(1) },
//         lpMinFee: { basisPoints: new BN(1) },
//         lpTreasuryCut: { basisPoints: new BN(1) },
//     },
//     additionalStakeRecordSpace: 3,
//     additionalValidatorRecordSpace: 3,
//     slotsForStakeDelta: new BN(3000),
//     pauseAuthority: cranker.publicKey,
// };