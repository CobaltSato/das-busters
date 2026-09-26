import type { Metadata } from "next";
import { CounterScreen } from "./CounterScreen";
import "./counter.css";

export const metadata: Metadata = {
  title: "Certificate pickup · Shibuya City",
};

export default function CounterPage() {
  return <CounterScreen />;
}
