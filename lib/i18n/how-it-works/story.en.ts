import type { Modes } from "@/lib/modes";
import type { StepCopy, StepId } from "./flow";

// English copy for the first half of /how-it-works: the problem, the idea,
// the basics and the walkthrough. This file defines the shape; story.ja.ts
// must match it. `code` and **bold** are rendered by the page.

const storyEn = {
  meta: {
    title: "How it works",
    description: "How DAS Busters proves single status with a zero-knowledge proof, from the basics to the contracts.",
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
    tech: "Deep dive",
    built: "What we built",
    check: "Check it",
    qa: "Q&A",
  },

  hero: {
    eyebrow: "How it works",
    // Phrases wrap as units, so a line never breaks inside one.
    title: ["Show one line of your certificate.", "Keep the rest sealed."],
    lede: "DAS Busters lets a dating app check that you are single without ever seeing your Single Status Certificate. This page explains how, from the basics to the smart contract, and where you can check each part yourself.",
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
    pitch: [
      "People lie about being single on dating apps. A city office can certify it, but sending a copy of that certificate hands your name, birth date and address to a company you just met.",
      "DAS Busters stores the signed certificate on your phone. When the dating app Mingle asks, Mingle gets a **zero-knowledge proof** instead of the certificate: maths that convinces Mingle the city office signed a certificate saying you are single. For now our server makes that proof; it reads the certificate for that one request and keeps nothing.",
      "A smart contract on Ethereum Sepolia checks the proof again and stores one anonymous number, the **nullifier**, so the same certificate cannot back a second Mingle account. No name or birth date goes on-chain.",
    ],
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
    body: [
      "Dating apps have a trust problem: some members who say they are single are not.",
      "In Japan there is already an answer on paper. The city office that keeps your family register issues a Single Status Certificate (独身証明書), and marriage agencies commonly ask for one when you join.",
      "Sending a copy to an app is the catch. The certificate carries your full name, date of birth and address, and the app needs one fact from it.",
    ],
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
    title: "The idea in one picture",
    lede: "Three parties and one public record. The city office issues the certificate once and your phone stores it. Mingle only ever receives proofs.",
    label: "The certificate goes from the city office to your phone once. Your phone sends Mingle a proof. The proof is recorded on Sepolia, which keeps only the nullifier.",
    roles: {
      issuer: {
        name: "City office",
        role: "Issuer",
        body: "Looks you up in the family register and signs a digital certificate.",
      },
      holder: {
        name: "Your phone",
        role: "Holder · DAS Busters",
        body: "Keeps the certificate. You decide what to prove, and to whom.",
      },
      verifier: {
        name: "Mingle",
        role: "Verifier",
        body: "Asks a question and checks the answer. Never receives the certificate.",
      },
      chain: {
        name: "Ethereum Sepolia",
        role: "Public record",
        body: "A smart contract checks the proof again and remembers one anonymous number.",
      },
    },
    links: {
      certificate: "signed certificate, once",
      proof: "a proof, not the certificate",
      record: "stores the nullifier only",
    },
  },

  basics: {
    title: "Seven ideas, from zero",
    lede: "You don't need to know cryptography to follow the rest of the page. These are the building blocks, each with where it shows up in the app.",
    inApp: "In this app",
    signature: {
      title: "Digital signature",
      analogy: "A stamp that can't be forged or moved to another page.",
      body: "The city office has a private key that only it knows and a public key that anyone can see. Signing a document with the private key gives a signature. Anyone can check the signature with the public key, and changing a single digit of the document breaks it.",
      formula: ["sign(private key, certificate) → signature", "check(public key, certificate, signature) → ✓"],
      inApp: "The city office signs with **EdDSA on the BabyJubJub curve**, a scheme that is cheap to check inside a zero-knowledge proof.",
    },
    hash: {
      title: "Hash",
      analogy: "A fingerprint for data.",
      body: "A hash function turns any input into a fixed-size number. The same input always gives the same number, and you cannot work backwards from the number to the input.",
      formula: ["Poseidon(1) → 1858…9027", "Poseidon(2) → 8645…4349"],
      inApp: "**Poseidon**, a hash designed for ZK circuits. The certificate is hashed before it is signed, and your secret is hashed before the city office sees it.",
    },
    zk: {
      title: "Zero-knowledge proof",
      analogy: "Proving you know the answer without saying it.",
      body: "A zero-knowledge proof lets you convince someone that a statement is true without showing why it is true. Here the statement is: “I hold a certificate signed by the city office, it was issued to me, and it says I am single.” Mingle checks the proof and learns that the statement is true. It learns nothing else.",
      inApp: "A **circom** circuit proved with **Groth16**. The proof is a few hundred bytes and takes milliseconds to check.",
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
      analogy: "A ticket number that is the same every time you visit one shop, and different at every other shop.",
      body: "The nullifier is a hash of your secret and the app's scope. The same person at the same app always gets the same number, so a second account made with the same certificate is caught. A different app gets a different number, so two apps cannot compare notes. The number itself says nothing about who you are.",
      inApp: "`nullifier = Poseidon(holder secret, Mingle's scope)`. The registry contract refuses a nullifier it has already seen.",
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
      body: "A blockchain is a shared record that anyone can read and no single company can rewrite. A smart contract is a program stored on it. It runs exactly as written, in public.",
      formula: ["record(proof) → verifyProof ✓ → used[nullifier] = true"],
      inApp: "Two contracts on **Ethereum Sepolia**, Ethereum's public test network: a Groth16 verifier and **SingleProofRegistry**. A server wallet (the relayer) pays the fees, so you need no crypto.",
    },
    worldId: {
      title: "World ID",
      analogy: "Proof that you are one real person, without saying which one.",
      body: "World ID lets an app check that a unique human is behind an account without learning a name, face or ID number. It targets bots and duplicate accounts, the other half of a dating app's trust problem.",
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
      body: "Privy signs you in with Google and creates an embedded wallet for you: a key pair you never have to manage.",
      formula: ["wallet.sign(“DAS Busters holder key v1 …”) → SHA-256 → holder secret"],
      inApp: "The wallet signs one fixed message. A hash of that signature becomes your **holder secret**, which ties the certificate to your Google account. No transaction is sent and it costs nothing.",
    },
  },

  flow: {
    title: "One run, step by step",
    lede: "What happens in the three-minute demo, message by message. Ken is a fictional resident of Shibuya City. Press Play, or step through at your own pace.",
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
      "In the demo, one Next.js server plays three roles: the city office, the prover and Mingle's backend. In real life these are separate parties with separate keys.",
    steps: {
      offer: {
        arrow: "POST /api/offer",
        title: "The counter gets a pickup ticket",
        body: "The city office screen asks the server for a pickup ticket and shows it as a QR code. A new code appears every three minutes, like a number ticket.",
        tech: "An HS256 JWT of kind “offer” that lives 10 minutes. It carries a resident ID and the issue date.",
        data: "A resident ID and a date. No personal data.",
      },
      scan: {
        arrow: "scan QR",
        title: "Ken scans the QR code",
        body: "The phone opens DAS Busters with the ticket and shows a preview of the certificate: name, date of birth, marital status.",
        tech: "/wallet/receive?offer=… The server checks the ticket before it shows the preview.",
        data: "The ticket, inside the URL.",
      },
      google: {
        arrow: "Continue with Google",
        title: "Ken signs in with Google",
        body: "Privy signs Ken in with Google and gives him an embedded wallet.",
        tech: "Privy OAuth, Google only. The embedded wallet is created on first sign-in.",
        data: "Google sign-in. Nothing about the certificate.",
      },
      secret: {
        arrow: "sign → secret",
        title: "The phone makes Ken's secret",
        body: "The wallet signs a fixed message, and the phone hashes the signature into Ken's holder secret. It stays on the phone except when a proof is made.",
        tech: "holderSecret = the first 31 bytes of SHA-256 of the signature's hex text, so it fits the BN254 field.",
        data: "Nothing leaves the phone.",
      },
      commit: {
        arrow: "Poseidon(secret)",
        title: "The phone asks for the certificate",
        body: "The phone sends the ticket and a fingerprint of the secret. The secret itself stays behind.",
        tech: "POST /api/credential { offer, holderCommitment = Poseidon(holderSecret) }",
        data: "The ticket and one hash.",
      },
      issue: {
        arrow: "signed certificate",
        title: "The city office signs it",
        body: "The server looks Ken up, signs his certificate together with the fingerprint of his secret, and sends it back. The phone saves the certificate and the secret.",
        tech: "EdDSA-Poseidon over Poseidon(isSingle, birthYear, residenceCode, issuedAt, holderCommitment). Saved in the phone's localStorage.",
        data: "The certificate, to the phone only.",
      },
      request: {
        arrow: "POST /api/request",
        title: "Mingle asks for proof",
        body: "Ken opens Mingle and taps Verify with DAS Busters. Mingle gets a signed request that says what it wants to know.",
        tech: "A request JWT (10 minutes) with a random nonce, scopeHash = Poseidon(“mingle”, epoch), requestHash = Poseidon(nonce), and the optional asks: Tokyo and 30s.",
        data: "The question. No personal data.",
      },
      open: {
        arrow: "open DAS Busters",
        title: "Mingle hands over to DAS Busters",
        body: "Mingle opens the DAS Busters share screen with its request and remembers the request's nonce.",
        tech: "/wallet/share?req=… The nonce is saved so Mingle can match the answer later.",
        data: "The request, inside the URL.",
      },
      choose: {
        arrow: "choose",
        title: "Ken chooses what to share",
        body: "Single status is required. Lives in Tokyo and Age range: 30s are optional. Name, birth date and the original certificate are never shared.",
        tech: "Two switches become the flags revealResidence and revealAge.",
        data: "Nothing leaves the phone.",
      },
      prove: {
        arrow: "POST /api/prove",
        title: "The phone asks for a proof",
        body: "The phone sends the certificate and the secret to the prover, for this one request. The prover runs the circuit and keeps nothing.",
        tech: "snarkjs groth16.fullProve with single_proof.wasm and single_proof.zkey, 1–4 s on Vercel. Proving on the phone is the next step.",
        data: "Certificate and secret, to the prover only, for one request.",
      },
      proof: {
        arrow: "proof + 10 signals",
        title: "The proof comes back",
        body: "The prover returns the proof and ten public numbers: the nullifier, the city office's public key, the two share flags, the Tokyo code and birth-year range (0 when not shared), the scope and the request hash.",
        tech: "A Groth16 proof (a, b, c) and publicSignals in a fixed order.",
        data: "The proof and ten public numbers.",
      },
      verify: {
        arrow: "POST /api/verify",
        title: "Mingle's verifier checks it",
        body: "The verifier checks that the proof answers this request, that the city office key is the trusted one, and that the maths holds.",
        tech: "Request JWT, scopeHash and requestHash, the issuer key, the shared values, then groth16.verify off-chain.",
        data: "The proof and public numbers. Never the certificate.",
      },
      record: {
        arrow: "record(proof)",
        title: "The relayer sends it to Sepolia",
        body: "A server wallet sends the proof to the registry contract. It tries the call first, so a refusal shows up as an error instead of a false success.",
        tech: "simulateContract, then writeContract. The server waits up to 45 s for the receipt. A contract refusal is an error; any other failure, such as Sepolia being unreachable, falls back to Mingle's off-chain check, and the result says so.",
        data: "The proof and public numbers, in a public transaction.",
      },
      registry: {
        arrow: "check → store",
        title: "The contract checks it again",
        body: "The contract checks the city office key, that the nullifier is new, and the proof. Then it stores the nullifier and logs an event.",
        tech: "SingleProofRegistry.record → Groth16Verifier.verifyProof → emit SingleStatusVerified(nullifierHash, scopeHash, requestHash).",
        data: "Stored: one nullifier.",
      },
      result: {
        arrow: "signed result",
        title: "The verifier signs the result",
        body: "The server returns a signed result: what was proved, the nullifier and the Sepolia transaction.",
        tech: "A result JWT (24 hours) with the request's nonce, the shared facts, the nullifier and the transaction hash.",
        data: "Yes/no facts, the nullifier, the transaction hash.",
      },
      badge: {
        arrow: "back to Mingle",
        title: "Mingle shows the badge",
        body: "Mingle checks the result's signature and that it answers its own request, then shows “Single status verified”. Its Identity & verification screen links to the transaction on Etherscan.",
        tech: "/mingle?result=… is checked on the server, and its nonce must equal the one Mingle saved.",
        data: "What Mingle keeps: single yes, the facts you chose, the nullifier.",
      },
    } satisfies Record<StepId, StepCopy>,
  },

  architecture: {
    title: "How the pieces fit",
    lede: "Everything you tap runs in one Next.js app on Vercel. Two outside services and two contracts do the rest.",
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
    dataHead: { place: "Where", holds: "Holds", never: "Never holds" },
    dataRows: [
      {
        place: "Your phone",
        holds: "The signed certificate, your holder secret, your share history.",
        never: "—",
      },
      {
        place: "Prover (/api/prove)",
        holds: "Your certificate and secret, for the length of one request. Nothing is saved.",
        never: "Anything after the request ends.",
      },
      {
        place: "Mingle",
        holds: "Single: yes. Tokyo and 30s only if you chose them. The nullifier and the transaction link.",
        never: "Your name, birth date, address or certificate.",
      },
      {
        place: "Ethereum Sepolia",
        holds: "The nullifier. The scope and request hashes in the event. The transaction input shows all ten public numbers, including the Tokyo code and birth-year range only if you shared them.",
        never: "Your name, birth date or certificate.",
      },
    ],
  },
};

export type StoryCopy = typeof storyEn;
export default storyEn;
