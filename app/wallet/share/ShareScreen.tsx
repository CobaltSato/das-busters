"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { ModeBadges } from "@/components/ModeBadges";
import { Switch } from "@/components/Switch";
import { errorMessage, postJson } from "@/lib/api";
import type { Disclosure } from "@/lib/credential";
import type { Modes } from "@/lib/modes";
import type { Presentation, PresentationRequest, VerificationResult } from "@/lib/presentation";
import { humanStore, sharesStore, walletStore, type HumanRecord, type WalletRecord } from "@/lib/storage";
import { Problem } from "../_components/Problem";

type Props = { requestToken: string; request: PresentationRequest; modes: Modes };
type Step = "idle" | "proving" | "verifying";

export function ShareScreen({ requestToken, request, modes }: Props) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [wallet, setWallet] = useState<WalletRecord | null>(null);
  const [human, setHuman] = useState<HumanRecord | null>(null);
  const [disclose, setDisclose] = useState<Disclosure>({ residence: false, ageRange: false });
  const [includeHuman, setIncludeHuman] = useState(true);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setWallet(walletStore.get());
    setHuman(humanStore.get());
    setLoaded(true);
  }, []);

  if (loaded && !wallet) {
    return (
      <Problem
        title="No certificate on this phone"
        body="Receive your Single Status Certificate at the city office counter first, then come back to Mingle."
        action={{ href: "/counter", label: "Open the counter screen" }}
      />
    );
  }

  const here = `/wallet/share?req=${encodeURIComponent(requestToken)}`;
  const { residence, ageRange } = request.asks;
  const busy = step !== "idle";

  async function share() {
    if (!wallet) return;
    setError(null);
    setStep("proving");
    try {
      const { presentation } = await postJson<{ presentation: Presentation }>("/api/prove", {
        request: requestToken,
        credential: wallet.credential,
        holderSecret: wallet.holderSecret,
        disclose,
      });
      setStep("verifying");
      const { result, resultToken } = await postJson<{ result: VerificationResult; resultToken: string }>(
        "/api/verify",
        { request: requestToken, presentation, humanCheck: includeHuman && human ? human.check : null },
      );
      sharesStore.add({ verifier: request.verifierName, sharedAt: result.verifiedAt, disclosed: result.disclosed });
      router.push(`/mingle?result=${encodeURIComponent(resultToken)}`);
    } catch (e) {
      setError(errorMessage(e));
      setStep("idle");
    }
  }

  return (
    <main className="phone">
      <div className="phone-top">
        <Link className="phone-back" href="/mingle" aria-label="Back to Mingle">
          ‹
        </Link>
        <BrandLockup small />
        <span style={{ width: 36 }} />
      </div>

      <section className="share-intro">
        <h1>Choose what to share</h1>
        <p>Only the selected information will be shared.</p>
      </section>

      <div className="share-with">
        <span>Share with</span>
        <strong>{request.verifierName}</strong>
      </div>

      <div className="disclosures">
        <div className="disclosure">
          <div>
            <strong>Single status</strong>
            <small>Verified by a Single Status Certificate</small>
          </div>
          <span className="disclosure-required">
            Required
            <Switch checked disabled label="Single status (required)" onChange={() => undefined} />
          </span>
        </div>
        <div className="disclosure">
          <div>
            <strong>Lives in {residence.label}</strong>
            <small>Verified from residence information</small>
          </div>
          <Switch
            checked={disclose.residence}
            disabled={busy}
            label={`Lives in ${residence.label}`}
            onChange={(on) => setDisclose((d) => ({ ...d, residence: on }))}
          />
        </div>
        <div className="disclosure">
          <div>
            <strong>Age range: {ageRange.label}</strong>
            <small>Verified from date of birth</small>
          </div>
          <Switch
            checked={disclose.ageRange}
            disabled={busy}
            label={`Age range: ${ageRange.label}`}
            onChange={(on) => setDisclose((d) => ({ ...d, ageRange: on }))}
          />
        </div>
      </div>

      {human ? (
        <label className="human-consent">
          <input
            type="checkbox"
            checked={includeHuman}
            disabled={busy}
            onChange={(event) => setIncludeHuman(event.target.checked)}
          />
          <span>
            <strong>Include human check</strong>
            <small>
              {human.check === "world-id" ? "Verified with World ID" : "Simulated for the demo · not a World ID proof"}
            </small>
          </span>
        </label>
      ) : (
        <div className="human-consent is-missing">
          <span>
            <strong>Add a human check</strong>
            <small>World ID · optional</small>
          </span>
          <Link className="check-now" href={`/wallet/world-id?return=${encodeURIComponent(here)}`}>
            Check now
          </Link>
        </div>
      )}

      <p className="fine-print share-privacy">
        Your name, date of birth, and original certificate won’t be shared.
      </p>

      <div className="phone-actions">
        {error && <p className="error-banner">{error}</p>}
        <button type="button" className="btn btn-primary" onClick={share} disabled={busy || !wallet}>
          {busy && <span className="spinner" />}
          {step === "proving"
            ? "Creating proof…"
            : step === "verifying"
              ? modes.chain === "sepolia"
                ? "Recording on Sepolia…"
                : `Checking with ${request.verifierName}…`
              : "Share selected information"}
        </button>
        <Link className="btn btn-text" href="/mingle">
          Cancel
        </Link>
        <ModeBadges modes={modes} only={["prover", "chain"]} />
      </div>
    </main>
  );
}
