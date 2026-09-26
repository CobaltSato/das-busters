import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http";
import { prove } from "@/lib/prover";
import { ProveBody } from "@/lib/schemas";
import { readRequest } from "@/lib/tokens";

// The wallet's prover. It sees the certificate for the length of one request
// and keeps nothing.
export async function POST(request: Request) {
  try {
    const body = ProveBody.parse(await request.json());
    const presentationRequest = await readRequest(body.request);
    const presentation = await prove({
      credential: body.credential,
      holderSecret: body.holderSecret,
      request: presentationRequest,
      disclose: body.disclose,
    });
    return NextResponse.json({ presentation });
  } catch (error) {
    return errorResponse(error);
  }
}
