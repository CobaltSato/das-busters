import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http";
import { issueCredential } from "@/lib/issuer";
import { OfferClaimBody } from "@/lib/schemas";
import { readOffer } from "@/lib/tokens";

// The phone sends only a commitment to its secret. The city office signs the
// certificate together with that commitment, so only this phone can prove
// with it.
export async function POST(request: Request) {
  try {
    const body = OfferClaimBody.parse(await request.json());
    const preview = await readOffer(body.offer);
    return NextResponse.json({ credential: issueCredential(preview, body.holderCommitment) });
  } catch (error) {
    return errorResponse(error);
  }
}
