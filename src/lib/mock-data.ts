import type {
  DailyReport, Sector, Stock, MarketOverview,
  MacroBrief, FundamentalAnalysis, TechnicalAnalysis,
  StockTracking, ChangeLog, ResearchSummary, MacroSummary,
} from './types';

function makeStock(
  code: string, name: string, price: number, changePercent: number,
  marketCap: number, mainNetInflow: number, turnoverRate: number
): Stock {
  return { code, name, price, changePercent, marketCap, mainNetInflow, turnoverRate };
}

function makeSector(
  id: string, name: string, changePercent: number, mainNetInflow: number,
  day1: number, day2: number, up: number, down: number, flat: number,
  flowType: 'continuous' | 'today_only',
  topGainers: Stock[], topMarketCap: Stock[]
): Sector {
  return {
    id, name, changePercent, mainNetInflow,
    mainNetInflowDay1: day1, mainNetInflowDay2: day2,
    upCount: up, downCount: down, flatCount: flat,
    totalStocks: up + down + flat,
    leaderStock: topGainers[0],
    topGainers, topMarketCap, flowType,
  };
}

// ========== 板块数据 ==========
const sectors: Sector[] = [
  makeSector('media', '传媒', 2.18, 64.84, 30.96, 33.88, 95, 42, 15, 'continuous',
    [
      makeStock('300880', '电声股份', 18.65, 10.02, 62, 8500, 12.5),
      makeStock('300781', '德利股份', 28.40, 8.15, 45, 5200, 8.3),
      makeStock('002027', '分众传媒', 7.82, 6.28, 1130, 32000, 3.2),
      makeStock('300459', '汤姆猫', 6.95, 5.62, 280, 12500, 6.8),
      makeStock('002555', '三七互娱', 22.30, 4.85, 490, 18600, 4.1),
    ],
    [
      makeStock('002027', '分众传媒', 7.82, 6.28, 1130, 32000, 3.2),
      makeStock('002555', '三七互娱', 22.30, 4.85, 490, 18600, 4.1),
      makeStock('300413', '芒果超媒', 28.60, 3.52, 535, 15800, 2.8),
      makeStock('603444', '吉比特', 298.50, 2.88, 215, 9200, 1.5),
      makeStock('002602', '世纪华通', 6.45, 2.35, 420, 8500, 3.5),
    ]
  ),
  makeSector('computer', '计算机', 0.47, 3.39, -20.21, 23.60, 128, 85, 32, 'today_only',
    [
      makeStock('688615', '罗普特', 22.80, 12.50, 38, 6800, 15.2),
      makeStock('300229', '拓尔思', 18.60, 8.85, 125, 15200, 7.5),
      makeStock('002230', '科大飞', 58.90, 6.72, 820, 28500, 3.8),
      makeStock('688118', '普元信息', 25.30, 5.88, 28, 3200, 8.2),
      makeStock('300036', '超图软件', 12.80, 5.12, 185, 8600, 4.5),
    ],
    [
      makeStock('002230', '科大飞', 58.90, 6.72, 820, 28500, 3.8),
      makeStock('300036', '超图软件', 12.80, 5.12, 185, 8600, 4.5),
      makeStock('688118', '普元信息', 25.30, 5.88, 28, 3200, 8.2),
      makeStock('300229', '拓尔思', 18.60, 8.85, 125, 15200, 7.5),
      makeStock('688615', '罗普特', 22.80, 12.50, 38, 6800, 15.2),
    ]
  ),
  makeSector('food-beverage', '食品饮料', 0.85, 55.57, 40.88, 14.69, 82, 38, 12, 'continuous',
    [
      makeStock('002330', 'ST西王', 4.28, 5.12, 42, 2800, 5.2),
      makeStock('600887', '伊利股份', 28.90, 3.85, 1840, 52000, 1.8),
      makeStock('002714', '牧原股份', 42.60, 3.52, 2320, 68000, 2.1),
      makeStock('603288', '海天味业', 38.50, 2.95, 1780, 35000, 1.2),
      makeStock('002568', '百润股份', 28.30, 2.68, 215, 8500, 3.5),
    ],
    [
      makeStock('600887', '伊利股份', 28.90, 3.85, 1840, 52000, 1.8),
      makeStock('002714', '牧原股份', 42.60, 3.52, 2320, 68000, 2.1),
      makeStock('603288', '海天味业', 38.50, 2.95, 1780, 35000, 1.2),
      makeStock('002568', '百润股份', 28.30, 2.68, 215, 8500, 3.5),
      makeStock('002330', 'ST西王', 4.28, 5.12, 42, 2800, 5.2),
    ]
  ),
  makeSector('automobile', '汽车', 0.12, 25.07, 12.27, 12.80, 135, 72, 28, 'continuous',
    [
      makeStock('002920', '天海电子', 15.80, 7.85, 95, 12500, 6.2),
      makeStock('600741', '华域汽车', 18.60, 4.52, 580, 18600, 2.8),
      makeStock('000625', '长安汽车', 15.20, 3.88, 1500, 35000, 2.5),
      makeStock('601238', '广汽集团', 9.85, 3.25, 1030, 22000, 2.1),
      makeStock('002906', '华阳集团', 32.50, 2.92, 165, 8200, 4.5),
    ],
    [
      makeStock('000625', '长安汽车', 15.20, 3.88, 1500, 35000, 2.5),
      makeStock('601238', '广汽集团', 9.85, 3.25, 1030, 22000, 2.1),
      makeStock('600741', '华域汽车', 18.60, 4.52, 580, 18600, 2.8),
      makeStock('002906', '华阳集团', 32.50, 2.92, 165, 8200, 4.5),
      makeStock('002920', '天海电子', 15.80, 7.85, 95, 12500, 6.2),
    ]
  ),
  makeSector('home-appliance', '家用电器', -0.10, 23.58, 14.60, 8.98, 68, 45, 18, 'continuous',
    [
      makeStock('300911', '亿田智能', 38.60, 6.85, 42, 5200, 7.5),
      makeStock('000333', '美的集团', 68.50, 2.35, 4780, 85000, 1.2),
      makeStock('000651', '格力电器', 38.90, 1.85, 2200, 42000, 1.5),
      makeStock('600690', '海尔智家', 28.60, 1.52, 2680, 35000, 1.8),
      makeStock('002508', '老板电器', 28.20, 1.28, 268, 8500, 2.5),
    ],
    [
      makeStock('000333', '美的集团', 68.50, 2.35, 4780, 85000, 1.2),
      makeStock('000651', '格力电器', 38.90, 1.85, 2200, 42000, 1.5),
      makeStock('600690', '海尔智家', 28.60, 1.52, 2680, 35000, 1.8),
      makeStock('002508', '老板电器', 28.20, 1.28, 268, 8500, 2.5),
      makeStock('300911', '亿田智能', 38.60, 6.85, 42, 5200, 7.5),
    ]
  ),
  makeSector('agriculture', '农林牧渔', 0.60, 22.02, 13.32, 8.70, 92, 55, 18, 'continuous',
    [
      makeStock('002100', '天康生物', 8.95, 6.55, 118, 8500, 5.8),
      makeStock('002714', '牧原股份', 42.60, 3.52, 2320, 68000, 2.1),
      makeStock('300498', '温氏股份', 18.80, 2.85, 1240, 25000, 2.5),
      makeStock('002311', '海大集团', 52.30, 2.35, 870, 18500, 1.8),
      makeStock('600598', '北大荒', 15.60, 1.95, 278, 6200, 3.2),
    ],
    [
      makeStock('002714', '牧原股份', 42.60, 3.52, 2320, 68000, 2.1),
      makeStock('300498', '温氏股份', 18.80, 2.85, 1240, 25000, 2.5),
      makeStock('002311', '海大集团', 52.30, 2.35, 870, 18500, 1.8),
      makeStock('002100', '天康生物', 8.95, 6.55, 118, 8500, 5.8),
      makeStock('600598', '北大荒', 15.60, 1.95, 278, 6200, 3.2),
    ]
  ),
  makeSector('retail-trade', '商贸零售', 1.13, 22.58, 15.76, 6.82, 75, 38, 12, 'continuous',
    [
      makeStock('301178', '博士眼镜', 28.50, 8.25, 38, 5600, 9.5),
      makeStock('002251', '步步高', 5.80, 5.65, 48, 2800, 6.2),
      makeStock('600827', '百联股份', 12.30, 4.28, 220, 5500, 3.5),
      makeStock('002697', '红旗连锁', 6.85, 3.52, 92, 3200, 4.2),
      makeStock('601933', '永辉超市', 3.95, 2.88, 358, 5800, 3.8),
    ],
    [
      makeStock('600827', '百联股份', 12.30, 4.28, 220, 5500, 3.5),
      makeStock('601933', '永辉超市', 3.95, 2.88, 358, 5800, 3.8),
      makeStock('002697', '红旗连锁', 6.85, 3.52, 92, 3200, 4.2),
      makeStock('002251', '步步高', 5.80, 5.65, 48, 2800, 6.2),
      makeStock('301178', '博士眼镜', 28.50, 8.25, 38, 5600, 9.5),
    ]
  ),
  makeSector('social-service', '社会服务', 0.65, 6.11, 2.44, 3.67, 48, 28, 8, 'continuous',
    [
      makeStock('600749', '西藏旅游', 12.80, 7.52, 28, 2500, 8.5),
      makeStock('601888', '中国中免', 78.50, 3.85, 1530, 42000, 1.8),
      makeStock('300144', '宋城演艺', 12.60, 3.28, 330, 8500, 3.2),
      makeStock('600258', '首旅酒店', 18.90, 2.65, 210, 5200, 2.8),
      makeStock('000428', '华天酒店', 3.85, 2.12, 38, 1200, 4.5),
    ],
    [
      makeStock('601888', '中国中免', 78.50, 3.85, 1530, 42000, 1.8),
      makeStock('300144', '宋城演艺', 12.60, 3.28, 330, 8500, 3.2),
      makeStock('600258', '首旅酒店', 18.90, 2.65, 210, 5200, 2.8),
      makeStock('600749', '西藏旅游', 12.80, 7.52, 28, 2500, 8.5),
      makeStock('000428', '华天酒店', 3.85, 2.12, 38, 1200, 4.5),
    ]
  ),
];

