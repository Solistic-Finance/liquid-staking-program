
import { 
    Connection, 
    Keypair, 
    sendAndConfirmTransaction, 
    Signer, 
    StakeProgram, 
    SYSVAR_STAKE_HISTORY_PUBKEY 
} from "@solana/web3.js";
import { MergeStakeParam } from "../../../types";
import { program } from "../../../config";
import { 
    stateAccount,
    stakeList,
    validatorsList,
    stakeDepositAuthority,
    stakeWithdrawAuthority,
    operationalSolAccount,
} from "../../prerequisite";

export const mergeStakes = async (connection: Connection, cranker: Signer, stakeAccount: Keypair, mergeStakeParam: MergeStakeParam) => {
    const {
        destinationStakeIndex,
        sourceStakeIndex,
        validatorIndex,
        splitStakeAccount,
    } = mergeStakeParam

    const tx = await program.methods.mergeStakes(
        destinationStakeIndex,
        sourceStakeIndex,
        validatorIndex
    )
        .accounts({
            state: stateAccount.publicKey,
            stakeList: stakeList.publicKey,
            validatorList: validatorsList.publicKey,
            destinationStake: splitStakeAccount.publicKey,
            sourceStake: stakeAccount.publicKey,
            stakeDepositAuthority: stakeDepositAuthority,
            stakeWithdrawAuthority: stakeWithdrawAuthority,
            operationalSolAccount: operationalSolAccount.publicKey,
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
        console.log("Error in executing mergeStake ix:", error);
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