import deployment from "@/lib/chain/deployment-11155111.json";

// Everything /how-it-works links to, so each claim on the page can be
// checked. Contract addresses come from the deployment record, not retyped.

export const SITE_HOST = "das-busters.vercel.app";

const REPO = "https://github.com/CobaltSato/das-busters";
const ETHERSCAN = "https://sepolia.etherscan.io";
const BLOCKSCOUT = "https://eth-sepolia.blockscout.com";
const SOURCIFY = "https://repo.sourcify.dev/11155111";

// From contracts/broadcast/Deploy.s.sol/11155111/run-latest.json.
export const DEPLOY_TX = {
  verifier: "0xa5390431932e9f661b537023c5a280819d0f6b54703638c37e080e9c6ea0c402",
  registry: "0xb63ff9facb3c59346d93708f4484294560985c59f8fbfab31a25a80be709ee3b",
};

export const ADDRESSES = {
  registry: deployment.registry,
  verifier: deployment.verifier,
};

// In-app pages stay relative so the links also work on localhost.
export const DEMO_LINKS = {
  hub: "/",
  counter: "/counter",
  wallet: "/wallet",
  mingle: "/mingle",
  reset: "/reset",
  config: "/api/config",
} as const;

// Both contracts are source-verified (exact match) on Sourcify and
// Blockscout, so Blockscout shows each record call and event decoded.
// Etherscan is not verified yet and shows the same data as raw hex.
export const CHAIN_LINKS = {
  registryBlockscout: `${BLOCKSCOUT}/address/${deployment.registry}?tab=logs`,
  verifierBlockscout: `${BLOCKSCOUT}/address/${deployment.verifier}`,
  registrySourcify: `${SOURCIFY}/${deployment.registry}`,
  verifierSourcify: `${SOURCIFY}/${deployment.verifier}`,
  registry: `${ETHERSCAN}/address/${deployment.registry}#events`,
  registryDeploy: `${ETHERSCAN}/tx/${DEPLOY_TX.registry}`,
  verifierDeploy: `${ETHERSCAN}/tx/${DEPLOY_TX.verifier}`,
} as const;

// Where the real-world facts on the page come from.
export const BACKGROUND_LINKS = {
  digitalAgency: "https://digital-agency-news.digital.go.jp/articles/2025-10-17",
  tapple: "https://www.cyberagent.co.jp/news/detail/id=31851",
  npa: "https://www.npa.go.jp/bureau/safetylife/sos47/new-topics/260605/01.html",
  youbride: "https://support.youbride.jp/hc/ja/articles/7335924102809",
  ibj: "https://www.ibjapan.com/marriage/p_6101/",
  koto: "https://www.city.koto.lg.jp/060303/dokusinsyoumei.html",
} as const;

export const SOURCE_LINKS = {
  repo: REPO,
  circuit: `${REPO}/blob/main/circuits/single_proof.circom`,
  registry: `${REPO}/blob/main/contracts/src/SingleProofRegistry.sol`,
  tests: `${REPO}/blob/main/contracts/test/SingleProofRegistry.t.sol`,
  verificationKey: `${REPO}/blob/main/lib/zk/verification_key.json`,
  issuerKey: `${REPO}/blob/main/lib/zk/issuer-public.json`,
} as const;

// Docs have an English and a Japanese version.
export const DOC_LINKS = {
  readme: { en: `${REPO}/blob/main/README.md`, ja: `${REPO}/blob/main/README.ja.md` },
  demo: { en: `${REPO}/blob/main/docs/demo.md`, ja: `${REPO}/blob/main/docs/demo.ja.md` },
  aiUsage: { en: `${REPO}/blob/main/AI_USAGE.md`, ja: `${REPO}/blob/main/AI_USAGE.ja.md` },
} as const;