// ========== 市场概览 ==========
function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const overview: MarketOverview = {
  date: getTodayStr(),
  shIndex: 3356.78,
  shChange: 1.12,
  szIndex: 10582.45,
  szChange: 1.58,
  totalVolume: 12856,
  upSectors: 42,
  downSectors: 18,
  hotSectorsCount: sectors.length,
};

// ========== 宏观分析 ==========
const macroBrief: MacroBrief = {
  date: getTodayStr(),
  description: '最近1日中外财经热点快照，自动从公开新闻RSS聚合并按A股相关性筛选。',
  news: [
    {
      id: 'macro-1',
      title: "Warsh Tells Congress the Fed Has 'No Tolerance' for High Inflation",
      source: 'WSJ',
      publishDate: '2026-07-14',
      topic: '美国通胀 / 美联储',
      marketImpact: '影响全球利率定价与成长风格风险偏好，对A股成长和北向情绪传导较直接。',
    },
    {
      id: 'macro-2',
      title: 'Oil Surges Most Since 2020, Reflecting Bet That Strait Won\'t Go Back to Normal',
      source: 'WSJ',
      publishDate: '2026-07-14',
      topic: '能源 / 地缘政治',
      marketImpact: '影响原油、通胀与利率预期，对A股能源链和成本敏感行业的相对表现有明显扰动。',
    },
    {
      id: 'macro-3',
      title: 'How China Undercuts the U.S. in Iran',
      source: 'WSJ',
      publishDate: '2026-06-23',
      topic: '中国经济 / 出口 / 人民币',
      marketImpact: '影响A股顺周期、出口制造和人民币资产定价，也会影响外资对中国资产风险偏好。',
    },
  ],
};

