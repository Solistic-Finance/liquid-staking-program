import { BN } from "bn.js";
import { connection, payer } from "../config";
import { initialize, preRequisite } from "../instructions";
import { InitializeDataParam } from "../types";
import { update_msol_token_metadata } from "../instructions/basic_instruction";
import { UpdateMsolTokenMetadata } from "../types/basic_instruction_types";
import { update_lp_mint_token_metadata } from "../instructions/basic_instruction";
import { UpdateLpMintTokenMetadata } from "../types/basic_instruction_types";

export const _update_msol_and_lp_mint_token_metadata = async () => {
    const initParam = await preRequisite(connection, payer)

    const initializeData: InitializeDataParam = {
        adminAuthority: payer.publicKey,
        validatorManagerAuthority: payer.publicKey,
        minStake: new BN(10000000), // Example value
        rewardsFee: { numerator: 1, denominator: 100 }, // 1%
        liqPool: {
            lpLiquidityTarget: new BN(50000000000),
            lpMaxFee: { basisPoints: new BN(1) },
            lpMinFee: { basisPoints: new BN(1) },
            lpTreasuryCut: { basisPoints: new BN(1) },
        },
        additionalStakeRecordSpace: 3,
        additionalValidatorRecordSpace: 3,
        slotsForStakeDelta: new BN(3000),
        pauseAuthority: payer.publicKey,
    };

    await initialize(connection, payer, initializeData, initParam)

    const updateMsolTokenMetadataData: UpdateMsolTokenMetadata = {
        stateAccount: initParam.stateAccount,
        msolMint: initParam.msolMint,
        name: "Solistic Staked SOL",
        symbol: "sSOL",
        uri: "https://brown-multiple-bass-497.mypinata.cloud/ipfs/bafkreid25ituozgyh7ort3ydznntqojzu2lwh22b5zuc763mwbwkbtvbxa",
    }
    await update_msol_token_metadata(connection, payer, updateMsolTokenMetadataData)


    const updateLpMintTokenMetadataData: UpdateLpMintTokenMetadata = {
        stateAccount: initParam.stateAccount,
        lpMint: initParam.lpMint,
        name: "Solistic Lp Mint",
        symbol: "sSOL-LP",
        uri: "https://brown-multiple-bass-497.mypinata.cloud/ipfs/bafkreiahtjmigpml6uipv3iwxgek4vlulj4dyicwvpmor54mnv6ethvcki"
    }
    await update_lp_mint_token_metadata(connection, payer, updateLpMintTokenMetadataData)
}