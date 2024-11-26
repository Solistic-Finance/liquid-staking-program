import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { InitParam } from "../types";

const getInitParam = (param: InitParam) => {
    console.log({
        stateAccount: bs58.encode(param.stateAccount.secretKey),
        stakeList: bs58.encode(param.stakeList.secretKey),
        validatorList: bs58.encode(param.validatorList.secretKey),
        operationalSolAccount: bs58.encode(param.operationalSolAccount.secretKey),
        authorityAcc: bs58.encode(param.authorityAcc.secretKey),
        stakeAuthority: bs58.encode(param.stakeAuthority.secretKey),
        stakeAccount: bs58.encode(param.stakeAccount.secretKey),
        authorityMsolAcc: param.authorityMsolAcc.toBase58(),
        authorityLpAcc: param.authorityLpAcc.toBase58(),
        reservePda: param.reservePda.toBase58(),
        solLegPda: param.solLegPda.toBase58(),
        authorityMSolLegAcc: param.authorityMSolLegAcc.toBase58(),
        stakeDepositAuthority: param.stakeDepositAuthority.toBase58(),
        stakeWithdrawAuthority: param.stakeWithdrawAuthority.toBase58(),
        msolMint: param.msolMint.toBase58(),
        lpMint: param.lpMint.toBase58(),
        treasuryMsolAccount: param.treasuryMsolAccount.toBase58(),
        mSolLeg: param.mSolLeg.toBase58(),
        mint_to: param.mint_to.toBase58(),
        burnMsolFrom: param.burnMsolFrom.toBase58(),
    });
}

export {
    getInitParam
}