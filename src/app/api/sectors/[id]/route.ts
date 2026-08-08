import { NextResponse } from "next/server";
import { getSectorById, getAllSectors } from "@/lib/mock-data";
import { getLatestMarketSnapshot } from "@/lib/data/market-snapshot-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try snapshot first — match by name or id
  try {
    const snapshot = await getLatestMarketSnapshot();
    if (snapshot) {
      const match = snapshot.hotSectors.find(
        (s) => s.name === id || `sector-${snapshot.hotSectors.indexOf(s)}` === id || String(snapshot.hotSectors.indexOf(s)) === id,
      );
      if (match) {
        const idx = snapshot.hotSectors.indexOf(match);
        return NextResponse.json({
          success: true,
          data: {
            id,
            name: match.name,
            change_pct: match.change,
            fund_flow: match.inflow,
            heat: match.heat,
            lead_stock: "",
            consensus: "",
            target_price: 0,
            current_price: 0,
            technical: {
              trend: match.change > 0 ? "up" : "down",
              ma20: 0,
              ma60: 0,
              support: 0,
              resistance: 0,
            },
          },
          metadata: {
            tradeDate: snapshot.tradeDate,
            source: snapshot.source,
          },
        });
      }
    }
  } catch {
    // fall through
  }

  // Fallback to original mock
  const sector = getSectorById(id);
  if (!sector) {
    return NextResponse.json(
      { success: false, error: "板块不存在" },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, data: sector });
}

export async function generateStaticParams() {
  return getAllSectors().map((s) => ({ id: s.id }));
}
