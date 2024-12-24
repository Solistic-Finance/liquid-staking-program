import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../target/types/solistic_staking";
import {
    PublicKey,
    sendAndConfirmTransaction,
    StakeProgram,
} from '@solana/web3.js';
import {
    connection,
    mint_to,
    ssolMint,
    payer,
    stakeAccount,
    stakeList,
    stateAccount,
    validatorList,
    voteAccount
} from ".";

describe("solistic-staking", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolisticStaking as Program<SolisticStaking>;

    const validatorVote = voteAccount[1]
    const [duplicationFlag] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("unique_validator"), validatorVote.toBuffer()], program.programId)
    const [authoritySsolAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("st_mint")], program.programId);

    // * -------------------------------------------------------------------------------------
    // *  Base Instructions
    // * -------------------------------------------------------------------------------------
    // * deposit_stake_account : deposit_stake_account to liq pool
    // * 
    // * ================== Required ===================
    // * State state should be "resume"
    // * 
    // * 
    // * ===============================================
    // * Tx Route : initialize / deposit_stake_account
    // * -------------------------------------------------------------------------------------


    it("deposit_stake_account", async () => {

        const tx = await program.methods.depositStakeAccount(1)
            .accounts({
                state: stateAccount.publicKey,
                validatorList: validatorList.publicKey,
                stakeList: stakeList.publicKey,
                stakeAccount: stakeAccount.publicKey,
                stakeAuthority: payer.publicKey,
                duplicationFlag: duplicationFlag,      //  Double check
                ssolMint: ssolMint,
                mintTo: mint_to,
                ssolMintAuthority: authoritySsolAcc,
                stakeProgram: StakeProgram.programId
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
