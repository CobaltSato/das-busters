import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import { ActorIcon, LockGlyph } from "../_components/icons";

// One small picture per basic idea, on a 240×96 grid. Labels come from
// the copy so they translate; motion is one loop per picture.

type Basics = StoryCopy["basics"];

function Paper({ x, rows, edited }: { x: number; rows: number[]; edited?: number }) {
  return (
    <>
      <rect x={x} y="8" width="80" height="58" rx="5" className="hiw-ma-paper" />
      {rows.map((width, i) => (
        <rect key={i} x={x + 10} y={22 + i * 10} width={width} height="4" rx="2" className="hiw-ma-bar" />
      ))}
      {edited !== undefined && (
        <rect x={x + 8} y={19 + edited * 10} width={rows[edited] + 4} height="10" rx="3" className="hiw-ma-edited" />
      )}
    </>
  );
}

function Stamp({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  return (
    <g className="hiw-ma-stamp" style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <circle cx={cx} cy={cy} r="13" />
      <text x={cx} y={cy + 3} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

export function StampArt({ copy }: { copy: Basics["signature"]["art"] }) {
  return (
    <svg viewBox="0 0 240 96" className="hiw-mini-art" role="img" aria-label={`${copy.doc}: ${copy.ok}. ${copy.edited}: ${copy.broken}`}>
      <Paper x={12} rows={[36, 50, 28]} />
      <text x="22" y="18" className="hiw-ma-title">
        {copy.doc}
      </text>
      <Stamp cx={80} cy={57} label={copy.stamp} />
      <g className="hiw-ma-pill is-ok">
        <rect x="12" y="72" width="80" height="18" rx="9" />
        <text x="52" y="84" textAnchor="middle">
          {copy.ok}
        </text>
      </g>

      <Paper x={148} rows={[36, 50, 28]} edited={1} />
      <text x="158" y="18" className="hiw-ma-title">
        {copy.doc}
      </text>
      <text x="160" y="38.5" className="hiw-ma-edited-text">
        {copy.edited}
      </text>
      <Stamp cx={216} cy={57} label={copy.stamp} />
      <g className="hiw-ma-pill is-broken">
        <rect x="148" y="72" width="80" height="18" rx="9" />
        <text x="188" y="84" textAnchor="middle">
          {copy.broken}
        </text>
      </g>
    </svg>
  );
}

export function HashArt({ copy }: { copy: Basics["hash"]["art"] }) {
  return (
    <svg viewBox="0 0 240 96" className="hiw-mini-art" role="img" aria-label={`${copy.input} → ${copy.machine} → ${copy.output}`}>
      <rect x="8" y="32" width="64" height="30" rx="8" className="hiw-ma-chip" />
      <text x="40" y="51" textAnchor="middle" className="hiw-ma-chip-text">
        {copy.input}
      </text>
      <path d="M72 47h24" className="hiw-ma-wire" />
      <rect x="96" y="20" width="56" height="54" rx="10" className="hiw-ma-machine" />
      <text x="124" y="51" textAnchor="middle" className="hiw-ma-machine-text">
        {copy.machine}
      </text>
      <path d="M152 47h24" className="hiw-ma-wire" />
      <g className="hiw-ma-out">
        <rect x="176" y="32" width="58" height="30" rx="15" />
        <text x="205" y="51" textAnchor="middle">
          {copy.output}
        </text>
      </g>
      <circle r="3.5" cx="72" cy="47" className="hiw-ma-dot hiw-motion" />
    </svg>
  );
}

// Three blocks in a row. Each one starts with the fingerprint of the block
// before it (the same value printed under that block), which is what links
// them: change an old block and its fingerprint no longer matches. Your
// nullifier is one entry inside the newest block. Fingerprints are made up.
const BLOCK_X = [8, 88, 168];
const BLOCK_W = 64;
const FINGERPRINTS = ["7a41…", "c09e…", "3f2d…"];
const BEFORE_FIRST = "e5b8…";

function Block({ x, index, copy, last }: { x: number; index: number; copy: Basics["chain"]["art"]; last: boolean }) {
  const previous = index === 0 ? BEFORE_FIRST : FINGERPRINTS[index - 1];
  const middle = x + BLOCK_W / 2;
  return (
    <g className="hiw-ma-block">
      <rect x={x} y="4" width={BLOCK_W} height="58" rx="6" />
      <text x={x + 7} y="14" className="hiw-ma-block-label">
        {copy.block} {101 + index}
      </text>
      <g className="hiw-ma-prev">
        <rect x={x + 5} y="19" width={BLOCK_W - 10} height="12" rx="6" />
        <text x={middle} y="27.5" textAnchor="middle">
          ← {previous}
        </text>
      </g>
      <rect x={x + 8} y="36" width={BLOCK_W - 16} height="4" rx="2" className="hiw-ma-bar" />
      {last ? (
        <g className="hiw-ma-entry is-yours">
          <rect x={x + 3} y="42" width={BLOCK_W - 6} height="12" rx="6" />
          <text x={middle} y="50.5" textAnchor="middle">
            {copy.yours}
          </text>
        </g>
      ) : (
        <rect x={x + 8} y="45" width={BLOCK_W - 24} height="4" rx="2" className="hiw-ma-bar" />
      )}
      <text x={middle} y="72" textAnchor="middle" className="hiw-ma-block-number">
        {FINGERPRINTS[index]}
      </text>
    </g>
  );
}

export function ChainArt({ copy }: { copy: Basics["chain"]["art"] }) {
  const last = BLOCK_X.length - 1;
  return (
    <svg
      viewBox="0 0 240 104"
      className="hiw-mini-art"
      role="img"
      aria-label={`${copy.block} 101 → ${copy.block} 102 → ${copy.block} 103: ${copy.link}. ${copy.yours}. ${copy.read}. ${copy.erase}.`}
    >
      {BLOCK_X.map((x, i) => (
        <path key={`wire-${x}`} d={`M${i === 0 ? 0 : x - 16} 25h${i === 0 ? 13 : 21}`} className="hiw-ma-wire" />
      ))}
      {BLOCK_X.map((x, i) => (
        <Block key={x} x={x} index={i} copy={copy} last={i === last} />
      ))}
      <g className="hiw-ma-pill is-ok">
        <rect x="8" y="80" width="108" height="20" rx="10" />
        <text x="62" y="93" textAnchor="middle">
          {copy.read}
        </text>
      </g>
      <g className="hiw-ma-pill is-broken">
        <rect x="124" y="80" width="108" height="20" rx="10" />
        <text x="178" y="93" textAnchor="middle">
          {copy.erase}
        </text>
      </g>
    </svg>
  );
}

// One sign-up, one person: the check says a person approved it, not who.
export function HumanArt({ copy }: { copy: Basics["worldId"]["art"] }) {
  const path = "M44 40 L138 40";
  return (
    <svg viewBox="0 0 240 96" className="hiw-mini-art" role="img" aria-label={`${copy.request} → ${copy.human}. ${copy.noName}.`}>
      <ActorIcon actor="phone" size={26} x={16} y={27} />
      <text x="29" y="70" textAnchor="middle" className="hiw-ma-caption">
        {copy.request}
      </text>
      <path d={path} className="hiw-ma-wire" />
      <circle r="3" className="hiw-ma-travel hiw-motion">
        <animateMotion dur="3s" repeatCount="indefinite" path={path} />
      </circle>
      <circle cx="162" cy="40" r="22" className="hiw-ma-human" />
      <g className="hiw-ma-human-icon">
        <ActorIcon actor="human" size={24} x={150} y={28} />
      </g>
      <circle cx="178" cy="24" r="7" className="hiw-ma-check" />
      <path d="M174.5 24l2.5 2.5 4.5-5" className="hiw-ma-check-mark" />
      <text x="162" y="76" textAnchor="middle" className="hiw-ma-strong">
        {copy.human}
      </text>
      <text x="162" y="90" textAnchor="middle" className="hiw-ma-caption">
        {copy.noName}
      </text>
    </svg>
  );
}

export function WalletArt({ copy }: { copy: Basics["privy"]["art"] }) {
  return (
    <svg viewBox="0 0 240 96" className="hiw-mini-art" role="img" aria-label={`${copy.google} → ${copy.wallet} (${copy.sign}) → ${copy.secret}`}>
      <circle cx="36" cy="36" r="20" className="hiw-ma-node" />
      <ActorIcon actor="google" size={20} x={26} y={26} />
      <path d="M56 36h42m-5-5 5 5-5 5" className="hiw-ma-wire" />
      <circle cx="120" cy="36" r="20" className="hiw-ma-node" />
      <rect x="109" y="29" width="22" height="15" rx="3" className="hiw-ma-wallet" />
      <rect x="123" y="33" width="8" height="7" rx="2" className="hiw-ma-wallet-clasp" />
      <path d="M140 36h42m-5-5 5 5-5 5" className="hiw-ma-wire" />
      <text x="161" y="27" textAnchor="middle" className="hiw-ma-caption">
        {copy.sign}
      </text>
      <circle cx="204" cy="36" r="20" className="hiw-ma-node is-secret" />
      <g className="hiw-ma-lock">
        <LockGlyph x={195} y={27} size={18} />
      </g>
      <text x="36" y="72" textAnchor="middle" className="hiw-ma-label">
        {copy.google}
      </text>
      <text x="120" y="72" textAnchor="middle" className="hiw-ma-label">
        {copy.wallet}
      </text>
      <text x="204" y="72" textAnchor="middle" className="hiw-ma-label">
        {copy.secret}
      </text>
      <circle r="3.5" cx="56" cy="36" className="hiw-ma-dot is-long hiw-motion" />
    </svg>
  );
}
