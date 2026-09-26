"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLoginWithOAuth, usePrivy, type User } from "@privy-io/react-auth";
import { errorMessage } from "@/lib/api";
import { userStore } from "@/lib/storage";

// Set just before leaving for Google. The page that loads on the way back
// reads it to tell "just signed in" apart from "was already signed in".
const OAUTH_PENDING_KEY = "dasb:oauth-pending";

function markPending(pending: boolean) {
  try {
    if (pending) window.sessionStorage.setItem(OAUTH_PENDING_KEY, "1");
    else window.sessionStorage.removeItem(OAUTH_PENDING_KEY);
  } catch {
    // Without sessionStorage the user taps "Continue as …" instead.
  }
}

function isPending(): boolean {
  try {
    return window.sessionStorage.getItem(OAUTH_PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

function remember(user: User): boolean {
  const google = user.google;
  return userStore.set({
    name: google?.name ?? google?.email ?? "Google user",
    email: google?.email ?? "",
    provider: "privy",
  });
}

// Real Google sign-in through Privy, kept on our own button so the screen
// matches the design. Google redirects back to this page, and Privy finishes
// the login when it loads.
export function PrivyGoogleSignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const { ready, authenticated, user } = usePrivy();
  const [error, setError] = useState<string | null>(null);
  const continued = useRef(false);
  const { initOAuth, state } = useLoginWithOAuth({
    onError: (code) => setError(`Google sign-in did not finish (${code}). Try again.`),
  });

  function proceed(signedIn: User) {
    if (continued.current) return;
    if (!remember(signedIn)) {
      setError("This browser blocked storage. Turn off private browsing and try again.");
      return;
    }
    continued.current = true;
    onSignedIn();
  }

  // Back from Google: carry on without another tap.
  useEffect(() => {
    if (!ready || !authenticated || !user) return;
    if (state.status === "done" || isPending()) {
      markPending(false);
      proceed(user);
    }
  });

  async function start() {
    setError(null);
    if (authenticated && user) {
      proceed(user);
      return;
    }
    try {
      markPending(true);
      await initOAuth({ provider: "google" });
    } catch (e) {
      markPending(false);
      setError(errorMessage(e));
    }
  }

  const busy = !ready || state.status === "loading";
  const name = authenticated ? (user?.google?.name ?? user?.google?.email) : null;

  return (
    <>
      {error && <p className="error-banner">{error}</p>}
      <button type="button" className="google-button" onClick={start} disabled={busy}>
        <Image src="/brand/google-g.svg" alt="" width={20} height={20} />
        <span>{busy ? "Connecting…" : name ? `Continue as ${name}` : "Continue with Google"}</span>
      </button>
    </>
  );
}
