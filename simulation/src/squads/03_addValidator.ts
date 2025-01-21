
import { Connection, PublicKey, Signer } from "@solana/web3.js";
import { connectionDevnet as connection, 
    // connection, 
    programDevnet as program,
    // program,
    multisigDevnetPublicKey as multisigPublicKey,
    // multisigPublicKey, 
    admin,
    stateAccountKeypair,
    validatorsListKeypair
} from "../config";
import { AddValidatorParam } from "../types";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

export const getAddValidatorTx = async (
    connection: Connection, 
    payer: Signer, 
    addValidatorParam: AddValidatorParam
) : Promise<string> => {
    const {
        score,
        voteAccount
    } = addValidatorParam

    const [duplicationFlag] = PublicKey.findProgramAddressSync([stateAccountKeypair.publicKey.toBuffer(), Buffer.from("unique_validator"), voteAccount.toBuffer()], program.programId)

    const tx = await program.methods
        .addValidator(score)
        .accounts({
            state: stateAccountKeypair.publicKey,
            managerAuthority: multisigPublicKey,
            validatorList: validatorsListKeypair.publicKey,
            validatorVote: voteAccount,
            duplicationFlag: duplicationFlag,
            rentPayer: payer.publicKey,
        })
        .transaction()

    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.sign(payer)
    let base58Tx = bs58.encode(tx.serialize());
    return base58Tx
}
// ? Define the parameters for initializing the state

const addValidator = async () => {
    const addValidatorParam = {
        score: 2,
        voteAccount: new PublicKey("GREEDkgav1ox1jYyd9Anv6exLqKV2vYnxMw5prGwmNKc")
    }
    
    const tx = await getAddValidatorTx(connection, admin, addValidatorParam)
    console.log(tx)
}

addValidator()