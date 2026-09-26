import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http";
import { WorldIdResultBody } from "@/lib/schemas";
import { signToken } from "@/lib/token";
import { verifyWithPortal, worldIdConfig } from "@/lib/worldid";

const HUMAN_TTL_SECONDS = 7 * 24 * 60 * 60;

// Checks an IDKit result with the Developer Portal and returns a signed token
// the wallet can later show to Mingle. The World ID nullifier stays inside
// the token; the wallet never needs to read it.
export async function POST(request: Request) {
  try {
    const config = worldIdConfig();
    if (!config) {
      return NextResponse.json({ error: "World ID is not set up on this server", code: "world-id-off" }, { status: 404 });
    }
    const result = WorldIdResultBody.parse(await request.json());
    const human = await verifyWithPortal(config, result);
    const verifiedAt = new Date().toISOString();
    const { token } = await signToken("human", { ...human, verifiedAt }, HUMAN_TTL_SECONDS);
    return NextResponse.json({ environment: human.environment, verifiedAt, token });
  } catch (error) {
    return errorResponse(error);
  }
}
