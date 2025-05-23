
import { 
    Connection, 
    PublicKey, 
    sendAndConfirmTransaction, 
    Signer, 
    StakeProgram, 
    Transaction 
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { 
    program, 
    ssolMint, 
    stateAccount, 
    stakeList, 
    validatorsList,
    authoritySsolAcc
} from "../../../config";
import { voteAccount } from "../../../voteAccounts";
import { createAtaTx } from "../../../utils";
import { DepositExistingStakeParam } from "../../../types";

export const depositExistingStakeAccount = async (
    connection: Connection, 
    user: Signer, 
    stakeAccount: PublicKey,
    depositExistingStakeParam: DepositExistingStakeParam, 
) => {
    const {
        validatorIndex,
    } = depositExistingStakeParam;

    const userSSolTokenAccount = getAssociatedTokenAddressSync(ssolMint, user.publicKey)

    const validatorVote = voteAccount[validatorIndex];

    const [duplicationFlag] = PublicKey.findProgramAddressSync([stateAccount.toBuffer(), Buffer.from("unique_validator"), validatorVote.toBuffer()], program.programId)
    
    const tx = new Transaction()
    
    // check userSolTokenAccount is created or not by checking the lamports
    const usersSolTokenAccountInfo = await connection.getAccountInfo(userSSolTokenAccount);
    if(usersSolTokenAccountInfo?.lamports === 0) {
        const userSSolTokenAccountTx = await createAtaTx(connection, user, ssolMint, user.publicKey)
        tx.add(userSSolTokenAccountTx)
    }
    
    tx.add(
        await program.methods.depositStakeAccount(validatorIndex)
            .accounts({
                state: stateAccount,
                validatorList: validatorsList,
                stakeList: stakeList,
                stakeAccount: stakeAccount,
                stakeAuthority: user.publicKey,
                duplicationFlag: duplicationFlag,      //  Double check
                rentPayer: user.publicKey,
                ssolMint: ssolMint,
                mintTo: userSSolTokenAccount,
                ssolMintAuthority: authoritySsolAcc,
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
        // const simulationResult = await connection.simulateTransaction(tx);
        // console.log("depositExistingStakeAccount: Simulation Result:", simulationResult);
        // Send the transaction
        const sig = await sendAndConfirmTransaction(connection, tx, [user], {skipPreflight: true});
        console.log("depositExistingStakeAccount: Transaction Signature:", sig);
        const state = await program.account.state.fetch(stateAccount);
        console.log("State Account after depositing from existing stake account:", state);
    } catch(error) {
        console.log("Error in depositing from existing stake account: ", error);
        const state = await program.account.state.fetch(stateAccount);
        console.log("State Account after depositing from existing stake account:", state);
    }
    
}
//? Define the parameters for initializing the state
// interface DepositParam {
//     amount : BN
// }
