
import { 
    Connection, 
    PublicKey, 
    sendAndConfirmTransaction, 
    Signer, 
    StakeProgram, 
    SYSVAR_EPOCH_SCHEDULE_PUBKEY, 
    SYSVAR_STAKE_HISTORY_PUBKEY 
} from "@solana/web3.js";
import { program } from "../../../config";
import { DeactivateStakeParam } from "../../../types";
import { 
    stateAccount,
    reservePda,
    stakeList,
    stakeDepositAuthority,
    validatorsList,
} from "../../prerequisite";

export const deactivateStake = async (connection: Connection, cranker: Signer, stakeAccount: PublicKey, deactivateStakeParam: DeactivateStakeParam) => {
    const {
        stakeIndex,
        validatorIndex,
        splitStakeAccount,
    } = deactivateStakeParam

    const tx = await program.methods.deactivateStake(stakeIndex, validatorIndex)
        .accounts({
            state: stateAccount.publicKey,
            reservePda: reservePda,
            validatorList: validatorsList.publicKey,
            stakeList: stakeList.publicKey,
            stakeAccount: stakeAccount,
            stakeDepositAuthority: stakeDepositAuthority,
            splitStakeAccount: splitStakeAccount.publicKey,
            splitStakeRentPayer: cranker.publicKey,
            epochSchedule: SYSVAR_EPOCH_SCHEDULE_PUBKEY,
            stakeHistory: SYSVAR_STAKE_HISTORY_PUBKEY,
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
        console.log("Simulation Result:", simulationResult);

        // Send the transaction
        const sig = await sendAndConfirmTransaction(connection, tx, [cranker]);
        console.log("Transaction Signature:", sig);
    } catch (error) {
        console.log("Error in executing deactivateStake ix:", error);
        const state = await program.account.state.fetch(stateAccount.publicKey);
        console.log("State Account:", state);
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