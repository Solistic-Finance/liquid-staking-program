import { BN } from "bn.js"
import { connection, payer } from "../config"
import { initialize, preRequisite } from "../instructions"
import { InitializeDataParam } from "../types"
import { add_validator, remove_validator } from "../instructions/basic_instruction"
import { voteAccount } from "../constant"
import { set_validator_score } from "../instructions/basic_instruction/05_set_validator_score"

export const _set_validator_score = async () => {
    const initParam = await preRequisite(connection, payer)

    const {
        authorityAcc,
    } = initParam

    const initializeData: InitializeDataParam = {
        adminAuthority: authorityAcc.publicKey,
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

    const addValidatorParam = {
        score: 2,
        voteAccount: voteAccount[2]
    }

    await add_validator(connection, payer, addValidatorParam, initParam)

    //? index should be less than boundery
    //! AnchorError caused by account: validator_list. Error Code: ListIndexOutOfBounds. Error Number: 6073. Error Message: List index out of bounds.

    const setValidatorScoreParam = {
        index: 0,   //  1 => error
        validatorVote: voteAccount[2],
        score: 3
    }

    await set_validator_score(connection, payer, setValidatorScoreParam, initParam)
}
