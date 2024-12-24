import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../target/types/solistic_staking";
import {
    Keypair,
    PublicKey,
    Connection,
    sendAndConfirmTransaction,
    Transaction,
    StakeProgram,
    SystemProgram,
    Authorized,
    LAMPORTS_PER_SOL,
    SYSVAR_STAKE_HISTORY_PUBKEY,
    STAKE_CONFIG_ID,
    Lockup,
    EpochSchedule,
    SYSVAR_EPOCH_SCHEDULE_PUBKEY,
    ComputeBudgetProgram
} from '@solana/web3.js';
import {
    createMint,
    mintTo,
    getOrCreateAssociatedTokenAccount,
    createAssociatedTokenAccount,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
    getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { BN } from "bn.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { authorityAcc, connection, lpMint, mint_to, sSolLeg, ssolMint, operationalSolAccount, payer, stakeAccount, stakeAuthority, stakeDepositAuthority, stakeList, stakeWithdrawAuthority, stateAccount, treasurySsolAccount, validatorList, voteAccount } from ".";

describe("solistic-staking", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolisticStaking as Program<SolisticStaking>;

    const validatorVote = voteAccount[0]
    const newsplitStakeAccount = Keypair.generate()
    
    // * -------------------------------------------------------------------------------------
    // *  Advanced Instructions
    // * -------------------------------------------------------------------------------------
    // * withdraw_stake_account : withdraw_stake_account from liq pool
    // * 
    // * ================== Required ===================
    // * State state should be "resume"
    // * 
    // * 
    // * ===============================================
    // * Tx Route : initialize / withdraw_stake_account
    // * -------------------------------------------------------------------------------------

    it("withdraw_stake_account", async () => {
        const burnSsolFrom = await getOrCreateAssociatedTokenAccount(connection, stakeAuthority, ssolMint, stakeAuthority.publicKey)

        const tx = await program.methods.withdrawStakeAccount(0, 0, new BN(10 ** 10), validatorVote)
            .accounts({
                state: stateAccount.publicKey,
                ssolMint: ssolMint,
                burnSsolFrom: burnSsolFrom.address,
                burnSsolAuthority: stakeAuthority.publicKey,
                treasurySsolAccount: treasurySsolAccount,
                validatorList: validatorList.publicKey,
                stakeList: stakeList.publicKey,
                stakeWithdrawAuthority: stakeWithdrawAuthority,
                stakeDepositAuthority: stakeDepositAuthority,
                stakeAccount: stakeAccount.publicKey,
                splitStakeAccount: newsplitStakeAccount.publicKey,
                splitStakeRentPayer: stakeAuthority.publicKey,
                stakeProgram: StakeProgram.programId,
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
        const sig = await sendAndConfirmTransaction(connection, tx, [payer, stateAccount, validatorList, stakeList, stakeAccount, newsplitStakeAccount, stakeAuthority]);
        console.log("Transaction Signature:", sig);
    })

});
