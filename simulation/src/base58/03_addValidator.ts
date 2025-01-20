
import { Connection, PublicKey, sendAndConfirmTransaction, Signer } from "@solana/web3.js";
import { connection, payer, program } from "../config";
import { AddValidatorParam } from "../types";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { stateAccount, validatorsList } from "./00_prerequisite";
import { voteAccount } from "../voteAccounts";

export const getAddValidatorTx = async (
    connection: Connection, 
    payer: Signer, 
    addValidatorParam: AddValidatorParam
) : Promise<string | undefined> => {
    const {
        score,
        voteAccount
    } = addValidatorParam

    const [duplicationFlag] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("unique_validator"), voteAccount.toBuffer()], program.programId)

    const tx = await program.methods
        .addValidator(score)
        .accounts({
            state: stateAccount.publicKey,
            managerAuthority: payer.publicKey,
            validatorList: validatorsList.publicKey,
            validatorVote: voteAccount,
            duplicationFlag: duplicationFlag,
            rentPayer: payer.publicKey,
        })
        .transaction()

    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    try { 
        // const simulationResult = await connection.simulateTransaction(tx);
        // console.log("Initialize: Simulation Result:", simulationResult);
        
        // // Get fresh blockhash right before sending
        // // Re-sign with fresh blockhash
        tx.sign(payer);
        let base58Tx = bs58.encode(tx.serialize());
        console.log("base58Tx:", base58Tx);
        const sig = await sendAndConfirmTransaction(
            connection, 
            tx, 
            [
                payer,
            ], 
            {skipPreflight: true});
        console.log("Add Validator: Transaction Signature:", sig);
        const state = await program.account.state.fetch(stateAccount.publicKey);
        console.log("State Account after Add Validator:", state);
        return base58Tx

    } catch (error) {
        console.log("Error in executing add validator ix:", error);
        const state = await program.account.state.fetch(stateAccount.publicKey);
        console.log("State Account after Add Validator:", state);
    }
}
// ? Define the parameters for initializing the state

const addValidator = async () => {
    const addValidatorParam = {
        score: 11,
        voteAccount: voteAccount[9]
    }
    
    const tx = await getAddValidatorTx(connection, payer, addValidatorParam)
    console.log(tx)
}

addValidator()