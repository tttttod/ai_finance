// ===== 热门新闻聚合类型定义 =====

export type HotNewsSentiment = "panic" | "neutral" | "euphoria";

export interface HotNewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  summary: string;
  sentiment: HotNewsSentiment;
  sentimentLabel: "恐慌" | "中性" | "狂热";
  hotScore: number;
  relatedSectors: string[];
  tags: string[];
}

export interface HotNewsMeta {
  provider: string;
  fetchedAt: string;
  query: string;
  isFallback: boolean;
  message?: string;
}

export interface HotNewsResponse {
  success: boolean;
  data: HotNewsItem[];
  meta: HotNewsMeta;
}

// 默认查询关键词
export const DEFAULT_NEWS_KEYWORDS = [
  "A股",
  "港股",
  "美股",
  "半导体",
  "AI芯片",
  "新能源",
  "房地产",
  "券商",
  "人民币",
  "美联储",
  "降息",
  "CPI",
  "PPI",
  "原油",
  "黄金",
];

// 恐慌关键词
export const PANIC_KEYWORDS = [
  "暴跌", "跳水", "崩盘", "恐慌", "大跌", "跌停",
  "踩踏", "抛售", "爆雷", "违约", "亏损扩大", "监管调查",
  "风险", "警告", "制裁", "退市",
];

// 狂热关键词
export const EUPHORIA_KEYWORDS = [
  "暴涨", "涨停潮", "抢筹", "爆发", "大涨", "创新高",
  "翻倍", "资金涌入", "火爆", "全线拉升", "突破", "利好",
  "牛市", "疯涨", "飙升",
];

// 板块关联规则
export const SECTOR_KEYWORD_MAP: Record<string, string[]> = {
  "AI算力": ["AI", "算力", "芯片", "英伟达", "GPU", "大模型", "人工智能"],
  "半导体": ["半导体", "芯片", "晶圆", "光刻", "封测", "中芯"],
  "消费电子": ["消费电子", "手机", "苹果", "华为", "可穿戴"],
  "新能源": ["新能源", "电池", "光伏", "储能", "风电", "碳中和"],
  "电池": ["电池", "锂电", "宁德时代", "比亚迪", "储能"],
  "光伏": ["光伏", "太阳能", "硅料", "组件", "逆变器"],
  "房地产": ["房地产", "地产", "房贷", "楼市", "房价", "万科"],
  "银行": ["银行", "信贷", "存款", "降准", "降息"],
  "金融": ["金融", "券商", "保险", "信托", "期货"],
  "券商": ["券商", "牛市", "成交额", "经纪", "投行"],
  "贵金属": ["黄金", "金价", "白银", "贵金属", "避险"],
  "石油石化": ["原油", "OPEC", "油价", "石油", "天然气", "石化"],
  "化工": ["化工", "化学", "材料", "MDI", "万华"],
  "医药生物": ["医药", "创新药", "医保", "生物", "疫苗", "CXO"],
  "出口链": ["出口", "外贸", "汇率", "人民币", "美元", "美联储"],
  "金融科技": ["金融科技", "FinTech", "数字货币", "区块链", "支付"],
};

// 主流财经媒体来源加分
export const TOP_FINANCE_SOURCES = [
  "reuters.com", "bloomberg.com", "ft.com", "wsj.com",
  "caixin.com", "yicai.com", "cls.cn", "eastmoney.com",
  "stcn.com", "cs.com.cn", "xinhua", "cctv",
];
