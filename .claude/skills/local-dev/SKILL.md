---
name: local-dev
description: DAS Busters をローカルで起動する、Vercel にデプロイする、env を足す、デモ前に確認するときに読む。「動かない」「起動して」「デプロイして」「デモの準備」系のタスクで最初に使う。
---

# 起動とデプロイ

## ローカル

- `npm install` → `npm run dev` で起動する。`0.0.0.0:3000` で待ち受けるので、同じ Wi-Fi の iPhone から `http://<Mac の IP>:3000` で開ける。IP は `ipconfig getifaddr en0` で調べる。
- 会場の Wi-Fi で端末同士が見えないときは、Mac を iPhone のテザリングにつなぐ。
- env は `.env.local` に置く（コミットしない）。キー名は `.env.example` を見る。

## Vercel

- GitHub の main に push すると、本番に出る。
- env の追加は `npx vercel env add <NAME> production`。追加したあとは再デプロイが必要。
- `NEXT_PUBLIC_` 付きの env はビルド時に埋め込まれるので、値を変えたら必ず再ビルドする。
- 外部サービス（Google Cloud、Privy、World ID）の設定、URL を変えるときの手順、World ID の staging 窓の延長、relayer のガス補充は `docs/setup.ja.md` にある。

## デモ前のチェック

1. `npm run build` が通る。
2. 本番 URL で、ハブ → 窓口の QR → 受け取り → Mingle で共有 → バッジ、まで通る。
3. Mingle の Reset を押して、もう一度通る。
