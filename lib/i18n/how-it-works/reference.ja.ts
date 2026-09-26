import type { ReferenceCopy } from "./reference.en";

// Japanese copy for the second half of /how-it-works. English
// (reference.en.ts) is the source; keep this file in step.

const referenceJa: ReferenceCopy = {
  tech: {
    title: "内部",
    lede: "ここに書いた数字は、すべてリポジトリのコードから取っています。",
    numbers: [
      { value: "9,921", label: "証明の中で確かめる式の数（回路の制約）" },
      { value: "10", label: "Mingle に見える数（公開値）の個数" },
      { value: "1", label: "登録1件でブロックチェーンに残る数" },
      { value: "0", label: "ブロックチェーンに載る氏名と生年月日" },
      { value: "7.7 MB", label: "証明を作るためにスマホが読み込む回路ファイル" },
      { value: "約12秒", label: "Sepolia に記録する時間" },
    ],
    plainOnly: "回路、コントラクトの判定、トークン、モードは技術者向け表示にあります。",
    plainSwitch: "技術者向け表示にする",
    certificate: {
      title: "証明書と署名",
      body: "証明書はスマホに保存した JSON です。数値の項目を保有者のコミットメントと一緒に Poseidon で1つのメッセージにまとめ、区役所がそのメッセージに署名します。",
      code: "M = Poseidon(isSingle, birthYear, residenceCode, issuedAt, Poseidon(holderSecret))\nsignature = EdDSA-Poseidon(issuerKey, M)      // BabyJubJub 曲線",
      note: "署名しているのはこの5つの値だけです。氏名と生年月日（日付まで）はスマホに表示されますが、証明はできません。住所は JIS の都道府県コードで、13 が東京都です。",
    },
    holderKey: {
      title: "保有者鍵",
      body: "証明書は保有者に結びついています。区役所に渡るのは保有者鍵のハッシュだけで、証明を作るには保有者鍵そのものが要ります。",
      code: "signature    = embeddedWallet.sign(\"DAS Busters holder key v1 …\")\nholderSecret = SHA-256(署名の小文字16進文字列) の先頭31バイト   // < BN254 のフィールド\ncommitment   = Poseidon(holderSecret)                            // 区役所に送る",
    },
    circuit: {
      title: "回路",
      lede: "`circuits/single_proof.circom`: 制約 9,921 個、非公開の入力 8 個、公開の入力 9 個、出力 1 個。",
      privateTitle: "非公開の入力（外に出ない）",
      private: ["isSingle", "birthYear", "residenceCode", "issuedAt", "holderSecret", "sigR8x, sigR8y, sigS"],
      publicTitle: "公開の入力（Mingle が見る）",
      public: ["issuerAx, issuerAy", "revealResidence, revealAge", "expectedResidence", "minBirthYear, maxBirthYear", "scopeHash", "requestHash"],
      checksTitle: "回路が証明すること",
      checks: [
        "M への区役所の EdDSA 署名が、公開鍵 (issuerAx, issuerAy) で正しいこと。",
        "isSingle = 1 であること。",
        "住所を共有するなら residenceCode が求められたコードと一致すること。共有しないなら公開のコードは 0。",
        "年代を共有するなら minBirthYear ≤ birthYear ≤ maxBirthYear。共有しないなら上限も下限も 0。",
        "nullifierHash = Poseidon(holderSecret, scopeHash)。",
        "requestHash を2乗して制約に入れているので、証明は1つのリクエストにしか合わない。",
      ],
      outputTitle: "出力",
      output: "nullifierHash",
      excerptTitle: "回路にある共有のルール（そのまま抜粋）",
      excerpt:
        "revealResidence * (residenceCode - expectedResidence) === 0;\n(1 - revealResidence) * expectedResidence === 0;",
      signalsTitle: "10個の公開シグナル（この順番）",
      signalsHead: { index: "#", name: "シグナル", meaning: "意味" },
      signals: [
        { name: "nullifierHash", meaning: "このアプリでのこの保有者の匿名の番号" },
        { name: "issuerAx", meaning: "区役所の公開鍵（x）" },
        { name: "issuerAy", meaning: "区役所の公開鍵（y）" },
        { name: "revealResidence", meaning: "住所を共有するなら 1" },
        { name: "revealAge", meaning: "年代を共有するなら 1" },
        { name: "expectedResidence", meaning: "共有するなら 13（東京都）、しないなら 0" },
        { name: "minBirthYear", meaning: "2026年の30代なら 1987、共有しないなら 0" },
        { name: "maxBirthYear", meaning: "2026年の30代なら 1996、共有しないなら 0" },
        { name: "scopeHash", meaning: "Poseidon(\"mingle\", epoch)" },
        { name: "requestHash", meaning: "このリクエストの Poseidon(nonce)" },
      ],
    },
    proving: {
      title: "証明の作成",
      body: [
        "通常はスマホで作ります。ブラウザで snarkjs の Groth16（BN254）を動かし、ファイルはサーバーと同じ `single_proof.wasm`（2.7 MB）と `single_proof.zkey`（5.0 MB）です。共有画面を開いた時点でダウンロードを始めます。ノート PC の Chrome では、ファイルがキャッシュ済みなら証明の計算は1秒未満でした。スマホではまだ測っていません。",
        "古いブラウザやメモリ不足でスマホが作りきれないときは、その1回分だけ共有画面が `/api/prove` に送り、ボタンにそう表示します。サーバーは何も保存しません。ルールを満たさない場合（独身でない、持ち主が違う、証明書が書き換えられている）は端末の問題ではなく答えなので、サーバーでやり直しません。`PROVE_ON=server` にすればコードを変えずにすべてサーバーで作れます。モックの証明は常にサーバーで作ります。",
        "Mingle の検証者には、証明がどこで作られたかはわかりませんし、知る必要もありません。どちらでも同じように確かめます。ウォレットの共有履歴には、共有ごとに `provedOn: device | server` を記録しています。",
        "trusted setup は、イベント中に Hermez の powers of tau のミラーが 403 を返したため、2つの段階（powers of tau 2^14 と回路の鍵）をどちらもローカルで1回ずつ実施しました。デモには十分ですが、本番には使えません。PSE の Perpetual Powers of Tau のファイルは取得できるので、次はそれに移します。",
      ],
    },
    verification: {
      title: "検証（先にオフチェーン、次にオンチェーン）",
      offchainTitle: "Mingle の検証者（/api/verify）が確かめること",
      offchain: [
        "リクエストのトークンが正しく、期限切れでないこと。",
        "scopeHash と requestHash がこのリクエストと一致すること。",
        "発行者の鍵が、公開している区役所の鍵（`lib/zk/issuer-public.json`）と同じであること。",
        "共有した値が Mingle の求めたものと一致し、共有しない値が 0 であること。",
        "証明のモードがサーバーのモードと同じであること。クライアントがモックの証明に切り替えることはできません。",
        "検証鍵で groth16.verify が通ること。",
      ],
      treeTitle: "そのあとレジストリの record() が確かめること",
      tree: {
        call: "record(a, b, c, publicSignals)",
        issuer: "発行者の鍵は区役所の鍵か？",
        nullifier: "nullifier は使用済みか？",
        proof: "Groth16Verifier.verifyProof()",
        no: "いいえ",
        yes: "はい",
        true: "true",
        false: "false",
        issuerRevert: "revert UntrustedIssuer",
        nullifierRevert: "revert NullifierAlreadyUsed",
        proofRevert: "revert InvalidProof",
        ok: "nullifier を保存し、SingleStatusVerified を emit",
      },
      rule: "revert は失敗として表示します。Sepolia に接続できない、relayer のテスト用 ETH が尽きたなど、それ以外の理由で記録できなかったときは、Mingle はオフチェーンの検証結果を使い、「Mingle がオフチェーンで検証」と表示して、Etherscan のリンクは出しません。",
    },
    tokens: {
      title: "トークンとリプレイ対策",
      head: { name: "トークン", life: "有効期間", carries: "中身", stops: "防ぐもの" },
      rows: [
        {
          name: "Offer（受け取り券）",
          life: "10分（QR は3分ごとに更新）",
          carries: "住民 ID、発行日",
          stops: "古い QR コードをあとから使うこと",
        },
        {
          name: "Request（リクエスト）",
          life: "10分",
          carries: "nonce、scopeHash、requestHash、確認項目",
          stops: "証明を別のリクエストに使い回すこと。requestHash が証明に入っているため",
        },
        {
          name: "Result（結果）",
          life: "24時間",
          carries: "nonce、共有した事実、nullifier、トランザクションのハッシュ",
          stops: "Mingle が頼んでいない答えを受け入れること。nonce の一致が必要なため",
        },
      ],
      note: "3つとも、共通の TOKEN_SECRET で署名した HS256 の JWT です。デモでは1台のサーバーがすべての役を兼ねているためで、別々の組織ならそれぞれ自分の鍵で署名します。どう分けるかは「全体の構成」に書きました。",
    },
    modes: {
      title: "モックと本物の切り替え",
      lede: "連携ごとにモック版と本物があります。サーバーが環境変数で選ぶので、ブラウザ側から確認を切ることはできません。何も設定しなければ、4つともモックで動きます。",
      head: { part: "連携", env: "有効にする設定", mock: "モック", real: "本物", now: "このデプロイ" },
      rows: {
        auth: {
          part: "ログイン",
          env: "NEXT_PUBLIC_PRIVY_APP_ID",
          mock: "組み込みのデモ用アカウントと、ランダムな保有者鍵",
          real: "Privy 経由の Google。保有者鍵はウォレットの署名から作る",
        },
        prover: {
          part: "証明",
          env: "PROVER_MODE=groth16",
          mock: "サーバーが同じルールを確認し、証明の代わりに HMAC を使う",
          real: "EdDSA で署名した証明書と Groth16 の証明",
        },
        chain: {
          part: "チェーン",
          env: "CHAIN_MODE=sepolia",
          mock: "Mingle がオフチェーンで確認するだけ",
          real: "Sepolia の SingleProofRegistry に記録",
        },
        worldId: {
          part: "人間確認",
          env: "WORLDID_MODE=idkit と World ID のキー",
          mock: "カメラが5秒開くだけ。「シミュレーション」と表示",
          real: "IDKit 経由の World ID。World の Developer Portal が確認。ステージングでは World ID Simulator を使い、期間が切れるとシミュレーションに戻る",
        },
      },
      proveOn: {
        device: "証明をどこで作るかは別の設定です。このデプロイでは**スマホ**で作り、作れないときだけサーバーが代わります。`PROVE_ON=server` にするとサーバーで作ります。",
        server: "証明をどこで作るかは別の設定です。このデプロイでは、`PROVE_ON=server` が設定されているかモックの証明を使っているため、すべて**サーバー**で作ります。",
      },
      now: {
        auth: { mock: "モック", privy: "本物" },
        prover: { mock: "モック", groth16: "本物" },
        chain: { off: "オフチェーン", sepolia: "本物" },
        worldId: { simulated: "シミュレーション", "idkit-staging": "ステージング", idkit: "本物" },
      },
    },
  },

  built: {
    title: "作ったもの",
    lede: "コードはすべて ETHGlobal Tokyo 2026 の期間中に書きました。イベント前にあったのはアイデア、ピッチ、Figma のデザイン、circom のローカル検証、ブランド素材で、README に一覧があります。",
    doneTitle: "動いているもの",
    done: [
      "3分ごとに QR コードが変わる発行窓口",
      "DAS Busters のウォレット（受け取り、保存、共有する情報の選択、履歴）",
      "証明を求めてバッジを出す、サンプルのマッチングアプリ Mingle",
      "スマホの中で作る証明と、作れないときに代わるサーバー{{（circom の回路、snarkjs の Groth16）}}",
      "証明書に署名する区役所の役。公開鍵はリポジトリで公開{{（EdDSA-Poseidon）}}",
      "証明を確かめて使用済みの番号を記録する、Sepolia 上のコントラクト2つ。本物の証明でテストし、Sourcify と Blockscout でソースを検証済み{{（SingleProofRegistry、Groth16Verifier、Foundry）}}",
      "Privy 経由の Google ログインと、ウォレットの署名から作る保有者鍵",
      "World ID による人間確認。World のサーバーが検証{{（IDKit、Developer Portal）}}",
      "英語と日本語の画面",
    ],
    worldIdTitle: "このデプロイの人間確認",
    worldId: {
      simulated: "シミュレーション。ここでは World ID のキーを設定していないか、ステージングの期間が切れているため、World ID の証明は作りません。",
      "idkit-staging": "World ID のステージング環境。リクエストは本物で Developer Portal が確認し、ID は Simulator のテスト用。",
      idkit: "World ID。World の Developer Portal が証明を1件ずつ確認します。",
    },
    nextTitle: "まだ作っていないもの",
    next: [
      "証明書がいつ発行されたかの確認。結婚相談所は発行から3か月以内のものしか受け付けない。発行日は署名済みだが、まだ確かめていない",
      "失効。区役所が取り消した証明書を公開するしくみ",
      "証明のしくみの初期設定を、独立した大勢の参加者で行う{{（multi-party trusted setup。まず PSE の Perpetual Powers of Tau を使う）}}",
      "証明書と結びついた World ID の確認と、同じ World ID の重複の拒否",
      "本物の区役所の鍵と、本物の戸籍の照会",
      "区役所と Mingle で別々のサーバーと鍵（「全体の構成」を参照）",
      "Etherscan でもソースを公開する（Sourcify と Blockscout は検証済み）",
    ],
    stackTitle: "技術スタック",
    stack: [
      "Next.js 15",
      "TypeScript",
      "circom 2 + circomlib",
      "snarkjs · Groth16 · BN254",
      "EdDSA-Poseidon",
      "Solidity + Foundry",
      "viem",
      "Privy",
      "World ID IDKit",
      "Ethereum Sepolia",
      "Vercel",
    ],
  },

  check: {
    title: "自分で確かめる",
    lede: "このページの説明は、どれもリンク先を開いて確かめられます。",
    demoTitle: "デモを触る",
    demo: {
      hub: { label: "デモのハブ", note: "ここから始めます。窓口は PC で、ほかはスマホで開きます。" },
      counter: { label: "発行窓口", note: "QR コードを出す区役所の画面。" },
      wallet: { label: "DAS Busters", note: "スマホのウォレット。" },
      mingle: { label: "Mingle", note: "証明を求めるマッチングアプリ。" },
      reset: { label: "デモをリセット", note: "この端末の両アプリのデータを消して、もう一度始められます。" },
      config: { label: "現在のモード", note: "いま本物で動いている部分を示す JSON。" },
    },
    chainTitle: "オンチェーン（Ethereum Sepolia）",
    chain: {
      registryBlockscout: {
        label: "Blockscout の SingleProofRegistry",
        note: "ソース検証済み。Logs で SingleStatusVerified の記録がすべて読める形で見られます。",
      },
      verifierBlockscout: {
        label: "Blockscout の Groth16Verifier",
        note: "ソース検証済み。回路の検証鍵から snarkjs が生成したコントラクト。",
      },
      registrySourcify: { label: "Sourcify のレジストリのソース", note: "デプロイ済みのコントラクトとソースが完全に一致。" },
      verifierSourcify: { label: "Sourcify の検証コントラクトのソース", note: "デプロイ済みのコントラクトとソースが完全に一致。" },
      registry: {
        label: "Etherscan の SingleProofRegistry",
        note: "Etherscan でのソース検証が済むまで、イベントは16進のまま表示されます。",
      },
      registryDeploy: { label: "レジストリのデプロイ", note: "レジストリを作ったトランザクション。" },
      verifierDeploy: { label: "検証コントラクトのデプロイ", note: "検証コントラクトを作ったトランザクション。" },
    },
    sourceTitle: "ソースコード",
    source: {
      repo: { label: "GitHub リポジトリ", note: "公開しています。README、コントラクト、回路、アプリ。" },
      circuit: { label: "single_proof.circom", note: "回路。約100行。" },
      registry: { label: "SingleProofRegistry.sol", note: "コントラクト。約60行。" },
      tests: { label: "コントラクトのテスト", note: "本物の証明を使った Foundry のテスト。" },
      verificationKey: { label: "検証鍵", note: "証明を確かめるときに使う鍵。" },
      issuerKey: { label: "区役所の公開鍵", note: "検証者が信頼する唯一の発行者。" },
    },
    backgroundTitle: "背景（本物の証明書と、解きたい問題）",
    background: {
      koto: {
        label: "江東区の独身証明書",
        note: "記載されるのは氏名、生年月日、本籍と、民法第732条（重婚の禁止）に抵触しないこと。手数料は300円。",
      },
      youbride: {
        label: "youbride のヘルプ（独身証明書）",
        note: "発行から3か月以内のものに限り、見切れや隠しのない写真で提出。",
      },
      ibj: { label: "IBJ の入会に必要な書類", note: "独身証明書は発行から3か月以内の原本。" },
      digitalAgency: {
        label: "デジタル庁の記事（マイナンバーカードでの独身証明）",
        note: "タップルがマイナンバーカードで独身を確認するしくみの紹介。タップルの調査（2024年5月、5,429人）では、相手が独身だと何らかの形で証明してほしい人が男性で83.8%、女性で97.4%。",
      },
      tapple: { label: "タップルの「かんたん独身証明」", note: "マイナンバーカードを使う確認の開始（2025年4月30日）を伝えるサイバーエージェントの発表。" },
      npa: {
        label: "警察庁の2025年の統計",
        note: "SNS 型ロマンス詐欺は5,645件、546.4億円。最初の接触がマッチングアプリだったのは1,846件（32.7%）で、経路の中で最多。",
      },
    },
    docsTitle: "ドキュメント",
    docs: {
      readme: { label: "README", note: "概要、図、コントラクト、イベント前に作ったもの。" },
      demo: { label: "デモの手順", note: "3分のデモの操作と話す内容。" },
      aiUsage: { label: "AI の利用", note: "Claude Code が生成したものと、チームがやったこと。" },
    },
    recipeTitle: "3分で確かめる",
    recipe: [
      "PC でハブを開き「発行窓口」を押します。スマホで QR コードを読み、証明書を保存します。Google アカウントはどれでも使えます。",
      "スマホで Mingle を開き、「本人確認と証明」から「DAS Busters で確認」へ進んで共有します。",
      "バッジが出たら「Sepolia に記録済み」を押すと、トランザクションが開きます。読める形で見るには、下のリンクから Blockscout（誰でも使えるブロックチェーンの閲覧サイト）でレジストリを開きます。record の呼び出しとイベントが読める形で出ます。Etherscan はソース検証が済むまで、同じ内容を16進のまま表示します。",
      "イベントに入っている数は3つだけです。nullifier と、どのアプリのどのリクエストかを表す2つのハッシュです{{（SingleStatusVerified の nullifierHash、scopeHash、requestHash）}}。氏名も生年月日もありません。",
      "戻るボタンで「共有する情報を選ぶ」に戻り、もう一度共有します。同じ証明書なら nullifier も同じなので、コントラクトが拒否して Mingle にエラーが出ます。",
    ],
  },

  qa: {
    title: "よくある質問",
    lede: "先に短い答えを書いています。細かい説明と限界は「詳しく」を開くと読めます。",
    more: "詳しく",
    figs: {
      onchain: {
        label: "登録1件でブロックチェーンに残るもの",
        stored: ["匿名の番号（nullifier）", "どのアプリか（ハッシュ）", "どのリクエストか（ハッシュ）"],
        never: ["氏名", "生年月日", "住所", "証明書"],
      },
      server: {
        label: "証明はスマホが作り、Mingle には証明だけを送る。サーバーはスマホで作りきれないときだけ代わりに作り、何も保存しない。",
        phone: "スマホ",
        makes: "証明を作る",
        server: "サーバー",
        keeps: "予備 · 何も保存しない",
        mingle: "Mingle",
        send: "スマホで作れないときだけ",
        back: "証明",
        onward: "証明だけ",
      },
      borrow: {
        label: "証明書は、持ち主の鍵がなければ使えない。",
        cert: "健さんの証明書",
        bound: "健さんの鍵の指紋ごと署名済み",
        own: "健さんの鍵",
        other: "別の人の鍵",
        ok: "証明できる",
        no: "証明できない",
      },
      checks: {
        label: "先に Mingle のサーバーが確かめ、そのあとコントラクトが公開の場でもう一度確かめる。",
        first: "Mingle のサーバーが確認",
        firstNote: "すぐ答え、エラーもわかりやすい",
        second: "コントラクトがもう一度確認",
        secondNote: "公開の場で。記録済みの番号は拒否",
        stored: "匿名の番号を1つ保存",
      },
    },
    groups: [
      {
        title: "個人情報",
        items: [
          {
            id: "onchain",
            q: "名前がブロックチェーンに載ることはありますか？",
            a: "ありません。ブロックチェーンに残るのは、登録1件につき匿名の番号1つです。氏名、生年月日、住所は送られません。",
            d: "正確には、コントラクトが保存するのは nullifier で、イベントには、どのアプリのどのリクエストかを表す2つのハッシュが加わります{{（scopeHash、requestHash）}}。トランザクションの入力には証明の公開値10個も見えます。そこには区役所の公開鍵と、共有を選んだときだけ東京のコード（13）と生まれ年の範囲が入ります。",
          },
          {
            id: "mingle",
            q: "Mingle には自分の何が伝わりますか？",
            a: "証明すると選んだことだけです。独身であること、選べば東京在住と30代であること。証明書そのものは渡りません。",
            d: "ほかに Mingle が持つのは nullifier と、Sepolia のトランザクションへのリンクです。「30代」は生まれ年が1987〜1996年の範囲にあるという意味で、正確な年は伝わりません。署名されているのは生まれ年だけで、日付までは入っていません。",
          },
          {
            id: "server",
            q: "証明書はスマホの外に出ますか？",
            a: "ふだんは出ません。証明はスマホが自分で作り、Mingle に届くのは証明だけです。スマホで作りきれなかったときだけ、その1回分を私たちのサーバーが作ります。そのときは画面に表示し、サーバーは何も保存しません。",
            d: "スマホはブラウザの中で、サーバーと同じ回路ファイルを使って証明を作ります。サーバーに代わってもらうのは、古いブラウザやメモリ不足のような端末側の問題のときだけです。ルールを満たさない証明書はスマホで断り、どこにも送りません。証明をどこで作ったかは、ウォレットの履歴に残ります。デプロイの設定で、すべての証明をサーバーで作ることもでき{{（PROVE_ON=server）}}、そのときはこのページの冒頭に表示します。",
          },
          {
            id: "photo",
            q: "証明書の写真を送るのではだめですか？",
            a: "写真だと書いてあることが全部見え、しかも簡単に加工できます。証明なら見えるのは1つの事実だけで、加工した証明書からは作れません。",
            d: "回路の中で区役所の署名を確かめるので、書き換えた証明書では証明が作れません。どこに何が残るかは、上の「データの置き場所」にまとめています。",
          },
          {
            id: "japan",
            q: "マイナンバーカードで独身を確かめるしくみが、もうあるのでは？",
            a: "マッチングアプリのタップルは、マイナンバーカードから氏名、住所、性別を読み取り、戸籍の情報から婚姻の状況を取得します。アプリの手元には、確認済みの身元と婚姻の状況が並んで残ります。DAS Busters がアプリに渡すのは、確かめた事実1つと、アプリごとに変わる番号だけです。",
            d: "タップルは2025年4月30日から、マイナポータルを通じた「かんたん独身証明」を提供していて、デジタル庁も2025年10月17日の記事で紹介しています。どちらも「確かめる」にリンクがあります。発行者をデモの区役所からマイナポータルに置き換えても、証明の側はそのまま使えます。",
          },
          {
            id: "tracking",
            q: "アプリ同士で照らし合わせて、同じ人だと突き止められますか？",
            a: "できません。アプリごとに匿名の番号が変わるので、記録が一致しません。",
            d: "番号は、保有者鍵とアプリ名をまとめたハッシュです{{（nullifier = Poseidon(保有者鍵, スコープ)、スコープ = Poseidon(\"mingle\", epoch)）}}。デモには Mingle しかないので、ここで試せるものではなく設計上の性質です。",
          },
        ],
      },
      {
        title: "不正への対策",
        items: [
          {
            id: "fake",
            q: "証明書を書き換えたり、偽物を作ったりできますか？",
            a: "できません。区役所の署名がすべての値にかかっているので、書き換えた証明書や自作の証明書からは証明を作れません。",
            d: "回路は区役所の公開鍵で署名を確かめ、その公開鍵は証明の公開値に入ります。Mingle のサーバーもコントラクトも、公開している鍵{{（lib/zk/issuer-public.json）}}しか受け付けず、この鍵はデプロイ時にコントラクトへ固定しています。署名するメッセージは、独身かどうか、生まれ年、都道府県のコード、発行日、保有者鍵の指紋をまとめたハッシュです{{（Poseidon(isSingle, birthYear, residenceCode, issuedAt, holderCommitment)）}}。回路は、独身の欄が独身になっていることも確かめます{{（isSingle = 1）}}。",
          },
          {
            id: "borrow",
            q: "他人の証明書を借りて使えますか？",
            a: "使えません。証明書は持ち主の鍵の指紋と一緒に署名されていて、証明を作るにはその鍵そのものが要ります。",
            d: "鍵は、証明書を保存した Google アカウントの埋め込みウォレットの署名から作ります。ただしデモの窓口は、QR を読んだ人なら誰にでも健さんの証明書を渡します。本物の区役所なら、窓口で先に本人確認をします。",
          },
          {
            id: "accounts",
            q: "1人で Mingle のアカウントをいくつも作れますか？",
            a: "同じ証明書では作れません。同じ証明書からは毎回同じ匿名の番号ができ、コントラクトは一度保存した番号を拒否します。",
            d: "実際に試せます。戻ってもう一度共有すると、コントラクトが拒否します{{（NullifierAlreadyUsed）}}。ただし、この確認はオンチェーンにあるので Sepolia のモードが必要です。デモでは、番号の元になるアプリ名に、Mingle のブラウザが持つランダムな数も入れています{{（スコープ = Poseidon(\"mingle\", epoch)）}}。そのためデモのリセットで番号も新しくなります。本物の Mingle ならここは固定です。また Google アカウントが違えば鍵も違うので、1人1アカウントには区役所が1人に1枚だけ発行することも必要です。World ID は、証明書と結びつけて同じ World ID の重複を拒否すれば役に立ちますが、このデモではまだどちらもしていません。",
          },
          {
            id: "replay",
            q: "他人の証明を盗み見て、使い回せますか？",
            a: "別のリクエストには使えません。証明は答えた1つのリクエストに結びついていて、その匿名の番号も1回しか記録できません。",
            d: "Mingle のリクエストには1回だけ使うランダムな数{{（nonce）}}が入っていて、そのハッシュが証明の公開値の1つになります{{（requestHash = Poseidon(nonce)）}}。結果には、Mingle が保存しておいたその数が入っていなければなりません。限界もあります。サーバーはリクエストを使用済みにしないので、10分の有効期間内なら同じ証明をもう一度検証に出せます。Sepolia では、その nullifier が記録されるのはやはり1回だけです。また、コントラクトには誰でも証明を送れます{{（record() は誰でも呼べる）}}。証明がどのアプリのどのリクエストに答えたものかを確かめるのは、Mingle のサーバーだけです。",
          },
        ],
      },
      {
        title: "信頼と限界",
        items: [
          {
            id: "chain",
            q: "サーバーで確認しているのに、なぜブロックチェーンを使うのですか？",
            a: "最後の確認を公開の場で行うためです。私たちのサーバーを信じなくても、誰でもコントラクトの確認をやり直せて、受け付けた番号もすべて見られます。",
            d: "先に Mingle のサーバーが確認するのは、速く答えてわかりやすいエラーを出すためです。そのあとコントラクトが証明をもう一度確かめ、記録済みの nullifier を拒否するので、Mingle のサーバーを通さずに送っても、同じアプリでの2つ目のアカウントは通りません。限界もあります。コントラクトは、証明がどのアプリ向けかを確かめません{{（scopeHash）}}。デモではアプリ名に Mingle のブラウザが決めたランダムな数を足しているので{{（epoch）}}、Mingle のデータを消すと nullifier も変わります。本物の Mingle ならここは固定です。",
          },
          {
            id: "married",
            q: "証明書をもらったあとに結婚したら？",
            a: "今の証明は、証明書がいつ発行されたかを確かめていません。結婚相談所や youbride のようなアプリは発行から3か月以内のものしか受け付けないので、次に足す機能です。",
            d: "発行日はすでに証明書に署名されています。Mingle が「この日以降に発行」という日付を証明の公開値の1つとして送り{{（公開入力）}}、回路が比べる形にできます。ただし回路の鍵を作り直し、コントラクトを2つともデプロイし直す必要があるので、このデモには入れていません。失効に対応するには、区役所が取り消した証明書を公開する必要もあります。",
          },
          {
            id: "setup",
            q: "証明のしくみの初期設定は、本番でも安全ですか？",
            a: "まだ本番向けではありません。Groth16 には一度きりの初期設定（trusted setup）が必要で、今回は私たちが1台のマシンで行いました。本番では、独立した大勢の参加者で行う必要があります。",
            d: "初期設定では秘密の乱数が生まれ、そのすべてを知る人は証明を偽造できます。独立した参加者が大勢いれば、1人でも正直なら安全です。イベント中は Hermez の公開ファイルが 403 を返したため、各段階をローカルで1回ずつ実施しました。PSE の Perpetual Powers of Tau のファイルは取得できるので、次はそれに移します。",
          },
          {
            id: "key",
            q: "区役所の署名鍵が漏れたら？",
            a: "このデモでは、秘密鍵をデモのサーバーの環境変数に置いています。デモ全体を1つのサイトで動かすためで、リポジトリにあるのは公開鍵だけです。漏れた場合は、新しい鍵で新しいレジストリをデプロイします。",
            d: "レジストリの発行者鍵は変更できない作りで、そのぶん監査しやすくなっています。本物の区役所なら、鍵は区役所のハードウェアセキュリティモジュール（HSM）に置き、公開鍵は更新できる「信頼できる発行者の一覧」で公開します。想定している分け方は「全体の構成」にあります。",
          },
          {
            id: "worldid",
            q: "World ID の人間確認は本物ですか？",
            a: {
              simulated: "いいえ。このデプロイの人間確認はシミュレーションで、アプリのどこでもそう表示しています。",
              "idkit-staging": "連携は本物ですが、人は本物ではありません。World ID のステージング環境で動いていて、World App の代わりに World ID Simulator のテスト用 ID を使っています。",
              idkit: "本物です。サーバーが受け付ける前に、World の Developer Portal が World ID の証明を1件ずつ確かめます。",
            },
            d: {
              simulated:
                "カメラが5秒開くだけで、World ID の証明は作りません。World ID との連携自体はできていて、キーを設定し、ステージングの期間内なら World ID のステージング環境で動きます。World ID を使うと、証明書だけでは示せない「人間がこのリクエストを承認した」ことを加えられます。",
              "idkit-staging":
                "サーバーが IDKit のリクエストに署名し、結果を World の Developer Portal に転送します。Mingle は、そのあとサーバーが発行する署名付きトークンがあるときだけ人間確認を認めます。限界もあります。このトークンは ZK の証明の中ではなく横に並んで渡り、有効期間は7日で、まだ証明書とは結びついていません。World ID の nullifier の重複もまだ確認していません。",
              idkit:
                "サーバーが IDKit のリクエストに署名し、結果を World の Developer Portal に転送します。Mingle は、そのあとサーバーが発行する署名付きトークンがあるときだけ人間確認を認めます。限界もあります。このトークンは ZK の証明の中ではなく横に並んで渡り、有効期間は7日で、まだ証明書とは結びついていません。World ID の nullifier の重複もまだ確認していません。",
            },
          },
          {
            id: "gov",
            q: "これは本物の行政データですか？",
            a: "いいえ。佐藤 健さんは架空の人物で、区役所の役はデモ用の鍵を持つ私たちのサーバーが担っています。",
            d: "紙の独身証明書は実在します。本籍地の市区町村が200〜350円で発行し、結婚相談所が提出を求めています。本番にするには、区役所かマイナポータルがデジタル版を発行し、署名の鍵を持つ必要があります。",
          },
        ],
      },
      {
        title: "使い方と開発",
        items: [
          {
            id: "fees",
            q: "暗号資産や手数料は要りますか？",
            a: "要りません。Google でログインするだけで、Sepolia の手数料は私たちのサーバーのウォレットが払います。",
            d: "埋め込みウォレットは、鍵を作るためにメッセージに1回署名するだけです。トランザクションは送らず、ETH も要りません。",
          },
          {
            id: "speed",
            q: "どのくらい時間がかかりますか？",
            a: "スマホはまず回路ファイル 7.7 MB を読み込み、それから証明を作ります。Sepolia への記録には約12秒かかります。",
            d: "ノート PC の Chrome では、ファイルがキャッシュ済みなら証明の計算は1秒未満でした。スマホではまだ測っていません。サーバーは Sepolia のレシートを最大45秒待ちます。それを過ぎると Mingle は「まだ確定していない」という注記付きでバッジを出し、2分ほど確認を続けます。",
          },
          {
            id: "sepolia",
            q: "なぜ Ethereum のメインネットではなく Sepolia なのですか？",
            a: "公開のテストネットなので、デモが無料で、誰でも中身を確かめられるからです。",
            d: "RPC とレジストリのアドレスは環境変数から読みますが、コードが知っているチェーンは今のところ Sepolia とローカルだけで、Etherscan のリンクも Sepolia 固定です。World Chain のような別のチェーンに移すには、そのチェーンを追加してから、普通の Solidity のコントラクトをデプロイし直します。",
          },
          {
            id: "before",
            q: "イベント前に作ったものは何ですか？",
            a: "アイデア、ピッチ、Figma のデザイン、circom のローカル検証、ブランド素材です。このリポジトリのコードは、すべてイベント中に書きました。",
            d: "README の「イベント前に作ったもの」に一覧があり、AI_USAGE.md には Claude Code が生成したものとチームがやったことを記録しています。",
          },
        ],
      },
    ],
  },

  footer: {
    back: "デモに戻る",
    readme: "README を読む",
  },
};

export default referenceJa;
