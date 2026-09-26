import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n/server";
import { ResetScreen } from "./ResetScreen";
import "./reset.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.reset.title };
}

export default function ResetPage() {
  return <ResetScreen />;
}
