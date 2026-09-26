import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { birthYear, type Credential, type Disclosure } from "./credential";
import { holderCommitment, nullifierHash } from "./fields";
import { hasValidIssuerSignature } from "./issuer";
import {
  signalsToArray,
  type Presentation,
  type PresentationRequest,
  type PublicSignals,
} from "./presentation";

export class ProofError extends Error {}

export type ProveInput = {
  credential: Credential;
  holderSecret: string;
  request: PresentationRequest;
  disclose: Disclosure;
};

// The rules the circuit enforces, written out in TypeScript. The mock prover
// runs them and signs the public signals; the Groth16 prover will replace
// the signature with a real proof over the same signals.
export function buildPublicSignals({ credential, holderSecret, request, disclose }: ProveInput): PublicSignals {
  if (!hasValidIssuerSignature(credential)) {
    throw new ProofError("The certificate signature is not valid");
  }
  if (holderCommitment(holderSecret) !== credential.holderCommitment) {
    throw new ProofError("This certificate belongs to someone else");
  }
  if (credential.maritalStatus !== "Single") {
    throw new ProofError("The certificate does not show single status");
  }
  const { residence, ageRange } = request.asks;
  if (disclose.residence && credential.residenceCode !== residence.code) {
    throw new ProofError(`The certificate does not show residence in ${residence.label}`);
  }
  const year = birthYear(credential.birthDate);
  if (disclose.ageRange && (year < ageRange.minBirthYear || year > ageRange.maxBirthYear)) {
    throw new ProofError(`The birth date is not in the ${ageRange.label} range`);
  }
  return {
    nullifierHash: nullifierHash(holderSecret, request.scopeHash),
    issuerAx: "0",
    issuerAy: "0",
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
  const publicSignals = buildPublicSignals(input);
  return {
    prover: "mock",
    publicSignals,
    proof: { scheme: "mock", mac: mockMac(publicSignals) },
    provingMs: Date.now() - started,
  };
}

export async function verifyProof(presentation: Presentation): Promise<boolean> {
  if (presentation.prover !== "mock") return false;
  const proof = presentation.proof as { scheme?: string; mac?: string } | null;
  if (proof?.scheme !== "mock" || typeof proof.mac !== "string") return false;
  const expected = Buffer.from(mockMac(presentation.publicSignals), "hex");
  const actual = Buffer.from(proof.mac, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
