import Image from "next/image";
import Link from "next/link";
import type { RefObject } from "react";
import { useI18n } from "@/components/I18nProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ModeBadges } from "@/components/ModeBadges";
import { lookup, type Messages as Copy } from "@/lib/i18n";
import { MINGLE_PROFILE } from "@/lib/mingle";
import type { Modes } from "@/lib/modes";
import type { MingleRecord } from "@/lib/storage";
import {
  ChatIcon,
  GearIcon,
  HeartIcon,
  HelpIcon,
  PencilIcon,
  SearchIcon,
  ShieldIcon,
  SlidersIcon,
  UserIcon,
} from "./icons";
import { TxStatus } from "./TxStatus";

export type Screen = "profile" | "verification" | "settings" | "help" | "edit";
type Verification = MingleRecord["verification"];

type Shared = {
  error: string | null;
  verification: Verification;
  go: (screen: Screen) => void;
};

function Messages({ error }: Pick<Shared, "error">) {
  return error ? <p className="error-banner">{error}</p> : null;
}

function SubHeader({ title, go }: { title: string; go: Shared["go"] }) {
  const { t } = useI18n();
  return (
    <header className="mingle-header">
      <button type="button" className="mingle-back" aria-label={t.common.back} onClick={() => go("profile")}>
        ‹
      </button>
      <h1>{title}</h1>
      <span />
    </header>
  );
}

function VerifiedBadges({ verification }: { verification: NonNullable<Verification> }) {
  const { t } = useI18n();
  const m = t.mingle;
  const { residence, ageRange } = verification.disclosed;
  return (
    <div className="mingle-badges">
      <span className="mingle-status is-done">{m.badgeVerified}</span>
      {residence && <span className="mingle-status is-done">{m.livesIn(lookup(t.places, residence))}</span>}
      {ageRange && <span className="mingle-status is-done">{t.ageRange(ageRange)}</span>}
      {verification.humanCheck && <span className="mingle-status is-done">{m.human}</span>}
    </div>
  );
}

export function ProfileScreen({ error, verification, go }: Shared) {
  const { t } = useI18n();
  const m = t.mingle;
  const { name, age, photo, stats } = MINGLE_PROFILE;
  return (
    <main className="mingle">
      <header className="mingle-header">
        <span className="mingle-wordmark">mingle</span>
        <button type="button" className="mingle-icon-button" aria-label={m.settings} onClick={() => go("settings")}>
          <SlidersIcon />
        </button>
      </header>
      <Messages error={error} />
      <section className="mingle-person">
        <Image className="mingle-portrait" src={photo} alt={m.photoAlt(name)} width={112} height={112} priority />
        <h1>
          {name}
          <span>{age}</span>
        </h1>
        <p>{m.profileData.city}</p>
        {verification && <VerifiedBadges verification={verification} />}
        <button type="button" className="mingle-edit" onClick={() => go("edit")}>
          <PencilIcon />
          {m.editProfile}
        </button>
      </section>
      <section className="mingle-stats" aria-label={m.activity}>
        <div>
          <strong>{stats.likes}</strong>
          <span>{m.likes}</span>
        </div>
        <div>
          <strong>{stats.matches}</strong>
          <span>{m.matches}</span>
        </div>
        <div>
          <strong>{stats.views}</strong>
          <span>{m.views}</span>
        </div>
      </section>
      <nav className="mingle-menu">
        <button type="button" onClick={() => go("verification")}>
          <ShieldIcon />
          <span>{m.identityVerification}</span>
          <small>{verification ? m.verified : m.identityVerified}</small>
          <b>›</b>
        </button>
        <button type="button" onClick={() => go("settings")}>
          <GearIcon />
          <span>{m.settings}</span>
          <b>›</b>
        </button>
        <button type="button" onClick={() => go("help")}>
          <HelpIcon />
          <span>{m.help}</span>
          <b>›</b>
        </button>
      </nav>
      <nav className="mingle-tabs" aria-label={m.mainNav}>
        <span>
          <SearchIcon />
          {m.discover}
        </span>
        <span>
          <HeartIcon />
          {m.likes}
        </span>
        <span>
          <ChatIcon />
          {m.messages}
        </span>
        <span aria-current="page">
          <UserIcon />
          {m.profile}
        </span>
      </nav>
    </main>
  );
}

