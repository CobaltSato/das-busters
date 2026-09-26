# AI usage

English | [日本語](AI_USAGE.ja.md)

ETHGlobal asks teams to say where and how they used AI tools. We keep this file current as we build.

## Tools

We used Claude Code (Claude Opus 5.5) in the terminal. Commits it helped write carry a `Co-Authored-By: Claude` trailer, so `git log` shows its part commit by commit.

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
| Demo hub and placeholder routes | `app/` | Generated from our screen designs |
| API and mock prover | `app/api/`, `lib/` | Generated from the data flow in the plan |
| Screens | `app/counter/`, `app/wallet/`, `app/mingle/`, `components/` | Generated from our Figma designs |
| Circuit and setup | `circuits/`, `public/zk/`, `lib/zk/` | Generated from the rules in the plan; the build script is based on pitfalls from our pre-event spike |
| Groth16 prover, EdDSA issuer | `lib/prover.ts`, `lib/groth16.ts`, `lib/issuer.ts` | Generated |
| Registry contract and tests | `contracts/src/SingleProofRegistry.sol`, `contracts/test/`, `contracts/script/` | Generated; checked with the eth-security checklist and slither |
| On-chain recording | `lib/chain.ts`, `app/api/tx/`, `app/mingle/TxStatus.tsx` | Generated |
| Google sign-in and holder key | `app/wallet/_components/`, `lib/privy.ts` | Generated; the team set up Privy and Google OAuth and found the stuck-button bug by signing in on production |
| Smoke test | `scripts/smoke.ts` | Generated, including the refusal cases |
| Internationalisation (English/Japanese) | `lib/i18n/`, `components/LanguageToggle.tsx`, `middleware.ts`, `README.ja.md`, `AI_USAGE.ja.md` | Generated; the team asked for English-first with Japanese as an option |
| One-step demo reset | `app/reset/`, `lib/storage.ts` | Generated |
| World ID (IDKit 4) | `lib/worldid.ts`, `app/api/world-id/`, `app/wallet/world-id/`, `scripts/world-staging.ts` | Generated. Claude Code also set up the Developer Portal app and action through Claude in Chrome and ran the first test against the World ID Simulator; the team created the Portal account and API key |
| Privacy policy page | `app/privacy/` | Drafted from what the code actually stores; needed to open Google sign-in to any account |
| Docs | `README.md`, `AI_USAGE.md`, `AGENTS.md`, `docs/demo.md` | Drafted, including the Mermaid diagrams in the README (checked against the circuit, the contract and the API routes); we edited |

## What the team did

- **Idea and research**: the idea, the problem research and the pitch.
- **Design**: the screen designs and the user flow, in Figma, before the event.
- **Decisions**: architecture choices, such as what goes on-chain, which chain, and where the proof is generated.
- **Review and testing**: code review and testing on real phones.
- **Accounts and demo**: setup of the external services, and the demo video.
