"use client";

import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { userStore } from "@/lib/storage";

// Stand-in for Google sign-in while Privy is not configured. It collects
// nothing and always signs in the demo account.
const DEMO_ACCOUNT = { name: "Ken Sato", email: "ken.sato@example.com" };

export function MockGoogleSignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const { t } = useI18n();
  const g = t.wallet.google;
  const [open, setOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function choose() {
    setSigningIn(true);
    window.setTimeout(() => {
      if (!userStore.set({ ...DEMO_ACCOUNT, provider: "mock" })) {
        setSigningIn(false);
        setOpen(false);
        setError(t.common.storageBlocked);
        return;
      }
      onSignedIn();
    }, 1200);
  }

  return (
    <>
      {error && <p className="error-banner">{error}</p>}
      <button type="button" className="google-button" onClick={() => setOpen(true)}>
        <Image src="/brand/google-g.svg" alt="" width={20} height={20} />
        <span>{g.continueWith}</span>
      </button>
      {open && (
        <div className="google-backdrop" onClick={() => !signingIn && setOpen(false)}>
          <div
            className="google-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={g.dialogLabel}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="google-close"
              aria-label={t.common.close}
              disabled={signingIn}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <Image src="/brand/google-g.svg" alt="Google" width={24} height={24} />
            {signingIn ? (
              <div className="google-signing" role="status">
                <span className="spinner is-dark" />
                <h2>{g.signingIn}</h2>
                <p>{g.connectingAccount}</p>
              </div>
            ) : (
              <>
                <h2>{g.chooseAccount}</h2>
                <p className="google-sub">{g.toContinue}</p>
                <button type="button" className="google-account" onClick={choose}>
                  <span className="google-avatar">K</span>
                  <span>
                    <strong>{DEMO_ACCOUNT.name}</strong>
                    <small>{DEMO_ACCOUNT.email}</small>
                  </span>
                </button>
                <button type="button" className="google-account" onClick={choose}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
                  </svg>
                  <span>
                    <strong>{g.anotherAccount}</strong>
                  </span>
                </button>
                <p className="google-privacy">{g.privacy}</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
