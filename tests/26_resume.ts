import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../target/types/solistic_staking";
import {
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import { authorityAcc, connection, lpMint, mint_to, sSolLeg, ssolMint, operationalSolAccount, payer, stakeAccount, stakeAuthority, stakeList, stateAccount, treasurySsolAccount, validatorList, voteAccount } from ".";

describe("solistic-staking", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolisticStaking as Program<SolisticStaking>;

    // * -------------------------------------------------------------------------------------
    // *  Advanced Instructions
    // * -------------------------------------------------------------------------------------
    // * resume : resume from liq pool
    // * 
    // * ================== Required ===================
    // * State state should be "pause"
    // * 
    // * 
    // * ===============================================
    // * Tx Route : initialize / resume
    // * -------------------------------------------------------------------------------------

    it("resume", async () => {
        const tx = await program.methods.resume()
            .accounts({
                state: stateAccount.publicKey,
                pauseAuthority: payer.publicKey,
            })
            .signers([payer])
            .transaction()
        // Set fee payer and recent blockhash
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        // Simulate the transaction to catch errors
        const simulationResult = await connection.simulateTransaction(tx);
        console.log("Simulation Result:", simulationResult);
        // Send the transaction
        const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
        console.log("Transaction Signature:", sig);
    })
});
