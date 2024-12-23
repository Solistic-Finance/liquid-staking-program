import { Keypair, PublicKey, Signer } from "@solana/web3.js";
import BN from "bn.js";


interface ChangeAuthorityData {
    admin: PublicKey,
    validatorManager: PublicKey,
    operationalSolAccount: PublicKey,
    treasuryMsolAccount: PublicKey,
    pauseAuthority: PublicKey,
}

interface RemoveValidatorParam {
    voteAccount: PublicKey,
}

interface SetValidatorScore {
    index: number,
    validatorVote: PublicKey,
    score: number
}

interface ConfigValidatorSystem {
    extra_runs: number
}

interface LiquidUnstakeParam {
    msol_amount: BN
}

interface AddLiquidityParam {
    lamports: BN
}

interface RemoveLiquidityParam {
    tokens: BN
}

interface ConfigLpParam {
    liquidityTarget: BN,
    minFee: { basisPoints: number },  // Correct usage for Fee type
    maxFee: { basisPoints: number },
    treasuryCut: { basisPoints: number },
}

interface ConfigMarinadeParam {
    rewardsFee: { basisPoints: number },
    slotsForStakeDelta: BN,
    minStake: BN,
    minDeposit: BN,
    minWithdraw: BN,
    stakingSolCap: BN,
    liquiditySolCap: BN,
    withdrawStakeAccountEnabled: true,
    delayedUnstakeFee: { bpCents: number },
    withdrawStakeAccountFee: { bpCents: number },
    maxStakeMovedPerEpoch: { basisPoints: number },
};

interface UpdateMsolTokenMetadata {
    stateAccount: Keypair,
    msolMint: PublicKey,
    name: string,
    symbol: string,
    uri: string,
}

interface UpdateLpMintTokenMetadata {
    stateAccount: Keypair,
    lpMint: PublicKey,
    name: string,
    symbol: string,
    uri: string,
}


export {
    ChangeAuthorityData,
    RemoveValidatorParam,
    SetValidatorScore,
    ConfigValidatorSystem,
    LiquidUnstakeParam,
    AddLiquidityParam,
    RemoveLiquidityParam,
    ConfigLpParam,
    ConfigMarinadeParam,
    UpdateMsolTokenMetadata,
    UpdateLpMintTokenMetadata
}