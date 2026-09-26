# AI の利用

[English](AI_USAGE.md) | 日本語

ETHGlobal は、AI ツールをどこでどう使ったかを申告するよう求めています。このファイルは開発を進めながら更新しています。正本は英語版の [AI_USAGE.md](AI_USAGE.md) です。

## 使ったツール

ターミナルで Claude Code（Claude Opus 5.5）を使いました。このリポジトリのコミットはどれも Claude Code を使って作り、`Co-Authored-By: Claude` の trailer が付いています。そのため trailer では Claude Code の担当とチームの担当を分けられません。分担は下の表に分野ごとに書いています。

## 計画のファイル

ルールに従い、仕様と計画のファイルはリポジトリに入れています。

| ファイル | 中身 |
|---|---|
| [docs/plan.md](docs/plan.md) | 実装計画。チャットのログ、モック、プロトタイプのメモをもとに Claude Code が plan mode で下書きしました。チームで読み直し、ルールやチェーンやリポジトリといった未決事項を決めました。 |
| [AGENTS.md](AGENTS.md) | コーディングエージェント向けのプロジェクトルール。`CLAUDE.md` はこのファイルを参照しています。 |
| [.claude/skills/](.claude/skills/) | エージェントが読み込む作業ガイド。 |

スキルについて。

