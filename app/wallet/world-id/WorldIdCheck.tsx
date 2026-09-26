"use client";

import type { IDKitResult } from "@worldcoin/idkit";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { useI18n } from "@/components/I18nProvider";
import { errorMessage, postJson } from "@/lib/api";
import type { HumanEnvironment } from "@/lib/presentation";
import { humanStore } from "@/lib/storage";
import type { SignedRequest } from "./IdkitRequest";

const IdkitRequest = dynamic(() => import("./IdkitRequest"), { ssr: false });

type Phase =
  | { name: "ready" }
  | { name: "preparing" }
  | { name: "request"; signed: SignedRequest }
  | { name: "verifying" }
  | { name: "done"; environment: HumanEnvironment };

type Verified = { environment: HumanEnvironment; verifiedAt: string; token: string };

// World ID through IDKit. The server signs the request and checks the answer
// with the Developer Portal; this screen only carries them back and forth.
export function WorldIdCheck({ returnTo, environment }: { returnTo: string; environment: HumanEnvironment }) {
  const { t } = useI18n();
  const copy = t.wallet.worldId;
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ name: "ready" });
  const [error, setError] = useState<string | null>(null);
  const staging = environment === "staging";

  async function start() {
    setError(null);
    setPhase({ name: "preparing" });
    try {
      const signed = await postJson<SignedRequest>("/api/world-id/rp-context", {});
      setPhase({ name: "request", signed });
    } catch (e) {
      setError(errorMessage(e, t));
      setPhase({ name: "ready" });
    }
  }

  const verify = useCallback(
    async (result: IDKitResult) => {
      setPhase({ name: "verifying" });
      try {
        const verified = await postJson<Verified>("/api/world-id/verify", result);
        const saved = humanStore.set({
          check: "world-id",
          verifiedAt: verified.verifiedAt,
          environment: verified.environment,
          token: verified.token,
        });
        if (!saved) {
          setError(copy.storeFailed);
          setPhase({ name: "ready" });
          return;
        }
        setPhase({ name: "done", environment: verified.environment });
      } catch (e) {
        setError(errorMessage(e, t));
        setPhase({ name: "ready" });
      }
    },
    [copy, t],
  );

  const cancel = useCallback(() => setPhase({ name: "ready" }), []);

  const fail = useCallback(
    (code: string) => {
      setError(copy.failed(code));
      setPhase({ name: "ready" });
    },
    [copy],
  );

  const header = (
    <div className="phone-top">
      <button type="button" className="phone-back" aria-label={t.common.back} onClick={() => router.push(returnTo)}>
        ‹
      </button>
      <BrandLockup small />
      <span style={{ width: 36 }} />
    </div>
  );

  if (phase.name === "done") {
    return (
      <main className="phone">
        {header}
        <section className="selfie-result">
          <div className="selfie-check" aria-hidden="true">
            ✓
          </div>
          <h1>{copy.complete}</h1>
          <p>{phase.environment === "production" ? copy.completeBody : copy.completeBodyStaging}</p>
        </section>
        <div className="phone-actions">
          <button type="button" className="btn btn-primary" onClick={() => router.push(returnTo)}>
            {t.common.continue}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="phone">
      {header}
      <div className="selfie-heading">
        <h1 className="screen-title">{copy.title}</h1>
        <p>{staging ? copy.subtitleStaging : copy.subtitle}</p>
      </div>
      {phase.name === "request" ? (
        <IdkitRequest signed={phase.signed} onResult={verify} onFailed={fail} onCancel={cancel} />
      ) : (
        <div className="selfie-copy">
          <p>{copy.intro}</p>
          {staging && (
            <>
              <p>{copy.introStaging}</p>
              <ol className="worldid-steps">
                {copy.stagingSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
      <div className="phone-actions">
        {error && <p className="error-banner">{error}</p>}
        {phase.name === "request" ? (
          <button type="button" className="btn btn-text" onClick={cancel}>
            {copy.cancel}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={start} disabled={phase.name !== "ready"}>
            {phase.name === "ready" ? (
              error ? copy.tryAgain : copy.start
            ) : (
              <>
                <span className="spinner" />
                {phase.name === "preparing" ? copy.preparing : copy.verifying}
              </>
            )}
          </button>
        )}
        <p className="fine-print">{copy.finePrint}</p>
      </div>
    </main>
  );
}
