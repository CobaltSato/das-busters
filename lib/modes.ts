import "server-only";

// Every integration has a mock and a real implementation. The server picks
// one from env so a missing key falls back to mock instead of breaking the
// demo, and the client can never switch a check off by itself.
export type Modes = {
  auth: "mock" | "privy";
  prover: "mock" | "groth16";
  chain: "off" | "sepolia";
  worldId: "simulated" | "idkit";
};

export function getModes(): Modes {
  return {
    // Privy sign-in is not wired up yet (Phase 4); report mock until it is.
    auth: "mock",
    prover: process.env.PROVER_MODE === "groth16" ? "groth16" : "mock",
    chain: process.env.CHAIN_MODE === "sepolia" ? "sepolia" : "off",
    worldId: process.env.WORLDID_MODE === "idkit" ? "idkit" : "simulated",
  };
}
