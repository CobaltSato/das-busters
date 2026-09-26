import type { Modes, ProvingLocation } from "@/lib/modes";

// English copy for the second half of /how-it-works: the technical deep
// dive, what was built, where to check it, and the FAQ.
// Every number here must match the code; reference.ja.ts must match the shape.
// `code`, **bold** and {{Engineer-only text}} are rendered by _components/Rich.

type ModeText<K extends keyof Modes> = Record<Modes[K], string>;

const referenceEn = {
  tech: {
    title: "Under the hood",
    lede: "Every figure here comes from the code in the repository.",
    numbers: [
      { value: "9,921", label: "Rules the proof checks (circuit constraints)" },
      { value: "10", label: "Public numbers Mingle sees" },
      { value: "1", label: "Numbers stored on the blockchain per sign-up" },
      { value: "0", label: "Names or birth dates on the blockchain" },
      { value: "7.7 MB", label: "Circuit files the phone downloads to make a proof" },
      { value: "10–20 s", label: "Usual wait to record on Sepolia" },
    ],
    plainOnly: "The circuit, the contract checks, tokens and modes are in Engineer view.",
    plainSwitch: "Show Engineer view",
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
        "Made on the phone by default: snarkjs Groth16 on BN254 runs in the browser with the same files the server uses, `single_proof.wasm` (2.7 MB) and `single_proof.zkey` (5.0 MB). The share screen starts downloading them when it opens. On a laptop in Chrome the proof itself took under a second once the files were cached; phones are not measured yet.",
        "If the phone can't finish, for example on an old browser or with too little memory, the share screen sends that one proof to `/api/prove` and the button says so. The server keeps nothing. A broken rule (not single, wrong holder, edited certificate) is an answer, not a device problem, so it is never retried on the server. `PROVE_ON=server` moves all proving to the server without new code, and the mock prover always runs on the server.",
        "Mingle's verifier can't tell where a proof was made and doesn't need to: it checks every proof the same way. The wallet's share history records `provedOn: device | server` for each share.",
        "Trusted setup: the Hermez powers-of-tau mirrors returned 403 at the event, so both phases (powers of tau at 2^14, then the circuit key) have one local contribution. Fine for a demo, not for production. The PSE Perpetual Powers of Tau files are reachable, and moving to them is the next step.",
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
      note: "All three are HS256 JWTs signed with one shared TOKEN_SECRET, because one server plays every role in the demo. Separate parties would each sign with their own key; Architecture shows the intended split.",
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
      proveOn: {
        device: "Where the proof is made is a separate switch. This deployment makes it **on the phone**, with the server as a fallback; `PROVE_ON=server` would move it to the server.",
        server: "Where the proof is made is a separate switch. This deployment makes every proof **on the server**, because `PROVE_ON=server` is set or the prover is the mock.",
      } satisfies Record<ProvingLocation, string>,
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
    lede: "All code was written during ETHGlobal Tokyo 2026. Before it: the idea, the pitch, Figma designs, a local circom spike and the brand assets, listed in the README.",
    doneTitle: "Working",
    done: [
      "Issuing counter with a QR code that refreshes every three minutes",
      "DAS Busters wallet: receive, save, choose what to share, history",
      "Mingle, a sample dating app that asks for proof and shows badges",
      "Proofs made on the phone, with our server as a fallback{{ (circom circuit, snarkjs Groth16)}}",
      "A city office that signs certificates, with its public key published{{ (EdDSA-Poseidon)}}",
      "Two contracts on Sepolia that check each proof and keep the used numbers, tested with a real proof and source-verified on Sourcify and Blockscout{{ (SingleProofRegistry, Groth16Verifier, Foundry)}}",
      "Google sign-in through Privy, with the secret key made from the wallet's signature",
      "World ID human check, confirmed by World's servers{{ (IDKit, Developer Portal)}}",
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
      "Checking how recent the certificate is. Agencies accept only certificates issued in the last three months; the issue date is signed but not checked yet",
      "Revocation: the city office publishing withdrawn certificates",
      "Running the proof system's one-time setup with many independent people{{ (a multi-party trusted setup, starting from the PSE Perpetual Powers of Tau)}}",
      "A World ID check tied to the certificate, with repeat World IDs refused",
      "A real city office key and a real family-register lookup",
      "Separate servers and keys for the city office and Mingle (see Architecture)",
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
    lede: "Every claim on this page links to something you can open.",
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
      registryBlockscout: {
        label: "SingleProofRegistry on Blockscout",
        note: "Source verified. Logs shows every SingleStatusVerified record, decoded.",
      },
      verifierBlockscout: {
        label: "Groth16Verifier on Blockscout",
        note: "Source verified. Generated by snarkjs from the circuit's verification key.",
      },
      registrySourcify: { label: "Registry source on Sourcify", note: "Exact match between the deployed contract and its source." },
      verifierSourcify: { label: "Verifier source on Sourcify", note: "Exact match between the deployed contract and its source." },
      registry: {
        label: "SingleProofRegistry on Etherscan",
        note: "Events show as raw hex here. Blockscout shows them decoded.",
      },
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
    backgroundTitle: "Background: the real certificate and the problem",
    background: {
      koto: {
        label: "Koto City: 独身証明書",
        note: "The certificate lists name, birth date, registered domicile (本籍) and that the person does not breach Civil Code Art. 732 (no bigamy). 300 yen.",
      },
      youbride: {
        label: "youbride help: single-status certificate",
        note: "Issued within the last three months, photographed in full with nothing hidden.",
      },
      ibj: { label: "IBJ: documents for joining", note: "The 独身証明書 must be an original issued within three months." },
      digitalAgency: {
        label: "Digital Agency: single-status check with the My Number Card",
        note: "How Tapple checks single status through the My Number Card. Quotes a Tapple survey (May 2024, 5,429 users): 83.8% of men and 97.4% of women want some proof that the other person is single.",
      },
      tapple: { label: "Tapple: かんたん独身証明", note: "CyberAgent runs Tapple, a dating app. This is its release for the My Number Card check, available since 30 April 2025." },
      npa: {
        label: "National Police Agency: 2025 figures",
        note: "Romance scams that begin online (the NPA's “SNS-type” category): 5,645 cases, ¥54.64 billion. A matching app was the first contact in 1,846 cases (32.7%), more than any other channel.",
      },
    },
    docsTitle: "Docs",
    docs: {
      readme: { label: "README", note: "Overview, diagrams, contracts, what we made before the event." },
      demo: { label: "Demo walkthrough", note: "The three-minute run, step by step, with what to say." },
      aiUsage: { label: "AI usage", note: "What Claude Code generated and what the team did." },
    },
    recipeTitle: "A three-minute check",
    recipe: [
      "Laptop: open the hub and click Issuing counter. Phone: scan the QR code and save the certificate. Any Google account works.",
      "Phone: open Mingle, tap Identity & verification, then Verify with DAS Busters, and share.",
      "When the badge appears, tap Recorded on Sepolia to open the transaction. For a readable view, open the registry on Blockscout, a public blockchain explorer (link below): it shows each record call and its event decoded. Etherscan shows the same data as raw hex.",
      "The event holds three numbers: the nullifier, and which app asked and which request, both hashed{{ (SingleStatusVerified: nullifierHash, scopeHash, requestHash)}}. No name, no birth date.",
      "Go back to Choose what to share and share again. Same certificate, same nullifier, so the contract refuses it and Mingle shows an error.",
    ],
  },

  qa: {
    title: "FAQ",
    lede: "Open a question for the short answer, then the specifics and the limits.",
    figs: {
      onchain: {
        label: "What the blockchain keeps for one sign-up",
        stored: ["Anonymous number (nullifier)", "Which app asked (hashed)", "Which request (hashed)"],
        never: ["Name", "Birth date", "Address", "Certificate"],
      },
      server: {
        label: "Your phone makes the proof and sends only the proof to Mingle. Our server steps in only if the phone can't finish, and saves nothing.",
        phone: "Your phone",
        makes: "makes the proof",
        server: "Our server",
        keeps: "backup only · saves nothing",
        mingle: "Mingle",
        send: "only if the phone can't",
        back: "proof",
        onward: "proof only",
      },
      borrow: {
        label: "A certificate works only with its owner's key.",
        cert: "Ken's certificate",
        bound: "signed with a fingerprint of Ken's key",
        own: "Ken's key",
        other: "Someone else's key",
        ok: "Proof made",
        no: "No proof",
      },
      checks: {
        label: "Mingle's server checks first, then the contract checks again in public.",
        first: "Mingle's server checks",
        firstNote: "Fast answer, clear error",
        second: "The contract checks again",
        secondNote: "In public. Refuses a number it already has",
        stored: "One anonymous number stored",
      },
    },
    groups: [
      {
        title: "Your data",
        items: [
          {
            id: "onchain",
            q: "Does my name end up on the blockchain?",
            a: "No. The blockchain keeps one anonymous number per sign-up. Your name, birth date and address are never sent there.",
            d: "To be exact, the contract stores the nullifier, and its event adds which app asked and which request, both hashed{{ (scopeHash, requestHash)}}. The transaction input also shows the proof's ten public numbers. Those include the city office's public key and, only if you chose to share them, the Tokyo code (13) and the birth-year range.",
          },
          {
            id: "mingle",
            q: "What does Mingle learn about me?",
            a: "Only what you chose to prove: that you are single, and if you like, that you live in Tokyo and are in your 30s. Mingle never gets the certificate.",
            d: "Mingle also keeps the nullifier and a link to the Sepolia transaction. “30s” means the birth year is between 1987 and 1996, so Mingle never learns the exact year. Only the birth year is signed, not the full date.",
          },
          {
            id: "server",
            q: "Does my certificate leave my phone?",
            a: "Not normally. Your phone makes the proof itself, and only the proof goes to Mingle. If your phone can't finish, our server makes that one proof, the screen tells you, and the server saves nothing.",
            d: "The phone runs the proof in the browser with the same circuit files as the server. The fallback is for device problems such as an old browser or too little memory. A certificate that breaks a rule is refused on the phone and never sent. The wallet's history records where each proof was made. A deployment can also be set to make every proof on the server{{ (PROVE_ON=server)}}; this page then says so at the top.",
          },
          {
            id: "photo",
            q: "Why not just send a photo of the certificate?",
            a: "A photo shows everything on it and is easy to edit. A proof shows one fact, and an edited certificate can't produce one.",
            d: "The circuit checks the city office's signature, so an edited certificate fails. “Where your data lives” above shows what each party ends up with.",
          },
          {
            id: "japan",
            q: "Japan already checks single status with the My Number Card. Why build this?",
            a: "Tapple, a Japanese dating app, reads the name, address and gender on your My Number Card (Japan's national ID card) and gets your marital status from the family register, so the app ends up holding your verified identity next to your marital status. DAS Busters gives the app one checked fact and a number that differs per app.",
            d: "Tapple has offered it (かんたん独身証明) since 30 April 2025, through Mynaportal, the government's online portal, and the Digital Agency wrote about it on 17 October 2025. Both are linked under Check it. The issuer could be Mynaportal instead of our demo city office, and the proof side would stay the same.",
          },
          {
            id: "tracking",
            q: "Could two apps work out that I'm the same person?",
            a: "No. Each app gets a different anonymous number for you, so their records don't match.",
            d: "The number is a hash of your secret key and the app's name{{: nullifier = Poseidon(holder secret, scope), scope = Poseidon(“mingle”, epoch)}}. The demo has only Mingle, so this follows from the design rather than something you can try here.",
          },
        ],
      },
      {
        title: "Cheating",
        items: [
          {
            id: "fake",
            q: "Could someone edit a certificate, or make a fake one?",
            a: "No. The city office's signature covers every value, so an edited or home-made certificate can't produce a proof.",
            d: "The circuit checks the signature against the city office's public key, and that key is one of the proof's public numbers. Mingle's server and the contract accept only the published key{{ (lib/zk/issuer-public.json)}}, which is fixed in the contract. The signed message is a hash of the single flag, birth year, prefecture code, issue date and your key's fingerprint{{: Poseidon(isSingle, birthYear, residenceCode, issuedAt, holderCommitment)}}, and the circuit also requires the single flag to be set{{ (isSingle = 1)}}.",
          },
          {
            id: "borrow",
            q: "Could someone borrow another person's certificate?",
            a: "No. A certificate is signed together with a fingerprint of its owner's key, and making a proof needs the key itself.",
            d: "The key comes from a signature by the embedded wallet of the Google account that saved the certificate. Limit: in the demo the counter hands Ken's certificate to anyone who scans, so any Google account can pick one up. A real city office would check ID at the counter first.",
          },
          {
            id: "accounts",
            q: "Could one person open several Mingle accounts?",
            a: "Not with the same certificate. It produces the same anonymous number every time, and the contract refuses a number it already has.",
            d: "Try it: go Back and share again, and the contract refuses it{{ with NullifierAlreadyUsed}}. Limits: this check lives on-chain, so it needs the Sepolia mode. In the demo, the app name that goes into the number also carries a random value that Mingle's browser keeps{{ (scope = Poseidon(“mingle”, epoch))}}, so the demo's Reset makes a new number; a real Mingle would keep it fixed. A different Google account makes a different key, so one account per person also needs the city office to issue one certificate per person. World ID could help once its check is tied to the certificate and repeat World IDs are refused; this demo does neither yet.",
          },
          {
            id: "replay",
            q: "Could someone copy a proof they saw and reuse it?",
            a: "Not for another request. Each proof is tied to the one request it answers, and its anonymous number can be recorded only once.",
            d: "Mingle's request carries a random number used once{{ (a nonce)}}, and its hash is one of the proof's public numbers{{ (requestHash = Poseidon(nonce))}}. The result must carry the number Mingle saved. Limits: the server does not mark a request as used, so within its 10 minutes the same proof can be verified again; on Sepolia its nullifier is still recorded only once. Anyone can send a proof to the contract{{ (record() is open)}}, and only Mingle's server checks which app and which request a proof answers.",
          },
        ],
      },
      {
        title: "Trust and limits",
        items: [
          {
            id: "chain",
            q: "Your server already checks the proof. Why use a blockchain?",
            a: "So the final check happens in public. Anyone can re-run the contract's check and see every number it has accepted, without trusting our server.",
            d: "Mingle's server checks first, for a fast answer and a clear error. The contract then checks the proof again and refuses a nullifier it has already stored, so a second account at the same app fails even if someone goes around Mingle's server. Limit: the contract does not check which app a proof was made for{{ (scopeHash)}}. In the demo, Mingle's browser adds a random value to the app name{{ (the epoch)}}, so wiping Mingle's data gives a new nullifier; a real Mingle would keep it fixed.",
          },
          {
            id: "married",
            q: "What if I marry after getting the certificate?",
            a: "Today the proof doesn't check when the certificate was issued. Marriage agencies and apps such as youbride accept only certificates issued in the last three months, so this is the next thing to add.",
            d: "The issue date is already signed into the certificate. Mingle could send an “issued on or after” date as one of the proof's public numbers{{ (a public input)}}, and the circuit would compare the two. That needs a new circuit key and a redeploy of both contracts, so it is not part of this demo. Revocation would also need the city office to publish withdrawn certificates.",
          },
          {
            id: "setup",
            q: "Is the proof system's setup safe for real use?",
            a: "Not yet. Groth16 needs a one-time setup, and we ran ours alone on one machine. A real launch needs a ceremony with many independent people.",
            d: "The setup creates secret randomness, and whoever knows all of it could forge proofs. With many independent contributors, one honest contributor is enough. At the event the public Hermez setup files returned 403, so each phase of ours has one local contribution. The PSE Perpetual Powers of Tau files are reachable, and moving to them is the next step.",
          },
          {
            id: "key",
            q: "What if the city office's signing key leaks?",
            a: "In this demo the private key sits in the demo server's environment, only so the whole demo runs from one site. The repository holds only the public key. A leak would mean deploying a new registry with a new key.",
            d: "The registry's issuer key is immutable, which keeps it simple to audit. A real city office would keep its key in its own hardware security module and publish the public key in a list of trusted issuers that can be updated. Architecture shows the intended split.",
          },
          {
            id: "worldid",
            q: "Is the World ID check real?",
            a: {
              simulated: "No. In this deployment the human check is simulated, and the app labels it that way everywhere.",
              "idkit-staging": "The integration is real, the person is not. It runs on World ID staging, where the World ID Simulator stands in for World App with a test identity.",
              idkit: "Yes. World's Developer Portal checks each World ID proof before our server accepts it.",
            } satisfies Record<Modes["worldId"], string>,
            d: {
              simulated:
                "The camera opens for five seconds and no World ID proof is made. The World ID integration is built: it runs on World ID staging when its keys are set and the staging window is open. World ID adds “a person approved this request”, which a certificate alone cannot show.",
              "idkit-staging":
                "Our server signs each IDKit request and forwards the result to World's Developer Portal. Mingle counts the check only with the signed token our server issues after that. Limits: that token travels next to the ZK proof, not inside it, lasts seven days and is not yet tied to the certificate, and the World ID nullifier is not yet checked for repeats.",
              idkit:
                "Our server signs each IDKit request and forwards the result to World's Developer Portal. Mingle counts the check only with the signed token our server issues after that. Limits: that token travels next to the ZK proof, not inside it, lasts seven days and is not yet tied to the certificate, and the World ID nullifier is not yet checked for repeats.",
            } satisfies Record<Modes["worldId"], string>,
          },
          {
            id: "gov",
            q: "Is this real government data?",
            a: "No. Ken Sato is fictional, and our server plays the city office with a demo key.",
            d: "The paper certificate is real: the city office of your registered domicile issues 独身証明書 for 200–350 yen, and marriage agencies ask for it. A real launch would need the city office, or Mynaportal, to issue a digital version and hold the signing key.",
          },
        ],
      },
      {
        title: "Using it",
        items: [
          {
            id: "fees",
            q: "Do I need crypto or have to pay fees?",
            a: "No. You sign in with Google, and our server wallet pays the Sepolia fees.",
            d: "The embedded wallet signs one message to make your key. It never sends a transaction or needs ETH.",
          },
          {
            id: "speed",
            q: "How long does it take?",
            a: "Your phone first downloads 7.7 MB of circuit files, then makes the proof. Recording it on Sepolia waits for one block, which usually takes 10 to 20 seconds.",
            d: "On a laptop in Chrome the proof itself took under a second once the files were cached. We have not measured phones yet. The server waits up to 45 s for the Sepolia receipt. After that, Mingle shows the badge with a note that the transaction is not confirmed yet, and keeps checking for about two minutes.",
          },
          {
            id: "sepolia",
            q: "Why Sepolia and not Ethereum mainnet?",
            a: "It is a public test network, so the demo is free and anyone can inspect it.",
            d: "The RPC URL and the registry address come from the environment, but the code knows only Sepolia and a local chain today, and the Etherscan link is fixed to Sepolia. Moving to another chain such as World Chain means adding that chain, then redeploying the plain-Solidity contracts.",
          },
          {
            id: "before",
            q: "What was made before the event?",
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
