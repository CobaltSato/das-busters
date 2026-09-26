// Privy is on when its app id is present at build time. Reading the env var
// once keeps hook choices stable between renders.
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";
export const PRIVY_ENABLED = PRIVY_APP_ID.length > 0;

// The holder secret is derived from the embedded wallet's signature over this
// fixed message, so it is tied to the Google account that signed in.
export const HOLDER_KEY_MESSAGE =
  "DAS Busters holder key v1\n\nSigning this creates the private key that binds your certificate to you. It costs nothing and sends nothing.";

export async function secretFromSignature(signature: string): Promise<string> {
  const bytes = new TextEncoder().encode(signature.toLowerCase());
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  // 31 bytes keep the secret below the BN254 field modulus.
  const hex = Array.from(digest.slice(0, 31), (b) => b.toString(16).padStart(2, "0")).join("");
  return BigInt(`0x${hex}`).toString();
}
