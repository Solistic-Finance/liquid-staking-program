import { deposit } from "../../instructions/baseInstructions/users/01_deposit";
import { 
    // connectionDevnet as connection,
    connection, 
    cranker,
    ssolMint, 
} from "../../config";
import { DepositParam } from "../../types";
import BN from "bn.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccount, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { sendAndConfirmTransaction, Transaction } from "@solana/web3.js";

const depositSol = async () => {
    // check if the userSSolTokenAccount is already created
    const userSSolTokenAccount = getAssociatedTokenAddressSync(
        ssolMint,
        cranker.publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );
    console.log("User SSOL Token Account : ", userSSolTokenAccount.toBase58())
    const accountExists = await connection.getAccountInfo(userSSolTokenAccount);
    console.log("Account exists : ", accountExists);
    const transaction = new Transaction();
    if (!accountExists) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            cranker.publicKey,
            userSSolTokenAccount,
            cranker.publicKey,
            ssolMint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
        transaction.feePayer = cranker.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        try{
            const sig = await sendAndConfirmTransaction(connection, transaction, [cranker], {skipPreflight: true});
            console.log("User SSOL Token Account created:", sig)
        } catch(error){
            console.log("Error in creating User SSOL Token Account:", error)
        }
      } 
    const depositParam: DepositParam = {
        amount: new BN(10_000_000)
    }

    await  deposit(connection, cranker, depositParam)
}

depositSol().then(() => {
    console.log("Deposit Sol completed")
}).catch((err) => {
    console.log("Error in depositSol : ", err)
})