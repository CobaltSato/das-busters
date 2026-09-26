import { writeFileSync } from "node:fs";
import { derivePublicKey } from "@zk-kit/eddsa-poseidon";

// Prints the issuer's public key for the private key in ISSUER_PRIVATE_KEY
// and writes it to lib/zk/issuer-public.json. The private key itself stays
// in env and is never written to the repo.
const privateKey = process.env.ISSUER_PRIVATE_KEY;
if (!privateKey || !/^[0-9a-f]{64}$/.test(privateKey)) {
  console.error("Set ISSUER_PRIVATE_KEY to 32 bytes of hex");
  process.exit(1);
}
const [Ax, Ay] = derivePublicKey(Buffer.from(privateKey, "hex"));
const publicKey = { Ax: Ax.toString(), Ay: Ay.toString() };
writeFileSync("lib/zk/issuer-public.json", `${JSON.stringify(publicKey, null, 2)}\n`);
console.log(publicKey);
