
import { Connection, PublicKey, sendAndConfirmTransaction, Signer, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { contractAddr, program, TOKEN_METADATA_PROGRAM_ID } from "../../../config";
import { UpdateLpMintTokenMetadata } from "../../../types/basicInstructionTypes";


export const update_lp_mint_token_metadata = async (connection: Connection, payer: Signer, updateMetadataParams: UpdateLpMintTokenMetadata) => {
    const {
        stateAccount,
        lpMint,
        name,
        symbol,
        uri
    } = updateMetadataParams;
    const [authorityLpAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_mint")], contractAddr);
    const [metadataPDA, _] = await PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          lpMint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );
    const tx = await program.methods
        .updateLpTokenMetadata(name, symbol, uri)
        .accounts({
            payer: payer.publicKey,
            state: stateAccount.publicKey,
            lpMint: lpMint,
            lpMintAuthority: authorityLpAcc,
            lpMintMetadataAccount: metadataPDA,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
            metadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .transaction()


    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const simulationResult = await connection.simulateTransaction(tx);
    console.log("Simulation Result:", simulationResult);

    const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
    console.log("Transaction Signature:", sig);

}