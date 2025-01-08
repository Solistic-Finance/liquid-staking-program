import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../target/types/solistic_staking";
import {
    sendAndConfirmTransaction,
} from '@solana/web3.js';

import {
    authorityAcc,
    connection,
    operationalSolAccount,
    payer,
    stateAccount,
    treasurySsolAccount
} from ".";

describe("solistic-staking", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolisticStaking as Program<SolisticStaking>;

    // * -------------------------------------------------------------------------------------
    // *  Base Instructions
    // * -------------------------------------------------------------------------------------
    // * initialize : initialize State Account
    // * 
    // * ================== Required ===================
    // * This is called at first and only once
    // * If it is invoked again , it could be failed
    // * 
    // * ===============================================
    // * Tx Route : initialize
    // * -------------------------------------------------------------------------------------

    it("config_solistic", async () => {

        const changeAuthorityData = {
            admin: payer.publicKey,
            validatorManager: payer.publicKey,
            operationalSolAccount: operationalSolAccount,
            treasurySsolAccount: treasurySsolAccount,
            pauseAuthority: payer.publicKey
        }

        //  @ts-ignore
        const tx = await program.methods.changeAuthority(changeAuthorityData)
            .accounts({
                state: stateAccount.publicKey,
                adminAuthority: authorityAcc.publicKey
            })
            .signers([authorityAcc])
            .transaction()


        // Set fee payer and recent blockhash
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        // Simulate the transaction to catch errors
        const simulationResult = await connection.simulateTransaction(tx);
        console.log("Simulation Result:", simulationResult);

        // Send the transaction
        const sig = await sendAndConfirmTransaction(connection, tx, [payer, authorityAcc]);
        console.log("Transaction Signature:", sig);
    })

});
