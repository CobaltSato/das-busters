import type { ReferenceCopy } from "@/lib/i18n/how-it-works/reference.en";

// Inputs on the left, what the circuit proves in the middle, the one output
// on the right. HTML rather than SVG so the long check list can wrap.

type Copy = ReferenceCopy["tech"]["circuit"];

export function CircuitMap({ copy }: { copy: Copy }) {
  return (
    <div className="hiw-circuit">
      <div className="hiw-circuit-inputs">
        <div className="hiw-circuit-group is-private">
          <h4>{copy.privateTitle}</h4>
          <ul>
            {copy.private.map((name) => (
              <li key={name}>
                <code>{name}</code>
              </li>
            ))}
          </ul>
        </div>
        <div className="hiw-circuit-group is-public">
          <h4>{copy.publicTitle}</h4>
          <ul>
            {copy.public.map((name) => (
              <li key={name}>
                <code>{name}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="hiw-circuit-core">
        <h4>{copy.checksTitle}</h4>
        <ol>
          {copy.checks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ol>
      </div>
      <div className="hiw-circuit-output">
        <h4>{copy.outputTitle}</h4>
        <code>{copy.output}</code>
      </div>
    </div>
  );
}
