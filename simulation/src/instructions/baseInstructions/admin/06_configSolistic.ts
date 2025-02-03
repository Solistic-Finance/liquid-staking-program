
import { Connection, sendAndConfirmTransaction, Signer } from "@solana/web3.js";
import { program, stateAccount } from "../../../config";
import { ConfigSolisticParam } from "../../../types/";

export const configSolistic = async (connection: Connection, admin: Signer, configSolisticParam: ConfigSolisticParam) => {
    const tx = await program.methods.configSolistic(configSolisticParam)
        .accounts({
            state: stateAccount,
            adminAuthority: admin.publicKey,
        })
        .signers([admin])
        .transaction()

    // Set fee payer and recent blockhash
    tx.feePayer = admin.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // Simulate the transaction to catch errors
    // const simulationResult = await connection.simulateTransaction(tx);
    // console.log("Simulation Result:", simulationResult);

    // Send the transaction
    const sig = await sendAndConfirmTransaction(
        connection, 
        tx, 
        [admin],
        {
            skipPreflight: true,
        },
    );
    console.log("Config Solistic Transaction Signature:", sig);
}

//? Define the parameters for initializing the state
// interface DepositParam {
//     amount : BN
// }
