// Market snapshot types for the mini-program MarketTab

export interface MiniMarketIndex {
  name: string;
  code: string;
  price: number;
  change: number;
  volume: number;
}

export interface MiniMarketSector {
  name: string;
  change: number;
  inflow: number;
  heat: number;
}

export interface MiniActiveStock {
  name: string;
  code: string;
  price: number;
  change: number;
  reason: string;
}

export interface MiniRecommendedTarget {
  name: string;
  code: string;
  industry: string;
  recommended_style: "short" | "swing" | "long";
  default_horizon: string;
  opportunity_score: number;
  risk_level: string;
  reason: string;
  main_risk: string;
  trigger_source: string[];
  is_demo_data: boolean;
}

export interface DataQuality {
  indices: "tushare" | "mock";
  hotSectors: "tushare" | "mock";
  activeStocks: "tushare" | "mock";
  recommendedTargets: "tushare" | "mock";
}

export interface MiniMarketSnapshot {
  snapshotDate: string;
  tradeDate: string;
  fetchedAt: string;
  source: "tushare" | "mock" | "cache";
  stale: boolean;
  summary: string;
  indices: MiniMarketIndex[];
  hotSectors: MiniMarketSector[];
  activeStocks: MiniActiveStock[];
  recommendedTargets: MiniRecommendedTarget[];
  events: { time: string; title: string; impact: "positive" | "negative" | "neutral" }[];
  dataQuality?: DataQuality;
}
