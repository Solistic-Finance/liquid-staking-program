import { 
    stakeReserve 
} from "./instructions/advanceInstructions/cranks";
import { voteAccount } from "./voteAccounts";
import { StakeReserveParam } from "./types";
import { 
    // connectionDevnet as connection,
    connection, 
    admin, 
    cranker,
} from "./config";
import { Keypair } from "@solana/web3.js";

const crankStakeReserve = async () => {
    const newStakeAccount1 = Keypair.generate()

    const stakeReserveParam1 : StakeReserveParam = {
        validatorIndex: 0,
        validatorVote : voteAccount[0]
    }

    await stakeReserve(connection, cranker, newStakeAccount1, stakeReserveParam1)

    const newStakeAccount2 = Keypair.generate()

    const stakeReserveParam2 : StakeReserveParam = {
        validatorIndex: 1,
        validatorVote : voteAccount[1]
    }
    await stakeReserve(connection, cranker, newStakeAccount2, stakeReserveParam2)

    const newStakeAccount3 = Keypair.generate()

    const stakeReserveParam3 : StakeReserveParam = {
        validatorIndex: 2,
        validatorVote : voteAccount[2]
    }

    await stakeReserve(connection, cranker, newStakeAccount3, stakeReserveParam3)

}

crankStakeReserve().then(() => {
    console.log("Simulation completed")
}).catch((err) => {
    console.log("Error in simulation : ", err)
})