
import { 
    Connection, 
    PublicKey, 
    sendAndConfirmTransaction, 
    Signer, 
    StakeProgram, 
    SYSVAR_STAKE_HISTORY_PUBKEY 
} from "@solana/web3.js";
import { program } from "../../../config";
import { UpdateActiveParam } from "../../../types";
import { 
    stakeWithdrawAuthority, 
    reservePda, 
    stakeList, 
    stateAccount,
    authoritySsolAcc,
    treasurySsolAccount,
    validatorsList,
    ssolMint,
} from "../../prerequisite";

export const updateActive = async (connection: Connection, cranker: Signer, stakeAccount: PublicKey, updateActiveParam: UpdateActiveParam) => {
    const {
        stakeIndex,
        validatorIndex
    } = updateActiveParam

    const tx = await program.methods.updateActive(stakeIndex, validatorIndex)
        .accounts({
            common: {
                state: stateAccount.publicKey,
                stakeList: stakeList.publicKey,
                stakeAccount: stakeAccount,
                stakeWithdrawAuthority: stakeWithdrawAuthority,
                reservePda: reservePda,
                msolMint: ssolMint,
                msolMintAuthority: authoritySsolAcc,
                treasuryMsolAccount: treasurySsolAccount,
                stakeHistory: SYSVAR_STAKE_HISTORY_PUBKEY,
                stakeProgram: StakeProgram.programId
            },
            validatorList: validatorsList.publicKey,
        })
        .signers([cranker])
        .transaction()
    // Set fee payer and recent blockhash
    tx.feePayer = cranker.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    try {
        // Simulate the transaction to catch errors
        const simulationResult = await connection.simulateTransaction(tx);
        console.log("updateActive: Simulation Result:", simulationResult);
        // Send the transaction
        const sig = await sendAndConfirmTransaction(connection, tx, [cranker]);
        console.log("updateActive: Transaction Signature:", sig);
        const state = await program.account.state.fetch(stateAccount.publicKey);
        console.log("State Account after cranking updateActive:", state);
    } catch (error) {
        console.log("Error in executing updateActive ix:", error);
        const state = await program.account.state.fetch(stateAccount.publicKey);
        console.log("State Account after cranking updateActive:", state);
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