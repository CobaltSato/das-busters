"use client";

import { proofOfHuman, useIDKitRequest, type IDKitResult, type RpContext } from "@worldcoin/idkit";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { QrCode } from "@/components/QrCode";
import type { HumanEnvironment } from "@/lib/presentation";

export type SignedRequest = {
  appId: `app_${string}`;
  action: string;
  environment: HumanEnvironment;
  rpContext: RpContext;
};

type Props = {
  signed: SignedRequest;
  onResult: (result: IDKitResult) => void;
  onFailed: (code: string) => void;
  onCancel: () => void;
};

// The Simulator opens a request passed as connect_url. On staging it opens over
// this screen rather than in another tab: a phone that switches tabs may freeze
// or reload this one, and then the answer never arrives. The Simulator can read
// a request only once, so closing it cancels, and the next try signs a new one.
const SIMULATOR_URL = "https://simulator.worldcoin.org/";

// One World ID request. Loaded only in the browser, because IDKit brings its
// own WASM.
export default function IdkitRequest({ signed, onResult, onFailed, onCancel }: Props) {
  const { t } = useI18n();
  const copy = t.wallet.worldId;
  const flow = useIDKitRequest({
    app_id: signed.appId,
    action: signed.action,
    rp_context: signed.rpContext,
    environment: signed.environment,
    allow_legacy_proofs: true,
    preset: proofOfHuman(),
  });
  const reported = useRef(false);
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const { open, isSuccess, isError, result, errorCode, connectorURI } = flow;

  useEffect(() => {
    open();
  }, [open]);

  useEffect(() => {
    if (reported.current) return;
    if (isSuccess && result) {
      reported.current = true;
      onResult(result);
    } else if (isError) {
      reported.current = true;
      onFailed(errorCode ?? "generic_error");
    }
  }, [isSuccess, isError, result, errorCode, onResult, onFailed]);

  async function copyLink() {
    if (!connectorURI) return;
    try {
      await navigator.clipboard.writeText(connectorURI);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
  }

  if (signed.environment === "staging") {
    return (
      <div className="worldid-request">
        <p className="worldid-status" role="status">
          <span className="spinner is-dark" />
          {copy.openingSimulator}
        </p>
        {connectorURI && (
          <div className="simulator-sheet" role="dialog" aria-modal="true" aria-label={copy.simulatorTitle}>
            <div className="simulator-bar">
              <strong>{copy.simulatorTitle}</strong>
              <button type="button" aria-label={copy.cancel} onClick={onCancel}>
                ×
              </button>
            </div>
            <p className="simulator-hint">{copy.simulatorHint}</p>
            <iframe
              src={`${SIMULATOR_URL}?connect_url=${encodeURIComponent(connectorURI)}`}
              title={copy.simulatorTitle}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="worldid-request">
      <h2>{copy.scanTitle}</h2>
      <p>{copy.scanBody}</p>
      {connectorURI ? (
        <QrCode value={connectorURI} label={copy.qrLabel} />
      ) : (
        <div className="qr-code qr-placeholder" aria-busy="true" />
      )}
      <p className="worldid-status" role="status">
        <span className="spinner is-dark" />
        {flow.isAwaitingUserConfirmation ? copy.confirming : copy.waiting}
      </p>
      {connectorURI && (
        <a className="btn btn-primary" href={connectorURI}>
          {copy.openWorldApp}
        </a>
      )}
      {connectorURI && (
        <button type="button" className="btn btn-outline" onClick={copyLink}>
          {copied === "done" ? copy.copied : copy.copyLink}
        </button>
      )}
      {copied === "failed" && <p className="fine-print">{copy.copyFailed}</p>}
    </div>
  );
}
