import "server-only";
import { findResident } from "./registry";
import { TokenError, verifyToken } from "./token";
import type { CredentialPreview } from "./credential";
import type { PresentationRequest, VerificationResult } from "./presentation";

// Readers for each token kind, so pages and routes decode them the same way.

type JwtFields = { kind?: unknown; iat?: unknown; exp?: unknown };

function stripJwtFields<T>(payload: T & JwtFields): T {
  const { kind: _kind, iat: _iat, exp: _exp, ...rest } = payload;
  return rest as T;
}

export async function readOffer(token: string): Promise<CredentialPreview> {
  const claims = await verifyToken<{ resident: string; issuedAt: string }>("offer", token);
  const preview = findResident(claims.resident, claims.issuedAt);
  if (!preview) throw new TokenError("This QR code points to an unknown resident", "invalid");
  return preview;
}

export async function readRequest(token: string): Promise<PresentationRequest> {
  return stripJwtFields(await verifyToken<PresentationRequest & JwtFields>("request", token));
}

export async function readResult(token: string): Promise<VerificationResult> {
  return stripJwtFields(await verifyToken<VerificationResult & JwtFields>("result", token));
}
