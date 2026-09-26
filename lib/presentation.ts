// Types shared by the wallet, the prover and Mingle's verifier.

// Order matches the circuit's public signals: output first, then public
// inputs in declaration order.
export const SIGNAL_ORDER = [
  "nullifierHash",
  "issuerAx",
  "issuerAy",
  "revealResidence",
  "revealAge",
  "expectedResidence",
  "minBirthYear",
  "maxBirthYear",
  "scopeHash",
  "requestHash",
] as const;

export type SignalName = (typeof SIGNAL_ORDER)[number];
export type PublicSignals = Record<SignalName, string>;

export type ProverMode = "mock" | "groth16";
export type ChainMode = "off" | "sepolia";

export type PresentationRequest = {
  verifier: "mingle";
  verifierName: string;
  nonce: string;
  epoch: string;
  scopeHash: string;
  requestHash: string;
  asks: {
    residence: { code: number; label: string };
    ageRange: { label: string; minBirthYear: number; maxBirthYear: number };
  };
};

export type Presentation = {
  prover: ProverMode;
  publicSignals: PublicSignals;
  proof: unknown;
  provingMs: number;
};

export type HumanCheck = "simulated" | "world-id";

export type VerificationResult = {
  nonce: string;
  verifiedAt: string;
  disclosed: {
    single: true;
    residence: string | null;
    ageRange: string | null;
  };
  humanCheck: HumanCheck | null;
  nullifierHash: string;
  prover: ProverMode;
  chain: ChainMode;
  txHash: string | null;
  fallbackReason: string | null;
};

export function signalsToArray(signals: PublicSignals): string[] {
  return SIGNAL_ORDER.map((name) => signals[name]);
}

export function arrayToSignals(values: string[]): PublicSignals {
  if (values.length !== SIGNAL_ORDER.length) {
    throw new Error(`Expected ${SIGNAL_ORDER.length} public signals, got ${values.length}`);
  }
  return Object.fromEntries(SIGNAL_ORDER.map((name, i) => [name, values[i]])) as PublicSignals;
}
