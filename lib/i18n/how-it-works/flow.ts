// Language-independent shape of the step-by-step walkthrough on
// /how-it-works. The copy files key their text by these ids, so a step added
// here without English and Japanese text fails the type check.

export const ACTORS = ["counter", "phone", "google", "server", "mingle", "chain"] as const;
export type ActorId = (typeof ACTORS)[number];

export const PHASES = ["issue", "ask", "prove", "verify"] as const;
export type PhaseId = (typeof PHASES)[number];

type StepShape = { id: string; phase: PhaseId; from: ActorId; to: ActorId };

// Mirrors the sequence diagram in README.md and the API routes it names.
export const STEPS = [
  { id: "offer", phase: "issue", from: "counter", to: "server" },
  { id: "scan", phase: "issue", from: "counter", to: "phone" },
  { id: "google", phase: "issue", from: "phone", to: "google" },
  { id: "secret", phase: "issue", from: "phone", to: "phone" },
  { id: "commit", phase: "issue", from: "phone", to: "server" },
  { id: "issue", phase: "issue", from: "server", to: "phone" },
  { id: "request", phase: "ask", from: "mingle", to: "server" },
  { id: "open", phase: "ask", from: "mingle", to: "phone" },
  { id: "choose", phase: "ask", from: "phone", to: "phone" },
  { id: "prove", phase: "prove", from: "phone", to: "server" },
  { id: "proof", phase: "prove", from: "server", to: "phone" },
  { id: "verify", phase: "verify", from: "phone", to: "server" },
  { id: "record", phase: "verify", from: "server", to: "chain" },
  { id: "registry", phase: "verify", from: "chain", to: "chain" },
  { id: "result", phase: "verify", from: "server", to: "phone" },
  { id: "badge", phase: "verify", from: "phone", to: "mingle" },
] as const satisfies readonly StepShape[];

export type StepId = (typeof STEPS)[number]["id"];

export type StepCopy = {
  arrow: string;
  title: string;
  body: string;
  tech: string;
  data: string;
};
