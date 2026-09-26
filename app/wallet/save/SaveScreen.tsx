"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { CertificateCard } from "@/components/CertificateCard";
import { SuccessMark } from "@/components/SuccessMark";
import { errorMessage, postJson } from "@/lib/api";
import type { Credential, CredentialPreview } from "@/lib/credential";
import { holderCommitment, randomField } from "@/lib/fields";
import { userStore, walletStore, type UserRecord } from "@/lib/storage";

type Props = { offer: string; preview: CredentialPreview };

export function SaveScreen({ offer, preview }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const signedIn = userStore.get();
    if (!signedIn) {
      router.replace(`/wallet/receive?offer=${encodeURIComponent(offer)}`);
      return;
    }
    setUser(signedIn);
    router.prefetch("/wallet/saved");
  }, [offer, router]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      // The secret never leaves the phone at this step: the city office only
      // sees its commitment.
      const holderSecret = randomField();
      const { credential } = await postJson<{ credential: Credential }>("/api/credential", {
        offer,
        holderCommitment: holderCommitment(holderSecret),
      });
      const stored = walletStore.set({ credential, holderSecret, savedAt: new Date().toISOString() });
      if (!stored) {
        throw new Error("This browser would not let us store the certificate. Turn off private browsing and try again.");
      }
      router.push("/wallet/saved");
    } catch (e) {
      setError(errorMessage(e));
      setSaving(false);
    }
  }

  return (
    <main className="phone">
      <div className="phone-top">
        <BrandLockup />
      </div>
      <p className="signed-in">
        <SuccessMark size={40} />
        {user ? `Signed in as ${user.name}` : "Signed in"}
      </p>
      <h1 className="screen-title wallet-heading">Save to this device</h1>
      <p className="screen-lede">
        Access and present your certificate
        <br />
        anytime in DAS Busters.
      </p>
      <div className="wallet-card">
        <CertificateCard certificate={preview} variant="compact" />
      </div>
      <div className="phone-actions">
        {error && <p className="error-banner">{error}</p>}
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving || !user}>
          {saving ? (
            <>
              <span className="spinner" />
              Saving…
            </>
          ) : (
            "Save certificate"
          )}
        </button>
        <p className="fine-print">Stored only on this device.</p>
      </div>
    </main>
  );
}
