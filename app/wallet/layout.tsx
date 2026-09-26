import type { Metadata } from "next";
import "./wallet.css";

export const metadata: Metadata = {
  title: "DAS Busters",
  appleWebApp: { capable: true, title: "DAS Busters", statusBarStyle: "default" },
};

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return children;
}
