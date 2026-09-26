import { NextResponse } from "next/server";
import { publicClient } from "@/lib/chain";
import { errorResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

// Lets Mingle show when the relayer's transaction lands, without keeping the
// verify function open for a whole Sepolia block.
export async function GET(request: Request) {
  const hash = new URL(request.url).searchParams.get("hash");
  if (!hash || !/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    return NextResponse.json({ error: "Expected a transaction hash", code: "bad-tx-hash" }, { status: 400 });
  }
  try {
    const receipt = await publicClient()
      .getTransactionReceipt({ hash: hash as `0x${string}` })
      .catch(() => null);
    if (!receipt) return NextResponse.json({ status: "pending" });
    return NextResponse.json({
      status: receipt.status === "success" ? "confirmed" : "reverted",
      blockNumber: receipt.blockNumber.toString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
