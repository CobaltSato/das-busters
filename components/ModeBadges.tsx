import type { Modes } from "@/lib/modes";

// Says out loud which parts of the flow are real and which are stand-ins.
const LABELS: Record<keyof Modes, Record<string, { text: string; live: boolean }>> = {
  auth: {
    mock: { text: "Sign-in: mock", live: false },
    privy: { text: "Sign-in: Google via Privy", live: true },
  },
  prover: {
    mock: { text: "Proof: mock", live: false },
    groth16: { text: "Proof: Groth16", live: true },
  },
  chain: {
    off: { text: "Verified off-chain", live: false },
    sepolia: { text: "Recorded on Sepolia", live: true },
  },
  worldId: {
    simulated: { text: "Human check: simulated", live: false },
    idkit: { text: "Human check: World ID", live: true },
  },
};

export function ModeBadges({ modes, only, className }: { modes: Modes; only?: (keyof Modes)[]; className?: string }) {
  const keys = only ?? (Object.keys(LABELS) as (keyof Modes)[]);
  return (
    <div className={className ? `mode-row ${className}` : "mode-row"}>
      {keys.map((key) => {
        const label = LABELS[key][modes[key]];
        return (
          <span key={key} className={label.live ? "mode-badge is-live" : "mode-badge"}>
            {label.text}
          </span>
        );
      })}
    </div>
  );
}
