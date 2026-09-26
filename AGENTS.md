# AGENTS.md

DAS Busters（リポジトリ名 single-proof）。ETHGlobal Tokyo 2026 の提出物で、締切は 9/27(日) 09:00 JST。計画の全体は `docs/plan.md` にある。

## 何を作っているか

役所の窓口が「独身証明書」を発行し、本人はそれをスマホに保存する。マッチングアプリ Mingle には「独身であること」だけを ZK 証明で渡す。任意で「東京在住」「30代」も足せる。

チェーンに載るのは検証器と nullifier だけで、氏名も生年月日も載らない。ピッチの核なので、ここを崩す変更はしない。

## 優先順位

1. 動くこと
2. デモ中に落ちないこと
3. 品質

締切が近づいたら、機能を足すより今動いているものを守る。

## 守ること

- **`dump/` の扱い**: イベント前の資料。読むのはよいが、コードもアセットもコピーしない。事前制作のアセットを使うときは、README の申告リストに足す。
- **秘密情報**: 秘密鍵とシークレットは env だけに置く。`.env.example` にはキー名だけを書く。発行者の秘密鍵もリポジトリに入れない。
- **mock / real の切り替え**: `lib/modes.ts` の env で切り替え、env が無ければ mock に倒す。モードはサーバー側で決め、クライアントからは切り替えさせない。
- **UI に検証方式を出す**: `off-chain` で検証した結果を on-chain と見せない。Simulated の World ID を本物と見せない。
- **revert の扱い**: コントラクトの revert（nullifier 使用済み、発行者違い）は失敗として UI に出す。オフチェーンに落としてよいのは RPC 障害のときだけ。
- **英語ファースト**: UI 文言と人間向け Docs は英語が正で、日本語（`lib/i18n/ja.ts`、`*.ja.md`）も同じ変更で必ず追従させる。
- **AI 利用の記録**: 新しい部分を AI で書いたら、`AI_USAGE.md` の表を更新する。

## コミット

- 英語の Conventional Commits（feat / fix / chore / docs / test / refactor）を使う。件名には何をしたか、本文にはなぜかを書く。
- 動く単位で小さく刻み、こまめに push する。squash や履歴の書き換えはしない。ETHGlobal は一括コミットを失格にしうる。
- 末尾に `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>` を付ける。

## 構成

| パス | 中身 |
|---|---|
| `app/` | Next.js App Router。`/` ハブ、`/counter` 窓口、`/wallet/*` DAS Busters、`/mingle` Mingle、`/api/*` |
| `components/` | 共通 UI |
| `lib/` | モード、トークン、証明書のエンコード、ZK、チェーン |
| `circuits/` | circom の回路とビルドスクリプト |
| `public/zk/` | 回路の成果物（wasm、zkey、vkey）。コミットする |
| `contracts/` | Foundry |
| `docs/plan.md` | 実装計画 |

## コマンド

- `npm run dev`: `0.0.0.0:3000` で起動する。同じ Wi-Fi の iPhone から見られる。
- `npm run build`: push の前に必ず通す。
- `npm run typecheck`

## スキル

- `zk-circuits`: circom、snarkjs、Groth16Verifier に触るとき。
- `eth-testing` / `eth-security`: `contracts/` を触るとき。デプロイ前は eth-security のチェックリストを必ず通す。
- `local-dev`: 起動、デプロイ、デモ前の確認。
