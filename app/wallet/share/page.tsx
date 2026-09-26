import { getMessages } from "@/lib/i18n/server";
import { getModes, provingLocation } from "@/lib/modes";
import { TokenError } from "@/lib/token";
import { readRequest } from "@/lib/tokens";
import { Problem } from "../_components/Problem";
import { ShareScreen } from "./ShareScreen";

type Props = { searchParams: Promise<{ req?: string | string[] }> };

export default async function SharePage({ searchParams }: Props) {
  const { req } = await searchParams;
  const t = await getMessages();
  const p = t.wallet.problems;
  if (typeof req !== "string" || !req) {
    return (
      <Problem
        title={p.noRequest}
        body={p.noRequestBody}
        action={{ href: "/mingle", label: t.common.openMingle }}
      />
    );
  }
  try {
    return <ShareScreen
        requestToken={req}
        request={await readRequest(req)}
        modes={getModes()}
        proveOn={provingLocation()}
      />;
  } catch (error) {
    if (!(error instanceof TokenError)) throw error;
    return (
      <Problem
        title={error.reason === "expired" ? p.requestExpired : p.requestInvalid}
        body={p.requestRetry}
        action={{ href: "/mingle", label: t.common.backToMingle }}
      />
    );
  }
}
