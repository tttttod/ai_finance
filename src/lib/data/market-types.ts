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

/**
 * 数据来源语义（面向接口返回）：
 * - tushare:  本次请求实时从 Tushare 拉取并成功写入
 * - database: 来自 Supabase 历史真实快照
 * - file:     Supabase 不可用时的本地文件快照（真实数据）
 * - mock:     演示数据兜底（isDemo = true）
 */
export type MarketSnapshotSource = "tushare" | "database" | "file" | "mock";

export interface MiniMarketSnapshot {
  snapshotDate: string;
  tradeDate: string;
  fetchedAt: string;
  /** 兼容旧字段，新代码请用 source；旧值 "cache" 会在读取时归一为 "database" */
  source: MarketSnapshotSource | "cache";
  stale: boolean;
  summary: string;
  indices: MiniMarketIndex[];
  hotSectors: MiniMarketSector[];
  activeStocks: MiniActiveStock[];
  recommendedTargets: MiniRecommendedTarget[];
  events: { time: string; title: string; impact: "positive" | "negative" | "neutral" }[];
  dataQuality?: DataQuality;
  /** 快照持久化来源（写入位置）：supabase / file，仅服务端使用 */
  persistedTo?: "supabase" | "file";
}

/** 接口返回给前端的标准化视图 */
export interface MarketSnapshotResponse extends Omit<MiniMarketSnapshot, "source" | "persistedTo"> {
  source: MarketSnapshotSource;
  updatedAt: string;
  isStale: boolean;
  isDemo: boolean;
}
