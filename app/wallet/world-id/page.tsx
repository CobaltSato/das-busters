import { getModes } from "@/lib/modes";
import { safeReturnPath } from "../_components/returnPath";
import { HumanCheck } from "./HumanCheck";
import { WorldIdCheck } from "./WorldIdCheck";

type Props = { searchParams: Promise<{ return?: string | string[] }> };

// World ID when the server has it set up, otherwise the simulated check.
export default async function HumanCheckPage({ searchParams }: Props) {
  const { return: back } = await searchParams;
  const returnTo = safeReturnPath(back);
  const { worldId } = getModes();
  if (worldId === "simulated") return <HumanCheck returnTo={returnTo} />;
  return <WorldIdCheck returnTo={returnTo} environment={worldId === "idkit" ? "production" : "staging"} />;
}
