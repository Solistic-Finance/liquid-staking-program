import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../target/types/solistic_staking";
import {
    Keypair,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
    getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import { BN } from "bn.js";
import {
    connection,
    ssolMint,
    payer,
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
    // * order_unstake : order unstake from liq pool
    // * 
    // * ================== Required ===================
    // * State state should be "resume"
    // * 
    // * 
    // * ===============================================
    // * Tx Route : initialize / order_unstake
    // * -------------------------------------------------------------------------------------

    it("order_unstake", async () => {
        //! Should double check on this
        const newTicketAccount = Keypair.generate()

        const burnSsolFrom = await getOrCreateAssociatedTokenAccount(connection, stakeAuthority, ssolMint, stakeAuthority.publicKey)

        const tx = await program.methods.orderUnstake(new BN(10 ** 9))
            .accounts({
                state: stateAccount.publicKey,
                ssolMint: ssolMint,
                burnSsolFrom: burnSsolFrom.address,
                burnSsolAuthority: stakeAuthority.publicKey,
                newTicketAccount: newTicketAccount.publicKey
            })
            .preInstructions([
                await program.account.ticketAccountData.createInstruction(newTicketAccount)
            ])
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
