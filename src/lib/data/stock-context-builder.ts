/**
 * Build StockResearchContext from Tushare data.
 *
 * Server-side only. Never expose TUSHARE_TOKEN to the browser.
 */

import * as fs from "fs";
import * as path from "path";
import { callTushare } from "./tushare-client";
import {
  getLatestStockBasicCache,
  saveStockBasicCache,
  getLatestMarketSnapshot,
} from "./market-snapshot-store";

// Path to the built-in stock basic list (deployed with the project)
const BUILTIN_STOCK_BASIC_FILE = path.join(process.cwd(), "src", "data", "stock-basic.json");

/**
 * Read the built-in stock basic list from src/data/stock-basic.json.
 * This file is deployed with the project and always available.
 */
function readBuiltinStockBasicList(): StockBasicRow[] | null {
  try {
    if (fs.existsSync(BUILTIN_STOCK_BASIC_FILE)) {
      const raw = fs.readFileSync(BUILTIN_STOCK_BASIC_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      // Support both { rows: [...] } format and plain array format
      if (Array.isArray(parsed)) {
        return parsed as StockBasicRow[];
      }
      if (parsed.rows && Array.isArray(parsed.rows)) {
        return parsed.rows as StockBasicRow[];
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Update the built-in stock basic list when Tushare fetch succeeds.
 */
function updateBuiltinStockBasicList(rows: StockBasicRow[]): void {
  try {
    const dir = path.dirname(BUILTIN_STOCK_BASIC_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = {
      _cachedAt: new Date().toISOString(),
      rows,
    };
    fs.writeFileSync(BUILTIN_STOCK_BASIC_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // ignore write errors - the file might be read-only in some environments
  }
}
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

// Built-in fallback stock list for when Tushare API is unavailable
const FALLBACK_STOCK_LIST: StockBasicRow[] = [
  { ts_code: "600519.SH", symbol: "600519", name: "贵州茅台", industry: "白酒", market: "主板", list_date: "20010827" },
  { ts_code: "000858.SZ", symbol: "000858", name: "五粮液", industry: "白酒", market: "主板", list_date: "19980427" },
  { ts_code: "000568.SZ", symbol: "000568", name: "泸州老窖", industry: "白酒", market: "主板", list_date: "19940509" },
  { ts_code: "600036.SH", symbol: "600036", name: "招商银行", industry: "银行", market: "主板", list_date: "20020409" },
  { ts_code: "601318.SH", symbol: "601318", name: "中国平安", industry: "保险", market: "主板", list_date: "20070301" },
  { ts_code: "000333.SZ", symbol: "000333", name: "美的集团", industry: "家用电器", market: "主板", list_date: "20130930" },
  { ts_code: "000651.SZ", symbol: "000651", name: "格力电器", industry: "家用电器", market: "主板", list_date: "19961118" },
  { ts_code: "002594.SZ", symbol: "002594", name: "比亚迪", industry: "汽车整车", market: "主板", list_date: "20110630" },
  { ts_code: "600104.SH", symbol: "600104", name: "上汽集团", industry: "汽车整车", market: "主板", list_date: "19971125" },
  { ts_code: "601012.SH", symbol: "601012", name: "隆基绿能", industry: "光伏设备", market: "主板", list_date: "20120411" },
  { ts_code: "300750.SZ", symbol: "300750", name: "宁德时代", industry: "电池", market: "创业板", list_date: "20180611" },
  { ts_code: "600900.SH", symbol: "600900", name: "长江电力", industry: "电力", market: "主板", list_date: "20031118" },
  { ts_code: "601899.SH", symbol: "601899", name: "紫金矿业", industry: "贵金属", market: "主板", list_date: "20080425" },
  { ts_code: "600030.SH", symbol: "600030", name: "中信证券", industry: "证券", market: "主板", list_date: "20030106" },
  { ts_code: "000001.SZ", symbol: "000001", name: "平安银行", industry: "银行", market: "主板", list_date: "19910403" },
  { ts_code: "600276.SH", symbol: "600276", name: "恒瑞医药", industry: "化学制药", market: "主板", list_date: "20001018" },
  { ts_code: "000002.SZ", symbol: "000002", name: "万科A", industry: "房地产开发", market: "主板", list_date: "19910129" },
  { ts_code: "600048.SH", symbol: "600048", name: "保利发展", industry: "房地产开发", market: "主板", list_date: "20060731" },
  { ts_code: "002415.SZ", symbol: "002415", name: "海康威视", industry: "安防设备", market: "中小板", list_date: "20100528" },
  { ts_code: "000725.SZ", symbol: "000725", name: "京东方A", industry: "光学光电子", market: "主板", list_date: "20010112" },
  { ts_code: "601888.SH", symbol: "601888", name: "中国中免", industry: "旅游零售", market: "主板", list_date: "20091015" },
  { ts_code: "600585.SH", symbol: "600585", name: "海螺水泥", industry: "水泥", market: "主板", list_date: "20020228" },
  { ts_code: "002714.SZ", symbol: "002714", name: "牧原股份", industry: "养殖", market: "中小板", list_date: "20140128" },
  { ts_code: "600887.SH", symbol: "600887", name: "伊利股份", industry: "乳业", market: "主板", list_date: "19960312" },
  { ts_code: "000063.SZ", symbol: "000063", name: "中兴通讯", industry: "通信设备", market: "主板", list_date: "19971118" },
  { ts_code: "601398.SH", symbol: "601398", name: "工商银行", industry: "银行", market: "主板", list_date: "20061027" },
  { ts_code: "601288.SH", symbol: "601288", name: "农业银行", industry: "银行", market: "主板", list_date: "20100715" },
  { ts_code: "600000.SH", symbol: "600000", name: "浦发银行", industry: "银行", market: "主板", list_date: "19991110" },
  { ts_code: "002304.SZ", symbol: "002304", name: "洋河股份", industry: "白酒", market: "中小板", list_date: "20091106" },
  { ts_code: "600809.SH", symbol: "600809", name: "山西汾酒", industry: "白酒", market: "主板", list_date: "19940106" },
  { ts_code: "002352.SZ", symbol: "002352", name: "顺丰控股", industry: "物流", market: "中小板", list_date: "20100226" },
  { ts_code: "601816.SH", symbol: "601816", name: "京沪高铁", industry: "铁路运输", market: "主板", list_date: "20200116" },
  { ts_code: "688981.SH", symbol: "688981", name: "中芯国际", industry: "半导体", market: "科创板", list_date: "20200716" },
  { ts_code: "300059.SZ", symbol: "300059", name: "东方财富", industry: "互联网券商", market: "创业板", list_date: "20100319" },
  { ts_code: "002475.SZ", symbol: "002475", name: "立讯精密", industry: "消费电子", market: "中小板", list_date: "20100915" },
  { ts_code: "600309.SH", symbol: "600309", name: "万华化学", industry: "化学制品", market: "主板", list_date: "20010105" },
  { ts_code: "300760.SZ", symbol: "300760", name: "迈瑞医疗", industry: "医疗器械", market: "创业板", list_date: "20181016" },
  { ts_code: "603259.SH", symbol: "603259", name: "药明康德", industry: "CXO", market: "主板", list_date: "20180508" },
  { ts_code: "002049.SZ", symbol: "002049", name: "紫光国微", industry: "芯片", market: "中小板", list_date: "20050606" },
  { ts_code: "688012.SH", symbol: "688012", name: "中微公司", industry: "半导体设备", market: "科创板", list_date: "20190722" },
];

async function getStockBasicList(): Promise<StockBasicRow[]> {
  // Priority 1: Read from built-in src/data/stock-basic.json (always available, deployed with project)
  const builtin = readBuiltinStockBasicList();
  if (builtin && builtin.length > 0) {
    return builtin;
  }

  // Priority 2: Check .cache/ or Supabase cache (7-day TTL)
  const cached = await getLatestStockBasicCache();
  if (cached && cached.length > 0) {
    return cached as StockBasicRow[];
  }

  // Priority 3: Fetch from Tushare API (for updates)
  try {
    const rows = await callTushare<StockBasicRow>(
      "stock_basic",
      { exchange: "", list_status: "L" },
      "ts_code,symbol,name,industry,market,list_date",
    );
    // Update both cache locations
    await saveStockBasicCache(rows as unknown as Record<string, unknown>[]);
    updateBuiltinStockBasicList(rows);
    return rows;
  } catch {
    // Priority 4: Last resort - hardcoded fallback list
    return FALLBACK_STOCK_LIST;
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
