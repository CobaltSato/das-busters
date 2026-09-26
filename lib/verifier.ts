import "server-only";
import { ISSUER_PUBLIC_KEY } from "./issuer";
import { getModes } from "./modes";
import { ProofError } from "./errors";
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

// Mingle trusts one city office key, published in lib/zk/issuer-public.json.
// The mock issuer has no curve key and is trusted only in mock mode.
function isTrustedIssuer(ax: string, ay: string): boolean {
  if (getModes().prover === "mock") return ax === "0" && ay === "0";
  return ax === ISSUER_PUBLIC_KEY.Ax && ay === ISSUER_PUBLIC_KEY.Ay;
}
