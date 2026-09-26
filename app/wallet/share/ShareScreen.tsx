"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { useI18n } from "@/components/I18nProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ModeBadges } from "@/components/ModeBadges";
import { Switch } from "@/components/Switch";
import { errorMessage, postJson } from "@/lib/api";
import { lookup } from "@/lib/i18n";
import type { Disclosure } from "@/lib/credential";
import type { Modes } from "@/lib/modes";
import type { Presentation, PresentationRequest, VerificationResult } from "@/lib/presentation";
import { humanStore, sharesStore, walletStore, type HumanRecord, type WalletRecord } from "@/lib/storage";
import { humanLabel } from "../_components/humanLabel";
import { Problem } from "../_components/Problem";

type Props = { requestToken: string; request: PresentationRequest; modes: Modes };
type Step = "idle" | "proving" | "verifying";

export function ShareScreen({ requestToken, request, modes }: Props) {
  const { t } = useI18n();
  const copy = t.wallet.share;
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
        title={t.wallet.problems.noCertificate}
        body={t.wallet.problems.noCertificateBody}
        action={{ href: "/counter", label: t.common.openCounter }}
      />
    );
  }

  const here = `/wallet/share?req=${encodeURIComponent(requestToken)}`;
  const { residence, ageRange } = request.asks;
  const place = lookup(t.places, residence.label);
  const range = t.ageRange(ageRange.label);
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
        {
          request: requestToken,
          presentation,
          humanCheck: includeHuman && human ? human.check : null,
          humanToken: includeHuman && human?.check === "world-id" ? human.token : undefined,
        },
      );
      sharesStore.add({ verifier: request.verifierName, sharedAt: result.verifiedAt, disclosed: result.disclosed });
      router.push(`/mingle?result=${encodeURIComponent(resultToken)}`);
    } catch (e) {
      setError(errorMessage(e, t));
      setStep("idle");
    }
  }

  return (
    <main className="phone">
      <div className="phone-top">
        <Link className="phone-back" href="/mingle" aria-label={t.common.backToMingle}>
          ‹
        </Link>
        <BrandLockup small />
        <LanguageToggle />
      </div>

      <section className="share-intro">
        <h1>{copy.title}</h1>
        <p>{copy.lede}</p>
      </section>

      <div className="share-with">
        <span>{copy.shareWith}</span>
        <strong>{request.verifierName}</strong>
      </div>

      <div className="disclosures">
        <div className="disclosure">
          <div>
            <strong>{copy.single}</strong>
            <small>{copy.singleSub}</small>
          </div>
          <span className="disclosure-required">
            {copy.required}
            <Switch checked disabled label={copy.singleRequired} onChange={() => undefined} />
          </span>
        </div>
        <div className="disclosure">
          <div>
            <strong>{copy.livesIn(place)}</strong>
            <small>{copy.residenceSub}</small>
          </div>
          <Switch
            checked={disclose.residence}
            disabled={busy}
            label={copy.livesIn(place)}
            onChange={(on) => setDisclose((d) => ({ ...d, residence: on }))}
          />
        </div>
        <div className="disclosure">
          <div>
            <strong>{copy.ageRange(range)}</strong>
            <small>{copy.ageSub}</small>
          </div>
          <Switch
            checked={disclose.ageRange}
            disabled={busy}
            label={copy.ageRange(range)}
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
            <strong>{copy.includeHuman}</strong>
            <small>{humanLabel(t, human)}</small>
          </span>
        </label>
      ) : (
        <div className="human-consent is-missing">
          <span>
            <strong>{copy.addHuman}</strong>
            <small>{copy.worldIdOptional}</small>
          </span>
          <Link className="check-now" href={`/wallet/world-id?return=${encodeURIComponent(here)}`}>
            {copy.checkNow}
          </Link>
        </div>
      )}

      <p className="fine-print share-privacy">{copy.privacy}</p>

      <div className="phone-actions">
        {error && <p className="error-banner">{error}</p>}
        <button type="button" className="btn btn-primary" onClick={share} disabled={busy || !wallet}>
          {busy && <span className="spinner" />}
          {step === "proving"
            ? copy.proving
            : step === "verifying"
              ? modes.chain === "sepolia"
                ? copy.recordingSepolia
                : copy.checkingWith(request.verifierName)
              : copy.submit}
        </button>
        <Link className="btn btn-text" href="/mingle">
          {t.common.cancel}
        </Link>
        <ModeBadges modes={modes} only={["prover", "chain"]} />
      </div>
    </main>
  );
}
