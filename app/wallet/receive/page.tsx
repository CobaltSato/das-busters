import { getMessages } from "@/lib/i18n/server";
import { TokenError } from "@/lib/token";
import { readOffer } from "@/lib/tokens";
import { Problem } from "../_components/Problem";
import { ReceiveScreen } from "./ReceiveScreen";

type Props = { searchParams: Promise<{ offer?: string | string[] }> };

export default async function ReceivePage({ searchParams }: Props) {
  const { offer } = await searchParams;
  const t = await getMessages();
  const p = t.wallet.problems;
  const toCounter = { href: "/counter", label: t.common.openCounter };
  if (typeof offer !== "string" || !offer) {
    return (
      <Problem
        title={p.scanTitle}
        body={p.scanBody}
        action={toCounter}
      />
    );
  }
  try {
    return <ReceiveScreen offer={offer} preview={await readOffer(offer)} />;
  } catch (error) {
    if (!(error instanceof TokenError)) throw error;
    return (
      <Problem
        title={error.reason === "expired" ? p.qrExpired : p.qrInvalid}
        body={p.qrRetry}
        action={toCounter}
      />
    );
  }
}
