# AI usage

English | [日本語](AI_USAGE.ja.md)

ETHGlobal asks teams to say where and how they used AI tools. We keep this file current as we build.

## Tools

We used Claude Code (Claude Opus 5.5) in the terminal. Every commit in this repository was made with Claude Code and carries its `Co-Authored-By: Claude` trailer, so the trailer does not separate its part from ours. The tables below do that, area by area.

## Planning files

The spec and planning files are in the repository, as the rules require:

| File | What it is |
|---|---|
| [docs/plan.md](docs/plan.md) | The build plan. Claude Code drafted it in plan mode from our chat log, mockups and prototype notes. We reviewed it and settled the open questions (rules, chain, repository). |
| [AGENTS.md](AGENTS.md) | Project rules for the coding agent. `CLAUDE.md` links to this file. |
| [.claude/skills/](.claude/skills/) | Task guides the agent loads. |

About the skills:

- `eth-security` and `eth-testing` come from [ethskills.com](https://ethskills.com). We removed a few links that do not apply here.
- `zk-circuits` and `local-dev` are our own notes. Claude Code wrote them from pitfalls we hit in the pre-event spike.

## What Claude Code did

| Area | Files | Involvement |
|---|---|---|
| Project setup | `package.json`, `tsconfig.json`, `next.config.ts`, `vercel.json` | Generated; we reviewed |
| Demo hub and routes | `app/` | Generated from our screen designs |
| API and mock prover | `app/api/`, `lib/` | Generated from the data flow in the plan |
| Screens | `app/counter/`, `app/wallet/`, `app/mingle/`, `components/` | Generated from our Figma designs |
| Circuit and setup | `circuits/`, `public/zk/`, `lib/zk/` | Generated from the rules in the plan; the build script is based on pitfalls from our pre-event spike |
| Groth16 prover, EdDSA issuer | `lib/prover.ts`, `lib/groth16.ts`, `lib/issuer.ts` | Generated |
| Registry contract and tests | `contracts/src/SingleProofRegistry.sol`, `contracts/test/`, `contracts/script/` | Generated; checked with the eth-security checklist and slither |
| On-chain recording | `lib/chain.ts`, `app/api/tx/`, `app/mingle/TxStatus.tsx` | Generated |
| Google sign-in and holder key | `app/wallet/_components/`, `lib/privy.ts` | Generated; the team set up Privy and Google OAuth and found the stuck-button bug by signing in on production |
| Smoke test | `scripts/smoke.ts` | Generated, including the refusal cases |
| Unit, circuit and contract tests | `scripts/unit-test.ts`, `scripts/circuit-test.ts`, `contracts/test/SingleProofRegistry.t.sol`, the `test` scripts in `package.json` | Generated. They cover the wallet's proof rules, Mingle's checks on the public signals, the committed circuit with a good certificate and tampered ones, and the registry refusing public signals pushed out of the field |
| Internationalisation (English/Japanese) | `lib/i18n/`, `components/LanguageToggle.tsx`, `middleware.ts`, `README.ja.md`, `AI_USAGE.ja.md` | Generated; the team asked for English-first with Japanese as an option |
| One-step demo reset | `app/reset/`, `lib/storage.ts` | Generated |
| World ID (IDKit 4) | `lib/worldid.ts`, `app/api/world-id/`, `app/wallet/world-id/`, `scripts/world-staging.ts` | Generated. Claude Code also set up the Developer Portal app and action through Claude in Chrome and ran the first test against the World ID Simulator; the team created the Portal account and API key |
| Privacy policy page | `app/privacy/` | Drafted from what the code actually stores; needed to open Google sign-in to any account |
| How-it-works explainer | `app/how-it-works/`, `lib/i18n/how-it-works/` | Drafted from the code, the circuit, the contract and the README diagrams, then fact-checked against the code; later reworked to lead with pictures, with a Plain/Engineer switch for the technical detail and an FAQ. The team asked for a page that explains the app from the basics and is readable without a technical background |
| Move to das-busters.vercel.app | Vercel domains, Google Cloud and Privy settings, the GitHub repository name, `docs/setup.md` | Claude Code added the domain and the redirect with the Vercel CLI, updated Google Cloud and Privy through Claude in Chrome, and renamed the repository with the GitHub CLI; the team chose the new names |
| Proving on the phone | `lib/deviceProver.ts`, `lib/statement.ts`, `app/wallet/share/ShareScreen.tsx`, `lib/modes.ts` | Generated. Claude Code moved the circuit rules into a module the browser can load, ran snarkjs in the browser with the server as a labelled fallback, and added `PROVE_ON` to switch back without new code |
| Contract source verification | Sourcify, `docs/setup.md` | Claude Code exported the standard JSON input with forge and sent it to the Sourcify v2 API after forge's own upload failed, then checked the exact match. The team decided Etherscan verification was not needed |
| Review fixes in the app | `app/page.tsx`, `app/counter/`, `app/wallet/`, `app/mingle/`, `lib/chain.ts`, `lib/i18n/` | Claude Code reviewed the app against the code and rewrote copy that claimed more than the code does (World ID uniqueness, what Mingle receives), numbered the hub's steps, made the no-phone link readable, and added a way to recover from a used nullifier without losing the certificate |
| README and explainer rework | `README.md`, `README.ja.md`, `docs/demo.md`, `docs/setup.md`, `app/how-it-works/`, `lib/i18n/how-it-works/` | Claude Code checked the docs against the code and against public sources (city office pages, youbride, IBJ, the Digital Agency, the National Police Agency, World's docs), then rewrote the README around the problem, what is real and what is a stand-in, the limits, and the tests. The team asked for everything to be explained in full with less of an AI-generated feel, and for a note that the city office's signing key sits on the demo server only for the demo, with the layout of a real deployment |
| Final demo polish | `components/ProgressSteps.tsx`, `app/wallet/save/`, `app/wallet/share/`, `app/wallet/world-id/`, `app/wallet/_components/`, `app/mingle/`, `app/how-it-works/basics/`, `docs/technical.md`, `docs/demo.md` | Claude Code ran the demo in a headless browser and changed what confused people: the save now starts right after Google sign-in and shows its three steps, World ID runs on the screen that asks for it, sharing shows the real proving time and the Sepolia wait, and Mingle's extra confirm dialog is gone. It split the README into a short page and `docs/technical.md`, and the explainer's basic terms into their own page. The team pointed out the confusing World ID return and sign-in buttons, and asked that the real World ID, proof and Sepolia steps stay real rather than be mocked |
| Integration debrief | `FEEDBACK.md`, `FEEDBACK.ja.md` | Drafted from the git history, the code comments and the setup notes |
| Docs | `README.md`, `AI_USAGE.md`, `AGENTS.md`, `docs/demo.md`, `docs/setup.md` | Drafted, including the Mermaid diagrams in the README (checked against the circuit, the contract and the API routes); we edited |

## What the team did

- **Idea and research**: the idea, the problem research and the pitch.
- **Design**: the screen designs and the user flow, in Figma, before the event.
- **Decisions**: architecture choices, such as what goes on-chain, which chain, and where the proof is generated.
- **Review and testing**: code review and testing on real phones.
- **Accounts and demo**: setup of the external services, and the demo video.
