import type { StoryCopy } from "./story.en";

// Japanese copy for the first half of /how-it-works. English (story.en.ts)
// is the source; keep this file in step.

const storyJa: StoryCopy = {
  meta: {
    title: "しくみ",
    description: "DAS Busters がゼロ知識証明で独身であることを証明するしくみを、基礎からコントラクトまで説明します。",
  },
  hubLink: "はじめての方は、まずしくみの説明へ",
  nav: {
    home: "DAS Busters",
    label: "このページの内容",
    why: "なぜ",
    idea: "考え方",
    basics: "基礎",
    flow: "流れ",
    architecture: "構成",
    tech: "技術詳細",
    built: "作ったもの",
    check: "確かめる",
    qa: "Q&A",
  },

  hero: {
    eyebrow: "しくみ",
    title: ["証明書は封をしたまま、", "1行だけ見せる。"],
    lede: "DAS Busters を使うと、マッチングアプリは独身証明書を見ないまま、あなたが独身だと確かめられます。このページでは、そのしくみを基礎からスマートコントラクトまで説明し、それぞれを自分で確かめられる場所も示します。",
    envelope: {
      label: "証明書が窓付き封筒に入り、窓からは婚姻状況の行だけが見える様子。",
      heading: "独身証明書",
      fields: [
        { label: "氏名", value: "佐藤 健" },
        { label: "生年月日", value: "1990年4月18日" },
        { label: "住所", value: "東京都" },
        { label: "婚姻状況", value: "独身" },
      ],
      issuer: "渋谷区",
      seal: "署名済",
      confidential: "親展",
      window: "Mingle に見えるのはここだけ",
    },
    pitchTitle: "30秒で説明すると",
    pitch: [
      "マッチングアプリには、独身と偽る人がいます。区役所の独身証明書があれば確かめられますが、そのコピーを送ると、知り合ったばかりの会社に氏名、生年月日、住所まで渡してしまいます。",
      "DAS Busters は、署名付きの証明書をスマホに保存します。マッチングアプリ Mingle に確認を求められたら、Mingle が受け取るのは証明書ではなく**ゼロ知識証明**です。区役所が「独身」と署名した証明書を持っていることを、証明書を見せずに数学で納得させるしくみです。今のところ証明は私たちのサーバーで作っていて、サーバーはその1回のリクエストの間だけ証明書を読み、何も保存しません。",
      "Ethereum Sepolia 上のスマートコントラクトがその証明をもう一度検証し、匿名の番号 **nullifier** を1つだけ記録します。これで同じ証明書から Mingle の2つ目のアカウントは作れません。チェーンには氏名も生年月日も載りません。",
    ],
    statusTitle: "このデプロイで動いているもの",
    notice: {
      mockProver:
        "このデプロイはモックの証明を使っています。サーバーは同じルールを確認しますが、ゼロ知識証明は作りません。以下の Groth16 の説明は本物の証明についてのものです。",
      offChain: "このデプロイはオフチェーンでのみ検証するので、以下の Sepolia のステップはここでは動きません。",
    },
  },

  why: {
    title: "なぜ作ったか",
    body: [
      "マッチングアプリには信頼の問題があります。独身だと言っている人の中に、そうでない人がいます。",
      "日本には、紙の答えがすでにあります。本籍地の市区町村が発行する独身証明書で、結婚相談所では入会のときに提出を求めるのが一般的です。",
      "困るのは、アプリにコピーを送ることです。証明書には氏名、生年月日、住所が載っていますが、アプリが知りたいのはそのうち1つの事実だけです。",
    ],
    diagram: {
      label: "独身を証明する2つの方法。コピーを送ると Mingle にすべての項目が渡る。DAS Busters なら、確かめられた事実が1つだけ渡る。",
      copyLane: "コピーを送る",
      zkLane: "DAS Busters を使う",
      certificate: "証明書",
      mingleSees: "Mingle が見るもの",
      fields: ["氏名", "生年月日", "住所", "独身"],
      proof: "証明",
      single: "独身 ✓",
      hidden: "非公開",
    },
  },

  idea: {
    title: "考え方を1枚の図で",
    lede: "登場するのは3者と、公開の記録が1つ。区役所が証明書を1回だけ発行し、スマホが保存します。Mingle が受け取るのは証明だけです。",
    label: "証明書は区役所からスマホへ1回だけ渡る。スマホは Mingle に証明を送る。証明は Sepolia に記録され、残るのは nullifier だけ。",
    roles: {
      issuer: {
        name: "区役所",
        role: "発行者",
        body: "戸籍であなたを確認し、デジタルの証明書に署名します。",
      },
      holder: {
        name: "あなたのスマホ",
        role: "保有者 · DAS Busters",
        body: "証明書を保管します。何を、誰に証明するかはあなたが決めます。",
      },
      verifier: {
        name: "Mingle",
        role: "検証者",
        body: "質問をして、答えを確かめます。証明書そのものは受け取りません。",
      },
      chain: {
        name: "Ethereum Sepolia",
        role: "公開の記録",
        body: "スマートコントラクトが証明をもう一度確かめ、匿名の番号を1つだけ覚えます。",
      },
    },
    links: {
      certificate: "署名付きの証明書（1回だけ）",
      proof: "証明書ではなく証明",
      record: "nullifier だけを記録",
    },
  },

  basics: {
    title: "7つの基礎",
    lede: "この先を読むのに暗号の知識はいりません。部品を1つずつ説明し、アプリのどこで使っているかも書きます。",
    inApp: "このアプリでは",
    signature: {
      title: "デジタル署名",
      analogy: "偽造も、別の書類への押し直しもできないハンコ。",
      body: "区役所は、自分だけが知る秘密鍵と、誰でも見られる公開鍵を持っています。秘密鍵で書類に署名すると、署名ができます。署名は公開鍵を使えば誰でも確かめられ、書類の数字を1つ変えるだけで合わなくなります。",
      formula: ["sign(秘密鍵, 証明書) → 署名", "check(公開鍵, 証明書, 署名) → ✓"],
      inApp: "区役所は **BabyJubJub 曲線上の EdDSA** で署名します。ゼロ知識証明の中で安く確かめられる方式です。",
    },
    hash: {
      title: "ハッシュ",
      analogy: "データの指紋。",
      body: "ハッシュ関数は、どんな入力も決まった大きさの数に変えます。同じ入力からは必ず同じ数が出て、出てきた数から入力を逆算することはできません。",
      formula: ["Poseidon(1) → 1858…9027", "Poseidon(2) → 8645…4349"],
      inApp: "ZK 回路向けに作られたハッシュ **Poseidon** を使います。証明書は署名の前にハッシュし、保有者鍵は区役所に渡す前にハッシュします。",
    },
    zk: {
      title: "ゼロ知識証明",
      analogy: "答えを言わずに、答えを知っていると示す。",
      body: "ゼロ知識証明を使うと、ある主張が正しいことを、根拠を見せずに相手に納得させられます。ここでの主張は「区役所が署名した証明書を持っていて、それは自分に発行されたもので、独身と書いてある」です。Mingle は証明を確かめて、主張が正しいことを知ります。それ以外は何もわかりません。",
      inApp: "**circom** で書いた回路を **Groth16** で証明します。証明は数百バイトで、確かめるのにかかるのは数ミリ秒です。",
      diagram: {
        label: "証明書、署名、保有者鍵は回路に入ったまま出てこない。出てくるのは「独身」と nullifier だけ。",
        private: "非公開: 中に残る",
        public: "公開: Mingle が見る",
        inputs: ["証明書", "署名", "保有者鍵"],
        circuit: "回路",
        checks: "9,921 個の制約",
        outputs: ["独身 ✓", "nullifier"],
      },
    },
    nullifier: {
      title: "nullifier（ナリファイア）",
      analogy: "同じ店では毎回同じで、店が変わると別になる整理券番号。",
      body: "nullifier は、保有者鍵とアプリのスコープをまとめてハッシュした数です。同じ人が同じアプリで使うと必ず同じ数になるので、同じ証明書で2つ目のアカウントを作ろうとすると見つかります。別のアプリでは別の数になるので、アプリ同士で突き合わせることもできません。数そのものからは、誰なのかはわかりません。",
      inApp: "`nullifier = Poseidon(保有者鍵, Mingle のスコープ)`。レジストリのコントラクトは、一度記録した nullifier を受け付けません。",
      diagram: {
        label: "Mingle では同じ保有者鍵から毎回同じ nullifier ができるので、2つ目のアカウントは拒否される。別のアプリでは別の番号になる。",
        secret: "保有者鍵",
        rows: [
          { app: "Mingle", account: "1つ目のアカウント", result: "受け付け" },
          { app: "Mingle", account: "2つ目のアカウント", result: "拒否: 使用済み" },
          { app: "別のアプリ", account: "どのアカウントでも", result: "別の番号" },
        ],
      },
    },
    chain: {
      title: "ブロックチェーンとスマートコントラクト",
      analogy: "誰にも消せない公開のノートと、自動で動くルール。",
      body: "ブロックチェーンは、誰でも読めて、どの会社も単独では書き換えられない共有の記録です。スマートコントラクトはその上に置いたプログラムで、書かれたとおりに、公開の場で動きます。",
      formula: ["record(証明) → verifyProof ✓ → used[nullifier] = true"],
      inApp: "**Ethereum Sepolia**（Ethereum の公開テストネット）に2つのコントラクトを置いています。Groth16 の検証コントラクトと **SingleProofRegistry** です。手数料はサーバーのウォレット（relayer）が払うので、利用者に暗号資産はいりません。",
    },
    worldId: {
      title: "World ID",
      analogy: "一人の本物の人間であることを、誰なのかは明かさずに示す。",
      body: "World ID を使うと、アプリは名前も顔も ID 番号も知らないまま、アカウントの向こうに一人の人間がいることを確かめられます。ボットや重複アカウントへの対策で、マッチングアプリの信頼の問題のもう半分にあたります。",
      inApp: "共有する情報に、任意で人間確認を加えられます。",
      status: {
        simulated:
          "このデプロイでは、人間確認は**シミュレーション**です。カメラが5秒開くだけで、World ID の証明は作りません。画面のどこでも「シミュレーション」と表示しています。",
        "idkit-staging":
          "このデプロイでは、人間確認は **World ID のステージング環境**で動きます。IDKit のリクエストも World の Developer Portal による検証も本物ですが、承認するのは World ID Simulator のテスト用 ID です。証明しているのは本物の人間ではなくテスト用の ID で、画面には「ステージング」と表示します。",
        idkit:
          "このデプロイでは、人間確認に **World ID** を使います。World の Developer Portal が証明を1件ずつ確かめ、DAS Busters が受け取るのは「はい」と、このアプリでしか使えない匿名のコードだけです。",
      },
    },
    privy: {
      title: "Google でログイン（Privy）",
      analogy: "Google アカウントに、目立たずウォレットが付く。",
      body: "Privy が Google でのログインを受け持ち、埋め込みウォレットを作ります。自分で管理しなくてよい鍵のペアです。",
      formula: ["wallet.sign(\"DAS Busters holder key v1 …\") → SHA-256 → 保有者鍵"],
      inApp: "ウォレットが決まったメッセージに1回署名し、その署名のハッシュが**保有者鍵**になります。これで証明書があなたの Google アカウントに結びつきます。トランザクションは送らず、費用もかかりません。",
    },
  },

  flow: {
    title: "1回の流れを順番に",
    lede: "3分のデモで起きていることを、メッセージ1つずつ追います。健さんは渋谷区に住む架空の人物です。再生を押すか、自分のペースで進めてください。",
    label: "ステップごとの流れ",
    actors: {
      counter: "窓口",
      phone: "スマホ",
      google: "Google",
      server: "サーバー",
      mingle: "Mingle",
      chain: "Sepolia",
    },
    phases: {
      issue: "証明書を受け取る",
      ask: "Mingle が確認を求める",
      prove: "証明を作る",
      verify: "検証して記録する",
    },
    controls: {
      previous: "前のステップ",
      next: "次のステップ",
      play: "再生",
      pause: "一時停止",
      restart: "最初から",
      step: "ステップ {n} / {total}",
      goTo: "ステップ {n} へ: {title}",
      tech: "内部の動き",
      data: "やりとりされるもの",
      allSteps: "16ステップをすべて文章で読む",
    },
    serverNote:
      "デモでは、1台の Next.js サーバーが区役所、証明サーバー、Mingle のバックエンドの3役を兼ねています。実際にはそれぞれ別の組織で、鍵も別々です。",
    steps: {
      offer: {
        arrow: "POST /api/offer",
        title: "窓口が受け取り券をもらう",
        body: "区役所の窓口画面がサーバーに受け取り券を頼み、QR コードで表示します。整理券のように、3分ごとに新しいコードに変わります。",
        tech: "種類が「offer」の HS256 JWT で、有効期間は10分。住民 ID と発行日が入っています。",
        data: "住民 ID と日付。個人情報は入っていません。",
      },
      scan: {
        arrow: "QR を読む",
        title: "健さんが QR コードを読み取る",
        body: "スマホで DAS Busters が受け取り券付きで開き、証明書のプレビュー（氏名、生年月日、婚姻状況）を表示します。",
        tech: "/wallet/receive?offer=… 。プレビューを出す前に、サーバーが受け取り券を確かめます。",
        data: "URL に入った受け取り券。",
      },
      google: {
        arrow: "Google で続ける",
        title: "健さんが Google でログインする",
        body: "Privy が Google でのログインを受け持ち、埋め込みウォレットを用意します。",
        tech: "Privy の OAuth（Google のみ）。埋め込みウォレットは最初のログインで作られます。",
        data: "Google のログインだけ。証明書の中身は関係しません。",
      },
      secret: {
        arrow: "署名 → 鍵",
        title: "スマホが健さんの保有者鍵を作る",
        body: "ウォレットが決まったメッセージに署名し、スマホがその署名をハッシュして保有者鍵にします。保有者鍵は、証明を作るとき以外はスマホから出ません。",
        tech: "holderSecret = 署名の16進文字列を SHA-256 にかけた先頭31バイト。BN254 のフィールドに収まる大きさにしています。",
        data: "スマホの外には何も出ません。",
      },
      commit: {
        arrow: "Poseidon(鍵)",
        title: "スマホが証明書を申し込む",
        body: "スマホは受け取り券と、保有者鍵の指紋（ハッシュ）を送ります。保有者鍵そのものは送りません。",
        tech: "POST /api/credential { offer, holderCommitment = Poseidon(holderSecret) }",
        data: "受け取り券とハッシュ1つ。",
      },
      issue: {
        arrow: "署名付き証明書",
        title: "区役所が署名する",
        body: "サーバーが健さんを照会し、保有者鍵の指紋と一緒に証明書に署名して返します。スマホは証明書と保有者鍵を保存します。",
        tech: "Poseidon(isSingle, birthYear, residenceCode, issuedAt, holderCommitment) に EdDSA-Poseidon で署名。スマホの localStorage に保存します。",
        data: "証明書。渡る先はスマホだけ。",
      },
      request: {
        arrow: "POST /api/request",
        title: "Mingle が証明を求める",
        body: "健さんが Mingle を開いて「DAS Busters で確認」を押すと、Mingle は何を知りたいかを書いた署名付きのリクエストを受け取ります。",
        tech: "リクエスト JWT（10分）。ランダムな nonce、scopeHash = Poseidon(\"mingle\", epoch)、requestHash = Poseidon(nonce)、任意の確認項目（東京、30代）が入っています。",
        data: "質問だけ。個人情報は入っていません。",
      },
      open: {
        arrow: "DAS Busters を開く",
        title: "Mingle が DAS Busters に引き継ぐ",
        body: "Mingle はリクエストを付けて DAS Busters の共有画面を開き、リクエストの nonce を覚えておきます。",
        tech: "/wallet/share?req=… 。あとで答えと照合するために nonce を保存します。",
        data: "URL に入ったリクエスト。",
      },
      choose: {
        arrow: "選ぶ",
        title: "健さんが共有する情報を選ぶ",
        body: "独身であることは必須です。東京在住と年代: 30代は任意です。氏名、生年月日、証明書の原本は渡りません。",
        tech: "2つのスイッチが revealResidence と revealAge のフラグになります。",
        data: "スマホの外には何も出ません。",
      },
      prove: {
        arrow: "POST /api/prove",
        title: "スマホが証明を頼む",
        body: "スマホは、このリクエスト1回分だけ、証明書と保有者鍵を証明サーバーに送ります。証明サーバーは回路を実行し、何も保存しません。",
        tech: "snarkjs の groth16.fullProve を single_proof.wasm と single_proof.zkey で実行。Vercel で1〜4秒。スマホ上で証明を作るのが次の課題です。",
        data: "証明書と保有者鍵。渡る先は証明サーバーだけで、1回のリクエストの間だけ。",
      },
      proof: {
        arrow: "証明 + 公開値10個",
        title: "証明が返ってくる",
        body: "証明サーバーは、証明と10個の公開値を返します。nullifier、区役所の公開鍵、2つの共有フラグ、東京のコードと生まれ年の範囲（共有しないときは0）、スコープ、リクエストのハッシュです。",
        tech: "Groth16 の証明 (a, b, c) と、決まった順番の publicSignals。",
        data: "証明と10個の公開値。",
      },
      verify: {
        arrow: "POST /api/verify",
        title: "Mingle の検証者が確かめる",
        body: "検証者は、証明がこのリクエストへの答えであること、区役所の鍵が信頼しているものであること、計算が合っていることを確かめます。",
        tech: "リクエスト JWT、scopeHash と requestHash、発行者の鍵、共有した値を確認し、最後にオフチェーンで groth16.verify を実行します。",
        data: "証明と公開値。証明書は渡りません。",
      },
      record: {
        arrow: "record(証明)",
        title: "relayer が Sepolia に送る",
        body: "サーバーのウォレットが、証明をレジストリのコントラクトに送ります。先に呼び出しを試すので、拒否されたときは成功と見せずにエラーを出します。",
        tech: "simulateContract のあと writeContract。レシートを最大45秒待ちます。コントラクトの拒否はエラーにします。Sepolia に接続できないなど、それ以外の失敗のときは Mingle のオフチェーンの検証結果を使い、結果にもそう表示します。",
        data: "公開のトランザクションに載った証明と公開値。",
      },
      registry: {
        arrow: "確認 → 記録",
        title: "コントラクトがもう一度確かめる",
        body: "コントラクトは、区役所の鍵、nullifier が未使用であること、証明を確かめます。そのあと nullifier を保存し、イベントを記録します。",
        tech: "SingleProofRegistry.record → Groth16Verifier.verifyProof → emit SingleStatusVerified(nullifierHash, scopeHash, requestHash)。",
        data: "保存されるのは nullifier 1つ。",
      },
      result: {
        arrow: "署名付きの結果",
        title: "検証者が結果に署名する",
        body: "サーバーは、何が証明されたか、nullifier、Sepolia のトランザクションを入れた署名付きの結果を返します。",
        tech: "結果 JWT（24時間）。リクエストの nonce、共有した事実、nullifier、トランザクションのハッシュが入っています。",
        data: "証明された事実、nullifier、トランザクションのハッシュ。",
      },
      badge: {
        arrow: "Mingle に戻る",
        title: "Mingle がバッジを出す",
        body: "Mingle は結果の署名と、それが自分のリクエストへの答えであることを確かめ、「独身証明済み」を表示します。Etherscan のトランザクションへのリンクは「本人確認と証明」の画面にあります。",
        tech: "/mingle?result=… はサーバーで確認し、nonce が Mingle の保存した値と一致する必要があります。",
        data: "Mingle に残るのは、独身であること、選んだ事実、nullifier。",
      },
    },
  },

  architecture: {
    title: "全体の構成",
    lede: "画面はすべて、Vercel 上の1つの Next.js アプリで動いています。残りは外部サービス2つとコントラクト2つです。",
    browser: {
      title: "ブラウザ",
      counter: "発行窓口",
      wallet: "DAS Busters",
      mingle: "Mingle",
      storage: "スマホのストレージ: 証明書と保有者鍵",
    },
    server: {
      title: "サーバー（Vercel 上の Next.js）",
      issuer: { name: "区役所", routes: "/api/offer · /api/credential", key: "発行者の署名鍵" },
      prover: { name: "証明サーバー", routes: "/api/prove", key: "回路ファイル（wasm、zkey）" },
      verifier: { name: "Mingle のバックエンド", routes: "/api/request · /api/verify · /api/tx", key: "relayer のウォレット" },
      worldId: { name: "人間確認", routes: "/api/world-id/*", key: "World ID の署名鍵" },
    },
    outside: {
      title: "外部",
      privy: { name: "Privy + Google", note: "ログインと埋め込みウォレット" },
      chain: { name: "Ethereum Sepolia", note: "SingleProofRegistry → Groth16Verifier" },
      worldId: { name: "World ID", note: "Developer Portal" },
    },
    worldIdStatus: {
      simulated: "ここではシミュレーション",
      "idkit-staging": "ステージング",
      idkit: "本番",
    },
    dataTitle: "データの置き場所",
    dataHead: { place: "場所", holds: "持っているもの", never: "持たないもの" },
    dataRows: [
      {
        place: "あなたのスマホ",
        holds: "署名付きの証明書、保有者鍵、共有の履歴。",
        never: "なし",
      },
      {
        place: "証明サーバー（/api/prove）",
        holds: "証明書と保有者鍵。ただしリクエスト1回の間だけで、保存しません。",
        never: "リクエストが終わったあとのすべて。",
      },
      {
        place: "Mingle",
        holds: "独身であること。東京在住と30代は選んだときだけ。nullifier とトランザクションへのリンク。",
        never: "氏名、生年月日、住所、証明書。",
      },
      {
        place: "Ethereum Sepolia",
        holds: "nullifier。イベントに入るスコープとリクエストのハッシュ。トランザクションの入力には10個の公開値がすべて見え、東京のコードと生まれ年の範囲は共有したときだけ入ります。",
        never: "氏名、生年月日、証明書。",
      },
    ],
  },
};

export default storyJa;
