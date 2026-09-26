# DAS Busters / Single Proof 実装計画（ETHGlobal Tokyo 2026）

> ハッキングを始める前に書いた計画で、当時のまま残しています。World ID の staging 対応、スマホでの証明、テストの形などその後に変えた点は、[README](../README.ja.md) と git log にあります。
> This is the plan we wrote before building, kept as it was. Later changes (World ID staging, proving on the phone, the test setup and more) are in the [README](../README.md) and the git log.

## Context

- **締切**: ETHGlobal Tokyo 2026（9/25〜27）の提出締切は **9/27(日) 09:00 JST**。
- **作るもの**
  - 役所の窓口が「独身証明書」を発行し、本人はそれをスマホに保存する。
  - マッチングアプリ Mingle には「独身であること」だけ（任意で「東京在住」「30代」）を ZK 証明で渡す。
  - チェーンに載るのは検証器と nullifier だけで、個人情報は載らない。ここがピッチの核。
- **dump の位置づけ**
  - `single-proof-demo` が正規デザイン（Next.js 15、英語 UI、ブランド DAS Busters）。中身はすべてモックで、ZK もチェーンも World ID も無く、localStorage だけで動いている。
  - `single-proof` は 9/20 の circom + snarkjs + Foundry プロトタイプ。anvil 上で「サーバーで Groth16 証明 → オンチェーン検証」まで動いていた（証明約 850ms、約 9.5k 制約）。
- **ルール対応（回答済み）**
  - コードは新リポジトリで書き直す。dump は読むだけでコピーしない。
  - 事前制作物（Figma、ロゴ、Mingle アイコン、プロフィール写真）は README と提出フォームで申告し、会場スタッフにも確認する。
  - AI 利用は `AI_USAGE.md` で開示し、コミットに `Co-Authored-By` を残す。計画・spec・スキルもリポジトリに入れる。
  - AI 利用を隠す作業はしない。「丸投げに見えない」ための対策は3つ：小さく刻んだコミット、飾らない文章、チームが自分で説明できるコード。
- **進め方**
  - 最初のゴールは **Vercel に簡易ページを出すこと**。
  - そこから MVP（全画面モック）→ 本物の ZK → Sepolia → Privy/Google → World ID の順に積む。
  - どの段階で止まっても、その時点の Vercel URL でデモできる状態を保つ。
  - 統合の筋書きは「Google ログイン（Privy）→ 埋め込みウォレットの署名で holder 秘密を作る → ZK 証明 → Sepolia の Registry に記録 → World ID で unique human」。

## 決定事項

| 項目 | 決定 |
|---|---|
| リポジトリ | `/Users/user/ethglobal` で `git init`。`dump/` は `.gitignore`・`.vercelignore`・`tsconfig` の exclude に入れる。GitHub は `CobaltSato/single-proof`（public） |
| アプリ構成 | Next.js 15.5 系（正規デザインと同じ）の App Router + TypeScript + 素の CSS。1プロジェクトの中で URL ごとに2アプリ＋窓口に分ける。API は Route Handler。npm、`save-exact` |
| ZK | circom 2 + circomlib + snarkjs Groth16（BN254）。証明はサーバー側（Vercel の Node Function）で、メンターの助言とプロトタイプの判断に合わせる。端末内証明は余力があれば入れる |
| チェーン | Ethereum Sepolia。`CHAIN_ID`/`RPC_URL` を env にして、World Chain Sepolia にも移せるようにする |
| 認証 | Privy。正規デザインの「Continue with Google」ボタンから `useLoginWithOAuth().initOAuth({provider:'google'})` を呼ぶ。埋め込みウォレットで署名する |
| World ID | 後回し。IDKit 4 前提で差し込み口だけ作り、それまでは「Simulated」と明示したモックで動かす |
| モック | 統合ごとに `mock`/`real` を env で切り替える。env が無ければ mock に倒す。**UI に現在のモードを出す**（`off-chain` なのに on-chain と見せない） |
| コミット | 英語の Conventional Commits（英語圏の読み手にも読めるように）、小さく刻んで頻繁に push、`Co-Authored-By` 付き。squash や履歴の書き換えはしない |

## URL 設計（1プロジェクト・2アプリ）

| URL | アプリ | 画面（Figma ページ） |
|---|---|---|
| `/` | ハブ | プレゼン用ランチャー（3画面へのリンク、モード表示、リセット） |
| `/counter` | 窓口（PC/iPad） | 01 Issuing counter · Desktop QR（3分で失効する署名付き offer の QR） |
| `/wallet/receive?offer=…` → `/wallet/save` → `/wallet/saved` | DAS Busters | 02 Certificate receipt & Google sign-in |
| `/wallet`, `/wallet/world-id` | DAS Busters | 03 My proofs & Human check |
| `/wallet/share?req=…` | DAS Busters | 04 Choose what to share（同意 → 証明 → Mingle へ戻る） |
| `/mingle`（profile / verification / dialog / settings を画面内で切替） | Mingle | 04 Matching app connection |
| `/api/{offer,credential,request,prove,verify,config}`, `/api/world-id/*` | サーバー | — |

