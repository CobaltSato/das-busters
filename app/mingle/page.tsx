import { getMessages } from "@/lib/i18n/server";
import { getModes } from "@/lib/modes";
import { TokenError } from "@/lib/token";
import { readResult } from "@/lib/tokens";
import { MingleApp, type Incoming } from "./MingleApp";

type Props = { searchParams: Promise<{ result?: string | string[]; screen?: string | string[] }> };

// A result token comes back from the wallet in the URL. Mingle checks its
// signature here, on the server, before the page trusts it.
export default async function MinglePage({ searchParams }: Props) {
  const { result, screen } = await searchParams;
  let incoming: Incoming = null;
  if (typeof result === "string" && result) {
    try {
      incoming = { result: await readResult(result), token: result };
    } catch (error) {
      if (!(error instanceof TokenError)) throw error;
      incoming = { error: (await getMessages()).mingle.unreadableResult };
    }
  }
  // DAS Busters links straight to the verification screen after saving.
  const initialScreen = screen === "verification" ? "verification" : "profile";
  return <MingleApp incoming={incoming} modes={getModes()} initialScreen={initialScreen} />;
}
