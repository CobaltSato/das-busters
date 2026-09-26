import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import { Section } from "../_components/Section";
import { ProblemDiagram } from "../_diagrams/ProblemDiagram";
import { RolesDiagram } from "../_diagrams/RolesDiagram";

// The problem is the picture; the words are one caption and one fact.
export function Why({ copy }: { copy: StoryCopy["why"] }) {
  return (
    <Section id="why" title={copy.title}>
      <figure className="hiw-figure is-why">
        <ProblemDiagram copy={copy.diagram} />
        <figcaption>{copy.caption}</figcaption>
      </figure>
      <p className="hiw-fact">{copy.fact}</p>
    </Section>
  );
}

export function Idea({ copy }: { copy: StoryCopy["idea"] }) {
  return (
    <Section id="idea" title={copy.title} lede={copy.lede} wide>
      <RolesDiagram copy={copy} />
    </Section>
  );
}
