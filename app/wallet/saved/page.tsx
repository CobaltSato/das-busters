"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { CertificateCard } from "@/components/CertificateCard";
import { SuccessMark } from "@/components/SuccessMark";
import { walletStore, type WalletRecord } from "@/lib/storage";

export default function SavedPage() {
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
        <h1>Certificate saved</h1>
        <p>You can access it anytime from Home.</p>
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
              Opening home…
            </>
          ) : (
            "Go to home"
          )}
        </button>
      </div>
    </main>
  );
}
