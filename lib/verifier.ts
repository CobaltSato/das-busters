import "server-only";
import { ProofError } from "./prover";
import type { PresentationRequest, PublicSignals, VerificationResult } from "./presentation";

// Mingle's side: the proof alone says "these signals are consistent with a
// valid certificate". Mingle must still check the signals are the ones it
// asked for, or a holder could prove a weaker statement.
export function checkAgainstRequest(
  signals: PublicSignals,
  request: PresentationRequest,
): VerificationResult["disclosed"] {
  if (signals.scopeHash !== request.scopeHash || signals.requestHash !== request.requestHash) {
    throw new ProofError("This proof was made for a different request");
  }
  if (!isTrustedIssuer(signals.issuerAx, signals.issuerAy)) {
    throw new ProofError("The certificate was not issued by a trusted city office");
  }

  const { residence, ageRange } = request.asks;
  const revealResidence = flag(signals.revealResidence);
  const revealAge = flag(signals.revealAge);

  if (revealResidence && signals.expectedResidence !== String(residence.code)) {
    throw new ProofError("The residence in the proof does not match the request");
  }
  if (!revealResidence && signals.expectedResidence !== "0") {
    throw new ProofError("A hidden field carries a value");
  }
  const rangeMatches =
    signals.minBirthYear === String(ageRange.minBirthYear) &&
    signals.maxBirthYear === String(ageRange.maxBirthYear);
  if (revealAge && !rangeMatches) {
    throw new ProofError("The age range in the proof does not match the request");
  }
  if (!revealAge && (signals.minBirthYear !== "0" || signals.maxBirthYear !== "0")) {
    throw new ProofError("A hidden field carries a value");
  }

  return {
    single: true,
    residence: revealResidence ? residence.label : null,
    ageRange: revealAge ? ageRange.label : null,
  };
}

function flag(value: string): boolean {
  if (value !== "0" && value !== "1") throw new ProofError("A disclosure flag is not 0 or 1");
  return value === "1";
}

function isTrustedIssuer(ax: string, ay: string): boolean {
  // The mock issuer has no curve key; the EdDSA issuer's key comes from env.
  return ax === "0" && ay === "0";
}
