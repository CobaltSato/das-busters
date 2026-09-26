// English strings. This file defines the shape; ja.ts must match it.

// Server errors arrive in English with a code. Only translations need an
// entry here, so English leaves the map empty and shows the server's text.
// Templates use {name} placeholders filled from the error's params.
type Lookup = Partial<Record<string, string>>;

const en = {
  dateLocale: "en-GB",
  language: "Language",

  common: {
    back: "Back",
    close: "Close",
    cancel: "Cancel",
    continue: "Continue",
    somethingWrong: "Something went wrong",
    storageBlocked: "This browser blocked storage. Turn off private browsing and try again.",
    openCounter: "Open the counter screen",
    openMingle: "Open Mingle",
    backToMingle: "Back to Mingle",
  },

  meta: {
    description: "Show a dating app that you are single, and nothing else.",
    counterTitle: "Certificate pickup · Shibuya City",
  },

  hub: {
    title: "DAS Busters demo",
    lede: "Prove you are single to a dating app without handing over your certificate.",
    apps: {
      counter: {
        device: "Desktop / iPad",
        title: "Issuing counter",
        body: "The city office screen. It shows a QR code for picking up a Single Status Certificate.",
      },
      wallet: {
        device: "Phone",
        title: "DAS Busters",
        body: "Keeps the certificate on your phone and shares only the facts you choose.",
      },
      mingle: {
        device: "Phone",
        title: "Mingle",
        body: "A dating app that asks for proof of single status before showing the badge.",
      },
    },
  },

  modes: {
    auth: { mock: "Sign-in: mock", privy: "Sign-in: Google via Privy" },
    prover: { mock: "Proof: mock", groth16: "Proof: Groth16" },
    chain: { off: "Verified off-chain", sepolia: "Recorded on Sepolia" },
    worldId: {
      simulated: "Human check: simulated",
      "idkit-staging": "Human check: World ID staging",
      idkit: "Human check: World ID",
    },
  },

  // Place names and certificate values come from the issuer in English.
  places: {} as Lookup,
  ageRange: (label: string) => label,

  certificate: {
    fullName: "Full name",
    dateOfBirth: "Date of birth",
    maritalStatus: "Marital status",
    issuingAuthority: "Issuing authority",
    dateOfIssue: "Date of issue",
    issuedBy: (issuer: string) => `Issued by ${issuer}`,
    values: {} as Lookup,
  },

  counter: {
    office: "Shibuya City",
    department: "Family Registration and Resident Services",
    serviceCounter: "Service counter",
    title: ["Receive your", "Single Status Certificate"],
    scan: ["Scan the QR code", "with your phone’s camera."],
    qrHeading: "Certificate pickup QR code",
    demo: "Demo",
    qrLabel: "QR code for receiving a Single Status Certificate",
    qrFailed: "Could not draw the QR code. Reload the page.",
    validFor: "Valid for 3 minutes",
    refreshes: "The QR code refreshes automatically when it expires.",
    issued: (when: string) => `Issued: ${when}`,
    system: "DAS Busters Digital Certificate Issuance System",
    preview: "Open the phone flow on this device",
  },

  wallet: {
    problems: {
      scanTitle: "Scan the QR code at the counter",
      scanBody:
        "Your certificate is handed over at the city office. Scan the QR code on the counter screen with your phone’s camera.",
      qrExpired: "This QR code has expired",
      qrInvalid: "This QR code is not valid",
      qrRetry: "Ask the counter to show a new QR code, then scan it again.",
      nothingToSave: "Nothing to save yet",
      nothingToSaveBody: "Scan the QR code at the counter to receive your certificate first.",
      qrExpiredBody:
        "The pickup QR code is valid for three minutes. Ask the counter for a new one and scan it again.",
      noCertificate: "No certificate on this phone",
      noCertificateBody:
        "Receive your Single Status Certificate at the city office counter first, then come back to Mingle.",
      noRequest: "No request to answer",
      noRequestBody: "Open Mingle and choose Verify with DAS Busters to start.",
      requestExpired: "This request has expired",
      requestInvalid: "This request is not valid",
      requestRetry: "Go back to Mingle and start the verification again.",
    },

    home: {
      openAccount: "Open account",
      title: "My proofs",
      empty: "No certificate on this phone yet. Scan the QR code at the city office counter to receive one.",
      humanTitle: "Human check",
      worldId: "World ID",
      worldIdSimulated: "World ID · simulated",
      worldIdStaging: "World ID · staging (Simulator)",
      done: "Done",
      optional: "Optional",
      humanComplete: "Human check complete",
      humanPitch: "Show apps that a real, unique person holds this certificate. Sharing it is always up to you.",
      verifyWorldId: "Verify with World ID",
      account: "Account",
      notSignedIn: "Not signed in",
      signedInGoogle: "Signed in with Google",
      signedInGoogleDemo: "Signed in with Google (demo account)",
      connectedServices: "Connected services",
      notConnected: "Not connected",
      sharedSingle: "Shared single status",
      sharedSingleWith: (extras: string) => `Shared single status, ${extras}`,
      livesIn: (place: string) => `lives in ${place}`,
      listSeparator: ", ",
      reset: "Reset demo (DAS Busters and Mingle)",
      signOut: "Sign out",
    },

    human: {
      verifiedWorldId: "Verified with World ID",
      verifiedWorldIdStaging: "World ID staging · a Simulator identity, not a real person",
      simulatedShort: "Simulated for the demo · not a World ID proof",
    },

    google: {
      continueWith: "Continue with Google",
      continueAs: (name: string) => `Continue as ${name}`,
      connecting: "Connecting…",
      dialogLabel: "Sign in with Google",
      signingIn: "Signing in…",
      connectingAccount: "Connecting your Google account",
      chooseAccount: "Choose an account",
      toContinue: "to continue to DAS Busters",
      anotherAccount: "Use another account",
      privacy: "Google will share your name, email address, and profile picture with DAS Busters.",
      didNotFinish: (code: string) => `Google sign-in did not finish (${code}). Try again.`,
      fallbackName: "Google user",
    },

    receive: {
      title: ["Receive your", "certificate"],
    },

    save: {
      signedInAs: (name: string) => `Signed in as ${name}`,
      signedIn: "Signed in",
      title: "Save to this device",
      lede: ["Access and present your certificate", "anytime in DAS Busters."],
      preparingKey: "Preparing your key…",
      saving: "Saving…",
      save: "Save certificate",
      finePrint: "Stored only on this device.",
      storeFailed: "This browser would not let us store the certificate. Turn off private browsing and try again.",
      keyTimeout: "Setting up your key took too long. Check your connection and try again.",
    },

    saved: {
      title: "Certificate saved",
      body: "You can access it anytime from Home.",
      opening: "Opening home…",
      goHome: "Go to home",
    },

    share: {
      title: "Choose what to share",
      lede: "Only the selected information will be shared.",
      shareWith: "Share with",
      single: "Single status",
      singleSub: "Verified by a Single Status Certificate",
      required: "Required",
      singleRequired: "Single status (required)",
      livesIn: (place: string) => `Lives in ${place}`,
      residenceSub: "Verified from residence information",
      ageRange: (range: string) => `Age range: ${range}`,
      ageSub: "Verified from date of birth",
      includeHuman: "Include human check",
      addHuman: "Add a human check",
      worldIdOptional: "World ID · optional",
      checkNow: "Check now",
      privacy: "Your name, date of birth, and original certificate won’t be shared.",
      proving: "Creating proof…",
      recordingSepolia: "Recording on Sepolia…",
      checkingWith: (verifier: string) => `Checking with ${verifier}…`,
      submit: "Share selected information",
    },

    selfie: {
      storeFailed: "Could not save the result. Turn off private browsing and try again.",
      cameraFailed: "Camera access was not available. Allow camera access and try again.",
      complete: "Human check complete",
      completeBody: "Simulated for the demo. No World ID verification was performed.",
      title: "Human check",
      subtitle: "World ID Selfie Check · simulated",
      lookAtCamera: "Look at the camera",
      ready: "Ready for a quick camera check?",
      closesSoon: "The camera closes by itself in five seconds.",
      opensFor: "The front camera opens for five seconds. Nothing is uploaded or saved.",
      openingCamera: "Opening camera…",
      checking: "Checking…",
      openCamera: "Open camera",
      openIphoneCamera: "Open iPhone camera",
      finePrint: "Simulated for the demo. This does not create a World ID proof.",
    },

    worldId: {
      title: "Human check",
      subtitle: "World ID",
      subtitleStaging: "World ID · staging",
      intro: "Show apps that a real, unique person holds this wallet. World ID shares no name, face or ID number.",
      introStaging:
        "This demo uses World ID staging. You approve the request in the World ID Simulator, which stands in for World App with a test identity.",
      start: "Verify with World ID",
      preparing: "Preparing the request…",
      scanTitle: "Scan with World App",
      scanBody: "Scan the code with World App, or open World App on this phone.",
      scanTitleStaging: "Approve in the World ID Simulator",
      scanBodyStaging:
        "Open the request in the World ID Simulator and approve it there, or scan this code with the Simulator's camera.",
      qrLabel: "QR code for the World ID request",
      openWorldApp: "Open World App",
      openSimulator: "Open in World ID Simulator",
      copyLink: "Copy link",
      copied: "Link copied",
      copyFailed: "Could not copy. Scan the code instead.",
      waiting: "Waiting for the request to be opened…",
      confirming: "Waiting for approval…",
      verifying: "Checking with World ID…",
      failed: (code: string) => `World ID did not finish (${code}). Try again.`,
      tryAgain: "Try again",
      cancel: "Cancel",
      complete: "Human check complete",
      completeBody: "World ID confirmed that a unique person approved this request.",
      completeBodyStaging:
        "World ID staging confirmed the request. The identity came from the Simulator, so this is a test, not a real person.",
      storeFailed: "Could not save the result. Turn off private browsing and try again.",
      finePrint: "DAS Busters receives a yes, plus an anonymous code that only works for this app.",
    },
  },

  mingle: {
    verified: "Single status verified",
    foreignResult: "This result is for a request Mingle did not send. Start the verification again.",
    unreadableResult: "The verification result could not be checked. Start the verification again.",
    settings: "Settings",
    photoAlt: (name: string) => `${name}’s profile photo`,
    editProfile: "Edit profile",
    activity: "Activity",
    likes: "Likes",
    matches: "Matches",
    views: "Views",
    identityVerification: "Identity & verification",
    identityVerified: "Identity verified",
    help: "Help",
    mainNav: "Main",
    discover: "Discover",
    messages: "Messages",
    profile: "Profile",
    badgeVerified: "✓ Single status verified",
    livesIn: (place: string) => `Lives in ${place}`,
    human: "✓ Human",
    proof: {
      shared: "Shared",
      single: "Single",
      livesIn: (place: string) => `lives in ${place}`,
      listSeparator: ", ",
      proof: "Proof",
      zk: "Zero-knowledge (Groth16)",
      mock: "Mock proof",
      checked: "Checked",
      offChain: "Off-chain by Mingle",
      human: "Human check",
      humanWorldId: "World ID",
      humanStaging: "World ID staging · Simulator identity",
      humanSimulated: "Simulated for the demo",
      nullifier: "Nullifier",
      neverReceived: "Mingle never received your name, birth date or address.",
      viewOnProfile: "View on profile",
    },
    checks: {
      identity: "Identity check",
      verified: "Verified",
      notVerified: "Not verified",
      identityBody: "Your identity has been verified using a government-issued ID.",
      single: "Single status",
      singleBody: "Use an official certificate to show your single status on your profile.",
      connect: "Verify with DAS Busters",
      income: "Income",
      incomeBody: "Verify your income to give potential matches more confidence in your profile.",
    },
    connectTitle: "Connect DAS Busters?",
    connectBody: "Open DAS Busters to verify your single status.",
    backToWallet: "Back to DAS Busters",
    reset: "Reset demo (DAS Busters and Mingle)",
    helpBody: "You can connect a Single Status Certificate under Identity & verification.",
    helpMuted:
      "Mingle never sees the certificate itself. DAS Busters sends a proof that you are single, plus anything else you choose to share.",
    profileData: {
      city: "Tokyo",
      bio: "I enjoy exploring cafés and taking walks on my days off.",
    },
    // Keyed by the code lib/chain.ts puts in the result.
    chainNotes: {
      "rpc-unreachable": "Sepolia could not be reached, so Mingle checked the proof off-chain only.",
      unconfirmed: "Sepolia has not confirmed the transaction yet. The link shows its status.",
    } as Lookup,
  },

  privacy: {
    title: "Privacy policy",
    updated: "Last updated 26 September 2026",
    intro:
      "DAS Busters is a demo built at ETHGlobal Tokyo 2026. The certificate, the city office and Mingle are fictional. Please do not upload real personal documents.",
    privyLink: "Privy's privacy policy",
    contactLink: "Open an issue on GitHub",
    sections: {
      google: {
        heading: "Google sign-in",
        body: "When you continue with Google, Privy, our sign-in provider, receives your name, email address and profile picture from Google and creates an embedded wallet for you. DAS Busters keeps your name and email in this browser to show who is signed in. Our server does not store them. Privy handles this data under its own policy.",
      },
      certificate: {
        heading: "Certificate and holder key",
        body: "The demo certificate and your holder key are stored only in this browser. The server reads the certificate for a single proving request and does not keep it.",
      },
      shared: {
        heading: "What Mingle and the blockchain receive",
        body: "Mingle receives only that you are single, anything else you choose to share, and a nullifier. The nullifier is recorded on the Ethereum Sepolia test network, which is public and cannot be erased. It does not contain your name, birth date or address.",
      },
      camera: {
        heading: "Camera",
        body: "The human check opens the front camera for five seconds. Nothing is uploaded or saved.",
      },
      hosting: {
        heading: "Hosting and cookies",
        body: "Vercel hosts this site and may keep standard request logs, such as IP addresses. We use no analytics and no advertising. The only cookie we set remembers your language.",
      },
      deletion: {
        heading: "Deleting your data",
        body: "Reset demo clears everything this site stored in your browser. Sign out ends the Privy session. To have your Privy account deleted, contact us.",
      },
      contact: {
        heading: "Contact",
        body: "Questions and deletion requests go to the team through the project's GitHub repository.",
      },
    },
  },

  reset: {
    title: "Reset demo",
    lede: "Clears DAS Busters and Mingle on this device: the saved certificate, the human check, the share history and Mingle's verification.",
    note: "Google stays signed in. Proofs already recorded on Sepolia stay there, and Mingle starts a new epoch, so the next proof gets a new nullifier.",
    done: "Reset. Scan the counter's QR code to start the next run.",
    button: "Reset demo",
    openCounter: "Open the counter",
    backToHub: "Back to the demo hub",
  },

  tx: {
    recorded: (block: string) => `Recorded on Sepolia, block ${block}`,
    failed: "Sepolia transaction failed",
    sent: "Sent to Sepolia",
    recording: "Recording on Sepolia…",
  },

  errors: {} as Lookup,
};

export type Messages = typeof en;
export default en;
