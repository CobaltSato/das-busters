import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dump/ holds other projects with their own lockfiles; pin the root so
  // Next.js does not pick one of them as the workspace root.
  outputFileTracingRoot: __dirname,
  devIndicators: false,
  // snarkjs loads wasm and worker threads at runtime; bundling it breaks that.
  serverExternalPackages: ["snarkjs"],
  // The prover reads the circuit files from disk at request time.
  outputFileTracingIncludes: {
    "/api/prove": ["./public/zk/**/*"],
  },
};

export default nextConfig;
