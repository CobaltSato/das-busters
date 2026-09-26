"use client";

import { useI18n } from "@/components/I18nProvider";
import type { HumanRecord } from "@/lib/storage";
import { useWorldIdCheck } from "./useWorldIdCheck";

type Props = { label: string; className: string; onDone: (record: HumanRecord) => void };

// Starts World ID from the screen the holder is on. The request opens over
// it, and when World ID answers, onDone swaps this button for the result.
export function WorldIdButton({ label, className, onDone }: Props) {
  const { t } = useI18n();
  const copy = t.wallet.worldId;
  const { phase, error, notice, start, request } = useWorldIdCheck(onDone);
  // On staging the Simulator opens over the whole screen, so the button keeps
  // its place and spinner until then.
  const waiting = phase.name === "request" && phase.signed.environment === "staging";

  return (
    <>
      {request}
      {(!request || waiting) && (
        <button type="button" className={className} onClick={start} disabled={phase.name !== "ready"}>
          {phase.name === "ready" ? (
            error ? copy.tryAgain : label
          ) : (
            <>
              <span className="spinner is-dark" />
              {phase.name === "verifying" ? copy.verifying : copy.preparing}
            </>
          )}
        </button>
      )}
      {error && <p className="worldid-error">{error}</p>}
      {notice && !error && <p className="worldid-notice" role="status">{notice}</p>}
    </>
  );
}
