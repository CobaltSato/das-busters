import { CHAIN_LINKS } from "@/lib/i18n/how-it-works/links";
import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import type { Modes } from "@/lib/modes";
import { Rich } from "../_components/Rich";
import { Section } from "../_components/Section";
import { ChainArt, HashArt, HumanArt, StampArt, WalletArt } from "../_diagrams/BasicsArt";
import { NullifierDiagram } from "../_diagrams/NullifierDiagram";
import { ZkDiagram } from "../_diagrams/ZkDiagram";

type Copy = StoryCopy["basics"];
type TermCopy = { title: string; analogy: string; body: string; why: string; inApp: string; formula?: string[] };
type Labels = { why: string; inApp: string };

type TermProps = {
  term: TermCopy;
  labels: Labels;
  picture: React.ReactNode;
  children?: React.ReactNode;
};

// One term per row: the picture, then the words in a fixed order. What it
// is (the analogy opens the paragraph), why this app needs it, and how
// DAS Busters uses it. The Engineer view adds the formula.
function Term({ term, labels, picture, children }: TermProps) {
  return (
    <article className="hiw-term">
      <figure className="hiw-term-figure">{picture}</figure>
      <div className="hiw-term-text">
        <h3>{term.title}</h3>
        <p>
          <strong>{term.analogy}</strong> <Rich text={term.body} />
        </p>
        <p className="hiw-term-why">
          <span className="hiw-term-label">{labels.why}</span>
          <Rich text={term.why} />
        </p>
        <p className="hiw-term-inapp">
          <span className="hiw-term-label">{labels.inApp}</span>
          <Rich text={term.inApp} />
        </p>
        {term.formula && <pre className="hiw-formula hiw-tech">{term.formula.join("\n")}</pre>}
        {children}
      </div>
    </article>
  );
}

export function Basics({ copy, worldId }: { copy: Copy; worldId: Modes["worldId"] }) {
  const labels = { why: copy.whyLabel, inApp: copy.inApp };
  return (
    <Section id="basics" title={copy.title} lede={copy.lede} wide>
      <div className="hiw-terms">
        <Term term={copy.signature} labels={labels} picture={<StampArt copy={copy.signature.art} />} />
        <Term term={copy.hash} labels={labels} picture={<HashArt copy={copy.hash.art} />} />
        <Term term={copy.zk} labels={labels} picture={<ZkDiagram copy={copy.zk.diagram} />} />
        <Term term={copy.nullifier} labels={labels} picture={<NullifierDiagram copy={copy.nullifier.diagram} />} />
        <Term term={copy.chain} labels={labels} picture={<ChainArt copy={copy.chain.art} />}>
          <p className="hiw-term-link">
            <a href={CHAIN_LINKS.registryBlockscout} target="_blank" rel="noreferrer">
              {copy.chain.link} <span aria-hidden="true">↗</span>
            </a>
          </p>
        </Term>
        <Term term={copy.privy} labels={labels} picture={<WalletArt copy={copy.privy.art} />} />
        <Term term={copy.worldId} labels={labels} picture={<HumanArt copy={copy.worldId.art} />}>
          {/* Follows how this deployment runs the check, so a simulated
              check is never described as a real one. */}
          <p className={worldId === "idkit" ? "hiw-mode is-live" : "hiw-mode"}>
            <Rich text={copy.worldId.status[worldId]} />
          </p>
        </Term>
      </div>
    </Section>
  );
}
