import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../target/types/solistic_staking";
import {
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import { BN } from "bn.js";
import {
    authorityLpAcc,
    connection,
    lpMint,
    mint_to,
    sSolLeg,
    payer,
    solLegPda,
    stakeAuthority,
    stateAccount
} from ".";

describe("solistic-staking", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolisticStaking as Program<SolisticStaking>;

    // * -------------------------------------------------------------------------------------
    // *  Base Instructions
    // * -------------------------------------------------------------------------------------
    // * add_liquidity : add liquidity from liq pool
    // * 
    // * ================== Required ===================
    // * State state should be "resume"
    // * 
    // * 
    // * ===============================================
    // * Tx Route : initialize / add_liquidity
    // * -------------------------------------------------------------------------------------

    it("add_liquidity", async () => {

        // Retrieve and log the state account to confirm initialization
        const state = await program.account.state.fetch(stateAccount.publicKey);
        console.log("State Account:", state); //  this data

        const tx = await program.methods.addLiquidity(new BN(10_000))
            .accounts({
                state: stateAccount.publicKey,
                lpMint: lpMint,
                lpMintAuthority: authorityLpAcc,
                liqPoolSsolLeg: sSolLeg,
                liqPoolSolLegPda: solLegPda,
                transferFrom: stakeAuthority.publicKey,
                mintTo: mint_to,
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
        const sig = await sendAndConfirmTransaction(connection, tx, [payer, stakeAuthority]);
        console.log("Transaction Signature:", sig);
    })

});
