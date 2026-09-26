"use client";

import type { IDKitResult } from "@worldcoin/idkit";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/components/I18nProvider";
import { errorMessage, postJson } from "@/lib/api";
import type { HumanEnvironment } from "@/lib/presentation";
import { humanStore, type HumanRecord } from "@/lib/storage";
import type { SignedRequest } from "./IdkitRequest";

const IdkitRequest = dynamic(() => import("./IdkitRequest"), { ssr: false });

export type WorldIdPhase =
  | { name: "ready" }
  | { name: "preparing" }
  | { name: "request"; signed: SignedRequest }
  | { name: "verifying" }
  | { name: "done"; record: HumanRecord };

type Verified = { environment: HumanEnvironment; verifiedAt: string; token: string };

export type WorldIdCheck = {
  phase: WorldIdPhase;
  error: string | null;
  start: () => Promise<void>;
  cancel: () => void;
  // The open request: the Simulator over the screen on staging, the World App
  // code on production. Null when no request is open.
  request: ReactNode;
};

// One World ID request, from the server signing it to storing the result.
// The server checks the answer with the Developer Portal; this hook only
// carries it back and forth. The request opens over whatever screen started
// it, so the holder ends up where they were.
export function useWorldIdCheck(onDone?: (record: HumanRecord) => void): WorldIdCheck {
  const { t } = useI18n();
  const copy = t.wallet.worldId;
  const [phase, setPhase] = useState<WorldIdPhase>({ name: "ready" });
  const [error, setError] = useState<string | null>(null);
  const done = useRef(onDone);

  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

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
        const record: HumanRecord = {
          check: "world-id",
          verifiedAt: verified.verifiedAt,
          environment: verified.environment,
          token: verified.token,
        };
        if (!humanStore.set(record)) {
          setError(copy.storeFailed);
          setPhase({ name: "ready" });
          return;
        }
        setPhase({ name: "done", record });
        done.current?.(record);
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

  const request =
    phase.name === "request" ? (
      <IdkitRequest signed={phase.signed} onResult={verify} onFailed={fail} onCancel={cancel} />
    ) : null;

  return { phase, error, start, cancel, request };
}
