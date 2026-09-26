import Image from "next/image";
import Link from "next/link";
import type { RefObject } from "react";
import { ModeBadges } from "@/components/ModeBadges";
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

export type Screen = "profile" | "verification" | "settings" | "help" | "edit";
type Verification = MingleRecord["verification"];

type Shared = {
  notice: string | null;
  error: string | null;
  verification: Verification;
  go: (screen: Screen) => void;
};

function Messages({ notice, error }: Pick<Shared, "notice" | "error">) {
  return (
    <>
      {notice && <p className="mingle-notice">✓ {notice}</p>}
      {error && <p className="error-banner">{error}</p>}
    </>
  );
}

function SubHeader({ title, go }: { title: string; go: Shared["go"] }) {
  return (
    <header className="mingle-header">
      <button type="button" className="mingle-back" aria-label="Back" onClick={() => go("profile")}>
        ‹
      </button>
      <h1>{title}</h1>
      <span />
    </header>
  );
}

function VerifiedBadges({ verification }: { verification: NonNullable<Verification> }) {
  const { residence, ageRange } = verification.disclosed;
  return (
    <div className="mingle-badges">
      <span className="mingle-status is-done">✓ Single status verified</span>
      {residence && <span className="mingle-status is-done">Lives in {residence}</span>}
      {ageRange && <span className="mingle-status is-done">{ageRange}</span>}
      {verification.humanCheck && (
        <span className="mingle-status is-done">
          {verification.humanCheck === "world-id" ? "Real person · World ID" : "Human check · simulated"}
        </span>
      )}
    </div>
  );
}

export function ProfileScreen({ notice, error, verification, go }: Shared) {
  const { name, age, city, photo, stats } = MINGLE_PROFILE;
  return (
    <main className="mingle">
      <header className="mingle-header">
        <span className="mingle-wordmark">mingle</span>
        <button type="button" className="mingle-icon-button" aria-label="Settings" onClick={() => go("settings")}>
          <SlidersIcon />
        </button>
      </header>
      <Messages notice={notice} error={error} />
      <section className="mingle-person">
        <Image className="mingle-portrait" src={photo} alt={`${name}’s profile photo`} width={112} height={112} priority />
        <h1>
          {name}
          <span>{age}</span>
        </h1>
        <p>{city}</p>
        {verification && <VerifiedBadges verification={verification} />}
        <button type="button" className="mingle-edit" onClick={() => go("edit")}>
          <PencilIcon />
          Edit profile
        </button>
      </section>
      <section className="mingle-stats" aria-label="Activity">
        <div>
          <strong>{stats.likes}</strong>
          <span>Likes</span>
        </div>
        <div>
          <strong>{stats.matches}</strong>
          <span>Matches</span>
        </div>
        <div>
          <strong>{stats.views}</strong>
          <span>Views</span>
        </div>
      </section>
      <nav className="mingle-menu">
        <button type="button" onClick={() => go("verification")}>
          <ShieldIcon />
          <span>Identity &amp; verification</span>
          <small>{verification ? "Single status verified" : "Identity verified"}</small>
          <b>›</b>
        </button>
        <button type="button" onClick={() => go("settings")}>
          <GearIcon />
          <span>Settings</span>
          <b>›</b>
        </button>
        <button type="button" onClick={() => go("help")}>
          <HelpIcon />
          <span>Help</span>
          <b>›</b>
        </button>
      </nav>
      <nav className="mingle-tabs" aria-label="Main">
        <span>
          <SearchIcon />
          Discover
        </span>
        <span>
          <HeartIcon />
          Likes
        </span>
        <span>
          <ChatIcon />
          Messages
        </span>
        <span aria-current="page">
          <UserIcon />
          Profile
        </span>
      </nav>
    </main>
  );
}

