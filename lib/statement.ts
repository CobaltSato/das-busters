import { birthYear, issuedAtNumber, type Credential, type Disclosure } from "./credential";
import { ProofError } from "./errors";
import { holderCommitment, nullifierHash } from "./fields";
import type { PresentationRequest, PublicSignals } from "./presentation";

// What the holder is about to prove, shared by the phone's prover and the
// server's. Nothing here touches the network or a server key, so it runs in
// the browser too.

export type ProveInput = {
  credential: Credential;
  holderSecret: string;
  request: PresentationRequest;
  disclose: Disclosure;
};

// The rules the circuit enforces, written out in TypeScript. Both provers
// run them first so a bad input fails with a readable message instead of a
// witness error. The issuer signature is checked by the circuit itself (and
// by the server prover beforehand, since it holds the verification code).
export function buildPublicSignals({ credential, holderSecret, request, disclose }: ProveInput): PublicSignals {
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
  const signature = credential.signature;
  return {
    nullifierHash: nullifierHash(holderSecret, request.scopeHash),
    issuerAx: signature.scheme === "eddsa-poseidon" ? signature.Ax : "0",
    issuerAy: signature.scheme === "eddsa-poseidon" ? signature.Ay : "0",
    revealResidence: disclose.residence ? "1" : "0",
    revealAge: disclose.ageRange ? "1" : "0",
    expectedResidence: disclose.residence ? String(residence.code) : "0",
    minBirthYear: disclose.ageRange ? String(ageRange.minBirthYear) : "0",
    maxBirthYear: disclose.ageRange ? String(ageRange.maxBirthYear) : "0",
    scopeHash: request.scopeHash,
    requestHash: request.requestHash,
  };
}

// The circuit's full input: the private certificate fields and secret, plus
// the public inputs (every public signal except the nullifier, which the
// circuit outputs).
export function circuitInput({ credential, holderSecret }: ProveInput, expected: PublicSignals): Record<string, string> {
  const signature = credential.signature;
  if (signature.scheme !== "eddsa-poseidon") {
    throw new ProofError(
      "This certificate was issued before real proofs were switched on. Receive a new one at the counter.",
      "stale-certificate",
    );
  }
  return {
    isSingle: "1",
    birthYear: String(birthYear(credential.birthDate)),
    residenceCode: String(credential.residenceCode),
    issuedAt: String(issuedAtNumber(credential.issuedAt)),
    holderSecret,
    sigR8x: signature.R8x,
    sigR8y: signature.R8y,
    sigS: signature.S,
    ...Object.fromEntries(Object.entries(expected).filter(([name]) => name !== "nullifierHash")),
  };
}
