import { AnchorProvider, Program } from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from '../../targets/idl/solistic_staking.json';
import { SolisticStaking, IDL } from "../../targets/types/solistic_staking";
import * as dotenv from 'dotenv';
import { loadKeypairFromFile } from '../utils/loadKeypairFromFile';

import { getAssociatedTokenAddressSync } from '@solana/spl-token';
dotenv.config();

if (!process.env.RPC) throw new Error('RPC is not defined');
if (!process.env.RPC_DEVNET) throw new Error('RPC_DEVNET is not defined');
if (!process.env.ADMIN_PATH) throw new Error('ADMIN_PATH is not defined');
if (!process.env.STATE_ACCOUNT_PATH) throw new Error('STATE_ACCOUNT_PATH is not defined');
if (!process.env.STAKE_LIST_PATH) throw new Error('STAKE_LIST_PATH is not defined');
if (!process.env.VALIDATORS_LIST_PATH) throw new Error('VALIDATORS_LIST_PATH is not defined');
if (!process.env.OPERATIONAL_SOL_ACCOUNT_PATH) throw new Error('OPERATIONAL_SOL_ACCOUNT_PATH is not defined');
if (!process.env.SSOL_MINT_PATH) throw new Error('SSOL_MINT_PATH is not defined');
if (!process.env.LP_MINT_PATH) throw new Error('LP_MINT_PATH is not defined');
if (!process.env.CRANKER_PATH) throw new Error('CRANKER_PATH is not defined');

//admin is also the payer for intializing accounts
export const admin = loadKeypairFromFile(process.env.ADMIN_PATH);
export const wallet = new NodeWallet(admin)

// Use the RPC endpoint of your choice.
export const connection = new Connection(process.env.RPC, { commitment: "finalized" })
export const connectionDevnet = new Connection(process.env.RPC_DEVNET, { commitment: "finalized" })


export const provider = new AnchorProvider(connection, wallet, {});
export const providerDevnet = new AnchorProvider(connectionDevnet, wallet, {});

export const contractAddr = new PublicKey(idl.metadata.address)

export const program = new Program<SolisticStaking>(IDL , contractAddr , provider );
export const programDevnet = new Program<SolisticStaking>(IDL , contractAddr , providerDevnet );

export const multisigVault = new PublicKey("8YAnv5kkPYu4xsMr9YtiaZ4Azjzjw9UXmWtJGPMweycL");
export const multisigPublicKey = new PublicKey("BLEiGCMTEZrcMHDAMVzAKhMKSGHUinXBCqHSdWj9HGf8");

export const multisigDevnetVault = new PublicKey("BNt2xVobQXM4tWF1xXcuE1Ub3B5M44qFJmeZuvd8jRCT");
export const multisigDevnetPublicKey = new PublicKey("7GZEfq9uz4z4zVsDwGEmnNPShrLGxM3rD9QhHbXDczqu");


export const cranker = loadKeypairFromFile(process.env.CRANKER_PATH);
console.log("Cranker : ", cranker.publicKey.toBase58());

export const stateAccountKeypair = loadKeypairFromFile(process.env.STATE_ACCOUNT_PATH)
export const stakeListKeypair = loadKeypairFromFile(process.env.STAKE_LIST_PATH)
export const validatorsListKeypair = loadKeypairFromFile(process.env.VALIDATORS_LIST_PATH)
export const operationalSolAccountKeypair = loadKeypairFromFile(process.env.OPERATIONAL_SOL_ACCOUNT_PATH)
export const ssolMintKeypair = loadKeypairFromFile(process.env.SSOL_MINT_PATH)
export const lpMintKeypair = loadKeypairFromFile(process.env.LP_MINT_PATH)
export const stateAccount = new PublicKey("6WkY9wdYRVcU1kEFwsKy1DEXSQtYw9qViu4d6Phi6cYB")
export const stakeList = new PublicKey("A8NUYkzHwPyWBQcoWgNYjAsVFWAinj3SRJwG9VBjxMZH")
export const validatorsList = new PublicKey("B8jPF5FsjJRteUeSNqd4X7BucubTHnXutRZqphdfSYUr")
export const operationalSolAccount = new PublicKey("6hhhBVVJmaxdqJCSMYP44kooweDrHoStkPQo5wyPrN1s")
export const ssolMint = new PublicKey("SSoLyBn5dEhS7AmqxhMpb3sWDr8sShNtRbjtZTk3pNK")
export const lpMint = new PublicKey("HnFze3Ef6hY48HMyVyHkRTwSrPWmf7e35JeEqtDaEELC")

export const [authoritySsolAcc] = PublicKey.findProgramAddressSync([stateAccount.toBuffer(), Buffer.from("st_mint")], contractAddr)
export const [authorityLpAcc] = PublicKey.findProgramAddressSync([stateAccount.toBuffer(), Buffer.from("liq_mint")], contractAddr)
export const [reservePda] = PublicKey.findProgramAddressSync([stateAccount.toBuffer(), Buffer.from("reserve")], contractAddr)
export const [solLegPda] = PublicKey.findProgramAddressSync([stateAccount.toBuffer(), Buffer.from("liq_sol")], contractAddr)
export const [authoritySSolLegAcc] = PublicKey.findProgramAddressSync([stateAccount.toBuffer(), Buffer.from("liq_st_sol_authority")], contractAddr);
export const [stakeDepositAuthority] = PublicKey.findProgramAddressSync([stateAccount.toBuffer(), Buffer.from("deposit")], contractAddr)
export const [stakeWithdrawAuthority] = PublicKey.findProgramAddressSync([stateAccount.toBuffer(), Buffer.from("withdraw")], contractAddr);
export const sSolLeg = getAssociatedTokenAddressSync(ssolMint, authoritySSolLegAcc, true)
export const treasurySsolAccount = getAssociatedTokenAddressSync(ssolMint, stateAccount, true)
 
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
