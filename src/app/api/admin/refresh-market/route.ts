import { NextRequest, NextResponse } from "next/server";
import { buildMarketSnapshotFromTushare } from "@/lib/data/market-snapshot-builder";
import { saveMarketSnapshot } from "@/lib/data/market-snapshot-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Auth check
  const secret = request.headers.get("x-admin-secret");
  const expected = process.env.ADMIN_REFRESH_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    // Optional: allow passing a specific trade_date
    let hintDate: string | undefined;
    try {
      const body = await request.json();
      hintDate = body?.trade_date;
    } catch {
      // no body, that's fine
    }

    const snapshot = await buildMarketSnapshotFromTushare(hintDate);
    await saveMarketSnapshot(snapshot);

    return NextResponse.json({
      success: true,
      data: {
        tradeDate: snapshot.tradeDate,
        fetchedAt: snapshot.fetchedAt,
        source: snapshot.source,
        stale: snapshot.stale,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
