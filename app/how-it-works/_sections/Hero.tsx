import { Fragment } from "react";
import { ModeBadges } from "@/components/ModeBadges";
import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import type { Modes } from "@/lib/modes";
import { Rich } from "../_components/Rich";
import { Envelope } from "../_diagrams/Envelope";

type HeroProps = { copy: StoryCopy["hero"]; modes: Modes };

// The thesis, a pitch the reader can say aloud, and what this deployment
// actually runs, so nothing below reads as live when it is a mock.
export function Hero({ copy, modes }: HeroProps) {
  const notices = [
    modes.prover !== "groth16" ? copy.notice.mockProver : null,
    modes.chain !== "sepolia" ? copy.notice.offChain : null,
  ].filter((notice): notice is string => notice !== null);

  return (
    <header className="hiw-hero">
      <div className="hiw-hero-text">
        <p className="hiw-eyebrow">{copy.eyebrow}</p>
        <h1>
          {copy.title.map((phrase, i) => (
            <Fragment key={phrase}>
              {i > 0 && !/[、。]$/.test(copy.title[i - 1]) && " "}
              <span className="hiw-phrase">{phrase}</span>
            </Fragment>
          ))}
        </h1>
        <p className="hiw-hero-lede">{copy.lede}</p>
      </div>
      <div className="hiw-hero-art">
        <Envelope copy={copy.envelope} />
      </div>
      <section className="hiw-pitch" aria-labelledby="pitch-title">
        <h2 id="pitch-title">{copy.pitchTitle}</h2>
        {copy.pitch.map((paragraph) => (
          <p key={paragraph}>
            <Rich text={paragraph} />
          </p>
        ))}
      </section>
      <section className="hiw-status" aria-labelledby="status-title">
        <h2 id="status-title">{copy.statusTitle}</h2>
        <ModeBadges modes={modes} />
        {notices.map((notice) => (
          <p key={notice} className="hiw-notice">
            {notice}
          </p>
        ))}
      </section>
    </header>
  );
}
