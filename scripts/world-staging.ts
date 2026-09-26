import { readFileSync, writeFileSync } from "node:fs";

// Opens the Developer Portal's 24-hour staging window, so /api/v4/verify
// accepts proofs from the World ID Simulator. The Portal issues a token that
// every staging verify call must send; this writes it to .env.local as
// WORLDID_STAGING_TOKEN and prints only the expiry. Opening a new window
// replaces the old token, so update Vercel's copy afterwards.
//
//   npx tsx --env-file=.env.local scripts/world-staging.ts
const ENV_FILE = ".env.local";
const apiKey = process.env.WORLD_PORTAL_API_KEY;
const appId = process.env.WORLDID_APP_ID;
if (!apiKey?.startsWith("api_") || !appId?.startsWith("app_")) {
  console.error("Set WORLD_PORTAL_API_KEY (api_...) and WORLDID_APP_ID (app_...) in .env.local");
  process.exit(1);
}

const response = await fetch("https://developer.world.org/api/mcp", {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "set_world_id_staging_verification", arguments: { app_id: appId, enabled: true } },
  }),
});
const body = (await response.json().catch(() => null)) as {
  result?: { content?: { type: string; text: string }[]; isError?: boolean };
  error?: { message: string };
} | null;
if (!response.ok || !body || body.error || body.result?.isError) {
  console.error("The Portal refused:", response.status, body?.error?.message ?? body?.result?.content?.[0]?.text);
  process.exit(1);
}

const window = JSON.parse(body.result?.content?.[0]?.text ?? "{}") as {
  staging_verification_token?: string;
  staging_verification_expires_at?: string;
};
if (!window.staging_verification_token) {
  console.error("The Portal did not return a staging token");
  process.exit(1);
}

const line = `WORLDID_STAGING_TOKEN=${window.staging_verification_token}`;
const env = readFileSync(ENV_FILE, "utf8");
const next = /^WORLDID_STAGING_TOKEN=.*$/m.test(env)
  ? env.replace(/^WORLDID_STAGING_TOKEN=.*$/m, line)
  : `${env.trimEnd()}\n${line}\n`;
writeFileSync(ENV_FILE, next);
console.log(`Staging window open until ${window.staging_verification_expires_at}; token written to ${ENV_FILE}`);
