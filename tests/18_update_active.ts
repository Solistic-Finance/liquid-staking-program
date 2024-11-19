import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MarinadeForkingSmartContract } from "../target/types/marinade_forking_smart_contract";
import {
    sendAndConfirmTransaction,
    StakeProgram,
    SYSVAR_STAKE_HISTORY_PUBKEY,
} from '@solana/web3.js';
import {
    authorityMsolAcc,
    connection,
    msolMint,
    payer,
    reservePda,
    stakeAccount,
    stakeAuthority,
    stakeList,
    stakeWithdrawAuthority,
    stateAccount,
    treasuryMsolAccount,
    validatorList
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

    it("update_active", async () => {
        // const airtx = await connection.requestAirdrop(reservePda, 10000000000 + 2_039_280);

        // await connection.confirmTransaction(airtx)


        const updateActive = {
            state: stateAccount.publicKey,
            stakeList: stakeList.publicKey,
            stakeAccount: stakeAccount.publicKey,
            stakeWithdrawAuthority: stakeWithdrawAuthority,
            reservePda: reservePda,
            msolMint: msolMint,
            msolMintAuthority: authorityMsolAcc,
            treasuryMsolAccount: treasuryMsolAccount,
            stakeHistory: SYSVAR_STAKE_HISTORY_PUBKEY,
            stakeProgram: StakeProgram.programId
        }

        const tx = await program.methods.updateActive(0, 1)
            .accounts({
                common: updateActive,
                validatorList: validatorList.publicKey,
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
        const sig = await sendAndConfirmTransaction(connection, tx, [payer, validatorList]);
        console.log("Transaction Signature:", sig);
    })

});
