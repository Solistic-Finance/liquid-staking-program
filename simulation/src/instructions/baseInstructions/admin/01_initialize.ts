import { 
    Connection, 
    sendAndConfirmTransaction, 
    Signer, 
    SYSVAR_CLOCK_PUBKEY, 
    SYSVAR_RENT_PUBKEY 
} from "@solana/web3.js";
import { 
    program, 
    stateAccountKeypair,
    stakeListKeypair,
    validatorsListKeypair,
    stateAccount, 
    stakeList, 
    validatorsList,
    ssolMint,
    lpMint,
    operationalSolAccount,
    reservePda,
    solLegPda,
    sSolLeg,
    treasurySsolAccount,
} from "../../../config";
import { 
    InitializeDataParam, 
    SSolInitParam 
} from "../../../types";

export const initialize = async (
    connection: Connection, 
    admin: Signer , 
    initializeData : InitializeDataParam , 
    initParam : SSolInitParam
) => {

    const tx = await program.methods
        //  @ts-ignore
        .initialize(initializeData)
        .accounts({
            state: stateAccount,
            reservePda: reservePda,
            stakeList: stakeList,
            validatorList: validatorsList,
            ssolMint: ssolMint,
            operationalSolAccount: operationalSolAccount,
            lpMint: lpMint,
            solLegPda: solLegPda,
            ssolLeg: sSolLeg,
            treasurySsolAccount: treasurySsolAccount,
            clock: SYSVAR_CLOCK_PUBKEY,
            rent: SYSVAR_RENT_PUBKEY,
        })
        .preInstructions([
            await program.account.state.createInstruction(stateAccountKeypair),
            await program.account.state.createInstruction(stakeListKeypair),
            await program.account.state.createInstruction(validatorsListKeypair)
        ])
        .transaction()

    console.log("stateAccount:", stateAccount.toBase58());
    console.log("reservePda:", reservePda.toBase58());
    console.log("ssolMint:", ssolMint.toBase58());
    console.log("stakeList:", stakeList.toBase58());
    console.log("validatorList:", validatorsList.toBase58());
    console.log("operationalSolAccount:", operationalSolAccount.toBase58());
    console.log("treasurySsolAccount:", treasurySsolAccount.toBase58());
    console.log("lpMint:", lpMint.toBase58());
    console.log("solLegPda:", solLegPda.toBase58());
    console.log("sSolLeg:", sSolLeg.toBase58());
    

    tx.feePayer = admin.publicKey;
    console.log("Fee Payer:", admin.publicKey.toBase58());
    
    try { 
        // const simulationResult = await connection.simulateTransaction(tx);
        // console.log("Initialize: Simulation Result:", simulationResult);
        
        // Get fresh blockhash right before sending
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        // Re-sign with fresh blockhash
        tx.sign(admin, stateAccountKeypair, stakeListKeypair, validatorsListKeypair);
        
        const sig = await sendAndConfirmTransaction(
            connection, tx, [
                admin,
                stateAccountKeypair,
                stakeListKeypair,
                validatorsListKeypair
            ], 
            {skipPreflight: true}
        );
        console.log("Initialize: Transaction Signature:", sig);
        const state = await program.account.state.fetch(stateAccount);
        console.log("State Account after Initialize:", state);
    } catch (error) {
        console.log("Error in executing initialize ix:", error);
        const state = await program.account.state.fetch(stateAccount);
        console.log("State Account after Initialize:", state);
    }
}