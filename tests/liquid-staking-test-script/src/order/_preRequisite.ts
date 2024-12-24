import { connection, payer } from "../config"
import { preRequisite } from "../instructions"

export const _preRequisite = async () => {
    const {
        stateAccount,
        stakeList,
        validatorList,
        operationalSolAccount,
        // authorityAcc,
        // stakeAuthority,
        stakeAccount,
        authoritySsolAcc,
        authorityLpAcc,
        reservePda,
        solLegPda,
        authoritySSolLegAcc,
        stakeDepositAuthority,
        stakeWithdrawAuthority,
        ssolMint,
        lpMint,
        treasurySsolAccount,
        sSolLeg,
        mint_to,
        burnSsolFrom,
    } = await preRequisite(connection, payer)
}
