import Link from "next/link";
import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import { Section } from "../_components/Section";
import { RolesDiagram } from "../_diagrams/RolesDiagram";
import { WhyCompare } from "../_diagrams/WhyCompare";

// The problem is the picture; the words are one caption and one fact.
export function Why({ copy }: { copy: StoryCopy["why"] }) {
  return (
    <Section id="why" title={copy.title} wide>
      <WhyCompare copy={copy.diagram} />
      <p className="hiw-why-caption">{copy.caption}</p>
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

// One line in place of the old basics section: the terms and their pictures
// now live on /how-it-works/basics.
export function BasicsPointer({ copy }: { copy: StoryCopy["basicsPage"] }) {
  return (
    <p className="hiw-pointer">
      {copy.pointer}
      {/* Japanese needs no space after 、 or 。 */}
      {/[、。]$/.test(copy.pointer) ? "" : " "}
      <Link href="/how-it-works/basics">
        {copy.pointerLink} <span aria-hidden="true">→</span>
      </Link>
    </p>
  );
}
