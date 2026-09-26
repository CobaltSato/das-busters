import "server-only";
import { groth16, type Groth16Proof } from "snarkjs";
import {
  BaseError,
  ContractFunctionRevertedError,
  createPublicClient,
  createWalletClient,
  http,
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

const REVERT_MESSAGES: Record<string, string> = {
  NullifierAlreadyUsed:
    "This certificate is already linked to a Mingle account. Reset Mingle to start another demo run.",
  UntrustedIssuer: "The registry does not trust the city office that signed this certificate.",
  InvalidProof: "The proof did not verify on-chain.",
};

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
    throw new ProofError(REVERT_MESSAGES[name] ?? `The registry rejected the proof (${name || "no reason"}).`);
  }
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
    throwIfRevert(error);
    // Anything else is the network or the relayer (for example, no gas).
    console.error("Recording on-chain failed", error);
    return {
      chain: "off",
      txHash: null,
      chainNote: "Sepolia could not be reached, so Mingle checked the proof off-chain only.",
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
    throw new ProofError("The registry rejected the proof when it was mined.");
  }
  return {
    chain: "sepolia",
    txHash,
    chainNote: receipt ? null : "Sepolia has not confirmed the transaction yet. The link shows its status.",
  };
}
