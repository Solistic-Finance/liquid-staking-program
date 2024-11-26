import { Keypair, PublicKey } from "@solana/web3.js";
import {
    InitializeAccount,
    InitializeDataParam
} from "./basic_instruction_types"

interface InitParam {
    stateAccount: Keypair,
    stakeList: Keypair,
    validatorList: Keypair,
    operationalSolAccount: Keypair,
    authorityAcc: Keypair,
    stakeAuthority: Keypair,
    stakeAccount: Keypair,
    authorityMsolAcc: PublicKey,
    authorityLpAcc: PublicKey,
    reservePda: PublicKey,
    solLegPda: PublicKey,
    authorityMSolLegAcc: PublicKey,
    stakeDepositAuthority: PublicKey,
    stakeWithdrawAuthority: PublicKey,
    msolMint: PublicKey,
    lpMint: PublicKey,
    treasuryMsolAccount: PublicKey,
    mSolLeg: PublicKey,
    mint_to: PublicKey,
    burnMsolFrom: PublicKey,
}

export {
    InitParam,
    InitializeAccount,
    InitializeDataParam
}