- 正規デモでは同意画面が `/matching` の中にあった。ここはウォレット側 `/wallet/share` に移し、アプリ間はリダイレクトでやり取りする。
- あわせて正規デモの穴を直す。
  - QR の token を実際に検証する。
  - Home には保存済みの証明書を表示する。
  - World ID から Mingle への戻り導線を作る。
  - 開示した項目をバッジに出す。
  - Figma キャプチャ用のスクリプトは入れない。

## プロトタイプの穴を繰り返さない

- **World ID の bypass**: クライアントから `bypass:true` を送ると通せた。今回はモードをサーバーの env だけで決める。
- **revert の扱い**
  - nullifier 使用済みや発行者違いの revert を「オフチェーン成功」に丸めていた。
  - 今回は `simulateContract` で revert を先に拾い、失敗として理由付きで UI に出す。
  - オフチェーンに落とすのは RPC 障害のときだけにする。
- **発行者鍵**: seed をコミットしていたので、実質公開鍵と同じだった。今回は秘密鍵を env（Vercel の Secret）だけに置き、リポジトリには公開鍵 Ax/Ay だけを置く。
- **紐付け**: 結果が誰にも紐付いていなかった。要求トークンに nonce を入れ、結果トークンと突き合わせる。
- **holderSecret の範囲**: 256bit で BN254 の field を超えていた。field 未満（248bit）で作る。
- **UI の文言**: 「端末から出ない」と書きつつ、サーバーで証明していた。UI の文言は保存場所の話だけにとどめ、サーバーで証明していることは README に明記する。

## データフロー

1. **発行**
   - `/counter` が `POST /api/offer` で署名付き offer（jose HS256、3分失効）を作り、QR にする。
   - スマホは `/wallet/receive` で Google サインインしたあと、`POST /api/credential` に offer と `holderCommitment = Poseidon(holderSecret)` を送る。
   - サーバーは `isSingle`・`birthYear`・`residenceCode`・`issuedAt` と holderCommitment をまとめて Poseidon にかけ、発行者鍵で EdDSA-Poseidon（BabyJubJub）署名する。
   - VC と holderSecret は端末の localStorage にだけ置く。
2. **要求**: Mingle が `POST /api/request` で提示要求を作る。中身は verifierId、epoch、nonce、要求項目で、署名付き。そのまま `/wallet/share?req=…` へ遷移する。
3. **証明**
   - ウォレットで開示項目を選び、`POST /api/prove` を呼ぶ（サーバーで `groth16.fullProve`）。
   - public signals はプロトタイプと同じ形にする：`[nullifierHash, issuerAx, issuerAy, revealResidence, revealAge, expectedResidence, minBirthYear, maxBirthYear, scopeHash]`。
   - `nullifier = Poseidon(holderSecret, scopeHash)`、`scopeHash = Poseidon(verifierId, epoch)`。
   - 並びはテンプレートの宣言順で決まるので、ビルド後に `snarkjs r1cs print` で実測する。
4. **検証**（`POST /api/verify`）
   - 要求トークンを検証する。
   - public signals が要求と信頼済み発行者鍵に一致するか確認する（min/max や居住地の値も照合する）。
   - snarkjs でオフチェーン検証する。
   - `CHAIN_MODE=sepolia` のときは relayer が `simulateContract` → `writeContract` の順に送り、**tx hash をすぐ返す**。
   - receipt はクライアントが待つ（Sepolia は約12秒）。Function を長く走らせないためと、Vercel の実行時間上限を避けるため。
   - 結果は署名付きトークンで Mingle に戻す。Mingle はプロフィールに「✓ Single status verified」と Etherscan リンクを出す。
5. **再実行**
   - Mingle の Reset で epoch（端末側の乱数）を変えると、nullifier が変わって何度でも通る。
   - 本番では epoch を固定して「1人1アカウント」にできる。README で説明する。
6. **Privy の役割は署名だけ**
   - 受け取り時に固定メッセージへ署名し、その署名の hash から holderSecret を作る。作った値は VC と一緒に端末へ保存する。
   - 署名が決定的でなくても壊れないように、保存した値を正とする。
   - mock のときは乱数で作る。

## フェーズ（各フェーズの最後に build → 実機確認 → commit → push → Vercel で確認）

