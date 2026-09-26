# AI usage

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
| Docs | `README.md`, `AI_USAGE.md`, `AGENTS.md` | Drafted; we edited |

## What the team did

- **Idea and research**: the idea, the problem research and the pitch.
- **Design**: the screen designs and the user flow, in Figma, before the event.
- **Decisions**: architecture choices, such as what goes on-chain, which chain, and where the proof is generated.
- **Review and testing**: code review and testing on real phones.
- **Accounts and demo**: setup of the external services, and the demo video.
