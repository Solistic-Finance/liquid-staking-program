
import { Connection, PublicKey, sendAndConfirmTransaction, Signer } from "@solana/web3.js";
import { program } from "../../../config";
import { AddValidatorParam } from "../../../types";
import { stateAccount, validatorsList } from "../../../config";

export const addValidator = async (connection: Connection, admin: Signer, addValidatorParam: AddValidatorParam) => {
    const {
        score,
        voteAccount
    } = addValidatorParam

    const [duplicationFlag] = PublicKey.findProgramAddressSync([stateAccount.toBuffer(), Buffer.from("unique_validator"), voteAccount.toBuffer()], program.programId)

    const tx = await program.methods
        .addValidator(score)
        .accounts({
            state: stateAccount,
            managerAuthority: admin.publicKey,
            validatorList: validatorsList,
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

        const state = await program.account.state.fetch(stateAccount);
        console.log("State Account after Adding Validator:", state);
    } catch (error){
        console.log("Error in adding validator: ", error);
        const state = await program.account.state.fetch(stateAccount);
        console.log("State Account after Adding Validator:", state);
    }
}
//? Define the parameters for initializing the state
// const addValidatorParam = {
//     score: 2,
//     voteAccount: voteAccount[2]
// }