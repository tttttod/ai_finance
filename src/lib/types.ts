// Types for A-stock sector tracking data

export interface Stock {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap: number; // 流通市值（亿元）
  mainNetInflow: number; // 主力资金净流入（万元）
  turnoverRate: number; // 换手率
}

export interface Sector {
  id: string;
  name: string;
  changePercent: number; // 板块涨跌幅
  mainNetInflow: number; // 主力资金净流入（亿元）
  mainNetInflowDay1: number; // 前一交易日主力净流入
  mainNetInflowDay2: number; // 当日主力净流入
  upCount: number;
  downCount: number;
  flatCount: number;
  totalStocks: number;
  leaderStock: Stock;
  topGainers: Stock[];
  topMarketCap: Stock[];
  flowType: 'continuous' | 'today_only'; // 连续2日流入 / 仅今日流入
}

export interface MarketOverview {
  date: string;
  shIndex: number;
  shChange: number;
  szIndex: number;
  szChange: number;
  totalVolume: number;
  upSectors: number;
  downSectors: number;
  hotSectorsCount: number;
}

// ---- 宏观分析 ----
export interface MacroNewsItem {
  id: string;
  title: string;
  source: string;
  publishDate: string;
  topic: string;
  marketImpact: string;
}

export interface MacroBrief {
  date: string;
  description: string;
  news: MacroNewsItem[];
}

// ---- 基本面分析 ----
export interface ResearchInsight {
  tag: string; // 如 "业绩兑现"、"景气上行"
  summary: string;
  institutionCount: number;
  keywords: string[];
}

export interface ConsensusStock {
  code: string;
  name: string;
  exchange: string; // "SH" | "SZ"
  coverageCount: number;
  reportCount: number;
  latestRating: string;
  targetPrice: number;
  targetPriceLabel: string;
  insights: ResearchInsight[];
}

export interface FundamentalAnalysis {
  periodStart: string;
  periodEnd: string;
  stocks: ConsensusStock[];
  newStocks: string[]; // 新增共识股名称
  removedStocks: string[]; // 移出共识股名称
}

// ---- 技术面分析 ----
export type TrendType = '多头趋势' | '高位回撤' | '反弹修复' | '空头趋势' | '横盘整理';

export interface TechnicalStock {
  code: string;
  name: string;
  exchange: string;
  tradeDate: string;
  closePrice: number;
  dayChange: number;
  ma20: number;
  ma60: number;
  trend: TrendType;
  support20: number;
  pressure20: number;
  range60Low: number;
  range60High: number;
  analystTarget: number;
  analystTargetLabel: string;
  upsidePotential: number;
  change20d: number;
  turnoverRate: number;
  pe: number;
  pb: number;
  conclusions: string[];
}

export interface TechnicalAnalysis {
  description: string;
  stocks: TechnicalStock[];
}

// ---- 荐股追踪 ----
export interface TrackedStock {
  code: string;
  exchange: string;
  name: string;
  recommendDateClose: number;
  latestClose: number;
  cumulativeChange: number;
  coverageCount: number;
  reportCount: number;
}

export interface RecommendGroup {
  date: string;
  stocks: TrackedStock[];
}

export interface StockTracking {
  description: string;
  groups: RecommendGroup[];
}

// ---- 组合报告 ----
export interface ChangeLog {
  macroUpdateFrom: string;
  macroUpdateTo: string;
  newConsensusStocks: string[];
  removedConsensusStocks: string[];
  newSectors: string[];
  removedSectors: string[];
}

export interface DailyReport {
  overview: MarketOverview;
  hotSectors: Sector[];
  macroBrief: MacroBrief;
  fundamental: FundamentalAnalysis;
  technical: TechnicalAnalysis;
  stockTracking: StockTracking;
  changeLog: ChangeLog;
  generatedAt: string;
}
