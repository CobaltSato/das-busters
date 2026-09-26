"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { CertificateCard } from "@/components/CertificateCard";
import { useI18n } from "@/components/I18nProvider";
import { SuccessMark } from "@/components/SuccessMark";
import { walletStore, type WalletRecord } from "@/lib/storage";

export default function SavedPage() {
  const { t } = useI18n();
  const copy = t.wallet.saved;
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletRecord | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    setWallet(walletStore.get());
    router.prefetch("/wallet");
  }, [router]);

  return (
    <main className="phone">
      <div className="phone-top">
        <BrandLockup />
      </div>
      <section className="saved-hero">
        <SuccessMark size={64} />
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
      </section>
      {wallet && (
        <div className="wallet-card">
          <CertificateCard certificate={wallet.credential} variant="compact" />
        </div>
      )}
      <div className="phone-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={opening}
          onClick={() => {
            setOpening(true);
            router.push("/wallet");
          }}
        >
          {opening ? (
            <>
              <span className="spinner" />
              {copy.opening}
            </>
          ) : (
            copy.goHome
          )}
        </button>
      </div>
    </main>
  );
}
