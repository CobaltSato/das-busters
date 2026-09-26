import type { ReactNode } from "react";

export type StepState = "todo" | "active" | "done" | "failed";
export type ProgressStep = { key: string; label: string; detail?: ReactNode; state: StepState };

// A short checklist for work that takes a few seconds, so the screen says
// which part is running instead of showing one spinner for all of it.
export function ProgressSteps({ steps, label }: { steps: ProgressStep[]; label: string }) {
  return (
    <ol className="progress-steps" aria-label={label} aria-live="polite">
      {steps.map((step) => (
        <li key={step.key} className={`is-${step.state}`}>
          <span className="progress-icon" aria-hidden="true">
            {step.state === "active" ? <span className="spinner is-dark" /> : step.state === "done" ? "✓" : step.state === "failed" ? "!" : ""}
          </span>
          <span className="progress-text">
            <strong>{step.label}</strong>
            {step.detail && <small>{step.detail}</small>}
          </span>
        </li>
      ))}
    </ol>
  );
}
