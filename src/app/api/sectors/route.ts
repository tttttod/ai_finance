import { NextResponse } from "next/server";
import { getAllSectors } from "@/lib/mock-data";
import { getLatestMarketSnapshot } from "@/lib/data/market-snapshot-store";
import type { MiniMarketSector } from "@/lib/data/market-types";

export const dynamic = "force-dynamic";

// Convert MiniMarketSector to the legacy sector format
function sectorToLegacy(s: MiniMarketSector, index: number) {
  return {
    id: `sector-${index}`,
    name: s.name,
    change_pct: s.change,
    fund_flow: s.inflow,
    heat: s.heat,
    lead_stock: "",
    consensus: "",
    target_price: 0,
    current_price: 0,
    technical: {
      trend: s.change > 0 ? "up" : "down",
      ma20: 0,
      ma60: 0,
      support: 0,
      resistance: 0,
    },
  };
}

export async function GET() {
  // Try snapshot first
  try {
    const snapshot = await getLatestMarketSnapshot();
    if (snapshot && snapshot.hotSectors.length > 0) {
      const sectors = snapshot.hotSectors.map(sectorToLegacy);
      return NextResponse.json({
        success: true,
        data: sectors,
        metadata: {
          tradeDate: snapshot.tradeDate,
          source: snapshot.source,
        },
      });
    }
  } catch {
    // fall through to mock
  }

  // Fallback to original mock
  const sectors = getAllSectors();
  return NextResponse.json({ success: true, data: sectors });
}