### Phase 0：Vercel に簡易ページを出す（30〜45分）★最初のゴール
- `git init`。
  - `.gitignore`: `dump/`、`node_modules`、`.next`、`.env*`、`!.env.example`、`.vercel`、`contracts/out`、`contracts/cache`、`circuits/build/tmp`。
  - `.vercelignore`: `dump`。
- Next.js の最小構成を作る。
  - `tsconfig` の exclude に `dump` を入れる。入れないと dump の TS まで型検査され、build が落ちる。
  - `next.config.ts` で `outputFileTracingRoot` を固定する。dump 内の lockfile を workspace root と誤認させないため。
- ハブ `/` と、`/counter`・`/wallet`・`/mingle` の仮ページを置く。この段階で Manrope（`next/font/google`）と基本トークンを入れる。
- `AGENTS.md`（+ `CLAUDE.md` をシンボリックリンク）を新規に書く。プロトタイプから「動くこと最優先」「検証方式を UI に出す」と、ZK・チェーン・World ID の落とし穴を引き継ぐ。
- `.claude/skills/` を用意する。
  - `eth-security`・`eth-testing` は汎用の公開スキルなので流用する。外部フィードバック行と `yarn verify` は削る。
  - ZK スキルとローカル開発スキルは、新しいパスと Vercel 前提で書き直す。
- `.claude/settings.json` に allow を足す（`git add/commit/push`、`forge`、`cast`、`node_modules/.bin/snarkjs`）。
- `docs/plan.md`（この計画）、`README.md`・`AI_USAGE.md` の骨組み。
- `gh repo create CobaltSato/single-proof --public --source . --push`。
- Vercel: ユーザーが vercel.com/new で GitHub リポジトリを import する（以後は push ごとに自動デプロイ）。代替は `! npx vercel login` のあと `npx vercel --prod`。
- **完了条件**: `https://<project>.vercel.app/` にハブが表示される。

### Phase 1：MVP（全画面と全フローをモックで通す、〜3時間）
- 正規デザインを見ながらトークンを新規に書く。
  - `--ink #0b0e16`、`--muted #626874`、`--surface #f5f6f8`、`--blue #0866d9`。
  - Mingle は pink `#ed5974` と CTA `#0866ed`。窓口は navy `#153a5b` と残り時間の赤 `#b42318`。
  - 横幅 375px のモバイルファースト、pill ボタン 52px/r26、カード r20。
  - 正規デモの px 絶対配置はやめ、flex で 375×812 に収める。
- 共通部品: PhoneShell, BrandHeader, CertificateCard, SuccessMark, Switch, Spinner, ModeBadge。
- 画面とコピーは正規デザインどおりの英語にする。対象は窓口、receive/save/saved、My proofs + Human check、Mingle（profile / verification / dialog / settings）、share。
- `lib/modes.ts`（`AUTH_MODE`/`PROVER_MODE`/`CHAIN_MODE`/`WORLDID_MODE`）、`lib/token.ts`（jose）、`lib/storage.ts`（キーの名前空間はアプリごとに分ける）。
- mock の中身: Google アカウント選択シート（Ken Sato）、偽の proof、`off-chain`、Simulated の Human check。
- 事前制作のアセット（ロゴ、Mingle アイコン、プロフィール写真）は `sips -Z 512` で軽くしてから `public/` に置く。README の申告リストにも追加する。
- **完了条件**: Vercel の URL で、iPad の QR → iPhone で受け取り → Mingle で共有 → バッジ表示、まで通る。

### Phase 2：本物の ZK（2〜3時間）
- `circuits/single_proof.circom` を新規に書く。中身は EdDSAPoseidonVerifier、`isSingle === 1`、条件付きの居住地一致と生年範囲、nullifier。ptau は 2^14 の見込み。
- circom が入っていないので、まず npm の `circom2`（WASM 版）を試す。駄目なら rustup + `cargo install` で入れる。
- `circuits/build.sh` を書く。公式 ptau ミラーは 403 なのでローカルで生成する。
- 成果物（`public/zk/*.wasm`、`*.zkey`、`verification_key.json`）はコミットする。Vercel の build で circom を要求しないため。
- `lib/issuer.ts`: `@zk-kit/eddsa-poseidon` は Node 24 で ESM が壊れるので、`createRequire` で CJS を読む。`signMessage` には BigInt を渡す。
- `lib/zk.ts`: fullProve と verify。
  - `serverExternalPackages: ['snarkjs']`。
  - `outputFileTracingIncludes` で `public/zk/**` を Function に同梱する。
- テスト
  - `npm run zk:test`: 正常系が通ること。独身でない場合、発行者鍵違い、public signal の改ざんは失敗すること。
  - vitest: token、エンコード、public signal の照合ロジック。

