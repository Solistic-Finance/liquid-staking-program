import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../target/types/solistic_staking";
import {
    sendAndConfirmTransaction,
    StakeProgram,
    SYSVAR_STAKE_HISTORY_PUBKEY,
} from '@solana/web3.js';
import {
    authoritySsolAcc,
    connection,
    ssolMint,
    operationalSolAccount,
    payer,
    reservePda,
    stakeAccount,
    stakeAuthority,
    stakeList,
    stakeWithdrawAuthority,
    stateAccount,
    treasurySsolAccount
} from ".";

describe("solistic-staking", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolisticStaking as Program<SolisticStaking>;

    // * -------------------------------------------------------------------------------------
    // *  Advanced Instructions
    // * -------------------------------------------------------------------------------------
    // * update_deactivated : update_deactivated from liq pool
    // * 
    // * ================== Required ===================
    // * State state should be "resume"
    // * 
    // * 
    // * ===============================================
    // * Tx Route : initialize / update_deactivated
    // * -------------------------------------------------------------------------------------

    it("update_deactivated", async () => {

        // const airtx = await connection.requestAirdrop(reservePda, 2_039_280);

        // await connection.confirmTransaction(airtx)


        const updateActive = {
            state: stateAccount.publicKey,
            stakeList: stakeList.publicKey,
            stakeAccount: stakeAccount.publicKey,
            stakeWithdrawAuthority: stakeWithdrawAuthority,
            reservePda: reservePda,
            ssolMint: ssolMint,
            ssolMintAuthority: authoritySsolAcc,
            treasurySsolAccount: treasurySsolAccount,
            stakeHistory: SYSVAR_STAKE_HISTORY_PUBKEY,
            stakeProgram: StakeProgram.programId
        }

        const tx = await program.methods.updateDeactivated(0)
            .accounts({
                common: updateActive,
                operationalSolAccount: operationalSolAccount.publicKey,
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
        const sig = await sendAndConfirmTransaction(connection, tx, [payer, operationalSolAccount]);
        console.log("Transaction Signature:", sig);
    })

});
