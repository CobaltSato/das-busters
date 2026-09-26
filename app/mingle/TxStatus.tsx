"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

type Status = { status: "pending" | "confirmed" | "reverted"; blockNumber?: string };

const POLL_MS = 3000;
const MAX_POLLS = 40;

// Blockscout has the contracts' source, so its logs tab shows the event
// decoded; Etherscan would show raw hex.
function explorerUrl(txHash: string): string {
  return `https://eth-sepolia.blockscout.com/tx/${txHash}?tab=logs`;
}

// Polls /api/tx until the relayer's transaction lands on Sepolia.
function useTxStatus(txHash: string): { state: Status; gaveUp: boolean } {
  const [state, setState] = useState<Status>({ status: "pending" });
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let polls = 0;
    let timer: number | undefined;
    let active = true;
    async function poll() {
      polls += 1;
      try {
        const res = await fetch(`/api/tx?hash=${txHash}`);
        const data = (await res.json()) as Status;
        if (!active) return;
        if (res.ok) setState(data);
        if (res.ok && data.status !== "pending") return;
      } catch {
        // Network blip: try again on the next tick.
      }
      if (polls >= MAX_POLLS) {
        setGaveUp(true);
        return;
      }
      timer = window.setTimeout(poll, POLL_MS);
    }
    poll();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [txHash]);

  return { state, gaveUp };
}

export function TxStatus({ txHash }: { txHash: string }) {
  const { t } = useI18n();
  const { state, gaveUp } = useTxStatus(txHash);
  const label =
    state.status === "confirmed"
      ? t.tx.recorded(state.blockNumber ?? "")
      : state.status === "reverted"
        ? t.tx.failed
        : gaveUp
          ? t.tx.sent
          : t.tx.recording;
  return (
    <a href={explorerUrl(txHash)} target="_blank" rel="noreferrer">
      {label}{"\u00a0"}↗
    </a>
  );
}

// The transaction's address under the profile badges, shown only once the
// block has landed, so what it links to is already on Sepolia.
export function TxUrl({ txHash }: { txHash: string }) {
  const { t } = useI18n();
  const { state } = useTxStatus(txHash);
  if (state.status !== "confirmed") return null;
  return (
    <a className="mingle-tx" href={explorerUrl(txHash)} target="_blank" rel="noreferrer">
      <span>{t.tx.transaction}{"\u00a0"}↗</span>
      <code>eth-sepolia.blockscout.com/tx/{txHash.slice(0, 8)}…{txHash.slice(-5)}</code>
    </a>
  );
}
