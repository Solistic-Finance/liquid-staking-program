import { 
    sendAndConfirmTransaction,
    Signer,
    SystemProgram,
    SYSVAR_CLOCK_PUBKEY, 
    SYSVAR_RENT_PUBKEY,
    TransactionMessage,
    VersionedTransaction, 
} from "@solana/web3.js";
import { 
    connectionDevnet as connection,
    multisigDevnetPublicKey as multisigPublicKey, 
    programDevnet as program, 
    admin, 
    stateAccountKeypair,
    stakeListKeypair,
    validatorsListKeypair,
} from "../config";
import {  InitializeDataParam, SSolInitParam } from "../types";
import bs58 from "bs58"; // For base58 encoding if needed explicitly
import { BN } from "@coral-xyz/anchor";
import { preRequisiteSetup } from "./00_prerequisite";
import * as multisig from "@sqds/multisig";

export const getInitializeTransaction = async (
    initializeData : InitializeDataParam , 
    initParam : SSolInitParam,
    payer : Signer
) => {

    const {
        stateAccount,
        ssolMint,
        stakeList,
        validatorList,
        operationalSolAccount,
        treasurySsolAccount,
        lpMint,
        sSolLeg,
        reservePda,
        solLegPda,
    } = initParam
    const ix = await program.methods
        //  @ts-ignore
        .initialize(initializeData)
        .accounts({
            state: stateAccount,
            reservePda: reservePda,
            ssolMint: ssolMint,
            stakeList: stakeList,
            validatorList: validatorList,
            operationalSolAccount: operationalSolAccount,
            treasurySsolAccount: treasurySsolAccount,
            lpMint: lpMint,
            solLegPda: solLegPda,
            ssolLeg: sSolLeg,
            clock: SYSVAR_CLOCK_PUBKEY,
            rent: SYSVAR_RENT_PUBKEY,
        })
        .preInstructions([
            await program.account.state.createInstruction(stateAccountKeypair),
            await program.account.state.createInstruction(stakeListKeypair),
            await program.account.state.createInstruction(validatorsListKeypair)
        ])
        .instruction()

    // Derive the multisig account PDA
    const [multisigPda] = multisig.getMultisigPda({
        createKey: payer.publicKey,
    });
    const [vaultPda] = multisig.getVaultPda({
        multisigPda,
        index: 0,
    });
    console.log("multisigPda:", multisigPda.toBase58());
    console.log("vaultPda:", vaultPda.toBase58());
    
    const tx = new VersionedTransaction(
        new TransactionMessage({
          payerKey: payer.publicKey,
          recentBlockhash: await (
            await connection.getLatestBlockhash()
          ).blockhash,
          instructions: [
            ix,
          ],
        }).compileToV0Message()
      );
  
    tx.sign([payer, stateAccountKeypair, stakeListKeypair, validatorsListKeypair]);
    
    const serialized = tx.serialize()

    const bs58Tx = bs58.encode(serialized)

    console.log("bs58Tx:", bs58Tx);
    const size = serialized.length + 1 + (tx.signatures.length * 64);
    console.log("tx size : ", size);

    console.log("Fee Payer:", payer.publicKey.toBase58());
    
    try { 
        // const simulationResult = await connection.simulateTransaction(tx);
        // console.log("Initialize: Simulation Result:", simulationResult);
        
        // // Get fresh blockhash right before sending
        // // Re-sign with fresh blockhash
        // // tx.sign(admin, stateAccountKeypair, stakeListKeypair, validatorsListKeypair);
        
        // const sig = await sendAndConfirmTransaction(
        //     connection, 
        //     tx, 
        //     [
        //         payer,
        //         stateAccountKeypair,
        //         stakeListKeypair,
        //         validatorsListKeypair
        //     ], 
        //     {skipPreflight: true});
        // console.log("Initialize: Transaction Signature:", sig);
        // const state = await program.account.state.fetch(stateAccount);
        // console.log("State Account after Initialize:", state);
    } catch (error) {
        console.log("Error in executing initialize ix:", error);
        const state = await program.account.state.fetch(stateAccount);
        console.log("State Account after Initialize:", state);
    }
}

const initialize = async () => {
    let intParam : SSolInitParam = await preRequisiteSetup(connection, admin)
    const initializeData: InitializeDataParam = {
        adminAuthority: multisigPublicKey,
        validatorManagerAuthority: multisigPublicKey,
        minStake: new BN(10000000), //0.01 SOL
        rewardsFee: { numerator: 1, denominator: 100 }, // 1%
        liqPool: {
            lpLiquidityTarget: new BN(50000000000), // 50SOL
            lpMaxFee: { basisPoints: new BN(10) }, // 0.1%
            lpMinFee: { basisPoints: new BN(1) }, // 0.01%
            lpTreasuryCut: { basisPoints: new BN(1) }, // 0.01% 
        },
        additionalStakeRecordSpace: 10,
        additionalValidatorRecordSpace: 10,
        slotsForStakeDelta: new BN(3000),
        pauseAuthority: multisigPublicKey,
    };
    getInitializeTransaction(initializeData, intParam, admin)
}

initialize()