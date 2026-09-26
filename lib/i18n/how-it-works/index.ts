import "server-only";
import type { Locale } from "../config";
import referenceEn, { type ReferenceCopy } from "./reference.en";
import referenceJa from "./reference.ja";
import storyEn, { type StoryCopy } from "./story.en";
import storyJa from "./story.ja";

// The explainer's copy is long, so it stays out of lib/i18n/{en,ja}.ts,
// which ship to the browser on every screen. The server renders the page;
// only the walkthrough's steps reach the client, as props.

export type HowItWorksCopy = { story: StoryCopy; reference: ReferenceCopy };

const COPY: Record<Locale, HowItWorksCopy> = {
  en: { story: storyEn, reference: referenceEn },
  ja: { story: storyJa, reference: referenceJa },
};

export function howItWorksFor(locale: Locale): HowItWorksCopy {
  return COPY[locale];
}
