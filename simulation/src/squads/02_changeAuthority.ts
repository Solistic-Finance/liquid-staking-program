import { sendAndConfirmTransaction } from "@solana/web3.js";
import { connection, multisigPublicKey, payer, program } from "../config";
import { ChangeAuthorityData } from "../types";
import { operationalSolAccount, stateAccount, treasurySsolAccount } from "./00_prerequisite";

export const getChangeAuthorityTransaction = async (changeAuthorityData: ChangeAuthorityData) => {
    const tx = await program.methods
        //  @ts-ignore
        .changeAuthority(changeAuthorityData)
        .accounts({
            state: stateAccount.publicKey,
            adminAuthority: payer.publicKey
        })
        .transaction()

    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    try {
        const simulationResult = await connection.simulateTransaction(tx);
        console.log("Change Authority: Simulation Result:", simulationResult);

        const sig = await sendAndConfirmTransaction(
            connection, 
            tx, 
            [payer], 
            {skipPreflight: true}
        );
        console.log("Change Authority: Transaction Signature:", sig);
    } catch (error) {
        console.log("Error in executing change authority ix:", error);
    }
}

// Example usage
const changeAuthority = async () => {
    const changeAuthorityData: ChangeAuthorityData = {
        admin: multisigPublicKey,
        validatorManager: multisigPublicKey,
        operationalSolAccount: operationalSolAccount.publicKey,
        treasurySsolAccount: treasurySsolAccount,
        pauseAuthority: multisigPublicKey
    };

    await getChangeAuthorityTransaction(changeAuthorityData);
}

changeAuthority();