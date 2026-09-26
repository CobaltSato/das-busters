import type { ReferenceCopy } from "@/lib/i18n/how-it-works/reference.en";
import type { Modes } from "@/lib/modes";
import { LevelSwitch } from "../_components/Level";
import { Rich } from "../_components/Rich";
import { Section } from "../_components/Section";
import { CircuitMap } from "../_diagrams/CircuitMap";
import { RegistryTree } from "../_diagrams/RegistryTree";

type Copy = ReferenceCopy["tech"];

const MODE_ORDER = ["auth", "prover", "chain", "worldId"] as const;

// The real implementation of each part, as in components/ModeBadges.tsx.
const LIVE: Modes = { auth: "privy", prover: "groth16", chain: "sepolia", worldId: "idkit" };

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="hiw-tech-block">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

// Six figures anyone can read, shown in both views as ruled lines.
function Numbers({ items }: { items: Copy["numbers"] }) {
  return (
    <dl className="hiw-facts">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Signals({ circuit }: { circuit: Copy["circuit"] }) {
  const head = circuit.signalsHead;
  return (
    <div className="hiw-table-wrap">
      <table className="hiw-table is-compact">
        <caption>{circuit.signalsTitle}</caption>
        <thead>
          <tr>
            <th scope="col">{head.index}</th>
            <th scope="col">{head.name}</th>
            <th scope="col">{head.meaning}</th>
          </tr>
        </thead>
        <tbody>
          {circuit.signals.map((signal, i) => (
            <tr key={signal.name}>
              <td>{i}</td>
              <td>
                <code>{signal.name}</code>
              </td>
              <td>{signal.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tokens({ tokens }: { tokens: Copy["tokens"] }) {
  const head = tokens.head;
  return (
    <>
      <table className="hiw-table is-stacking">
        <thead>
          <tr>
            <th scope="col">{head.name}</th>
            <th scope="col">{head.life}</th>
            <th scope="col">{head.carries}</th>
            <th scope="col">{head.stops}</th>
          </tr>
        </thead>
        <tbody>
          {tokens.rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">{row.name}</th>
              <td data-label={head.life}>{row.life}</td>
              <td data-label={head.carries}>{row.carries}</td>
              <td data-label={head.stops}>{row.stops}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hiw-note">{tokens.note}</p>
    </>
  );
}

// The "This deployment" column is read from the live modes, not written in.
function ModesTable({ copy, modes }: { copy: Copy["modes"]; modes: Modes }) {
  const head = copy.head;
  const now = (key: (typeof MODE_ORDER)[number]) => (copy.now[key] as Record<string, string>)[modes[key]];
  const live = (key: (typeof MODE_ORDER)[number]) => modes[key] === LIVE[key];
  return (
    <table className="hiw-table is-stacking">
      <thead>
        <tr>
          <th scope="col">{head.part}</th>
          <th scope="col">{head.env}</th>
          <th scope="col">{head.mock}</th>
          <th scope="col">{head.real}</th>
          <th scope="col">{head.now}</th>
        </tr>
      </thead>
      <tbody>
        {MODE_ORDER.map((key) => (
          <tr key={key}>
            <th scope="row">{copy.rows[key].part}</th>
            <td data-label={head.env}>
              <code>{copy.rows[key].env}</code>
            </td>
            <td data-label={head.mock}>{copy.rows[key].mock}</td>
            <td data-label={head.real}>{copy.rows[key].real}</td>
            <td data-label={head.now}>
              <span className={live(key) ? "hiw-pill is-live" : "hiw-pill"}>{now(key)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Plain view: the numbers and a way to switch. Engineer view: everything.
export function Tech({ copy, modes }: { copy: Copy; modes: Modes }) {
  const { certificate, holderKey, circuit, proving, verification } = copy;
  return (
    <Section id="tech" title={copy.title} lede={copy.lede} wide>
      <Numbers items={copy.numbers} />
      <p className="hiw-plain-only">
        {copy.plainOnly} <LevelSwitch>{copy.plainSwitch}</LevelSwitch>
      </p>
      <div className="hiw-tech">
        <Block title={certificate.title}>
          <p>{certificate.body}</p>
          <pre className="hiw-code">{certificate.code}</pre>
          <p className="hiw-note">{certificate.note}</p>
        </Block>
        <Block title={holderKey.title}>
          <p>{holderKey.body}</p>
          <pre className="hiw-code">{holderKey.code}</pre>
        </Block>
        <Block title={circuit.title}>
          <p>
            <Rich text={circuit.lede} />
          </p>
          <CircuitMap copy={circuit} />
          <h4 className="hiw-tech-minor">{circuit.excerptTitle}</h4>
          <pre className="hiw-code">{circuit.excerpt}</pre>
          <Signals circuit={circuit} />
        </Block>
        <Block title={proving.title}>
          {proving.body.map((paragraph) => (
            <p key={paragraph}>
              <Rich text={paragraph} />
            </p>
          ))}
        </Block>
        <Block title={verification.title}>
          <div className="hiw-verify">
            <div>
              <h4 className="hiw-tech-minor">{verification.offchainTitle}</h4>
              <ol className="hiw-checklist">
                {verification.offchain.map((item) => (
                  <li key={item}>
                    <Rich text={item} />
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h4 className="hiw-tech-minor">{verification.treeTitle}</h4>
              <RegistryTree tree={verification.tree} />
            </div>
          </div>
          <p className="hiw-rule">{verification.rule}</p>
        </Block>
        <Block title={copy.tokens.title}>
          <Tokens tokens={copy.tokens} />
        </Block>
        <Block title={copy.modes.title}>
          <p>{copy.modes.lede}</p>
          <ModesTable copy={copy.modes} modes={modes} />
        </Block>
      </div>
    </Section>
  );
}
