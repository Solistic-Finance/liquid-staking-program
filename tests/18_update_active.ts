import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../target/types/solistic_staking";
import {
    sendAndConfirmTransaction,
    StakeProgram,
    SYSVAR_STAKE_HISTORY_PUBKEY,
} from '@solana/web3.js';
import {
    authoritySsolAcc,
    connection,
    ssolMint,
    payer,
    reservePda,
    stakeAccount,
    stakeAuthority,
    stakeList,
    stakeWithdrawAuthority,
    stateAccount,
    treasurySsolAccount,
    validatorList
} from ".";

describe("solistic-staking", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolisticStaking as Program<SolisticStaking>;

    // * -------------------------------------------------------------------------------------
    // *  Advanced Instructions
    // * -------------------------------------------------------------------------------------
    // * update_active : update_active from liq pool
    // * 
    // * ================== Required ===================
    // * State state should be "resume"
    // * 
    // * 
    // * ===============================================
    // * Tx Route : initialize / update_active
    // * -------------------------------------------------------------------------------------

    it("update_active", async () => {

        const updateActive = {
            state: stateAccount.publicKey,
            stakeList: stakeList.publicKey,
            stakeAccount: stakeAccount.publicKey,
            stakeWithdrawAuthority: stakeWithdrawAuthority,
            reservePda: reservePda,
            ssolMint: ssolMint,
            ssolMintAuthority: authoritySsolAcc,
            treasurySsolAccount: treasurySsolAccount,
            stakeHistory: SYSVAR_STAKE_HISTORY_PUBKEY,
            stakeProgram: StakeProgram.programId
        }

        const tx = await program.methods.updateActive(0, 1)
            .accounts({
                common: updateActive,
                validatorList: validatorList.publicKey,
            })
            .signers([stakeAuthority])
            .transaction()
        // Set fee payer and recent blockhash
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        // Simulate the transaction to catch errors
        const simulationResult = await connection.simulateTransaction(tx);
        console.log("Simulation Result:", simulationResult);
        // Send the transaction
        const sig = await sendAndConfirmTransaction(connection, tx, [payer, validatorList]);
        console.log("Transaction Signature:", sig);
    })

});
