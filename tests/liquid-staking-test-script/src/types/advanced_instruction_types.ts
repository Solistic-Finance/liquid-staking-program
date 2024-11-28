import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

interface OrderUnstakeParam {
    msol_amount : BN,
    newTicketAccount : Keypair
}

interface ClaimParam {
    newTicketAccount : Keypair
}

interface StakeReserveParam {
    validator_index : number,
    validatorVote : PublicKey
}

interface UpdateActiveParam {
    stake_index : number,
    validator_index : number
}

interface UpdateDeactivatedParam {
    stake_index : number,
}

interface DeactivateStakeParam {
    stake_index : number,
    validator_index : number,
    splitStakeAccount : Keypair
}

export {
    OrderUnstakeParam,
    ClaimParam,
    StakeReserveParam,
    UpdateActiveParam,
    UpdateDeactivatedParam,
    DeactivateStakeParam
}