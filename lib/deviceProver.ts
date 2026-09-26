import { ProofError } from "./errors";
import { signalsToArray, type Presentation } from "./presentation";
import { buildPublicSignals, circuitInput, type ProveInput } from "./statement";

// Proves in the browser, so the certificate and the holder secret stay on the
// phone. It uses the same circuit files as the server prover (public/zk).
const WASM = "/zk/single_proof.wasm";
const ZKEY = "/zk/single_proof.zkey";

// Starts the 7.7 MB download while the holder is still choosing, so the proof
// itself only waits for the maths. snarkjs fetches the same URLs again and
// gets them from the browser cache.
export function prefetchCircuit(): void {
  for (const url of [WASM, ZKEY]) {
    fetch(url).catch(() => undefined);
  }
}

export async function proveOnDevice(input: ProveInput): Promise<Presentation> {
  const started = performance.now();
  const expected = buildPublicSignals(input);
  const { groth16 } = await import("snarkjs");
  let result: Awaited<ReturnType<typeof groth16.fullProve>>;
  try {
    result = await groth16.fullProve(circuitInput(input, expected), WASM, ZKEY);
  } catch (error) {
    // The rules above already passed, so a failed circuit assertion means the
    // city office signature does not match the certificate.
    if (error instanceof Error && error.message.includes("Assert Failed")) {
      throw new ProofError("The certificate signature is not valid", "bad-signature");
    }
    throw error;
  }
  if (result.publicSignals.join() !== signalsToArray(expected).join()) {
    throw new Error("Circuit public signals do not match lib/presentation.ts SIGNAL_ORDER");
  }
  return {
    prover: "groth16",
    publicSignals: expected,
    proof: result.proof,
    provingMs: Math.round(performance.now() - started),
  };
}
