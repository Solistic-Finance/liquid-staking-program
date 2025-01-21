import { 
    Connection, 
    sendAndConfirmTransaction, 
    Signer, 
    SystemProgram, 
    Transaction 
} from "@solana/web3.js";
import { 
    ASSOCIATED_TOKEN_PROGRAM_ID, 
    getAssociatedTokenAddressSync, 
    TOKEN_PROGRAM_ID 
} from "@solana/spl-token";
import { 
    createAtaTx, 
    createMintTransaction,
} from "../utils";
import { SSolInitParam } from "../types";
import { 
    lpMint, 
    lpMintKeypair, 
    operationalSolAccountKeypair, 
    ssolMint, 
    ssolMintKeypair, 
    stakeListKeypair, 
    stateAccountKeypair, 
    validatorsListKeypair,
    authoritySsolAcc,
    authorityLpAcc,
    reservePda,
    solLegPda,
    authoritySSolLegAcc,
    stakeDepositAuthority,
    stakeWithdrawAuthority,
    treasurySsolAccount,
    sSolLeg,
} from "../config";
   

export const preRequisiteSetup = async (connection: Connection, payer: Signer): Promise<SSolInitParam> => {
    const tx = new Transaction()

    const sSolMintTx = await createMintTransaction(connection, payer, authoritySsolAcc, null, 9, ssolMintKeypair)
    const lpMintTx = await createMintTransaction(connection, payer, authorityLpAcc, null, 9, lpMintKeypair)

    tx.add(sSolMintTx)
      .add(lpMintTx)

    const treasurySSolAccountTx = await createAtaTx(connection, payer, ssolMint, stateAccountKeypair.publicKey)
    const sSolLegTx = await createAtaTx(connection, payer, ssolMint, authoritySSolLegAcc, {}, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, true)
    const payerSSolTokenAccountTx = await createAtaTx(connection, payer, ssolMint, payer.publicKey)
    const payerLpTokenAccountTx = await createAtaTx(connection, payer, lpMint, payer.publicKey)

    tx.add(treasurySSolAccountTx)
      .add(sSolLegTx)
      .add(payerSSolTokenAccountTx)
      .add(payerLpTokenAccountTx)

    if (await connection.getBalance(reservePda) != 2_039_280) {
        tx.add(
            SystemProgram.transfer({
                fromPubkey: payer.publicKey,
                toPubkey: reservePda,
                lamports: 2_039_280,
            }),
        )
    }
    if (await connection.getBalance(solLegPda) != 2_039_280) {
        tx.add(
            SystemProgram.transfer({
                fromPubkey: payer.publicKey,
                toPubkey: solLegPda,
                lamports: 2_039_280,
            }),
        )
    };

    tx.feePayer = payer.publicKey
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    const serialized = tx.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
    })

    const size = serialized.length + 1 + (tx.signatures.length * 64);
    console.log("tx size : ", size);

    try {
        const sig = await sendAndConfirmTransaction(
            connection,
            tx,
            [
                payer,
                ssolMintKeypair,
                lpMintKeypair
            ]
        )
        console.log("PreRequisite : ", sig);
    } catch (error) {
        console.log("Already initialized all the accounts : ", error);
    }

    const returnValue: SSolInitParam = {
        stateAccount: stateAccountKeypair.publicKey,
        stakeList: stakeListKeypair.publicKey,
        validatorList: validatorsListKeypair.publicKey,
        operationalSolAccount: operationalSolAccountKeypair.publicKey,
        authoritySSolAcc: authoritySsolAcc,
        authorityLpAcc: authorityLpAcc,
        reservePda: reservePda,
        solLegPda: solLegPda,
        authoritySSolLegAcc: authoritySSolLegAcc,
        stakeDepositAuthority: stakeDepositAuthority,
        stakeWithdrawAuthority: stakeWithdrawAuthority,
        ssolMint: ssolMint,
        lpMint: lpMint,
        treasurySsolAccount: treasurySsolAccount,
        sSolLeg: sSolLeg,
    }
    
    console.log("stateAccount:", stateAccountKeypair.publicKey.toBase58());
    console.log("stakeList:", stakeListKeypair.publicKey.toBase58());
    console.log("validatorsList:", validatorsListKeypair.publicKey.toBase58());
    console.log("operationalSolAccount:", operationalSolAccountKeypair.publicKey.toBase58());
    console.log("authoritySSolAcc:", authoritySsolAcc.toBase58());
    console.log("authorityLpAcc:", authorityLpAcc.toBase58());
    console.log("reservePda:", reservePda.toBase58());
    console.log("solLegPda:", solLegPda.toBase58());
    console.log("authoritySSolLegAcc:", authoritySSolLegAcc.toBase58());
    console.log("stakeDepositAuthority:", stakeDepositAuthority.toBase58());
    console.log("stakeWithdrawAuthority:", stakeWithdrawAuthority.toBase58());
    console.log("ssolMint:", ssolMint.toBase58());
    console.log("lpMint:", lpMint.toBase58());
    console.log("treasurySsolAccount:", treasurySsolAccount.toBase58());
    console.log("sSolLeg:", sSolLeg.toBase58());
    
    return returnValue
}
