"use client";

import { proofOfHuman, useIDKitRequest, type IDKitResult, type RpContext } from "@worldcoin/idkit";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { QrCode } from "@/components/QrCode";
import type { HumanEnvironment } from "@/lib/presentation";

// The Simulator opens a request passed as connect_url, so a phone can run the
// whole staging flow without a second device.
const SIMULATOR_URL = "https://simulator.worldcoin.org/";

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
};

// One World ID request: shows the connector link as a QR code and waits for
// World App (or the Simulator on staging) to answer. Loaded only in the
// browser, because IDKit brings its own WASM.
export default function IdkitRequest({ signed, onResult, onFailed }: Props) {
  const { t } = useI18n();
  const copy = t.wallet.worldId;
  const staging = signed.environment === "staging";
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

  return (
    <div className="worldid-request">
      <h2>{staging ? copy.scanTitleStaging : copy.scanTitle}</h2>
      <p>{staging ? copy.scanBodyStaging : copy.scanBody}</p>
      {connectorURI ? (
        <QrCode value={connectorURI} label={copy.qrLabel} />
      ) : (
        <div className="qr-code qr-placeholder" aria-busy="true" />
      )}
      <p className="worldid-status" role="status">
        <span className="spinner is-dark" />
        {flow.isAwaitingUserConfirmation ? copy.confirming : copy.waiting}
      </p>
      {connectorURI && staging && (
        <a
          className="btn btn-primary"
          href={`${SIMULATOR_URL}?connect_url=${encodeURIComponent(connectorURI)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {copy.openSimulator}
        </a>
      )}
      {connectorURI && !staging && (
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