// ========== 基本面分析 ==========
const fundamental: FundamentalAnalysis = {
  periodStart: '20260716',
  periodEnd: '20260716',
  newStocks: ['中国人寿', '桐昆股份', '安井食品'],
  removedStocks: ['燕京啤酒', '万华化学', '中远海能'],
  stocks: [
    {
      code: '601628', name: '中国人寿', exchange: 'SH',
      coverageCount: 11, reportCount: 12,
      latestRating: '优于大市',
      targetPrice: 48.40, targetPriceLabel: '48.40 元（单点目标价）',
      insights: [
        {
          tag: '业绩兑现',
          summary: '业绩进入兑现阶段，利润增速或盈利弹性是当前机构共识最集中的抓手。',
          institutionCount: 11,
          keywords: ['利润增速超预期', '1H26业绩预增点评'],
        },
        {
          tag: '景气上行',
          summary: '行业景气或供需结构正在改善，市场关注点集中在景气上行能否继续传导到盈利。',
          institutionCount: 1,
          keywords: ['投资端收益显著改善'],
        },
      ],
    },
    {
      code: '601233', name: '桐昆股份', exchange: 'SH',
      coverageCount: 4, reportCount: 5,
      latestRating: '买入',
      targetPrice: 30.50, targetPriceLabel: '30.50 元（单点目标价）',
      insights: [
        {
          tag: '业绩兑现',
          summary: '业绩进入兑现阶段，利润增速或盈利弹性是当前机构共识最集中的抓手。',
          institutionCount: 4,
          keywords: ['业绩基本符合预期', '盈利持续增长'],
        },
        {
          tag: '景气上行',
          summary: '行业景气或供需结构正在改善，市场关注点集中在景气上行能否继续传导到盈利。',
          institutionCount: 3,
          keywords: ['长丝高景气持续', '炼化价差同比回暖'],
        },
      ],
    },
    {
      code: '603345', name: '安井食品', exchange: 'SH',
      coverageCount: 3, reportCount: 3,
      latestRating: '买入',
      targetPrice: 96.11, targetPriceLabel: '96.11 元（单点目标价）',
      insights: [
        {
          tag: '景气上行',
          summary: '行业景气或供需结构正在改善，市场关注点集中在景气上行能否继续传导到盈利。',
          institutionCount: 1,
          keywords: ['食品饮料迎来需求改善新周期'],
        },
      ],
    },
  ],
};

