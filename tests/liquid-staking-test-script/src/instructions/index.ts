import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    Signer,
    SystemProgram,
    Transaction
} from "@solana/web3.js";
import { InitParam } from "../types";
import { contractAddr } from "../config";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {
    initialize,
    change_authority,
    add_validator,
    remove_validator,
    set_validator_score,
    config_validator_system,
    deposit,
    deposit_stake_account,
    liquid_unstake,
    add_liquidity,
    remove_liquidity,
    config_lp,
    config_solistic
} from "./basic_instruction";
import { createAtaTx, createMintTrasaction, getInitParam } from "../utils";
import {
    claim,
    deactivate_stake,
    emergency_unstake,
    merge_stakes,
    order_unstake,
    partial_unstake,
    pause,
    realloc_stake_list,
    realloc_validator_list,
    redelegate,
    resume,
    stake_reserve,
    update_active,
    update_deactivated,
    withdraw_stake_account
} from "./advanced_instruction";

const preRequisite = async (connection: Connection, payer: Signer): Promise<InitParam> => {
    const stateAccount = Keypair.generate()
    const stakeList = Keypair.generate()
    const validatorList = Keypair.generate()
    const operationalSolAccount = Keypair.generate()
    const stakeAccount = Keypair.generate()
    const ssolMintKeypair = Keypair.generate()
    const lpMintKeypair = Keypair.generate()
    const ssolMint = ssolMintKeypair.publicKey
    const lpMint = lpMintKeypair.publicKey

    const [authoritySsolAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("st_mint")], contractAddr);
    const [authorityLpAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_mint")], contractAddr);
    const [reservePda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("reserve")], contractAddr);
    const [solLegPda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_sol")], contractAddr);
    const [authoritySSolLegAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_st_sol_authority")], contractAddr);
    const [stakeDepositAuthority] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("deposit")], contractAddr)
    const [stakeWithdrawAuthority] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("withdraw")], contractAddr);
    const treasurySsolAccount = getAssociatedTokenAddressSync(ssolMint, stateAccount.publicKey, true);
    const sSolLeg = getAssociatedTokenAddressSync(ssolMint, authoritySSolLegAcc, true);
    const mint_to = getAssociatedTokenAddressSync(ssolMint, payer.publicKey);
    const mint_to_lp = getAssociatedTokenAddressSync(lpMint, payer.publicKey);
    const burnSsolFrom = getAssociatedTokenAddressSync(ssolMint, payer.publicKey);

    const tx = new Transaction()

    const ssolMintTx = await createMintTrasaction(connection, payer, authoritySsolAcc, null, 9, ssolMintKeypair);
    const lpMintTx = await createMintTrasaction(connection, payer, authorityLpAcc, null, 9, lpMintKeypair);

    tx.add(ssolMintTx).add(lpMintTx)

    const treasurySsolAccountTx = await createAtaTx(
        connection,
        payer,
        ssolMint,
        stateAccount.publicKey
    );

    const sSolLegTx = await createAtaTx(
        connection,
        payer,
        ssolMint,
        authoritySSolLegAcc,
        {},
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
        true
    );

    const mint_toTx = await createAtaTx(connection, payer, ssolMint, payer.publicKey);
    const mint_to_lpTx = await createAtaTx(connection, payer, lpMint, payer.publicKey);

    tx
        .add(treasurySsolAccountTx)
        .add(sSolLegTx)
        .add(mint_toTx)
        .add(mint_to_lpTx)



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

    const sig = await sendAndConfirmTransaction(connection,
        tx,
        [
            payer,
            ssolMintKeypair,
            lpMintKeypair
        ])

    console.log("PreRequisite : ",
        sig);

    const returnValue: InitParam = {
        stateAccount: stateAccount,
        stakeList: stakeList,
        validatorList: validatorList,
        operationalSolAccount: operationalSolAccount,
        stakeAccount: stakeAccount,
        authoritySsolAcc: authoritySsolAcc,
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
        mint_to: mint_to,
        mint_to_lp: mint_to_lp,
        burnSsolFrom: burnSsolFrom,
    }

    getInitParam(returnValue);

    return returnValue
}

export {
    preRequisite,
    initialize,
    change_authority,
    add_validator,
    remove_validator,
    set_validator_score,
    config_validator_system,
    deposit,
    deposit_stake_account,
    liquid_unstake,
    add_liquidity,
    remove_liquidity,
    config_lp,
    config_solistic,
    order_unstake,
    claim,
    stake_reserve,
    update_active,
    update_deactivated,
    deactivate_stake,
    emergency_unstake,
    partial_unstake,
    merge_stakes,
    redelegate,
    pause,
    resume,
    withdraw_stake_account,
    realloc_validator_list,
    realloc_stake_list
}