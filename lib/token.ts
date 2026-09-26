import "server-only";
import { SignJWT, jwtVerify, errors } from "jose";

// Short-lived signed tokens carry state between the counter, the wallet and
// Mingle, so the server stays stateless on Vercel.
export type TokenKind = "offer" | "request" | "result" | "presentation";

export class TokenError extends Error {
  constructor(
    message: string,
    readonly reason: "expired" | "invalid",
  ) {
    super(message);
  }
}

function secretKey(): Uint8Array {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("TOKEN_SECRET is not set");
    }
    return new TextEncoder().encode("local-dev-only-token-secret");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken<T extends Record<string, unknown>>(
  kind: TokenKind,
  payload: T,
  ttlSeconds: number,
): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const token = await new SignJWT({ ...payload, kind })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secretKey());
  return { token, expiresAt: expiresAt * 1000 };
}

export async function verifyToken<T>(kind: TokenKind, token: string): Promise<T> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (payload.kind !== kind) {
      throw new TokenError(`Expected a ${kind} token`, "invalid");
    }
    return payload as T;
  } catch (error) {
    if (error instanceof TokenError) throw error;
    if (error instanceof errors.JWTExpired) {
      throw new TokenError(`This ${kind} has expired`, "expired");
    }
    throw new TokenError(`This ${kind} is not valid`, "invalid");
  }
}
