import { JetBrains_Mono } from "next/font/google";

// Hashes, routes and addresses read better in a monospace face. Shared by
// /how-it-works and /how-it-works/basics so both load the same font file.
export const hiwMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hiw-mono",
  display: "swap",
});
