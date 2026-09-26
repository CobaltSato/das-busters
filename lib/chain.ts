import "server-only";
import { groth16, type Groth16Proof } from "snarkjs";
import {
  BaseError,
  ContractFunctionRevertedError,
  createPublicClient,
  createWalletClient,
  http,
  InsufficientFundsError,
  isAddress,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry, sepolia } from "viem/chains";
import { ProofError } from "./errors";
import { getModes } from "./modes";
import { signalsToArray, type Presentation } from "./presentation";

// Mingle's relayer records each verified proof in SingleProofRegistry and
// waits for the receipt, so a result never says "recorded" for a transaction
// that later reverts (for example, two accounts racing on one certificate).

const REGISTRY_ABI = [
  {
    type: "function",
    name: "record",
    stateMutability: "nonpayable",
    inputs: [
      { name: "a", type: "uint256[2]" },
      { name: "b", type: "uint256[2][2]" },
      { name: "c", type: "uint256[2]" },
      { name: "publicSignals", type: "uint256[10]" },
    ],
    outputs: [],
  },
  { type: "error", name: "UntrustedIssuer", inputs: [] },
  { type: "error", name: "NullifierAlreadyUsed", inputs: [] },
  { type: "error", name: "InvalidProof", inputs: [] },
] as const;

const RECEIPT_TIMEOUT_MS = 45_000;

const REVERTS: Record<string, { code: string; message: string }> = {
  NullifierAlreadyUsed: {
    code: "nullifier-used",
    message:
      "The registry on Sepolia refused this proof: this certificate's anonymous number for Mingle is already used. One certificate, one Mingle account.",
  },
  UntrustedIssuer: {
    code: "registry-untrusted-issuer",
    message: "The registry does not trust the city office that signed this certificate.",
  },
  InvalidProof: { code: "invalid-proof-onchain", message: "The proof did not verify on-chain." },
};

// chainNote is a code ("rpc-unreachable", "relayer-unfunded", "unconfirmed")
// the UI translates.
export type ChainOutcome =
  | { chain: "sepolia"; txHash: Hex; chainNote: string | null }
  | { chain: "off"; txHash: null; chainNote: string | null };

function config() {
  const chain = Number(process.env.CHAIN_ID ?? sepolia.id) === foundry.id ? foundry : sepolia;
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const registry = process.env.REGISTRY_ADDRESS;
  const key = process.env.RELAYER_PRIVATE_KEY;
  if (!rpcUrl || !registry || !isAddress(registry) || !key || !/^0x[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error("CHAIN_MODE=sepolia needs SEPOLIA_RPC_URL, REGISTRY_ADDRESS and RELAYER_PRIVATE_KEY");
  }
  return { chain, rpcUrl, registry: registry as Address, account: privateKeyToAccount(key as Hex) };
}

export function publicClient() {
  const { chain, rpcUrl } = config();
  return createPublicClient({ chain, transport: http(rpcUrl) });
}

type Pair = readonly [bigint, bigint];
type Signals10 = readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];

async function toCalldata(presentation: Presentation): Promise<readonly [Pair, readonly [Pair, Pair], Pair, Signals10]> {
  // exportSolidityCallData orders the G2 coordinates the way the verifier
  // expects; building the arrays by hand is the classic "false on-chain" bug.
  const raw = await groth16.exportSolidityCallData(
    presentation.proof as Groth16Proof,
    signalsToArray(presentation.publicSignals),
  );
  const [a, b, c, pub] = JSON.parse(`[${raw}]`) as [string[], string[][], string[], string[]];
  const pair = (v: string[]): Pair => [BigInt(v[0]), BigInt(v[1])];
  return [pair(a), [pair(b[0]), pair(b[1])], pair(c), pub.map(BigInt) as unknown as Signals10];
}

// A revert is the registry saying no: report it, never downgrade it.
function throwIfRevert(error: unknown): void {
  const revert = error instanceof BaseError ? error.walk((e) => e instanceof ContractFunctionRevertedError) : null;
  if (revert instanceof ContractFunctionRevertedError) {
    const name = revert.data?.errorName ?? "";
    const known = REVERTS[name];
    if (known) throw new ProofError(known.message, known.code);
    const reason = name || "no reason";
    throw new ProofError(`The registry rejected the proof (${reason}).`, "registry-rejected", { reason });
  }
}

// viem maps a node's "insufficient funds" answer to InsufficientFundsError
// somewhere in the cause chain, whichever call hit it.
function isRelayerUnfunded(error: unknown): boolean {
  return error instanceof BaseError && error.walk((e) => e instanceof InsufficientFundsError) instanceof InsufficientFundsError;
}

export async function recordOnChain(presentation: Presentation): Promise<ChainOutcome> {
  if (getModes().chain !== "sepolia" || presentation.prover !== "groth16") {
    return { chain: "off", txHash: null, chainNote: null };
  }
  const { chain, rpcUrl, registry, account } = config();
  const client = publicClient();
  const call = { address: registry, abi: REGISTRY_ABI, functionName: "record", args: await toCalldata(presentation), account } as const;

  let txHash: Hex;
  try {
    const { request } = await client.simulateContract(call);
    txHash = await createWalletClient({ account, chain, transport: http(rpcUrl) }).writeContract(request);
  } catch (error) {
    // An empty relayer is our problem, not the registry's. viem wraps a node
    // error with code -32603 as a revert even when it says "insufficient
    // funds", so this check runs before the revert check.
    if (isRelayerUnfunded(error)) {
      console.error("The relayer cannot pay for gas", error);
      return { chain: "off", txHash: null, chainNote: "relayer-unfunded" };
    }
    throwIfRevert(error);
    // Anything else (no answer, a timeout) is reported as Sepolia unreachable.
    console.error("Recording on-chain failed", error);
    return {
      chain: "off",
      txHash: null,
      chainNote: "rpc-unreachable",
    };
  }

  const receipt = await client
    .waitForTransactionReceipt({ hash: txHash, timeout: RECEIPT_TIMEOUT_MS })
    .catch((error: unknown) => {
      console.error("Waiting for the Sepolia receipt failed", error);
      return null;
    });
  if (receipt?.status === "reverted") {
    // The simulation passed but another transaction for the same nullifier
    // was mined first. Simulate again against the new state to get the reason.
    await client.simulateContract(call).catch(throwIfRevert);
    throw new ProofError("The registry rejected the proof when it was mined.", "mined-revert");
  }
  return {
    chain: "sepolia",
    txHash,
    chainNote: receipt ? null : "unconfirmed",
  };
}
