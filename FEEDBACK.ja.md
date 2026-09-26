# World ID 組み込みの振り返り

[English](FEEDBACK.md) | 日本語

ETHGlobal Tokyo 2026 で DAS Busters に World ID を組み込んだときのメモです。何を作ったか、どれくらいかかったか、どこで詰まったか、何があると助かるかを書きます。英語版の [FEEDBACK.md](FEEDBACK.md) が正本です。作業には Claude Code を使いました（[AI_USAGE.ja.md](AI_USAGE.ja.md)）。

## 作ったもの

DAS Busters のウォレットに付けた任意の人間確認です。独身であることのゼロ知識証明と一緒に、マッチングアプリの Mingle に渡します。

- IDKit 4.3.0（`@worldcoin/idkit`、`@worldcoin/idkit-core`）の `proofOfHuman` プリセットを使っています（[app/wallet/world-id/IdkitRequest.tsx](app/wallet/world-id/IdkitRequest.tsx)）。
- リクエストの `rp_context` は私たちのサーバーが RP の署名鍵で署名します（[app/api/world-id/rp-context/route.ts](app/api/world-id/rp-context/route.ts)）。結果は action と環境を確かめてから、Developer Portal の `/api/v4/verify` に転送します（[lib/worldid.ts](lib/worldid.ts)）。
- 確認が通ると、サーバーが署名したトークンがウォレットに返ります。Mingle はこのトークンがあるときだけ確認を数えます。
- staging と World ID Simulator だけで動かしています。本番の設定はしていません。

proof of human を選んだ理由と、Mingle が受け取るものは [README](README.ja.md#world-id) にあります。

## 経過

2026年9月26日の `git log` から拾った時刻（JST）です。コミットした時刻であって、作業時間を計ったものではありません。Developer Portal でのアプリの設定は git には出てきません。

| 時刻 | コミット | 内容 |
|---|---|---|
| 16:29 | `ab28ecd` | IDKit 4.3.0 を追加 |
| 16:29 | `a59c72d` | サーバーでのリクエスト署名と結果の検証。staging 窓を開くスクリプト |
| 16:34 | `1707e16` | ウォレットの人間確認を IDKit 経由にする |
| 16:44 | `c92ef2d` | staging 窓のスクリプトを修正 |
| 16:45 | `d009d1e` | smoke テスト：サーバーのトークンがない World ID の申告を拒否する |
| 16:58 | `e987d88` | staging 窓が閉じたら、そう表示したシミュレーションに切り替える |
| 17:04 | `53ed7f1` | デモの手順を World ID staging に切り替え。本番が Simulator で確認を動かしていると書いた最初のコミット |
| 17:29 | `8cbccc3` | Simulator を別タブではなく画面の上に開く |

初めて動くまで、コミットの時刻で約35分でした。IDKit を足したのが16:29、本番で Simulator での確認が動いたと記録した最初のコミットが17:04です。スマホで使いやすくするのに、さらに25分かかりました。

## 詰まったところ

**staging の証明には staging 窓が要る**：Portal の `/api/v4/verify` は、24時間の staging 窓を開いてそのトークンを `x-staging-verification-token` ヘッダーで送るまで、Simulator の証明に `403 environment_not_allowed` を返しました。Portal の Web 画面で窓を開く方法は見つけられず、チームの API キーを使って Portal の MCP エンドポイント（`set_world_id_staging_verification`）から開きました（[scripts/world-staging.ts](scripts/world-staging.ts)）。窓を開き直すたびにトークンが変わるので、デプロイ先のトークンを入れ替えて再デプロイする必要があり、そのあいだ本番の World ID 確認は失敗します（[docs/setup.ja.md](docs/setup.ja.md#world-id-の-staging-窓)）。開発中に窓が閉じたときは、どの確認も Portal で失敗しました。いまはサーバーが窓の閉じる時刻を持っていて、過ぎたらシミュレーションだと表示した確認に切り替えます。いまの窓は2026年9月27日 23:53 JST に閉じます。

**Simulator はリクエストを1回しか読まない**：スマホでは Simulator が別タブで開きました。承認したあと元のタブに戻ればいいと気づかない人がいて、待っている側のタブが固まったり再読み込みされたりすると、答えが届きません。Simulator を閉じるとリクエストはキャンセルになり、次は新しく署名し直す必要があります。いまはリクエストを `connect_url` に入れて、Simulator を iframe で画面の上に開き、答えが届いたら画面が自動で進みます（[IdkitRequest.tsx](app/wallet/world-id/IdkitRequest.tsx) のコメント）。

**IDKit 4 は最初のリクエストの前にバックエンドが要る**：リクエストには RP の鍵で署名した `rp_context` が付くので、ウィジェットが何かを開く前に、サーバーのルートと env の署名鍵を用意する必要がありました。`signRequest` を使えば難しくはありませんが、最初に作るものになります。

## うまくいったこと

- `useIDKitRequest` と `proofOfHuman` プリセットで、少ないコードでリクエストを開けました。
- `@worldcoin/idkit-core/signing` の `signRequest` は、1回の呼び出しで `rp_context` を作れます。
- v4 の verify の応答に nullifier と環境が入っているので、サーバーは違う環境の証明を拒否できます。
- Simulator の `connect_url` パラメーターのおかげで、2台目の端末なしにスマホ1台で最後まで通せました。
- Portal の MCP ツールで、staging 窓をスクリプトから開けました。

## やり残したこと

- リクエストに signal を入れていないので、World ID の証明は証明書にもゼロ知識証明にも結びついていません。保有者のコミットメントを signal にしてサーバーで確かめるのが次の一歩です。
- サーバーは World ID の nullifier をトークンの中に持っていますが、重複は確認していません。World のドキュメントはバックエンドで確認するよう求めています。
- World App を使う本番環境。

## あると助かるもの

- **いちばん効くのは、長めで自分で操作できる staging 窓**です。Portal の Web 画面から開いたり延ばしたりできると助かります。ハッカソンのデモはイベントのあとも数日動き続ける必要があり、スクリプト、トークンの入れ替え、再デプロイが要る24時間の窓は、うっかり切らしやすいです。
- staging の証明を検証するためのドキュメント。窓が開いていないときと `x-staging-verification-token` ヘッダーがないときに `/api/v4/verify` が拒否すること、窓の開き方。
- `environment_not_allowed` ではなく、staging 窓が閉じていると書いたエラー。
- Simulator がリクエストを1回しか読まないこと、スマホで別タブに開くと答えを失うことがあることを、Simulator のドキュメントに一言。