function ProofDetails({ verification, go }: { verification: NonNullable<Verification>; go: Shared["go"] }) {
  const { t } = useI18n();
  const p = t.mingle.proof;
  const { residence, ageRange } = verification.disclosed;
  const shared = [p.single, residence && p.livesIn(lookup(t.places, residence)), ageRange && t.ageRange(ageRange)]
    .filter(Boolean)
    .join(p.listSeparator);
  const short = `${verification.nullifierHash.slice(0, 6)}…${verification.nullifierHash.slice(-4)}`;
  return (
    <>
      <dl className="mingle-proof-details">
        <div>
          <dt>{p.shared}</dt>
          <dd>{shared}</dd>
        </div>
        <div>
          <dt>{p.proof}</dt>
          <dd>{verification.prover === "groth16" ? p.zk : p.mock}</dd>
        </div>
        <div>
          <dt>{p.checked}</dt>
          <dd>
            {verification.chain === "sepolia" && verification.txHash ? (
              <TxStatus txHash={verification.txHash} />
            ) : (
              p.offChain
            )}
          </dd>
        </div>
        {verification.humanCheck && (
          <div>
            <dt>{p.human}</dt>
            <dd>{humanMethod(p, verification)}</dd>
          </div>
        )}
        <div>
          <dt>{p.nullifier}</dt>
          <dd>
            <code>{short}</code>
          </dd>
        </div>
      </dl>
      {verification.chainNote && (
        <p className="mingle-proof-note">{lookup(t.mingle.chainNotes, verification.chainNote)}</p>
      )}
      <p className="mingle-proof-note">{p.neverReceived}</p>
      <button type="button" className="mingle-view" onClick={() => go("profile")}>
        {p.viewOnProfile}
      </button>
    </>
  );
}

// The profile badge just says "Human"; how it was checked is spelled out here.
function humanMethod(p: Copy["mingle"]["proof"], verification: NonNullable<Verification>): string {
  if (verification.humanCheck !== "world-id") return p.humanSimulated;
  return verification.humanEnvironment === "production" ? p.humanWorldId : p.humanStaging;
}

type VerificationProps = Shared & {
  modes: Modes;
  dialog: RefObject<HTMLDialogElement | null>;
  connecting: boolean;
  onConnect: () => void;
};

export function VerificationScreen({ error, verification, go, modes, dialog, connecting, onConnect }: VerificationProps) {
  const { t } = useI18n();
  const m = t.mingle;
  const c = m.checks;
  return (
    <main className="mingle">
      <SubHeader title={m.identityVerification} go={go} />
      <Messages error={error} />
      <div className="mingle-proofs">
        <article>
          <div className="mingle-proof-title">
            <h2>{c.identity}</h2>
            <span className="mingle-status is-done">{c.verified}</span>
          </div>
          <p>{c.identityBody}</p>
        </article>
        <article>
          <div className="mingle-proof-title">
            <h2>{c.single}</h2>
            <span className={verification ? "mingle-status is-done" : "mingle-status"}>
              {verification ? c.verified : c.notVerified}
            </span>
          </div>
          <p>{c.singleBody}</p>
          {verification ? (
            <ProofDetails verification={verification} go={go} />
          ) : (
            <button type="button" className="mingle-connect" onClick={() => dialog.current?.showModal()}>
              <Image src="/brand/das-busters.png" alt="" width={24} height={24} />
              <span>{c.connect}</span>
              <b aria-hidden="true">›</b>
            </button>
          )}
        </article>
        <article>
          <div className="mingle-proof-title">
            <h2>{c.income}</h2>
            <span className="mingle-status">{c.notVerified}</span>
          </div>
          <p>{c.incomeBody}</p>
        </article>
      </div>
      <ModeBadges modes={modes} only={["prover", "chain"]} />
      <dialog ref={dialog} className="mingle-dialog">
        <h2>{m.connectTitle}</h2>
        <p>{m.connectBody}</p>
        <div>
          <button type="button" onClick={() => dialog.current?.close()} disabled={connecting}>
            {t.common.cancel}
          </button>
          <button type="button" onClick={onConnect} disabled={connecting}>
            {connecting && <span className="spinner" />}
            {t.common.continue}
          </button>
        </div>
      </dialog>
    </main>
  );
}

export function SettingsScreen({ error, go, onReset }: Shared & { onReset: () => void }) {
  const { t } = useI18n();
  return (
    <main className="mingle">
      <SubHeader title={t.mingle.settings} go={go} />
      <Messages error={error} />
      <section className="mingle-secondary">
        <div className="mingle-setting">
          <span>{t.language}</span>
          <LanguageToggle />
        </div>
        <Link className="mingle-outline" href="/wallet">
          {t.mingle.backToWallet}
        </Link>
        <button type="button" className="mingle-reset" onClick={onReset}>
          {t.mingle.reset}
        </button>
      </section>
    </main>
  );
}

export function HelpScreen({ error, go }: Shared) {
  const { t } = useI18n();
  return (
    <main className="mingle">
      <SubHeader title={t.mingle.help} go={go} />
      <Messages error={error} />
      <section className="mingle-secondary">
        <p>{t.mingle.helpBody}</p>
        <p className="muted">{t.mingle.helpMuted}</p>
      </section>
    </main>
  );
}

export function EditScreen({ error, go }: Shared) {
  const { t } = useI18n();
  const { name, age } = MINGLE_PROFILE;
  const { city, bio } = t.mingle.profileData;
  return (
    <main className="mingle">
      <SubHeader title={t.mingle.editProfile} go={go} />
      <Messages error={error} />
      <section className="mingle-secondary">
        <p>
          <strong>{name}</strong>
        </p>
        <p className="muted">
          {age} · {city}
        </p>
        <p>{bio}</p>
      </section>
    </main>
  );
}
