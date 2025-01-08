import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../target/types/solistic_staking";
import {
    PublicKey,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
    authorityAcc,
    connection,
    lpMint,
    sSolLeg,
    ssolMint,
    operationalSolAccount,
    payer,
    stakeList,
    stateAccount,
    treasurySsolAccount,
    validatorList
} from ".";



describe("solistic-staking", () => {

    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolisticStaking as Program<SolisticStaking>;

    const [reservePda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("reserve")], program.programId);
    const [solLegPda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_sol")], program.programId);

    // * -------------------------------------------------------------------------------------
    // *  Base Instructions
    // * -------------------------------------------------------------------------------------
    // * initialize : initialize State Account
    // * 
    // * ================== Required ===================
    // * This is called at first and only once
    // * If it is invoked again , it could be failed
    // * 
    // * ===============================================
    // * Tx Route : initialize
    // * -------------------------------------------------------------------------------------

    it("initialize", async () => {

        //? Define the parameters for initializing the state
        const initializeData = {
            adminAuthority: authorityAcc.publicKey,
            validatorManagerAuthority: payer.publicKey,
            minStake: new anchor.BN(10000000), // Example value
            rewardsFee: { numerator: 1, denominator: 100 }, // 1%
            liqPool: {
                lpLiquidityTarget: new anchor.BN(50000000000),
                lpMaxFee: { basisPoints: new anchor.BN(1) },
                lpMinFee: { basisPoints: new anchor.BN(1) },
                lpTreasuryCut: { basisPoints: new anchor.BN(1) },
            },
            additionalStakeRecordSpace: 3,
            additionalValidatorRecordSpace: 3,
            slotsForStakeDelta: new anchor.BN(3000),
            pauseAuthority: payer.publicKey,
        };

        const tx = await program.methods
            //  @ts-ignore
            .initialize(initializeData)
            .accounts({
                state: stateAccount.publicKey,
                reservePda: reservePda,
                ssolMint: ssolMint,
                stakeList: stakeList.publicKey,
                validatorList: validatorList.publicKey,
                operationalSolAccount: operationalSolAccount.publicKey,
                treasurySsolAccount: treasurySsolAccount,
                liqPool: {
                    lpMint: lpMint,
                    solLegPda: solLegPda,
                    ssolLeg: sSolLeg,
                },
                clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .preInstructions([
                await program.account.state.createInstruction(stateAccount),
                await program.account.state.createInstruction(stakeList),
                await program.account.state.createInstruction(validatorList)
            ])
            .transaction()


        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const simulationResult = await connection.simulateTransaction(tx);
        console.log("Simulation Result:", simulationResult);

        const sig = await sendAndConfirmTransaction(connection, tx, [payer, stateAccount, stakeList, validatorList]);
        console.log("Transaction Signature:", sig);

        const state = await program.account.state.fetch(stateAccount.publicKey);
        console.log("State Account:", state);
    });

});
