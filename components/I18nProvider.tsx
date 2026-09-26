"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/lib/i18n/config";
import { messagesFor, type Messages } from "@/lib/i18n";

type I18n = { locale: Locale; t: Messages };

const I18nContext = createContext<I18n>({ locale: "en", t: messagesFor("en") });

// The root layout reads the cookie and passes the locale down, so the first
// paint is already in the right language.
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, t: messagesFor(locale) }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
