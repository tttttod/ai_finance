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
  upCount: number; // 上涨家数
  downCount: number; // 下跌家数
  flatCount: number; // 平盘家数
  totalStocks: number; // 板块总股票数
  leaderStock: Stock; // 领涨股
  topGainers: Stock[]; // 涨幅靠前
  topMarketCap: Stock[]; // 流通市值靠前
}

export interface MarketOverview {
  date: string;
  shIndex: number;
  shChange: number;
  szIndex: number;
  szChange: number;
  totalVolume: number; // 总成交额（亿元）
  upSectors: number;
  downSectors: number;
  hotSectorsCount: number;
}

export interface DailyReport {
  overview: MarketOverview;
  hotSectors: Sector[];
  generatedAt: string;
}
