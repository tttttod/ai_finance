/**
 * Build StockResearchContext from Tushare data.
 *
 * Server-side only. Never expose TUSHARE_TOKEN to the browser.
 */

import { callTushare } from "./tushare-client";
import {
  getLatestStockBasicCache,
  saveStockBasicCache,
  getLatestMarketSnapshot,
} from "./market-snapshot-store";
import {
  getStockContextCache,
  saveStockContextCache,
  appendWatchlistCandidate,
} from "./stock-context-store";
import type {
  StockIdentity,
  StockQuoteContext,
  StockValuationContext,
  StockTechnicalContext,
  StockMarketContext,
  StockResearchContext,
} from "./stock-context-types";

// ========== Normalize query ==========

export function normalizeStockQuery(query: string): string {
  const q = query.trim();

  // Already has suffix like 600519.SH
  if (/^\d{6}\.(SH|SZ|BJ)$/i.test(q)) {
    return q.toUpperCase();
  }

  // Pure 6-digit code
  if (/^\d{6}$/.test(q)) {
    const first = q[0];
    if (first === "6") return `${q}.SH`;
    if (first === "0" || first === "3") return `${q}.SZ`;
    if (first === "8" || first === "4") return `${q}.BJ`;
    return `${q}.SH`; // default
  }

  return q;
}

// ========== Resolve tsCode ==========

interface StockBasicRow {
  ts_code: string;
  symbol: string;
  name: string;
  industry: string;
  market: string;
  list_date: string;
}

async function getStockBasicList(): Promise<StockBasicRow[]> {
  // Check cache first (7-day TTL)
  const cached = await getLatestStockBasicCache();
  if (cached && cached.length > 0) {
    return cached as StockBasicRow[];
  }

  // Fetch from Tushare
  try {
    const rows = await callTushare<StockBasicRow>(
      "stock_basic",
      { exchange: "", list_status: "L" },
      "ts_code,symbol,name,industry,market,list_date",
    );
    // Cache for 7 days
    await saveStockBasicCache(rows as unknown as Record<string, unknown>[]);
    return rows;
  } catch {
    return [];
  }
}

export async function resolveTsCode(
  query: string,
): Promise<StockIdentity | null> {
  const normalized = normalizeStockQuery(query);

  // If it's already a valid ts_code
  if (/^\d{6}\.(SH|SZ|BJ)$/.test(normalized)) {
    const stockList = await getStockBasicList();
    const match = stockList.find((s) => s.ts_code === normalized);
    if (match) {
      return {
        tsCode: match.ts_code,
        symbol: match.symbol,
        name: match.name,
        industry: match.industry || "未知",
        market: match.market,
        listDate: match.list_date,
      };
    }
    // Even if not found in stock_basic, return identity with the code
    return {
      tsCode: normalized,
      symbol: normalized.split(".")[0],
      name: normalized,
      industry: "未知",
    };
  }

  // Chinese name search
  const stockList = await getStockBasicList();
  const nameMatch = stockList.find(
    (s) => s.name === normalized || s.name.includes(normalized) || normalized.includes(s.name),
  );
  if (nameMatch) {
    return {
      tsCode: nameMatch.ts_code,
      symbol: nameMatch.symbol,
      name: nameMatch.name,
      industry: nameMatch.industry || "未知",
      market: nameMatch.market,
      listDate: nameMatch.list_date,
    };
  }

  return null;
}

// ========== Build context ==========

interface DailyRow {
  ts_code: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  pre_close: number;
  change: number;
  pct_chg: number;
  vol: number;
  amount: number;
}

interface DailyBasicRow {
  ts_code: string;
  trade_date: string;
  pe: number;
  pe_ttm: number;
  pb: number;
  total_mv: number;
  circ_mv: number;
  turnover_rate: number;
  volume_ratio: number;
}

