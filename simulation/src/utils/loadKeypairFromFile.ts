import * as fs from 'fs';
import * as path from 'path';
import { Keypair } from '@solana/web3.js';

export function loadKeypairFromFile(filename: string): Keypair {
    const filePath = path.resolve(__dirname, '../.keys', filename);
    try {
        const keypairString = fs.readFileSync(filePath, 'utf-8');
        const keypairData = JSON.parse(keypairString);
        return Keypair.fromSecretKey(new Uint8Array(keypairData));
    } catch (error) {
        console.error(`Error loading keypair from ${filePath}:`, error);
        throw error;
    }
}