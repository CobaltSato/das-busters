"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { CertificateCard } from "@/components/CertificateCard";
import { useI18n } from "@/components/I18nProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { prefetchCircuit } from "@/lib/deviceProver";
import type { Modes, ProvingLocation } from "@/lib/modes";
import {
  humanStore,
  resetDemoData,
  sharesStore,
  userStore,
  walletStore,
  type HumanRecord,
  type ShareRecord,
  type UserRecord,
  type WalletRecord,
} from "@/lib/storage";
import { errorMessage } from "@/lib/api";
import { useProviderSignOut } from "./_components/holderKey";
import { HumanCard } from "./_components/HumanCard";
import { describeShare, SharedList } from "./_components/SharedList";

type Props = { worldId: Modes["worldId"]; prover: Modes["prover"]; proveOn: ProvingLocation };

export function WalletHome({ worldId, prover, proveOn }: Props) {
  const { t } = useI18n();
  const home = t.wallet.home;
  const dialog = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [wallet, setWallet] = useState<WalletRecord | null>(null);
  const [user, setUser] = useState<UserRecord | null>(null);
  const [human, setHuman] = useState<HumanRecord | null>(null);
  const [shares, setShares] = useState<ShareRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const providerSignOut = useProviderSignOut();

  useEffect(() => {
    setWallet(walletStore.get());
    setUser(userStore.get());
    setHuman(humanStore.get());
    setShares(sharesStore.get());
    setLoaded(true);
  }, []);

  // After the human check a proof comes next, so start the circuit download
  // here when this phone will make it (Groth16, not PROVE_ON=server). Not
  // before: on a slow network it would share the bandwidth with the World ID
  // request and make it open late.
  useEffect(() => {
    if (wallet && human && prover === "groth16" && proveOn === "device") prefetchCircuit();
  }, [wallet, human, prover, proveOn]);

  async function resetDemo() {
    try {
      await providerSignOut();
    } catch (e) {
      setError(errorMessage(e, t));
      return;
    }
    if (!resetDemoData()) {
      setError(t.common.storageBlocked);
      return;
    }
    window.location.href = "/";
  }

  async function signOut() {
    try {
      await providerSignOut();
    } catch (e) {
      setError(errorMessage(e, t));
      return;
    }
    userStore.clear();
    setUser(null);
    dialog.current?.close();
  }

  const mingle = shares.find((share) => share.verifier === "Mingle");

  return (
    <main className="phone">
      <div className="phone-top">
        <BrandLockup />
        <div className="phone-top-side">
          <LanguageToggle />
          <button
            type="button"
            className="wallet-avatar"
            aria-label={home.openAccount}
            onClick={() => dialog.current?.showModal()}
          >
            {user?.name.charAt(0) ?? "?"}
          </button>
        </div>
      </div>

      <h1 className="screen-title wallet-home-title">{home.title}</h1>
      {loaded && wallet && <CertificateCard certificate={wallet.credential} variant="compact" />}
      {loaded && !wallet && (
        <div className="wallet-empty">
          {home.empty}
          <br />
          <Link href="/counter">{t.common.openCounter}</Link>
        </div>
      )}
      {loaded && <HumanCard worldId={worldId} human={human} onVerified={setHuman} />}
      {/* With a certificate and nothing shared yet, the next step is Mingle. */}
      {loaded && wallet && shares.length === 0 && (
        <Link className="btn btn-primary wallet-next" href="/mingle?screen=verification">
          {home.proveOnMingle}
        </Link>
      )}
      {loaded && shares.length > 0 && <SharedList shares={shares} prover={prover} />}

      <dialog
        ref={dialog}
        className="account-dialog"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <button type="button" className="account-close" aria-label={t.common.close} onClick={() => dialog.current?.close()}>
          ×
        </button>
        <h2>{home.account}</h2>
        {error && <p className="error-banner">{error}</p>}
        <p className="account-name">{user?.name ?? home.notSignedIn}</p>
        {user && (
          <>
            <p className="account-email">{user.email}</p>
            <p className="account-provider">
              <Image src="/brand/google-g.svg" alt="" width={18} height={18} />
              {user.provider === "privy" ? home.signedInGoogle : home.signedInGoogleDemo}
            </p>
          </>
        )}
        <p className="account-section">{home.connectedServices}</p>
        <Link className="account-service" href="/mingle">
          <span className="account-service-icon" aria-hidden="true">
            m
          </span>
          <span>
            <strong>Mingle</strong>
            <small>{mingle ? describeShare(t, mingle) : home.notConnected}</small>
          </span>
          <span className="account-chevron" aria-hidden="true">
            ›
          </span>
        </Link>
        <button type="button" className="account-reset" onClick={resetDemo}>
          {home.reset}
        </button>
        {user && (
          <button type="button" className="btn btn-outline" onClick={signOut}>
            {home.signOut}
          </button>
        )}
      </dialog>
    </main>
  );
}
