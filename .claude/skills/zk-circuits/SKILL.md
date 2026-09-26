---
name: zk-circuits
description: circom + snarkjs + Foundry の ZK パイプライン（circuits/、public/zk/、lib/zk.ts、lib/issuer.ts、contracts/ の Groth16Verifier）を触るときに読む。回路のビルド、publicSignals の並び、発行者鍵、オンチェーン検証でハマる点と対策をまとめてある。
---

# ZK パイプライン

## 構成

- 回路: `circuits/single_proof.circom`。circomlib の EdDSAPoseidonVerifier と Poseidon を使う。
- ビルド: `circuits/build.sh`。成果物（wasm、zkey、verification_key.json）を `public/zk/` にコピーしてコミットする。Vercel のビルドで circom を要求しないため。
- 証明: `lib/zk.ts`。サーバーで `groth16.fullProve` を呼ぶ。
- 署名: `lib/issuer.ts`。EdDSA-Poseidon（BabyJubJub）。秘密鍵は env の `ISSUER_PRIVATE_KEY` だけに置く。
- オンチェーン: `contracts/src/Groth16Verifier.sol`（snarkjs が生成）と `SingleProofRegistry.sol`。

## 実際に踏んだ罠と対策

イベント前のプロトタイプで確認したことだけを書いている。

- **publicSignals の並び**: `component main {public [...]}` に書いた順にはならない。出力が先頭に来て、そのあとテンプレート本体での宣言順に並ぶ。回路を変えたら `snarkjs r1cs print` で確かめる。
- **`@zk-kit/eddsa-poseidon`**: ESM ビルドは Node 24 で壊れる（`blake2bFinal` の export エラー）。`createRequire` で CJS を読む。`signMessage` には BigInt を渡す。
- **`circomlibjs`**: 使わない。`poseidon-lite` と `@zk-kit/eddsa-poseidon` で足りる。
- **snarkjs の呼び方**: `npx snarkjs` はカレントディレクトリを無視することがある。`node_modules/.bin/snarkjs` を絶対パスで呼ぶ。
- **ptau**: 公式のミラーは 403 を返すので、ローカルで作る。2^14 で約1万制約まで足りる。数百バイトのファイルが落ちてきたら、それはエラーページ。
- **JS では true なのにオンチェーンで false**: ほぼ `_pB` の G2 座標の入れ替えが原因。calldata は必ず `exportSolidityCallData` で作り、`JSON.parse("[" + raw + "]")` で読む。
- **`verifyProof`**: 生成されるコントラクト名は `Groth16Verifier`。`verifyProof` は false を返すだけで revert しないので、呼ぶ側で `require` する。nullifier の重複チェックも自分で書く。
- **secret の範囲**: secret は BN254 の field 未満で作る。248bit の乱数なら安全。256bit にすると field を超えて、別の値と衝突しうる。
- **solc**: 0.8.37 を使う（`~/.svm/0.8.37` にある）。
- **`--broadcast`**: `forge create` / `forge script` は `--broadcast` を付けないと送信されない。

## 信頼設定

ptau と zkey の contribution は、どちらも自分たちの1回だけ。デモ用で、本番の ceremony ではない。README にもそう書く。
