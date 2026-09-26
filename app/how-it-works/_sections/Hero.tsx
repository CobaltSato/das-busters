import { Fragment } from "react";
import { ModeBadges } from "@/components/ModeBadges";
import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import type { Modes, ProvingLocation } from "@/lib/modes";
import { Envelope } from "../_diagrams/Envelope";
import { PitchStrip } from "../_diagrams/PitchStrip";

type HeroProps = {
  copy: StoryCopy["hero"];
  strip: StoryCopy["why"]["diagram"];
  modes: Modes;
  proveOn: ProvingLocation;
};

// The notices for whatever this deployment runs as a mock, off-chain or on
// the server, so a page that describes Groth16 or Sepolia never reads as
// live when it is not. /how-it-works and /how-it-works/basics both show them.
export function modeNotices(
  notice: StoryCopy["hero"]["notice"],
  modes: Modes,
  proveOn: ProvingLocation,
): string[] {
  return [
    modes.prover !== "groth16" ? notice.mockProver : null,
    modes.prover === "groth16" && proveOn === "server" ? notice.serverProver : null,
    modes.chain !== "sepolia" ? notice.offChain : null,
  ].filter((text): text is string => text !== null);
}

// The thesis, the pitch in three frames, and what this deployment actually
// runs, so nothing below reads as live when it is a mock.
export function Hero({ copy, strip, modes, proveOn }: HeroProps) {
  const notices = modeNotices(copy.notice, modes, proveOn);

  return (
    <header className="hiw-hero">
      <div className="hiw-hero-text">
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
        <PitchStrip copy={copy.pitch} strip={strip} />
        <p className="hiw-pitch-note">{copy.pitchNote}</p>
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
