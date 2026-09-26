import { ACTORS, type ActorId } from "@/lib/i18n/how-it-works/flow";

// Geometry for the walkthrough's stage: six parties in a row on a 360-wide
// grid, with an arc above them for the current message.

export const STAGE = { width: 360, height: 150, nodeY: 104, radius: 17 };

export function nodeX(actor: ActorId): number {
  return 30 + ACTORS.indexOf(actor) * 60;
}

export type Arc = {
  d: string;
  labelX: number;
  labelY: number;
  head: { x: number; y: number; angle: number };
};

// A quadratic arc between two parties, or a small loop when a party acts on
// its own. The label sits just above the arc's highest point.
export function arcBetween(from: ActorId, to: ActorId): Arc {
  const y = STAGE.nodeY - STAGE.radius - 4;
  const x1 = nodeX(from);
  const x2 = nodeX(to);
  if (from === to) {
    const d = `M${x1 - 7} ${y} C${x1 - 26} ${y - 46} ${x1 + 26} ${y - 46} ${x1 + 7} ${y}`;
    return { d, labelX: x1, labelY: y - 50, head: headAt(x1 + 7, y, x1 + 26, y - 46) };
  }
  const direction = Math.sign(x2 - x1);
  const start = x1 + direction * 6;
  const end = x2 - direction * 6;
  const lift = round(26 + Math.abs(x2 - x1) * 0.2);
  const middle = (start + end) / 2;
  const d = `M${start} ${y} Q${middle} ${y - lift} ${end} ${y}`;
  return { d, labelX: middle, labelY: y - lift / 2 - 13, head: headAt(end, y, middle, y - lift) };
}

// The arrowhead points along the curve's last tangent (control → end).
// Rounded so the server and the browser render the same attribute: their
// Math.atan2 can differ in the last digit, which breaks hydration.
function headAt(x: number, y: number, controlX: number, controlY: number) {
  const angle = round((Math.atan2(y - controlY, x - controlX) * 180) / Math.PI);
  return { x, y, angle };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

// SVG text has no layout, so label chips are sized from a rough per-glyph
// width: CJK glyphs are about twice as wide as Latin ones at this size.
export function labelWidth(text: string): number {
  let width = 16;
  for (const char of text) width += /[\u3000-\u9fff\uff00-\uffef]/.test(char) ? 10.5 : 6;
  return width;
}

export function clampLabel(x: number, width: number): number {
  const half = width / 2 + 2;
  return Math.min(Math.max(x, half), STAGE.width - half);
}
