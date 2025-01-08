import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../target/types/solistic_staking";
import {
    PublicKey,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import { BN } from "bn.js";
import {
    connection,
    mint_to,
    sSolLeg,
    ssolMint,
    payer,
    stateAccount
} from ".";

describe("solistic-staking", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolisticStaking as Program<SolisticStaking>;

    const [authoritySsolAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("st_mint")], program.programId);
    const [reservePda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("reserve")], program.programId);
    const [authoritySSolLegAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_st_sol_authority")], program.programId);
    const [solLegPda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_sol")], program.programId);

    // * -------------------------------------------------------------------------------------
    // *  Base Instructions
    // * -------------------------------------------------------------------------------------
    // * deposit : deposit to liq pool
    // * 
    // * ================== Required ===================
    // * State state should be "resume"
    // * 
    // * 
    // * ===============================================
    // * Tx Route : initialize / deposit
    // * -------------------------------------------------------------------------------------

    it("deposit", async () => {

        const tx = await program.methods.deposit(new BN(10000))
            .accounts({
                state: stateAccount.publicKey,
                ssolMint: ssolMint,
                liqPoolSolLegPda: solLegPda,
                liqPoolSsolLeg: sSolLeg,
                liqPoolSsolLegAuthority: authoritySSolLegAcc,
                reservePda: reservePda,
                transferFrom: payer.publicKey,
                mintTo: mint_to,
                ssolMintAuthority: authoritySsolAcc,
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
