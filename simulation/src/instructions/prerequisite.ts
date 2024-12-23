import { 
    Connection, 
    PublicKey, 
    sendAndConfirmTransaction, 
    Signer, 
    SystemProgram, 
    Transaction 
} from "@solana/web3.js";
import idl from '../../targets/idl/marinade_forking_smart_contract.json';
import { 
    ASSOCIATED_TOKEN_PROGRAM_ID, 
    getAssociatedTokenAddressSync, 
    TOKEN_PROGRAM_ID 
} from "@solana/spl-token";
import { 
    createAtaTx, 
    createMintTransaction,
    loadKeypairFromFile,
} from "../utils";
import { SSolInitParam } from "../types";

export const contractAddr = new PublicKey(idl.metadata.address)
export const stateAccount = loadKeypairFromFile("../../.keys/stateAccount1.json")
export const stakeList = loadKeypairFromFile("../../.keys/stakeList1.json")
export const validatorsList = loadKeypairFromFile("../../.keys/validatorsList1.json")
export const operationalSolAccount = loadKeypairFromFile("../../.keys/operationalSolAccount1.json")
export const stakeAccount = loadKeypairFromFile("../../.keys/stakeAccount1.json")
export const ssolMintKeypair = loadKeypairFromFile("../../.keys/ssolMint1.json")
export const lpMintKeypair = loadKeypairFromFile("../../.keys/lpMint1.json")
export const ssolMint = ssolMintKeypair.publicKey
export const lpMint = lpMintKeypair.publicKey

export const [authoritySsolAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("st_mint")], contractAddr)
export const [authorityLpAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_mint")], contractAddr)
export const [reservePda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("reserve")], contractAddr)
export const [solLegPda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_sol")], contractAddr)
export const [authoritySSolLegAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_st_sol_authority")], contractAddr);
export const [stakeDepositAuthority] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("deposit")], contractAddr)
export const [stakeWithdrawAuthority] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("withdraw")], contractAddr);
export const treasurySsolAccount = getAssociatedTokenAddressSync(ssolMint, stateAccount.publicKey, true)
export const sSolLeg = getAssociatedTokenAddressSync(ssolMint, authoritySSolLegAcc, true)
    

export const preRequisiteSetup = async (connection: Connection, payer: Signer): Promise<SSolInitParam> => {
    const payerSSolTokenAccount = getAssociatedTokenAddressSync(ssolMint, payer.publicKey)
    const payerLpTokenAccount = getAssociatedTokenAddressSync(lpMint, payer.publicKey)
    const burnSSolFrom = getAssociatedTokenAddressSync(ssolMint, payer.publicKey)

    const tx = new Transaction()

    const sSolMintTx = await createMintTransaction(connection, payer, authoritySsolAcc, null, 9, ssolMintKeypair)
    const lpMintTx = await createMintTransaction(connection, payer, authorityLpAcc, null, 9, lpMintKeypair)

    tx.add(sSolMintTx)
      .add(lpMintTx)

    const treasurySSolAccountTx = await createAtaTx(connection, payer, ssolMint, stateAccount.publicKey)
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
        stateAccount: stateAccount.publicKey,
        stakeList: stakeList.publicKey,
        validatorList: validatorsList.publicKey,
        operationalSolAccount: operationalSolAccount.publicKey,
        stakeAccount: stakeAccount.publicKey,
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
        payerSSolTokenAccount: payerSSolTokenAccount,
        payerLpTokenAccount: payerLpTokenAccount,
        burnSsolFrom: burnSSolFrom,
    }
    
    console.log("stateAccount:", stateAccount.publicKey.toBase58());
    console.log("stakeList:", stakeList.publicKey.toBase58());
    console.log("validatorsList:", validatorsList.publicKey.toBase58());
    console.log("operationalSolAccount:", operationalSolAccount.publicKey.toBase58());
    console.log("stakeAccount:", stakeAccount.publicKey.toBase58());
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
    console.log("payerSSolTokenAccount:", payerSSolTokenAccount.toBase58());
    console.log("payerLpTokenAccount:", payerLpTokenAccount.toBase58());
    console.log("burnSsolFrom:", burnSSolFrom.toBase58());
    
    return returnValue
}
