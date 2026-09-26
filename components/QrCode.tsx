"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useI18n } from "./I18nProvider";

export function QrCode({ value, label }: { value: string; label: string }) {
  const { t } = useI18n();
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      width: 440,
      margin: 3,
      errorCorrectionLevel: "M",
      color: { dark: "#111827", light: "#ffffff" },
    })
      .then((url) => {
        if (!active) return;
        setSrc(url);
        setFailed(false);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [value]);

  if (failed) return <p className="qr-error">{t.counter.qrFailed}</p>;
  if (!src) return <div className="qr-code qr-placeholder" aria-busy="true" />;
  // eslint-disable-next-line @next/next/no-img-element -- data URL, nothing to optimise
  return <img className="qr-code" src={src} alt={label} width={440} height={440} />;
}
