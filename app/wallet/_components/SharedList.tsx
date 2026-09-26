"use client";

import { useI18n } from "@/components/I18nProvider";
import { lookup, type Messages } from "@/lib/i18n";
import type { ShareRecord } from "@/lib/storage";

// The newest few are enough to answer "what did I give Mingle?".
const SHOWN = 5;

export function describeShare(t: Messages, share: ShareRecord): string {
  const home = t.wallet.home;
  const { residence, ageRange } = share.disclosed;
  const extras = [residence && home.livesIn(lookup(t.places, residence)), ageRange && t.ageRange(ageRange)]
    .filter(Boolean)
    .join(home.listSeparator);
  return extras ? home.sharedSingleWith(extras) : home.sharedSingle;
}

function formatShared(locale: string, iso: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// What this wallet has shared, from its own history on this phone.
export function SharedList({ shares }: { shares: ShareRecord[] }) {
  const { t } = useI18n();
  const home = t.wallet.home;
  const provedOn = { device: home.provedOnDevice, server: home.provedOnServer };
  return (
    <section className="human-card shared-card" aria-labelledby="shared-title">
      <div className="human-heading">
        <h2 id="shared-title">{home.sharedTitle}</h2>
      </div>
      <ul className="shared-list">
        {shares.slice(0, SHOWN).map((share) => (
          <li key={`${share.verifier}-${share.sharedAt}`}>
            <span className="shared-head">
              <strong>{share.verifier}</strong>
              <time dateTime={share.sharedAt}>{formatShared(t.dateLocale, share.sharedAt)}</time>
            </span>
            <span>{describeShare(t, share)}</span>
            {share.provedOn && <small>{provedOn[share.provedOn]}</small>}
          </li>
        ))}
      </ul>
    </section>
  );
}
