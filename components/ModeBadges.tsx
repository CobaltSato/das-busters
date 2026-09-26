"use client";

import type { Modes } from "@/lib/modes";
import { useI18n } from "./I18nProvider";

// Says out loud which parts of the flow are real and which are stand-ins.
const LIVE: { [K in keyof Modes]: Modes[K] } = {
  auth: "privy",
  prover: "groth16",
  chain: "sepolia",
  worldId: "idkit",
};

const ALL = Object.keys(LIVE) as (keyof Modes)[];

export function ModeBadges({ modes, only, className }: { modes: Modes; only?: (keyof Modes)[]; className?: string }) {
  const { t } = useI18n();
  const labels = t.modes as Record<keyof Modes, Record<string, string>>;
  return (
    <div className={className ? `mode-row ${className}` : "mode-row"}>
      {(only ?? ALL).map((key) => (
        <span key={key} className={modes[key] === LIVE[key] ? "mode-badge is-live" : "mode-badge"}>
          {labels[key][modes[key]]}
        </span>
      ))}
    </div>
  );
}
