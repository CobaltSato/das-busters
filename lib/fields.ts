import { poseidon1 } from "poseidon-lite/poseidon1";
import { poseidon2 } from "poseidon-lite/poseidon2";

// Field helpers shared by the browser and the server. Every value that goes
// into the circuit is a BN254 field element written as a decimal string.

// 31 random bytes stay below the BN254 modulus, so no two secrets can alias.
export function randomField(): string {
  const bytes = new Uint8Array(31);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return BigInt(`0x${hex}`).toString();
}

export function holderCommitment(holderSecret: string): string {
  return poseidon1([BigInt(holderSecret)]).toString();
}

export function textToField(text: string): bigint {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > 31) throw new Error("Text is too long for one field element");
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return BigInt(`0x${hex || "00"}`);
}

// One scope per verifier and epoch. The nullifier depends on it, so the same
// holder gets the same nullifier at Mingle until the epoch changes.
export function scopeHash(verifier: string, epoch: string): string {
  return poseidon2([textToField(verifier), BigInt(epoch)]).toString();
}

// Binds a proof to one request so it cannot be replayed against another.
export function requestHash(nonce: string): string {
  return poseidon1([BigInt(nonce)]).toString();
}

export function nullifierHash(holderSecret: string, scope: string): string {
  return poseidon2([BigInt(holderSecret), BigInt(scope)]).toString();
}
