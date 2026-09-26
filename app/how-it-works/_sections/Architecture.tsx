import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import type { Modes } from "@/lib/modes";
import { Section } from "../_components/Section";
import { ArchitectureMap } from "../_diagrams/ArchitectureMap";
import { DataMap } from "../_diagrams/DataMap";

type Copy = StoryCopy["architecture"];

export function Architecture({ copy, worldId }: { copy: Copy; worldId: Modes["worldId"] }) {
  return (
    <Section id="architecture" title={copy.title} lede={copy.lede} wide>
      <ArchitectureMap copy={copy} worldId={worldId} />
      <h3 className="hiw-subhead">{copy.dataTitle}</h3>
      <p className="hiw-subhead-lede">{copy.dataLede}</p>
      <DataMap copy={copy} />
    </Section>
  );
}
