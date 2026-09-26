"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import type { Modes } from "@/lib/modes";
import type { HumanRecord } from "@/lib/storage";
import { WorldIdButton } from "../world-id/WorldIdButton";
import { humanLabel } from "./humanLabel";

type Props = { worldId: Modes["worldId"]; human: HumanRecord | null; onVerified: (record: HumanRecord) => void };

// The optional human check on the home screen. World ID runs right here and
// the card turns green when it passes. The simulated check needs the camera
// screen, so it keeps its own page.
export function HumanCard({ worldId, human, onVerified }: Props) {
  const { t } = useI18n();
  const home = t.wallet.home;
  const [justVerified, setJustVerified] = useState(false);
  const simulated = worldId === "simulated";

  function verified(record: HumanRecord) {
    setJustVerified(true);
    onVerified(record);
  }

  return (
    <section className="human-card" aria-labelledby="human-title">
      <div className="human-heading">
        <div>
          <h2 id="human-title">{home.humanTitle}</h2>
          <p>{{ idkit: home.worldId, "idkit-staging": home.worldIdStaging, simulated: home.worldIdSimulated }[worldId]}</p>
        </div>
        <span className={human ? "status-chip is-done" : "status-chip"}>{human ? home.done : home.optional}</span>
      </div>
      {human ? (
        <div className={justVerified ? "human-done is-new" : "human-done"} role={justVerified ? "status" : undefined}>
          <i aria-hidden="true">✓</i>
          <span>
            <strong>{home.humanComplete}</strong>
            <small>{humanLabel(t, human)}</small>
          </span>
        </div>
      ) : (
        <>
          <p>{simulated ? home.humanPitchSimulated : home.humanPitch}</p>
          {simulated ? (
            <Link className="btn btn-outline" href="/wallet/world-id?return=/wallet">
              {home.startSimulatedCheck}
            </Link>
          ) : (
            <WorldIdButton className="btn btn-outline" label={home.verifyWorldId} onDone={verified} />
          )}
        </>
      )}
    </section>
  );
}
