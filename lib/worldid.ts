import "server-only";
import { signRequest } from "@worldcoin/idkit-core/signing";
import type { RpContext } from "@worldcoin/idkit-core";
import { ProofError } from "./errors";

// World ID through IDKit 4. The server signs each request and checks each
// result with the Developer Portal; the browser only relays them. Staging
// proofs come from the World ID Simulator, and the Portal accepts them only
// inside a 24-hour window opened with scripts/world-staging.ts.

export type WorldIdEnvironment = "production" | "staging";

export type WorldIdPublicConfig = {
  appId: `app_${string}`;
  action: string;
  environment: WorldIdEnvironment;
};

type WorldIdConfig = WorldIdPublicConfig & {
  rpId: string;
  signingKey: string;
  stagingToken: string | null;
};

const VERIFY_URL = "https://developer.world.org/api/v4/verify";
const VERIFY_TIMEOUT_MS = 15_000;

// Null when anything is missing, so the wallet falls back to the simulated check.
export function worldIdConfig(): WorldIdConfig | null {
  const appId = process.env.WORLDID_APP_ID;
  const rpId = process.env.WORLDID_RP_ID;
  const signingKey = process.env.WORLDID_RP_SIGNING_KEY?.replace(/^0x/, "");
  const action = process.env.WORLDID_ACTION || "das-busters-human";
  const environment: WorldIdEnvironment = process.env.WORLDID_ENVIRONMENT === "production" ? "production" : "staging";
  const stagingToken = process.env.WORLDID_STAGING_TOKEN || null;
  const stagingExpiresAt = Date.parse(process.env.WORLDID_STAGING_EXPIRES_AT ?? "");
  if (process.env.WORLDID_MODE !== "idkit") return null;
  if (!appId?.startsWith("app_") || !rpId?.startsWith("rp_") || !signingKey || !/^[0-9a-fA-F]{64}$/.test(signingKey)) {
    return null;
  }
  // Once the Portal's staging window closes, every check would fail; fall
  // back to the simulated one instead of showing a World ID that cannot work.
  if (environment === "staging" && (!stagingToken || !(stagingExpiresAt > Date.now()))) return null;
  return { appId: appId as `app_${string}`, rpId, signingKey, action, environment, stagingToken };
}

export function publicConfig({ appId, action, environment }: WorldIdConfig): WorldIdPublicConfig {
  return { appId, action, environment };
}

export function createRpContext(config: WorldIdConfig): RpContext {
  const { sig, nonce, createdAt, expiresAt } = signRequest({ signingKeyHex: config.signingKey, action: config.action });
  return { rp_id: config.rpId, nonce, created_at: createdAt, expires_at: expiresAt, signature: sig };
}

export type VerifiedHuman = { nullifier: string; environment: WorldIdEnvironment };

// We ask for Proof of Human (IdkitRequest.tsx), but the browser picks the
// preset, so the server checks the credential too. "orb" is the same
// credential answered as a legacy 3.0 proof.
const PROOF_OF_HUMAN = new Set(["proof_of_human", "orb"]);

type WorldIdResult = { action?: string; environment: string; responses: Array<Record<string, unknown>> };

// The IDKit result goes to the Portal as it is. The action, environment and
// credential are checked against ours first, because the browser could send any.
export async function verifyWithPortal(config: WorldIdConfig, result: WorldIdResult): Promise<VerifiedHuman> {
  if (result.action !== config.action || result.environment !== config.environment) {
    throw new ProofError("This World ID proof was made for a different request", "world-id-mismatch");
  }
  if (!result.responses.length || !result.responses.every((item) => PROOF_OF_HUMAN.has(String(item.identifier)))) {
    throw new ProofError("This World ID proof is not a Proof of Human", "world-id-credential");
  }
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (config.environment === "staging" && config.stagingToken) {
    headers["x-staging-verification-token"] = config.stagingToken;
  }
  let response: Response;
  try {
    response = await fetch(`${VERIFY_URL}/${config.rpId}`, {
      method: "POST",
      headers,
      body: JSON.stringify(result),
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("World ID verify did not answer", error);
    throw new ProofError("World ID's Developer Portal did not answer. Try again.", "world-id-unreachable");
  }
  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    code?: string;
    nullifier?: string;
    environment?: string;
  } | null;
  if (!response.ok || !body?.success) {
    console.error("World ID verify refused", response.status, body?.code);
    // The Portal's code is the clue, e.g. environment_not_allowed once the
    // staging token has been rotated, so English shows it too.
    const reason = body?.code ?? String(response.status);
    throw new ProofError(`World ID could not confirm this proof (${reason})`, "world-id-rejected", { reason });
  }
  if (body.environment !== config.environment || !body.nullifier) {
    throw new ProofError("World ID confirmed a proof from a different environment", "world-id-mismatch");
  }
  return { nullifier: BigInt(body.nullifier).toString(), environment: config.environment };
}
