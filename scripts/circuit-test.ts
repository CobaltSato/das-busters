import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { after, before, describe, test, type TestContext } from "node:test";
import { groth16, type Groth16Proof } from "snarkjs";
import { TOKYO, type Credential, type CredentialSignature, type Disclosure } from "../lib/credential";
import { ProofError } from "../lib/errors";
import { holderCommitment, nullifierHash, randomField, requestHash, scopeHash } from "../lib/fields";
import { credentialMessage } from "../lib/issuer";
import { MINGLE_VERIFIER, declaredAgeRange } from "../lib/mingle";
import {
  SIGNAL_ORDER,
  signalsToArray,
  type Presentation,
  type PresentationRequest,
  type PublicSignals,
} from "../lib/presentation";
import { verifyProof } from "../lib/prover";
import { buildPublicSignals, circuitInput, type ProveInput } from "../lib/statement";
import { checkAgainstRequest } from "../lib/verifier";

// Runs the committed circuit (public/zk) against certificates signed with a
// throwaway city office key. The issuer key is a public input, so no real
// secret is needed. Each refusal checks which constraint failed, so a case
// cannot pass by breaking for an unrelated reason.
//   npm run test:circuit

// Mingle's verifyProof accepts only the prover the server runs.
process.env.PROVER_MODE = "groth16";

const ROOT = path.resolve(__dirname, "..");
const WASM = path.join(ROOT, "public/zk/single_proof.wasm");
const ZKEY = path.join(ROOT, "public/zk/single_proof.zkey");
const VKEY: unknown = JSON.parse(readFileSync(path.join(ROOT, "lib/zk/verification_key.json"), "utf8"));
const CIRCUIT_LINES = readFileSync(path.join(ROOT, "circuits/single_proof.circom"), "utf8").split("\n");

// The package's ESM build does not load on Node 24 (blakejs has no named
// exports there), so take its CommonJS build. snarkjs's witness calls are
// not in types/snarkjs.d.ts.
const requireCjs = createRequire(__filename);
const eddsa = requireCjs("@zk-kit/eddsa-poseidon") as typeof import("@zk-kit/eddsa-poseidon");
type WitnessFile = { type: "mem"; data?: Uint8Array };
const { wtns } = requireCjs("snarkjs") as {
  wtns: {
    calculate(input: Record<string, string>, wasm: string, out: WitnessFile): Promise<void>;
    exportJson(file: WitnessFile): Promise<bigint[]>;
  };
};

const ISSUER_KEY = randomBytes(32);
const OTHER_KEY = randomBytes(32);
const SECRET = randomField();

const EPOCH = "1";
const NONCE = randomField();
const REQUEST: PresentationRequest = {
  verifier: MINGLE_VERIFIER,
  verifierName: "Mingle",
  nonce: NONCE,
  epoch: EPOCH,
  scopeHash: scopeHash(MINGLE_VERIFIER, EPOCH),
  requestHash: requestHash(NONCE),
  asks: {
    residence: { code: TOKYO, label: "Tokyo" },
    // 30s in 2026: born 1987 to 1996.
    ageRange: declaredAgeRange(36, new Date("2026-09-26T00:00:00Z")),
  },
};

const UNSIGNED: Omit<Credential, "signature"> = {
  id: "circuit-test",
  type: "Single Status Certificate",
  holder: "Test Holder",
  birthDate: "1990-04-12",
  maritalStatus: "Single",
  residenceCode: TOKYO,
  residence: "Tokyo",
  issuer: "Test City Office",
  issuedAt: "2026-09-26",
  statement: "Test certificate",
  holderCommitment: holderCommitment(SECRET),
};

// Signs the message the city office signs (lib/issuer.ts credentialMessage),
// so a drift between issuer and circuit fails the valid cases.
function sign(fields: Omit<Credential, "signature">, key: Buffer = ISSUER_KEY): CredentialSignature {
  const { R8, S } = eddsa.signMessage(key, credentialMessage(fields));
  const [Ax, Ay] = eddsa.derivePublicKey(key);
  return {
    scheme: "eddsa-poseidon",
    R8x: R8[0].toString(),
    R8y: R8[1].toString(),
    S: S.toString(),
    Ax: Ax.toString(),
    Ay: Ay.toString(),
  };
}

