import { TokenError } from "@/lib/token";
import { readOffer } from "@/lib/tokens";
import { Problem } from "../_components/Problem";
import { ReceiveScreen } from "./ReceiveScreen";

type Props = { searchParams: Promise<{ offer?: string | string[] }> };

export default async function ReceivePage({ searchParams }: Props) {
  const { offer } = await searchParams;
  if (typeof offer !== "string" || !offer) {
    return (
      <Problem
        title="Scan the QR code at the counter"
        body="Your certificate is handed over at the city office. Scan the QR code on the counter screen with your phone’s camera."
        action={{ href: "/counter", label: "Open the counter screen" }}
      />
    );
  }
  try {
    return <ReceiveScreen offer={offer} preview={await readOffer(offer)} />;
  } catch (error) {
    if (!(error instanceof TokenError)) throw error;
    return (
      <Problem
        title={error.reason === "expired" ? "This QR code has expired" : "This QR code is not valid"}
        body="Ask the counter to show a new QR code, then scan it again."
        action={{ href: "/counter", label: "Open the counter screen" }}
      />
    );
  }
}
