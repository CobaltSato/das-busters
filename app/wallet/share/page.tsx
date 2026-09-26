import { getModes } from "@/lib/modes";
import { TokenError } from "@/lib/token";
import { readRequest } from "@/lib/tokens";
import { Problem } from "../_components/Problem";
import { ShareScreen } from "./ShareScreen";

type Props = { searchParams: Promise<{ req?: string | string[] }> };

export default async function SharePage({ searchParams }: Props) {
  const { req } = await searchParams;
  if (typeof req !== "string" || !req) {
    return (
      <Problem
        title="No request to answer"
        body="Open Mingle and choose Verify with DAS Busters to start."
        action={{ href: "/mingle", label: "Open Mingle" }}
      />
    );
  }
  try {
    return <ShareScreen requestToken={req} request={await readRequest(req)} modes={getModes()} />;
  } catch (error) {
    if (!(error instanceof TokenError)) throw error;
    return (
      <Problem
        title={error.reason === "expired" ? "This request has expired" : "This request is not valid"}
        body="Go back to Mingle and start the verification again."
        action={{ href: "/mingle", label: "Back to Mingle" }}
      />
    );
  }
}
