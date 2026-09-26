import { getModes } from "@/lib/modes";
import { WalletHome } from "./WalletHome";

export default function WalletPage() {
  return <WalletHome worldId={getModes().worldId} />;
}
