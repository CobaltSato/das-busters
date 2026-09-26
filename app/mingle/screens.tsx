import Image from "next/image";
import Link from "next/link";
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
  // False until the saved record is read, so a verified profile does not
  // flash the "verify" button first.
  ready: boolean;
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

type HumanKind = keyof Copy["mingle"]["humanBadge"];

// Only a production World ID check comes from a person's World App; staging
// uses the Simulator and the simulated check has no evidence, so neither
// gets the done style.
function humanKind(verification: NonNullable<Verification>): HumanKind | null {
  if (!verification.humanCheck) return null;
  if (verification.humanCheck !== "world-id") return "simulated";
  return verification.humanEnvironment === "production" ? "worldId" : "staging";
}

function VerifiedBadges({ verification }: { verification: NonNullable<Verification> }) {
  const { t } = useI18n();
  const m = t.mingle;
  const { residence, ageRange } = verification.disclosed;
  const human = humanKind(verification);
  return (
    <div className="mingle-badges">
      <span className="mingle-status is-done">{m.badgeVerified}</span>
      {residence && <span className="mingle-status is-done">{m.residenceVerified(lookup(t.places, residence))}</span>}
      {ageRange && <span className="mingle-status is-done">{m.ageVerified(t.ageRange(ageRange))}</span>}
      {human && (
        <span className={human === "worldId" ? "mingle-status is-done" : "mingle-status"}>{m.humanBadge[human]}</span>
      )}
    </div>
  );
}

function ConnectLabel({ label }: { label: string }) {
  return (
    <>
      <Image src="/brand/das-busters.png" alt="" width={24} height={24} />
      <span>{label}</span>
      <b aria-hidden="true">›</b>
    </>
  );
}

export function ProfileScreen({ error, verification, ready, go }: Shared) {
  const { t } = useI18n();
  const m = t.mingle;
  const { name, age, photo, stats } = MINGLE_PROFILE;
  return (
    <main className="mingle">
      <header className="mingle-header">
        <span className="mingle-wordmark">mingle</span>
        <div className="mingle-header-side">
          <LanguageToggle />
          <button type="button" className="mingle-icon-button" aria-label={m.settings} onClick={() => go("settings")}>
            <SlidersIcon />
          </button>
        </div>
      </header>
      <Messages error={error} />
      <section className="mingle-person">
        <Image className="mingle-portrait" src={photo} alt={m.photoAlt(name)} width={112} height={112} priority />
        <h1>
          {name}
          <span>{age}</span>
        </h1>
        <p>{m.profileData.city}</p>
        {verification ? (
          <>
            <VerifiedBadges verification={verification} />
            <button type="button" className="mingle-received" onClick={() => go("verification")}>
              {m.whatReceived} ›
            </button>
          </>
        ) : (
          ready && (
            <button type="button" className="mingle-connect" onClick={() => go("verification")}>
              <ConnectLabel label={m.verifyCta} />
            </button>
          )
        )}
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
          <small>{verification ? m.verified : ready && m.singleNotVerified}</small>
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
  const human = humanKind(verification);
  const short = `${verification.nullifierHash.slice(0, 6)}…${verification.nullifierHash.slice(-4)}`;
  return (
    <>
      <h3 className="mingle-proof-subhead">{p.received}</h3>
      <dl className="mingle-proof-details">
        <div>
          <dt>{p.singleStatus}</dt>
          <dd>✓ {p.single}</dd>
        </div>
        {residence && (
          <div>
            <dt>{p.residence}</dt>
            <dd>✓ {lookup(t.places, residence)}</dd>
          </div>
        )}
        {ageRange && (
          <div>
            <dt>{p.ageRange}</dt>
            <dd>✓ {t.ageRange(ageRange)}</dd>
          </div>
        )}
        {/* Always shown, so a share without the human check reads "None" here. */}
        <div>
          <dt>{p.human}</dt>
          <dd>{human ? p.humanMethod[human] : p.humanNone}</dd>
        </div>
        <div>
          <dt>{p.nullifier}</dt>
          <dd>
            <code>{short}</code>
          </dd>
        </div>
        {/* The issuer key is a public signal, so Mingle learns which office signed. */}
        <div>
          <dt>{p.issuer}</dt>
          <dd>{verification.prover === "groth16" ? p.issuerKey : p.issuerMock}</dd>
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
      </dl>
      {verification.chainNote && (
        <p className="mingle-proof-note">{lookup(t.mingle.chainNotes, verification.chainNote)}</p>
      )}
      {verification.humanNote && (
        <p className="mingle-proof-note">{lookup(t.mingle.humanNotes, verification.humanNote)}</p>
      )}
      <h3 className="mingle-proof-subhead">{p.notReceived}</h3>
      <p className="mingle-proof-note">{p.neverReceived}</p>
      <button type="button" className="mingle-view" onClick={() => go("profile")}>
        {p.viewOnProfile}
      </button>
    </>
  );
}

type VerificationProps = Shared & {
  modes: Modes;
  connecting: boolean;
  onConnect: () => void;
};

export function VerificationScreen({ error, verification, go, modes, connecting, onConnect }: VerificationProps) {
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
            <span className="mingle-status">{c.notVerified}</span>
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
          <p>{verification ? c.singleBodyDone : c.singleBody}</p>
          {verification ? (
            <ProofDetails verification={verification} go={go} />
          ) : (
            <button type="button" className="mingle-connect" onClick={onConnect} disabled={connecting}>
              {connecting ? (
                <>
                  <span className="spinner" />
                  <span>{c.opening}</span>
                </>
              ) : (
                <ConnectLabel label={c.connect} />
              )}
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
      {/* A stored result keeps how it was checked, even after a fallback or a mode change. */}
      <ModeBadges
        modes={verification ? { ...modes, prover: verification.prover, chain: verification.chain } : modes}
        only={["prover", "chain"]}
      />
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
        <p className="muted">{t.mingle.helpDemo}</p>
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
        <p className="muted">{t.mingle.editDemo}</p>
      </section>
    </main>
  );
}
