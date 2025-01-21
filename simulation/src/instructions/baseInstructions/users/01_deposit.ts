
import { 
    Connection, 
    PublicKey, 
    sendAndConfirmTransaction, 
    Signer 
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { 
    contractAddr, 
    program, 
    stateAccountKeypair, 
    ssolMintKeypair,
    authoritySsolAcc,
    authoritySSolLegAcc,
    solLegPda,
    reservePda,
    sSolLeg,
} from "../../../config";
import { DepositParam } from "../../../types/basicInstructionTypes/user";

export const deposit = async (connection: Connection, user: Signer, depositParam: DepositParam) => {
    const {
        amount 
    } = depositParam;

    const [solLegPda] = PublicKey.findProgramAddressSync([stateAccountKeypair.publicKey.toBuffer(), Buffer.from("liq_sol")], contractAddr)
    const [authoritySsolAcc] = PublicKey.findProgramAddressSync([stateAccountKeypair.publicKey.toBuffer(), Buffer.from("st_mint")], contractAddr)
    const [authoritySSolLegAcc] = PublicKey.findProgramAddressSync([stateAccountKeypair.publicKey.toBuffer(), Buffer.from("liq_st_sol_authority")], contractAddr);
    const [reservePda] = PublicKey.findProgramAddressSync([stateAccountKeypair.publicKey.toBuffer(), Buffer.from("reserve")], contractAddr)
    const userSSolTokenAccount = getAssociatedTokenAddressSync(ssolMintKeypair.publicKey, user.publicKey)

    const tx = await program.methods.deposit(amount)
        .accounts({
            state: stateAccountKeypair.publicKey,
            ssolMint: ssolMintKeypair.publicKey,
            liqPoolSolLegPda: solLegPda,
            liqPoolSsolLeg: sSolLeg,
            liqPoolSsolLegAuthority: authoritySSolLegAcc,
            reservePda: reservePda,
            transferFrom: user.publicKey,
            mintTo: userSSolTokenAccount,
            ssolMintAuthority: authoritySsolAcc,
        })
        .signers([user])
        .transaction()


    // Set fee payer and recent blockhash
    tx.feePayer = user.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    
    try{
        // Simulate the transaction to catch errors
        const simulationResult = await connection.simulateTransaction(tx);
        console.log("deposit: Simulation Result:", simulationResult);

        // Send the transaction
        const sig = await sendAndConfirmTransaction(connection, tx, [user]);
        console.log("deposit: Transaction Signature:", sig);
        const state = await program.account.state.fetch(stateAccountKeypair.publicKey);
        console.log("State Account after depositing to liquidity pool:", state);
    } catch(error) {
        console.log("Error in depositing to liquidity pool: ", error);
        const state = await program.account.state.fetch(stateAccountKeypair.publicKey);
        console.log("State Account after depositing to liquidity pool:", state);
    }
}
//? Define the parameters for initializing the state
// interface DepositParam {
//     amount : BN
// }
