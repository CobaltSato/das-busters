import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { Credential, CredentialPreview } from "./credential";

// Phase 1 issuer: an HMAC stands in for the EdDSA-Poseidon signature. The
// shape of the credential already matches what the circuit will read.

function macKey(): string {
  const secret = process.env.TOKEN_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("TOKEN_SECRET is not set");
  }
  return `issuer:${secret ?? "local-dev-only-token-secret"}`;
}

function signedFields(c: Omit<Credential, "signature">): string {
  return JSON.stringify([
    c.id,
    c.maritalStatus,
    c.birthDate,
    c.residenceCode,
    c.issuedAt,
    c.holderCommitment,
  ]);
}

function mac(c: Omit<Credential, "signature">): string {
  return createHmac("sha256", macKey()).update(signedFields(c)).digest("hex");
}

export function issueCredential(preview: CredentialPreview, holderCommitment: string): Credential {
  const unsigned = { ...preview, id: randomUUID(), holderCommitment };
  return { ...unsigned, signature: { scheme: "mock", mac: mac(unsigned) } };
}

export function hasValidIssuerSignature(credential: Credential): boolean {
  if (credential.signature.scheme !== "mock") return false;
  const { signature, ...unsigned } = credential;
  const expected = Buffer.from(mac(unsigned), "hex");
  const actual = Buffer.from(signature.mac, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
