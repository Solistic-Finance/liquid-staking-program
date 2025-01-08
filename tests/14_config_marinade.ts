import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../target/types/solistic_staking";
import {
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import { BN } from "bn.js";
import {
    authorityAcc,
    connection,
    payer,
    stateAccount
} from ".";

describe("solistic-staking", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolisticStaking as Program<SolisticStaking>;

    // * -------------------------------------------------------------------------------------
    // *  Base Instructions
    // * -------------------------------------------------------------------------------------
    // * config_solistic : config solistic from liq pool
    // * 
    // * ================== Required ===================
    // * State state should be "resume"
    // * 
    // * 
    // * ===============================================
    // * Tx Route : initialize / config_solistic
    // * -------------------------------------------------------------------------------------

    it("config_solistic", async () => {

        const configSolisticParam = {
            rewardsFee: { basisPoints: new BN(1) },
            slotsForStakeDelta: new BN(5000),
            minStake: new BN(20000000),
            minDeposit: new BN(3),
            minWithdraw: new BN(4),
            stakingSolCap: new BN(5),
            liquiditySolCap: new BN(6),
            withdrawStakeAccountEnabled: true,
            delayedUnstakeFee: { bpCents: new BN(7) },
            withdrawStakeAccountFee: { bpCents: new BN(8) },
            maxStakeMovedPerEpoch: { basisPoints: new BN(9) },
        };

        const tx = await program.methods.configSolistic(configSolisticParam)
            .accounts({
                state: stateAccount.publicKey,
                adminAuthority: authorityAcc.publicKey,
            })
            .signers([authorityAcc])
            .transaction()

        // Set fee payer and recent blockhash
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        // Simulate the transaction to catch errors
        const simulationResult = await connection.simulateTransaction(tx);
        console.log("Simulation Result:", simulationResult);

        // Send the transaction
        const sig = await sendAndConfirmTransaction(connection, tx, [payer, authorityAcc]);
        console.log("Transaction Signature:", sig);
    })
});
