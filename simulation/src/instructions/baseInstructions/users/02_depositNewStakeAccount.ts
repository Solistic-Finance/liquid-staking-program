import { 
    Authorized, 
    Connection, 
    Keypair, 
    PublicKey, 
    sendAndConfirmTransaction, 
    Signer, 
    StakeProgram, 
    Transaction,
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { contractAddr, program } from "../../../config";
import { voteAccount } from "../../../voteAccounts";
import { DepositNewStakeParam } from "../../../types/basicInstructionTypes/user";
import { ssolMint, ssolMintKeypair, stakeList, stateAccount, validatorsList } from "../../prerequisite";

export const depositNewStakeAccount = async (
    connection: Connection, 
    user: Signer, 
    stakeAccount: Keypair,
    depositNewStakeParam: DepositNewStakeParam, 
) => {
    const {
        validatorIndex,
        amount
    } = depositNewStakeParam;

    const [authoritySsolAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("st_mint")], contractAddr)
    const userSSolTokenAccount = getAssociatedTokenAddressSync(ssolMint, user.publicKey)

    const validatorVote = voteAccount[validatorIndex];

    const [duplicationFlag] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("unique_validator"), validatorVote.toBuffer()], program.programId)

    const stakeTx = new Transaction()

    stakeTx.add(
        StakeProgram.createAccount(
            {
                authorized: new Authorized(user.publicKey, user.publicKey,),
                fromPubkey: user.publicKey,
                stakePubkey: stakeAccount.publicKey,
                lamports: amount,
            }
        )
    )

    stakeTx.add(
        StakeProgram.delegate({
            stakePubkey: stakeAccount.publicKey,
            authorizedPubkey: user.publicKey,
            votePubkey: validatorVote,
        })
    )

    stakeTx.feePayer = user.publicKey;
    stakeTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    try {
        // Send the transaction
        console.log(" create stake account and delegate to validator");
        const simulationResult = await connection.simulateTransaction(stakeTx);
        console.log("createStakeAccount: Simulation Result:", simulationResult);
    
        const stakeSig = await sendAndConfirmTransaction(connection, stakeTx, [user , stakeAccount]);

        console.log("Delegate Transaction Signature:", stakeSig);

    } catch(error) {
        console.log("Error in creating stake account and delegating to validator: ", error);
    }
    
    const tx = new Transaction()

    tx.add(
        await program.methods.depositStakeAccount(validatorIndex)
            .accounts({
                state: stateAccount.publicKey,
                validatorList: validatorsList.publicKey,
                stakeList: stakeList.publicKey,
                stakeAccount: stakeAccount.publicKey,
                stakeAuthority: user.publicKey,
                duplicationFlag: duplicationFlag,
                rentPayer: user.publicKey,
                msolMint: ssolMintKeypair.publicKey,
                mintTo: userSSolTokenAccount,
                msolMintAuthority: authoritySsolAcc,
                stakeProgram: StakeProgram.programId
            })
            .signers([user])
            .transaction()
    )

    // Set fee payer and recent blockhash
    tx.feePayer = user.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    
    try{
        // Simulate the transaction to catch errors
        const simulationResult = await connection.simulateTransaction(tx);
        console.log("depositNewStakeAccount: Simulation Result:", simulationResult);
        // Send the transaction
        const sig = await sendAndConfirmTransaction(connection, tx, [user], {skipPreflight: true});
        console.log("depositNewStakeAccount: Transaction Signature:", sig);
        const state = await program.account.state.fetch(stateAccount.publicKey);
        console.log("State Account after depositing from new stake account:", state);
    } catch(error) {
        console.log("Error in depositing from new stake account: ", error);
        const state = await program.account.state.fetch(stateAccount.publicKey);
        console.log("State Account after depositing from new stake account:", state);
    }
    
}

//? Define the parameters for initializing the state
// interface DepositParam {
//     amount : BN
// }
