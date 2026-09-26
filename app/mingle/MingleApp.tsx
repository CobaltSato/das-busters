"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { errorMessage, postJson } from "@/lib/api";
import type { Modes } from "@/lib/modes";
import type { VerificationResult } from "@/lib/presentation";
import { mingleStore, newEpoch, resetDemoData, type MingleRecord } from "@/lib/storage";
import { EditScreen, HelpScreen, ProfileScreen, SettingsScreen, VerificationScreen, type Screen } from "./screens";

export type Incoming = { result: VerificationResult; token: string } | { error: string } | null;

function freshRecord(): MingleRecord {
  return { epoch: newEpoch(), pendingNonce: null, verification: null };
}

export function MingleApp({ incoming, modes }: { incoming: Incoming; modes: Modes }) {
  const { t } = useI18n();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [record, setRecord] = useState<MingleRecord | null>(null);
  const [screen, setScreen] = useState<Screen>("profile");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once from the incoming result; read through a ref so switching the
  // language does not re-run the effect that accepts it.
  const foreignResult = useRef(t.mingle.foreignResult);

  useEffect(() => {
    let next = mingleStore.get() ?? freshRecord();
    if (incoming && "result" in incoming) {
      const { result, token } = incoming;
      // Accept a result only for the request this browser sent. The check is
      // idempotent so a re-run of the effect does not reject a saved result.
      if (next.pendingNonce === result.nonce) {
        next = { ...next, pendingNonce: null, verification: { ...result, token } };
      } else if (next.verification?.nonce !== result.nonce) {
        setError(foreignResult.current);
      }
    } else if (incoming && "error" in incoming) {
      setError(incoming.error);
    }
    mingleStore.set(next);
    setRecord(next);
    if (incoming) window.history.replaceState(null, "", "/mingle");
  }, [incoming]);

  function save(next: MingleRecord) {
    mingleStore.set(next);
    setRecord(next);
  }

  function go(next: Screen) {
    setError(null);
    setScreen(next);
    window.scrollTo(0, 0);
  }

  async function connect() {
    if (!record) return;
    setConnecting(true);
    setError(null);
    try {
      const { request, nonce } = await postJson<{ request: string; nonce: string }>("/api/request", {
        epoch: record.epoch,
      });
      save({ ...record, pendingNonce: nonce });
      router.push(`/wallet/share?req=${encodeURIComponent(request)}`);
    } catch (e) {
      dialog.current?.close();
      setConnecting(false);
      setError(errorMessage(e, t));
    }
  }

  // Clears both apps, so the next run starts from the counter.
  function resetDemo() {
    if (!resetDemoData()) {
      setError(t.common.storageBlocked);
      return;
    }
    window.location.href = "/";
  }

  const verification = record?.verification ?? null;
  const shared = { error, verification, go };

  switch (screen) {
    case "verification":
      return (
        <VerificationScreen
          {...shared}
          modes={modes}
          dialog={dialog}
          connecting={connecting}
          onConnect={connect}
        />
      );
    case "settings":
      return <SettingsScreen {...shared} onReset={resetDemo} />;
    case "help":
      return <HelpScreen {...shared} />;
    case "edit":
      return <EditScreen {...shared} />;
    default:
      return <ProfileScreen {...shared} />;
  }
}
