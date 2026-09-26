"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { useI18n } from "@/components/I18nProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ModeBadges } from "@/components/ModeBadges";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Switch } from "@/components/Switch";
import { ApiError, errorMessage, postJson } from "@/lib/api";
import { prefetchCircuit, proveOnDevice } from "@/lib/deviceProver";
import { ProofError } from "@/lib/errors";
import { lookup } from "@/lib/i18n";
import type { Disclosure } from "@/lib/credential";
import type { Modes, ProvingLocation } from "@/lib/modes";
import type { Presentation, PresentationRequest, VerificationResult } from "@/lib/presentation";
import {
  humanStore,
  mingleStore,
  sharesStore,
  walletStore,
  type HumanRecord,
  type WalletRecord,
} from "@/lib/storage";
import { humanLabel } from "../_components/humanLabel";
import { Problem } from "../_components/Problem";
import { WorldIdButton } from "../world-id/WorldIdButton";
import { shareSteps, type Step } from "./shareSteps";

type Props = { requestToken: string; request: PresentationRequest; modes: Modes; proveOn: ProvingLocation };

const MINGLE_VERIFICATION = "/mingle?screen=verification";

export function ShareScreen({ requestToken, request, modes, proveOn }: Props) {
  const { locale, t } = useI18n();
  const copy = t.wallet.share;
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [wallet, setWallet] = useState<WalletRecord | null>(null);
  const [human, setHuman] = useState<HumanRecord | null>(null);
  const [disclose, setDisclose] = useState<Disclosure>({ residence: false, ageRange: false });
  const [includeHuman, setIncludeHuman] = useState(true);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  // Set when this phone could not finish and the server made the proof.
  const [fellBack, setFellBack] = useState(false);
  // How long the proof took, shown once it is made.
  const [provingMs, setProvingMs] = useState<number | null>(null);
  // Seconds spent waiting for Mingle's check and the Sepolia block.
  const [waited, setWaited] = useState(0);

  useEffect(() => {
    setWallet(walletStore.get());
    setHuman(humanStore.get());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (proveOn === "device") prefetchCircuit();
  }, [proveOn]);

  useEffect(() => {
    if (step !== "verifying") return;
    setWaited(0);
    const timer = setInterval(() => setWaited((seconds) => seconds + 1), 1000);
    return () => clearInterval(timer);
  }, [step]);

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

  function proveOnServer(): Promise<Presentation> {
    if (!wallet) throw new Error("No certificate");
    return postJson<{ presentation: Presentation }>("/api/prove", {
      request: requestToken,
      credential: wallet.credential,
      holderSecret: wallet.holderSecret,
      disclose,
    }).then((body) => body.presentation);
  }

  // On the phone first. If the phone cannot finish (an old browser, too
  // little memory), the server makes this one proof and the screen says so.
  // A broken rule is an answer, not a device problem, so it is not retried.
  async function makeProof(): Promise<{ presentation: Presentation; provedOn: ProvingLocation }> {
    if (proveOn === "server" || !wallet) {
      setStep("proving");
      return { presentation: await proveOnServer(), provedOn: "server" };
    }
    setStep("proving-device");
    try {
      const presentation = await proveOnDevice({
        credential: wallet.credential,
        holderSecret: wallet.holderSecret,
        request,
        disclose,
      });
      return { presentation, provedOn: "device" };
    } catch (e) {
      if (e instanceof ProofError) throw e;
      console.warn("Proving on this device failed; using the server", e);
      setFellBack(true);
      setStep("proving-server");
      return { presentation: await proveOnServer(), provedOn: "server" };
    }
  }

  async function share() {
    if (!wallet) return;
    setError(null);
    setFellBack(false);
    setProvingMs(null);
    try {
      const { presentation, provedOn } = await makeProof();
      setProvingMs(presentation.provingMs);
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
      sharesStore.add({
        verifier: request.verifierName,
        sharedAt: result.verifiedAt,
        disclosed: result.disclosed,
        provedOn,
      });
      router.push(`/mingle?result=${encodeURIComponent(resultToken)}`);
    } catch (e) {
      setError({ message: errorMessage(e, t), code: e instanceof ApiError ? e.code : undefined });
      setStep("idle");
    }
  }

  // World ID passed on this screen: include it unless the holder unticks it.
  function humanAdded(record: HumanRecord) {
    setHuman(record);
    setIncludeHuman(true);
  }

  // The registry already holds this certificate's number for Mingle's
  // current scope. Clearing only Mingle's record gives it a new scope, so the
  // certificate stays and the next proof gets a new number.
  function startMingleOver() {
    mingleStore.clear();
    router.push(MINGLE_VERIFICATION);
  }

  const { minBirthYear, maxBirthYear } = ageRange;
  const serverProves = proveOn === "server" || fellBack;
  // Leaving while Mingle checks and records the proof would not stop it, and
  // its result would still open Mingle later, so the exits wait. Proving
  // keeps Cancel: it is the way out if the circuit download stalls.
  const recording = step === "verifying";
  // Mingle's request is older than 10 minutes, so sharing again cannot work.
  const expired = error?.code === "token-expired";

  const steps = shareSteps({
    t,
    step,
    modes,
    serverProves,
    provingMs,
    waited,
    verifier: request.verifierName,
  });

  return (
    <main className="phone">
      <div className="phone-top">
        {recording ? (
          <span style={{ width: 36 }} />
        ) : (
          <Link className="phone-back" href="/mingle" aria-label={t.common.backToMingle}>
            ‹
          </Link>
        )}
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
            <small>{copy.ageSub(minBirthYear, maxBirthYear)}</small>
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
            <small>{modes.worldId === "simulated" ? copy.simulatedOptional : copy.worldIdOptional}</small>
          </span>
          {modes.worldId === "simulated" ? (
            <Link className="check-now" href={`/wallet/world-id?return=${encodeURIComponent(here)}`}>
              {copy.checkNow}
            </Link>
          ) : (
            <WorldIdButton className="check-now" label={copy.checkNow} onDone={humanAdded} />
          )}
        </div>
      )}

      <p className="fine-print share-privacy">
        {copy.privacy}
        {locale === "ja" ? "" : " "}
        {serverProves ? copy.provedOnServer : copy.provedHere}
      </p>

      <div className="phone-actions">
        {error && <p className="error-banner">{error.message}</p>}
        {busy && (
          <>
            <ProgressSteps label={copy.steps.label} steps={steps} />
            {modes.chain === "sepolia" && <p className="fine-print">{copy.waitingBlock}</p>}
          </>
        )}
        {!busy && !expired && (
          <button type="button" className="btn btn-primary" onClick={share} disabled={!wallet}>
            {copy.submit}
          </button>
        )}
        {error?.code === "nullifier-used" && (
          <button type="button" className="btn btn-outline" onClick={startMingleOver}>
            {copy.startMingleOver}
          </button>
        )}
        {expired && (
          <Link className="btn btn-primary" href={MINGLE_VERIFICATION}>
            {t.common.backToMingle}
          </Link>
        )}
        {!recording && (
          <Link className="btn btn-text" href="/mingle">
            {t.common.cancel}
          </Link>
        )}
        <ModeBadges modes={modes} only={["prover", "chain"]} />
      </div>
    </main>
  );
}
