import { writeFileSync } from "node:fs";
import { groth16, type Groth16Proof } from "snarkjs";
import { holderCommitment, randomField } from "../lib/fields";
import { signalsToArray, type Presentation } from "../lib/presentation";

// Makes a real proof through the running API and writes it as Solidity
// calldata for the Foundry tests. Needs a dev server with PROVER_MODE=groth16.
//   npm run dev   (in another terminal)
//   npx tsx scripts/fixture.ts

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${path}: ${data.error ?? res.status}`);
  return data as T;
}

async function main() {
  const { offer } = await post<{ offer: string }>("/api/offer", {});
  const secret = randomField();
  const { credential } = await post<{ credential: unknown }>("/api/credential", {
    offer,
    holderCommitment: holderCommitment(secret),
  });
  const { request } = await post<{ request: string }>("/api/request", { epoch: "1" });
  const { presentation } = await post<{ presentation: Presentation }>("/api/prove", {
    request,
    credential,
    holderSecret: secret,
    disclose: { residence: true, ageRange: false },
  });
  if (presentation.prover !== "groth16") throw new Error("The server is not running the Groth16 prover");

  // exportSolidityCallData swaps the G2 coordinates the way the verifier
  // expects; building the arrays by hand is the usual source of "false".
  const pub = signalsToArray(presentation.publicSignals);
  const raw = await groth16.exportSolidityCallData(presentation.proof as Groth16Proof, pub);
  const [a, b, c, signals] = JSON.parse(`[${raw}]`) as [string[], string[][], string[], string[]];
  const toDec = (v: string) => BigInt(v).toString();
  const fixture = {
    a: a.map(toDec),
    b: b.map((row) => row.map(toDec)),
    c: c.map(toDec),
    publicSignals: signals.map(toDec),
  };
  writeFileSync("contracts/test/fixtures/proof.json", `${JSON.stringify(fixture, null, 2)}\n`);
  console.log("wrote contracts/test/fixtures/proof.json");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
