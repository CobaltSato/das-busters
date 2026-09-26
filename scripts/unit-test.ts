import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import { TOKYO, type Credential, type Disclosure } from "../lib/credential";
import { ProofError } from "../lib/errors";
import { holderCommitment, nullifierHash, randomField, requestHash, scopeHash } from "../lib/fields";
import { ISSUER_PUBLIC_KEY } from "../lib/issuer";
import { MINGLE_VERIFIER, declaredAgeRange } from "../lib/mingle";
import {
  SIGNAL_ORDER,
  arrayToSignals,
  signalsToArray,
  type PresentationRequest,
  type PublicSignals,
} from "../lib/presentation";
import { buildPublicSignals, circuitInput, type ProveInput } from "../lib/statement";
import { checkAgainstRequest } from "../lib/verifier";
import { verifyWithPortal } from "../lib/worldid";

// The rules the wallet applies before proving (lib/statement.ts) and the
// checks Mingle applies to the public signals after the proof verifies
// (lib/verifier.ts). No circuit here; see scripts/circuit-test.ts.
//   npm run test:unit

// The trusted-issuer check reads the mode on every call; groth16 makes it
// compare against lib/zk/issuer-public.json.
process.env.PROVER_MODE = "groth16";

const SECRET = randomField();

function mingleRequest(nonce = "1111", epoch = "1"): PresentationRequest {
  return {
    verifier: MINGLE_VERIFIER,
    verifierName: "Mingle",
    nonce,
    epoch,
    scopeHash: scopeHash(MINGLE_VERIFIER, epoch),
    requestHash: requestHash(nonce),
    asks: {
      residence: { code: TOKYO, label: "Tokyo" },
      // 30s in 2026: born 1987 to 1996.
      ageRange: declaredAgeRange(36, new Date("2026-09-26T00:00:00Z")),
    },
  };
}

const REQUEST = mingleRequest();

// The rules do not check the signature, so its parts are placeholders; the
// issuer key is the trusted one so Mingle's checks accept the result.
function certificate(changes: Partial<Credential> = {}): Credential {
  return {
    id: "unit-test",
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
    signature: { scheme: "eddsa-poseidon", R8x: "1", R8y: "2", S: "3", ...ISSUER_PUBLIC_KEY },
    ...changes,
  };
}

const BOTH: Disclosure = { residence: true, ageRange: true };
const NEITHER: Disclosure = { residence: false, ageRange: false };

function input(changes: Partial<ProveInput> = {}): ProveInput {
  return { credential: certificate(), holderSecret: SECRET, request: REQUEST, disclose: BOTH, ...changes };
}

function refusedWith(code: string) {
  return (error: unknown) => {
    assert.ok(error instanceof ProofError, `expected a ProofError, got ${String(error)}`);
    assert.equal(error.code, code);
    return true;
  };
}

