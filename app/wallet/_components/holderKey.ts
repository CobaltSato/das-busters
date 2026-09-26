"use client";

import { useCreateWallet, usePrivy, useSignMessage, useWallets, type User } from "@privy-io/react-auth";
import { randomField } from "@/lib/fields";
import { HOLDER_KEY_MESSAGE, PRIVY_ENABLED, secretFromSignature } from "@/lib/privy";

// Where the holder secret comes from. With Privy it is derived from the
// embedded wallet's signature, so it belongs to the Google account; without
// Privy it is random. Either way it is stored only on this phone.
export type HolderStatus = "loading" | "ready" | "signed-out";
type HolderSecretSource = { status: HolderStatus; create: () => Promise<string> };

const SIGN_TIMEOUT_MS = 30_000;

function useRandomSecret(): HolderSecretSource {
  return { status: "ready", create: async () => randomField() };
}

function linkedEmbeddedAddress(user: User | null): string | null {
  const account = user?.linkedAccounts.find(
    (linked) => linked.type === "wallet" && linked.walletClientType === "privy",
  );
  return account && "address" in account ? account.address : null;
}

function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), SIGN_TIMEOUT_MS);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function usePrivySecret(): HolderSecretSource {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();
  const { signMessage } = useSignMessage();
  const status: HolderStatus = !ready ? "loading" : authenticated ? "ready" : "signed-out";

  // The wallet is normally created at sign-in, but leaving the page early can
  // cut that short, so create it here if it is still missing.
  async function walletAddress(): Promise<string> {
    const connected = wallets.find((wallet) => wallet.walletClientType === "privy");
    const existing = connected?.address ?? linkedEmbeddedAddress(user);
    if (existing) return existing;
    const created = await createWallet();
    return created.address;
  }

  return {
    status,
    create: () =>
      withTimeout(
        (async () => {
          const address = await walletAddress();
          const { signature } = await signMessage({ message: HOLDER_KEY_MESSAGE }, { address });
          return secretFromSignature(signature);
        })(),
        "Setting up your key took too long. Check your connection and try again.",
      ),
  };
}

function usePrivySignOut(): () => Promise<void> {
  const { logout } = usePrivy();
  return logout;
}

function useLocalSignOut(): () => Promise<void> {
  return async () => undefined;
}

export const useHolderSecret = PRIVY_ENABLED ? usePrivySecret : useRandomSecret;
export const useProviderSignOut = PRIVY_ENABLED ? usePrivySignOut : useLocalSignOut;
