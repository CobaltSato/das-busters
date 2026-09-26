import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { howItWorksFor } from "@/lib/i18n/how-it-works";
import { DOC_LINKS } from "@/lib/i18n/how-it-works/links";
import { getLocale } from "@/lib/i18n/server";
import { getModes } from "@/lib/modes";
import { LevelRoot, LevelToggle } from "./_components/Level";
import { Architecture } from "./_sections/Architecture";
import { Basics } from "./_sections/Basics";
import { Built } from "./_sections/Built";
import { Check } from "./_sections/Check";
import { Flow } from "./_sections/Flow";
import { Hero } from "./_sections/Hero";
import { Qa } from "./_sections/Qa";
import { Idea, Why } from "./_sections/Story";
import { Tech } from "./_sections/Tech";
import "./how-it-works.css";
import "./diagrams.css";
import "./basics.css";
import "./flow.css";
import "./reference.css";

// Hashes, routes and addresses read better in a monospace face.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hiw-mono",
  display: "swap",
});

const CONTENTS = ["why", "idea", "basics", "flow", "architecture", "tech", "built", "check", "qa"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const { story } = howItWorksFor(await getLocale());
  return { title: `${story.meta.title} · DAS Busters`, description: story.meta.description };
}

// A standalone explainer for judges and newcomers. The server renders it in
// the visitor's language and reads the live modes so the page never presents
// a mock or a simulation as the real thing. Pictures carry the story; the
// Engineer switch adds the routes, formulas and contract checks.
export default async function HowItWorksPage() {
  const locale = await getLocale();
  const { story, reference } = howItWorksFor(locale);
  const modes = getModes();
  return (
    <LevelRoot className={`hiw ${mono.variable}`}>
      <div className="hiw-top">
        <Link className="hub-eyebrow" href="/">
          {story.nav.home}
        </Link>
        <LanguageToggle />
      </div>
      <Hero copy={story.hero} strip={story.why.diagram} modes={modes} />
      <nav className="hiw-toc" aria-label={story.nav.label}>
        <ul>
          {CONTENTS.map((id) => (
            <li key={id}>
              <a href={`#${id}`}>{story.nav[id]}</a>
            </li>
          ))}
        </ul>
        <LevelToggle copy={story.level} />
      </nav>
      <Why copy={story.why} />
      <Idea copy={story.idea} />
      <Basics copy={story.basics} worldId={modes.worldId} />
      <Flow copy={story.flow} />
      <Architecture copy={story.architecture} worldId={modes.worldId} />
      <Tech copy={reference.tech} modes={modes} />
      <Built copy={reference.built} worldId={modes.worldId} />
      <Check copy={reference.check} locale={locale} />
      <Qa copy={reference.qa} worldId={modes.worldId} />
      <footer className="hiw-footer">
        <Link href="/" className="hiw-footer-primary">
          {reference.footer.back}
        </Link>
        <a href={DOC_LINKS.readme[locale]} target="_blank" rel="noreferrer">
          {reference.footer.readme} ↗
        </a>
      </footer>
    </LevelRoot>
  );
}
