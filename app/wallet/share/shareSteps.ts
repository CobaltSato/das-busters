import type { ProgressStep } from "@/components/ProgressSteps";
import type { Messages } from "@/lib/i18n/en";
import type { Modes } from "@/lib/modes";

export type Step = "idle" | "proving" | "proving-device" | "proving-server" | "verifying";

type Input = {
  t: Messages;
  step: Step;
  modes: Modes;
  serverProves: boolean;
  provingMs: number | null;
  waited: number;
  verifier: string;
};

const seconds = (ms: number) => (ms / 1000).toFixed(1);

// The two parts of a share, each with what is happening right now: the
// proof (where it is made and how long it took), then the verifier's check
// and, on Sepolia, the wait for the block.
export function shareSteps({ t, step, modes, serverProves, provingMs, waited, verifier }: Input): ProgressStep[] {
  const copy = t.wallet.share.steps;
  const mock = modes.prover === "mock";
  const proving = step !== "verifying";

  let proofDetail: string;
  if (proving) {
    proofDetail = mock
      ? copy.makingMock
      : step === "proving-server"
        ? copy.makingFallback
        : serverProves
          ? copy.makingServer
          : copy.makingHere;
  } else {
    const time = seconds(provingMs ?? 0);
    proofDetail = mock ? copy.madeMock : serverProves ? copy.madeServer(time) : copy.madeHere(time);
  }

  const sepolia = modes.chain === "sepolia";
  return [
    {
      key: "proof",
      label: mock ? copy.proofMock : copy.proof,
      detail: proofDetail,
      state: proving ? "active" : "done",
    },
    {
      key: "check",
      label: sepolia ? copy.record(verifier) : copy.check(verifier),
      detail: proving ? undefined : sepolia ? copy.waitingBlock(waited) : copy.checking,
      state: proving ? "todo" : "active",
    },
  ];
}
