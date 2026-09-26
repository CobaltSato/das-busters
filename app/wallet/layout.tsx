import type { Metadata } from "next";
import { WalletProviders } from "./_components/WalletProviders";
import "./wallet.css";

export const metadata: Metadata = {
  title: "DAS Busters",
  appleWebApp: { capable: true, title: "DAS Busters", statusBarStyle: "default" },
};

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return <WalletProviders>{children}</WalletProviders>;
}
