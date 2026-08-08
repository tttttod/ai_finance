import { NextResponse } from "next/server";
import { getDailyReport } from "@/lib/mock-data";
import { getLatestMarketSnapshot } from "@/lib/data/market-snapshot-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = getDailyReport();

  // Enrich with snapshot metadata if available
  let snapshotMeta: Record<string, unknown> | null = null;
  try {
    const snapshot = await getLatestMarketSnapshot();
    if (snapshot) {
      snapshotMeta = {
        tradeDate: snapshot.tradeDate,
        fetchedAt: snapshot.fetchedAt,
        source: snapshot.source,
        stale: snapshot.stale,
      };
    }
  } catch {
    // ignore
  }

  return NextResponse.json({
    success: true,
    data: report,
    metadata: snapshotMeta,
  });
}
