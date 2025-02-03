import { program } from "../../config";

export async function getAllDelayedUnstakeTickets() {
    try {
      const ticketAccountData = await program.account.ticketAccountData.all();
      return ticketAccountData.map((ticket) => ({
        ticketAccount: ticket.publicKey.toBase58(),
        beneficiary: ticket.account.beneficiary.toBase58(),
        lamportsAmount: ticket.account.lamportsAmount.toString(),
        createdEpoch: ticket.account.createdEpoch.toString(),
      }));
    } catch (error) {
      console.log("Error in getAllDelayedUnstakeTickets : ", error)
      throw error;
    }
}

getAllDelayedUnstakeTickets().then((tickets) => {
  console.log(tickets);
});
