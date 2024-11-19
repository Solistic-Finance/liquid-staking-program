import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MarinadeForkingSmartContract } from "../target/types/marinade_forking_smart_contract";
import {
    Keypair,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
    getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import {
    connection,
    msolMint,
    payer,
    reservePda,
    stakeAuthority,
    stateAccount
} from ".";

describe("marinade-forking-smart-contract", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.MarinadeForkingSmartContract as Program<MarinadeForkingSmartContract>;

    // * -------------------------------------------------------------------------------------
    // *  Base Instructions
    // * -------------------------------------------------------------------------------------
    // * Advanced instructions: deposit-stake-account, Delayed-Unstake
    // * backend/bot "crank" related functions:
    // * order_unstake (starts stake-account deactivation)
    // * withdraw (delete & withdraw from a deactivated stake-account)
    // * -------------------------------------------------------------------------------------


    it("claim", async () => {

        //! Should double check on this
        const newTicketAccount = Keypair.generate()
        // const airtx1 = await connection.requestAirdrop(newTicketAccount.publicKey, 2_039_280);

        // await connection.confirmTransaction(airtx1)

        const burnMsolFrom = await getOrCreateAssociatedTokenAccount(connection, stakeAuthority, msolMint, stakeAuthority.publicKey)

        console.log("start sleeping");
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log({
            state: stateAccount.publicKey,
            msolMint: msolMint,
            burnMsolFrom: burnMsolFrom.address,
            burnMsolAuthority: payer.publicKey,
            newTicketAccount: newTicketAccount.publicKey,
        });

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
