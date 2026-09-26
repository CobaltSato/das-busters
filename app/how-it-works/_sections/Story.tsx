import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import { Rich } from "../_components/Rich";
import { Section } from "../_components/Section";
import { ProblemDiagram } from "../_diagrams/ProblemDiagram";
import { RolesDiagram } from "../_diagrams/RolesDiagram";

export function Why({ copy }: { copy: StoryCopy["why"] }) {
  return (
    <Section id="why" title={copy.title}>
      <div className="hiw-split">
        <div className="hiw-prose">
          {copy.body.map((paragraph) => (
            <p key={paragraph}>
              <Rich text={paragraph} />
            </p>
          ))}
        </div>
        <figure className="hiw-figure">
          <ProblemDiagram copy={copy.diagram} />
        </figure>
      </div>
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
