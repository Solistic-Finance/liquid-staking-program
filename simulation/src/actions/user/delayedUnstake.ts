import { 
    // connectionDevnet as connection,
    connection, 
    cranker,
    ssolMint, 
} from "../../config";
import { OrderUnstakeParam } from "../../types";
import BN from "bn.js";
import { orderUnstake } from "../../instructions/baseInstructions/users/07_orderUnstake";
import { Keypair } from "@solana/web3.js";

const delayedUnstake = async () => {
    const newTicketAccountKeypair = new Keypair()
    const orderUnstakeParam: OrderUnstakeParam = {
        ssolAmount: new BN(10_000_000),
        newTicketAccount: newTicketAccountKeypair,
    }

    await  orderUnstake(connection, cranker, orderUnstakeParam)
}

delayedUnstake().then(() => {
    console.log("Delayed unstake completed")
}).catch((err) => {
    console.log("Error in delayedUnstake : ", err)
})