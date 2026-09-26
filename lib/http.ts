import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ProofError } from "./prover";
import { TokenError } from "./token";

// One place that turns thrown errors into JSON the UI can show. Known errors
// keep their message; anything else is logged and reported generically.
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof TokenError) {
    return NextResponse.json(
      { error: error.message, reason: error.reason },
      { status: error.reason === "expired" ? 410 : 400 },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "The request is missing fields or has bad values" }, { status: 400 });
  }
  if (error instanceof ProofError) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }
  console.error(error);
  return NextResponse.json({ error: "Something went wrong on our side" }, { status: 500 });
}
