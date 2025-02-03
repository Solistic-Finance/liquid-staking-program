
import { 
    Connection, 
    sendAndConfirmTransaction, 
    Signer 
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { program } from "../../../config";
import { OrderUnstakeParam } from "../../../types";
import { ssolMint, stateAccount } from "../../../config";

export const orderUnstake = async (connection: Connection, user: Signer, orderUnstakeParam: OrderUnstakeParam) => {

    const burnSSolFrom = getAssociatedTokenAddressSync(ssolMint, user.publicKey)

    const {
        ssolAmount,
        newTicketAccount
    } = orderUnstakeParam

    const tx = await program.methods.orderUnstake(ssolAmount)
        .accounts({
            state: stateAccount,
            ssolMint: ssolMint,
            burnSsolFrom: burnSSolFrom,
            burnSsolAuthority: user.publicKey,
            newTicketAccount: newTicketAccount.publicKey
        })
        .preInstructions([
            await program.account.ticketAccountData.createInstruction(newTicketAccount)
        ])
        .signers([user])
        .transaction()

    // Set fee payer and recent blockhash
    tx.feePayer = user.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // Simulate the transaction to catch errors
    // const simulationResult = await connection.simulateTransaction(tx);
    // console.log("Simulation Result:", simulationResult);

    // Send the transaction
    const sig = await sendAndConfirmTransaction(connection, tx, [user, newTicketAccount], {skipPreflight: true});
    console.log("Transaction Signature:", sig);
}
//? Define the parameters for initializing the state
// const initializeData : InitializeDataParam = {
//     adminAuthority: authorityAcc.publicKey,
//     validatorManagerAuthority: user.publicKey,
//     minStake: new BN(10000000), // Example value
//     rewardsFee: { numerator: 1, denominator: 100 }, // 1%
//     liqPool: {
//         lpLiquidityTarget: new BN(50000000000),
//         lpMaxFee: { basisPoints: new BN(1) },
//         lpMinFee: { basisPoints: new BN(1) },
//         lpTreasuryCut: { basisPoints: new BN(1) },
//     },
//     additionalStakeRecordSpace: 3,
//     additionalValidatorRecordSpace: 3,
//     slotsForStakeDelta: new BN(3000),
//     pauseAuthority: user.publicKey,
// };