### Phase 3：Sepolia オンチェーン（1.5時間）
- `contracts/`（Foundry、solc 0.8.37。`~/.svm` にある）。
  - `Groth16Verifier.sol`（snarkjs で生成）。
  - `SingleProofRegistry.sol`: 信頼発行者のチェック、`require(verifyProof(...))`（false を返すだけで revert しないため）、nullifier の重複拒否、`Verified` イベント。
- テストは eth-testing スキルに沿う（正常系、リプレイ、未信頼発行者、改ざん、fuzz）。デプロイ前に eth-security のチェックリストを通す。
- `forge script --broadcast` で Sepolia にデプロイし、`contracts/deployments/sepolia.json` に書く。calldata は `exportSolidityCallData` で作る（`_pB` の座標入れ替え対策）。
- `lib/chain.ts`（viem）。UI は「Recording on Ethereum Sepolia…」から tx リンク表示へ進める。

### Phase 4：Privy + Google（1時間）
- `@privy-io/react-auth` を入れる。
  - `loginMethods:['google']`、`embeddedWallets.ethereum.createOnLogin:'users-without-wallets'`。
  - Google は `initOAuth` で呼び、ログイン後に `useSignMessage` で holderSecret を導出する。
- `NEXT_PUBLIC_PRIVY_APP_ID` が無ければ mock のまま動く。

### Phase 5：World ID（1.5時間、余裕があれば）
- 組み込み
  - IDKit 4.x の `IDKitRequestWidget` と preset を使う。
  - `/api/world-id/rp-context` で `signRequest` によるサーバー署名を返す。
  - `POST https://developer.world.org/api/v4/verify/{rp_id}` で検証し、`environment` も確認する。
  - nullifier は10進文字列で保存する。テストは staging の Simulator で行う。
- World 賞（Best Use of IDKit）の要件
  - 「なぜこのクレデンシャルが最小十分か」を説明する。重複アカウント防止には unique human で足りる。
  - 代替経路: World ID が無くても独身証明は共有でき、バッジの段階だけ変わる。
  - 統合の振り返り（初成功までの時間、詰まった点）を `FEEDBACK.md` に書く。

### Phase 6：提出（1.5時間）
- README（英語）
  - 何をするか、構成図、オンチェーンに何が載るか、動かし方。
  - 「イベント前に用意したもの：アイデア、Figma、ロゴ・アイコン・写真」と「イベント中に書いたもの：このリポジトリのコード全部」を分けて書く。
- `AI_USAGE.md`（英語）
  - 使ったツール。
  - ディレクトリごとの AI 生成／支援の範囲。
  - チームがやったこと（アイデア、UX、デザイン、文言、実機テスト、ピッチ）。
  - 計画ファイルの場所。
- 本番デプロイ、iPad 用 QR、通し練習3回（Reset が効くか）。
- 動画は2〜4分、本人の声で録る。AI ナレーションはルールで禁止されている。

**打ち切りライン**
- 22:00 に Phase 3 が終わっていなければ、World ID は Simulated のまま出す（World 賞は狙わない）。
- 02:00 で機能を凍結し、仕上げと提出に回る。

## 並行してやってもらうこと（外部アカウントが要るもの）

1. **Vercel**: Phase 0 の push 直後に、GitHub リポジトリを import する。
2. **Privy**: アプリを作って Google ログインを有効にし、allowed origins に `http://localhost:3000` と Vercel の本番ドメインを登録する。App ID を共有する。
3. **Sepolia**: 新しく作ったデプロイ／relayer 用の鍵に faucet で約0.1 ETH 入れる。鍵は `.env.local` と Vercel env だけに置く。RPC URL（Alchemy など）も用意する。
4. **World ID**（Phase 5）: World Developer Portal で `rp_id`・署名鍵・action を作る（staging）。
5. **会場**: ETHGlobal スタッフに、事前の Figma・ロゴの扱いを確認する。
6. **チーム**: Haruka さんは Figma との見た目の差分チェック、Jimmy さんは英語コピーの確認。自分の担当分は自分のアカウントでコミットしてもらう。

## 検証

- **毎フェーズ**: `npm run build` が通ること。Vercel のデプロイが成功すること。
- **`npm run smoke`**: ローカルと Vercel の URL の両方で、API を発行 → 要求 → 証明 → 検証の順に叩き、ALL PASS になること。
- **ZK**: `npm run zk:test`（Phase 2 以降）。
- **コントラクト**: `forge test --root contracts`（Phase 3 以降）。デプロイ後は `cast call` で nullifier が記録されたことを確認する。
- **ブラウザ**: Chrome 自動操作で、Vercel の URL を 375px とデスクトップで通しで確認する（窓口 QR → 受け取り → 保存 → My proofs → Mingle → 共有 → バッジと tx リンク）。
- **通し練習**: 3回連続で行い、Reset のあとも nullifier が衝突しないこと。