// ========== 技术面分析 ==========
const technical: TechnicalAnalysis = {
  description: '技术面样本来自基本面中最核心的股票，使用 Tushare 最新日线数据计算 MA20、MA60、20 日支撑/压力位，并结合分析师目标区间做位置判断。',
  stocks: [
    {
      code: '601628', name: '中国人寿', exchange: 'SH',
      tradeDate: '2026-07-16', closePrice: 38.92, dayChange: -3.71,
      ma20: 37.27, ma60: 35.95, trend: '多头趋势',
      support20: 33.10, pressure20: 41.01,
      range60Low: 32.32, range60High: 41.01,
      analystTarget: 48.40, analystTargetLabel: '48.40 元（单点目标价）',
      upsidePotential: 24.36,
      change20d: 8.68, turnoverRate: 0.22, pe: 7.14, pb: 1.84,
      conclusions: [
        '收盘价站上 MA20 和 MA60，均线结构偏强。',
        'MA20 继续上拐。',
        '距 20 日压力位约 5.37%。',
        '距 20 日支撑位约 17.58%。',
        '价格位于分析师目标区间下方，若基本面继续兑现，存在向目标区间回归的空间。',
      ],
    },
    {
      code: '601233', name: '桐昆股份', exchange: 'SH',
      tradeDate: '2026-07-16', closePrice: 20.33, dayChange: -1.88,
      ma20: 22.21, ma60: 21.34, trend: '高位回撤',
      support20: 19.08, pressure20: 25.42,
      range60Low: 18.36, range60High: 25.42,
      analystTarget: 30.50, analystTargetLabel: '30.50 元（单点目标价）',
      upsidePotential: 50.02,
      change20d: -6.01, turnoverRate: 1.44, pe: 23.79, pb: 1.20,
      conclusions: [
        '均线关系未形成单边结构，价格仍处在整理阶段。',
        'MA20 开始走平或回落。',
        '距 20 日压力位约 25.04%。',
        '距 20 日支撑位约 6.55%。',
        '价格位于分析师目标区间下方，若基本面继续兑现，存在向目标区间回归的空间。',
      ],
    },
    {
      code: '603345', name: '安井食品', exchange: 'SH',
      tradeDate: '2026-07-16', closePrice: 88.90, dayChange: -1.28,
      ma20: 83.02, ma60: 92.18, trend: '反弹修复',
      support20: 76.76, pressure20: 90.05,
      range60Low: 76.76, range60High: 112.50,
      analystTarget: 96.11, analystTargetLabel: '96.11 元（单点目标价）',
      upsidePotential: 8.11,
      change20d: 4.66, turnoverRate: 2.47, pe: 21.80, pb: 1.85,
      conclusions: [
        '收盘价回到 MA20 上方，但仍受 MA60 压制。',
        'MA20 继续上拐。',
        '距 20 日压力位约 1.29%。',
        '距 20 日支撑位约 15.82%。',
        '价格位于分析师目标区间下方，若基本面继续兑现，存在向目标区间回归的空间。',
      ],
    },
  ],
};

