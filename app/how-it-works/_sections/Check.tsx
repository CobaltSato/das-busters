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

// The links most readers want first: the demo, the records on-chain, the
// verified source and the repository. The rest sit under "More links".
const FIRST: readonly string[] = [DEMO_LINKS.hub, CHAIN_LINKS.registryBlockscout, CHAIN_LINKS.registrySourcify, SOURCE_LINKS.repo];

function LinkList({ links }: { links: LinkCard[] }) {
  return (
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
  );
}

function Group({ title, links }: { title: string; links: LinkCard[] }) {
  const rest = links.filter((link) => !FIRST.includes(link.href));
  if (rest.length === 0) return null;
  return (
    <div className="hiw-links-group">
      <h3>{title}</h3>
      <LinkList links={rest} />
    </div>
  );
}

// Plain view keeps the four first links in sight. The three-minute recipe
// and every other link open on demand, in both views.
export function Check({ copy, locale }: { copy: Copy; locale: Locale }) {
  const docs = {
    readme: DOC_LINKS.readme[locale],
    technical: DOC_LINKS.technical[locale],
    demo: DOC_LINKS.demo[locale],
    aiUsage: DOC_LINKS.aiUsage[locale],
  };
  const groups = [
    { title: copy.demoTitle, links: cards(copy.demo, DEMO_LINKS) },
    { title: copy.chainTitle, links: cards(copy.chain, CHAIN_LINKS, CHAIN_SHOWN) },
    { title: copy.sourceTitle, links: cards(copy.source, SOURCE_LINKS) },
    { title: copy.docsTitle, links: cards(copy.docs, docs) },
    { title: copy.backgroundTitle, links: cards(copy.background, BACKGROUND_LINKS) },
  ];
  const all = groups.flatMap((group) => group.links);
  const first = FIRST.flatMap((href) => all.filter((link) => link.href === href));
  return (
    <Section id="check" title={copy.title} lede={copy.lede} wide>
      <LinkList links={first} />
      <details className="hiw-more hiw-disclosure">
        <summary>{copy.recipeTitle}</summary>
        <ol className="hiw-recipe">
          {copy.recipe.map((step) => (
            <li key={step}>
              <Rich text={step} />
            </li>
          ))}
        </ol>
      </details>
      <details className="hiw-more hiw-disclosure">
        <summary>{copy.moreLinks}</summary>
        {groups.map((group) => (
          <Group key={group.title} title={group.title} links={group.links} />
        ))}
      </details>
    </Section>
  );
}
