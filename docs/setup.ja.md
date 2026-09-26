# デプロイと外部サービス

[English](setup.md) | 日本語

本番のデモがどこで動いていて、どの外部設定に頼っているかをまとめています。このファイルに秘密情報は書いていません。値は `.env.local` と Vercel にあり、キー名は [.env.example](../.env.example) にあります。

## 本番 URL

- 本番：https://das-busters.vercel.app
- 旧 URL の https://single-proof.vercel.app は、パスとクエリを保ったまま 308 で本番に転送します。2026年9月26日に移しました。
- GitHub（`CobaltSato/das-busters`。2026年9月26日に `single-proof` から改名し、旧アドレスは転送されます）の `main` に push すると、本番にデプロイされます。

## サービス

| サービス | ここでの役割 | 大事な設定 |
|---|---|---|
| Vercel（チーム `qdrop-adventures`、プロジェクト `das-busters`） | ホスティング | ドメイン：`das-busters.vercel.app` が本番。`single-proof.vercel.app` はそこへ転送（308）。Production の env には `.env.example` のキーがすべて要ります。例外は `WORLD_PORTAL_API_KEY`（スクリプト専用）です。`PROVE_ON` と `NEXT_PUBLIC_DEMO_BASE_URL` は任意です。 |
| Google Cloud（プロジェクト `single-proof-demo`、OAuth クライアント `das-busters-web`） | Privy のログインの裏にある Google アカウント | 同意画面：アプリ名 DAS Busters、External、In production。ホームページは `https://das-busters.vercel.app`、プライバシーポリシーは `/privacy`。承認済みドメインに `das-busters.vercel.app` と `privy.io`。JavaScript 生成元に `https://das-busters.vercel.app` と `http://localhost:3000`。リダイレクト URI は `https://auth.privy.io/api/v1/oauth/callback`。スコープは openid、email、profile だけで、ロゴも上げていないので、Google の審査は要りません。 |
| Privy（アプリ `DAS Busters`、開発モード） | Google ログインと埋め込みウォレット | ログイン方法は Google だけで、上の Google Cloud のクライアントをカスタム認証情報に使っています。Allowed origins は `http://localhost:3000`、`https://das-busters.vercel.app`、`https://single-proof.vercel.app`。アプリ名は Privy のモーダルやメールで利用者に表示されます。 |
| World ID Developer Portal（アプリ `DAS Busters`、action `das-busters-human`） | 任意の人間確認 | RP の署名鍵はアドレスだけを登録しています。ドメインの設定はありません。staging には 24 時間の窓が要ります（下を参照）。 |
| Ethereum Sepolia | 確認ごとに記録するレジストリ | コントラクトのアドレスは [README](../README.ja.md#sepolia-のコントラクト) にあります。ソースの検証と relayer のガス代は下にあります。 |

Google ログインは上に挙げた origin でしか動きません。`http://192.168.x.x:3000` のような PC のアドレスや Vercel の Preview URL は、Privy の allowed origins に入っていません。

## URL を変えるとき

1. **Vercel**：新しいドメインをプロジェクトに足し、古いドメインをそこへ転送する設定にします。
2. **Privy**：新しい origin を Allowed origins に足します。足さないと、Google の画面が開く前にログインが失敗します。
3. **Google Cloud**：ドメインを承認済みドメインに、origin をクライアントの JavaScript 生成元に足し、ホームページとプライバシーポリシーのリンクも新しい URL に向けます。
4. **コード**：`lib/i18n/how-it-works/links.ts` の `SITE_HOST`、README（英日）、デモの手順（英日）。
5. **GitHub**：リポジトリの homepage（About 欄のリンク）を新しい URL に向けます。`gh repo edit CobaltSato/das-busters --homepage <新しい URL>`
6. World ID と Sepolia はドメインに依存しません。
7. ブラウザの保存領域は origin ごとに分かれます。旧 URL で保存した証明書は新しい URL には出てこないので、発行し直してください。
8. 確認：`BASE_URL=<新しい URL> npm run smoke` を流し、Google で1回ログインします。

## 証明を作る場所

`PROVER_MODE=groth16` のときは、スマホがブラウザの中で証明を作り、`/api/prove` は予備です。サーバーが作ったときは共有ボタンにそう出ます。当日スマホでうまくいかないなどでサーバーに戻したいときは、Vercel で `PROVE_ON=server` にして再デプロイします。コードの変更は要りません。`PROVER_MODE=mock` のときは、いつもサーバーが証明します。

## World ID の staging 窓

Portal が World ID Simulator の証明を受け付けるのは、staging の窓が開いている間だけです。今の窓は **2026年9月27日 16:58 JST**（07:58 UTC）に閉じます。閉じたあとはサーバーが自動で切り替え、ハブには `人間確認: シミュレーション` と出ます。

新しい窓を開く手順です（`.env.local` に `WORLD_PORTAL_API_KEY` が要ります）。

```sh
npx tsx --env-file=.env.local scripts/world-staging.ts

grep '^WORLDID_STAGING_TOKEN=' .env.local | cut -d= -f2- | tr -d '\n' \
  | npx vercel env add WORLDID_STAGING_TOKEN production --sensitive --force
grep '^WORLDID_STAGING_EXPIRES_AT=' .env.local | cut -d= -f2- | tr -d '\n' \
  | npx vercel env add WORLDID_STAGING_EXPIRES_AT production --sensitive --force

npx vercel redeploy das-busters.vercel.app
```

新しい窓を開くとトークンが入れ替わるので、再デプロイが終わるまで本番の World ID 確認は失敗します。デモの最中には流さないでください。

## relayer のガス代

Sepolia への記録のガス代は、Mingle の relayer が払います。アドレスは `0x1EBa59b8b21bA88c7b8137C3738CC646ec09786e` です。送るのは Sepolia の ETH で、メインネットの ETH ではありません。

記録1回で約 305,000 gas を使い、1 gwei なら約 0.0003 ETH です。2026年9月26日 19:08 JST の残高は 0.994 ETH で、この価格なら約3,000回分です。Sepolia のガス価格はときどき10倍に跳ねるので、余裕を持たせてください。relayer の残高が尽きると、Mingle は証明をオフチェーンで検証し、画面にそう出します。

残高の確認：

```sh
cast balance 0x1EBa59b8b21bA88c7b8137C3738CC646ec09786e --ether --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

## コントラクトのソース検証

2つのコントラクトは、Sourcify で exact match として検証済みです（2026年9月26日）。forge 1.3.5 に組み込みの Sourcify へのアップロードが失敗したので、標準 JSON 入力を Sourcify v2 の API に手で送りました。

```sh
cd contracts
forge verify-contract 0x0400a2Ab2F4F3b13Bfe08FF3e063107DfF31D4E8 \
  src/Groth16Verifier.sol:Groth16Verifier --chain sepolia --show-standard-json-input > verifier-input.json
```

続けて `POST https://sourcify.dev/server/v2/verify/11155111/<アドレス>` に、`stdJsonInput`（上のファイル）、`compilerVersion`（`0.8.37+commit.f401782d`）、`contractIdentifier`（`src/Groth16Verifier.sol:Groth16Verifier`）、任意で `contracts/broadcast/Deploy.s.sol/11155111/run-latest.json` の `creationTransactionHash` を JSON で送ります。レジストリは `src/SingleProofRegistry.sol:SingleProofRegistry` とレジストリのアドレスで同じことをします。結果は `GET https://sourcify.dev/server/v2/contract/11155111/<アドレス>` で確かめられます。

- 検証の前に `.sol` のファイルを書き換えないでください。コメント1行でもメタデータのハッシュが変わり、exact match になりません。
- Blockscout には別に提出しなくても、両方のコントラクトが検証済みとして表示されます。レジストリの呼び出しとイベントもデコードされます。
- Etherscan では検証していないので、同じ内容が16進数のまま表示されます。
