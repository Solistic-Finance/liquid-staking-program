import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolisticLiquidStaking } from "../target/types/solistic_liquid_staking";

describe("solistic-liquid-staking", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolisticLiquidStaking as Program<SolisticLiquidStaking>;
  let state: Keypair;
  let adminAuthority: Keypair;
  let validatorManagerAuthority: Keypair;
  let ssolMint: Keypair;
  let operationalSolAccount: Keypair;

  (async () => {
      // Create necessary accounts for testing
      state = Keypair.generate();
      adminAuthority = Keypair.generate();
      validatorManagerAuthority = Keypair.generate();
      ssolMint = Keypair.generate();
      operationalSolAccount = Keypair.generate();

      // Airdrop SOL to authority accounts to pay for transactions
      await provider.connection.requestAirdrop(adminAuthority.publicKey, anchor.web3.LAMPORTS_PER_SOL);
      await provider.connection.requestAirdrop(validatorManagerAuthority.publicKey, anchor.web3.LAMPORTS_PER_SOL);
  });

  it("Is initialized!", async () => {
    const tx = await program.methods.initialize({
      adminAuthority: adminAuthority.publicKey,
      validatorManagerAuthority: validatorManagerAuthority.publicKey,
      minStake: new anchor.BN(1000),
      rewardsFee: { basisPoints: 100 },
      liqPool: {
          lpLiquidityTarget: new anchor.BN(1000),
          lpMaxFee: { basisPoints: 100 },
          lpMinFee: { basisPoints: 50 },
          lpTreasuryCut: { basisPoints: 10 },
      },
      additionalStakeRecordSpace: 10,
      additionalValidatorRecordSpace: 10,
      slotsForStakeDelta: new anchor.BN(100),
      pauseAuthority: adminAuthority.publicKey,
    })
      .accounts({
          state: state.publicKey,
          reservePda: anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("reserve")], program.programId)[0],
          stakeList: Keypair.generate().publicKey,
          validatorList: Keypair.generate().publicKey,
          ssolMint: ssolMint.publicKey,
          operationalSolAccount: operationalSolAccount.publicKey,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([state, adminAuthority])
      .rpc();

    console.log("Transaction Signature", tx);
  });

  it("Should change authority", async () => {
    const tx = await program.methods.changeAuthority({
      admin: new PublicKey(adminAuthority.publicKey),
      validatorManager: new PublicKey(validatorManagerAuthority.publicKey),
      operationalSolAccount: new PublicKey(operationalSolAccount.publicKey),
      treasurySsolAccount: new PublicKey(ssolMint.publicKey),
      pauseAuthority: new PublicKey(adminAuthority.publicKey),
    })
      .accounts({
          state: state.publicKey,
          adminAuthority: adminAuthority.publicKey,
      })
      .signers([adminAuthority])
      .rpc();

    console.log("Transaction Signature", tx);
  });

  interface("Should add validator", async () => {
    const tx = await program.methods.addValidator(500) // Score value
      .accounts({
          state: state.publicKey,
          managerAuthority: validatorManagerAuthority.publicKey,
          validatorList: Keypair.generate().publicKey,
          validatorVote: Keypair.generate().publicKey,
          duplicationFlag: Keypair.generate().publicKey,
          rentPayer: validatorManagerAuthority.publicKey,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
      })
      .signers([validatorManagerAuthority])
      .rpc();

    console.log("Transaction Signature", tx);
  });
});
