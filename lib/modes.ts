import "server-only";
import { worldIdConfig } from "./worldid";

// Every integration has a mock and a real implementation. The server picks
// one from env so a missing key falls back to mock instead of breaking the
// demo, and the client can never switch a check off by itself.
export type Modes = {
  auth: "mock" | "privy";
  prover: "mock" | "groth16";
  chain: "off" | "sepolia";
  // Staging proofs come from the World ID Simulator, so they get their own label.
  worldId: "simulated" | "idkit-staging" | "idkit";
};

export function getModes(): Modes {
  return {
    auth: process.env.NEXT_PUBLIC_PRIVY_APP_ID ? "privy" : "mock",
    prover: process.env.PROVER_MODE === "groth16" ? "groth16" : "mock",
    chain: process.env.CHAIN_MODE === "sepolia" ? "sepolia" : "off",
    worldId: worldIdMode(),
  };
}

function worldIdMode(): Modes["worldId"] {
  const config = worldIdConfig();
  if (!config) return "simulated";
  return config.environment === "staging" ? "idkit-staging" : "idkit";
}

// Where the Groth16 proof is made. On the phone by default, so the
// certificate and the holder secret stay there; PROVE_ON=server moves it to
// /api/prove for devices that cannot prove. Mingle's checks are the same
// either way. The mock prover only exists on the server.
export type ProvingLocation = "device" | "server";

export function provingLocation(): ProvingLocation {
  if (getModes().prover !== "groth16") return "server";
  return process.env.PROVE_ON === "server" ? "server" : "device";
}
