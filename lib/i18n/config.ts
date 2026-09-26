// English first. Japanese is opt-in through the language toggle or ?lang=ja,
// and the choice lives in a cookie so the server renders the right language
// on the first paint.
export const LOCALES = ["en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lang";
export const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
