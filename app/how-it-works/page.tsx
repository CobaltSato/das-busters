import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { howItWorksFor } from "@/lib/i18n/how-it-works";
import { getLocale } from "@/lib/i18n/server";
import { getModes } from "@/lib/modes";
import { Basics } from "./_sections/Basics";
import { Hero } from "./_sections/Hero";
import { Idea, Why } from "./_sections/Story";
import "./how-it-works.css";
import "./diagrams.css";

// Hashes, routes and addresses read better in a monospace face.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hiw-mono",
  display: "swap",
});

const CONTENTS = ["why", "idea", "basics"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const { story } = howItWorksFor(await getLocale());
  return { title: `${story.meta.title} · DAS Busters`, description: story.meta.description };
}

// A standalone explainer for judges and newcomers. The server renders it in
// the visitor's language and reads the live modes so the page never presents
// a mock or a simulation as the real thing.
export default async function HowItWorksPage() {
  const { story } = howItWorksFor(await getLocale());
  const modes = getModes();
  return (
    <main className={`hiw ${mono.variable}`}>
      <div className="hiw-top">
        <Link className="hub-eyebrow" href="/">
          {story.nav.home}
        </Link>
        <LanguageToggle />
      </div>
      <Hero copy={story.hero} modes={modes} />
      <nav className="hiw-toc" aria-label={story.nav.label}>
        <ul>
          {CONTENTS.map((id) => (
            <li key={id}>
              <a href={`#${id}`}>{story.nav[id]}</a>
            </li>
          ))}
        </ul>
      </nav>
      <Why copy={story.why} />
      <Idea copy={story.idea} />
      <Basics copy={story.basics} worldId={modes.worldId} />
    </main>
  );
}
