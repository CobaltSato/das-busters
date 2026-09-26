import { getMessages } from "@/lib/i18n/server";
import { TokenError } from "@/lib/token";
import { readOffer } from "@/lib/tokens";
import { Problem } from "../_components/Problem";
import { SaveScreen } from "./SaveScreen";

type Props = { searchParams: Promise<{ offer?: string | string[] }> };

export default async function SavePage({ searchParams }: Props) {
  const { offer } = await searchParams;
  const t = await getMessages();
  const p = t.wallet.problems;
  const toCounter = { href: "/counter", label: t.common.openCounter };
  if (typeof offer !== "string" || !offer) {
    return (
      <Problem
        title={p.nothingToSave}
        body={p.nothingToSaveBody}
        action={toCounter}
      />
    );
  }
  try {
    return <SaveScreen offer={offer} preview={await readOffer(offer)} />;
  } catch (error) {
    if (!(error instanceof TokenError)) throw error;
    return (
      <Problem
        title={p.qrExpired}
        body={p.qrExpiredBody}
        action={toCounter}
      />
    );
  }
}
