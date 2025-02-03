import { claim } from "../../instructions/baseInstructions/users/05_claim";
import { 
    // connectionDevnet as connection,
    connection, 
    cranker, 
} from "../../config";
import { getDelayedUnstakeTicketsOfUser } from "../getters/getDelayedUnstakeTickets";
import { PublicKey } from "@solana/web3.js";
import { ClaimParam } from "../../types/basicInstructionTypes/user";

const claimUnstakedTicket = async () => {
    try {
        const tickets = await getDelayedUnstakeTicketsOfUser(cranker.publicKey)
        console.log("Tickets : ", tickets)
        const claimParam: ClaimParam = {
            newTicketAccount: new PublicKey(tickets[0].ticketAccount)
        }
        await  claim(connection, cranker, claimParam)
    } catch (error) {
        console.log("Error in claimUnstakedTicket : ", error)
    }
}

claimUnstakedTicket().then(() => {
    console.log("Claim Unstaked Ticket completed")
}).catch((err) => {
    console.log("Error in claimUnstakedTicket : ", err)
})