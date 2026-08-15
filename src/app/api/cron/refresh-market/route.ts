import { NextRequest, NextResponse } from "next/server";
import { buildMarketSnapshotFromTushare } from "@/lib/data/market-snapshot-builder";
import { saveMarketSnapshot } from "@/lib/data/market-snapshot-store";

export const dynamic = "force-dynamic";

/**
 * Cron endpoint for auto-refreshing market snapshot during trading hours.
 *
 * This endpoint is designed to be called by:
 * - External cron services (e.g., GitHub Actions, Vercel Cron, etc.)
 * - Frontend polling during trading hours
 *
 * No authentication required for simplicity, but rate limiting is recommended
 * at the infrastructure level.
 */
export async function POST(request: NextRequest) {
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
