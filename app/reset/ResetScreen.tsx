"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { SuccessMark } from "@/components/SuccessMark";
import { resetDemoData } from "@/lib/storage";

type Status = "idle" | "done" | "failed";

// One button before each demo run. It clears both apps on this device; the
// counter needs nothing, since every QR code is a fresh offer.
export function ResetScreen() {
  const { t } = useI18n();
  const r = t.reset;
  const [status, setStatus] = useState<Status>("idle");

  return (
    <main className="phone">
      <div className="phone-top reset-top">
        <LanguageToggle />
      </div>
      <h1 className="screen-title">{r.title}</h1>
      <p className="screen-lede">{r.lede}</p>
      <p className="fine-print reset-note">{r.note}</p>
      <div className="phone-actions">
        {status === "done" && (
          <p className="reset-done" role="status">
            <SuccessMark size={28} />
            {r.done}
          </p>
        )}
        {status === "failed" && (
          <p className="error-banner">{t.common.storageBlocked}</p>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setStatus(resetDemoData() ? "done" : "failed")}
        >
          {r.button}
        </button>
        <Link className="btn btn-outline" href="/counter">
          {r.openCounter}
        </Link>
        <Link className="btn btn-text" href="/">
          {r.backToHub}
        </Link>
      </div>
    </main>
  );
}
