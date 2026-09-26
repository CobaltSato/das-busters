import { NextResponse } from "next/server";
import { randomField, requestHash, scopeHash } from "@/lib/fields";
import { errorResponse } from "@/lib/http";
import { MINGLE_PROFILE, MINGLE_VERIFIER, declaredAgeRange } from "@/lib/mingle";
import type { PresentationRequest } from "@/lib/presentation";
import { RequestBody } from "@/lib/schemas";
import { signToken } from "@/lib/token";

const REQUEST_TTL_SECONDS = 10 * 60;

// Mingle asks for proof of single status, and offers to verify the city and
// age range the member already put on their profile.
export async function POST(request: Request) {
  try {
    const { epoch } = RequestBody.parse(await request.json());
    const nonce = randomField();
    const presentationRequest: PresentationRequest = {
      verifier: MINGLE_VERIFIER,
      verifierName: "Mingle",
      nonce,
      epoch,
      scopeHash: scopeHash(MINGLE_VERIFIER, epoch),
      requestHash: requestHash(nonce),
      asks: {
        residence: { code: MINGLE_PROFILE.cityCode, label: MINGLE_PROFILE.city },
        ageRange: declaredAgeRange(MINGLE_PROFILE.age),
      },
    };
    const { token } = await signToken("request", presentationRequest, REQUEST_TTL_SECONDS);
    return NextResponse.json({ request: token, nonce });
  } catch (error) {
    return errorResponse(error);
  }
}
