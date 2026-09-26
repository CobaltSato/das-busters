import { NextResponse } from "next/server";
import { getModes } from "@/lib/modes";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getModes());
}
