# Deployment and outside services

English | [日本語](setup.ja.md)

Where the live demo runs and which outside settings it depends on. No secrets are in this file. Values live in `.env.local` and in Vercel; the key names are in [.env.example](../.env.example).

## Live URL

- Production: https://das-busters.vercel.app
- The old URL, https://single-proof.vercel.app, redirects there with a 308 and keeps the path and query. We moved on 26 September 2026.
- Every push to `main` on GitHub (`CobaltSato/das-busters`, renamed from `single-proof` on 26 September 2026; the old address redirects) deploys to production.

## Services

| Service | What it does here | Settings that matter |
|---|---|---|
| Vercel (team `qdrop-adventures`, project `das-busters`) | Hosting | Domains: `das-busters.vercel.app` serves production; `single-proof.vercel.app` redirects to it (308). Production env needs every key in `.env.example` except `WORLD_PORTAL_API_KEY` (scripts only). `PROVE_ON` and `NEXT_PUBLIC_DEMO_BASE_URL` are optional. |
| Google Cloud (project `single-proof-demo`, OAuth client `das-busters-web`) | The Google account behind Privy sign-in | Consent screen: app name DAS Busters, External, In production. Home page `https://das-busters.vercel.app`, privacy policy `/privacy`. Authorised domains include `das-busters.vercel.app` and `privy.io`. JavaScript origins include `https://das-busters.vercel.app` and `http://localhost:3000`. Redirect URI `https://auth.privy.io/api/v1/oauth/callback`. Scopes are only openid, email and profile, and there is no logo, so Google needs no verification. |
| Privy (app `DAS Busters`, development mode) | Google sign-in and the embedded wallet | Login method: Google only, with the Google Cloud client above as custom credentials. Allowed origins: `http://localhost:3000`, `https://das-busters.vercel.app`, `https://single-proof.vercel.app`. Privy shows the app name to users in its modals and emails. |
| World ID Developer Portal (app `DAS Busters`, action `das-busters-human`) | The optional human check | The RP signer is registered by its address only. No domain settings. Staging needs a 24-hour window; see below. |
| Ethereum Sepolia | The registry that records each verification | Contract addresses are in the [README](../README.md#contracts-on-sepolia). Source verification and the relayer's gas are below. |

Google sign-in works only on the origins above. A laptop address such as `http://192.168.x.x:3000` and Vercel preview URLs are not allowed origins in Privy.

## Changing the URL

1. **Vercel**: add the new domain to the project, then set the old one to redirect to it.
2. **Privy**: add the new origin to Allowed origins. Without it, sign-in fails before Google opens.
3. **Google Cloud**: add the domain to Authorised domains and the origin to the client's JavaScript origins, and point the home page and privacy policy links at it.
4. **Code**: `SITE_HOST` in `lib/i18n/how-it-works/links.ts`, both READMEs and both demo guides.
5. **GitHub**: point the repository homepage (the link in the About box) at the new URL: `gh repo edit CobaltSato/das-busters --homepage <new URL>`.
6. World ID and Sepolia do not depend on the domain.
7. Browser storage belongs to one origin. A certificate saved on the old URL does not show on the new one, so issue a new one.
8. Check: `BASE_URL=<new URL> npm run smoke`, then sign in with Google once.

## Where proofs are made

With `PROVER_MODE=groth16`, the phone makes each proof in the browser and `/api/prove` is only a fallback; the share button says when the server made it. To move proving back to the server, for example if phones struggle on the day, set `PROVE_ON=server` in Vercel and redeploy. No code change is needed. With `PROVER_MODE=mock` the server always proves.

## World ID staging window

The Portal accepts proofs from the World ID Simulator only while a staging window is open. The current window closes on **27 September 2026 at 16:58 JST** (07:58 UTC). After that the server falls back by itself and the hub shows `Human check: simulated`.

To open a new window (needs `WORLD_PORTAL_API_KEY` in `.env.local`):

```sh
npx tsx --env-file=.env.local scripts/world-staging.ts

grep '^WORLDID_STAGING_TOKEN=' .env.local | cut -d= -f2- | tr -d '\n' \
  | npx vercel env add WORLDID_STAGING_TOKEN production --sensitive --force
grep '^WORLDID_STAGING_EXPIRES_AT=' .env.local | cut -d= -f2- | tr -d '\n' \
  | npx vercel env add WORLDID_STAGING_EXPIRES_AT production --sensitive --force

npx vercel redeploy das-busters.vercel.app
```

A new window replaces the token, so World ID checks fail on production until the redeploy finishes. Do not run this during a demo.

## Relayer gas

Mingle's relayer pays for every record on Sepolia. Its address is `0x1EBa59b8b21bA88c7b8137C3738CC646ec09786e`. Send Sepolia ETH there, not mainnet ETH.

One record uses about 305,000 gas, which is about 0.0003 ETH at 1 gwei. On 26 September 2026 at 19:08 JST the balance was 0.994 ETH, enough for about 3,000 records at that price. Sepolia gas prices sometimes rise tenfold, so keep a margin. If the relayer runs out, Mingle checks proofs off-chain and says so on screen.

Check the balance:

```sh
cast balance 0x1EBa59b8b21bA88c7b8137C3738CC646ec09786e --ether --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

## Contract source verification

Both contracts are verified on Sourcify with an exact match (26 September 2026). forge 1.3.5's own Sourcify upload failed for us, so we sent the standard JSON input to the Sourcify v2 API by hand:

```sh
cd contracts
forge verify-contract 0x0400a2Ab2F4F3b13Bfe08FF3e063107DfF31D4E8 \
  src/Groth16Verifier.sol:Groth16Verifier --chain sepolia --show-standard-json-input > verifier-input.json
```

Then `POST https://sourcify.dev/server/v2/verify/11155111/<address>` with a JSON body of `stdJsonInput` (that file), `compilerVersion` (`0.8.37+commit.f401782d`), `contractIdentifier` (`src/Groth16Verifier.sol:Groth16Verifier`) and, optionally, `creationTransactionHash` from `contracts/broadcast/Deploy.s.sol/11155111/run-latest.json`. Do the same for `src/SingleProofRegistry.sol:SingleProofRegistry` at the registry address. `GET https://sourcify.dev/server/v2/contract/11155111/<address>` shows the match.

- Do not edit any `.sol` file before verifying: even a comment changes the metadata hash, and the exact match fails.
- Blockscout shows both contracts as verified without a separate submission, and decodes the registry's calls and events.
- We did not verify on Etherscan, so Etherscan shows the same data as raw hex.
