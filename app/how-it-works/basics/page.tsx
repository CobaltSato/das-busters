import type { Metadata } from "next";
import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { howItWorksFor } from "@/lib/i18n/how-it-works";
import { getLocale } from "@/lib/i18n/server";
import { getModes, provingLocation } from "@/lib/modes";
import { hiwMono } from "../_components/font";
import { LevelRoot, LevelToggle } from "../_components/Level";
import { BasicsTerms } from "../_sections/Basics";
import { modeNotices } from "../_sections/Hero";
import "../how-it-works.css";
import "../diagrams.css";
import "../basics.css";
import "../reference.css";

export async function generateMetadata(): Promise<Metadata> {
  const { story } = howItWorksFor(await getLocale());
  return { title: `${story.basics.title} · DAS Busters`, description: story.basicsPage.description };
}

// The seven terms How it works relies on, each with a picture, on a page of
// their own so the main explainer stays short. The page reads the live modes:
// the same notices as the main page appear when the prover is a mock, runs on
// the server or the chain is off, and the World ID term never describes a
// simulated check as a real one.
export default async function BasicsPage() {
  const { story, reference } = howItWorksFor(await getLocale());
  const { basics, basicsPage } = story;
  const modes = getModes();
  const notices = modeNotices(story.hero.notice, modes, provingLocation());
  return (
    <LevelRoot className={`hiw ${hiwMono.variable}`}>
      <div className="hiw-top">
        <p className="hiw-crumbs">
          <Link href="/how-it-works">
            <span aria-hidden="true">← </span>
            {basicsPage.back}
          </Link>
          <Link href="/">{story.nav.home}</Link>
        </p>
        <LanguageToggle />
      </div>
      <header className="hiw-page-head">
        <h1>{basics.title}</h1>
        <p className="hiw-lede">{basics.lede}</p>
        {notices.map((notice) => (
          <p key={notice} className="hiw-notice">
            {notice}
          </p>
        ))}
        <LevelToggle copy={story.level} />
      </header>
      <BasicsTerms copy={basics} worldId={modes.worldId} />
      <footer className="hiw-footer">
        <Link href="/how-it-works" className="hiw-footer-primary">
          {basicsPage.footer}
        </Link>
        <Link href="/">{reference.footer.back}</Link>
      </footer>
    </LevelRoot>
  );
}
