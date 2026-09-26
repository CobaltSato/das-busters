import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import type { Modes } from "@/lib/modes";
import { Rich } from "../_components/Rich";
import { Section } from "../_components/Section";
import { ChainArt, HashArt, HumanArt, StampArt, WalletArt } from "../_diagrams/BasicsArt";
import { NullifierDiagram } from "../_diagrams/NullifierDiagram";
import { ZkDiagram } from "../_diagrams/ZkDiagram";

type Copy = StoryCopy["basics"];
type TermCopy = { title: string; analogy: string; body: string; inApp: string; formula?: string[] };

type TermProps = {
  term: TermCopy;
  inAppLabel: string;
  picture: React.ReactNode;
  children?: React.ReactNode;
};

// One term per row: the picture, then the words. The analogy opens the
// paragraph; the Engineer view adds the formula.
function Term({ term, inAppLabel, picture, children }: TermProps) {
  return (
    <article className="hiw-term">
      <figure className="hiw-term-figure">{picture}</figure>
      <div className="hiw-term-text">
        <h3>{term.title}</h3>
        <p>
          <strong>{term.analogy}</strong> {term.body}
        </p>
        {term.formula && <pre className="hiw-formula hiw-tech">{term.formula.join("\n")}</pre>}
        <p className="hiw-term-inapp">
          <span>{inAppLabel}</span>
          {/[、。]$/.test(inAppLabel) ? "" : " "}
          <Rich text={term.inApp} />
        </p>
        {children}
      </div>
    </article>
  );
}

export function Basics({ copy, worldId }: { copy: Copy; worldId: Modes["worldId"] }) {
  return (
    <Section id="basics" title={copy.title} lede={copy.lede} wide>
      <div className="hiw-terms">
        <Term term={copy.signature} inAppLabel={copy.inApp} picture={<StampArt copy={copy.signature.art} />} />
        <Term term={copy.hash} inAppLabel={copy.inApp} picture={<HashArt copy={copy.hash.art} />} />
        <Term term={copy.zk} inAppLabel={copy.inApp} picture={<ZkDiagram copy={copy.zk.diagram} />} />
        <Term term={copy.nullifier} inAppLabel={copy.inApp} picture={<NullifierDiagram copy={copy.nullifier.diagram} />} />
        <Term term={copy.chain} inAppLabel={copy.inApp} picture={<ChainArt copy={copy.chain.art} />} />
        <Term term={copy.privy} inAppLabel={copy.inApp} picture={<WalletArt copy={copy.privy.art} />} />
        <Term term={copy.worldId} inAppLabel={copy.inApp} picture={<HumanArt copy={copy.worldId.art} />}>
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
