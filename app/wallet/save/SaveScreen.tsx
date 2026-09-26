"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { CertificateCard } from "@/components/CertificateCard";
import { useI18n } from "@/components/I18nProvider";
import { SuccessMark } from "@/components/SuccessMark";
import { errorMessage, postJson } from "@/lib/api";
import type { Credential, CredentialPreview } from "@/lib/credential";
import { holderCommitment } from "@/lib/fields";
import { PRIVY_ENABLED } from "@/lib/privy";
import { userStore, walletStore, type UserRecord } from "@/lib/storage";
import { useHolderSecret } from "../_components/holderKey";

type Props = { offer: string; preview: CredentialPreview };

// A sign-in record left over from the mock, or a Privy session that has
// ended, would leave the key spinner running forever: sign in again instead.
function needsSignIn(user: UserRecord | null): boolean {
  return !user || (PRIVY_ENABLED && user.provider !== "privy");
}

export function SaveScreen({ offer, preview }: Props) {
  const { t } = useI18n();
  const copy = t.wallet.save;
  const router = useRouter();
  const holder = useHolderSecret();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const signedIn = userStore.get();
    if (needsSignIn(signedIn) || holder.status === "signed-out") {
      userStore.clear();
      router.replace(`/wallet/receive?offer=${encodeURIComponent(offer)}`);
      return;
    }
    setUser(signedIn);
    router.prefetch("/wallet/saved");
  }, [offer, router, holder.status]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      // The secret never leaves the phone at this step: the city office only
      // sees its commitment.
      const holderSecret = await holder.create();
      const { credential } = await postJson<{ credential: Credential }>("/api/credential", {
        offer,
        holderCommitment: holderCommitment(holderSecret),
      });
      const stored = walletStore.set({ credential, holderSecret, savedAt: new Date().toISOString() });
      if (!stored) {
        throw new Error(copy.storeFailed);
      }
      router.push("/wallet/saved");
    } catch (e) {
      setError(errorMessage(e, t));
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
        {user ? copy.signedInAs(user.name) : copy.signedIn}
      </p>
      <h1 className="screen-title wallet-heading">{copy.title}</h1>
      <p className="screen-lede">
        {copy.lede[0]}
        <br />
        {copy.lede[1]}
      </p>
      <div className="wallet-card">
        <CertificateCard certificate={preview} variant="compact" />
      </div>
      <div className="phone-actions">
        {error && <p className="error-banner">{error}</p>}
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving || !user || holder.status !== "ready"}>
          {holder.status !== "ready" ? (
            <>
              <span className="spinner" />
              {copy.preparingKey}
            </>
          ) : saving ? (
            <>
              <span className="spinner" />
              {copy.saving}
            </>
          ) : (
            copy.save
          )}
        </button>
        <p className="fine-print">{copy.finePrint}</p>
      </div>
    </main>
  );
}
