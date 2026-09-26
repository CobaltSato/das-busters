import type { ReferenceCopy } from "./reference.en";

// Japanese copy for the second half of /how-it-works. English
// (reference.en.ts) is the source; keep this file in step.

const referenceJa: ReferenceCopy = {
  tech: {
    title: "内部の数字",
    lede: "数字はすべてコードから取っています。技術者向け表示にすると、回路、コントラクトの判定、トークン、モードが出ます。",
    numbers: [
      { value: "9,921", label: "回路の制約の数" },
      { value: "10", label: "Mingle が見る公開値" },
      { value: "1", label: "証明1件でチェーンに残る数" },
      { value: "0", label: "チェーンに載る氏名と生年月日" },
      { value: "1〜4秒", label: "証明を作る時間" },
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
        "証明はサーバーの `/api/prove` で、snarkjs の Groth16（BN254）で作ります。Vercel で1〜4秒。ファイルは `single_proof.wasm`（2.7 MB）と `single_proof.zkey`（5.0 MB）です。",
        "サーバーで作るのはメンターの助言による選択で、どのスマホでもデモが動きます。証明サーバーはリクエスト1回の間だけ証明書と保有者鍵を見て、何も保存しません。アプリでも「データは端末から出ない」とは書いていません。スマホ上での証明が次の課題です。",
        "trusted setup は、イベント中に公開のファイルに接続できなかったため、2つの段階（powers of tau 2^14 と回路の鍵）をローカルで1回ずつ実施しました。デモには十分ですが、本番には使えません。",
      ],
    },
    verification: {
      title: "検証: オフチェーン、次にオンチェーン",
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
      note: "3つとも同じサーバーが署名する HS256 の JWT です。デモでは1台のサーバーがすべての役を兼ねているためで、別々の組織ならそれぞれ自分の鍵で署名します。",
    },
    modes: {
      title: "モックと本物の切り替え",
      lede: "連携ごとにモック版と本物があります。サーバーが環境変数で選ぶので、ブラウザ側から確認を切ることはできません。何も設定しなければ、4つともモックで動きます。",
      head: { part: "部分", env: "有効にする設定", mock: "モック", real: "本物", now: "このデプロイ" },
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
      "DAS Busters のウォレット: 受け取り、保存、共有する情報の選択、履歴",
      "証明を求めてバッジを出す、サンプルのマッチングアプリ Mingle",
      "circom の回路と、サーバーで動く Groth16 の証明",
      "EdDSA-Poseidon で署名する発行者（公開鍵はリポジトリで公開）",
      "Ethereum Sepolia 上の SingleProofRegistry と Groth16Verifier。Foundry で本物の証明を使ってテスト済み",
      "Privy 経由の Google ログインと、埋め込みウォレットから作る保有者鍵",
      "IDKit 経由の World ID による人間確認。World の Developer Portal が検証",
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
      "スマホ上での証明作成。証明書がスマホから一切出なくなる",
      "有効期限と失効。発行日は署名済みだが、まだ確認していない",
      "複数人で行う trusted setup のセレモニー",
      "本物の区役所の鍵と、本物の戸籍の照会",
      "区役所、証明サーバー、Mingle ごとに別々の鍵",
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
      registry: { label: "SingleProofRegistry", note: "Events を開くと、SingleStatusVerified の記録がすべて見られます。" },
      verifier: { label: "Groth16Verifier", note: "回路の検証鍵から snarkjs が生成したコントラクト。" },
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
      "バッジが出たら「Sepolia に記録済み」を押します。Etherscan に SingleProofRegistry への record の呼び出しが出ます。",
      "トランザクションの Logs を開くと SingleStatusVerified イベントが1つあり、中身は nullifierHash、scopeHash、requestHash だけです。氏名も生年月日もありません。",
      "戻るボタンで「共有する情報を選ぶ」に戻り、もう一度共有します。同じ証明書なら nullifier も同じなので、レジストリが拒否して Mingle にエラーが出ます。",
    ],
  },

  qa: {
    title: "審査員によく聞かれること",
    lede: "質問を開くと、口頭で言える短い答えと、その下に詳細と限界があります。",
    say: "短い答え",
    details: "詳細",
    groups: [
      {
        title: "プライバシー",
        items: [
          {
            q: "証明書の写真を送るだけではだめなのですか？",
            a: "写真だと氏名、生年月日、住所まで渡り、しかも簡単に加工できます。証明なら渡るのは1つの事実だけで、区役所の署名が正しくなければそもそも作れません。",
            d: "回路の中で署名を確かめるので、書き換えた証明書からは証明を作れません。Mingle に残るのは、独身かどうかなどの答えと nullifier だけです。誰が何を持つかは、上の「データの置き場所」の表にあります。",
          },
          {
            q: "チェーンには正確に何が載りますか？個人情報は？",
            a: "レジストリが保存するのは nullifier 1つで、イベントにはスコープとリクエストのハッシュが加わります。氏名も生年月日も載りません。",
            d: "正確に言うと、トランザクションの入力には10個の公開シグナルがすべて載ります。区役所の公開鍵と、共有を選んだときだけ東京のコード（13）と生まれ年の範囲が入ります。",
          },
          {
            q: "Mingle と別のアプリが情報を突き合わせて、同じ人だとわかりませんか？",
            a: "わかりません。同じ人でもアプリごとに nullifier が違うので、記録が一致しません。",
            d: "nullifier = Poseidon(保有者鍵, スコープ) で、スコープにはアプリ名が入ります。デモには Mingle しかないので、ここで試せるものではなく設計上の性質です。",
          },
          {
            q: "証明はどこで作っていますか？証明書はスマホの外に出ますか？",
            a: "今はサーバーで作っています。スマホはリクエスト1回分だけ証明書と保有者鍵を送り、証明サーバーは何も保存しません。",
            d: "/api/prove で snarkjs を1〜4秒動かしているので、どのスマホでもデモが動きます。Mingle の検証者は証明書を受け取りません。アプリでも「データは端末から出ない」とは書いておらず、スマホ上での証明が次の課題です。",
          },
        ],
      },
      {
        title: "セキュリティ",
        items: [
          {
            q: "証明書が本物だと、Mingle はどうやってわかるのですか？",
            a: "回路が区役所の署名を確かめ、そのときに使った公開鍵が証明に含まれます。Mingle のサーバーもコントラクトも、それ以外の鍵を受け付けません。",
            d: "信頼する鍵は lib/zk/issuer-public.json で公開していて、レジストリにはデプロイ時に固定しています。ほかの誰かが署名した証明書は、オフチェーンでは untrusted-issuer、オンチェーンでは UntrustedIssuer で失敗します。",
          },
          {
            q: "証明書を書き換えて「独身」にできませんか？",
            a: "できません。婚姻状況も署名の対象なので、書き換えると署名の確認に失敗し、証明を作れません。",
            d: "署名するメッセージは Poseidon(isSingle, birthYear, residenceCode, issuedAt, holderCommitment) で、回路は isSingle = 1 も確かめます。",
          },
          {
            q: "他人の証明書を使えませんか？",
            a: "その人の保有者鍵がなければ使えません。証明書は保有者鍵のコミットメントと一緒に署名されていて、証明を作るには保有者鍵そのものが要ります。",
            d: "保有者鍵は、証明書を保存した Google アカウントの埋め込みウォレットの署名から作ります。ただし、デモの窓口は QR を読んだ人に誰でも健さんの証明書を渡すので、どの Google アカウントでも受け取れます。本物の区役所なら、窓口で先に本人確認をします。",
          },
          {
            q: "1人で Mingle のアカウントをたくさん作れませんか？",
            a: "同じ証明書では作れません。同じ保有者が同じアプリで使うと nullifier が同じになり、2回目はコントラクトが拒否します。",
            d: "実際に試せます。戻ってもう一度共有すると、レジストリが NullifierAlreadyUsed で拒否します。ただし、この確認はオンチェーンにあるので、Sepolia のモードが必要です。スコープは Mingle のブラウザが持つ epoch から作るので、デモのリセットで nullifier も新しくなります。本物の Mingle ならスコープは固定です。また Google アカウントが違えば保有者鍵も違うので、1人1アカウントには区役所が1人に1枚だけ発行することも必要です。World ID のような人間確認は、この穴を埋めるためのものです。",
          },
          {
            q: "見かけた証明をそのまま使い回されませんか？",
            a: "証明は requestHash で1つのリクエストに結びついていて、nullifier は1回しか記録できません。",
            d: "Mingle のリクエストにはランダムな nonce が入り、requestHash = Poseidon(nonce) が証明の公開入力になります。結果には Mingle が保存した nonce が入っていなければなりません。限界もあります。サーバーはリクエストを使用済みにしないので、10分の有効期間内なら同じ証明をもう一度検証に出せます。Sepolia では、その nullifier が記録されるのはやはり1回だけです。また、コントラクトの record() は誰でも呼べて、スコープと新しさの確認は Mingle のオフチェーンの検証者だけが行います。",
          },
          {
            q: "trusted setup は安全ですか？",
            a: "本番向けではありません。私たちが1台のマシンで実施したもので、本番では複数人で行うセレモニーが必要です。",
            d: "Groth16 の setup では秘密の乱数が生まれ、そのすべてを知る人は証明を偽造できます。独立した参加者が大勢いれば、1人でも正直なら安全です。今回はイベント中に公開のファイルに接続できなかったため、各段階をローカルで1回ずつ実施しました。",
          },
        ],
      },
      {
        title: "信頼と限界",
        items: [
          {
            q: "証明書をもらったあとに結婚したら？",
            a: "今の証明は、証明書がいつ発行されたかを確かめていません。最初に足すべき機能です。",
            d: "発行日はすでに証明書に署名されているので、回路に「この日以降に発行」という公開入力を足すのは小さな変更です。失効に対応するには、区役所が失効リストを公開する必要があります。",
          },
          {
            q: "区役所の鍵が漏れたら？",
            a: "秘密鍵はサーバーの環境変数にしか置いておらず、リポジトリにあるのは公開鍵だけです。漏れた場合は、新しい鍵で新しいレジストリをデプロイすることになります。",
            d: "レジストリの発行者鍵は変更できない作りで、そのぶん監査しやすくなっています。本番では、区役所が管理する発行者のレジストリなどで鍵を入れ替えられるようにする必要があります。",
          },
          {
            q: "このデモの World ID は本物ですか？",
            a: {
              simulated: "いいえ。このデプロイの人間確認はシミュレーションで、アプリのどこでもそう表示しています。",
              "idkit-staging": "連携は本物ですが、人は本物ではありません。World ID のステージング環境で動いていて、World App の代わりに World ID Simulator のテスト用 ID を使っています。",
              idkit: "本物です。サーバーが受け付ける前に、World の Developer Portal が World ID の証明を1件ずつ確かめます。",
            },
            d: {
              simulated:
                "カメラが5秒開くだけで、World ID の証明は作りません。World ID との連携自体はできていて、キーを設定し、ステージングの期間内なら World ID のステージング環境で動きます。ここで World ID を使う理由は、証明書だけでは示せない「アカウントの向こうに一人の人間がいる」ことを加えるためです。",
              "idkit-staging":
                "サーバーが IDKit のリクエストに署名し、結果を World の Developer Portal に転送します。Mingle は、そのあとサーバーが発行する署名付きトークンがあるときだけ人間確認を認めます。限界もあります。このトークンは ZK の証明の中ではなく横に並んで渡り、有効期間は7日で、まだ証明書とは結びついていません。World ID の nullifier の重複もまだ確認していません。",
              idkit:
                "サーバーが IDKit のリクエストに署名し、結果を World の Developer Portal に転送します。Mingle は、そのあとサーバーが発行する署名付きトークンがあるときだけ人間確認を認めます。限界もあります。このトークンは ZK の証明の中ではなく横に並んで渡り、有効期間は7日で、まだ証明書とは結びついていません。World ID の nullifier の重複もまだ確認していません。",
            },
          },
          {
            q: "なぜブロックチェーンが要るのですか？サーバーでもう検証していますよね。",
            a: "最後の検証を公開の場で行うためです。コントラクトの検証は誰でもやり直せて、受け付けた nullifier もすべて見られます。",
            d: "先に Mingle のサーバーが検証するのは、速く答えてわかりやすいエラーを出すためです。そのあとコントラクトが証明をもう一度確かめ、記録済みの nullifier を拒否するので、Mingle のサーバーを通さずに送っても、同じスコープの2つ目のアカウントは通りません。限界もあります。コントラクトは、証明がどのスコープ向けかを確かめません。デモでは Mingle のブラウザが epoch を決めるので、Mingle のデータを消すと nullifier も変わります。本物の Mingle ならスコープは固定です。",
          },
          {
            q: "これは本物の行政データですか？",
            a: "いいえ。佐藤 健さんは架空の人物で、区役所の役はデモ用の鍵を持つ私たちのサーバーが担っています。",
            d: "紙の独身証明書は実在します。市区町村が発行し、結婚相談所が提出を求めています。本番にするには、区役所がデジタル版を発行し、署名の鍵を持つ必要があります。",
          },
        ],
      },
      {
        title: "開発",
        items: [
          {
            q: "トランザクションの手数料は誰が払いますか？利用者に暗号資産は要りますか？",
            a: "Sepolia の手数料は私たちの relayer のウォレットが払います。利用者は Google でログインするだけです。",
            d: "埋め込みウォレットは、保有者鍵を作るためにメッセージに1回署名するだけです。トランザクションは送らず、ETH も要りません。",
          },
          {
            q: "どのくらい速いですか？",
            a: "証明の作成が1〜4秒、Sepolia への記録がおよそ1ブロック、約12秒です。",
            d: "サーバーはレシートを最大45秒待ちます。それを過ぎると Mingle は「まだ確定していない」という注記付きでバッジを出し、2分ほど確認を続けます。",
          },
          {
            q: "なぜメインネットや L2 ではなく Sepolia なのですか？",
            a: "公開のテストネットなので、デモが無料で、誰でも中身を確かめられるからです。別のチェーンへの移行も小さな変更で済みます。",
            d: "RPC とレジストリのアドレスは環境変数から読みますが、コードが知っているチェーンは今のところ Sepolia とローカルだけで、Etherscan のリンクも Sepolia 固定です。World Chain のような L2 に移すには、そのチェーンを追加してから、普通の Solidity のコントラクトをデプロイし直します。",
          },
          {
            q: "「30代」は正確には何を証明していますか？",
            a: "生まれ年がある範囲に入っていることです。2026年の30代なら1987〜1996年生まれ。正確な年齢ではありません。",
            d: "Mingle が範囲を送り、回路が minBirthYear ≤ birthYear ≤ maxBirthYear を確かめます。署名しているのは生まれ年だけで、生年月日の日付までは入っていません。",
          },
          {
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
