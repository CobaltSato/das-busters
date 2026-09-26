import type { ActorId } from "@/lib/i18n/how-it-works/flow";
import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import { ActorIcon } from "../_components/icons";

// Issuer → holder → verifier → public record, left to right on wide screens
// and top to bottom on phones. A token runs along each link in turn.

type Copy = StoryCopy["idea"];
type RoleKey = keyof Copy["roles"];
type LinkKey = keyof Copy["links"];

const ORDER: { role: RoleKey; icon: ActorId; link?: LinkKey }[] = [
  { role: "issuer", icon: "counter", link: "certificate" },
  { role: "holder", icon: "phone", link: "proof" },
  { role: "verifier", icon: "mingle", link: "record" },
  { role: "chain", icon: "chain" },
];

export function RolesDiagram({ copy }: { copy: Copy }) {
  return (
    <div className="hiw-roles" role="group" aria-label={copy.label}>
      {ORDER.map(({ role, icon, link }, i) => (
        <div key={role} className="hiw-roles-step">
          <div className={`hiw-role is-${role}`}>
            <ActorIcon actor={icon} size={22} />
            <span className="hiw-role-kind">{copy.roles[role].role}</span>
            <strong>{copy.roles[role].name}</strong>
            <p>{copy.roles[role].body}</p>
          </div>
          {link && (
            <div className={`hiw-roles-link is-${link}`}>
              <span className="hiw-roles-track" aria-hidden="true">
                <span className="hiw-roles-token" style={{ animationDelay: `${i * 1.2}s` }} />
              </span>
              <span className="hiw-roles-label">{copy.links[link]}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
