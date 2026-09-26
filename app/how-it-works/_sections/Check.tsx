import type { Locale } from "@/lib/i18n/config";
import {
  ADDRESSES,
  BACKGROUND_LINKS,
  CHAIN_LINKS,
  DEMO_LINKS,
  DEPLOY_TX,
  DOC_LINKS,
  SITE_HOST,
  SOURCE_LINKS,
} from "@/lib/i18n/how-it-works/links";
import type { ReferenceCopy } from "@/lib/i18n/how-it-works/reference.en";
import { Rich } from "../_components/Rich";
import { Section } from "../_components/Section";

type Copy = ReferenceCopy["check"];
type Item = { label: string; note: string };
type LinkCard = Item & { href: string; shown: string; external: boolean };

function short(hex: string): string {
  return `${hex.slice(0, 6)}…${hex.slice(-4)}`;
}

// Explorer links show the site and the address or transaction they point at.
const CHAIN_SHOWN = {
  registryBlockscout: `eth-sepolia.blockscout.com · ${short(ADDRESSES.registry)}`,
  verifierBlockscout: `eth-sepolia.blockscout.com · ${short(ADDRESSES.verifier)}`,
  registrySourcify: `repo.sourcify.dev · ${short(ADDRESSES.registry)}`,
  verifierSourcify: `repo.sourcify.dev · ${short(ADDRESSES.verifier)}`,
  registry: `sepolia.etherscan.io · ${short(ADDRESSES.registry)}`,
  registryDeploy: `sepolia.etherscan.io · tx ${short(DEPLOY_TX.registry)}`,
  verifierDeploy: `sepolia.etherscan.io · tx ${short(DEPLOY_TX.verifier)}`,
};

// What the card shows as the address: the path on the live site, the
// contract address, or the file path in the repository.
function shownUrl(href: string): string {
  if (href.startsWith("/")) return `${SITE_HOST}${href === "/" ? "" : href}`;
  return href.replace(/^https:\/\//, "").replace("github.com/CobaltSato/das-busters/blob/main/", "github · ");
}

function cards<K extends string>(
  items: Record<K, Item>,
  hrefs: Record<K, string>,
  shown: Partial<Record<K, string>> = {},
): LinkCard[] {
  return (Object.keys(items) as K[]).map((key) => ({
    ...items[key],
    href: hrefs[key],
    shown: shown[key] ?? shownUrl(hrefs[key]),
    external: !hrefs[key].startsWith("/"),
  }));
}

function Group({ title, links }: { title: string; links: LinkCard[] }) {
  return (
    <div className="hiw-links-group">
      <h3>{title}</h3>
      <ul className="hiw-links">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="hiw-link"
              {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              <strong>
                {link.label}
                {link.external && <span aria-hidden="true"> ↗</span>}
              </strong>
              <code>{link.shown}</code>
              <span>{link.note}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Check({ copy, locale }: { copy: Copy; locale: Locale }) {
  const docs = {
    readme: DOC_LINKS.readme[locale],
    technical: DOC_LINKS.technical[locale],
    demo: DOC_LINKS.demo[locale],
    aiUsage: DOC_LINKS.aiUsage[locale],
  };
  return (
    <Section id="check" title={copy.title} lede={copy.lede} wide>
      <div className="hiw-recipe">
        <h3>{copy.recipeTitle}</h3>
        <ol>
          {copy.recipe.map((step) => (
            <li key={step}>
              <Rich text={step} />
            </li>
          ))}
        </ol>
      </div>
      <Group title={copy.demoTitle} links={cards(copy.demo, DEMO_LINKS)} />
      <Group title={copy.chainTitle} links={cards(copy.chain, CHAIN_LINKS, CHAIN_SHOWN)} />
      <Group title={copy.sourceTitle} links={cards(copy.source, SOURCE_LINKS)} />
      <Group title={copy.docsTitle} links={cards(copy.docs, docs)} />
      <Group title={copy.backgroundTitle} links={cards(copy.background, BACKGROUND_LINKS)} />
    </Section>
  );
}
