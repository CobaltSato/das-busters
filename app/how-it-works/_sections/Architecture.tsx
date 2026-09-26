import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import type { Modes } from "@/lib/modes";
import { Rich } from "../_components/Rich";
import { Section } from "../_components/Section";
import { ArchitectureMap } from "../_diagrams/ArchitectureMap";
import { DataMap } from "../_diagrams/DataMap";

type Copy = StoryCopy["architecture"];

// What this demo runs next to how a real deployment would be arranged. The
// summary stays in sight; the part-by-part table opens on demand (the
// README carries the same table). The right-hand column is the intended
// design, and the copy says so.
function DemoVsReal({ real }: { real: Copy["real"] }) {
  const head = real.head;
  return (
    <>
      <h3 className="hiw-subhead">{real.title}</h3>
      <p className="hiw-subhead-lede">{real.lede}</p>
      <p className="hiw-note hiw-tech">
        <Rich text={real.tech} />
      </p>
      <details className="hiw-more hiw-disclosure">
        <summary>{real.summary}</summary>
        <table className="hiw-table is-stacking">
          <thead>
            <tr>
              <th scope="col">{head.part}</th>
              <th scope="col">{head.demo}</th>
              <th scope="col">{head.real}</th>
            </tr>
          </thead>
          <tbody>
            {real.rows.map((row) => (
              <tr key={row.part}>
                <th scope="row">{row.part}</th>
                <td data-label={head.demo}>
                  <Rich text={row.demo} />
                </td>
                <td data-label={head.real}>
                  <Rich text={row.real} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="hiw-note">{real.note}</p>
      </details>
    </>
  );
}

export function Architecture({ copy, worldId }: { copy: Copy; worldId: Modes["worldId"] }) {
  return (
    <Section id="architecture" title={copy.title} lede={copy.lede} wide>
      <ArchitectureMap copy={copy} worldId={worldId} />
      <DemoVsReal real={copy.real} />
      <h3 className="hiw-subhead">{copy.dataTitle}</h3>
      <p className="hiw-subhead-lede">{copy.dataLede}</p>
      <DataMap copy={copy} />
    </Section>
  );
}
