import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import { ActorIcon } from "../_components/icons";
import { ProofEnvelope } from "./ProofEnvelope";

// The 30-second pitch as three frames: a copy leaks every field, a proof
// (the window envelope) carries one line, and the chain keeps one number.
// Each frame is a small SVG on a 160×80 grid.

type Pitch = StoryCopy["hero"]["pitch"];
type Strip = StoryCopy["why"]["diagram"];

const ROWS = [20, 30, 40, 50];

function ProblemArt() {
  return (
    <svg viewBox="0 0 160 80" className="hiw-strip-art" aria-hidden="true">
      <rect x="10" y="8" width="46" height="64" rx="5" className="hiw-sa-paper" />
      {ROWS.map((y) => (
        <rect key={y} x="18" y={y} width="30" height="4" rx="2" className="hiw-sa-bar is-leak" />
      ))}
      <rect x="98" y="8" width="52" height="64" rx="6" className="hiw-sa-paper" />
      <ActorIcon actor="mingle" size={16} x={116} y={12} />
      {ROWS.map((y, i) => (
        <g key={y}>
          <rect
            x="18"
            y={y + 14}
            width="30"
            height="4"
            rx="2"
            className="hiw-sa-fly is-leak"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
          <rect
            x="108"
            y={y + 14}
            width="32"
            height="4"
            rx="2"
            className="hiw-sa-arrive is-leak"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        </g>
      ))}
    </svg>
  );
}

function ProofArt() {
  return (
    <svg viewBox="0 0 160 80" className="hiw-strip-art" aria-hidden="true">
      <ActorIcon actor="phone" size={30} x={6} y={25} />
      <path d="M40 40h12" className="hiw-sa-wire" />
      <ProofEnvelope line="✓" x={54} y={24} width={48} />
      <path d="M100 40h10" className="hiw-sa-wire" />
      <rect x="112" y="8" width="42" height="64" rx="6" className="hiw-sa-paper" />
      <ActorIcon actor="mingle" size={16} x={125} y={12} />
      <circle r="3" cx="40" cy="40" className="hiw-sa-dot hiw-motion" />
      <rect x="120" y="44" width="26" height="6" rx="3" className="hiw-sa-arrive is-safe" />
    </svg>
  );
}

function RecordArt({ strip }: { strip: Strip }) {
  return (
    <svg viewBox="0 0 160 80" className="hiw-strip-art" aria-hidden="true">
      <ActorIcon actor="chain" size={34} x={22} y={6} />
      <g className="hiw-sa-number">
        <rect x="6" y="48" width="66" height="20" rx="10" />
        <text x="39" y="61.5" textAnchor="middle">
          1843…7715
        </text>
      </g>
      {strip.fields.slice(0, 2).map((field, i) => (
        <g key={field} className="hiw-sa-struck">
          <rect x="88" y={20 + i * 26} width="64" height="18" rx="9" />
          <text x="120" y={32.5 + i * 26} textAnchor="middle" textDecoration="line-through">
            {field}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function PitchStrip({ copy, strip }: { copy: Pitch; strip: Strip }) {
  const frames = [
    { key: "problem", art: <ProblemArt /> },
    { key: "proof", art: <ProofArt /> },
    { key: "record", art: <RecordArt strip={strip} /> },
  ] as const;
  return (
    <ol className="hiw-strip">
      {frames.map(({ key, art }) => (
        <li key={key} className="hiw-strip-frame">
          {art}
          <h3>{copy[key].title}</h3>
          <p>{copy[key].body}</p>
        </li>
      ))}
    </ol>
  );
}
