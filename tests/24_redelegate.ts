// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { MarinadeForkingSmartContract } from "../target/types/marinade_forking_smart_contract";
// import {
//     Keypair,
//     PublicKey,
//     Connection,
//     sendAndConfirmTransaction,
//     Transaction,
//     StakeProgram,
//     SystemProgram,
//     Authorized,
//     LAMPORTS_PER_SOL,
//     SYSVAR_STAKE_HISTORY_PUBKEY,
//     STAKE_CONFIG_ID,
//     Lockup,
//     EpochSchedule,
//     SYSVAR_EPOCH_SCHEDULE_PUBKEY,
//     ComputeBudgetProgram
// } from '@solana/web3.js';
// import {
//     createMint,
//     mintTo,
//     getOrCreateAssociatedTokenAccount,
//     createAssociatedTokenAccount,
//     getAssociatedTokenAddressSync,
//     createAssociatedTokenAccountInstruction,
//     createMintToInstruction,
//     getAssociatedTokenAddress,
//     TOKEN_PROGRAM_ID,
//     getMinimumBalanceForRentExemptMint
// } from '@solana/spl-token';
// import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
// import { BN } from "bn.js";
// import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
// import { authorityAcc, lpMint, mint_to, mSolLeg, msolMint, operationalSolAccount, stakeAccount, stakeAuthority, stakeList, stateAccount, treasuryMsolAccount, validatorList, voteAccount } from ".";

// const payer = Keypair.fromSecretKey(bs58.decode("5BrUQk416xSy4xbHZq6jXb2JcVA8iRnPNJJr3NZv2wukMhwB39ndpe9eaCXmuFLxzkVUYXbdCB9ydeJkhKCGhnkm"));
// const connection = new Connection("https://devnet.helius-rpc.com/?api-key=f74ec75c-56ba-49df-b67b-71637bf8d115"); // Change to your localnet RPC

// describe("marinade-forking-smart-contract", () => {
//     // Configure the client to use the local cluster.
//     anchor.setProvider(anchor.AnchorProvider.env());

//     const program = anchor.workspace.MarinadeForkingSmartContract as Program<MarinadeForkingSmartContract>;

//     const [authorityMsolAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("st_mint")], program.programId);
//     const [reservePda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("reserve")], program.programId);
//     const [authorityLpAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_mint")], program.programId);
//     const [authorityMSolLegAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_st_sol_authority")], program.programId);
//     const [solLegPda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_sol")], program.programId);
//     const [stakeDepositAuthority] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("deposit")], program.programId)
//     const [stakeWithdrawAuthority] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("withdraw")], program.programId);
//     console.log({
//         "authorityMsolAcc : ": authorityMsolAcc,
//         "reservePda : ": reservePda,
//         "authorityLpAcc : ": authorityLpAcc,
//         "authorityMSolLegAcc : ": authorityMSolLegAcc,
//         "solLegPda : ": solLegPda,
//     });

//     // * -------------------------------------------------------------------------------------
//     // *  Base Instructions
//     // * -------------------------------------------------------------------------------------
//     // * Advanced instructions: deposit-stake-account, Delayed-Unstake
//     // * backend/bot "crank" related functions:
//     // * order_unstake (starts stake-account deactivation)
//     // * withdraw (delete & withdraw from a deactivated stake-account)
//     // * -------------------------------------------------------------------------------------

//     it("redelegate", async () => {
//         const [stakeDepositAuthority] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("deposit")], program.programId)
//         const validatorVote = voteAccount[0]

//         console.log({
//             state: stateAccount.publicKey,
//             validatorList: validatorList.publicKey,
//             stakeList: stakeList.publicKey,
//             stakeAccount: stakeAccount.publicKey,
//             stakeDepositAuthority: stakeDepositAuthority,
//             reservePda: reservePda,
//             splitStakeAccount: stakeAccount.publicKey,
//             splitStakeRentPayer: stakeAuthority.publicKey,
//             destValidatorAccount: validatorVote,
//             redelegateStakeAccount: newsplitStakeAccount.publicKey,
//             stakeHistory: SYSVAR_STAKE_HISTORY_PUBKEY,
//             stakeConfig: STAKE_CONFIG_ID,
//             stakeProgram: StakeProgram.programId
//         });

//         const tx = await program.methods.redelegate(0, 0, 1)
//             .accounts({
//                 state: stateAccount.publicKey,
//                 validatorList: validatorList.publicKey,
//                 stakeList: stakeList.publicKey,
//                 stakeAccount: stakeAccount.publicKey,
//                 stakeDepositAuthority: stakeDepositAuthority,
//                 reservePda: reservePda,
//                 splitStakeAccount: newsplitStakeAccount.publicKey,
//                 splitStakeRentPayer: stakeAuthority.publicKey,
//                 destValidatorAccount: validatorVote,
//                 redelegateStakeAccount: newsplitStakeAccount1.publicKey,
//                 stakeHistory: SYSVAR_STAKE_HISTORY_PUBKEY,
//                 stakeConfig: STAKE_CONFIG_ID,
//                 stakeProgram: StakeProgram.programId
//             })
//             .signers([stakeAuthority])
//             .transaction()
//         // Set fee payer and recent blockhash
//         tx.feePayer = payer.publicKey;
//         tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
//         // Simulate the transaction to catch errors
//         const simulationResult = await connection.simulateTransaction(tx);
//         console.log("Simulation Result:", simulationResult);
//         // Send the transaction
//         const sig = await sendAndConfirmTransaction(connection, tx, [payer, stateAccount,
//             validatorList,
//             stakeList,
//             stakeAccount,
//             newsplitStakeAccount,
//             newsplitStakeAccount1,
//             stakeAuthority,
//             stakeAccount]);
//         console.log("Transaction Signature:", sig);
//     })
// });
