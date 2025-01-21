import { sendAndConfirmTransaction, Signer } from "@solana/web3.js";
import { 
    connectionDevnet as connection, 
    // connection, 
    programDevnet as program,
    // program,
    multisigDevnetPublicKey as multisigPublicKey,
    // multisigPublicKey, 
    admin, 
    stateAccountKeypair,
    operationalSolAccountKeypair,
    treasurySsolAccount
} from "../config";
import { ChangeAuthorityData } from "../types";

export const getChangeAuthorityTransaction = async (changeAuthorityData: ChangeAuthorityData, payer: Signer) => {
    const tx = await program.methods
        //  @ts-ignore
        .changeAuthority(changeAuthorityData)
        .accounts({
            state: stateAccountKeypair.publicKey,
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

const changeAuthority = async () => {
    const changeAuthorityData: ChangeAuthorityData = {
        admin: multisigPublicKey,
        validatorManager: multisigPublicKey,
        operationalSolAccount: operationalSolAccountKeypair.publicKey,
        treasurySsolAccount: treasurySsolAccount,
        pauseAuthority: multisigPublicKey
    };

    await getChangeAuthorityTransaction(changeAuthorityData, admin);
}

changeAuthority();