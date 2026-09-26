"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { QrCode } from "@/components/QrCode";
import { errorMessage, postJson } from "@/lib/api";

type Offer = { offer: string; expiresAt: number };

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_DEMO_BASE_URL?.replace(/\/$/, "") ?? window.location.origin;
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function formatIssued(locale: string, when: number): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(when);
}

export function CounterScreen() {
  const { locale, t } = useI18n();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      setOffer(await postJson<Offer>("/api/offer", {}));
      setError(null);
    } catch (e) {
      setError(errorMessage(e, t));
    }
  }, [t]);

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

  // The phone opens in the counter's language.
  const receiveUrl = offer ? `${baseUrl()}/wallet/receive?offer=${offer.offer}&lang=${locale}` : null;
  const c = t.counter;

  return (
    <main className="counter">
      <header className="counter-header">
        <div className="office">
          <span className="office-emblem" aria-hidden="true">
            S
          </span>
          <div>
            <strong>{c.office}</strong>
            <span>{c.department}</span>
          </div>
        </div>
        <div className="counter-header-side">
          <LanguageToggle />
          <div className="counter-number">
            <span>{c.serviceCounter}</span>
            <strong>03</strong>
          </div>
        </div>
      </header>

      <section className="counter-content">
        <div className="counter-copy">
          <h1>
            {c.title[0]}
            <br />
            {c.title[1]}
          </h1>
          <p>
            {c.scan[0]}
            <br />
            {c.scan[1]}
          </p>
        </div>

        <div className="qr-panel">
          <div className="qr-panel-heading">
            <span>{c.qrHeading}</span>
            <span className="demo-chip">{c.demo}</span>
          </div>
          {receiveUrl ? (
            <QrCode value={receiveUrl} label={c.qrLabel} />
          ) : (
            <div className="qr-code qr-placeholder" aria-busy={!error} />
          )}
          {error && <p className="qr-error">{error}</p>}
          <div className="qr-expiry">
            <span>{c.validFor}</span>
            <strong>{remaining === null ? "3:00" : formatRemaining(remaining)}</strong>
          </div>
          <p>{c.refreshes}</p>
        </div>
      </section>

      <footer className="counter-footer">
        <span>{now ? c.issued(formatIssued(t.dateLocale, now)) : " "}</span>
        <span>{c.system}</span>
      </footer>

      {receiveUrl && (
        <a className="counter-preview-link" href={receiveUrl}>
          {c.preview}
        </a>
      )}
    </main>
  );
}
