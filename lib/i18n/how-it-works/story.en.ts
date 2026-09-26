import type { Modes } from "@/lib/modes";
import type { StepCopy, StepId } from "./flow";

// English copy for the first half of /how-it-works (the problem, the idea,
// the walkthrough and the architecture) and for the seven terms on
// /how-it-works/basics. This file defines the shape; story.ja.ts
// must match it. `code`, **bold** and {{Engineer-only text}} are rendered
// by the page (see _components/Rich.tsx). Other Engineer-only text is
// marked in the components, not here.

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
    flow: "Step by step",
    architecture: "Architecture",
    tech: "Under the hood",
    built: "What we built",
    check: "Check it",
    qa: "FAQ",
  },
  level: {
    label: "Detail",
    plain: "Plain",
    tech: "Engineer",
    hint: "Engineer view adds routes, formulas, the circuit and the contract checks.",
  },

  hero: {
    // Phrases wrap as units, so a line never breaks inside one.
    title: ["Show one line of your certificate.", "Keep the rest sealed."],
    lede: "DAS stands for Dating App Scam. A dating app checks that you are single without ever seeing your Single Status Certificate.",
    envelope: {
      label: "A certificate sliding into a window envelope. Only the marital status line shows through the window.",
      heading: "Single Status Certificate",
      fields: [
        { label: "Full name", value: "Ken Sato" },
        { label: "Date of birth", value: "18 April 1990" },
        { label: "Registered domicile", value: "Shibuya, Tokyo" },
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
        title: "A copy shows everything",
        body: "People lie about being single. The city office can certify it, but a copy of the certificate also hands over your name, birth date and registered domicile.",
      },
      proof: {
        title: "A proof shows one line",
        body: "Your phone keeps the signed certificate and makes a zero-knowledge proof of one statement: “the city office signed that I'm single”. Mingle gets only the proof.",
      },
      record: {
        title: "The chain keeps one number",
        body: "A contract on Sepolia checks the proof again and stores one anonymous number, so the same certificate can't back a second Mingle account.",
      },
    },
    pitchNote: "The proof is made on your phone. If a phone can't finish, our server makes that one proof, keeps nothing, and the screen says so.",
    statusTitle: "Running in this deployment",
    notice: {
      mockProver:
        "This deployment uses the mock prover: the server checks the same rules but makes no zero-knowledge proof. In this mode the phone sends the certificate and the secret key to the server for each request, and the server keeps nothing. The Groth16 and phone-proving parts below describe the real prover.",
      offChain:
        "This deployment checks proofs off-chain only, so the Sepolia steps below do not run here.",
      serverProver:
        "This deployment makes every proof on the server (PROVE_ON=server). The phone sends the certificate and the secret key for each request, and the server keeps nothing. The phone-proving parts below describe the default.",
    },
  },

  why: {
    title: "Why this exists",
    caption: "Send a copy, and Mingle gets every field. Send a proof, and Mingle gets one checked fact.",
    fact: "The paper version already exists in Japan. The city office of your registered domicile issues a Single Status Certificate (独身証明書) for a few hundred yen, and marriage agencies ask for one issued in the last three months. A real one lists no address. Our demo certificate adds the prefecture you live in, as a residence certificate (住民票) would, so there is a second fact you can choose to share. Sources are under Check it.",
    diagram: {
      label: "Two ways to prove single status. Sending a copy gives Mingle every field. DAS Busters gives Mingle one checked fact.",
      copyLane: "Send a copy",
      zkLane: "Use DAS Busters",
      certificate: "Certificate",
      have: "On your phone",
      send: "What you send",
      copy: "Copy",
      mingleSees: "Mingle sees",
      fields: ["Name", "Birth date", "Registered domicile", "Single"],
      proof: "Proof",
      single: "Single ✓",
      hidden: "hidden",
    },
  },

  idea: {
    title: "Who does what",
    lede: "Your phone sits in the middle. It gets the certificate from the city office once, then answers Mingle with proofs.",
    label: "The certificate goes from the city office to your phone once. Your phone sends Mingle a proof. The proof is recorded on Sepolia, which keeps only one anonymous number.",
    roles: {
      issuer: { name: "City office", role: "Issuer", body: "Signs your digital certificate." },
      holder: { name: "Your phone", role: "Holder · DAS Busters", body: "Keeps it and makes the proofs. You choose what to prove." },
      verifier: { name: "Mingle", role: "Verifier", body: "Checks the proof. Never sees the certificate." },
      chain: { name: "Ethereum Sepolia", role: "Public record", body: "Checks again. Stores one anonymous number." },
    },
    links: {
      certificate: "signed certificate, once",
      proof: "a proof, not the certificate",
      record: "stores one anonymous number",
    },
  },

  // /how-it-works/basics: the page around the seven terms below, and the
  // one-line pointer to it on /how-it-works.
  basicsPage: {
    description:
      "The seven terms DAS Busters uses, each with a picture: digital signature, hash, zero-knowledge proof, nullifier, blockchain, sign-in with Privy and World ID.",
    back: "How it works",
    footer: "Back to How it works",
    pointer: "New to signatures or zero-knowledge proofs?",
    pointerLink: "The seven terms this page uses, with pictures",
  },

  basics: {
    title: "The basics",
    lede: "The seven terms the How it works page uses. For each: what it is, why this app needs it, and how DAS Busters uses it.",
    whyLabel: "Why it's needed",
    inApp: "How DAS Busters uses it",
    signature: {
      title: "Digital signature",
      analogy: "A stamp that can't be forged or moved to another page.",
      body: "The city office signs with a key only it holds. Anyone can check the stamp with the office's public key, and changing one digit breaks it.",
      why: "Mingle never sees the certificate, so it needs another way to know that the city office issued it and nobody changed it.",
      inApp: "The city office signs your certificate when your phone picks it up. Every proof checks that signature, so an edited or home-made certificate can't produce one.",
      art: { doc: "Certificate", stamp: "Signed", edited: "1 digit changed", ok: "valid", broken: "broken" },
      formula: [
        "sign(private key, certificate) → signature",
        "check(public key, certificate, signature) → ✓",
        "// EdDSA on the BabyJubJub curve: cheap to check inside the circuit",
      ],
    },
    hash: {
      title: "Hash",
      analogy: "A fingerprint for data.",
      body: "Any input becomes one fixed-size number. The same input always gives the same number, and nobody can work back from the number to the input.",
      why: "It lets someone check or match a value without seeing it. The city office gets the fingerprint of your secret key, a number kept on your phone, and never the key itself.",
      inApp: "DAS Busters uses **Poseidon**, a hash made for zero-knowledge proofs: inside a proof it takes hundreds of steps, where the familiar SHA-256 takes tens of thousands. It makes your key's fingerprint, the message the city office signs, and your nullifier.",
      art: { input: "Certificate", machine: "Poseidon", output: "1858…9027" },
      formula: [
        "Poseidon(1) → 1858…9027",
        "Poseidon(2) → 8645…4349",
        "// circomlib, measured with circom 2:",
        "// Poseidon of 2 inputs = 517 constraints",
        "// SHA-256 of 32 bytes = 31,264 constraints",
      ],
    },
    zk: {
      title: "Zero-knowledge proof",
      analogy: "Proving you know the answer without saying it.",
      body: "Mingle learns that one statement is true: “the city office signed a certificate saying I'm single.” Nothing else.",
      why: "A copy of the certificate shows Mingle everything on it. A proof lets Mingle check the one fact it needs without seeing the rest.",
      inApp: "Your phone makes the proof when you tap Share selected information. Mingle's server checks it, then a contract on the blockchain checks it again.",
      formula: ["circom circuit · 9,921 constraints · Groth16 on BN254", "proof: a few hundred bytes · checked in milliseconds"],
      diagram: {
        label: "The certificate, the signature and your secret key go into the circuit and stay there. Out come a yes and a nullifier.",
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
      analogy: "A membership number: the same every time at one shop, different at every other shop, and nobody can trace it back to you.",
      body: "It is a hash of your secret key and the app's name. Your key normally never leaves your phone, so nobody else can work it out.",
      why: "The proof hides who you are, so without this number one real certificate could back any number of “verified single” accounts, say a romance scammer's. The number lets Mingle spot a reused certificate without learning who you are.",
      inApp: "The contract refuses a number it has already stored, so a second Mingle account with the same certificate fails. Other apps get different numbers. The city office can't work yours out either: it gets only your key's fingerprint, and the key normally stays on your phone.",
      formula: [
        "nullifier = Poseidon(holder secret, scope)",
        "scope     = Poseidon(“mingle”, epoch)",
        "registry: used[nullifier] ? revert NullifierAlreadyUsed : store it",
      ],
      diagram: {
        label: "Your secret key plus Mingle gives the same number twice, so the second account is refused. Another app gets a different number.",
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
      analogy: "A public notebook nobody can quietly edit, with rules that run themselves.",
      body: "Records go into blocks, and each block carries the fingerprint (hash) of the block before. Changing an old record would break every later link, so nobody can quietly edit or erase it. A smart contract is a program stored on the chain that runs exactly as written.",
      why: "If Mingle kept the used numbers in its own database, it could delete or change them and nobody outside could check. On a public chain anyone can look them up.",
      inApp: "After Mingle's server checks the proof, it sends it to our contract{{ (SingleProofRegistry)}} on **Sepolia**, Ethereum's public test network. The contract checks the proof again, adds the nullifier to its used list and refuses the same number next time. Our demo server pays the fee, so you need no crypto.",
      link: "See every record on Blockscout, a public blockchain explorer",
      art: {
        block: "Block",
        link: "each block holds the fingerprint of the one before",
        yours: "your nullifier",
        read: "anyone can read",
        erase: "nobody can quietly edit",
      },
      formula: ["record(proof) → verifyProof ✓ → used[nullifier] = true"],
    },
    worldId: {
      title: "World ID",
      analogy: "A check that a real person is there, without saying who.",
      body: "World ID is run by World. When a person approves a request in World's app, DAS Busters learns that the check passed and nothing about who they are.",
      why: "A certificate shows that someone is single. It does not show that a person, rather than a bot, is signing up.",
      inApp: "An optional check you can add to what you share. In this demo it is not yet tied to the certificate, and nothing checks whether the same World ID comes back.",
      art: { request: "a sign-up", human: "a person ✓", noName: "no name, no face" },
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
      body: "Privy runs the sign-in and gives your account a wallet: a key that can sign messages. You never handle crypto.",
      why: "The certificate should work only for you. Your secret key comes from your own sign-in, so someone who copies the certificate still can't make a proof with it.",
      inApp: "When you save the certificate, the wallet signs one fixed message and the phone turns that signature into your secret key. No transaction, no fee.",
      art: { google: "Google", wallet: "Wallet", sign: "signs once", secret: "Secret key" },
      formula: ["wallet.sign(“DAS Busters holder key v1 …”) → SHA-256 → holder secret"],
    },
  },

  flow: {
    title: "One run, step by step",
    lede: "The three-minute demo, one message at a time. Ken Sato is fictional, and Shibuya City is the demo's city office.",
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
      "In the demo one server plays the city office, Mingle's backend and the backup prover. In a real deployment they are separate parties with separate keys; Architecture below shows how.",
    steps: {
      offer: {
        label: "pickup ticket",
        arrow: "POST /api/offer",
        title: "The counter gets a pickup ticket",
        body: "The city office screen shows a QR pickup ticket that changes every three minutes.",
        tech: "An HS256 JWT of kind “offer” that lives 10 minutes. It carries a resident ID and the issue date.",
        data: "A resident ID and a date. No personal data.",
      },
      scan: {
        label: "scan QR",
        arrow: "scan QR",
        title: "Ken scans the QR code",
        body: "DAS Busters opens on the phone with a preview of his certificate.",
        tech: "/wallet/receive?offer=… The server checks the ticket before it shows the preview.",
        data: "The ticket, inside the URL.",
      },
      google: {
        label: "sign in",
        arrow: "Continue with Google",
        title: "Ken signs in with Google",
        body: "Privy signs him in and creates an embedded wallet for his account.",
        tech: "Privy OAuth, Google only. The embedded wallet is created on first sign-in.",
        data: "Google sign-in. Nothing about the certificate.",
      },
      secret: {
        label: "make secret key",
        arrow: "sign → secret",
        title: "The phone makes Ken's secret key",
        body: "The wallet signs a fixed message. Its hash becomes Ken's secret key, which stays on the phone.",
        tech: "holderSecret = the first 31 bytes of SHA-256 of the signature's hex text, so it fits the BN254 field.",
        data: "Nothing leaves the phone.",
      },
      commit: {
        label: "key fingerprint",
        arrow: "Poseidon(secret)",
        title: "The phone asks for the certificate",
        body: "It sends the ticket and a hash of the secret key, never the key itself.",
        tech: "POST /api/credential { offer, holderCommitment = Poseidon(holderSecret) }",
        data: "The ticket and one hash.",
      },
      issue: {
        label: "signed certificate",
        arrow: "signed certificate",
        title: "The city office signs it",
        body: "The city office, played by our demo server, signs Ken's certificate together with that fingerprint. The phone saves it.",
        tech: "EdDSA-Poseidon over Poseidon(isSingle, birthYear, residenceCode, issuedAt, holderCommitment). Saved in the phone's localStorage.",
        data: "The certificate, to the phone only.",
      },
      request: {
        label: "the question",
        arrow: "POST /api/request",
        title: "Mingle asks for proof",
        body: "Ken taps Verify with DAS Busters. Mingle writes its question into a signed request.",
        tech: "A request JWT (10 minutes) with a random nonce, scopeHash = Poseidon(“mingle”, epoch), requestHash = Poseidon(nonce), and the optional asks: Tokyo and 30s.",
        data: "The question. No personal data.",
      },
      open: {
        label: "open DAS Busters",
        arrow: "open DAS Busters",
        title: "Mingle hands over to DAS Busters",
        body: "Mingle opens the share screen with that request and remembers its number.",
        tech: "/wallet/share?req=… The nonce is saved so Mingle can match the answer later. The share screen starts downloading the circuit files.",
        data: "The request, inside the URL.",
      },
      choose: {
        label: "choose",
        arrow: "choose",
        title: "Ken chooses what to share",
        body: "Single is required. Tokyo and 30s are optional. Name and birth date are never on offer.",
        tech: "Two switches become the flags revealResidence and revealAge.",
        data: "Nothing leaves the phone.",
      },
      prove: {
        label: "make the proof",
        arrow: "groth16.fullProve",
        title: "The phone makes the proof",
        body: "DAS Busters does the proof maths on the phone. The certificate and Ken's secret key stay there.",
        tech: "snarkjs groth16.fullProve in the browser with single_proof.wasm (2.7 MB) and single_proof.zkey (5.0 MB). If the phone can't finish (an old browser, too little memory), the share screen sends this one proof to POST /api/prove and says so. A broken rule is an answer and is never retried on the server. PROVE_ON=server moves all proving to the server.",
        data: "Nothing leaves the phone.",
      },
      proof: {
        label: "proof + 10 numbers",
        arrow: "proof + 10 signals",
        title: "Out comes the proof",
        body: "The result is the proof plus ten public numbers, including the nullifier. The phone sends only these, with Mingle's request and, if Ken added it, the World ID check.",
        tech: "A Groth16 proof (a, b, c) and publicSignals in a fixed order: nullifier, issuer key, two share flags, Tokyo code and birth-year range (0 when hidden), scope and request hash.",
        data: "Still on the phone: the proof and ten public numbers.",
      },
      verify: {
        label: "check the proof",
        arrow: "POST /api/verify",
        title: "Mingle's server checks it",
        body: "It checks that the proof answers this request, that the city office key is the trusted one, and that the maths holds.",
        tech: "Request JWT, scopeHash and requestHash, the issuer key, the shared values, then groth16.verify off-chain.",
        data: "The proof and public numbers. Never the certificate.",
      },
      record: {
        label: "send to the chain",
        arrow: "record(proof)",
        title: "Mingle's server sends it to Sepolia",
        body: "A server wallet sends the proof to the contract and pays the fee. If the contract refuses it, Mingle shows an error, not a success.",
        tech: "The relayer calls simulateContract, then writeContract, and waits up to 45 s for the receipt. A contract refusal is an error; any other failure, such as Sepolia being unreachable, falls back to Mingle's off-chain check, and the result says so.",
        data: "The proof and public numbers, in a public transaction.",
      },
      registry: {
        label: "check → store",
        arrow: "check → store",
        title: "The contract checks it again",
        body: "It checks the city office key, that the nullifier is new, and the proof. Then it stores the nullifier.",
        tech: "SingleProofRegistry.record → Groth16Verifier.verifyProof → emit SingleStatusVerified(nullifierHash, scopeHash, requestHash).",
        data: "Stored: one nullifier.",
      },
      result: {
        label: "signed result",
        arrow: "signed result",
        title: "Mingle's server signs the result",
        body: "It returns a signed result: what was proved, the nullifier and a link to the record on Sepolia.",
        tech: "A result JWT (24 hours) with the request's nonce, the shared facts, the nullifier and the transaction hash.",
        data: "Yes/no facts, the nullifier, the transaction hash.",
      },
      badge: {
        label: "back to Mingle",
        arrow: "back to Mingle",
        title: "Mingle shows the badge",
        body: "Mingle checks the result answers its own request and shows “Single status verified”.",
        tech: "/mingle?result=… is checked on the server, and its nonce must equal the one Mingle saved. Identity & verification links to the transaction on Etherscan.",
        data: "What Mingle keeps: single yes, the facts you chose, the nullifier, the city office key.",
      },
    } satisfies Record<StepId, StepCopy>,
  },

  architecture: {
    title: "Architecture",
    lede: "In this demo one web app on Vercel plays every server role. Two outside services, two contracts.",
    browser: {
      title: "In the browser",
      counter: "Issuing counter",
      wallet: "DAS Busters",
      mingle: "Mingle",
      storage: "Keeps the certificate and your secret key, and makes the proof",
    },
    server: {
      title: "On the server (Next.js on Vercel)",
      issuer: {
        name: "City office",
        routes: "/api/offer · /api/credential",
        key: "issuer signing key",
        demo: "Demo only",
        demoNote: "The signing key sits on this server only so the whole demo runs from one site. A real city office keeps it in its own hardware.",
      },
      prover: { name: "Backup prover", routes: "/api/prove", key: "used only if a phone can't finish a proof" },
      verifier: { name: "Mingle's backend", routes: "/api/request · /api/verify · /api/tx", key: "wallet that pays the Sepolia fee" },
      worldId: { name: "Human check", routes: "/api/world-id/*", key: "World ID signing key" },
    },
    outside: {
      title: "Outside",
      privy: { name: "Privy + Google", note: "sign-in and the wallet" },
      chain: { name: "Ethereum Sepolia", note: "two contracts: the list of used numbers and the proof checker", code: "SingleProofRegistry → Groth16Verifier" },
      worldId: { name: "World ID", note: "Developer Portal" },
    },
    worldIdStatus: {
      simulated: "simulated here",
      "idkit-staging": "staging",
      idkit: "live",
    } satisfies Record<Modes["worldId"], string>,
    real: {
      title: "Demo setup vs a real deployment",
      lede: "In this demo one server plays three parties: the city office with its signing key, the backup prover and Mingle's backend. That lets the whole flow run from one link. In a real deployment the city office and Mingle would each run their own server with their own keys, and the phone would make every proof. That split is not built yet.",
      summary: "Part by part: this demo and the intended design",
      tech: "The issuer key is the Vercel environment variable `ISSUER_PRIVATE_KEY`. All three roles sign their tokens with one shared `TOKEN_SECRET`.",
      head: { part: "Part", demo: "This demo", real: "A real deployment (intended design)" },
      rows: [
        {
          part: "City office (issuer)",
          demo: "Part of the demo server. The signing key is a Vercel environment variable.",
          real: "Run by the municipality, or through the national family-register system or Mynaportal, the government's online portal. The signing key never leaves the office's own HSM, and its public key is published in a list of trusted issuers.",
        },
        {
          part: "Wallet (DAS Busters)",
          demo: "Web pages on the same site as Mingle. The certificate and secret key sit in the browser's localStorage.",
          real: "Its own app or website. Keys in the phone's secure storage.",
        },
        {
          part: "Prover",
          demo: "On the phone by default. The demo server makes the proof only if the phone can't.",
          real: "On the phone only.",
        },
        {
          part: "Mingle's verifier",
          demo: "Part of the same server, sharing one token-signing secret with the other roles.",
          real: "Mingle's own server with its own keys. The app name in the proof (the scope) stays fixed, so your number at Mingle never changes.",
        },
        {
          part: "Recording",
          demo: "Sepolia test network. The demo server's wallet pays the fee.",
          real: "A public mainnet or an Ethereum layer 2. Mingle, or the wallet, sends the transaction. The contract checks that the issuer is on the trusted list without learning which city it is{{ (a set-membership proof, for example against a Merkle root of city keys)}}.",
        },
        {
          part: "Human check",
          demo: "World ID staging, with the World ID Simulator standing in for World App. Simulated when staging is off.",
          real: "World ID in production (World App), bound to this proof, with its nullifier checked for repeats.",
        },
        {
          part: "Freshness and revocation",
          demo: "Not checked.",
          real: "Mingle asks for proof that the certificate was issued on or after a given date{{ (a public input)}}, and the issuer publishes withdrawn certificates.",
        },
      ],
      note: "The right-hand column is the intended design. None of it is built yet.",
    },
    dataTitle: "Where your data lives",
    dataLede: "Green: held. Crossed out: never held.",
    dataLegend: { holds: "Holds", never: "Never" },
    places: [
      {
        place: "Your phone",
        note: "The proof is made here.",
        holds: ["Certificate", "Secret key", "Share history"],
        never: [],
      },
      {
        place: "Our server, as backup",
        note: "Only if your phone can't finish a proof, and only for that one request. Nothing is saved.",
        holds: ["Certificate", "Secret key"],
        never: ["Anything after the request"],
      },
      {
        place: "Mingle",
        note: "Tokyo, 30s and the human check only if you chose them. The city office key shows which office signed.",
        holds: ["Single ✓", "Tokyo", "30s", "Human check", "Nullifier", "City office key", "Transaction link"],
        never: ["Name", "Birth date", "Certificate"],
      },
      {
        place: "Ethereum Sepolia",
        note: "The transaction input shows all ten public numbers, so Tokyo and the birth-year range appear only if you shared them.",
        holds: ["Nullifier", "Which app asked (hashed)", "Which request (hashed)"],
        never: ["Name", "Birth date", "Certificate"],
      },
    ],
  },
};

export type StoryCopy = typeof storyEn;
export default storyEn;
