"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { CertificateCard } from "@/components/CertificateCard";
import type { Modes } from "@/lib/modes";
import {
  humanStore,
  sharesStore,
  userStore,
  walletStore,
  type HumanRecord,
  type ShareRecord,
  type UserRecord,
  type WalletRecord,
} from "@/lib/storage";

function describeShare(share: ShareRecord): string {
  const extras = [share.disclosed.residence && `lives in ${share.disclosed.residence}`, share.disclosed.ageRange]
    .filter(Boolean)
    .join(", ");
  return extras ? `Shared single status, ${extras}` : "Shared single status";
}

export function WalletHome({ worldId }: { worldId: Modes["worldId"] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [wallet, setWallet] = useState<WalletRecord | null>(null);
  const [user, setUser] = useState<UserRecord | null>(null);
  const [human, setHuman] = useState<HumanRecord | null>(null);
  const [shares, setShares] = useState<ShareRecord[]>([]);

  useEffect(() => {
    setWallet(walletStore.get());
    setUser(userStore.get());
    setHuman(humanStore.get());
    setShares(sharesStore.get());
    setLoaded(true);
  }, []);

  function resetDemo() {
    walletStore.clear();
    humanStore.clear();
    sharesStore.clear();
    userStore.clear();
    window.location.href = "/";
  }

  function signOut() {
    userStore.clear();
    setUser(null);
    dialog.current?.close();
  }

  const mingle = shares.find((share) => share.verifier === "Mingle");

  return (
    <main className="phone">
      <div className="phone-top">
        <BrandLockup />
        <button
          type="button"
          className="wallet-avatar"
          aria-label="Open account"
          onClick={() => dialog.current?.showModal()}
        >
          {user?.name.charAt(0) ?? "?"}
        </button>
      </div>

      <h1 className="screen-title wallet-home-title">My proofs</h1>
      {loaded && wallet && <CertificateCard certificate={wallet.credential} showTitle />}
      {loaded && !wallet && (
        <div className="wallet-empty">
          No certificate on this phone yet. Scan the QR code at the city office counter to receive one.
          <br />
          <Link href="/counter">Open the counter screen</Link>
        </div>
      )}

      <section className="human-card" aria-labelledby="human-title">
        <div className="human-heading">
          <div>
            <h2 id="human-title">Human check</h2>
            <p>{worldId === "idkit" ? "World ID" : "World ID · simulated"}</p>
          </div>
          <span className={human ? "status-chip is-done" : "status-chip"}>{human ? "Done" : "Optional"}</span>
        </div>
        {human ? (
          <div className="human-done">
            <i aria-hidden="true">✓</i>
            <span>
              <strong>Human check complete</strong>
              <small>
                {human.check === "world-id" ? "Verified with World ID" : "Simulated for the demo · not a World ID proof"}
              </small>
            </span>
          </div>
        ) : (
          <>
            <p>Show apps that a real, unique person holds this certificate. Sharing it is always up to you.</p>
            <Link className="btn btn-primary" href="/wallet/world-id?return=/wallet">
              Verify with World ID
            </Link>
          </>
        )}
      </section>

      <dialog
        ref={dialog}
        className="account-dialog"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <button type="button" className="account-close" aria-label="Close" onClick={() => dialog.current?.close()}>
          ×
        </button>
        <h2>Account</h2>
        <p className="account-name">{user?.name ?? "Not signed in"}</p>
        {user && (
          <>
            <p className="account-email">{user.email}</p>
            <p className="account-provider">
              <Image src="/brand/google-g.svg" alt="" width={18} height={18} />
              {user.provider === "privy" ? "Signed in with Google" : "Signed in with Google (demo account)"}
            </p>
          </>
        )}
        <p className="account-section">Connected services</p>
        <Link className="account-service" href="/mingle">
          <span className="account-service-icon" aria-hidden="true">
            m
          </span>
          <span>
            <strong>Mingle</strong>
            <small>{mingle ? describeShare(mingle) : "Not connected"}</small>
          </span>
          <span className="account-chevron" aria-hidden="true">
            ›
          </span>
        </Link>
        <button type="button" className="account-reset" onClick={resetDemo}>
          Reset demo on this phone
        </button>
        {user && (
          <button type="button" className="btn btn-outline" onClick={signOut}>
            Sign out
          </button>
        )}
      </dialog>
    </main>
  );
}
