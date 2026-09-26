import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";

// Three rows build up one after another: Mingle twice (same number, the
// second is refused) and another app (a different number). The numbers are
// illustrative, shortened the way Mingle shows them; real ones are
// decimal field elements of about 77 digits.

type Copy = StoryCopy["basics"]["nullifier"]["diagram"];

const ROW_Y = [4, 58, 112];
const NUMBERS = ["1843…7715", "1843…7715", "5096…2281"];
const TONES = ["is-ok", "is-refused", "is-other"];

export function NullifierDiagram({ copy }: { copy: Copy }) {
  return (
    <svg className="hiw-diagram hiw-nullifier" viewBox="0 0 360 160" role="img" aria-label={copy.label}>
      {copy.rows.map((row, i) => {
        const y = ROW_Y[i];
        return (
          <g key={`${row.app}-${row.account}`} className={`hiw-n-row is-row${i + 1} ${TONES[i]}`}>
            <rect x="2" y={y} width="140" height="44" rx="10" className="hiw-n-input" />
            <text x="12" y={y + 18} className="hiw-n-input-title">
              {copy.secret} + {row.app}
            </text>
            <text x="12" y={y + 34} className="hiw-n-input-note">
              {row.account}
            </text>
            <path d={`M144 ${y + 22}h10m-4-4 4 4-4 4`} className="hiw-n-arrow" />
            <rect x="158" y={y + 8} width="62" height="28" rx="6" className="hiw-n-number" />
            <text x="189" y={y + 26} textAnchor="middle" className="hiw-n-number-text">
              {NUMBERS[i]}
            </text>
            <path d={`M222 ${y + 22}h10m-4-4 4 4-4 4`} className="hiw-n-arrow" />
            <rect x="236" y={y + 8} width="122" height="28" rx="14" className="hiw-n-result" />
            <text x="297" y={y + 26} textAnchor="middle" className="hiw-n-result-text">
              {row.result}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
