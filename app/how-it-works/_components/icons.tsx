import type { ActorId } from "@/lib/i18n/how-it-works/flow";

type Glyph = ActorId | "human";

// Line glyphs for the parties in the diagrams, drawn on a 24×24 grid.
const PATHS: Record<Glyph, string> = {
  counter: "M3 21h18M5 21V10M19 21V10M3 9l9-6 9 6zM9.5 21v-6h5v6",
  phone: "M7 2.5h10a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V4A1.5 1.5 0 0 1 7 2.5zM10.5 18h3",
  google: "M20 12a8 8 0 1 1-2.3-5.6M20 12h-7.5",
  server: "M4.5 4h15v6h-15zM4.5 14h15v6h-15zM8 7h.01M8 17h.01",
  mingle: "M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z",
  chain: "M12 2.5 3.5 7v10l8.5 4.5 8.5-4.5V7zM3.5 7l8.5 4.5L20.5 7M12 11.5v10",
  human: "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 21a7.5 7.5 0 0 1 15 0",
};

type IconProps = { actor: Glyph; size?: number; x?: number; y?: number };

// Usable inside HTML or nested inside another SVG (with x and y).
export function ActorIcon({ actor, size = 24, x, y }: IconProps) {
  return (
    <svg
      className="hiw-icon"
      width={size}
      height={size}
      x={x}
      y={y}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[actor]} />
    </svg>
  );
}

export function LockGlyph({ x, y, size = 12 }: { x: number; y: number; size?: number }) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="2" fill="currentColor" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