// ========== 荐股追踪 ==========
const stockTracking: StockTracking = {
  description: '以每日荐股当日收盘价为基准，对比截至最新交易日的收盘价；每个日期只保留 3 只荐股。',
  groups: [
    {
      date: '2026-07-15',
      stocks: [
        { code: '000729', exchange: 'SZ', name: '燕京啤酒', recommendDateClose: 11.66, latestClose: 12.01, cumulativeChange: 3.00, coverageCount: 10, reportCount: 10 },
        { code: '600309', exchange: 'SH', name: '万华化学', recommendDateClose: 70.09, latestClose: 68.36, cumulativeChange: -2.47, coverageCount: 9, reportCount: 10 },
        { code: '600026', exchange: 'SH', name: '中远海能', recommendDateClose: 15.83, latestClose: 14.94, cumulativeChange: -5.62, coverageCount: 8, reportCount: 8 },
      ],
    },
    {
      date: '2026-07-14',
      stocks: [
        { code: '000729', exchange: 'SZ', name: '燕京啤酒', recommendDateClose: 11.36, latestClose: 12.01, cumulativeChange: 5.72, coverageCount: 10, reportCount: 10 },
        { code: '600309', exchange: 'SH', name: '万华化学', recommendDateClose: 69.60, latestClose: 68.36, cumulativeChange: -1.78, coverageCount: 9, reportCount: 10 },
        { code: '600026', exchange: 'SH', name: '中远海能', recommendDateClose: 15.28, latestClose: 14.94, cumulativeChange: -2.23, coverageCount: 8, reportCount: 8 },
        { code: '600882', exchange: 'SH', name: '妙可蓝多', recommendDateClose: 20.52, latestClose: 22.11, cumulativeChange: 7.75, coverageCount: 8, reportCount: 8 },
        { code: '601211', exchange: 'SH', name: '国泰海通', recommendDateClose: 18.17, latestClose: 18.54, cumulativeChange: 2.04, coverageCount: 7, reportCount: 9 },
        { code: '601336', exchange: 'SH', name: '新华保险', recommendDateClose: 64.51, latestClose: 64.35, cumulativeChange: -0.25, coverageCount: 7, reportCount: 7 },
        { code: '601872', exchange: 'SH', name: '招商轮船', recommendDateClose: 15.04, latestClose: 14.16, cumulativeChange: -5.85, coverageCount: 7, reportCount: 7 },
        { code: '603225', exchange: 'SH', name: '新凤鸣', recommendDateClose: 17.42, latestClose: 17.66, cumulativeChange: 1.38, coverageCount: 7, reportCount: 7 },
        { code: '301200', exchange: 'SZ', name: '大族数控', recommendDateClose: 327.00, latestClose: 287.88, cumulativeChange: -11.96, coverageCount: 6, reportCount: 6 },
        { code: '002028', exchange: 'SZ', name: '思源电气', recommendDateClose: 162.00, latestClose: 151.40, cumulativeChange: -6.54, coverageCount: 5, reportCount: 7 },
        { code: '002064', exchange: 'SZ', name: '华峰化学', recommendDateClose: 9.90, latestClose: 9.96, cumulativeChange: 0.61, coverageCount: 5, reportCount: 6 },
        { code: '000415', exchange: 'SZ', name: '渤海租赁', recommendDateClose: 4.31, latestClose: 4.37, cumulativeChange: 1.39, coverageCount: 5, reportCount: 5 },
      ],
    },
  ],
};

