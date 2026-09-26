"use client";

import { usePrivy, useSignMessage, useWallets } from "@privy-io/react-auth";
import { randomField } from "@/lib/fields";
import { HOLDER_KEY_MESSAGE, PRIVY_ENABLED, secretFromSignature } from "@/lib/privy";

// Where the holder secret comes from. With Privy it is derived from the
// embedded wallet's signature, so it belongs to the Google account; without
// Privy it is random. Either way it is stored only on this phone.
type HolderSecretSource = { ready: boolean; create: () => Promise<string> };

function useRandomSecret(): HolderSecretSource {
  return { ready: true, create: async () => randomField() };
}

function usePrivySecret(): HolderSecretSource {
  const { wallets, ready } = useWallets();
  const { signMessage } = useSignMessage();
  const embedded = wallets.find((wallet) => wallet.walletClientType === "privy");
  return {
    ready: ready && Boolean(embedded),
    create: async () => {
      if (!embedded) throw new Error("Your key is still being set up. Wait a moment and try again.");
      const { signature } = await signMessage({ message: HOLDER_KEY_MESSAGE }, { address: embedded.address });
      return secretFromSignature(signature);
    },
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
