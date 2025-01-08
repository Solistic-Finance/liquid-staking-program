
import { Connection, PublicKey, sendAndConfirmTransaction, Signer, StakeProgram } from "@solana/web3.js";
import { program } from "../../config";
import { DepositStakeParam, InitParam, LiquidUnstakeParam } from "../../types";

const liquid_unstake = async (connection: Connection, payer: Signer, liquidUnstakeParam: LiquidUnstakeParam, initParam: InitParam) => {
    const {
        ssol_amount
    } = liquidUnstakeParam;

    const {
        stateAccount,
        ssolMint,
        mint_to,
        solLegPda,
        sSolLeg,
        treasurySsolAccount,
    } = initParam

    const tx = await program.methods.liquidUnstake(ssol_amount)
        .accounts({
            state: stateAccount.publicKey,
            ssolMint: ssolMint,
            liqPoolSolLegPda: solLegPda,
            liqPoolSsolLeg: sSolLeg,
            treasurySsolAccount: treasurySsolAccount,
            getSsolFrom: mint_to,
            getSsolFromAuthority: payer.publicKey,
            transferSolTo: payer.publicKey,
        })
        .signers([payer])
        .transaction()

    // Set fee payer and recent blockhash
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // Simulate the transaction to catch errors
    const simulationResult = await connection.simulateTransaction(tx);
    console.log("Simulation Result:", simulationResult);

    // Send the transaction
    const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
    console.log("Transaction Signature:", sig);
}

export {
    liquid_unstake
}

//? Define the parameters for initializing the state
// interface DepositParam {
//     amount : BN
// }
