import { 
    sendAndConfirmTransaction,
    SYSVAR_CLOCK_PUBKEY, 
    SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { 
    payer, 
    program, 
} from "../config";
import {  InitializeDataParam, SSolInitParam } from "../types";
import bs58 from "bs58"; // For base58 encoding if needed explicitly
import { BN } from "@coral-xyz/anchor";
import { 
    preRequisiteSetup, 
    stateAccount as stateAccountKeypair, 
    stakeList as stakeListKeypair, 
    validatorsList as validatorsListKeypair 
} from "./00_prerequisite";
import { connection } from "../config";
// import { connectionDevnet as connection } from "../config";

export const getInitializeTransaction = async (
    initializeData : InitializeDataParam , 
    initParam : SSolInitParam
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
    const tx = await program.methods
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
            liqPool: {
                lpMint: lpMint,
                solLegPda: solLegPda,
                ssolLeg: sSolLeg,
            },
            clock: SYSVAR_CLOCK_PUBKEY,
            rent: SYSVAR_RENT_PUBKEY,
        })
        .preInstructions([
            await program.account.state.createInstruction(stateAccountKeypair),
            await program.account.state.createInstruction(stakeListKeypair),
            await program.account.state.createInstruction(validatorsListKeypair)
        ])
        .transaction()

    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        
    try { 
        // const simulationResult = await connection.simulateTransaction(tx);
        // console.log("Initialize: Simulation Result:", simulationResult);
        
        // // Get fresh blockhash right before sending
        // // Re-sign with fresh blockhash
        tx.sign(payer, stateAccountKeypair, stakeListKeypair, validatorsListKeypair);
        let base58Tx = bs58.encode(tx.serialize());
        console.log("base58Tx:", base58Tx);
        // return base58Tx
        const sig = await sendAndConfirmTransaction(
            connection, 
            tx, 
            [
                payer,
                stateAccountKeypair,
                stakeListKeypair,
                validatorsListKeypair
            ], 
            {skipPreflight: true});
        console.log("Initialize: Transaction Signature:", sig);
        const state = await program.account.state.fetch(stateAccount);
        console.log("State Account after Initialize:", state);
    } catch (error) {
        console.log("Error in executing initialize ix:", error);
        const state = await program.account.state.fetch(stateAccount);
        console.log("State Account after Initialize:", state);
    }
}

const initialize = async () => {
    
    
    let intParam : SSolInitParam = await preRequisiteSetup(connection, payer)
    const initializeData: InitializeDataParam = {
        adminAuthority: payer.publicKey,
        validatorManagerAuthority: payer.publicKey,
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
        pauseAuthority: payer.publicKey,
    };
    getInitializeTransaction(initializeData, intParam)
}

initialize()