import { holderCommitment, randomField } from "../lib/fields";

// End-to-end check of the API: counter → wallet → Mingle, plus the ways it
// must refuse. Run against a dev server or a deployment:
//   BASE_URL=https://single-proof.vercel.app npm run smoke

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
let failures = 0;

type Json = Record<string, any>;

async function post(path: string, body: unknown): Promise<{ status: number; data: Json }> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = (await res.json().catch(() => ({}))) as Json;
  return { status: res.status, data };
}

function check(name: string, ok: boolean, detail?: string) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures++;
}

async function main() {
  console.log(`smoke against ${BASE}\n`);

  const offer = await post("/api/offer", {});
  check("counter issues an offer", offer.status === 200 && typeof offer.data.offer === "string");

  const secret = randomField();
  const claim = await post("/api/credential", {
    offer: offer.data.offer,
    holderCommitment: holderCommitment(secret),
  });
  const credential = claim.data.credential;
  check("wallet claims a certificate", claim.status === 200 && credential?.maritalStatus === "Single", claim.data.error);

  const epoch = String(Date.now());
  const req = await post("/api/request", { epoch });
  check("mingle creates a request", req.status === 200 && typeof req.data.request === "string");

  const disclose = { residence: true, ageRange: false };
  const proved = await post("/api/prove", { request: req.data.request, credential, holderSecret: secret, disclose });
  const presentation = proved.data.presentation;
  check("wallet proves single status", proved.status === 200 && presentation?.publicSignals?.revealResidence === "1", proved.data.error);
  console.log(`      prover=${presentation?.prover} provingMs=${presentation?.provingMs}`);
  check(
    "hidden age range stays zero",
    presentation?.publicSignals?.minBirthYear === "0" && presentation?.publicSignals?.maxBirthYear === "0",
  );

  const verified = await post("/api/verify", { request: req.data.request, presentation, humanCheck: null });
  check("mingle verifies the proof", verified.status === 200 && verified.data.result?.disclosed?.residence === "Tokyo", verified.data.error);
  check("result is signed for mingle", typeof verified.data.resultToken === "string");

  const chain = verified.data.result?.chain;
  console.log(`      chain=${chain} tx=${verified.data.result?.txHash ?? "-"}`);
  if (chain === "sepolia") {
    // Same holder, same Mingle epoch: the registry must refuse a second account.
    const again = await post("/api/request", { epoch });
    const proof2 = await post("/api/prove", { request: again.data.request, credential, holderSecret: secret, disclose });
    const second = await post("/api/verify", {
      request: again.data.request,
      presentation: proof2.data.presentation,
      humanCheck: null,
    });
    check("one certificate backs one account per epoch", second.status === 422, second.data.error);
  }

  const stranger = await post("/api/prove", { request: req.data.request, credential, holderSecret: randomField(), disclose });
  check("someone else's secret cannot prove", stranger.status === 422, stranger.data.error);

  const edited = await post("/api/prove", {
    request: req.data.request,
    credential: { ...credential, residenceCode: 27 },
    holderSecret: secret,
    disclose,
  });
  check("an edited certificate cannot prove", edited.status === 422, edited.data.error);

  const tampered = { ...presentation, publicSignals: { ...presentation.publicSignals, expectedResidence: "27" } };
  const tamperedRes = await post("/api/verify", { request: req.data.request, presentation: tampered, humanCheck: null });
  check("tampered signals are rejected", tamperedRes.status === 422, tamperedRes.data.error);

  const otherReq = await post("/api/request", { epoch });
  const replay = await post("/api/verify", { request: otherReq.data.request, presentation, humanCheck: null });
  check("a proof cannot be replayed on another request", replay.status === 422, replay.data.error);

  const fakeQr = await post("/api/credential", { offer: "not-a-token", holderCommitment: holderCommitment(secret) });
  check("a fake QR code is rejected", fakeQr.status === 400, fakeQr.data.error);

  console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
