import { NextResponse } from "next/server";
import { getLatestMarketSnapshot } from "@/lib/data/market-snapshot-store";
import { mockMarketData, mockRecommendedTargets } from "@/lib/mini-mock";
import type { MiniMarketSnapshot } from "@/lib/data/market-types";

export const dynamic = "force-dynamic";

export async function GET() {
  // Only read from cache — NEVER call Tushare here
  const snapshot = await getLatestMarketSnapshot();

  if (snapshot) {
    return NextResponse.json({ success: true, data: snapshot });
  }

  // Fallback to mock data if no snapshot exists
  const fallback: MiniMarketSnapshot = {
    snapshotDate: new Date().toISOString().split("T")[0].replace(/-/g, ""),
    tradeDate: new Date().toISOString().split("T")[0].replace(/-/g, ""),
    fetchedAt: new Date().toISOString(),
    source: "mock",
    stale: false,
    summary: mockMarketData.summary,
    indices: mockMarketData.indices,
    hotSectors: mockMarketData.hotSectors,
    activeStocks: mockMarketData.activeStocks,
    recommendedTargets: mockRecommendedTargets,
    events: mockMarketData.events as { time: string; title: string; impact: "positive" | "negative" | "neutral" }[],
  };

  return NextResponse.json({ success: true, data: fallback });
}
