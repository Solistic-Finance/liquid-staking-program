
import { Connection, PublicKey, sendAndConfirmTransaction, Signer } from "@solana/web3.js";
import { program } from "../../../config";
import { AddValidatorParam } from "../../../types";
import { stateAccountKeypair, validatorsListKeypair } from "../../../config";

export const addValidator = async (connection: Connection, admin: Signer, addValidatorParam: AddValidatorParam) => {
    const {
        score,
        voteAccount
    } = addValidatorParam

    const [duplicationFlag] = PublicKey.findProgramAddressSync([stateAccountKeypair.publicKey.toBuffer(), Buffer.from("unique_validator"), voteAccount.toBuffer()], program.programId)

    const tx = await program.methods
        .addValidator(score)
        .accounts({
            state: stateAccountKeypair.publicKey,
            managerAuthority: admin.publicKey,
            validatorList: validatorsListKeypair.publicKey,
            validatorVote: voteAccount,
            duplicationFlag: duplicationFlag,
        })
        .signers([admin])
        .transaction()

    tx.feePayer = admin.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    try{
        const simulationResult = await connection.simulateTransaction(tx);
        console.log("addValidator: Simulation Result:", simulationResult);
        
        const sig = await sendAndConfirmTransaction(connection, tx, [admin], {skipPreflight: true});
        console.log("addValidator: Transaction Signature:", sig);

        const state = await program.account.state.fetch(stateAccountKeypair.publicKey);
        console.log("State Account after Adding Validator:", state);
    } catch (error){
        console.log("Error in adding validator: ", error);
        const state = await program.account.state.fetch(stateAccountKeypair.publicKey);
        console.log("State Account after Adding Validator:", state);
    }
}
//? Define the parameters for initializing the state
// const addValidatorParam = {
//     score: 2,
//     voteAccount: voteAccount[2]
// }