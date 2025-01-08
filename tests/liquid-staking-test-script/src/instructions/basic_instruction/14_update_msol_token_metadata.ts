
import { Connection, PublicKey, sendAndConfirmTransaction, Signer, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { contractAddr, program } from "../../config";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { UpdateSsolTokenMetadata } from "../../types/basic_instruction_types";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

const update_ssol_token_metadata = async (connection: Connection, payer: Signer, updateMetadataParams: UpdateSsolTokenMetadata) => {
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
        //  @ts-ignore
        .updateSsolTokenMetadata(name, symbol, uri)
        .accounts({
            payer: payer.publicKey,
            state: stateAccount.publicKey,
            ssolMint: ssolMint,
            ssolMintAuthority: authoritySsolAcc,
            ssolMintMetadataAccount: metadataPDA,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
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

export {
    update_ssol_token_metadata
}
