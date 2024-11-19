import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MarinadeForkingSmartContract } from "../target/types/marinade_forking_smart_contract";
import {
    Keypair,
    PublicKey,
    Connection,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import { BN } from "bn.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {
    connection,
    mint_to,
    mSolLeg,
    msolMint,
    payer,
    stakeAuthority,
    stateAccount,
    treasuryMsolAccount
} from ".";

describe("marinade-forking-smart-contract", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.MarinadeForkingSmartContract as Program<MarinadeForkingSmartContract>;

    const [solLegPda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_sol")], program.programId);

    // * -------------------------------------------------------------------------------------
    // *  Base Instructions
    // * -------------------------------------------------------------------------------------
    // * Advanced instructions: deposit-stake-account, Delayed-Unstake
    // * backend/bot "crank" related functions:
    // * order_unstake (starts stake-account deactivation)
    // * withdraw (delete & withdraw from a deactivated stake-account)
    // * -------------------------------------------------------------------------------------

    it("liquid_unstake", async () => {

        console.log({
            state: stateAccount.publicKey,
            msolMint: msolMint,
            liqPoolSolLegPda: solLegPda,
            liqPoolMsolLeg: mSolLeg,
            treasuryMsolAccount: treasuryMsolAccount,
            getMsolFrom: mint_to,
            getMsolFromAuthority: stakeAuthority.publicKey,
            transferSolTo: stakeAuthority.publicKey,
        });

        const tx = await program.methods.liquidUnstake(new BN(100))
            .accounts({
                state: stateAccount.publicKey,
                msolMint: msolMint,
                liqPoolSolLegPda: solLegPda,
                liqPoolMsolLeg: mSolLeg,
                treasuryMsolAccount: treasuryMsolAccount,
                getMsolFrom: mint_to,
                getMsolFromAuthority: stakeAuthority.publicKey,
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
