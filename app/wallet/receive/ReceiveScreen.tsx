"use client";

import { BrandLockup } from "@/components/BrandLockup";
import { CertificateCard } from "@/components/CertificateCard";
import type { CredentialPreview } from "@/lib/credential";
import { GoogleSignIn } from "../_components/GoogleSignIn";

type Props = { offer: string; preview: CredentialPreview };

export function ReceiveScreen({ offer, preview }: Props) {
  return (
    <main className="phone">
      <div className="phone-top">
        <BrandLockup />
      </div>
      <h1 className="screen-title wallet-heading">
        Receive your
        <br />
        certificate
      </h1>
      <div className="wallet-card">
        <CertificateCard certificate={preview} />
      </div>
      <div className="phone-actions">
        {/* A full page load, so it cannot race Privy's own URL cleanup. */}
        <GoogleSignIn onSignedIn={() => window.location.assign(`/wallet/save?offer=${encodeURIComponent(offer)}`)} />
      </div>
    </main>
  );
}
