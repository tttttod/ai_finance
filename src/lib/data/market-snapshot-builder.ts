/**
 * Build a MiniMarketSnapshot from Tushare data.
 * Server-side only — never imported from browser code.
 */

import {
  callTushare,
  type TushareDailyRow,
  type TushareDailyBasicRow,
  type TushareIndexDailyRow,
  type TushareStockBasic,
} from "./tushare-client";
import {
  getLatestStockBasicCache,
  saveStockBasicCache,
  getLatestMarketSnapshot,
} from "./market-snapshot-store";
import type {
  MiniMarketSnapshot,
  MiniMarketIndex,
  MiniMarketSector,
  MiniActiveStock,
  MiniRecommendedTarget,
} from "./market-types";
import { mockMarketData, mockRecommendedTargets } from "../mini-mock";

// Core index codes
const INDEX_CODES = [
  { ts_code: "000001.SH", name: "上证指数" },
  { ts_code: "399001.SZ", name: "深证成指" },
  { ts_code: "399006.SZ", name: "创业板指" },
  { ts_code: "000300.SH", name: "沪深300" },
];

function todayYyyyMmDd(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

/**
 * Try to find the most recent trade date by probing daily data.
 * Falls back up to 7 days.
 */
async function resolveTradeDate(
  hintDate?: string,
): Promise<string | null> {
  const start = hintDate || todayYyyyMmDd();
  for (let offset = 0; offset <= 7; offset++) {
    const d = new Date(
      `${start.slice(0, 4)}-${start.slice(4, 6)}-${start.slice(6, 8)}`,
    );
    d.setDate(d.getDate() - offset);
    const tradeDate = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    try {
      const rows = await callTushare<TushareDailyRow>(
        "daily",
        { trade_date: tradeDate },
        "ts_code,trade_date,close,pct_chg,vol,amount",
      );
      if (rows.length > 0) return tradeDate;
    } catch {
      // continue
    }
  }
  return null;
}

async function fetchIndices(tradeDate: string): Promise<MiniMarketIndex[]> {
  const results: MiniMarketIndex[] = [];
  for (const idx of INDEX_CODES) {
    try {
      const rows = await callTushare<TushareIndexDailyRow>(
        "index_daily",
        { ts_code: idx.ts_code, trade_date: tradeDate },
        "ts_code,trade_date,close,change,pct_chg,vol,amount",
      );
      if (rows.length > 0) {
        const r = rows[0];
        results.push({
          name: idx.name,
          code: idx.ts_code,
          price: r.close,
          change: r.pct_chg,
          volume: Math.round(r.amount / 1000), // 千元 -> 万元(近似)
        });
      }
    } catch {
      // skip this index
    }
  }
  return results;
}

function buildHotSectors(
  daily: TushareDailyRow[],
  stockBasic: TushareStockBasic[],
): MiniMarketSector[] {
  // Map ts_code -> industry
  const industryMap = new Map<string, string>();
  for (const s of stockBasic) {
    industryMap.set(s.ts_code, s.industry || "未知");
  }

  // Group by industry
  const industryStats = new Map<
    string,
    { totalPct: number; count: number; upCount: number; totalAmount: number }
  >();
  for (const row of daily) {
    const industry = industryMap.get(row.ts_code) || "未知";
    if (industry === "未知") continue;
    const stat =
      industryStats.get(industry) || {
        totalPct: 0,
        count: 0,
        upCount: 0,
        totalAmount: 0,
      };
    stat.totalPct += row.pct_chg;
    stat.count += 1;
    if (row.pct_chg > 0) stat.upCount += 1;
    stat.totalAmount += row.amount;
    industryStats.set(industry, stat);
  }

  // Compute metrics
  const sectors: MiniMarketSector[] = [];
  for (const [name, stat] of industryStats) {
    if (stat.count < 3) continue; // skip tiny industries
    const avgChange = stat.totalPct / stat.count;
    const upRatio = stat.upCount / stat.count;
    // Heat: composite of avg change, up ratio, and volume
    const heat = Math.min(
      100,
      Math.round(
        Math.max(0, avgChange) * 15 + upRatio * 40 + Math.min(stat.totalAmount / 1e6, 30),
      ),
    );
    sectors.push({
      name,
      change: Math.round(avgChange * 100) / 100,
      inflow: 0, // No real fund flow data available
      heat,
    });
  }

  sectors.sort((a, b) => b.heat - a.heat);
  return sectors.slice(0, 10);
}

function buildActiveStocks(
  daily: TushareDailyRow[],
  stockBasic: TushareStockBasic[],
  dailyBasic: TushareDailyBasicRow[],
): MiniActiveStock[] {
  const nameMap = new Map<string, string>();
  for (const s of stockBasic) {
    nameMap.set(s.ts_code, s.name);
  }

  const basicMap = new Map<string, TushareDailyBasicRow>();
  for (const b of dailyBasic) {
    basicMap.set(b.ts_code, b);
  }

  // Filter out ST stocks, sort by pct_chg desc, take top 8
  const candidates = daily
    .filter((r) => {
      const name = nameMap.get(r.ts_code) || "";
      return !name.includes("ST") && !name.includes("*ST");
    })
    .sort((a, b) => b.pct_chg - a.pct_chg)
    .slice(0, 8);

  return candidates.map((r) => {
    const name = nameMap.get(r.ts_code) || r.ts_code;
    const basic = basicMap.get(r.ts_code);
    let reason = "涨幅居前";
    if (basic && basic.turnover_rate > 10) reason = "成交放大";
    else if (r.pct_chg > 7) reason = "强势涨停";
    else if (r.pct_chg > 4) reason = "行业活跃";
    return {
      name,
      code: r.ts_code,
      price: r.close,
      change: Math.round(r.pct_chg * 100) / 100,
      reason,
    };
  });
}

function buildRecommendedTargets(
  activeStocks: MiniActiveStock[],
  hotSectors: MiniMarketSector[],
  stockBasic: TushareStockBasic[],
  dailyBasic: TushareDailyBasicRow[],
): MiniRecommendedTarget[] {
  const industryMap = new Map<string, string>();
  for (const s of stockBasic) {
    industryMap.set(s.ts_code, s.industry || "未知");
  }
  const basicMap = new Map<string, TushareDailyBasicRow>();
  for (const b of dailyBasic) {
    basicMap.set(b.ts_code, b);
  }

  const hotIndustryNames = new Set(hotSectors.slice(0, 5).map((s) => s.name));

  const targets: MiniRecommendedTarget[] = [];
  for (const stock of activeStocks.slice(0, 5)) {
    const industry = industryMap.get(stock.code) || "未知";
    const basic = basicMap.get(stock.code);
    const isHotIndustry = hotIndustryNames.has(industry);

    // Simple scoring
    let score = 50;
    if (stock.change > 5) score += 15;
    else if (stock.change > 2) score += 8;
    if (isHotIndustry) score += 15;
    if (basic && basic.turnover_rate > 5) score += 10;
    if (basic && basic.pe_ttm > 0 && basic.pe_ttm < 30) score += 10;
    score = Math.min(95, score);

    const riskLevel = score > 75 ? "中" : score > 60 ? "中" : "低";
    const style: "short" | "swing" | "long" =
      stock.change > 5 ? "short" : stock.change > 2 ? "swing" : "long";
    const horizon = style === "short" ? "5日" : style === "swing" ? "20日" : "3个月";

    const triggers: string[] = [];
    if (isHotIndustry) triggers.push("板块热度");
    if (stock.change > 5) triggers.push("强势涨幅");
    if (basic && basic.turnover_rate > 5) triggers.push("成交活跃");
    if (basic && basic.pe_ttm > 0 && basic.pe_ttm < 30) triggers.push("估值合理");
    if (triggers.length === 0) triggers.push("技术面活跃");

    targets.push({
      name: stock.name,
      code: stock.code.split(".")[0],
      industry,
      recommended_style: style,
      default_horizon: horizon,
      opportunity_score: score,
      risk_level: riskLevel,
      reason: `${industry}板块活跃，个股表现强势，${isHotIndustry ? "行业资金持续关注" : "技术面保持活跃"}。`,
      main_risk:
        riskLevel === "中"
          ? "短期涨幅较大，注意回调风险；板块拥挤度可能上升。"
          : "市场波动风险，需关注宏观政策变化。",
      trigger_source: triggers,
      is_demo_data: false,
    });
  }

  return targets.slice(0, 5);
}

function buildSummary(
  indices: MiniMarketIndex[],
  hotSectors: MiniMarketSector[],
  activeStocks: MiniActiveStock[],
  tradeDate: string,
): string {
  const sh = indices.find((i) => i.code === "000001.SH");
  const sz = indices.find((i) => i.code === "399001.SZ");
  const cy = indices.find((i) => i.code === "399006.SZ");

  const parts: string[] = [];
  if (sh) parts.push(`上证指数${sh.change >= 0 ? "涨" : "跌"}${Math.abs(sh.change)}%`);
  if (sz) parts.push(`深证成指${sz.change >= 0 ? "涨" : "跌"}${Math.abs(sz.change)}%`);
  if (cy) parts.push(`创业板指${cy.change >= 0 ? "涨" : "跌"}${Math.abs(cy.change)}%`);

  const topSectors = hotSectors.slice(0, 3).map((s) => s.name).join("、");
  const topStock = activeStocks[0];

  const dateStr = `${tradeDate.slice(0, 4)}-${tradeDate.slice(4, 6)}-${tradeDate.slice(6, 8)}`;

  return `【${dateStr}】${parts.join("，")}。热门板块：${topSectors || "暂无"}。${topStock ? `个股方面${topStock.name}涨幅居前(+${topStock.change}%)。` : ""}市场整体${sh && sh.change > 0 ? "偏强" : sh && sh.change < 0 ? "偏弱" : "震荡"}运行。`;
}

/**
 * Main entry: build a complete market snapshot from Tushare.
 * If any step fails, tries to return the previous snapshot marked stale.
 * If no previous snapshot, falls back to mock data.
 */
export async function buildMarketSnapshotFromTushare(
  hintDate?: string,
): Promise<MiniMarketSnapshot> {
  try {
    // 1. Resolve trade date
    const tradeDate = await resolveTradeDate(hintDate);
    if (!tradeDate) {
      throw new Error("Cannot resolve trade date after 7-day fallback");
    }

    // 2. Fetch stock basic (with cache)
    let stockBasic = (await getLatestStockBasicCache()) as TushareStockBasic[] | null;
    if (!stockBasic) {
      stockBasic = await callTushare<TushareStockBasic>(
        "stock_basic",
        { exchange: "", list_status: "L" },
        "ts_code,symbol,name,industry,market,list_date,is_hs",
      );
      await saveStockBasicCache(stockBasic);
    }

    // 3. Fetch daily + daily_basic in parallel
    const [daily, dailyBasic] = await Promise.all([
      callTushare<TushareDailyRow>(
        "daily",
        { trade_date: tradeDate },
        "ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount",
      ),
      callTushare<TushareDailyBasicRow>(
        "daily_basic",
        { trade_date: tradeDate },
        "ts_code,trade_date,pe,pe_ttm,pb,total_mv,circ_mv,turnover_rate,volume_ratio",
      ),
    ]);

    // 4. Fetch indices
    const indices = await fetchIndices(tradeDate);

    // 5. Build derived data
    const hotSectors = buildHotSectors(daily, stockBasic);
    const activeStocks = buildActiveStocks(daily, stockBasic, dailyBasic);
    const recommendedTargets = buildRecommendedTargets(
      activeStocks,
      hotSectors,
      stockBasic,
      dailyBasic,
    );
    const summary = buildSummary(indices, hotSectors, activeStocks, tradeDate);

    const snapshotDate = todayYyyyMmDd();
    const snapshot: MiniMarketSnapshot = {
      snapshotDate,
      tradeDate,
      fetchedAt: new Date().toISOString(),
      source: "tushare",
      stale: false,
      summary,
      indices: indices.length > 0 ? indices : mockMarketData.indices,
      hotSectors: hotSectors.length > 0 ? hotSectors : mockMarketData.hotSectors,
      activeStocks: activeStocks.length > 0 ? activeStocks : mockMarketData.activeStocks,
      recommendedTargets:
        recommendedTargets.length > 0 ? recommendedTargets : mockRecommendedTargets,
      events: mockMarketData.events as { time: string; title: string; impact: "positive" | "negative" | "neutral" }[],
    };

    return snapshot;
  } catch (err) {
    // Try returning old snapshot as stale
    console.error("[market-snapshot-builder] Build failed:", err instanceof Error ? err.message : err);
    const old = await getLatestMarketSnapshot();
    if (old) {
      return { ...old, stale: true, fetchedAt: old.fetchedAt };
    }

    // Final fallback: mock
    return {
      snapshotDate: todayYyyyMmDd(),
      tradeDate: todayYyyyMmDd(),
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
  }
}