function ProofDetails({ verification, go }: { verification: NonNullable<Verification>; go: Shared["go"] }) {
  const { residence, ageRange } = verification.disclosed;
  const shared = ["Single", residence && `lives in ${residence}`, ageRange].filter(Boolean).join(", ");
  const short = `${verification.nullifierHash.slice(0, 6)}…${verification.nullifierHash.slice(-4)}`;
  return (
    <>
      <dl className="mingle-proof-details">
        <div>
          <dt>Shared</dt>
          <dd>{shared}</dd>
        </div>
        <div>
          <dt>Proof</dt>
          <dd>{verification.prover === "groth16" ? "Zero-knowledge (Groth16)" : "Mock proof"}</dd>
        </div>
        <div>
          <dt>Checked</dt>
          <dd>
            {verification.chain === "sepolia" && verification.txHash ? (
              <a href={`https://sepolia.etherscan.io/tx/${verification.txHash}`} target="_blank" rel="noreferrer">
                On Ethereum Sepolia ↗
              </a>
            ) : (
              "Off-chain by Mingle"
            )}
          </dd>
        </div>
        <div>
          <dt>Nullifier</dt>
          <dd>
            <code>{short}</code>
          </dd>
        </div>
      </dl>
      <p className="mingle-proof-note">Mingle never received your name, birth date or address.</p>
      <button type="button" className="mingle-view" onClick={() => go("profile")}>
        View on profile
      </button>
    </>
  );
}

type VerificationProps = Shared & {
  modes: Modes;
  dialog: RefObject<HTMLDialogElement | null>;
  connecting: boolean;
  onConnect: () => void;
};

export function VerificationScreen({ notice, error, verification, go, modes, dialog, connecting, onConnect }: VerificationProps) {
  return (
    <main className="mingle">
      <SubHeader title="Identity & verification" go={go} />
      <Messages notice={notice} error={error} />
      <div className="mingle-proofs">
        <article>
          <div className="mingle-proof-title">
            <h2>Identity check</h2>
            <span className="mingle-status is-done">Verified</span>
          </div>
          <p>Your identity has been verified using a government-issued ID.</p>
        </article>
        <article>
          <div className="mingle-proof-title">
            <h2>Single status</h2>
            <span className={verification ? "mingle-status is-done" : "mingle-status"}>
              {verification ? "Verified" : "Not verified"}
            </span>
          </div>
          <p>Use an official certificate to show your single status on your profile.</p>
          {verification ? (
            <ProofDetails verification={verification} go={go} />
          ) : (
            <button type="button" className="mingle-connect" onClick={() => dialog.current?.showModal()}>
              <Image src="/brand/das-busters.png" alt="" width={24} height={24} />
              <span>Verify with DAS Busters</span>
              <b aria-hidden="true">›</b>
            </button>
          )}
        </article>
        <article>
          <div className="mingle-proof-title">
            <h2>Income</h2>
            <span className="mingle-status">Not verified</span>
          </div>
          <p>Verify your income to give potential matches more confidence in your profile.</p>
        </article>
      </div>
      <ModeBadges modes={modes} only={["prover", "chain"]} />
      <dialog ref={dialog} className="mingle-dialog">
        <h2>Connect DAS Busters?</h2>
        <p>Open DAS Busters to verify your single status.</p>
        <div>
          <button type="button" onClick={() => dialog.current?.close()} disabled={connecting}>
            Cancel
          </button>
          <button type="button" onClick={onConnect} disabled={connecting}>
            {connecting && <span className="spinner" />}
            Continue
          </button>
        </div>
      </dialog>
    </main>
  );
}

export function SettingsScreen({ notice, error, go, onReset }: Shared & { onReset: () => void }) {
  return (
    <main className="mingle">
      <SubHeader title="Settings" go={go} />
      <Messages notice={notice} error={error} />
      <section className="mingle-secondary">
        <Link className="mingle-outline" href="/wallet">
          Back to DAS Busters
        </Link>
        <button type="button" className="mingle-reset" onClick={onReset}>
          Reset Mingle for another demo run
        </button>
      </section>
    </main>
  );
}

export function HelpScreen({ notice, error, go }: Shared) {
  return (
    <main className="mingle">
      <SubHeader title="Help" go={go} />
      <Messages notice={notice} error={error} />
      <section className="mingle-secondary">
        <p>You can connect a Single Status Certificate under Identity &amp; verification.</p>
        <p className="muted">
          Mingle never sees the certificate itself. DAS Busters sends a proof that you are single, plus anything else you
          choose to share.
        </p>
      </section>
    </main>
  );
}

export function EditScreen({ notice, error, go }: Shared) {
  const { name, age, city, bio } = MINGLE_PROFILE;
  return (
    <main className="mingle">
      <SubHeader title="Edit profile" go={go} />
      <Messages notice={notice} error={error} />
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
