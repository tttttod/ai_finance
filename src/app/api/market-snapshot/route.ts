import { NextResponse } from "next/server";
import { getLatestMarketSnapshot, isSupabaseConfigured, isTushareConfigured } from "@/lib/data/market-snapshot-store";
import { mockMarketData, mockRecommendedTargets } from "@/lib/mini-mock";
import type { MiniMarketSnapshot } from "@/lib/data/market-types";

export const dynamic = "force-dynamic";

export async function GET() {
  // Only read from cache — NEVER call Tushare here
  const snapshot = await getLatestMarketSnapshot();

  if (snapshot) {
    // Add data quality info
    const dataQuality = {
      indices: snapshot.indices?.length > 0 ? "tushare" : "mock",
      hotSectors: snapshot.hotSectors?.length > 0 ? "tushare" : "mock",
      activeStocks: snapshot.activeStocks?.length > 0 ? "tushare" : "mock",
      recommendedTargets: snapshot.recommendedTargets?.length > 0 ? "tushare" : "mock",
    };

    return NextResponse.json({
      success: true,
      data: {
        ...snapshot,
        dataQuality,
        hasRealData: snapshot.source === "tushare",
        supabaseConfigured: isSupabaseConfigured(),
        tushareConfigured: isTushareConfigured(),
      },
    });
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

  return NextResponse.json({
    success: true,
    data: {
      ...fallback,
      dataQuality: {
        indices: "mock",
        hotSectors: "mock",
        activeStocks: "mock",
        recommendedTargets: "mock",
      },
      hasRealData: false,
      supabaseConfigured: isSupabaseConfigured(),
      tushareConfigured: isTushareConfigured(),
    },
  });
}
