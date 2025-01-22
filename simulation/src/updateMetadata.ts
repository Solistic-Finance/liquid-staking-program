import { BN } from "bn.js";
import { connection, admin, stateAccountKeypair, ssolMint, lpMint } from "./config";
import { update_ssol_token_metadata, update_lp_mint_token_metadata } from "./instructions/baseInstructions/admin";
import { UpdateSsolTokenMetadata } from "./types/basic_instruction_types";
import { UpdateLpMintTokenMetadata } from "./types/basic_instruction_types";

export const _update_ssol_and_lp_mint_token_metadata = async () => {
    
    const updateSsolTokenMetadataData: UpdateSsolTokenMetadata = {
        stateAccount: stateAccountKeypair,
        ssolMint: ssolMint,
        name: "Solistic Staked SOL",
        symbol: "sSOL",
        uri: "https://gray-binding-louse-683.mypinata.cloud/ipfs/bafkreiegsx4wesvcv2j3uxusbdv4r2sscgmt7hh34ol7gwuosquppjdecm",
    }
    await update_ssol_token_metadata(connection, admin, updateSsolTokenMetadataData)


    const updateLpMintTokenMetadataData: UpdateLpMintTokenMetadata = {
        stateAccount: stateAccountKeypair,
        lpMint: lpMint,
        name: "Solistic Staked SOL LP",
        symbol: "sSOL-LP",
        uri: "https://gray-binding-louse-683.mypinata.cloud/ipfs/bafkreigt3l2xbnux5qqxkkr7bhmekblm3i7q7ibweil5edmryrldosbga4"
    }
    await update_lp_mint_token_metadata(connection, admin, updateLpMintTokenMetadataData)
}