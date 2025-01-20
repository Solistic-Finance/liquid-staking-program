import { AnchorProvider, Program } from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from '../../targets/idl/solistic_staking.json';
import { SolisticStaking, IDL } from "../../targets/types/solistic_staking";
import { config } from 'dotenv';
import { loadKeypairFromFile } from '../utils/loadKeypairFromFile';

config()

const RPC = "https://api.mainnet-beta.solana.com"
const RPC_DEVNET = "https://api.devnet.solana.com"

// Use the RPC endpoint of your choice.
export const payer = loadKeypairFromFile("../../../.keys/AdMkcNdPXBKMofRFN71v6tyJtzdQ2s3x5Snv6DKk3GS2.json")
export const connection = new Connection(RPC, { commitment: "finalized" })
export const connectionDevnet = new Connection(RPC_DEVNET, { commitment: "finalized" })
export const contractAddr = new PublicKey(idl.metadata.address)
export const wallet = new NodeWallet(payer)
export const provider = new AnchorProvider(connection, wallet, {});
export const providerDevnet = new AnchorProvider(connectionDevnet, wallet, {});

export const program = new Program<SolisticStaking>(IDL , contractAddr , provider );
export const programDevnet = new Program<SolisticStaking>(IDL , contractAddr , providerDevnet );

export const multisigVault = new PublicKey("8YAnv5kkPYu4xsMr9YtiaZ4Azjzjw9UXmWtJGPMweycL");
export const multisigPublicKey = new PublicKey("BLEiGCMTEZrcMHDAMVzAKhMKSGHUinXBCqHSdWj9HGf8");

export const multisigDevnetVault = new PublicKey("BNt2xVobQXM4tWF1xXcuE1Ub3B5M44qFJmeZuvd8jRCT");
export const multisigDevnetPublicKey = new PublicKey("7GZEfq9uz4z4zVsDwGEmnNPShrLGxM3rD9QhHbXDczqu");
