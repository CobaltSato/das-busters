"use client";

import Image from "next/image";
import { useState } from "react";
import { userStore } from "@/lib/storage";

// Stand-in for Google sign-in while Privy is not configured. It collects
// nothing and always signs in the demo account.
const DEMO_ACCOUNT = { name: "Ken Sato", email: "ken.sato@example.com" };

export function GoogleSignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [open, setOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function choose() {
    setSigningIn(true);
    window.setTimeout(() => {
      if (!userStore.set({ ...DEMO_ACCOUNT, provider: "mock" })) {
        setSigningIn(false);
        setOpen(false);
        setError("This browser blocked storage. Turn off private browsing and try again.");
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
        <span>Continue with Google</span>
      </button>
      {open && (
        <div className="google-backdrop" onClick={() => !signingIn && setOpen(false)}>
          <div
            className="google-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Sign in with Google"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="google-close"
              aria-label="Close"
              disabled={signingIn}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <Image src="/brand/google-g.svg" alt="Google" width={24} height={24} />
            {signingIn ? (
              <div className="google-signing" role="status">
                <span className="spinner is-dark" />
                <h2>Signing in…</h2>
                <p>Connecting your Google account</p>
              </div>
            ) : (
              <>
                <h2>Choose an account</h2>
                <p className="google-sub">to continue to DAS Busters</p>
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
                    <strong>Use another account</strong>
                  </span>
                </button>
                <p className="google-privacy">
                  Google will share your name, email address, and profile picture with DAS Busters.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
