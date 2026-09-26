"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, LOCALE_MAX_AGE, type Locale } from "@/lib/i18n/config";
import { useI18n } from "./I18nProvider";

const OPTIONS: { locale: Locale; label: string }[] = [
  { locale: "en", label: "EN" },
  { locale: "ja", label: "日本語" },
];

// Stores the choice in a cookie and re-renders on the server, so screens keep
// their state and every app on this device follows the same language.
export function LanguageToggle({ className }: { className?: string }) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_MAX_AGE}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      className={className ? `lang-toggle ${className}` : "lang-toggle"}
      role="group"
      aria-label={t.language}
      aria-busy={pending}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.locale}
          type="button"
          lang={option.locale}
          aria-pressed={option.locale === locale}
          disabled={pending}
          onClick={() => choose(option.locale)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
