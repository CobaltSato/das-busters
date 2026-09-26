"use client";

import { useCallback, useEffect, useState } from "react";
import { QrCode } from "@/components/QrCode";
import { errorMessage, postJson } from "@/lib/api";

type Offer = { offer: string; expiresAt: number };

const ISSUED_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_DEMO_BASE_URL?.replace(/\/$/, "") ?? window.location.origin;
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function CounterScreen() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      setOffer(await postJson<Offer>("/api/offer", {}));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  useEffect(() => {
    refresh();
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const remaining = offer && now ? offer.expiresAt - now : null;

  useEffect(() => {
    if (remaining !== null && remaining <= 0) refresh();
  }, [remaining, refresh]);

  const receiveUrl = offer ? `${baseUrl()}/wallet/receive?offer=${offer.offer}` : null;

  return (
    <main className="counter">
      <header className="counter-header">
        <div className="office">
          <span className="office-emblem" aria-hidden="true">
            S
          </span>
          <div>
            <strong>Shibuya City</strong>
            <span>Family Registration and Resident Services</span>
          </div>
        </div>
        <div className="counter-number">
          <span>Service counter</span>
          <strong>03</strong>
        </div>
      </header>

      <section className="counter-content">
        <div className="counter-copy">
          <h1>
            Receive your
            <br />
            Single Status Certificate
          </h1>
          <p>
            Scan the QR code
            <br />
            with your phone’s camera.
          </p>
        </div>

        <div className="qr-panel">
          <div className="qr-panel-heading">
            <span>Certificate pickup QR code</span>
            <span className="demo-chip">Demo</span>
          </div>
          {receiveUrl ? (
            <QrCode value={receiveUrl} label="QR code for receiving a Single Status Certificate" />
          ) : (
            <div className="qr-code qr-placeholder" aria-busy={!error} />
          )}
          {error && <p className="qr-error">{error}</p>}
          <div className="qr-expiry">
            <span>Valid for 3 minutes</span>
            <strong>{remaining === null ? "3:00" : formatRemaining(remaining)}</strong>
          </div>
          <p>The QR code refreshes automatically when it expires.</p>
        </div>
      </section>

      <footer className="counter-footer">
        <span>{now ? `Issued: ${ISSUED_FORMAT.format(now)}` : " "}</span>
        <span>DAS Busters Digital Certificate Issuance System</span>
      </footer>

      {receiveUrl && (
        <a className="counter-preview-link" href={receiveUrl}>
          Open the phone flow on this device
        </a>
      )}
    </main>
  );
}
