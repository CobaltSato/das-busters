import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import { LockGlyph } from "../_components/icons";

// Private inputs slide into the circuit and never come out; the public
// outputs appear on the other side. 360-wide grid, CSS animation.

type Copy = StoryCopy["basics"]["zk"]["diagram"];

const INPUT_Y = [32, 76, 120];
const OUTPUT_Y = [52, 100];
const CIRCUIT = { x: 132, y: 28, w: 96, h: 126 };

export function ZkDiagram({ copy }: { copy: Copy }) {
  return (
    <svg className="hiw-diagram hiw-zk" viewBox="0 0 360 170" role="img" aria-label={copy.label}>
      <text x="4" y="14" className="hiw-zk-head">
        {copy.private}
      </text>
      <text x="356" y="14" textAnchor="end" className="hiw-zk-head is-public">
        {copy.public}
      </text>

      {INPUT_Y.map((y) => (
        <line key={y} x1="108" x2={CIRCUIT.x} y1={y + 15} y2={y + 15} className="hiw-zk-wire" />
      ))}
      {OUTPUT_Y.map((y) => (
        <line key={y} x1={CIRCUIT.x + CIRCUIT.w} x2="252" y1={y + 15} y2={y + 15} className="hiw-zk-wire" />
      ))}

      {copy.inputs.map((input, i) => (
        <g key={input} className="hiw-zk-in" style={{ animationDelay: `${i * 0.25}s` }}>
          <rect x="4" y={INPUT_Y[i]} width="104" height="30" rx="8" />
          <g className="hiw-zk-lock">
            <LockGlyph x={13} y={INPUT_Y[i] + 9} size={12} />
          </g>
          <text x="31" y={INPUT_Y[i] + 19.5}>
            {input}
          </text>
        </g>
      ))}

      <rect x={CIRCUIT.x} y={CIRCUIT.y} width={CIRCUIT.w} height={CIRCUIT.h} rx="12" className="hiw-zk-circuit" />
      <rect
        x={CIRCUIT.x - 3}
        y={CIRCUIT.y - 3}
        width={CIRCUIT.w + 6}
        height={CIRCUIT.h + 6}
        rx="15"
        className="hiw-zk-glow"
      />
      <text x={CIRCUIT.x + CIRCUIT.w / 2} y="88" textAnchor="middle" className="hiw-zk-circuit-title">
        {copy.circuit}
      </text>
      <text x={CIRCUIT.x + CIRCUIT.w / 2} y="106" textAnchor="middle" className="hiw-zk-circuit-note">
        {copy.checks}
      </text>

      {copy.outputs.map((output, i) => (
        <g key={output} className={i === 0 ? "hiw-zk-out is-yes" : "hiw-zk-out"}>
          <rect x="252" y={OUTPUT_Y[i]} width="104" height="30" rx="15" />
          <text x="304" y={OUTPUT_Y[i] + 19.5} textAnchor="middle">
            {output}
          </text>
        </g>
      ))}
    </svg>
  );
}
