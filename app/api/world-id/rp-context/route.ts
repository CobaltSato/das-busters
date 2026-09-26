import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http";
import { createRpContext, publicConfig, worldIdConfig } from "@/lib/worldid";

export const dynamic = "force-dynamic";

// Signs one World ID request. The signing key never leaves the server.
export function POST() {
  try {
    const config = worldIdConfig();
    if (!config) {
      return NextResponse.json({ error: "World ID is not set up on this server", code: "world-id-off" }, { status: 404 });
    }
    return NextResponse.json({ ...publicConfig(config), rpContext: createRpContext(config) });
  } catch (error) {
    return errorResponse(error);
  }
}
