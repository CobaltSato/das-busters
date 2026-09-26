"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { CertificateCard } from "@/components/CertificateCard";
import { useI18n } from "@/components/I18nProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ProgressSteps, type StepState } from "@/components/ProgressSteps";
import { errorMessage, postJson } from "@/lib/api";
import type { Credential, CredentialPreview } from "@/lib/credential";
import { holderCommitment } from "@/lib/fields";
import { PRIVY_ENABLED } from "@/lib/privy";
import { userStore, walletStore, type UserRecord } from "@/lib/storage";
import { useHolderSecret } from "../_components/holderKey";

type Props = { offer: string; preview: CredentialPreview };
type Stage = "waiting" | "key" | "issue" | "failed";

// A sign-in record left over from the mock, or a Privy session that has
// ended, would leave the key spinner running forever: sign in again instead.
function needsSignIn(user: UserRecord | null): boolean {
  return !user || (PRIVY_ENABLED && user.provider !== "privy");
}

// Arrives straight from Google sign-in and saves without another tap: the
// holder already chose to receive this certificate on the screen before.
export function SaveScreen({ offer, preview }: Props) {
  const { t } = useI18n();
  const copy = t.wallet.save;
  const router = useRouter();
  const holder = useHolderSecret();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [stage, setStage] = useState<Stage>("waiting");
  const [failedAt, setFailedAt] = useState<"key" | "issue">("key");
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

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
    started.current = true;
    setError(null);
    let at: "key" | "issue" = "key";
    try {
      setStage("key");
      // The secret never leaves the phone at this step: the city office only
      // sees its commitment.
      const holderSecret = await holder.create();
      at = "issue";
      setStage("issue");
      const { credential } = await postJson<{ credential: Credential }>("/api/credential", {
        offer,
        holderCommitment: holderCommitment(holderSecret),
      });
      if (!walletStore.set({ credential, holderSecret, savedAt: new Date().toISOString() })) {
        throw new Error(copy.storeFailed);
      }
      router.push("/wallet/saved");
    } catch (e) {
      setError(errorMessage(e, t));
      setFailedAt(at);
      setStage("failed");
    }
  }

  // Start once, as soon as the key can be made.
  useEffect(() => {
    if (started.current || !user || holder.status !== "ready") return;
    void save();
  });

  function state(step: "key" | "issue"): StepState {
    if (stage === "failed") return step === failedAt ? "failed" : step === "key" ? "done" : "todo";
    if (stage === step) return "active";
    if (step === "key") return stage === "issue" ? "done" : stage === "waiting" ? "active" : "todo";
    return "todo";
  }

  return (
    <main className="phone">
      <div className="phone-top">
        <BrandLockup />
        <LanguageToggle />
      </div>
      <h1 className="screen-title wallet-heading">{stage === "failed" ? copy.title : copy.savingTitle}</h1>
      <div className="wallet-card">
        <CertificateCard certificate={preview} variant="compact" />
      </div>
      <ProgressSteps
        label={copy.savingTitle}
        steps={[
          { key: "account", label: copy.steps.account, detail: user?.name, state: user ? "done" : "active" },
          { key: "key", label: copy.steps.key, detail: copy.steps.keyDetail, state: state("key") },
          { key: "issue", label: copy.steps.issue, detail: copy.steps.issueDetail, state: state("issue") },
        ]}
      />
      <div className="phone-actions">
        {error && <p className="error-banner">{error}</p>}
        {stage === "failed" && (
          <button type="button" className="btn btn-primary" onClick={save}>
            {copy.tryAgain}
          </button>
        )}
        <p className="fine-print">{copy.finePrint}</p>
      </div>
    </main>
  );
}
