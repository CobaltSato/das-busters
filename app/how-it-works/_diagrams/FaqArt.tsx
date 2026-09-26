import type { ReferenceCopy } from "@/lib/i18n/how-it-works/reference.en";
import { ActorIcon } from "../_components/icons";
import { ProofEnvelope } from "./ProofEnvelope";

// Pictures that answer the most important FAQ items. Each one shows the
// answer, so a reader who skips the text still gets it.

type Figs = ReferenceCopy["qa"]["figs"];

export function OnchainArt({ copy }: { copy: Figs["onchain"] }) {
  return (
    <div className="hiw-faq-chain" role="group" aria-label={copy.label}>
      <ActorIcon actor="chain" size={28} />
      <ul>
        {copy.stored.map((item) => (
          <li key={item} className="hiw-chip is-holds">
            {item}
          </li>
        ))}
        {copy.never.map((item) => (
          <li key={item} className="hiw-chip is-never">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Phone on the left, our server top right, Mingle bottom right.
export function ServerArt({ copy }: { copy: Figs["server"] }) {
  return (
    <svg viewBox="0 0 360 172" className="hiw-faq-svg" role="img" aria-label={copy.label}>
      <circle cx="46" cy="82" r="22" className="hiw-fa-node" />
      <ActorIcon actor="phone" size={22} x={35} y={71} />
      <text x="46" y="122" textAnchor="middle" className="hiw-fa-name">
        {copy.phone}
      </text>

      <rect x="212" y="6" width="142" height="50" rx="10" className="hiw-fa-server" />
      <text x="283" y="27" textAnchor="middle" className="hiw-fa-name is-light">
        {copy.server}
      </text>
      <text x="283" y="44" textAnchor="middle" className="hiw-fa-note is-light">
        {copy.keeps}
      </text>

      <path d="M72 70 208 30" className="hiw-fa-line" />
      <path d="M200 27.5l8 2.5-6 5.5" className="hiw-fa-head" />
      <text x="128" y="40" textAnchor="middle" className="hiw-fa-label">
        {copy.send}
      </text>

      <path d="M208 48 74 86" className="hiw-fa-line is-back" />
      <text x="160" y="76" textAnchor="middle" className="hiw-fa-label">
        {copy.back}
      </text>

      <path d="M72 96 272 130" className="hiw-fa-line is-proof" />
      <path d="M264 124.5l8 5.5-8.5 3" className="hiw-fa-head is-proof" />
      <ProofEnvelope line="✓" x={140} y={92} width={44} />
      <text x="162" y="150" textAnchor="middle" className="hiw-fa-label is-proof">
        {copy.onward}
      </text>

      <circle cx="298" cy="132" r="22" className="hiw-fa-node" />
      <ActorIcon actor="mingle" size={22} x={287} y={121} />
      <text x="298" y="168" textAnchor="middle" className="hiw-fa-name">
        {copy.mingle}
      </text>
    </svg>
  );
}

function Key({ x, y, tone }: { x: number; y: number; tone: "own" | "other" }) {
  return (
    <g className={`hiw-fa-key is-${tone}`}>
      <circle cx={x + 7} cy={y} r="6" />
      <path d={`M${x + 13} ${y}h14m-4 0v5m-5-5v4`} />
    </g>
  );
}

export function BorrowArt({ copy }: { copy: Figs["borrow"] }) {
  const rows = [
    { y: 42, key: "own" as const, label: copy.own, result: copy.ok, tone: "is-ok" },
    { y: 96, key: "other" as const, label: copy.other, result: copy.no, tone: "is-no" },
  ];
  return (
    <svg viewBox="0 0 360 150" className="hiw-faq-svg" role="img" aria-label={copy.label}>
      <rect x="8" y="10" width="124" height="104" rx="6" className="hiw-fa-paper" />
      <text x="18" y="30" className="hiw-fa-name">
        {copy.cert}
      </text>
      {[42, 54, 66].map((y) => (
        <rect key={y} x="18" y={y} width={y === 54 ? 70 : 50} height="5" rx="2.5" className="hiw-fa-bar" />
      ))}
      <rect x="18" y="80" width="104" height="24" rx="12" className="hiw-fa-print" />
      <Key x={26} y={92} tone="own" />
      <text x="8" y="138" className="hiw-fa-note">
        {copy.bound}
      </text>
      {rows.map((row) => (
        <g key={row.key}>
          <Key x={150} y={row.y} tone={row.key} />
          <text x="186" y={row.y + 4} className="hiw-fa-label">
            {row.label}
          </text>
          <g className={`hiw-fa-result ${row.tone}`}>
            <rect x="282" y={row.y - 13} width="74" height="26" rx="13" />
            <text x="319" y={row.y + 4} textAnchor="middle">
              {row.result}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}

export function ChecksArt({ copy }: { copy: Figs["checks"] }) {
  return (
    <ol className="hiw-faq-checks" aria-label={copy.label}>
      <li>
        <ActorIcon actor="server" size={20} />
        <strong>{copy.first}</strong>
        <span>{copy.firstNote}</span>
      </li>
      <li>
        <ActorIcon actor="chain" size={20} />
        <strong>{copy.second}</strong>
        <span>{copy.secondNote}</span>
      </li>
      <li className="is-done">
        <strong>{copy.stored}</strong>
      </li>
    </ol>
  );
}