describe("buildPublicSignals (the wallet's rules)", () => {
  test("fills every signal for a certificate that meets the request", () => {
    const signals = buildPublicSignals(input());
    assert.deepEqual(signals, {
      nullifierHash: nullifierHash(SECRET, REQUEST.scopeHash),
      issuerAx: ISSUER_PUBLIC_KEY.Ax,
      issuerAy: ISSUER_PUBLIC_KEY.Ay,
      revealResidence: "1",
      revealAge: "1",
      expectedResidence: String(TOKYO),
      minBirthYear: "1987",
      maxBirthYear: "1996",
      scopeHash: REQUEST.scopeHash,
      requestHash: REQUEST.requestHash,
    });
  });

  test('hidden values are "0"', () => {
    const signals = buildPublicSignals(input({ disclose: NEITHER }));
    assert.equal(signals.revealResidence, "0");
    assert.equal(signals.revealAge, "0");
    assert.equal(signals.expectedResidence, "0");
    assert.equal(signals.minBirthYear, "0");
    assert.equal(signals.maxBirthYear, "0");
  });

  test("a mock certificate carries issuer key 0, 0", () => {
    const credential = certificate({ signature: { scheme: "mock", mac: "00" } });
    const signals = buildPublicSignals(input({ credential }));
    assert.equal(signals.issuerAx, "0");
    assert.equal(signals.issuerAy, "0");
  });

  test("the same holder gets a new nullifier in a new epoch", () => {
    const first = buildPublicSignals(input());
    const later = buildPublicSignals(input({ request: mingleRequest("1111", "2") }));
    assert.notEqual(first.nullifierHash, later.nullifierHash);
  });

  test("not-your-certificate: someone else's holder secret", () => {
    assert.throws(() => buildPublicSignals(input({ holderSecret: randomField() })), refusedWith("not-your-certificate"));
  });

  test("not-single: a certificate that does not say single", () => {
    const credential = certificate({ maritalStatus: "Married" as Credential["maritalStatus"] });
    assert.throws(() => buildPublicSignals(input({ credential })), refusedWith("not-single"));
  });

  test("not-resident: residence shown but outside the requested prefecture", () => {
    const credential = certificate({ residenceCode: 27, residence: "Osaka" });
    assert.throws(() => buildPublicSignals(input({ credential })), refusedWith("not-resident"));
  });

  test("a residence outside the request is fine while it stays hidden", () => {
    const credential = certificate({ residenceCode: 27, residence: "Osaka" });
    const signals = buildPublicSignals(input({ credential, disclose: { residence: false, ageRange: true } }));
    assert.equal(signals.expectedResidence, "0");
  });

  test("not-in-age-range: birth year just outside either end", () => {
    for (const birthDate of ["1986-12-31", "1997-01-01"]) {
      const credential = certificate({ birthDate });
      assert.throws(() => buildPublicSignals(input({ credential })), refusedWith("not-in-age-range"), birthDate);
    }
  });

  test("both ends of the age range are inside it, as in the circuit", () => {
    for (const birthDate of ["1987-01-01", "1996-12-31"]) {
      assert.doesNotThrow(() => buildPublicSignals(input({ credential: certificate({ birthDate }) })), birthDate);
    }
  });

  test("an age outside the request is fine while it stays hidden", () => {
    const credential = certificate({ birthDate: "1970-01-01" });
    const signals = buildPublicSignals(input({ credential, disclose: { residence: true, ageRange: false } }));
    assert.equal(signals.minBirthYear, "0");
    assert.equal(signals.maxBirthYear, "0");
  });
});

describe("circuitInput", () => {
  test("passes every public signal except the nullifier, which the circuit outputs", () => {
    const expected = buildPublicSignals(input());
    const circuit = circuitInput(input(), expected);
    assert.equal("nullifierHash" in circuit, false);
    for (const name of SIGNAL_ORDER.filter((n) => n !== "nullifierHash")) {
      assert.equal(circuit[name], expected[name], name);
    }
    assert.equal(circuit.birthYear, "1990");
    assert.equal(circuit.issuedAt, "20260926");
    assert.equal(circuit.holderSecret, SECRET);
  });

  test("stale-certificate: a mock-signed certificate cannot go into the circuit", () => {
    const stale = input({ credential: certificate({ signature: { scheme: "mock", mac: "00" } }) });
    assert.throws(() => circuitInput(stale, buildPublicSignals(stale)), refusedWith("stale-certificate"));
  });
});

