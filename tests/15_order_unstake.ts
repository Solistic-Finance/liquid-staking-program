import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MarinadeForkingSmartContract } from "../target/types/marinade_forking_smart_contract";
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
import { authorityAcc, connection, lpMint, mint_to, mSolLeg, msolMint, operationalSolAccount, payer, stakeAccount, stakeAuthority, stakeList, stateAccount, treasuryMsolAccount, validatorList, voteAccount } from ".";

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

    it("order_unstake", async () => {
        // const a1 = await connection.requestAirdrop(stakeAuthority.publicKey, 10 ** 12);

        //! Should double check on this
        const newTicketAccount = Keypair.generate()
        // const sigA1 = await connection.confirmTransaction(a1)

        const burnMsolFrom = await getOrCreateAssociatedTokenAccount(connection, stakeAuthority, msolMint, stakeAuthority.publicKey)

        console.log(burnMsolFrom.address);
        // const burnMsolAuthority = 

        console.log({
            state: stateAccount.publicKey,
            msolMint: msolMint,
            burnMsolFrom: burnMsolFrom.address,
            burnMsolAuthority: stakeAuthority.publicKey,
            newTicketAccount: newTicketAccount.publicKey,
        });

        const tx = await program.methods.orderUnstake(new BN(10 ** 9))
            .accounts({
                state: stateAccount.publicKey,
                msolMint: msolMint,
                burnMsolFrom: burnMsolFrom.address,
                burnMsolAuthority: stakeAuthority.publicKey,
                newTicketAccount: newTicketAccount.publicKey
            })
            .preInstructions([
                await program.account.ticketAccountData.createInstruction(newTicketAccount)
            ])
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
