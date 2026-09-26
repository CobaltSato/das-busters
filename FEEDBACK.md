# World ID integration debrief

English | [日本語](FEEDBACK.ja.md)

Notes on adding World ID to DAS Busters at ETHGlobal Tokyo 2026: what we built, how long it took, what slowed us down, and what would help. We built it with Claude Code ([AI_USAGE.md](AI_USAGE.md)).

## What we built

An optional human check in the DAS Busters wallet, shared with the dating app Mingle next to the zero-knowledge proof of single status.

- IDKit 4.3.0 (`@worldcoin/idkit`, `@worldcoin/idkit-core`) with the `proofOfHuman` preset ([app/wallet/world-id/IdkitRequest.tsx](app/wallet/world-id/IdkitRequest.tsx)).
- Our server signs each request's `rp_context` with the RP signing key ([app/api/world-id/rp-context/route.ts](app/api/world-id/rp-context/route.ts)) and forwards each result to the Developer Portal's `/api/v4/verify`, after checking the action and environment ([lib/worldid.ts](lib/worldid.ts)).
- A verified check comes back to the wallet as a token our server signs, and Mingle counts the check only with that token.
- Staging only, with the World ID Simulator. Production is not set up.

Why proof of human, and what Mingle receives, are in the [README](README.md#world-id).

## Timeline

From `git log`, 26 September 2026, JST. These are commit times, not a stopwatch; setting up the app in the Developer Portal does not show in git.

| Time | Commit | What |
|---|---|---|
| 16:29 | `ab28ecd` | Add IDKit 4.3.0 |
| 16:29 | `a59c72d` | Sign requests and verify results on the server; script to open the staging window |
| 16:34 | `1707e16` | Run the wallet's human check through IDKit |
| 16:44 | `c92ef2d` | Fix the staging window script |
| 16:45 | `d009d1e` | Smoke test: a World ID claim without the server's token is refused |
| 16:58 | `e987d88` | Fall back to a labelled simulated check when the staging window closes |
| 17:04 | `53ed7f1` | Demo guide switched to World ID staging, the first commit saying production runs the check with the Simulator |
| 17:29 | `8cbccc3` | Open the Simulator over the screen instead of in a new tab |

Time to first success: about 35 minutes of commit time, from adding IDKit (16:29) to the first commit recording a working Simulator run on production (17:04). Making it work well on a phone took another 25 minutes.

## What slowed us down

**Staging proofs need an open staging window.** The Portal's `/api/v4/verify` answered `403 environment_not_allowed` for Simulator proofs until we opened a 24-hour staging window and sent its token in the `x-staging-verification-token` header. We did not find a way to open the window in the Portal's web pages; we opened it through the Portal's MCP endpoint (`set_world_id_staging_verification`), which needs a team API key ([scripts/world-staging.ts](scripts/world-staging.ts)). Each new window replaces the token, so the deployed token has to be updated and the app redeployed, and World ID checks fail on production in between ([docs/setup.md](docs/setup.md#world-id-staging-window)). When a window closed during development, every check failed at the Portal, so the server now records when the window closes and switches to a simulated check that says so. Our current window closes on 27 September 2026 at 16:58 JST.

**The Simulator reads a request once.** On a phone the Simulator opened in another tab. After approving, people did not know to come back, and a phone can freeze or reload the waiting tab so the answer never arrives. Closing the Simulator cancels the request, and the next try has to sign a new one. We now open the Simulator over the request screen in an iframe, passing the request as `connect_url`, and the screen moves on by itself when the answer arrives (comments in [IdkitRequest.tsx](app/wallet/world-id/IdkitRequest.tsx)).

**IDKit 4 needs a backend before the first request.** The request carries an `rp_context` signed with the RP key, so we needed a server route and a signing key in env before the widget could open anything. It was straightforward with `signRequest`, but it is the first thing to build.

## What worked well

- `useIDKitRequest` with the `proofOfHuman` preset opened a request with little code.
- `signRequest` from `@worldcoin/idkit-core/signing` makes the `rp_context` in one call.
- The v4 verify response carries the nullifier and the environment, so our server can refuse a proof from the wrong environment.
- The Simulator's `connect_url` parameter let one phone run the whole flow, with no second device.
- The Portal's MCP tool gave us a scriptable way to open the staging window.

## What we did not finish

- The request carries no signal, so the World ID proof is not bound to the certificate or to the zero-knowledge proof. Passing the holder's commitment as the signal and checking it on the server is the next step.
- Our server keeps the World ID nullifier inside its token but does not check it for repeats, although World's docs say the backend must.
- Production with World App.

## What would help

- **The one change with the most impact for us: a longer, self-serve staging window**, opened and extended from the Portal's web pages. A hackathon demo has to keep working for days after the event, and a 24-hour window that needs a script, a token swap and a redeploy is easy to miss.
- A page in the docs on verifying staging proofs: that `/api/v4/verify` refuses them without an open window and the `x-staging-verification-token` header, and how to open the window.
- An error that says the staging window is closed, rather than `environment_not_allowed`.
- A note in the Simulator docs that it reads a request only once, and that opening it in another tab on a phone can lose the answer.
