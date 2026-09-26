import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http";
import { COUNTER_RESIDENT, today } from "@/lib/registry";
import { signToken } from "@/lib/token";

// The counter shows a new QR every three minutes, like a number ticket. Once
// scanned, the phone has ten minutes to finish Google sign-in and save.
const QR_REFRESH_SECONDS = 180;
const OFFER_TTL_SECONDS = 600;

export async function POST() {
  try {
    const { token, expiresAt } = await signToken(
      "offer",
      { resident: COUNTER_RESIDENT, issuedAt: today() },
      OFFER_TTL_SECONDS,
    );
    const refreshAt = Math.min(expiresAt, Date.now() + QR_REFRESH_SECONDS * 1000);
    return NextResponse.json({ offer: token, expiresAt: refreshAt });
  } catch (error) {
    return errorResponse(error);
  }
}
