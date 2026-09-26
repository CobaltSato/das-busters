import type { Messages } from "@/lib/i18n";
import type { HumanRecord } from "@/lib/storage";

// How a saved human check is described in the wallet. Only a production
// World ID proof is called verified; staging and simulated say what they are.
export function humanLabel(t: Messages, human: HumanRecord): string {
  if (human.check !== "world-id") return t.wallet.human.simulatedShort;
  return human.environment === "production" ? t.wallet.human.verifiedWorldId : t.wallet.human.verifiedWorldIdStaging;
}
