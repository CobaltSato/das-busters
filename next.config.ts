import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dump/ holds other projects with their own lockfiles; pin the root so
  // Next.js does not pick one of them as the workspace root.
  outputFileTracingRoot: __dirname,
  devIndicators: false,
};

export default nextConfig;