describe("checkAgainstRequest (Mingle's checks on the public signals)", () => {
  afterEach(() => {
    process.env.PROVER_MODE = "groth16";
  });

  const valid = (disclose: Disclosure = BOTH): PublicSignals => buildPublicSignals(input({ disclose }));

  test("accepts what the wallet builds, and reports only what was shown", () => {
    assert.deepEqual(checkAgainstRequest(valid(BOTH), REQUEST), { single: true, residence: "Tokyo", ageRange: "30s" });
    assert.deepEqual(checkAgainstRequest(valid(NEITHER), REQUEST), { single: true, residence: null, ageRange: null });
  });

  test("wrong-request: a proof made for another epoch or another nonce", () => {
    assert.throws(() => checkAgainstRequest(valid(), mingleRequest("1111", "2")), refusedWith("wrong-request"));
    assert.throws(() => checkAgainstRequest(valid(), mingleRequest("2222")), refusedWith("wrong-request"));
  });

  test("untrusted-issuer: an issuer key that is not the city office's", () => {
    const signals = { ...valid(), issuerAx: String(BigInt(ISSUER_PUBLIC_KEY.Ax) + 1n) };
    assert.throws(() => checkAgainstRequest(signals, REQUEST), refusedWith("untrusted-issuer"));
  });

  test("untrusted-issuer: the mock issuer (0, 0) outside mock mode", () => {
    const signals = { ...valid(), issuerAx: "0", issuerAy: "0" };
    assert.throws(() => checkAgainstRequest(signals, REQUEST), refusedWith("untrusted-issuer"));
  });

  test("in mock mode only the mock issuer is trusted", () => {
    process.env.PROVER_MODE = "mock";
    const mock = { ...valid(), issuerAx: "0", issuerAy: "0" };
    assert.equal(checkAgainstRequest(mock, REQUEST).single, true);
    assert.throws(() => checkAgainstRequest(valid(), REQUEST), refusedWith("untrusted-issuer"));
  });

  test("residence-mismatch: a shown residence other than the one asked for", () => {
    const signals = { ...valid(), expectedResidence: "27" };
    assert.throws(() => checkAgainstRequest(signals, REQUEST), refusedWith("residence-mismatch"));
  });

  test("age-mismatch: a shown range wider than the one asked for", () => {
    const signals = { ...valid(), minBirthYear: "1980" };
    assert.throws(() => checkAgainstRequest(signals, REQUEST), refusedWith("age-mismatch"));
  });

  test("hidden-field: a hidden residence or age that carries a value", () => {
    const cases: Partial<PublicSignals>[] = [
      { revealResidence: "0" },
      { revealAge: "0" },
      { revealAge: "0", minBirthYear: "0" },
    ];
    for (const change of cases) {
      assert.throws(() => checkAgainstRequest({ ...valid(), ...change }, REQUEST), refusedWith("hidden-field"));
    }
  });

  test("bad-flag: a disclosure flag that is not 0 or 1", () => {
    const cases: Partial<PublicSignals>[] = [{ revealResidence: "2" }, { revealAge: "2" }, { revealAge: "true" }];
    for (const change of cases) {
      assert.throws(() => checkAgainstRequest({ ...valid(), ...change }, REQUEST), refusedWith("bad-flag"));
    }
  });
});

describe("public signal order", () => {
  test("signalsToArray and arrayToSignals round-trip in SIGNAL_ORDER", () => {
    const signals = buildPublicSignals(input());
    const values = signalsToArray(signals);
    assert.deepEqual(values, SIGNAL_ORDER.map((name) => signals[name]));
    assert.deepEqual(arrayToSignals(values), signals);
  });

  test("arrayToSignals refuses the wrong number of values", () => {
    assert.throws(() => arrayToSignals(["1", "2"]), /Expected 10 public signals/);
  });
});

describe("World ID", () => {
  const config = {
    appId: "app_test" as const,
    rpId: "rp_test",
    signingKey: "0".repeat(64),
    action: "das-busters-human",
    environment: "staging" as const,
    stagingToken: null,
  };
  const result = (identifier: string) => ({ action: config.action, environment: "staging", responses: [{ identifier }] });

  // Refused before the Developer Portal is asked, so no network is needed.
  test("refuses a credential other than Proof of Human", async () => {
    await assert.rejects(verifyWithPortal(config, result("device")), refusedWith("world-id-credential"));
    await assert.rejects(verifyWithPortal(config, result("selfie")), refusedWith("world-id-credential"));
  });

  // 4.0 sends "proof_of_human"; the Simulator's legacy 3.0 proof sends "orb".
  test("passes Proof of Human on to the Developer Portal", async () => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = async () => Response.json({ success: true, nullifier: "0x2a", environment: "staging" });
    try {
      for (const identifier of ["proof_of_human", "orb"]) {
        assert.deepEqual(await verifyWithPortal(config, result(identifier)), { nullifier: "42", environment: "staging" });
      }
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});
