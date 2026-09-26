import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { derivePublicKey, signMessage, verifySignature } from "@zk-kit/eddsa-poseidon";
import { poseidon5 } from "poseidon-lite/poseidon5";
import { birthYear, issuedAtNumber, type Credential, type CredentialPreview } from "./credential";
import { getModes } from "./modes";
import issuerPublicKey from "./zk/issuer-public.json";

// The city office signs the certificate fields together with the holder's
// commitment. With PROVER_MODE=groth16 it uses EdDSA over Poseidon, which the
// circuit checks; in mock mode an HMAC stands in.

export const ISSUER_PUBLIC_KEY = issuerPublicKey as { Ax: string; Ay: string };

type Unsigned = Omit<Credential, "signature">;

// Must match the message the circuit rebuilds in single_proof.circom.
export function credentialMessage(c: Unsigned): bigint {
  return poseidon5([
    c.maritalStatus === "Single" ? 1n : 0n,
    BigInt(birthYear(c.birthDate)),
    BigInt(c.residenceCode),
    BigInt(issuedAtNumber(c.issuedAt)),
    BigInt(c.holderCommitment),
  ]);
}

function issuerPrivateKey(): Buffer {
  const hex = process.env.ISSUER_PRIVATE_KEY;
  if (!hex || !/^[0-9a-f]{64}$/.test(hex)) throw new Error("ISSUER_PRIVATE_KEY is not set");
  const key = Buffer.from(hex, "hex");
  const [ax, ay] = derivePublicKey(key);
  if (ax.toString() !== ISSUER_PUBLIC_KEY.Ax || ay.toString() !== ISSUER_PUBLIC_KEY.Ay) {
    throw new Error("ISSUER_PRIVATE_KEY does not match lib/zk/issuer-public.json");
  }
  return key;
}

function macKey(): string {
  const secret = process.env.TOKEN_SECRET;
  if (!secret && process.env.NODE_ENV === "production") throw new Error("TOKEN_SECRET is not set");
  return `issuer:${secret ?? "local-dev-only-token-secret"}`;
}

function mac(c: Unsigned): string {
  const fields = [c.id, c.maritalStatus, c.birthDate, c.residenceCode, c.issuedAt, c.holderCommitment];
  return createHmac("sha256", macKey()).update(JSON.stringify(fields)).digest("hex");
}

export function issueCredential(preview: CredentialPreview, holderCommitment: string): Credential {
  const unsigned: Unsigned = { ...preview, id: randomUUID(), holderCommitment };
  if (getModes().prover !== "groth16") {
    return { ...unsigned, signature: { scheme: "mock", mac: mac(unsigned) } };
  }
  const { R8, S } = signMessage(issuerPrivateKey(), credentialMessage(unsigned));
  return {
    ...unsigned,
    signature: {
      scheme: "eddsa-poseidon",
      R8x: R8[0].toString(),
      R8y: R8[1].toString(),
      S: S.toString(),
      Ax: ISSUER_PUBLIC_KEY.Ax,
      Ay: ISSUER_PUBLIC_KEY.Ay,
    },
  };
}

export function hasValidIssuerSignature(credential: Credential): boolean {
  const { signature, ...unsigned } = credential;
  if (signature.scheme === "eddsa-poseidon") {
    return verifySignature(
      credentialMessage(unsigned),
      { R8: [BigInt(signature.R8x), BigInt(signature.R8y)], S: BigInt(signature.S) },
      [BigInt(signature.Ax), BigInt(signature.Ay)],
    );
  }
  const expected = Buffer.from(mac(unsigned), "hex");
  const actual = Buffer.from(signature.mac, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
