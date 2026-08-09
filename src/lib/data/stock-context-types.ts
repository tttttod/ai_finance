/**
 * Stock research context types.
 * Used by /api/stock-context and the ResearchTab.
 */

export interface StockIdentity {
  tsCode: string;      // 600519.SH
  symbol: string;      // 600519
  name: string;
  industry: string;
  market?: string;
  listDate?: string;
}

export interface StockQuoteContext {
  tradeDate: string;
  close: number;
  pctChg: number;
  amount: number;
  vol?: number;
}

export interface StockValuationContext {
  pe?: number;
  peTtm?: number;
  pb?: number;
  totalMv?: number;
  circMv?: number;
  turnoverRate?: number;
  volumeRatio?: number;
}

export interface StockTechnicalContext {
  ma5?: number;
  ma20?: number;
  ma60?: number;
  change5d?: number;
  change20d?: number;
  volatility20d?: number;
  trend: "bullish" | "neutral" | "bearish";
  support20?: number;
  pressure20?: number;
}

export interface StockMarketContext {
  marketSummary?: string;
  hotSectors?: { name: string; change: number; heat: number }[];
  industryHeat?: {
    name: string;
    rank?: number;
    avgChange?: number;
    heat?: number;
  };
}

export interface StockResearchContext {
  stock: StockIdentity;
  quote?: StockQuoteContext;
  valuation?: StockValuationContext;
  technical?: StockTechnicalContext;
  market?: StockMarketContext;
  dataQuality: {
    source: "tushare" | "cache" | "mock";
    fetchedAt: string;
    stale: boolean;
    missing: string[];
  };
}

export interface StockContextCacheRecord {
  cacheKey: string;
  tsCode: string;
  payload: StockResearchContext;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
