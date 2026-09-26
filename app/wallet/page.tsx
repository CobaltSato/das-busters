import { getModes } from "@/lib/modes";
import { WalletHome } from "./WalletHome";

export default function WalletPage() {
  const { worldId, prover } = getModes();
  return <WalletHome worldId={worldId} prover={prover} />;
}
