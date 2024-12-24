import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../target/types/solistic_staking";
import {
    Keypair,
    PublicKey,
    Connection,
    sendAndConfirmTransaction,
    Transaction,
    StakeProgram,
    SystemProgram,
    Authorized,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    createAssociatedTokenAccount,
} from '@solana/spl-token';
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { connection, payer, stateAccount, voteAccount } from ".";

describe("solistic-staking", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolisticStaking as Program<SolisticStaking>;

    let ssolMint: PublicKey;
    let sSolLeg: PublicKey;
    let lpMint: PublicKey;
    let treasurySsolAccount: PublicKey;

    const [authoritySsolAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("st_mint")], program.programId);
    const [reservePda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("reserve")], program.programId);
    const [authorityLpAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_mint")], program.programId);
    const [authoritySSolLegAcc] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_st_sol_authority")], program.programId);
    const [solLegPda] = PublicKey.findProgramAddressSync([stateAccount.publicKey.toBuffer(), Buffer.from("liq_sol")], program.programId);

    const stakeAccount = Keypair.generate()
    const stakeAccount1 = Keypair.generate()

    const validatorVote = voteAccount[0]

    // * -------------------------------------------------------------------------------------
    // *  Base Instructions
    // * -------------------------------------------------------------------------------------
    // * Advanced instructions: deposit-stake-account, Delayed-Unstake
    // * backend/bot "crank" related functions:
    // * order_unstake (starts stake-account deactivation)
    // * withdraw (delete & withdraw from a deactivated stake-account)
    // * -------------------------------------------------------------------------------------

    it("initialize", async () => {

        ssolMint = await createMint(connection, payer, authoritySsolAcc, null, 9);

        lpMint = await createMint(connection, payer, authorityLpAcc, null, 9);

        treasurySsolAccount = (await getOrCreateAssociatedTokenAccount(connection, payer, ssolMint, stateAccount.publicKey)).address;

        sSolLeg = (await getOrCreateAssociatedTokenAccount(connection, payer, ssolMint, authoritySSolLegAcc, true)).address;

        if (await connection.getBalance(reservePda) != 2_039_280) {

            const reservePdaTx = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: payer.publicKey,
                    toPubkey: reservePda,
                    lamports: 2_039_280,
                }),
            )

            const reservePdaTxSig = await sendAndConfirmTransaction(connection, reservePdaTx, [payer]);
        }

        if (await connection.getBalance(solLegPda) != 2_039_280) {

            const solLegPdaTx = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: payer.publicKey,
                    toPubkey: solLegPda,
                    lamports: 2_039_280,
                }),
            )

            const solLegPdaTxSig =  await sendAndConfirmTransaction(connection, solLegPdaTx, [payer]);
        };


        // // Create associated token account for minting
        const mint_to = await createAssociatedTokenAccount(connection, payer, ssolMint, payer.publicKey);

        const burnSsolFrom = (await getOrCreateAssociatedTokenAccount(connection, payer, ssolMint, payer.publicKey)).address

    })


    it("deposit_stake_account", async () => {

        console.log("balance : ", stakeAccount.publicKey);

        let stakeBalance = await connection.getBalance(stakeAccount.publicKey);
        console.log(`Stake account balance: ${stakeBalance / LAMPORTS_PER_SOL} SOL`);
        const transaction1 = StakeProgram.delegate({
            stakePubkey: stakeAccount.publicKey,
            authorizedPubkey: payer.publicKey,
            votePubkey: validatorVote,
        });
        const sig1 = await sendAndConfirmTransaction(connection, transaction1, [payer, stakeAccount])

        console.log("init stake account : ", sig1);

        console.log("===============> ", await connection.getParsedAccountInfo(stakeAccount.publicKey));
    })

    it("deposit_stake_account", async () => {

        console.log("balance : ", stakeAccount1.publicKey);

        let stakeBalance = await connection.getBalance(stakeAccount1.publicKey);
        console.log(`Stake account balance: ${stakeBalance / LAMPORTS_PER_SOL} SOL`);
        const transaction1 = StakeProgram.delegate({
            stakePubkey: stakeAccount1.publicKey,
            authorizedPubkey: payer.publicKey,
            votePubkey: validatorVote,
        });
        const sig1 = await sendAndConfirmTransaction(connection, transaction1, [payer, stakeAccount1])

        console.log("init stake account : ", sig1);

        console.log("===============> ", await connection.getParsedAccountInfo(stakeAccount1.publicKey));
    })

    
    it("deposit_stake_account", async () => {


        console.log("===============> ", await connection.getParsedAccountInfo(stakeAccount.publicKey));
        console.log(await connection.getBalance(payer.publicKey));

        // Create a transaction to initialize the stake account
        const transaction = StakeProgram.createAccount(
            {
                authorized: new Authorized(payer.publicKey, payer.publicKey,),
                fromPubkey: payer.publicKey,
                stakePubkey: stakeAccount.publicKey,
                lamports: 9 * (10 ** 9),
            }
        )

        const sig0 = await sendAndConfirmTransaction(connection, transaction, [payer, stakeAccount])
        // console.log("init stake account : ", sig0);
        // Check our newly created stake account balance. This should be 0.5 SOL.

        console.log("balance : ", stakeAccount.publicKey);

        let stakeBalance = await connection.getBalance(stakeAccount.publicKey);
        console.log(`Stake account balance: ${stakeBalance / LAMPORTS_PER_SOL} SOL`);
        console.log("666666666666666666666666666666666666666666666");
        const transaction1 = StakeProgram.delegate({
            stakePubkey: stakeAccount.publicKey,
            authorizedPubkey: payer.publicKey,
            votePubkey: validatorVote,
        });
        const sig1 = await sendAndConfirmTransaction(connection, transaction1, [payer, stakeAccount])

        console.log("init stake account : ", sig1);

        console.log("===============> ", await connection.getParsedAccountInfo(stakeAccount.publicKey));
    })
})

