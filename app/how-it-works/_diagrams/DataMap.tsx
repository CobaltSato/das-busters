import type { ActorId } from "@/lib/i18n/how-it-works/flow";
import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import { ActorIcon } from "../_components/icons";

// Where each piece of data lives, as four columns of chips: green for what
// a party holds, crossed out for what it never holds.

type Copy = StoryCopy["architecture"];

const ICONS: ActorId[] = ["phone", "server", "mingle", "chain"];

export function DataMap({ copy }: { copy: Copy }) {
  return (
    <div className="hiw-datamap" role="group" aria-label={copy.dataTitle}>
      {copy.places.map((place, i) => (
        <div key={place.place} className="hiw-datamap-col">
          <h4>
            <ActorIcon actor={ICONS[i] ?? "server"} size={18} />
            {place.place}
          </h4>
          <ul>
            {place.holds.map((item) => (
              <li key={item} className="hiw-chip is-holds">
                <span className="hiw-visually-hidden">{copy.dataLegend.holds}: </span>
                {item}
              </li>
            ))}
            {place.never.map((item) => (
              <li key={item} className="hiw-chip is-never">
                <span className="hiw-visually-hidden">{copy.dataLegend.never}: </span>
                {item}
              </li>
            ))}
          </ul>
          {place.note && <p>{place.note}</p>}
        </div>
      ))}
    </div>
  );
}
