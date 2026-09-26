// The page's one metaphor for a proof: the kraft window envelope from the
// top of the page, sealed, with one line showing through the window.
// Usable on its own or nested inside another SVG (with x, y and width).

type Props = { line: string; x?: number; y?: number; width?: number };

export function ProofEnvelope({ line, x, y, width = 110 }: Props) {
  return (
    <svg
      className="hiw-proof-env"
      x={x}
      y={y}
      width={width}
      height={(width * 76) / 110}
      viewBox="0 0 110 76"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="108" height="74" rx="4" className="hiw-pe-body" />
      <path d="M1.5 3 55 36 108.5 3" className="hiw-pe-flap" />
      <rect x="12" y="46" width="86" height="20" rx="3" className="hiw-pe-window" />
      <text x="55" y="60" textAnchor="middle" className="hiw-pe-line">
        {line}
      </text>
    </svg>
  );
}
