import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";

// The page's thesis in one picture: the certificate slides into a window
// envelope (窓付き封筒) whose window shows only the marital status line.
// Geometry: rows sit at fixed baselines so the window frames the last one.

const ROW_Y = [88, 128, 168, 208];
const SEAL = "親展";

export function Envelope({ copy }: { copy: StoryCopy["hero"]["envelope"] }) {
  const lastRow = copy.fields.length - 1;
  return (
    <svg className="hiw-envelope" viewBox="0 0 360 300" role="img" aria-label={copy.label}>
      <g>
        <rect x="40" y="14" width="280" height="262" rx="8" className="hiw-cert-paper" />
        <text x="60" y="42" className="hiw-cert-heading">
          {copy.heading}
        </text>
        <circle cx="290" cy="36" r="15" className="hiw-cert-seal" />
        <text x="290" y="39.5" textAnchor="middle" className="hiw-cert-seal-text">
          {copy.seal}
        </text>
        <line x1="60" x2="300" y1="56" y2="56" className="hiw-cert-rule" />
        {copy.fields.map((field, i) => (
          <g key={field.label} className={i === lastRow ? "hiw-cert-row is-shown" : "hiw-cert-row"}>
            <text x="60" y={ROW_Y[i]} className="hiw-cert-label">
              {field.label}
            </text>
            <text x="60" y={ROW_Y[i] + 18} className="hiw-cert-value">
              {field.value}
            </text>
          </g>
        ))}
        <circle cx="292" cy={ROW_Y[lastRow] + 12} r="9" className="hiw-cert-check" />
        <path
          d={`M287.5 ${ROW_Y[lastRow] + 12}l3 3 5.5-6`}
          className="hiw-cert-check-mark"
        />
        <text x="60" y="258" className="hiw-cert-issuer">
          {copy.issuer}
        </text>
      </g>

      <g className="hiw-env">
        <path fillRule="evenodd" d="M22 64H338V298H22ZM50 194H310V238H50Z" className="hiw-env-body" />
        <rect x="50" y="194" width="260" height="44" rx="3" className="hiw-env-window" />
        <rect x="36" y="80" width="26" height="54" rx="3" className="hiw-env-stamp" />
        <text x="49" y="102" textAnchor="middle" className="hiw-env-stamp-text">
          {SEAL[0]}
        </text>
        <text x="49" y="124" textAnchor="middle" className="hiw-env-stamp-text">
          {SEAL[1]}
        </text>
        {copy.confidential !== SEAL && (
          <text x="70" y="111" className="hiw-env-stamp-note">
            {copy.confidential}
          </text>
        )}
      </g>

      <g className="hiw-env-callout">
        <rect x="80" y="252" width="200" height="28" rx="14" className="hiw-callout-bg" />
        <text x="180" y="270.5" textAnchor="middle" className="hiw-callout-text">
          {copy.window}
        </text>
      </g>
    </svg>
  );
}