- `eth-security` と `eth-testing` は [ethskills.com](https://ethskills.com) から持ってきました。このプロジェクトに関係しないリンクをいくつか削っています。
- `zk-circuits` と `local-dev` は自分たちのメモです。イベント前の技術検証でハマった点をもとに Claude Code が書きました。

## Claude Code がやったこと

| 分野 | ファイル | 関わり方 |
|---|---|---|
| プロジェクトの準備 | `package.json`、`tsconfig.json`、`next.config.ts`、`vercel.json` | 生成し、チームがレビュー |
| デモのハブとルート | `app/` | チームの画面デザインから生成 |
| API とモックの証明 | `app/api/`、`lib/` | 計画にあるデータの流れから生成 |
| 画面 | `app/counter/`、`app/wallet/`、`app/mingle/`、`components/` | チームの Figma デザインから生成 |
| 回路と setup | `circuits/`、`public/zk/`、`lib/zk/` | 計画のルールから生成。ビルドスクリプトはイベント前の技術検証でハマった点をもとにしている |
| Groth16 の証明、EdDSA の発行者 | `lib/prover.ts`、`lib/groth16.ts`、`lib/issuer.ts` | 生成 |
| レジストリのコントラクトとテスト | `contracts/src/SingleProofRegistry.sol`、`contracts/test/`、`contracts/script/` | 生成。eth-security のチェックリストと slither で確認 |
| オンチェーンの記録 | `lib/chain.ts`、`app/api/tx/`、`app/mingle/TxStatus.tsx` | 生成 |
| Google ログインと保有者鍵 | `app/wallet/_components/`、`lib/privy.ts` | 生成。Privy と Google OAuth の設定はチームが行い、ボタンが止まるバグは本番でログインしてチームが見つけた |
| スモークテスト | `scripts/smoke.ts` | 拒否されるケースも含めて生成 |
| ユニット、回路、コントラクトのテスト | `scripts/unit-test.ts`、`scripts/circuit-test.ts`、`contracts/test/SingleProofRegistry.t.sol`、`package.json` の `test` 系スクリプト | 生成。確かめているのは、ウォレットの証明のルール、Mingle が公開シグナルに対して行う確認、コミット済みの回路に正しい証明書と改ざんした証明書を入れたときの結果、有限体の範囲を超える公開シグナルをレジストリが拒否すること |
| 多言語対応（英語と日本語） | `lib/i18n/`、`components/LanguageToggle.tsx`、`middleware.ts`、`README.ja.md`、`AI_USAGE.ja.md` | 生成。英語を既定にして日本語も選べるように、とチームが依頼した |
| デモのリセット（1回で両方） | `app/reset/`、`lib/storage.ts` | 生成 |
| World ID（IDKit 4） | `lib/worldid.ts`、`app/api/world-id/`、`app/wallet/world-id/`、`scripts/world-staging.ts` | 生成。Developer Portal のアプリと action の作成、World ID Simulator での最初の試験も、Claude Code が Claude in Chrome で行った。Portal のアカウントと API キーはチームが作成 |
| プライバシーポリシーのページ | `app/privacy/` | コードが実際に保存しているものをもとに下書き。Google ログインを誰にでも開放するために必要だった |
| しくみの説明ページ | `app/how-it-works/`、`lib/i18n/how-it-works/` | コード、回路、コントラクト、README の図をもとに下書きし、コードと突き合わせて事実確認した。その後、図を主役にして技術的な記述は「かんたん / 技術者向け」の切り替えで出し、よくある質問を付けた構成に作り直した。アプリを基礎から説明し、技術者でなくても読めるページがほしいというチームの依頼 |
| das-busters.vercel.app への移行 | Vercel のドメイン、Google Cloud と Privy の設定、GitHub のリポジトリ名、`docs/setup.md` | ドメインの追加と転送は Claude Code が Vercel CLI で、Google Cloud と Privy の設定は Claude in Chrome で、リポジトリの改名は GitHub CLI で行った。新しい名前はチームが決めた |
| スマホでの証明 | `lib/deviceProver.ts`、`lib/statement.ts`、`app/wallet/share/ShareScreen.tsx`、`lib/modes.ts` | 生成。回路のルールをブラウザでも読めるモジュールに移し、ブラウザの中で snarkjs を動かし、サーバーを表示付きの予備にした。新しいコードなしで戻せるように `PROVE_ON` も足した |
| コントラクトのソース検証 | Sourcify、`docs/setup.md` | forge で標準 JSON 入力を書き出し、forge 自身のアップロードが失敗したあと Sourcify v2 の API に送って、exact match を確かめたのは Claude Code。Etherscan での検証は不要とチームが判断した |
| アプリの見直しと修正 | `app/page.tsx`、`app/counter/`、`app/wallet/`、`app/mingle/`、`lib/chain.ts`、`lib/i18n/` | Claude Code がアプリをコードと突き合わせ、コードより多くを言っていた文言（World ID の一意性、Mingle が受け取るもの）を書き直した。ハブの手順に番号を付け、スマホなしで進むリンクを読みやすくし、nullifier 使用済みのときに証明書を消さずにやり直せるようにした |
| README と説明ページの作り直し | `README.md`、`README.ja.md`、`docs/demo.md`、`docs/setup.md`、`app/how-it-works/`、`lib/i18n/how-it-works/` | Claude Code がドキュメントをコードと公開情報（自治体のページ、ユーブライド、IBJ、デジタル庁、警察庁、World のドキュメント）に照らして確かめ、README を問題、本物と代役、限界、テストを軸に書き直した。すべてを十分に説明し、AI が書いたような浅さを減らすこと、区役所の署名鍵がデモ用サーバーにあるのはデモのためだけだと書き、実運用での構成も示すことは、チームの依頼 |
| デモの最終調整 | `components/ProgressSteps.tsx`、`app/wallet/save/`、`app/wallet/share/`、`app/wallet/world-id/`、`app/wallet/_components/`、`app/mingle/`、`app/how-it-works/basics/`、`docs/technical.md`、`docs/demo.md` | Claude Code がヘッドレスブラウザでデモを通し、迷いやすい所を直した。Google ログインのあとすぐ保存が始まって3つの段階を見せる、World ID を求められた画面のまま通す、共有で実際の証明時間と Sepolia の待ち時間を見せる、Mingle の余分な確認ダイアログを消す、の4つ。README を短い本体と `docs/technical.md` に、説明ページの基本用語を別ページに分けた。World ID から戻ったときとログインのボタンがわかりにくいと指摘し、World ID、証明、Sepolia の本物の処理をモックにせず残すよう求めたのはチーム |
| 組み込みの振り返り | `FEEDBACK.md`、`FEEDBACK.ja.md` | git の履歴、コードのコメント、セットアップのメモから下書き |
| ドキュメント | `README.md`、`AI_USAGE.md`、`AGENTS.md`、`docs/demo.md`、`docs/setup.md` | 下書きし、チームが手を入れた。README の Mermaid の図も下書きし、回路とコントラクトと API ルートに照らして確認した |

## チームがやったこと

- **アイデアとリサーチ**：アイデア、問題のリサーチ、ピッチ。
- **デザイン**：画面デザインとユーザーの流れ。イベント前に Figma で作った。
- **判断**：何をチェーンに載せるか、どのチェーンを使うか、証明をどこで作るか、といった設計の判断。
- **レビューとテスト**：コードレビューと、実機のスマホでのテスト。
- **アカウントとデモ**：外部サービスの設定とデモ動画。
