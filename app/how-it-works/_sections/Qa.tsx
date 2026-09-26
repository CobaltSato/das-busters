import type { ReferenceCopy } from "@/lib/i18n/how-it-works/reference.en";
import type { Modes } from "@/lib/modes";
import { Section } from "../_components/Section";

type Copy = ReferenceCopy["qa"];
type ModeText = string | Record<Modes["worldId"], string>;

// Most answers are fixed text. The World ID one depends on how this
// deployment runs the human check, so it can't claim more than is running.
function text(value: ModeText, worldId: Modes["worldId"]): string {
  return typeof value === "string" ? value : value[worldId];
}

export function Qa({ copy, worldId }: { copy: Copy; worldId: Modes["worldId"] }) {
  return (
    <Section id="qa" title={copy.title} lede={copy.lede} wide>
      <div className="hiw-qa">
        {copy.groups.map((group) => (
          <div key={group.title} className="hiw-qa-group">
            <h3>{group.title}</h3>
            {group.items.map((item) => (
              <details key={item.q} className="hiw-qa-item">
                <summary>{item.q}</summary>
                <div className="hiw-qa-answer">
                  <p className="hiw-qa-say">
                    <span>{copy.say}</span>
                    {text(item.a, worldId)}
                  </p>
                  <p className="hiw-qa-detail">
                    <span>{copy.details}</span>
                    {text(item.d, worldId)}
                  </p>
                </div>
              </details>
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}