const CREDENTIAL: Credential = { ...UNSIGNED, signature: sign(UNSIGNED) };

function proveInput(disclose: Disclosure): ProveInput {
  return { credential: CREDENTIAL, holderSecret: SECRET, request: REQUEST, disclose };
}

// The input both provers hand to the circuit.
function inputFor(disclose: Disclosure): Record<string, string> {
  const input = proveInput(disclose);
  return circuitInput(input, buildPublicSignals(input));
}

const BOTH = { residence: true, ageRange: true };

async function witness(input: Record<string, string>): Promise<bigint[]> {
  const out: WitnessFile = { type: "mem" };
  await wtns.calculate(input, WASM, out);
  return wtns.exportJson(out);
}

// Witness layout: the constant 1, then the public signals in circuit order.
function publicPart(values: bigint[]): string[] {
  return values.slice(1, 1 + SIGNAL_ORDER.length).map(String);
}

async function refusal(t: TestContext, input: Record<string, string>): Promise<string> {
  // The witness calculator prints every failed assertion to stderr.
  t.mock.method(console, "error", () => undefined);
  const error = await witness(input).then(
    () => null,
    (e: unknown) => e,
  );
  assert.ok(error instanceof Error, "the circuit accepted an input it must refuse");
  assert.match(error.message, /Assert Failed/);
  return error.message;
}

// The circuit line the failing assertion sits on, read from the source. If
// this stops matching, circuits/ changed without rebuilding public/zk.
function failedConstraint(message: string): string {
  const match = /SingleProof_\d+ line: (\d+)/.exec(message);
  assert.ok(match, `no SingleProof line in: ${message}`);
  return CIRCUIT_LINES[Number(match[1]) - 1].trim();
}

after(async () => {
  // snarkjs keeps worker threads for the curve; stop them so the run exits.
  const cached = globalThis as { curve_bn128?: { terminate(): Promise<void> } | null };
  await cached.curve_bn128?.terminate();
});

describe("the circuit accepts every choice the wallet offers", () => {
  const choices: Disclosure[] = [
    { residence: false, ageRange: false },
    { residence: true, ageRange: false },
    { residence: false, ageRange: true },
    BOTH,
  ];
  for (const disclose of choices) {
    test(`residence ${disclose.residence ? "shown" : "hidden"}, age ${disclose.ageRange ? "shown" : "hidden"}`, async () => {
      const expected = buildPublicSignals(proveInput(disclose));
      const values = await witness(inputFor(disclose));
      assert.deepEqual(publicPart(values), signalsToArray(expected));
    });
  }
});

