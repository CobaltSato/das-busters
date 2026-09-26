import type { ReferenceCopy } from "@/lib/i18n/how-it-works/reference.en";
import type { Modes } from "@/lib/modes";
import { Rich } from "../_components/Rich";
import { Section } from "../_components/Section";

type Copy = ReferenceCopy["built"];

export function Built({ copy, worldId }: { copy: Copy; worldId: Modes["worldId"] }) {
  return (
    <Section id="built" title={copy.title} lede={copy.lede} wide>
      <div className="hiw-built">
        <div className="hiw-built-col is-done">
          <h3>{copy.doneTitle}</h3>
          <ul>
            {copy.done.map((item) => (
              <li key={item}>
                <Rich text={item} />
              </li>
            ))}
          </ul>
        </div>
        <div className="hiw-built-col">
          <h3>{copy.worldIdTitle}</h3>
          <p className={worldId === "idkit" ? "hiw-pill-line is-live" : "hiw-pill-line"}>{copy.worldId[worldId]}</p>
          <h3 className="hiw-built-next">{copy.nextTitle}</h3>
          <ul className="is-next">
            {copy.next.map((item) => (
              <li key={item}>
                <Rich text={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* A list of library names: Engineer view only. */}
      <div className="hiw-tech">
        <h3 className="hiw-subhead">{copy.stackTitle}</h3>
        <ul className="hiw-stack">
          {copy.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
