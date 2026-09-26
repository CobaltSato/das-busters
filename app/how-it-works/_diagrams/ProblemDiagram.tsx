import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import { LockGlyph } from "../_components/icons";

// Two lanes on a 360-wide grid. Top: every field of a copied certificate
// travels to Mingle. Bottom: the fields go into a sealed proof and only
// "Single ✓" comes out. Delays stagger the chips; CSS does the motion.

type Copy = StoryCopy["why"]["diagram"];

const LANE_Y = [0, 132];
const ROW_Y = [56, 72, 88, 104];
const CARD = { x: 2, w: 88, mingleX: 266, mingleW: 92, top: 20, h: 96 };

function Card({ x, width, y0, title }: { x: number; width: number; y0: number; title: string }) {
  return (
    <>
      <rect x={x} y={y0 + CARD.top} width={width} height={CARD.h} rx="8" className="hiw-p-card" />
      <text x={x + 10} y={y0 + 37} className="hiw-p-card-title">
        {title}
      </text>
    </>
  );
}

function CopyLane({ copy }: { copy: Copy }) {
  const y0 = LANE_Y[0];
  return (
    <g>
      <text x="2" y={y0 + 11} className="hiw-p-lane is-leak">
        {copy.copyLane}
      </text>
      <Card x={CARD.x} width={CARD.w} y0={y0} title={copy.certificate} />
      <Card x={CARD.mingleX} width={CARD.mingleW} y0={y0} title={copy.mingleSees} />
      {copy.fields.map((field, i) => (
        <g key={field}>
          <text x="12" y={y0 + ROW_Y[i]} className="hiw-p-row">
            {field}
          </text>
          <g className="hiw-p-chip is-leak" style={{ animationDelay: `${i * 0.3}s` }}>
            <rect x="94" y={y0 + ROW_Y[i] - 10} width="54" height="14" rx="7" />
            <text x="121" y={y0 + ROW_Y[i]} textAnchor="middle">
              {field}
            </text>
          </g>
          <g className="hiw-p-arrive is-leak" style={{ animationDelay: `${i * 0.3}s` }}>
            <rect x={CARD.mingleX + 6} y={y0 + ROW_Y[i] - 10} width="80" height="14" rx="4" />
            <text x={CARD.mingleX + 12} y={y0 + ROW_Y[i]}>
              {field}
            </text>
          </g>
        </g>
      ))}
    </g>
  );
}

function ProofLane({ copy }: { copy: Copy }) {
  const y0 = LANE_Y[1];
  const last = copy.fields.length - 1;
  return (
    <g>
      <text x="2" y={y0 + 11} className="hiw-p-lane is-safe">
        {copy.zkLane}
      </text>
      <Card x={CARD.x} width={CARD.w} y0={y0} title={copy.certificate} />
      <Card x={CARD.mingleX} width={CARD.mingleW} y0={y0} title={copy.mingleSees} />
      {copy.fields.map((field, i) => (
        <g key={field}>
          <text x="12" y={y0 + ROW_Y[i]} className="hiw-p-row">
            {field}
          </text>
          <circle
            cx="96"
            cy={y0 + ROW_Y[i] - 3}
            r="4"
            className="hiw-p-dot"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
          {i < last && (
            <g className="hiw-p-hidden">
              <rect x={CARD.mingleX + 6} y={y0 + ROW_Y[i] - 10} width="80" height="14" rx="4" />
              <text x={CARD.mingleX + 12} y={y0 + ROW_Y[i]}>
                {copy.hidden}
              </text>
            </g>
          )}
        </g>
      ))}
      <rect x="150" y={y0 + 34} width="52" height="76" rx="10" className="hiw-p-seal" />
      <g className="hiw-p-seal-lock">
        <LockGlyph x={168} y={y0 + 52} size={16} />
      </g>
      <text x="176" y={y0 + 90} textAnchor="middle" className="hiw-p-seal-text">
        {copy.proof}
      </text>
      <g className="hiw-p-out">
        <rect x="204" y={y0 + ROW_Y[last] - 10} width="58" height="14" rx="7" />
        <text x="233" y={y0 + ROW_Y[last]} textAnchor="middle">
          {copy.single}
        </text>
      </g>
      <g className="hiw-p-arrive is-safe is-late">
        <rect x={CARD.mingleX + 6} y={y0 + ROW_Y[last] - 10} width="80" height="14" rx="4" />
        <text x={CARD.mingleX + 12} y={y0 + ROW_Y[last]}>
          {copy.single}
        </text>
      </g>
    </g>
  );
}

export function ProblemDiagram({ copy }: { copy: Copy }) {
  return (
    <svg className="hiw-diagram hiw-problem" viewBox="0 0 360 252" role="img" aria-label={copy.label}>
      <CopyLane copy={copy} />
      <ProofLane copy={copy} />
    </svg>
  );
}
