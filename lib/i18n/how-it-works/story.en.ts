import type { Modes } from "@/lib/modes";
import type { StepCopy, StepId } from "./flow";

// English copy for the first half of /how-it-works: the problem, the idea,
// the basics and the walkthrough. This file defines the shape; story.ja.ts
// must match it. `code` and **bold** are rendered by the page. Text that
// only the Engineer view shows is marked in the components, not here.

const storyEn = {
  meta: {
    title: "How it works",
    description: "How DAS Busters proves single status with a zero-knowledge proof, in pictures, from the basics to the contracts.",
  },
  hubLink: "New here? See how it works",
  nav: {
    home: "DAS Busters",
    label: "On this page",
    why: "Why",
    idea: "The idea",
    basics: "Basics",
    flow: "Step by step",
    architecture: "Architecture",
    tech: "Under the hood",
    built: "What we built",
    check: "Check it",
    qa: "Q&A",
  },
  level: {
    label: "Detail",
    plain: "Plain",
    tech: "Engineer",
    hint: "Engineer view adds routes, formulas, the circuit and the contract checks.",
  },

  hero: {
    eyebrow: "How it works",
    // Phrases wrap as units, so a line never breaks inside one.
    title: ["Show one line of your certificate.", "Keep the rest sealed."],
    lede: "A dating app checks that you are single without ever seeing your Single Status Certificate.",
    envelope: {
      label: "A certificate sliding into a window envelope. Only the marital status line shows through the window.",
      heading: "Single Status Certificate",
      fields: [
        { label: "Full name", value: "Ken Sato" },
        { label: "Date of birth", value: "18 April 1990" },
        { label: "Residence", value: "Tokyo" },
        { label: "Marital status", value: "Single" },
      ],
      issuer: "Shibuya City",
      seal: "Signed",
      confidential: "Confidential",
      window: "Mingle sees only this",
    },
    pitchTitle: "The 30-second version",
    pitch: {
      problem: {
        title: "The problem",
        body: "People lie about being single. The city office can certify it, but a copy of the certificate hands over your name, birth date and address too.",
      },
      proof: {
        title: "The trick",
        body: "Your phone keeps the signed certificate. Mingle gets a zero-knowledge proof: maths that says “the city office signed that I'm single”, and nothing else.",
      },
      record: {
        title: "The record",
        body: "A smart contract on Ethereum Sepolia checks the proof again and stores one anonymous number, so the same certificate can't back a second account.",
      },
    },
    pitchNote: "Today our server makes the proof for each request and keeps nothing. Proving on the phone is the next step.",
    statusTitle: "Running in this deployment",
    notice: {
      mockProver:
        "This deployment uses the mock prover: the server checks the same rules but makes no zero-knowledge proof. The Groth16 parts below describe the real prover.",
      offChain:
        "This deployment checks proofs off-chain only, so the Sepolia steps below do not run here.",
    },
  },

  why: {
    title: "Why this exists",
    caption: "Send a copy, and Mingle gets every field. Send a proof, and Mingle gets one checked fact.",
    fact: "The paper version already exists in Japan. City offices issue a Single Status Certificate (独身証明書), and marriage agencies ask for it.",
    diagram: {
      label: "Two ways to prove single status. Sending a copy gives Mingle every field. DAS Busters gives Mingle one checked fact.",
      copyLane: "Send a copy",
      zkLane: "Use DAS Busters",
      certificate: "Certificate",
      mingleSees: "Mingle sees",
      fields: ["Name", "Birth date", "Address", "Single"],
      proof: "Proof",
      single: "Single ✓",
      hidden: "hidden",
    },
  },

  idea: {
    title: "Four parties, one picture",
    lede: "The city office issues once. Your phone holds. Mingle asks. Sepolia remembers one number.",
    label: "The certificate goes from the city office to your phone once. Your phone sends Mingle a proof. The proof is recorded on Sepolia, which keeps only the nullifier.",
    roles: {
      issuer: { name: "City office", role: "Issuer", body: "Signs your digital certificate." },
      holder: { name: "Your phone", role: "Holder · DAS Busters", body: "Keeps it. You choose what to prove." },
      verifier: { name: "Mingle", role: "Verifier", body: "Checks the proof. Never sees the certificate." },
      chain: { name: "Ethereum Sepolia", role: "Public record", body: "Checks again. Stores one anonymous number." },
    },
    links: {
      certificate: "signed certificate, once",
      proof: "a proof, not the certificate",
      record: "stores the nullifier only",
    },
  },

  basics: {
    title: "Seven ideas, from zero",
    lede: "No cryptography needed. One picture each, and where it shows up in the app.",
    inApp: "In this app",
    signature: {
      title: "Digital signature",
      analogy: "A stamp that can't be forged or moved to another page.",
      body: "The city office signs with a key only it holds. Anyone can check the stamp, and changing one digit breaks it.",
      art: { doc: "Certificate", stamp: "Signed", edited: "1 digit changed", ok: "valid", broken: "broken" },
      formula: ["sign(private key, certificate) → signature", "check(public key, certificate, signature) → ✓"],
      inApp: "The city office signs with **EdDSA** on the BabyJubJub curve, which is cheap to check inside a proof.",
    },
    hash: {
      title: "Hash",
      analogy: "A fingerprint for data.",
      body: "Any input becomes one fixed-size number. Same input, same number, and no way back.",
      art: { input: "Certificate", machine: "Poseidon", output: "1858…9027" },
      formula: ["Poseidon(1) → 1858…9027", "Poseidon(2) → 8645…4349"],
      inApp: "**Poseidon**, a hash made for ZK circuits. Your secret is hashed before the city office sees it.",
    },
    zk: {
      title: "Zero-knowledge proof",
      analogy: "Proving you know the answer without saying it.",
      body: "Mingle learns that one statement is true: “the city office signed a certificate saying I'm single.” Nothing else.",
      inApp: "A **circom** circuit proved with **Groth16**. A few hundred bytes, checked in milliseconds.",
      diagram: {
        label: "The certificate, the signature and your secret go into the circuit and stay there. Out come a yes and a nullifier.",
        private: "Private: stays inside",
        public: "Public: Mingle sees",
        inputs: ["Certificate", "Signature", "Your secret"],
        circuit: "Circuit",
        checks: "9,921 checks",
        outputs: ["Single ✓", "Nullifier"],
      },
    },
    nullifier: {
      title: "Nullifier",
      analogy: "A ticket number: the same every time at one shop, different at every other shop.",
      body: "A hash of your secret and the app's name. A second Mingle account gives the same number and is refused. Another app gets a different number, so apps can't compare notes.",
      inApp: "`nullifier = Poseidon(holder secret, Mingle's scope)`. The registry refuses a number it has seen.",
      diagram: {
        label: "The same secret at Mingle gives the same nullifier twice, so the second account is refused. At another app it gives a different number.",
        secret: "Your secret",
        rows: [
          { app: "Mingle", account: "1st account", result: "Accepted" },
          { app: "Mingle", account: "2nd account", result: "Refused: already used" },
          { app: "Other app", account: "Any account", result: "Different number" },
        ],
      },
    },
    chain: {
      title: "Blockchain and smart contract",
      analogy: "A public notebook nobody can erase, with rules that run themselves.",
      body: "Anyone can read it, no company can rewrite it, and the contract runs exactly as written.",
      art: { block: "nullifier", yours: "yours", read: "anyone can read", erase: "nobody can erase" },
      formula: ["record(proof) → verifyProof ✓ → used[nullifier] = true"],
      inApp: "Two contracts on **Ethereum Sepolia**, a public test network. A server wallet pays the fees, so you need no crypto.",
    },
    worldId: {
      title: "World ID",
      analogy: "Proof that you are one real person, without saying which one.",
      body: "Catches bots and duplicate accounts, the other half of a dating app's trust problem.",
      art: { accounts: "3 accounts", human: "1 human ✓", noName: "no name, no face" },
      inApp: "An optional human check you can add to what you share.",
      status: {
        simulated:
          "In this deployment the human check is **simulated**: the camera opens for five seconds and no World ID proof is made. The app labels it “simulated” wherever it appears.",
        "idkit-staging":
          "In this deployment the human check runs on **World ID staging**: a real IDKit request that World's Developer Portal checks, approved in the World ID Simulator with a test identity rather than a real person. The app labels it “staging”.",
        idkit:
          "In this deployment the human check uses **World ID**. World's Developer Portal checks each proof, and DAS Busters receives a yes plus an anonymous code that works only for this app.",
      } satisfies Record<Modes["worldId"], string>,
    },
    privy: {
      title: "Sign in with Google (Privy)",
      analogy: "Your Google account quietly gets a wallet.",
      body: "The wallet signs one fixed message. A hash of that signature is your holder secret, which ties the certificate to you.",
      art: { google: "Google", wallet: "Wallet", sign: "signs once", secret: "Holder secret" },
      formula: ["wallet.sign(“DAS Busters holder key v1 …”) → SHA-256 → holder secret"],
      inApp: "No transaction is sent and it costs nothing.",
    },
  },

  flow: {
    title: "One run, step by step",
    lede: "The three-minute demo, one message at a time. Ken is a fictional resident of Shibuya.",
    label: "Step-by-step walkthrough",
    actors: {
      counter: "Counter",
      phone: "Phone",
      google: "Google",
      server: "Server",
      mingle: "Mingle",
      chain: "Sepolia",
    },
    phases: {
      issue: "Get the certificate",
      ask: "Mingle asks",
      prove: "Make the proof",
      verify: "Check and record",
    },
    controls: {
      previous: "Previous step",
      next: "Next step",
      play: "Play",
      pause: "Pause",
      restart: "Start again",
      step: "Step {n} of {total}",
      goTo: "Go to step {n}: {title}",
      tech: "Under the hood",
      data: "What moves",
      allSteps: "Read all 16 steps as text",
    },
    serverNote:
      "In the demo one server plays the city office, the prover and Mingle's backend. In real life they are separate parties with separate keys.",
    steps: {
      offer: {
        arrow: "POST /api/offer",
        title: "The counter gets a pickup ticket",
        body: "The city office screen shows a QR pickup ticket that changes every three minutes.",
        tech: "An HS256 JWT of kind “offer” that lives 10 minutes. It carries a resident ID and the issue date.",
        data: "A resident ID and a date. No personal data.",
      },
      scan: {
        arrow: "scan QR",
        title: "Ken scans the QR code",
        body: "DAS Busters opens on the phone with a preview of his certificate.",
        tech: "/wallet/receive?offer=… The server checks the ticket before it shows the preview.",
        data: "The ticket, inside the URL.",
      },
      google: {
        arrow: "Continue with Google",
        title: "Ken signs in with Google",
        body: "Privy signs him in and gives him an embedded wallet.",
        tech: "Privy OAuth, Google only. The embedded wallet is created on first sign-in.",
        data: "Google sign-in. Nothing about the certificate.",
      },
      secret: {
        arrow: "sign → secret",
        title: "The phone makes Ken's secret",
        body: "The wallet signs a fixed message. Its hash becomes Ken's secret, which stays on the phone.",
        tech: "holderSecret = the first 31 bytes of SHA-256 of the signature's hex text, so it fits the BN254 field.",
        data: "Nothing leaves the phone.",
      },
      commit: {
        arrow: "Poseidon(secret)",
        title: "The phone asks for the certificate",
        body: "It sends the ticket and a fingerprint of the secret. Not the secret.",
        tech: "POST /api/credential { offer, holderCommitment = Poseidon(holderSecret) }",
        data: "The ticket and one hash.",
      },
      issue: {
        arrow: "signed certificate",
        title: "The city office signs it",
        body: "The server signs Ken's certificate together with that fingerprint. The phone saves it.",
        tech: "EdDSA-Poseidon over Poseidon(isSingle, birthYear, residenceCode, issuedAt, holderCommitment). Saved in the phone's localStorage.",
        data: "The certificate, to the phone only.",
      },
      request: {
        arrow: "POST /api/request",
        title: "Mingle asks for proof",
        body: "Ken taps Verify with DAS Busters. Mingle writes its question into a signed request.",
        tech: "A request JWT (10 minutes) with a random nonce, scopeHash = Poseidon(“mingle”, epoch), requestHash = Poseidon(nonce), and the optional asks: Tokyo and 30s.",
        data: "The question. No personal data.",
      },
      open: {
        arrow: "open DAS Busters",
        title: "Mingle hands over to DAS Busters",
        body: "Mingle opens the share screen with that request and remembers its number.",
        tech: "/wallet/share?req=… The nonce is saved so Mingle can match the answer later.",
        data: "The request, inside the URL.",
      },
      choose: {
        arrow: "choose",
        title: "Ken chooses what to share",
        body: "Single is required. Tokyo and 30s are optional. Name and birth date are never on offer.",
        tech: "Two switches become the flags revealResidence and revealAge.",
        data: "Nothing leaves the phone.",
      },
      prove: {
        arrow: "POST /api/prove",
        title: "The phone asks for a proof",
        body: "It sends the certificate and secret to the prover for this one request. The prover keeps nothing.",
        tech: "snarkjs groth16.fullProve with single_proof.wasm and single_proof.zkey, 1–4 s on Vercel. Proving on the phone is the next step.",
        data: "Certificate and secret, to the prover only, for one request.",
      },
      proof: {
        arrow: "proof + 10 signals",
        title: "The proof comes back",
        body: "Back come the proof and ten public numbers, including the nullifier.",
        tech: "A Groth16 proof (a, b, c) and publicSignals in a fixed order: nullifier, issuer key, two share flags, Tokyo code and birth-year range (0 when hidden), scope and request hash.",
        data: "The proof and ten public numbers.",
      },
      verify: {
        arrow: "POST /api/verify",
        title: "Mingle's verifier checks it",
        body: "It checks that the proof answers this request, that the city office key is trusted, and that the maths holds.",
        tech: "Request JWT, scopeHash and requestHash, the issuer key, the shared values, then groth16.verify off-chain.",
        data: "The proof and public numbers. Never the certificate.",
      },
      record: {
        arrow: "record(proof)",
        title: "The relayer sends it to Sepolia",
        body: "A server wallet sends the proof to the registry. A refusal shows as an error, not a false success.",
        tech: "simulateContract, then writeContract. The server waits up to 45 s for the receipt. A contract refusal is an error; any other failure, such as Sepolia being unreachable, falls back to Mingle's off-chain check, and the result says so.",
        data: "The proof and public numbers, in a public transaction.",
      },
      registry: {
        arrow: "check → store",
        title: "The contract checks it again",
        body: "It checks the city office key, that the nullifier is new, and the proof. Then it stores the nullifier.",
        tech: "SingleProofRegistry.record → Groth16Verifier.verifyProof → emit SingleStatusVerified(nullifierHash, scopeHash, requestHash).",
        data: "Stored: one nullifier.",
      },
      result: {
        arrow: "signed result",
        title: "The verifier signs the result",
        body: "The server returns a signed result: what was proved, the nullifier and the transaction.",
        tech: "A result JWT (24 hours) with the request's nonce, the shared facts, the nullifier and the transaction hash.",
        data: "Yes/no facts, the nullifier, the transaction hash.",
      },
      badge: {
        arrow: "back to Mingle",
        title: "Mingle shows the badge",
        body: "Mingle checks the result answers its own request and shows “Single status verified”.",
        tech: "/mingle?result=… is checked on the server, and its nonce must equal the one Mingle saved. Identity & verification links to the transaction on Etherscan.",
        data: "What Mingle keeps: single yes, the facts you chose, the nullifier.",
      },
    } satisfies Record<StepId, StepCopy>,
  },

  architecture: {
    title: "How the pieces fit",
    lede: "One Next.js app on Vercel, two outside services, two contracts.",
    browser: {
      title: "In the browser",
      counter: "Issuing counter",
      wallet: "DAS Busters",
      mingle: "Mingle",
      storage: "Phone storage: certificate and holder secret",
    },
    server: {
      title: "On the server (Next.js on Vercel)",
      issuer: { name: "City office", routes: "/api/offer · /api/credential", key: "issuer signing key" },
      prover: { name: "Prover", routes: "/api/prove", key: "circuit files (wasm, zkey)" },
      verifier: { name: "Mingle's backend", routes: "/api/request · /api/verify · /api/tx", key: "relayer wallet" },
      worldId: { name: "Human check", routes: "/api/world-id/*", key: "World ID signing key" },
    },
    outside: {
      title: "Outside",
      privy: { name: "Privy + Google", note: "sign-in and embedded wallet" },
      chain: { name: "Ethereum Sepolia", note: "SingleProofRegistry → Groth16Verifier" },
      worldId: { name: "World ID", note: "Developer Portal" },
    },
    worldIdStatus: {
      simulated: "simulated here",
      "idkit-staging": "staging",
      idkit: "live",
    } satisfies Record<Modes["worldId"], string>,
    dataTitle: "Where your data lives",
    dataLede: "Green: held. Crossed out: never held.",
    dataLegend: { holds: "Holds", never: "Never" },
    places: [
      {
        place: "Your phone",
        note: "",
        holds: ["Certificate", "Holder secret", "Share history"],
        never: [],
      },
      {
        place: "Prover",
        note: "For one request only. Nothing is saved.",
        holds: ["Certificate", "Holder secret"],
        never: ["Anything after the request"],
      },
      {
        place: "Mingle",
        note: "Tokyo and 30s only if you chose them.",
        holds: ["Single ✓", "Tokyo", "30s", "Nullifier", "Transaction link"],
        never: ["Name", "Birth date", "Address", "Certificate"],
      },
      {
        place: "Ethereum Sepolia",
        note: "The transaction input shows all ten public numbers, so Tokyo and the birth-year range appear only if you shared them.",
        holds: ["Nullifier", "Scope hash", "Request hash"],
        never: ["Name", "Birth date", "Certificate"],
      },
    ],
  },
};

export type StoryCopy = typeof storyEn;
export default storyEn;
