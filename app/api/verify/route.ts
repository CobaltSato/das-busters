import { NextResponse } from "next/server";
import { recordOnChain } from "@/lib/chain";
import { errorResponse } from "@/lib/http";
import type { HumanCheck, HumanEnvironment, VerificationResult } from "@/lib/presentation";
import { ProofError } from "@/lib/errors";
import { verifyProof } from "@/lib/prover";
import { VerifyBody } from "@/lib/schemas";
import { signToken, TokenError } from "@/lib/token";
import { readHuman, readRequest } from "@/lib/tokens";
import { checkAgainstRequest } from "@/lib/verifier";

const RESULT_TTL_SECONDS = 24 * 60 * 60;

// Proving is done by now, but recording waits for a Sepolia block.
export const maxDuration = 60;

// Mingle's verifier. It receives only the proof and its public signals, never
// the certificate.
export async function POST(request: Request) {
  try {
    const body = VerifyBody.parse(await request.json());
    const presentationRequest = await readRequest(body.request);
    const disclosed = checkAgainstRequest(body.presentation.publicSignals, presentationRequest);
    if (!(await verifyProof(body.presentation))) {
      throw new ProofError("The proof did not verify", "proof-failed");
    }
    const humanEnvironment = await confirmHuman(body.humanCheck, body.humanToken);
    const onChain = await recordOnChain(body.presentation);
    const result: VerificationResult = {
      nonce: presentationRequest.nonce,
      verifiedAt: new Date().toISOString(),
      disclosed,
      humanCheck: body.humanCheck,
      humanEnvironment,
      nullifierHash: body.presentation.publicSignals.nullifierHash,
      prover: body.presentation.prover,
      chain: onChain.chain,
      txHash: onChain.txHash,
      chainNote: onChain.chainNote,
    };
    const { token } = await signToken("result", result, RESULT_TTL_SECONDS);
    return NextResponse.json({ result, resultToken: token });
  } catch (error) {
    return errorResponse(error);
  }
}

// A World ID check counts only with the token /api/world-id/verify signed.
// The simulated check needs nothing: Mingle labels it as simulated.
async function confirmHuman(check: HumanCheck | null, token: string | undefined): Promise<HumanEnvironment | null> {
  if (check !== "world-id") return null;
  try {
    return (await readHuman(token ?? "")).environment;
  } catch (error) {
    if (!(error instanceof TokenError)) throw error;
    throw new ProofError("The World ID check could not be confirmed. Run it again from DAS Busters.", "world-id-unconfirmed");
  }
}
