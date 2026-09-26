# AI の利用

[English](AI_USAGE.md) | 日本語

ETHGlobal は、AI ツールをどこでどう使ったかを申告するよう求めています。このファイルは開発を進めながら更新しています。正本は英語版の [AI_USAGE.md](AI_USAGE.md) です。

## 使ったツール

ターミナルで Claude Code（Claude Opus 5.5）を使いました。Claude Code が関わったコミットには `Co-Authored-By: Claude` の trailer を付けているので、`git log` でコミットごとに確認できます。

## 計画のファイル

ルールに従い、仕様と計画のファイルはリポジトリに入れています。

| ファイル | 中身 |
|---|---|
| [docs/plan.md](docs/plan.md) | 実装計画。チャットのログ、モック、プロトタイプのメモをもとに Claude Code が plan mode で下書きしました。チームで読み直し、ルールやチェーンやリポジトリといった未決事項を決めました。 |
| [AGENTS.md](AGENTS.md) | コーディングエージェント向けのプロジェクトルール。`CLAUDE.md` はこのファイルを参照しています。 |
| [.claude/skills/](.claude/skills/) | エージェントが読み込む作業ガイド。 |

スキルについて:

- `eth-security` と `eth-testing` は [ethskills.com](https://ethskills.com) から持ってきました。このプロジェクトに関係しないリンクをいくつか削っています。
- `zk-circuits` と `local-dev` は自分たちのメモです。イベント前の技術検証でハマった点をもとに Claude Code が書きました。

## Claude Code がやったこと

| 分野 | ファイル | 関わり方 |
|---|---|---|
| プロジェクトの準備 | `package.json`、`tsconfig.json`、`next.config.ts`、`vercel.json` | 生成し、チームがレビュー |
| デモのハブと仮のルート | `app/` | チームの画面デザインから生成 |
| API とモックの証明 | `app/api/`、`lib/` | 計画にあるデータの流れから生成 |
| 画面 | `app/counter/`、`app/wallet/`、`app/mingle/`、`components/` | チームの Figma デザインから生成 |
| 回路と setup | `circuits/`、`public/zk/`、`lib/zk/` | 計画のルールから生成。ビルドスクリプトはイベント前の技術検証でハマった点をもとにしている |
| Groth16 の証明、EdDSA の発行者 | `lib/prover.ts`、`lib/groth16.ts`、`lib/issuer.ts` | 生成 |
| レジストリのコントラクトとテスト | `contracts/src/SingleProofRegistry.sol`、`contracts/test/`、`contracts/script/` | 生成。eth-security のチェックリストと slither で確認 |
| オンチェーンの記録 | `lib/chain.ts`、`app/api/tx/`、`app/mingle/TxStatus.tsx` | 生成 |
| Google ログインと保有者鍵 | `app/wallet/_components/`、`lib/privy.ts` | 生成。Privy と Google OAuth の設定はチームが行い、ボタンが止まるバグは本番でログインしてチームが見つけた |
| スモークテスト | `scripts/smoke.ts` | 拒否されるケースも含めて生成 |
| 多言語対応（英語と日本語） | `lib/i18n/`、`components/LanguageToggle.tsx`、`middleware.ts`、`README.ja.md`、`AI_USAGE.ja.md` | 生成。英語を既定にして日本語も選べるように、とチームが依頼した |
| デモのリセット（1回で両方） | `app/reset/`、`lib/storage.ts` | 生成 |
| ドキュメント | `README.md`、`AI_USAGE.md`、`AGENTS.md`、`docs/demo.md` | 下書きし、チームが手を入れた。README の Mermaid の図も下書きし、回路とコントラクトと API ルートに照らして確認した |

## チームがやったこと

- **アイデアとリサーチ**: アイデア、問題のリサーチ、ピッチ。
- **デザイン**: 画面デザインとユーザーの流れ。イベント前に Figma で作った。
- **判断**: 何をチェーンに載せるか、どのチェーンを使うか、証明をどこで作るか、といった設計の判断。
- **レビューとテスト**: コードレビューと、実機のスマホでのテスト。
- **アカウントとデモ**: 外部サービスの設定とデモ動画。
