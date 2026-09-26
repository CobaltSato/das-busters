"use client";

import { useRouter } from "next/navigation";
import { BrandLockup } from "@/components/BrandLockup";
import { useI18n } from "@/components/I18nProvider";
import type { HumanEnvironment } from "@/lib/presentation";
import { useWorldIdCheck } from "./useWorldIdCheck";

// World ID as a page of its own, for links from outside the wallet. The
// home screen and the share screen run the same check in place.
export function WorldIdCheck({ returnTo, environment }: { returnTo: string; environment: HumanEnvironment }) {
  const { t } = useI18n();
  const copy = t.wallet.worldId;
  const router = useRouter();
  const { phase, error, start, cancel, request } = useWorldIdCheck();
  const staging = environment === "staging";

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
          <p>{phase.record.environment === "production" ? copy.completeBody : copy.completeBodyStaging}</p>
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
      {request ?? (
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
        {request ? (
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
