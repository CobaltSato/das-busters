import { TokenError } from "@/lib/token";
import { readOffer } from "@/lib/tokens";
import { Problem } from "../_components/Problem";
import { SaveScreen } from "./SaveScreen";

type Props = { searchParams: Promise<{ offer?: string | string[] }> };

export default async function SavePage({ searchParams }: Props) {
  const { offer } = await searchParams;
  if (typeof offer !== "string" || !offer) {
    return (
      <Problem
        title="Nothing to save yet"
        body="Scan the QR code at the counter to receive your certificate first."
        action={{ href: "/counter", label: "Open the counter screen" }}
      />
    );
  }
  try {
    return <SaveScreen offer={offer} preview={await readOffer(offer)} />;
  } catch (error) {
    if (!(error instanceof TokenError)) throw error;
    return (
      <Problem
        title="This QR code has expired"
        body="The pickup QR code is valid for three minutes. Ask the counter for a new one and scan it again."
        action={{ href: "/counter", label: "Open the counter screen" }}
      />
    );
  }
}
