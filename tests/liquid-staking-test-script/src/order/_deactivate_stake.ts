import { BN } from "bn.js";
import { connection, payer } from "../config";
import { add_validator, deactivate_stake, deposit, deposit_stake_account, emergency_unstake, initialize, partial_unstake, preRequisite, stake_reserve, update_active } from "../instructions";
import { DeactivateStakeParam, EmergencyUnstakeParam, InitializeDataParam, InitParam, StakeReserveParam } from "../types";
import { voteAccount } from "../constant";
import { Keypair, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";

export const _deactivate_stake = async () => {
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

    const addValidatorParam = {
        score: 0,
        voteAccount: voteAccount[0]
    }

    const depositParam = {
        amount: new BN(10000000)
    }
    await deposit(connection, payer, depositParam, initParam)

    await add_validator(connection, payer, addValidatorParam, initParam)

    const depositStakeAccountParam = {
        validatorIndex: 0,
        amount: 2 * 10 ** 9
    }

    await deposit_stake_account(connection, payer, depositStakeAccountParam, initParam)



    const partialUnstakeParam = {
        stake_index: 0,
        validator_index: 0,
        desired_unstake_amount: new BN(10000000),
        splitStakeAccount: Keypair.generate(),
    }
    await partial_unstake(connection, payer, partialUnstakeParam, initParam)

    const updateActiveParam = {
        stake_index: 0,
        validator_index: 0
    }
    await update_active(connection, payer, updateActiveParam, initParam)

    let splitStakeAccount = Keypair.generate()

    const stakeReserveParam : StakeReserveParam = {
        validator_index: 0,
        validatorVote : voteAccount[0]
    }
    const newInitParam : InitParam= {
        ...initParam,
        stakeAccount : splitStakeAccount
    }
    await stake_reserve(connection, payer, stakeReserveParam, newInitParam)

    

    const deactivateStakeParam: DeactivateStakeParam = {
        stake_index: 0,
        validator_index: 0,
        splitStakeAccount: Keypair.generate()
    }
    
    await deactivate_stake(connection, payer, deactivateStakeParam, initParam)
}