// ========== 研报观点总结 ==========
const researchSummary: ResearchSummary = {
  overallView: '当前市场主线围绕"业绩兑现+景气上行"双逻辑展开。机构集中看好保险板块的利润弹性与投资端改善，化工长丝赛道受益于景气持续上行，食品饮料则迎来需求改善新周期。技术面上，中国人寿均线结构偏强且距目标价仍有24%空间，桐昆股份虽短期回撤但潜在空间超50%，安井食品处于反弹修复阶段。板块资金面上，传媒与食品饮料连续两日获主力大额净流入，计算机板块今日异军突起但前一日流出较大，需关注持续性。',
  keyThemes: [
    {
      theme: '保险板块：业绩兑现期到来',
      detail: '中国人寿获11家机构集中覆盖，利润增速超预期成为最核心共识。技术面均线多头排列，收盘价站稳MA20/MA60上方，目标价48.40元对应24%上行空间。',
      relatedStocks: ['中国人寿'],
      sentiment: 'bullish',
    },
    {
      theme: '化工长丝：景气上行持续验证',
      detail: '桐昆股份4家机构覆盖，长丝高景气持续、炼化价差同比回暖。短期虽处高位回撤，但目标价30.50元对应50%潜在空间，性价比突出。',
      relatedStocks: ['桐昆股份'],
      sentiment: 'bullish',
    },
    {
      theme: '食品饮料：需求改善新周期',
      detail: '安井食品获3家机构买入评级，食品饮料行业迎来需求改善信号。板块连续两日获主力净流入55.57亿元，资金面与基本面共振。',
      relatedStocks: ['安井食品'],
      sentiment: 'bullish',
    },
    {
      theme: '传媒板块：资金持续涌入',
      detail: '传媒板块连续两日主力净流入合计64.84亿元，居所有板块之首。电声股份领涨10%，分众传媒等龙头获资金追捧。',
      relatedStocks: ['电声股份', '分众传媒'],
      sentiment: 'bullish',
    },
  ],
  riskAlerts: [
    '美联储"零容忍"高通胀立场或压制全球成长风格风险偏好，关注北向资金波动',
    '原油价格剧烈波动（2020年以来最大涨幅）可能扰动A股能源链和成本敏感行业',
    '计算机板块仅今日单日流入，前一日大幅流出20亿，资金持续性存疑',
    '桐昆股份MA20走平回落，短期技术面偏弱，需等待企稳信号',
  ],
  opportunityHighlights: [
    '中国人寿：均线多头+目标价24%空间，基本面与技术面共振，当前性价比突出',
    '桐昆股份：50%潜在空间为本期最大，若长丝景气持续验证，回撤即机会',
    '传媒板块：连续两日资金大幅流入，关注龙头分众传媒、三七互娱的持续性',
    '食品饮料板块：需求改善预期+资金连续流入，安井食品距目标价仅8%',
  ],
};

// ========== 宏观观点总结 ==========
const macroSummary: MacroSummary = {
  overallView: '海外宏观环境偏紧，对A股形成多重扰动。美联储新任主席候选人Warsh明确表态"零容忍高通胀"，强化紧缩预期，直接压制成长风格估值和北向资金风险偏好。中东地缘局势升级推动原油创2020年以来最大涨幅，若霍尔木兹海峡通航持续受限，将推升全球通胀预期并冲击能源成本敏感行业。中美在伊朗问题上的博弈则影响出口制造和人民币资产定价，外资对中国资产的风险偏好可能受到扰动。整体而言，外部不确定性上升，A股短期需关注利率敏感板块的回调压力和能源链的结构性机会。',
  keyTakeaways: [
    {
      point: '美联储紧缩预期升温',
      impact: 'negative',
      detail: 'Warsh "零容忍高通胀"表态强化利率高位持续预期，全球成长股估值承压，A股科技/消费等长久期板块首当其冲，北向资金流入节奏或放缓。',
    },
    {
      point: '原油价格剧烈波动',
      impact: 'negative',
      detail: '霍尔木兹海峡通航风险推升油价，利好中国石油/中国石化等上游企业，但航空、化工下游、交运等成本敏感行业利润空间将被压缩。',
    },
    {
      point: '中美博弈影响出口预期',
      impact: 'neutral',
      detail: '伊朗问题上的中美角力影响出口制造和人民币定价，顺周期板块（家电、汽车出口链）和外资持仓较重的标的可能出现波动。',
    },
  ],
};

// ========== 变更日志 ==========
const changeLog: ChangeLog = {
  macroUpdateFrom: '2026-07-15',
  macroUpdateTo: '2026-07-16',
  newConsensusStocks: ['中国人寿', '桐昆股份', '安井食品'],
  removedConsensusStocks: ['燕京啤酒', '万华化学', '中远海能'],
  newSectors: ['汽车', '社会服务', '计算机'],
  removedSectors: ['医药生物', '银行', '非银金融'],
};

// ========== 导出 ==========
export function getDailyReport(): DailyReport {
  return {
    overview,
    hotSectors: sectors,
    macroBrief,
    macroSummary,
    fundamental,
    technical,
    stockTracking,
    researchSummary,
    changeLog,
    generatedAt: new Date().toISOString(),
  };
}

export function getSectorById(id: string): Sector | undefined {
  return sectors.find((s) => s.id === id);
}

export function getAllSectors(): Sector[] {
  return sectors;
}
