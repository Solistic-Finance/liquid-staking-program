
import { 
    Connection, 
    Keypair, 
    sendAndConfirmTransaction, 
    Signer, 
    STAKE_CONFIG_ID, 
    StakeProgram, 
    SYSVAR_STAKE_HISTORY_PUBKEY 
} from "@solana/web3.js";
import { program } from "../../../config";
import { RedelegateParam } from "../../../types";
import { 
    stateAccountKeypair, 
    validatorsListKeypair,
    stakeListKeypair,
    stakeDepositAuthority,
    reservePda,
    cranker,
} from "../../../config";

export const redelegate = async (connection: Connection, stakeAccount: Keypair, mergeStakeParam: RedelegateParam) => {
    const {
        stakeIndex,
        sourceValidatorIndex,
        destValidatorIndex,
        validatorVote,
        splitStakeAccount,
        newRedelegateStakeAccount
    } = mergeStakeParam

    const tx = await program.methods.redelegate(
        stakeIndex,
        sourceValidatorIndex,
        destValidatorIndex,
    )
        .accounts({
            state: stateAccountKeypair.publicKey,
            validatorList: validatorsListKeypair.publicKey,
            stakeList: stakeListKeypair.publicKey,
            stakeAccount: stakeAccount.publicKey,
            stakeDepositAuthority: stakeDepositAuthority,
            reservePda: reservePda,
            splitStakeAccount: splitStakeAccount.publicKey,
            splitStakeRentPayer: cranker.publicKey,
            destValidatorAccount: validatorVote,
            redelegateStakeAccount: newRedelegateStakeAccount.publicKey,
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
        console.log("Simulation Result:", simulationResult);
        // Send the transaction
        const sig = await sendAndConfirmTransaction(connection, tx, [
            cranker,
            splitStakeAccount,
            newRedelegateStakeAccount
        ]);
        console.log("redelegate: Transaction Signature:", sig);
        const state = await program.account.state.fetch(stateAccountKeypair.publicKey);
        console.log("State Account after cranking redelegate:", state);
    } catch (error) {
        console.log("Error in executing redelegate ix:", error);
        const state = await program.account.state.fetch(stateAccountKeypair.publicKey);
        console.log("State Account after cranking redelegate:", state);
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