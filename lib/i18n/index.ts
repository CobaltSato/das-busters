import type { Locale } from "./config";
import en, { type Messages } from "./en";
import ja from "./ja";

export type { Messages };

const MESSAGES: Record<Locale, Messages> = { en, ja };

export function messagesFor(locale: Locale): Messages {
  return MESSAGES[locale];
}

// Values that arrive in English from the issuer or the server (place names,
// certificate fields, notes) are translated when a translation exists.
export function lookup(table: Partial<Record<string, string>>, value: string): string {
  return table[value] ?? value;
}

export function fill(template: string, params: Record<string, string> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => params[key] ?? match);
}

export function formatDate(t: Messages, iso: string): string {
  return new Intl.DateTimeFormat(t.dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
