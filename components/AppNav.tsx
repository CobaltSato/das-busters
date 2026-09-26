"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./I18nProvider";

const APPS = [
  { href: "/counter", key: "counter" },
  { href: "/wallet", key: "wallet" },
  { href: "/mingle", key: "mingle" },
] as const;

// A thin bar above every demo screen, so the counter, DAS Busters and Mingle
// are always one tap apart. The hub already lists them, so it has none.
export function AppNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  if (pathname === "/") return null;
  return (
    <nav className="app-nav" aria-label={t.appNav.label}>
      <Link href="/" className="app-nav-hub">
        {t.appNav.hub}
      </Link>
      <div>
        {APPS.map(({ href, key }) => {
          const current = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} aria-current={current ? "page" : undefined}>
              {t.appNav[key]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
