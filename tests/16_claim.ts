import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../target/types/solistic_staking";
import {
    Keypair,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
    connection,
    payer,
    reservePda,
    stakeAuthority,
    stateAccount
} from ".";

describe("solistic-staking", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolisticStaking as Program<SolisticStaking>;

    // * -------------------------------------------------------------------------------------
    // *  Advanced Instructions
    // * -------------------------------------------------------------------------------------
    // * claim : claim from liq pool
    // * 
    // * ================== Required ===================
    // * State state should be "resume"
    // * 
    // * 
    // * ===============================================
    // * Tx Route : initialize / claim
    // * -------------------------------------------------------------------------------------


    it("claim", async () => {

        //! Should double check on this
        const newTicketAccount = Keypair.generate()

        const tx = await program.methods.claim()
            .accounts({
                state: stateAccount.publicKey,
                reservePda: reservePda,
                ticketAccount: newTicketAccount.publicKey,
                transferSolTo: stakeAuthority.publicKey,
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
        const sig = await sendAndConfirmTransaction(connection, tx, [payer, stakeAuthority, newTicketAccount]);
        console.log("Transaction Signature:", sig);
    })

});
