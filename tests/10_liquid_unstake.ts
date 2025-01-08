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
    stakeAuthority,
    stateAccount,
    treasurySsolAccount
} from ".";

describe("solistic-staking", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolisticStaking as Program<SolisticStaking>;

    const [solLegPda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_sol")], program.programId);

    // * -------------------------------------------------------------------------------------
    // *  Base Instructions
    // * -------------------------------------------------------------------------------------
    // * liquid_unstake : liquid unstake from liq pool
    // * 
    // * ================== Required ===================
    // * State state should be "resume"
    // * 
    // * 
    // * ===============================================
    // * Tx Route : initialize / liquid_unstake
    // * -------------------------------------------------------------------------------------

    it("liquid_unstake", async () => {

        const tx = await program.methods.liquidUnstake(new BN(100))
            .accounts({
                state: stateAccount.publicKey,
                ssolMint: ssolMint,
                liqPoolSolLegPda: solLegPda,
                liqPoolSsolLeg: sSolLeg,
                treasurySsolAccount: treasurySsolAccount,
                getSsolFrom: mint_to,
                getSsolFromAuthority: stakeAuthority.publicKey,
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
        const sig = await sendAndConfirmTransaction(connection, tx, [payer, stakeAuthority]);
        console.log("Transaction Signature:", sig);
    })

});
