
import { 
    Connection, 
    sendAndConfirmTransaction, 
    Signer 
} from "@solana/web3.js";
import { program } from "../../../config";
import { ClaimParam } from "../../../types";
import { stateAccount, reservePda } from "../../../config";

export const claim = async (connection: Connection, user: Signer, claimParam: ClaimParam) => {
    const {
        newTicketAccount
    } = claimParam

    const tx = await program.methods.claim()
            .accounts({
                state: stateAccount,
                reservePda: reservePda,
                ticketAccount: newTicketAccount,
                transferSolTo: user.publicKey,
            })
            .signers([user])
            .transaction()

        // Set fee payer and recent blockhash
        tx.feePayer = user.publicKey;
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        // Simulate the transaction to catch errors
        // const simulationResult = await connection.simulateTransaction(tx);
        // console.log("Simulation Result:", simulationResult);

        // Send the transaction
        const sig = await sendAndConfirmTransaction(connection, tx, [user], {skipPreflight: true});
        console.log("Transaction Signature:", sig);
}