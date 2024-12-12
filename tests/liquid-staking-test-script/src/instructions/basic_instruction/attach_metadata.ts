import {Connection,PublicKey,sendAndConfirmRawTransaction,Keypair,sendAndConfirmTransaction,Signer,Transaction} from "@solana/web3.js";
import { createCreateMetadataAccountV3Instruction, createMetadataAccountArgsV3Beet } from '@metaplex-foundation/mpl-token-metadata';

import {ASSOCIATED_TOKEN_PROGRAM_ID,createCreateNativeMintInstruction,TOKEN_PROGRAM_ID} from "@solana/spl-token";

const attachMetaDataTxn = async(connection:Connection,payer:Signer,
  mintAuthority: PublicKey,
  keypair = Keypair.generate(),

) => {
  console.log("MSOL MINT KEY FOR METADATA ATTACHMENT ",keypair.publicKey);
  const metadataProgramId = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  const [metadataPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"),metadataProgramId.toBuffer(),keypair.publicKey.toBuffer()],metadataProgramId
  )

  const metadata_details = {
    name:"Marinade-Test Staked SOL",
    symbol:"mTSOL",
    uri:"https://brown-multiple-bass-497.mypinata.cloud/files/bafkreibxt3nxhjdz5imzg7awwhfcivv4uphiesaeiachrwxlzcitfpxddm?X-Algorithm=PINATA1&X-Date=1733578347&X-Expires=30&X-Method=GET&X-Signature=31ca100e62c2cb29e0c4aeaf5e1bc425058e767e7d0075ee3ea69fd158f28bdf",
    sellerFeeBasisPoints:0,
    creators:null,
    collection:null,
    uses:null
  }

  const transaction = new Transaction();

  transaction.add(
    createCreateMetadataAccountV3Instruction(
      {
        metadata:metadataPda,
        mint:keypair.publicKey,
        mintAuthority:mintAuthority,
        payer: payer.publicKey,
        updateAuthority:payer.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          collectionDetails: null,
          data: metadata_details,
          isMutable: true,
        },
      },
    )
  )


  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  )

  console.log(transactionSignature)
}

export {
  attachMetaDataTxn
}