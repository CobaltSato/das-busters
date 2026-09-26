"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { PRIVY_APP_ID, PRIVY_ENABLED } from "@/lib/privy";

// Privy loads only on the wallet screens; the counter and Mingle never need it.
export function WalletProviders({ children }: { children: React.ReactNode }) {
  if (!PRIVY_ENABLED) return children;
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["google"],
        appearance: { theme: "light", accentColor: "#0b0e16", logo: "/brand/das-busters.png" },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
          // The signature only derives the holder key; no modal needed.
          showWalletUIs: false,
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
