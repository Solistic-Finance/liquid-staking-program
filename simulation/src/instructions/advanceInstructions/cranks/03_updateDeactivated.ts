
import { 
    Connection, 
    PublicKey, 
    sendAndConfirmTransaction, 
    Signer, 
    StakeProgram, 
    SYSVAR_STAKE_HISTORY_PUBKEY 
} from "@solana/web3.js";
import { program } from "../../../config";
import { UpdateDeactivatedParam } from "../../../types";
import { 
    authoritySsolAcc, 
    operationalSolAccount, 
    reservePda, 
    ssolMint, 
    stakeList, 
    stakeWithdrawAuthority, 
    stateAccount, 
    treasurySsolAccount 
} from "../../prerequisite";

export const updateDeactivated = async (connection: Connection, cranker: Signer, stakeAccount: PublicKey, updateDeactivatedParam: UpdateDeactivatedParam) => {
    const {
        stakeIndex,
    } = updateDeactivatedParam

    const tx = await program.methods.updateDeactivated(stakeIndex)
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
            operationalSolAccount: operationalSolAccount.publicKey,
        })
        .signers([cranker])
        .transaction()
    // Set fee payer and recent blockhash
    tx.feePayer = cranker.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    try {
        // Simulate the transaction to catch errors
        const simulationResult = await connection.simulateTransaction(tx);
        console.log("updateDeactivated: Simulation Result:", simulationResult);
        // Send the transaction
        const sig = await sendAndConfirmTransaction(connection, tx, [cranker]);
        console.log("updateDeactivated: Transaction Signature:", sig);
        const state = await program.account.state.fetch(stateAccount.publicKey);
        console.log("State Account after cranking updateDeactivated:", state);
    } catch (error) {
        console.log("Error in executing updateDeactivated ix:", error);
        const state = await program.account.state.fetch(stateAccount.publicKey);
        console.log("State Account after cranking updateDeactivated:", state);
    }
}