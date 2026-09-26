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
  const { phase, error, start, request } = useWorldIdCheck(onDone);

  return (
    <>
      {request}
      {!request && (
        <button type="button" className={className} onClick={start} disabled={phase.name !== "ready"}>
          {phase.name === "ready" ? (
            error ? copy.tryAgain : label
          ) : (
            <>
              <span className="spinner is-dark" />
              {phase.name === "preparing" ? copy.preparing : copy.verifying}
            </>
          )}
        </button>
      )}
      {error && <p className="worldid-error">{error}</p>}
    </>
  );
}
