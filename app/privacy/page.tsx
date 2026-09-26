import type { Metadata } from "next";
import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getMessages } from "@/lib/i18n/server";

const PRIVY_POLICY = "https://www.privy.io/privacy-policy";
const ISSUES = "https://github.com/CobaltSato/das-busters/issues";

// Linked from Google's OAuth consent screen, which needs a public policy URL
// before the sign-in can be opened to any Google account.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.privacy.title };
}

export default async function PrivacyPage() {
  const t = await getMessages();
  const p = t.privacy;
  const links: Partial<Record<keyof typeof p.sections, { href: string; label: string }>> = {
    google: { href: PRIVY_POLICY, label: p.privyLink },
    contact: { href: ISSUES, label: p.contactLink },
  };
  return (
    <main className="hub legal">
      <div className="hub-top">
        <Link className="hub-eyebrow" href="/">
          DAS Busters
        </Link>
        <LanguageToggle />
      </div>
      <h1>{p.title}</h1>
      <p className="legal-updated">{p.updated}</p>
      <p className="hub-lede">{p.intro}</p>
      {(Object.keys(p.sections) as (keyof typeof p.sections)[]).map((key) => {
        const link = links[key];
        return (
          <section key={key}>
            <h2>{p.sections[key].heading}</h2>
            <p>{p.sections[key].body}</p>
            {link && (
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label} ↗
              </a>
            )}
          </section>
        );
      })}
    </main>
  );
}
