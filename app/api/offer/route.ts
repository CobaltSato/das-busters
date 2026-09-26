import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http";
import { COUNTER_RESIDENT, today } from "@/lib/registry";
import { signToken } from "@/lib/token";

// The counter QR is valid for three minutes, like a paper number ticket.
const OFFER_TTL_SECONDS = 180;

export async function POST() {
  try {
    const { token, expiresAt } = await signToken(
      "offer",
      { resident: COUNTER_RESIDENT, issuedAt: today() },
      OFFER_TTL_SECONDS,
    );
    return NextResponse.json({ offer: token, expiresAt });
  } catch (error) {
    return errorResponse(error);
  }
}
