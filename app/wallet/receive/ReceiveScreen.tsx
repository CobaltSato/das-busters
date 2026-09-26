"use client";

import { BrandLockup } from "@/components/BrandLockup";
import { CertificateCard } from "@/components/CertificateCard";
import { useI18n } from "@/components/I18nProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import type { CredentialPreview } from "@/lib/credential";
import { GoogleSignIn } from "../_components/GoogleSignIn";

type Props = { offer: string; preview: CredentialPreview };

export function ReceiveScreen({ offer, preview }: Props) {
  const { t } = useI18n();
  const [first, second] = t.wallet.receive.title;
  return (
    <main className="phone">
      <div className="phone-top">
        <BrandLockup />
        <LanguageToggle />
      </div>
      <h1 className="screen-title wallet-heading">
        {first}
        <br />
        {second}
      </h1>
      <div className="wallet-card">
        <CertificateCard certificate={preview} />
      </div>
      <div className="phone-actions">
        {/* A full page load, so it cannot race Privy's own URL cleanup. */}
        <GoogleSignIn onSignedIn={() => window.location.assign(`/wallet/save?offer=${encodeURIComponent(offer)}`)} />
        <p className="fine-print">{t.wallet.receive.sample}</p>
        <p className="fine-print">{t.wallet.receive.whySignIn}</p>
      </div>
    </main>
  );
}
