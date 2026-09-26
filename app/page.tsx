import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ModeBadges } from "@/components/ModeBadges";
import { howItWorksFor } from "@/lib/i18n/how-it-works";
import { getLocale, getMessages } from "@/lib/i18n/server";
import { getModes } from "@/lib/modes";

const APPS = [
  { href: "/counter", key: "counter" },
  { href: "/wallet", key: "wallet" },
  { href: "/mingle", key: "mingle" },
] as const;

export default async function Hub() {
  const t = await getMessages();
  const { story } = howItWorksFor(await getLocale());
  return (
    <main className="hub">
      <div className="hub-top">
        <p className="hub-eyebrow">ETHGlobal Tokyo 2026</p>
        <LanguageToggle />
      </div>
      <h1>{t.hub.title}</h1>
      <p className="hub-lede">{t.hub.lede}</p>
      <Link href="/how-it-works" className="hub-explainer">
        {story.hubLink} <span aria-hidden="true">→</span>
      </Link>
      <ul className="hub-apps">
        {APPS.map(({ href, key }) => (
          <li key={href}>
            <Link href={href} className="hub-card">
              <span className="hub-device">{t.hub.apps[key].device}</span>
              <strong>{t.hub.apps[key].title}</strong>
              <span>{t.hub.apps[key].body}</span>
            </Link>
          </li>
        ))}
      </ul>
      <ModeBadges modes={getModes()} className="hub-modes" />
      <div className="hub-footer">
        <Link href="/reset" className="hub-reset">
          {t.reset.title}
        </Link>
        <Link href="/privacy" className="hub-reset">
          {t.privacy.title}
        </Link>
      </div>
    </main>
  );
}
