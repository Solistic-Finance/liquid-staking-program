import { PublicKey } from "@solana/web3.js";
import { program } from "../../config";

export async function getDelayedUnstakeTicketsOfUser(user: PublicKey) {
  try {
    const ticketAccountData = await program.account.ticketAccountData.all();
    const tickets = ticketAccountData.filter((ticket) => ticket.account.beneficiary.toBase58() === user.toBase58());
    return tickets.map((ticket) => ({
      ticketAccount: ticket.publicKey.toBase58(),
      beneficiary: ticket.account.beneficiary.toBase58(),
      lamportsAmount: ticket.account.lamportsAmount.toString(),
      createdEpoch: ticket.account.createdEpoch.toString(),
    }));
  } catch (error) {
    console.log("Error in getDelayedUnstakeTicketsOfUser : ", error)
    throw error;
  }
}
