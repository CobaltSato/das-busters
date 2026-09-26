import { STEPS } from "@/lib/i18n/how-it-works/flow";
import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import { Section } from "../_components/Section";
import { SequencePlayer, type PlayerStep } from "../_components/SequencePlayer";

type Copy = StoryCopy["flow"];

export function Flow({ copy }: { copy: Copy }) {
  const steps: PlayerStep[] = STEPS.map((step) => ({ ...step, ...copy.steps[step.id] }));
  return (
    <Section id="flow" title={copy.title} lede={copy.lede} wide>
      <SequencePlayer
        label={copy.label}
        steps={steps}
        actors={copy.actors}
        phases={copy.phases}
        controls={copy.controls}
      />
      <p className="hiw-note">{copy.serverNote}</p>
      {/* The same steps as plain text, for reading, printing and screen readers. */}
      <details className="hiw-steps-text">
        <summary>{copy.controls.allSteps}</summary>
        <ol>
          {steps.map((step) => (
            <li key={step.id}>
              <p className="hiw-steps-head">
                <strong>{step.title}</strong>
                <span>
                  {copy.actors[step.from]} → {copy.actors[step.to]}
                </span>
              </p>
              <p>{step.body}</p>
              <p className="hiw-steps-tech">{step.tech}</p>
            </li>
          ))}
        </ol>
      </details>
    </Section>
  );
}
