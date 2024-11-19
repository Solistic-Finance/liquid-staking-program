import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MarinadeForkingSmartContract } from "../target/types/marinade_forking_smart_contract";
import {
    Keypair,
    PublicKey,
    Connection,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { authorityAcc, connection, payer, stateAccount } from ".";

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

    it("config_lp", async () => {

        const state = await program.account.state.fetch(stateAccount.publicKey);
        console.log("State Account:", state); //  this data

        const configLpParam = {
            minFee: { basisPoints: new anchor.BN(2) },  // Correct usage for Fee type
            maxFee: { basisPoints: new anchor.BN(20) },
            liquidityTarget: new anchor.BN(70000000000),
            treasuryCut: { basisPoints: new anchor.BN(30) },
        };

        const tx = await program.methods.configLp(configLpParam)
            .accounts({
                state: stateAccount.publicKey,
                adminAuthority: authorityAcc.publicKey,
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
