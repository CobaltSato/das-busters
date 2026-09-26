import type { Metadata } from "next";
import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { howItWorksFor } from "@/lib/i18n/how-it-works";
import { DOC_LINKS } from "@/lib/i18n/how-it-works/links";
import { getLocale } from "@/lib/i18n/server";
import { getModes, provingLocation } from "@/lib/modes";
import { hiwMono } from "./_components/font";
import { LevelRoot, LevelToggle } from "./_components/Level";
import { Architecture } from "./_sections/Architecture";
import { Built } from "./_sections/Built";
import { Check } from "./_sections/Check";
import { Flow } from "./_sections/Flow";
import { Hero } from "./_sections/Hero";
import { Qa } from "./_sections/Qa";
import { BasicsPointer, Idea, Why } from "./_sections/Story";
import { Tech } from "./_sections/Tech";
import "./how-it-works.css";
import "./diagrams.css";
import "./basics.css";
import "./flow.css";
import "./reference.css";
import "./answers.css";

const CONTENTS = ["why", "idea", "flow", "architecture", "tech", "built", "check", "qa"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const { story } = howItWorksFor(await getLocale());
  return { title: `${story.meta.title} · DAS Busters`, description: story.meta.description };
}

// A standalone explainer for newcomers and engineers. The server renders it in
// the visitor's language and reads the live modes so the page never presents
// a mock or a simulation as the real thing. Pictures carry the story; the
// Engineer switch adds the routes, formulas and contract checks. The seven
// basic terms (signature, hash, ZK proof and so on) are on /how-it-works/basics.
export default async function HowItWorksPage() {
  const locale = await getLocale();
  const { story, reference } = howItWorksFor(locale);
  const modes = getModes();
  const proveOn = provingLocation();
  return (
    <LevelRoot className={`hiw ${hiwMono.variable}`}>
      <div className="hiw-top">
        <Link className="hub-eyebrow" href="/">
          {story.nav.home}
        </Link>
        <LanguageToggle />
      </div>
      <Hero copy={story.hero} strip={story.why.diagram} modes={modes} proveOn={proveOn} />
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
      <BasicsPointer copy={story.basicsPage} />
      <Flow copy={story.flow} />
      <Architecture copy={story.architecture} worldId={modes.worldId} />
      <Tech copy={reference.tech} modes={modes} proveOn={proveOn} />
      <Built copy={reference.built} worldId={modes.worldId} />
      <Check copy={reference.check} locale={locale} />
      <Qa
        copy={reference.qa}
        pictures={{ stamp: story.basics.signature.art, nullifier: story.basics.nullifier.diagram }}
        worldId={modes.worldId}
      />
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
