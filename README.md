# DAS Busters

Show a dating app that you are single, and nothing else.

Built at ETHGlobal Tokyo 2026.

## The problem

People on dating apps lie about being single. An official certificate from the city office would settle it. But sending a copy to a dating app hands over your full name, birth date and address to a company you just met.

## What we are building

- **Issuing counter**: the city office screen shows a QR code. Scanning it puts a signed Single Status Certificate on your phone.
- **DAS Busters**: a wallet that keeps the certificate on your phone. When an app asks, you pick what to prove:
  - that you are single (required)
  - that you live in Tokyo (optional)
  - that you are in your 30s (optional)
- **Mingle**: a sample dating app. It checks the proof and shows a "Single status verified" badge on your profile.

The proof is a zero-knowledge proof (circom, Groth16). Ethereum stores only the verifier contract and one nullifier per verification. No personal data goes on-chain.

## Status

We are building this during the hackathon. The build plan is in [docs/plan.md](docs/plan.md) (Japanese).

Live demo: https://single-proof.vercel.app

| Piece | State |
|---|---|
| Demo hub and routes | done |
| Screens and full flow with a mock prover | done |
| Zero-knowledge proof | in progress |
| On-chain verification on Sepolia | planned |
| Google sign-in through Privy | planned |
| World ID | planned |

## Made before the event

The ETHGlobal rules ask us to separate earlier work from event work. This existed before hacking started:

- **Idea and pitch**: the idea, the pitch deck and the problem research.
- **Screen designs**: Figma mockups of every screen, plus a clickable front-end mock we used to film the pitch.
- **Technical spike**: a local prototype to check that a circom proof could be generated and verified on a local chain.
- **Brand assets**: the DAS Busters logo, the Mingle icon and the sample profile photo.

None of the earlier code is in this repository. We used the mockups as the visual reference. Everything in this repository was written during the event.

## AI usage

We used Claude Code throughout the build. [AI_USAGE.md](AI_USAGE.md) lists what it did, area by area, and what the team did.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. The dev server listens on all interfaces, so a phone on the same Wi-Fi can open `http://<your-ip>:3000`.
