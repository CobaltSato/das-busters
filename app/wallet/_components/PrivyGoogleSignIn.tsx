"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLoginWithOAuth, usePrivy, type User } from "@privy-io/react-auth";
import { useI18n } from "@/components/I18nProvider";
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
    // Without sessionStorage the user taps "Save certificate" instead.
  }
}

function isPending(): boolean {
  try {
    return window.sessionStorage.getItem(OAUTH_PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

function remember(user: User, fallbackName: string): boolean {
  const google = user.google;
  return userStore.set({
    name: google?.name ?? google?.email ?? fallbackName,
    email: google?.email ?? "",
    provider: "privy",
  });
}

// Real Google sign-in through Privy, kept on our own button so the screen
// matches the design. Google redirects back to this page, and Privy finishes
// the login when it loads.
export function PrivyGoogleSignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const { t } = useI18n();
  const g = t.wallet.google;
  const { ready, authenticated, user } = usePrivy();
  const [error, setError] = useState<string | null>(null);
  const continued = useRef(false);
  const { initOAuth, state } = useLoginWithOAuth({
    onError: (code) => setError(g.didNotFinish(code)),
  });

  function proceed(signedIn: User, tapped = false) {
    // A tap always retries; the automatic path runs once.
    if (continued.current && !tapped) return;
    if (!remember(signedIn, g.fallbackName)) {
      setError(t.common.storageBlocked);
      return;
    }
    continued.current = true;
    onSignedIn();
  }

  // Back from Google: carry on without another tap, but only after Privy has
  // removed its OAuth parameters from the URL, or the two navigations race.
  useEffect(() => {
    if (!ready || !authenticated || !user) return;
    if (window.location.search.includes("privy_oauth")) return;
    if (state.status === "done" || isPending()) {
      markPending(false);
      proceed(user);
    }
  });

  async function start() {
    setError(null);
    if (authenticated && user) {
      proceed(user, true);
      return;
    }
    try {
      markPending(true);
      await initOAuth({ provider: "google" });
    } catch (e) {
      markPending(false);
      setError(errorMessage(e, t));
    }
  }

  const busy = !ready || state.status === "loading";
  const name = authenticated ? (user?.google?.name ?? user?.google?.email) : null;

  // Already signed in (a second run, or back from Google before the page
  // moved on): the next step is saving, so the button says that.
  if (name && !busy) {
    return (
      <>
        {error && <p className="error-banner">{error}</p>}
        <button type="button" className="btn btn-primary" onClick={start}>
          {g.saveCertificate}
        </button>
        <p className="signed-in-as">
          <Image src="/brand/google-g.svg" alt="" width={14} height={14} />
          {g.signedInAs(name)}
        </p>
      </>
    );
  }

  return (
    <>
      {error && <p className="error-banner">{error}</p>}
      <button type="button" className="google-button" onClick={start} disabled={busy}>
        <Image src="/brand/google-g.svg" alt="" width={20} height={20} />
        <span>{busy ? g.connecting : g.continueWith}</span>
      </button>
    </>
  );
}
