import "server-only";
import path from "node:path";
import { groth16, type Groth16Proof } from "snarkjs";
import verificationKey from "./zk/verification_key.json";

// Artifacts are committed under public/zk and traced into the /api/prove
// function by next.config.ts, so Vercel never needs circom.
const ZK_DIR = path.join(process.cwd(), "public", "zk");

export async function fullProve(input: Record<string, string>) {
  return groth16.fullProve(
    input,
    path.join(ZK_DIR, "single_proof.wasm"),
    path.join(ZK_DIR, "single_proof.zkey"),
  );
}

export async function verifyGroth16(proof: Groth16Proof, publicSignals: string[]): Promise<boolean> {
  return groth16.verify(verificationKey, publicSignals, proof);
}
