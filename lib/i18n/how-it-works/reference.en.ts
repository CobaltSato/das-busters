import type { Modes } from "@/lib/modes";

// English copy for the second half of /how-it-works: the technical deep
// dive, what was built, where to check it, and answers to judges' questions.
// Every number here must match the code; reference.ja.ts must match the shape.

type ModeText<K extends keyof Modes> = Record<Modes[K], string>;

const referenceEn = {
  tech: {
    title: "Technical deep dive",
    lede: "For judges and engineers. Every number here comes from the code in the repository.",
    certificate: {
      title: "Certificate and signature",
      body: "The certificate is JSON on the phone. Its numeric fields are hashed together with the holder's commitment into one Poseidon message, and the city office signs that message.",
      code: "M = Poseidon(isSingle, birthYear, residenceCode, issuedAt, Poseidon(holderSecret))\nsignature = EdDSA-Poseidon(issuerKey, M)      // BabyJubJub curve",
      note: "Only these five values are signed. The name and full birth date are shown on the phone but cannot be proved. Residence is a JIS prefecture code: 13 is Tokyo.",
    },
    holderKey: {
      title: "Holder key",
      body: "The certificate is bound to its holder. The holder secret never goes to the city office, only its hash does, and the proof needs the secret itself.",
      code: "signature    = embeddedWallet.sign(\"DAS Busters holder key v1 …\")\nholderSecret = first 31 bytes of SHA-256(signature as lowercase hex)   // < BN254 field\ncommitment   = Poseidon(holderSecret)                                  // sent to the city office",
    },
    circuit: {
      title: "The circuit",
      lede: "`circuits/single_proof.circom`: 9,921 constraints, 8 private inputs, 9 public inputs, 1 output.",
      privateTitle: "Private inputs (stay hidden)",
      private: ["isSingle", "birthYear", "residenceCode", "issuedAt", "holderSecret", "sigR8x, sigR8y, sigS"],
      publicTitle: "Public inputs (Mingle sees)",
      public: ["issuerAx, issuerAy", "revealResidence, revealAge", "expectedResidence", "minBirthYear, maxBirthYear", "scopeHash", "requestHash"],
      checksTitle: "What it proves",
      checks: [
        "The city office's EdDSA signature over M is valid for the public key (issuerAx, issuerAy).",
        "isSingle = 1.",
        "If residence is shared, residenceCode equals the requested code. If not, the public code is 0.",
        "If age is shared, minBirthYear ≤ birthYear ≤ maxBirthYear. If not, both bounds are 0.",
        "nullifierHash = Poseidon(holderSecret, scopeHash).",
        "requestHash is squared into a constraint, so the proof fits one request only.",
      ],
      outputTitle: "Output",
      output: "nullifierHash",
      excerptTitle: "The reveal rule, straight from the circuit",
      excerpt:
        "revealResidence * (residenceCode - expectedResidence) === 0;\n(1 - revealResidence) * expectedResidence === 0;",
      signalsTitle: "The 10 public signals, in order",
      signalsHead: { index: "#", name: "Signal", meaning: "Meaning" },
      signals: [
        { name: "nullifierHash", meaning: "Anonymous number for this holder at this app" },
        { name: "issuerAx", meaning: "City office public key, x" },
        { name: "issuerAy", meaning: "City office public key, y" },
        { name: "revealResidence", meaning: "1 if residence is shared" },
        { name: "revealAge", meaning: "1 if the age range is shared" },
        { name: "expectedResidence", meaning: "13 (Tokyo) if shared, else 0" },
        { name: "minBirthYear", meaning: "1987 for 30s in 2026, else 0" },
        { name: "maxBirthYear", meaning: "1996 for 30s in 2026, else 0" },
        { name: "scopeHash", meaning: "Poseidon(\"mingle\", epoch)" },
        { name: "requestHash", meaning: "Poseidon(nonce) of this request" },
      ],
    },
    proving: {
      title: "Proving",
      body: [
        "The proof is made on the server, in `/api/prove`, with snarkjs Groth16 on the BN254 curve. It takes 1–4 s on Vercel. The circuit files are `single_proof.wasm` (2.7 MB) and `single_proof.zkey` (5.0 MB).",
        "We chose server-side proving for the hackathon, on mentor advice, so the demo runs on any phone. The trade-off: the prover sees the certificate and the secret for one request. It keeps nothing, and the app never claims the data stays on the device. Proving on the phone is the next step.",
        "Groth16 needs a trusted setup. Ours has one local contribution to each phase (powers of tau at 2^14, then the circuit key) because the public files were unreachable at the event. Fine for a demo, not for production.",
      ],
    },
    verification: {
      title: "Verification, off-chain then on-chain",
      offchainTitle: "Mingle's verifier (/api/verify) checks",
      offchain: [
        "The request token is valid and not expired.",
        "scopeHash and requestHash match this request.",
        "The issuer key equals the published city office key (`lib/zk/issuer-public.json`).",
        "Shared values match what Mingle asked for. Hidden ones are 0.",
        "The proof's mode matches the server's, so a client cannot fall back to a mock proof.",
        "groth16.verify passes with the verification key.",
      ],
      treeTitle: "Then the registry's record() checks",
      tree: {
        call: "record(a, b, c, publicSignals)",
        issuer: "Issuer key is the city office's?",
        nullifier: "Nullifier already used?",
        proof: "Groth16Verifier.verifyProof()",
        no: "no",
        yes: "yes",
        true: "true",
        false: "false",
        issuerRevert: "revert UntrustedIssuer",
        nullifierRevert: "revert NullifierAlreadyUsed",
        proofRevert: "revert InvalidProof",
        ok: "Store the nullifier, emit SingleStatusVerified",
      },
      rule: "A revert is shown as a failure. If recording fails for any other reason, such as Sepolia being unreachable or the relayer running out of test ETH, Mingle keeps its off-chain result and says “Off-chain by Mingle”, with no Etherscan link.",
    },
    tokens: {
      title: "Tokens and replay protection",
      head: { name: "Token", life: "Lifetime", carries: "Carries", stops: "Stops" },
      rows: [
        {
          name: "Offer",
          life: "10 min (new QR every 3 min)",
          carries: "Resident ID, issue date",
          stops: "Old QR codes being used later",
        },
        {
          name: "Request",
          life: "10 min",
          carries: "Nonce, scopeHash, requestHash, asks",
          stops: "A proof being reused for another request, since requestHash is inside the proof",
        },
        {
          name: "Result",
          life: "24 h",
          carries: "Nonce, shared facts, nullifier, transaction hash",
          stops: "Mingle accepting an answer it did not ask for, since the nonce must match",
        },
      ],
      note: "All three are HS256 JWTs signed by the same server, because one server plays every role in the demo. Separate parties would each sign with their own key.",
    },
    modes: {
      title: "Mock and real modes",
      lede: "Each integration has a mock and a real version. The server picks one from its environment, so the browser cannot switch a check off. With nothing set, all four run as mocks.",
      head: { part: "Part", env: "Turned on by", mock: "Mock", real: "Real", now: "This deployment" },
      rows: {
        auth: {
          part: "Sign-in",
          env: "NEXT_PUBLIC_PRIVY_APP_ID",
          mock: "A built-in demo account and a random secret",
          real: "Google via Privy, secret from the wallet's signature",
        },
        prover: {
          part: "Proof",
          env: "PROVER_MODE=groth16",
          mock: "The server checks the same rules, with an HMAC instead of a proof",
          real: "EdDSA-signed certificate and a Groth16 proof",
        },
        chain: {
          part: "Chain",
          env: "CHAIN_MODE=sepolia",
          mock: "Checked off-chain by Mingle only",
          real: "Recorded in SingleProofRegistry on Sepolia",
        },
        worldId: {
          part: "Human check",
          env: "WORLDID_MODE=idkit + World ID keys",
          mock: "The camera for five seconds, labelled simulated",
          real: "World ID through IDKit, checked by World's Developer Portal. Staging uses the World ID Simulator and falls back to simulated when its window closes",
        },
      },
      now: {
        auth: { mock: "Mock", privy: "Real" } satisfies ModeText<"auth">,
        prover: { mock: "Mock", groth16: "Real" } satisfies ModeText<"prover">,
        chain: { off: "Off-chain", sepolia: "Real" } satisfies ModeText<"chain">,
        worldId: { simulated: "Simulated", "idkit-staging": "Staging", idkit: "Real" } satisfies ModeText<"worldId">,
      },
    },
  },

  built: {
    title: "What we built",
    lede: "Everything in the repository was written during ETHGlobal Tokyo 2026. Before the event we had the idea, the pitch, Figma designs, a local circom spike and the brand assets; the README lists them.",
    doneTitle: "Working",
    done: [
      "Issuing counter with a QR code that refreshes every three minutes",
      "DAS Busters wallet: receive, save, choose what to share, history",
      "Mingle, a sample dating app that asks for proof and shows badges",
      "Circom circuit and a server-side Groth16 prover",
      "EdDSA-Poseidon issuer with a published public key",
      "SingleProofRegistry and Groth16Verifier on Ethereum Sepolia, tested in Foundry with a real proof",
      "Google sign-in through Privy, with the holder key from the embedded wallet",
      "World ID human check through IDKit, checked by World's Developer Portal",
      "English and Japanese screens",
    ],
    worldIdTitle: "Human check in this deployment",
    worldId: {
      simulated: "Simulated: no World ID proof is made, because World ID keys are not set here or the staging window has closed.",
      "idkit-staging": "World ID staging: real requests checked by the Developer Portal, with test identities from the Simulator.",
      idkit: "World ID: each proof is checked by World's Developer Portal.",
    } satisfies Record<Modes["worldId"], string>,
    nextTitle: "Not built yet",
    next: [
      "Proving on the phone, so the certificate never leaves it",
      "Expiry and revocation: the issue date is signed but not checked yet",
      "A multi-party trusted setup ceremony",
      "A real city office key and a real family-register lookup",
      "Separate keys for the city office, the prover and Mingle",
    ],
    stackTitle: "Stack",
    stack: [
      "Next.js 15",
      "TypeScript",
      "circom 2 + circomlib",
      "snarkjs · Groth16 · BN254",
      "EdDSA-Poseidon",
      "Solidity + Foundry",
      "viem",
      "Privy",
      "World ID IDKit",
      "Ethereum Sepolia",
      "Vercel",
    ],
  },

  check: {
    title: "Check it yourself",
    lede: "Each claim on this page can be checked from one of these links.",
    demoTitle: "Try the demo",
    demo: {
      hub: { label: "Demo hub", note: "Start here. Open the counter on a laptop and the rest on a phone." },
      counter: { label: "Issuing counter", note: "The city office screen with the QR code." },
      wallet: { label: "DAS Busters", note: "The wallet on your phone." },
      mingle: { label: "Mingle", note: "The dating app that asks for proof." },
      reset: { label: "Reset demo", note: "Clears both apps on this device for another run." },
      config: { label: "Current modes", note: "JSON: which parts run for real right now." },
    },
    chainTitle: "On-chain (Ethereum Sepolia)",
    chain: {
      registry: { label: "SingleProofRegistry", note: "Open Events to see every SingleStatusVerified record." },
      verifier: { label: "Groth16Verifier", note: "Generated by snarkjs from the circuit's verification key." },
      registryDeploy: { label: "Registry deployment", note: "The transaction that created the registry." },
      verifierDeploy: { label: "Verifier deployment", note: "The transaction that created the verifier." },
    },
    sourceTitle: "Source code",
    source: {
      repo: { label: "GitHub repository", note: "Public. README, contracts, circuit and app." },
      circuit: { label: "single_proof.circom", note: "The circuit, about 100 lines." },
      registry: { label: "SingleProofRegistry.sol", note: "The contract, about 60 lines." },
      tests: { label: "Contract tests", note: "Foundry tests against a real proof." },
      verificationKey: { label: "Verification key", note: "What the verifier checks proofs against." },
      issuerKey: { label: "City office public key", note: "The only issuer the verifier trusts." },
    },
    docsTitle: "Docs",
    docs: {
      readme: { label: "README", note: "Overview, diagrams, contracts, what we made before the event." },
      demo: { label: "Demo walkthrough", note: "The three-minute run, step by step, with what to say." },
      aiUsage: { label: "AI usage", note: "What Claude Code generated and what the team did." },
    },
    recipeTitle: "A three-minute check",
    recipe: [
      "Open the demo hub on a laptop and click Issuing counter. Scan the QR code with your phone and save the certificate. Any Google account works.",
      "Open Mingle on the phone, tap Identity & verification, then Verify with DAS Busters, and share.",
      "When the badge appears, open Identity & verification and tap Recorded on Sepolia. Etherscan shows a record call to SingleProofRegistry.",
      "Open the transaction's Logs: one SingleStatusVerified event with nullifierHash, scopeHash and requestHash. No name, no birth date.",
      "Press the browser's Back button to return to Choose what to share, and share again. The same certificate at the same app gives the same nullifier, so the registry refuses it and Mingle shows an error.",
    ],
  },

  qa: {
    title: "Questions judges ask",
    lede: "A short answer you can say out loud, then the details and the limits.",
    say: "Short answer",
    details: "Details",
    groups: [
      {
        title: "Privacy",
        items: [
          {
            q: "Why not just send a photo of the certificate?",
            a: "A photo hands over your name, birth date and address, and it is easy to edit. A proof shares one fact, and it only works if the city office's signature is valid.",
            d: "The circuit checks the signature, so an edited certificate cannot produce a proof. Mingle ends up with yes/no facts and a nullifier. The “Where your data lives” table above lists what each party holds.",
          },
          {
            q: "What exactly goes on-chain? Any personal data?",
            a: "The registry stores one nullifier, and its event adds the scope hash and the request hash. No name, no birth date.",
            d: "To be precise, the transaction input carries all ten public signals. That includes the city office's public key and, only if you chose to share them, the Tokyo code (13) and the birth-year range.",
          },
          {
            q: "Can Mingle and another app compare notes about me?",
            a: "No. The same person gets a different nullifier at each app, so their records don't match.",
            d: "nullifier = Poseidon(holder secret, scope), and the scope includes the app's name. The demo has only Mingle, so this is the design rather than something you can try here.",
          },
          {
            q: "Where is the proof made? Does the certificate leave the phone?",
            a: "On our server, for now. The phone sends the certificate and secret for one request, and the prover keeps nothing.",
            d: "/api/prove runs snarkjs in 1–4 s, so the demo works on any phone. Mingle's verifier never receives the certificate. The app never says the data stays on the device, and on-device proving is the next step.",
          },
        ],
      },
      {
        title: "Security",
        items: [
          {
            q: "How does Mingle know the certificate is real?",
            a: "The circuit checks the city office's signature, and the public key it checked against is part of the proof. Mingle's server and the contract both reject any other key.",
            d: "The trusted key is published in lib/zk/issuer-public.json and fixed in the registry when it was deployed. A certificate signed by anyone else fails with untrusted-issuer off-chain and UntrustedIssuer on-chain.",
          },
          {
            q: "Could I edit my certificate to say I'm single?",
            a: "No. The signature covers the marital status, so an edited certificate fails the signature check and no proof can be made.",
            d: "The signed message is Poseidon(isSingle, birthYear, residenceCode, issuedAt, holderCommitment), and the circuit also requires isSingle = 1.",
          },
          {
            q: "Can someone use another person's certificate?",
            a: "Not without that person's holder secret. The certificate is signed together with a commitment to the secret, and the proof needs the secret itself.",
            d: "The secret comes from a signature by the embedded wallet of the Google account that saved the certificate. Limit: in the demo the counter gives Ken's certificate to anyone who scans, so any Google account can pick one up. A real city office would check ID at the counter first.",
          },
          {
            q: "Can one person make many Mingle accounts?",
            a: "Not with the same certificate. The same holder at the same app gets the same nullifier, and the contract refuses it the second time.",
            d: "Try it: go Back and share again, and the registry refuses it with NullifierAlreadyUsed. Limits: this check lives on-chain, so it needs the Sepolia mode. The scope comes from an epoch that Mingle's browser keeps, so the demo's Reset makes a new nullifier; a real Mingle would keep one fixed scope. A different Google account makes a different secret, so one account per person also needs the city office to issue one certificate per person. A unique-human check such as World ID is meant to close that gap.",
          },
          {
            q: "What stops someone replaying a proof they saw?",
            a: "Each proof is tied to one request by its requestHash, and a nullifier can be recorded only once.",
            d: "Mingle's request carries a random nonce, and requestHash = Poseidon(nonce) is a public input of the proof. The result must carry the nonce Mingle saved. Limits: the server does not mark a request as used, so within its 10 minutes the same proof can be verified again; on Sepolia its nullifier is still recorded only once. record() is open to anyone, and the scope and freshness checks happen only in Mingle's off-chain verifier.",
          },
          {
            q: "Is the trusted setup safe?",
            a: "Not for production. We ran it alone on one machine; a real launch needs a multi-party ceremony.",
            d: "Groth16's setup creates secret randomness, and whoever knows all of it could forge proofs. With many independent contributors, one honest contributor is enough. Ours had one local contribution to each phase because the public setup files were unreachable at the event.",
          },
        ],
      },
      {
        title: "Trust and limits",
        items: [
          {
            q: "What if I marry after getting the certificate?",
            a: "Today the proof doesn't check how old the certificate is. That is the first thing to add.",
            d: "The issue date is already signed into the certificate, so adding a public “issued after” date to the circuit is a small change. Revocation would need the city office to publish a revocation list.",
          },
          {
            q: "What if the city office's key leaks?",
            a: "The private key lives only in the server's environment; the repository holds only the public key. A leak would mean deploying a new registry with a new key.",
            d: "The registry's issuer key is immutable, which keeps it simple to audit. Production would need key rotation, for example an issuer registry the city office controls.",
          },
          {
            q: "Is World ID real in this demo?",
            a: {
              simulated: "No. In this deployment the human check is simulated, and the app labels it that way everywhere.",
              "idkit-staging": "The integration is real, the person is not. It runs on World ID staging, where the World ID Simulator stands in for World App with a test identity.",
              idkit: "Yes. World's Developer Portal checks each World ID proof before our server accepts it.",
            } satisfies Record<Modes["worldId"], string>,
            d: {
              simulated:
                "The camera opens for five seconds and no World ID proof is made. The World ID integration is built: it runs on World ID staging when its keys are set and the staging window is open. The point of World ID here: it adds “a unique human is behind this account”, which a certificate alone cannot prove.",
              "idkit-staging":
                "Our server signs each IDKit request and forwards the result to World's Developer Portal. Mingle counts the check only with the signed token our server issues after that. Limits: that token travels next to the ZK proof, not inside it, lasts seven days and is not yet tied to the certificate, and the World ID nullifier is not yet checked for repeats.",
              idkit:
                "Our server signs each IDKit request and forwards the result to World's Developer Portal. Mingle counts the check only with the signed token our server issues after that. Limits: that token travels next to the ZK proof, not inside it, lasts seven days and is not yet tied to the certificate, and the World ID nullifier is not yet checked for repeats.",
            } satisfies Record<Modes["worldId"], string>,
          },
          {
            q: "Why a blockchain? Your server already checks the proof.",
            a: "So the final check runs in public. Anyone can re-run the contract's check and see every nullifier it has accepted.",
            d: "Mingle's server checks first, for a fast answer and a clear error. The contract then checks the proof again and refuses a nullifier it has already stored, so a second account in the same scope fails even if someone goes around Mingle's server. Limit: the contract does not check which scope a proof was made for. In the demo Mingle's browser picks the epoch, so wiping Mingle's data gives a new nullifier; a real Mingle would keep one fixed scope.",
          },
          {
            q: "Is this real government data?",
            a: "No. Ken Sato is fictional, and our server plays the city office with a demo key.",
            d: "The paper certificate is real: Japanese city offices issue 独身証明書 and marriage agencies ask for it. A real launch would need the city office to issue the digital version and hold the signing key.",
          },
        ],
      },
      {
        title: "Build",
        items: [
          {
            q: "Who pays for the transactions? Do users need crypto?",
            a: "Our relayer wallet pays the Sepolia fees. Users only sign in with Google.",
            d: "The embedded wallet signs one message to make the holder secret. It never sends a transaction or needs ETH.",
          },
          {
            q: "How fast is it?",
            a: "The proof takes 1–4 seconds. Recording on Sepolia takes about one block, around 12 seconds.",
            d: "The server waits up to 45 s for the receipt. After that, Mingle shows the badge with a note that the transaction is not confirmed yet, and keeps checking for about two minutes.",
          },
          {
            q: "Why Sepolia and not mainnet or an L2?",
            a: "It is a public test network, so the demo is free and anyone can inspect it. Moving to another chain is a small change.",
            d: "The RPC URL and the registry address come from the environment, but the code knows only Sepolia and a local chain today, and the Etherscan link is fixed to Sepolia. Moving to an L2 such as World Chain means adding that chain, then redeploying the plain-Solidity contracts.",
          },
          {
            q: "What does “30s” prove exactly?",
            a: "That the birth year falls in a range: 1987 to 1996 for the 30s in 2026. Not the exact age.",
            d: "Mingle sends the range, and the circuit checks minBirthYear ≤ birthYear ≤ maxBirthYear. Only the birth year is signed, not the full date.",
          },
          {
            q: "What did you build before the event?",
            a: "The idea, the pitch, Figma designs, a local circom spike and the brand assets. All the code here was written at the event.",
            d: "The README's “Made before the event” section lists it, and AI_USAGE.md records what Claude Code generated and what the team did.",
          },
        ],
      },
    ],
  },

  footer: {
    back: "Back to the demo",
    readme: "Read the README",
  },
};

export type ReferenceCopy = typeof referenceEn;
export default referenceEn;
