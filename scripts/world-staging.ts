import { readFileSync, writeFileSync } from "node:fs";

// Opens the Developer Portal's 24-hour staging window, so /api/v4/verify
// accepts proofs from the World ID Simulator. The Portal issues a token that
// every staging verify call must send; this writes it to .env.local as
// WORLDID_STAGING_TOKEN and prints only the expiry. Opening a new window
// replaces the old token, so update Vercel's copy afterwards.
//
//   npx tsx --env-file=.env.local scripts/world-staging.ts
const ENV_FILE = ".env.local";

type ToolResponse = {
  result?: { content?: { type: string; text: string }[]; isError?: boolean };
  error?: { message: string };
};

type StagingWindow = {
  staging_verification_token?: string;
  staging_verification_expires_at?: string;
};

async function openWindow(apiKey: string, appId: string): Promise<StagingWindow> {
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
  const body = (await response.json().catch(() => null)) as ToolResponse | null;
  if (!response.ok || !body || body.error || body.result?.isError) {
    throw new Error(`The Portal refused (${response.status}): ${body?.error?.message ?? body?.result?.content?.[0]?.text}`);
  }
  return JSON.parse(body.result?.content?.[0]?.text ?? "{}") as StagingWindow;
}

function saveToken(token: string): void {
  const line = `WORLDID_STAGING_TOKEN=${token}`;
  const env = readFileSync(ENV_FILE, "utf8");
  const next = /^WORLDID_STAGING_TOKEN=.*$/m.test(env)
    ? env.replace(/^WORLDID_STAGING_TOKEN=.*$/m, line)
    : `${env.trimEnd()}\n${line}\n`;
  writeFileSync(ENV_FILE, next);
}

async function main() {
  const apiKey = process.env.WORLD_PORTAL_API_KEY;
  const appId = process.env.WORLDID_APP_ID;
  if (!apiKey?.startsWith("api_") || !appId?.startsWith("app_")) {
    throw new Error("Set WORLD_PORTAL_API_KEY (api_...) and WORLDID_APP_ID (app_...) in .env.local");
  }
  const window = await openWindow(apiKey, appId);
  if (!window.staging_verification_token) throw new Error("The Portal did not return a staging token");
  saveToken(window.staging_verification_token);
  console.log(`Staging window open until ${window.staging_verification_expires_at}; token written to ${ENV_FILE}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