function computeTechnical(dailyRows: DailyRow[]): StockTechnicalContext {
  const closes = dailyRows.map((r) => r.close);
  const lows = dailyRows.map((r) => r.low);
  const highs = dailyRows.map((r) => r.high);

  const ma = (arr: number[], period: number): number | undefined => {
    if (arr.length < period) return undefined;
    const slice = arr.slice(0, period);
    return Math.round((slice.reduce((a, b) => a + b, 0) / period) * 100) / 100;
  };

  const ma5 = ma(closes, 5);
  const ma20 = ma(closes, 20);
  const ma60 = ma(closes, 60);

  const change5d =
    closes.length >= 6
      ? Math.round(((closes[0] - closes[5]) / closes[5]) * 10000) / 100
      : undefined;

  const change20d =
    closes.length >= 21
      ? Math.round(((closes[0] - closes[20]) / closes[20]) * 10000) / 100
      : undefined;

  // 20-day volatility (annualized)
  let volatility20d: number | undefined;
  if (closes.length >= 21) {
    const returns: number[] = [];
    for (let i = 0; i < 20; i++) {
      returns.push((closes[i] - closes[i + 1]) / closes[i + 1]);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
      returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
    volatility20d =
      Math.round(Math.sqrt(variance) * Math.sqrt(252) * 10000) / 100;
  }

  // Support / pressure from 20-day range
  const support20 =
    lows.length >= 20 ? Math.min(...lows.slice(0, 20)) : undefined;
  const pressure20 =
    highs.length >= 20 ? Math.max(...highs.slice(0, 20)) : undefined;

  // Trend
  const latestClose = closes[0];
  let trend: "bullish" | "neutral" | "bearish" = "neutral";
  if (ma20 !== undefined && ma60 !== undefined) {
    if (latestClose > ma20 && ma20 > ma60) trend = "bullish";
    else if (latestClose < ma20 && ma20 < ma60) trend = "bearish";
  }

  return {
    ma5,
    ma20,
    ma60,
    change5d,
    change20d,
    volatility20d,
    trend,
    support20,
    pressure20,
  };
}

export async function buildStockResearchContext(
  query: string,
): Promise<StockResearchContext> {
  const identity = await resolveTsCode(query);
  if (!identity) {
    throw new Error(`无法识别股票: ${query}`);
  }

  const missing: string[] = [];
  let quote: StockQuoteContext | undefined;
  let valuation: StockValuationContext | undefined;
  let technical: StockTechnicalContext | undefined;
  let market: StockMarketContext | undefined;
  let source: "tushare" | "cache" | "mock" = "tushare";

  // 1. Fetch daily data (last 80 trading days)
  let dailyRows: DailyRow[] = [];
  try {
    dailyRows = await callTushare<DailyRow>(
      "daily",
      { ts_code: identity.tsCode },
      "ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount",
    );
    // Sort by trade_date desc
    dailyRows.sort((a, b) => b.trade_date.localeCompare(a.trade_date));
    dailyRows = dailyRows.slice(0, 80);
  } catch (err) {
    console.error("[stock-context] daily fetch failed:", (err as Error).message);
    missing.push("daily");
  }

  // 2. Fetch daily_basic (valuation)
  let dailyBasicRows: DailyBasicRow[] = [];
  try {
    dailyBasicRows = await callTushare<DailyBasicRow>(
      "daily_basic",
      { ts_code: identity.tsCode },
      "ts_code,trade_date,pe,pe_ttm,pb,total_mv,circ_mv,turnover_rate,volume_ratio",
    );
    dailyBasicRows.sort((a, b) => b.trade_date.localeCompare(a.trade_date));
    dailyBasicRows = dailyBasicRows.slice(0, 5);
  } catch (err) {
    console.error("[stock-context] daily_basic fetch failed:", (err as Error).message);
    missing.push("valuation");
  }

  // Build quote from latest daily
  if (dailyRows.length > 0) {
    const latest = dailyRows[0];
    quote = {
      tradeDate: latest.trade_date,
      close: latest.close,
      pctChg: latest.pct_chg,
      amount: latest.amount,
      vol: latest.vol,
    };
  } else {
    missing.push("quote");
  }

  // Build valuation from latest daily_basic
  if (dailyBasicRows.length > 0) {
    const latest = dailyBasicRows[0];
    valuation = {
      pe: latest.pe || undefined,
      peTtm: latest.pe_ttm || undefined,
      pb: latest.pb || undefined,
      totalMv: latest.total_mv || undefined,
      circMv: latest.circ_mv || undefined,
      turnoverRate: latest.turnover_rate || undefined,
      volumeRatio: latest.volume_ratio || undefined,
    };
  }

  // Build technical from daily
  if (dailyRows.length >= 5) {
    technical = computeTechnical(dailyRows);
  } else {
    missing.push("technical");
  }

  // Build market context from existing snapshot (no Tushare call)
  try {
    const snapshot = await getLatestMarketSnapshot();
    if (snapshot) {
      market = {
        marketSummary: snapshot.summary,
        hotSectors: snapshot.hotSectors.map((s) => ({
          name: s.name,
          change: s.change,
          heat: s.heat,
        })),
      };

      // Match industry heat
      if (identity.industry && identity.industry !== "未知") {
        const matchedSector = snapshot.hotSectors.find(
          (s) =>
            s.name === identity.industry ||
            s.name.includes(identity.industry!) ||
            identity.industry!.includes(s.name),
        );
        if (matchedSector) {
          const rank =
            snapshot.hotSectors
              .sort((a, b) => b.heat - a.heat)
              .findIndex((s) => s.name === matchedSector.name) + 1;
          market.industryHeat = {
            name: matchedSector.name,
            rank,
            avgChange: matchedSector.change,
            heat: matchedSector.heat,
          };
        } else {
          missing.push("industryHeat");
        }
      }
    } else {
      missing.push("market");
    }
  } catch {
    missing.push("market");
  }

  if (missing.length > 0 && dailyRows.length === 0) {
    source = "mock";
  } else if (missing.length > 0) {
    source = "tushare"; // partial data
  }

  const context: StockResearchContext = {
    stock: identity,
    quote,
    valuation,
    technical,
    market,
    dataQuality: {
      source,
      fetchedAt: new Date().toISOString(),
      stale: false,
      missing,
    },
  };

  return context;
}

// ========== Cache helpers for API route ==========

export function getStockContextCacheKey(tsCode: string): string {
  return `stock-context:${tsCode}:v1`;
}

/**
 * Determine TTL based on trading hours.
 * During trading hours: 10 min. Off hours: at least 6 hours.
 */
export function getStockContextTTL(): number {
  const now = new Date();
  const hour = now.getHours();
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  const isTradingHours = isWeekday && hour >= 9 && hour < 15;

  if (isTradingHours) {
    return 600; // 10 minutes
  }
  return 21600; // 6 hours
}

export { saveStockContextCache, getStockContextCache, appendWatchlistCandidate };
