import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Groth16Proof } from "snarkjs";
import { birthYear, type Credential, type Disclosure } from "./credential";
import { holderCommitment, nullifierHash } from "./fields";
import { fullProve, verifyGroth16 } from "./groth16";
import { hasValidIssuerSignature, issuedAtNumber } from "./issuer";
import { ProofError } from "./errors";
import { getModes } from "./modes";
import {
  signalsToArray,
  type Presentation,
  type PresentationRequest,
  type PublicSignals,
} from "./presentation";

export type ProveInput = {
  credential: Credential;
  holderSecret: string;
  request: PresentationRequest;
  disclose: Disclosure;
};

// The rules the circuit enforces, written out in TypeScript. Both provers
// run them first so a bad input fails with a readable message instead of a
// witness error.
export function buildPublicSignals({ credential, holderSecret, request, disclose }: ProveInput): PublicSignals {
  if (!hasValidIssuerSignature(credential)) {
    throw new ProofError("The certificate signature is not valid", "bad-signature");
  }
  if (holderCommitment(holderSecret) !== credential.holderCommitment) {
    throw new ProofError("This certificate belongs to someone else", "not-your-certificate");
  }
  if (credential.maritalStatus !== "Single") {
    throw new ProofError("The certificate does not show single status", "not-single");
  }
  const { residence, ageRange } = request.asks;
  if (disclose.residence && credential.residenceCode !== residence.code) {
    throw new ProofError(`The certificate does not show residence in ${residence.label}`, "not-resident", {
      place: residence.label,
    });
  }
  const year = birthYear(credential.birthDate);
  if (disclose.ageRange && (year < ageRange.minBirthYear || year > ageRange.maxBirthYear)) {
    throw new ProofError(`The birth date is not in the ${ageRange.label} range`, "not-in-age-range", {
      range: ageRange.label,
    });
  }
  return {
    nullifierHash: nullifierHash(holderSecret, request.scopeHash),
    issuerAx: credential.signature.scheme === "eddsa-poseidon" ? credential.signature.Ax : "0",
    issuerAy: credential.signature.scheme === "eddsa-poseidon" ? credential.signature.Ay : "0",
    revealResidence: disclose.residence ? "1" : "0",
    revealAge: disclose.ageRange ? "1" : "0",
    expectedResidence: disclose.residence ? String(residence.code) : "0",
    minBirthYear: disclose.ageRange ? String(ageRange.minBirthYear) : "0",
    maxBirthYear: disclose.ageRange ? String(ageRange.maxBirthYear) : "0",
    scopeHash: request.scopeHash,
    requestHash: request.requestHash,
  };
}

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
  const expected = buildPublicSignals(input);
  const mode = getModes().prover;
  const signature = input.credential.signature;

  if (mode === "mock") {
    return { prover: "mock", publicSignals: expected, proof: { scheme: "mock", mac: mockMac(expected) }, provingMs: Date.now() - started };
  }
  if (signature.scheme !== "eddsa-poseidon") {
    throw new ProofError(
      "This certificate was issued before real proofs were switched on. Receive a new one at the counter.",
      "stale-certificate",
    );
  }

  const { credential, holderSecret } = input;
  const { proof, publicSignals } = await fullProve({
    isSingle: "1",
    birthYear: String(birthYear(credential.birthDate)),
    residenceCode: String(credential.residenceCode),
    issuedAt: String(issuedAtNumber(credential.issuedAt)),
    holderSecret,
    sigR8x: signature.R8x,
    sigR8y: signature.R8y,
    sigS: signature.S,
    ...Object.fromEntries(Object.entries(expected).filter(([name]) => name !== "nullifierHash")),
  });

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
