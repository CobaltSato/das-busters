import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import type { Modes } from "@/lib/modes";
import { Rich } from "../_components/Rich";
import { Section } from "../_components/Section";
import { NullifierDiagram } from "../_diagrams/NullifierDiagram";
import { ZkDiagram } from "../_diagrams/ZkDiagram";

type Copy = StoryCopy["basics"];
type CardCopy = { title: string; analogy: string; body: string; inApp: string; formula?: string[] };

type CardProps = {
  card: CardCopy;
  inAppLabel: string;
  // "feature" puts the extra content beside the text on wide screens.
  layout?: "wide" | "feature";
  children?: React.ReactNode;
};

function Card({ card, inAppLabel, layout, children }: CardProps) {
  return (
    <article className={layout ? `hiw-card is-${layout}` : "hiw-card"}>
      <div className="hiw-card-text">
        <h3>{card.title}</h3>
        <p className="hiw-card-analogy">{card.analogy}</p>
        <p>{card.body}</p>
        {card.formula && <pre className="hiw-formula">{card.formula.join("\n")}</pre>}
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
        <Card card={copy.signature} inAppLabel={copy.inApp} />
        <Card card={copy.hash} inAppLabel={copy.inApp} />
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
        <Card card={copy.chain} inAppLabel={copy.inApp} />
        <Card card={copy.privy} inAppLabel={copy.inApp} />
        <Card card={copy.worldId} inAppLabel={copy.inApp} layout="wide">
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
