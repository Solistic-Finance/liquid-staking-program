import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { InitParam } from "../types";

const getInitParam = (param: InitParam) => {
    console.log({
        stateAccount: `${param.stateAccount.publicKey.toBase58()} ${bs58.encode(param.stateAccount.secretKey)}`,
        stakeList: `${param.stakeList.publicKey.toBase58()} ${bs58.encode(param.stakeList.secretKey)}`,
        validatorList: `${param.validatorList.publicKey.toBase58()} ${bs58.encode(param.validatorList.secretKey)}`,
        operationalSolAccount: `${param.operationalSolAccount.publicKey.toBase58()} ${bs58.encode(param.operationalSolAccount.secretKey)}`,
        stakeAccount: `${param.stakeAccount.publicKey.toBase58()} ${bs58.encode(param.stakeAccount.secretKey)}`,
        authoritySsolAcc: param.authoritySsolAcc.toBase58(),
        authorityLpAcc: param.authorityLpAcc.toBase58(),
        reservePda: param.reservePda.toBase58(),
        solLegPda: param.solLegPda.toBase58(),
        authoritySSolLegAcc: param.authoritySSolLegAcc.toBase58(),
        stakeDepositAuthority: param.stakeDepositAuthority.toBase58(),
        stakeWithdrawAuthority: param.stakeWithdrawAuthority.toBase58(),
        ssolMint: param.ssolMint.toBase58(),
        lpMint: param.lpMint.toBase58(),
        treasurySsolAccount: param.treasurySsolAccount.toBase58(),
        sSolLeg: param.sSolLeg.toBase58(),
        mint_to: param.mint_to.toBase58(),
        burnSsolFrom: param.burnSsolFrom.toBase58(),
    });
}

export {
    getInitParam
}