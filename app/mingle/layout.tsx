import type { Metadata } from "next";
import "./mingle.css";

export const metadata: Metadata = {
  title: "Mingle",
  manifest: "/mingle/manifest.webmanifest",
  icons: { icon: "/mingle/icon-192.png", apple: "/mingle/icon-180.png" },
  appleWebApp: { capable: true, title: "Mingle", statusBarStyle: "default" },
};

export default function MingleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
