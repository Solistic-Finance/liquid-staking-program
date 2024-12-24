import { AnchorProvider, Program } from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import idl from '../../targets/idl/solistic_staking.json';
import { SolisticStaking, IDL } from "../../targets/types/solistic_staking";
import { config } from 'dotenv';
import { loadKeypairFromFile } from '../utils/loadKeypairFromFile';

config()

const RPC = "https://api.devnet.solana.com"

// Use the RPC endpoint of your choice.
const payer = loadKeypairFromFile("../../.keys/solisticDevAdmin.json")
const connection = new Connection(RPC, { commitment: "finalized" })
const contractAddr = new PublicKey(idl.metadata.address)
const wallet = new NodeWallet(payer)
const provider = new AnchorProvider(connection, wallet, {});

const program = new Program<SolisticStaking>(IDL , contractAddr , provider );

export {
    program,
    payer,
    connection,
    contractAddr
}