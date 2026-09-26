import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import { ProofEnvelope } from "./ProofEnvelope";

// Two ways to prove single status, read left to right under three column
// heads: what is on your phone, what you send, what Mingle sees. Static on
// purpose, so every part is readable at any moment.

type Copy = StoryCopy["why"]["diagram"];
type Seen = { text: string; tone: "leak" | "hidden" | "ok" };

function Arrow() {
  return <span className="hiw-compare-arrow" aria-hidden="true" />;
}

function Paper({ title, fields }: { title: string; fields: string[] }) {
  return (
    <div className="hiw-compare-paper">
      <strong>{title}</strong>
      <ul>
        {fields.map((field) => (
          <li key={field}>{field}</li>
        ))}
      </ul>
    </div>
  );
}

function CopySheet({ label }: { label: string }) {
  return (
    <div className="hiw-compare-mid">
      <svg viewBox="0 0 110 76" className="hiw-compare-copy" aria-hidden="true">
        <rect x="18" y="1" width="74" height="74" rx="4" />
        {[16, 30, 44, 58].map((y) => (
          <rect key={y} x="28" y={y} width="54" height="6" rx="3" className="is-line" />
        ))}
      </svg>
      <span>{label}</span>
    </div>
  );
}

function Mingle({ title, items }: { title: string; items: Seen[] }) {
  return (
    <div className="hiw-compare-seen">
      <strong>{title}</strong>
      <ul>
        {items.map((item, i) => (
          <li key={`${item.text}-${i}`} className={`is-${item.tone}`}>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WhyCompare({ copy }: { copy: Copy }) {
  const last = copy.fields.length - 1;
  const leaked: Seen[] = copy.fields.map((text) => ({ text, tone: "leak" }));
  const proved: Seen[] = copy.fields.map((_, i) =>
    i === last ? { text: copy.single, tone: "ok" } : { text: copy.hidden, tone: "hidden" },
  );
  return (
    <div className="hiw-compare" role="group" aria-label={copy.label}>
      <div className="hiw-compare-head" aria-hidden="true">
        <span>{copy.have}</span>
        <span />
        <span>{copy.send}</span>
        <span />
        <span>{copy.mingleSees}</span>
      </div>
      <div className="hiw-compare-row is-copy">
        <h3>{copy.copyLane}</h3>
        <Paper title={copy.certificate} fields={copy.fields} />
        <Arrow />
        <CopySheet label={copy.copy} />
        <Arrow />
        <Mingle title="Mingle" items={leaked} />
      </div>
      <div className="hiw-compare-row is-proof">
        <h3>{copy.zkLane}</h3>
        <Paper title={copy.certificate} fields={copy.fields} />
        <Arrow />
        <div className="hiw-compare-mid">
          <ProofEnvelope line={copy.single} />
          <span>{copy.proof}</span>
        </div>
        <Arrow />
        <Mingle title="Mingle" items={proved} />
      </div>
    </div>
  );
}