describe("the circuit refuses", () => {
  const signatureCases: [string, () => Record<string, string>][] = [
    ["an edited birth year", () => ({ ...inputFor(BOTH), birthYear: "1995" })],
    ["an edited residence", () => ({ ...inputFor(BOTH), residenceCode: "27", expectedResidence: "27" })],
    ["someone else's holder secret", () => ({ ...inputFor(BOTH), holderSecret: randomField() })],
    [
      "an issuer key that did not sign the certificate",
      () => {
        const [Ax, Ay] = eddsa.derivePublicKey(OTHER_KEY);
        return { ...inputFor(BOTH), issuerAx: Ax.toString(), issuerAy: Ay.toString() };
      },
    ],
  ];
  for (const [name, build] of signatureCases) {
    test(`${name} (signature check)`, async (t) => {
      const message = await refusal(t, build());
      assert.match(message, /EdDSAPoseidonVerifier/);
    });
  }

  test("a certificate the city office signed as not single", async (t) => {
    // lib/issuer.ts signs 0 for anything but "Single"; the app never issues one.
    const married = { ...UNSIGNED, maritalStatus: "Married" as Credential["maritalStatus"] };
    const signature = sign(married);
    assert.equal(signature.scheme, "eddsa-poseidon");
    const input = {
      ...inputFor(BOTH),
      isSingle: "0",
      sigR8x: signature.R8x,
      sigR8y: signature.R8y,
      sigS: signature.S,
    };
    const message = await refusal(t, input);
    assert.doesNotMatch(message, /EdDSAPoseidonVerifier/);
    assert.equal(failedConstraint(message), "isSingle === 1;");
  });

  const ruleCases: [string, Record<string, string>, string][] = [
    ["a birth year before the revealed range", { minBirthYear: "1991" }, "revealAge * (1 - notTooOld.out) === 0;"],
    ["a birth year after the revealed range", { maxBirthYear: "1989" }, "revealAge * (1 - notTooYoung.out) === 0;"],
    [
      "a revealed residence that differs from the certificate",
      { expectedResidence: "27" },
      "revealResidence * (residenceCode - expectedResidence) === 0;",
    ],
    [
      "a hidden residence with a nonzero expectedResidence",
      { revealResidence: "0" },
      "(1 - revealResidence) * expectedResidence === 0;",
    ],
    ["a hidden age with nonzero bounds", { revealAge: "0" }, "(1 - revealAge) * minBirthYear === 0;"],
    [
      "a hidden age with only the upper bound set",
      { revealAge: "0", minBirthYear: "0" },
      "(1 - revealAge) * maxBirthYear === 0;",
    ],
    ["a residence reveal flag of 2", { revealResidence: "2" }, "revealResidence * (revealResidence - 1) === 0;"],
    ["an age reveal flag of 2", { revealAge: "2" }, "revealAge * (revealAge - 1) === 0;"],
  ];
  for (const [name, change, constraint] of ruleCases) {
    test(name, async (t) => {
      const message = await refusal(t, { ...inputFor(BOTH), ...change });
      assert.doesNotMatch(message, /EdDSAPoseidonVerifier/);
      assert.equal(failedConstraint(message), constraint);
    });
  }
});

describe("a real proof (one fullProve)", () => {
  const disclose = { residence: true, ageRange: false };
  let expected: PublicSignals;
  let proof: Groth16Proof;
  let publicSignals: string[];

  before(async () => {
    const input = proveInput(disclose);
    expected = buildPublicSignals(input);
    ({ proof, publicSignals } = await groth16.fullProve(circuitInput(input, expected), WASM, ZKEY));
  });

  test("its public signals follow SIGNAL_ORDER", () => {
    assert.equal(publicSignals.length, SIGNAL_ORDER.length);
    assert.deepEqual(publicSignals, signalsToArray(expected));
  });

  test("its nullifier is nullifierHash(holderSecret, scopeHash)", () => {
    assert.equal(publicSignals[SIGNAL_ORDER.indexOf("nullifierHash")], nullifierHash(SECRET, REQUEST.scopeHash));
  });

  test("it verifies with lib/zk/verification_key.json", async () => {
    assert.equal(await groth16.verify(VKEY, publicSignals, proof), true);
  });

  test("it fails verification once a public signal is changed", async () => {
    const otherPlace = signalsToArray({ ...expected, expectedResidence: "27" });
    const freshNullifier = signalsToArray({ ...expected, nullifierHash: nullifierHash(randomField(), REQUEST.scopeHash) });
    assert.equal(await groth16.verify(VKEY, otherPlace, proof), false);
    assert.equal(await groth16.verify(VKEY, freshNullifier, proof), false);
  });

  test("Mingle's verifyProof accepts it, and refuses it relabelled as a mock proof", async () => {
    const presentation: Presentation = { prover: "groth16", publicSignals: expected, proof, provingMs: 0 };
    assert.equal(await verifyProof(presentation), true);
    assert.equal(await verifyProof({ ...presentation, prover: "mock" }), false);
  });

  test("Mingle refuses it because the issuer key is not the trusted city office", () => {
    // The circuit accepts any issuer key; the trust check is Mingle's job.
    assert.throws(
      () => checkAgainstRequest(expected, REQUEST),
      (error: unknown) => error instanceof ProofError && error.code === "untrusted-issuer",
    );
  });
});
