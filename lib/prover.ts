import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Groth16Proof } from "snarkjs";
import { fullProve, verifyGroth16 } from "./groth16";
import { hasValidIssuerSignature } from "./issuer";
import { ProofError } from "./errors";
import { getModes } from "./modes";
import { signalsToArray, type Presentation, type PublicSignals } from "./presentation";
import { buildPublicSignals, circuitInput, type ProveInput } from "./statement";

export type { ProveInput };

function proofKey(): string {
  const secret = process.env.TOKEN_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("TOKEN_SECRET is not set");
  }
  return `mock-prover:${secret ?? "local-dev-only-token-secret"}`;
}

function mockMac(signals: PublicSignals): string {
  return createHmac("sha256", proofKey()).update(JSON.stringify(signalsToArray(signals))).digest("hex");
}

export async function prove(input: ProveInput): Promise<Presentation> {
  const started = Date.now();
  if (!hasValidIssuerSignature(input.credential)) {
    throw new ProofError("The certificate signature is not valid", "bad-signature");
  }
  const expected = buildPublicSignals(input);

  if (getModes().prover === "mock") {
    return { prover: "mock", publicSignals: expected, proof: { scheme: "mock", mac: mockMac(expected) }, provingMs: Date.now() - started };
  }

  const { proof, publicSignals } = await fullProve(circuitInput(input, expected));

  // Guards against the circuit's signal order drifting from SIGNAL_ORDER.
  if (publicSignals.join() !== signalsToArray(expected).join()) {
    throw new Error("Circuit public signals do not match lib/presentation.ts SIGNAL_ORDER");
  }
  return { prover: "groth16", publicSignals: expected, proof, provingMs: Date.now() - started };
}

// The verifier accepts only the prover the server is configured for, so a
// client cannot downgrade to the mock.
export async function verifyProof(presentation: Presentation): Promise<boolean> {
  if (presentation.prover !== getModes().prover) return false;
  if (presentation.prover === "groth16") {
    return verifyGroth16(presentation.proof as Groth16Proof, signalsToArray(presentation.publicSignals));
  }
  const proof = presentation.proof as { scheme?: string; mac?: string } | null;
  if (proof?.scheme !== "mock" || typeof proof.mac !== "string") return false;
  const expectedMac = Buffer.from(mockMac(presentation.publicSignals), "hex");
  const actual = Buffer.from(proof.mac, "hex");
  return expectedMac.length === actual.length && timingSafeEqual(expectedMac, actual);
}
