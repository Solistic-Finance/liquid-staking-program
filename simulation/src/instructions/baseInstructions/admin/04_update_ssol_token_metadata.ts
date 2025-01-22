
import { Connection, PublicKey, sendAndConfirmTransaction, Signer, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { contractAddr, program, TOKEN_METADATA_PROGRAM_ID } from "../../../config";
import { UpdateSsolTokenMetadata } from "../../../types/basic_instruction_types";


export const update_ssol_token_metadata = async (connection: Connection, payer: Signer, updateMetadataParams: UpdateSsolTokenMetadata) => {
    const {
        stateAccount,
        ssolMint,
        name,
        symbol,
        uri
    } = updateMetadataParams;
    const [authoritySsolAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("st_mint")], contractAddr);
    const [metadataPDA, _] = await PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          ssolMint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );
    const tx = await program.methods
        .updateSsolTokenMetadata(name, symbol, uri)
        .accounts({
            payer: payer.publicKey,
            state: stateAccount.publicKey,
            ssolMint: ssolMint,
            ssolMintAuthority: authoritySsolAcc,
            ssolMintMetadataAccount: metadataPDA,
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