"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { errorMessage, postJson } from "@/lib/api";
import type { Modes } from "@/lib/modes";
import type { VerificationResult } from "@/lib/presentation";
import { mingleStore, newEpoch, type MingleRecord } from "@/lib/storage";
import { EditScreen, HelpScreen, ProfileScreen, SettingsScreen, VerificationScreen, type Screen } from "./screens";

export type Incoming = { result: VerificationResult; token: string } | { error: string } | null;

function freshRecord(): MingleRecord {
  return { epoch: newEpoch(), pendingNonce: null, verification: null };
}

export function MingleApp({ incoming, modes }: { incoming: Incoming; modes: Modes }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [record, setRecord] = useState<MingleRecord | null>(null);
  const [screen, setScreen] = useState<Screen>("profile");
  const [connecting, setConnecting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let next = mingleStore.get() ?? freshRecord();
    if (incoming && "result" in incoming) {
      const { result, token } = incoming;
      // Accept a result only for the request this browser sent. The check is
      // idempotent so a re-run of the effect does not reject a saved result.
      if (next.verification?.nonce === result.nonce) {
        setNotice("Single status verified");
      } else if (next.pendingNonce === result.nonce) {
        next = { ...next, pendingNonce: null, verification: { ...result, token } };
        setNotice("Single status verified");
      } else {
        setError("This result is for a request Mingle did not send. Start the verification again.");
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
    setNotice(null);
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
      setError(errorMessage(e));
    }
  }

  function resetDemo() {
    save(freshRecord());
    go("profile");
  }

  const verification = record?.verification ?? null;
  const shared = { notice, error, verification, go };

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
