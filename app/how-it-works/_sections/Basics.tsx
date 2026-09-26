import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import type { Modes } from "@/lib/modes";
import { Rich } from "../_components/Rich";
import { Section } from "../_components/Section";
import { ChainArt, HashArt, HumanArt, StampArt, WalletArt } from "../_diagrams/BasicsArt";
import { NullifierDiagram } from "../_diagrams/NullifierDiagram";
import { ZkDiagram } from "../_diagrams/ZkDiagram";

type Copy = StoryCopy["basics"];
type CardCopy = { title: string; analogy: string; body: string; inApp: string; formula?: string[] };

type CardProps = {
  card: CardCopy;
  inAppLabel: string;
  // A small picture inside the text column.
  art?: React.ReactNode;
  // "feature" puts the big diagram beside the text on wide screens.
  layout?: "wide" | "feature";
  children?: React.ReactNode;
};

// Plain view: title, analogy, one line, picture, where it is in the app.
// Engineer view adds the formula.
function Card({ card, inAppLabel, art, layout, children }: CardProps) {
  return (
    <article className={layout ? `hiw-card is-${layout}` : "hiw-card"}>
      <div className="hiw-card-text">
        <h3>{card.title}</h3>
        <p className="hiw-card-analogy">{card.analogy}</p>
        <p>{card.body}</p>
        {art && <figure className="hiw-mini">{art}</figure>}
        {card.formula && <pre className="hiw-formula hiw-tech">{card.formula.join("\n")}</pre>}
        <p className="hiw-card-inapp">
          <span>{inAppLabel}</span>
          <Rich text={card.inApp} />
        </p>
      </div>
      {children}
    </article>
  );
}

export function Basics({ copy, worldId }: { copy: Copy; worldId: Modes["worldId"] }) {
  return (
    <Section id="basics" title={copy.title} lede={copy.lede} wide>
      <div className="hiw-cards">
        <Card card={copy.signature} inAppLabel={copy.inApp} art={<StampArt copy={copy.signature.art} />} />
        <Card card={copy.hash} inAppLabel={copy.inApp} art={<HashArt copy={copy.hash.art} />} />
        <Card card={copy.zk} inAppLabel={copy.inApp} layout="feature">
          <figure className="hiw-figure">
            <ZkDiagram copy={copy.zk.diagram} />
          </figure>
        </Card>
        <Card card={copy.nullifier} inAppLabel={copy.inApp} layout="feature">
          <figure className="hiw-figure">
            <NullifierDiagram copy={copy.nullifier.diagram} />
          </figure>
        </Card>
        <Card card={copy.chain} inAppLabel={copy.inApp} art={<ChainArt copy={copy.chain.art} />} />
        <Card card={copy.privy} inAppLabel={copy.inApp} art={<WalletArt copy={copy.privy.art} />} />
        <Card card={copy.worldId} inAppLabel={copy.inApp} art={<HumanArt copy={copy.worldId.art} />} layout="wide">
          {/* Follows how this deployment runs the check, so a simulated
              check is never described as a real one. */}
          <p className={worldId === "idkit" ? "hiw-mode is-live" : "hiw-mode"}>
            <Rich text={copy.worldId.status[worldId]} />
          </p>
        </Card>
      </div>
    </Section>
  );
}
