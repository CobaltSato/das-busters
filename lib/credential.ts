// Shape of the Single Status Certificate kept on the phone. Everything the
// circuit needs is a number; the strings are for display only.
export type Credential = {
  id: string;
  type: "Single Status Certificate";
  holder: string;
  birthDate: string; // ISO date
  maritalStatus: "Single";
  residenceCode: number; // JIS prefecture code, 13 = Tokyo
  residence: string;
  issuer: string;
  issuedAt: string; // ISO date
  statement: string;
  holderCommitment: string; // Poseidon(holderSecret), decimal
  signature: CredentialSignature;
};

export type CredentialSignature =
  | { scheme: "mock"; mac: string }
  | { scheme: "eddsa-poseidon"; R8x: string; R8y: string; S: string; Ax: string; Ay: string };

// What the counter can show before the certificate is issued.
export type CredentialPreview = Omit<Credential, "id" | "holderCommitment" | "signature">;

// Optional facts the holder may add on top of "single".
export type Disclosure = {
  residence: boolean;
  ageRange: boolean;
};

export const TOKYO = 13;

export function birthYear(iso: string): number {
  return Number(iso.slice(0, 4));
}

// yyyymmdd as one number, the form the circuit signs and compares.
export function issuedAtNumber(iso: string): number {
  return Number(iso.replaceAll("-", ""));
}
