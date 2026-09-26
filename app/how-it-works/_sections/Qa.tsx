import type { ReferenceCopy } from "@/lib/i18n/how-it-works/reference.en";
import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import type { Modes } from "@/lib/modes";
import { Rich } from "../_components/Rich";
import { Section } from "../_components/Section";
import { StampArt } from "../_diagrams/BasicsArt";
import { BorrowArt, ChecksArt, OnchainArt, ServerArt } from "../_diagrams/FaqArt";
import { NullifierDiagram } from "../_diagrams/NullifierDiagram";

type Copy = ReferenceCopy["qa"];
type ModeText = string | Record<Modes["worldId"], string>;
type Pictures = { stamp: StoryCopy["basics"]["signature"]["art"]; nullifier: StoryCopy["basics"]["nullifier"]["diagram"] };

// Most answers are fixed text. The World ID one depends on how this
// deployment runs the human check, so it can't claim more than is running.
function text(value: ModeText, worldId: Modes["worldId"]): string {
  return typeof value === "string" ? value : value[worldId];
}

// The questions that matter most are answered with a picture as well.
function figureFor(id: string, copy: Copy, pictures: Pictures): React.ReactNode {
  switch (id) {
    case "onchain":
      return <OnchainArt copy={copy.figs.onchain} />;
    case "server":
      return <ServerArt copy={copy.figs.server} />;
    case "fake":
      return <StampArt copy={pictures.stamp} />;
    case "borrow":
      return <BorrowArt copy={copy.figs.borrow} />;
    case "accounts":
      return <NullifierDiagram copy={pictures.nullifier} />;
    case "chain":
      return <ChecksArt copy={copy.figs.checks} />;
    default:
      return null;
  }
}

// FAQ: the question as a reader would ask it, the answer in a sentence
// or two, a picture where it helps, and the specifics behind "More detail".
export function Qa({ copy, pictures, worldId }: { copy: Copy; pictures: Pictures; worldId: Modes["worldId"] }) {
  return (
    <Section id="qa" title={copy.title} lede={copy.lede} wide>
      <div className="hiw-faq">
        {copy.groups.map((group) => (
          <section key={group.title} className="hiw-faq-group" aria-label={group.title}>
            <h3>{group.title}</h3>
            {group.items.map((item) => {
              const figure = figureFor(item.id, copy, pictures);
              return (
                <article key={item.id} id={`faq-${item.id}`} className={figure ? "hiw-faq-item has-figure" : "hiw-faq-item"}>
                  <div className="hiw-faq-text">
                    <h4>{item.q}</h4>
                    <p className="hiw-faq-answer">
                      <Rich text={text(item.a, worldId)} />
                    </p>
                    <details className="hiw-faq-more">
                      <summary>{copy.more}</summary>
                      <p>
                        <Rich text={text(item.d, worldId)} />
                      </p>
                    </details>
                  </div>
                  {figure && <figure className="hiw-faq-figure">{figure}</figure>}
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </Section>
  );
}
