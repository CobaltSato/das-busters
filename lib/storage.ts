import type { Credential } from "./credential";
import type { ProvingLocation } from "./modes";
import type { HumanCheck, HumanEnvironment, VerificationResult } from "./presentation";

// Browser storage for the demo. The wallet and Mingle share an origin on
// Vercel, so each app keeps to its own key prefix and never reads the other's.

export type WalletRecord = { credential: Credential; holderSecret: string; savedAt: string };
export type UserRecord = { name: string; email: string; picture?: string; provider: "mock" | "privy" };
// A World ID check keeps the server's signed token, so Mingle can tell it
// apart from the simulated one without trusting the browser.
export type HumanRecord = {
  check: HumanCheck;
  verifiedAt: string;
  environment?: HumanEnvironment;
  token?: string;
};
export type ShareRecord = {
  verifier: string;
  sharedAt: string;
  disclosed: VerificationResult["disclosed"];
  // Missing on records saved before the phone could prove.
  provedOn?: ProvingLocation;
};
export type MingleRecord = {
  epoch: string;
  pendingNonce: string | null;
  verification: (VerificationResult & { token: string }) | null;
};

const KEYS = {
  wallet: "dasb:wallet",
  user: "dasb:user",
  human: "dasb:human",
  shares: "dasb:shares",
  mingle: "mingle:state",
} as const;

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    // Private mode or a corrupted entry: treat it as empty.
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}

function store<T>(key: string) {
  return {
    get: () => read<T>(key),
    set: (value: T) => write(key, value),
    clear: () => remove(key),
  };
}

export const walletStore = store<WalletRecord>(KEYS.wallet);
export const userStore = store<UserRecord>(KEYS.user);
export const humanStore = store<HumanRecord>(KEYS.human);
export const mingleStore = store<MingleRecord>(KEYS.mingle);

// The wallet's own history of what it shared, shown under Connected services.
export const sharesStore = {
  get: (): ShareRecord[] => read<ShareRecord[]>(KEYS.shares) ?? [],
  add: (record: ShareRecord) => write(KEYS.shares, [record, ...(read<ShareRecord[]>(KEYS.shares) ?? [])].slice(0, 20)),
  clear: () => remove(KEYS.shares),
};

// Everything the demo keeps in this browser, for both apps. A Google session
// held by Privy is not ours to clear; "Sign out" in DAS Busters ends it.
const DEMO_PREFIXES = ["dasb:", "mingle:"];

function clearDemoKeys(storage: Storage): void {
  const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(
    (key): key is string => key !== null && DEMO_PREFIXES.some((prefix) => key.startsWith(prefix)),
  );
  keys.forEach((key) => storage.removeItem(key));
}

// One tap before the next run: no certificate, no human check, no share
// history, and Mingle starts over with a new epoch (so a new nullifier).
export function resetDemoData(): boolean {
  try {
    clearDemoKeys(window.localStorage);
    clearDemoKeys(window.sessionStorage);
    return true;
  } catch {
    return false;
  }
}

export function newEpoch(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return bytes.reduce((acc, b) => acc * 256 + b, 0).toString();
}
