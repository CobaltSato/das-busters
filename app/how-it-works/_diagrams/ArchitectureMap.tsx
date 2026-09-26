import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import type { Modes } from "@/lib/modes";
import { ActorIcon } from "../_components/icons";

// Three tiers: what runs in the browser, the roles the one server plays,
// and the outside services. Laid out in HTML so it reflows on phones.

type Copy = StoryCopy["architecture"];
type ServerRole = keyof Copy["server"] & ("issuer" | "prover" | "verifier" | "worldId");

const SERVER_ROLES: ServerRole[] = ["issuer", "prover", "verifier", "worldId"];

function Link() {
  return (
    <div className="hiw-arch-link" aria-hidden="true">
      <span className="hiw-arch-pulse" />
    </div>
  );
}

export function ArchitectureMap({ copy, worldId }: { copy: Copy; worldId: Modes["worldId"] }) {
  const worldIdLive = worldId === "idkit";
  return (
    <div className="hiw-arch">
      <div className="hiw-arch-tier">
        <h3>{copy.browser.title}</h3>
        <div className="hiw-arch-row">
          <div className="hiw-arch-box">
            <ActorIcon actor="counter" size={20} />
            <strong>{copy.browser.counter}</strong>
            <code>/counter</code>
          </div>
          <div className="hiw-arch-box">
            <ActorIcon actor="phone" size={20} />
            <strong>{copy.browser.wallet}</strong>
            <code>/wallet</code>
            <span>{copy.browser.storage}</span>
          </div>
          <div className="hiw-arch-box">
            <ActorIcon actor="mingle" size={20} />
            <strong>{copy.browser.mingle}</strong>
            <code>/mingle</code>
          </div>
        </div>
      </div>
      <Link />
      <div className="hiw-arch-tier is-server">
        <h3>{copy.server.title}</h3>
        <div className="hiw-arch-row is-four">
          {SERVER_ROLES.map((role) => (
            <div key={role} className="hiw-arch-box">
              <strong>{copy.server[role].name}</strong>
              <code>{copy.server[role].routes}</code>
              <span>{copy.server[role].key}</span>
            </div>
          ))}
        </div>
      </div>
      <Link />
      <div className="hiw-arch-tier">
        <h3>{copy.outside.title}</h3>
        <div className="hiw-arch-row">
          <div className="hiw-arch-box">
            <ActorIcon actor="google" size={20} />
            <strong>{copy.outside.privy.name}</strong>
            <span>{copy.outside.privy.note}</span>
          </div>
          <div className="hiw-arch-box">
            <ActorIcon actor="chain" size={20} />
            <strong>{copy.outside.chain.name}</strong>
            <span>{copy.outside.chain.note}</span>
          </div>
          <div className={worldIdLive ? "hiw-arch-box" : "hiw-arch-box is-dashed"}>
            <ActorIcon actor="human" size={20} />
            <strong>{copy.outside.worldId.name}</strong>
            <span>{copy.outside.worldId.note}</span>
            <em className={worldIdLive ? "hiw-arch-status is-live" : "hiw-arch-status"}>
              {copy.worldIdStatus[worldId]}
            </em>
          </div>
        </div>
      </div>
    </div>
  );
}
