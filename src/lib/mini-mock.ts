import {
  AgentResponse,
  FactorScore,
  ScenarioPrediction,
  DebatePoint,
  RiskCheck,
  ResearchReport,
  ReviewTask,
  InvestmentStyle,
  WorkflowStep,
  FACTOR_WEIGHTS,
  RecommendedTarget,
  ReplayCurveFit,
  ReviewDetail,
  GlobalNewsEvent,
  TradeTIQuestion,
  TradeTIPersonalityId,
  TradeTIResult,
  TradeTIScores,
  TRADETI_PRIORITY,
} from "./mini-types";
import type { StockResearchContext } from "./data/stock-context-types";

// 生成因子评分
function generateFactorScores(style: InvestmentStyle): FactorScore[] {
  const weights = FACTOR_WEIGHTS[style];
  return weights.map((w) => {
    const score = Math.floor(Math.random() * 30) + 60;
    return {
      name: w.name,
      score,
      weight: w.weight,
      contribution: Math.round((score * w.weight) / 100),
    };
  });
}

// 生成情景预测
function generateScenarios(currentPrice: number): ScenarioPrediction {
  const optimisticReturn = Math.floor(Math.random() * 15) + 10;
  const neutralReturn = Math.floor(Math.random() * 10) - 2;
  const pessimisticReturn = -(Math.floor(Math.random() * 15) + 5);

  return {
    optimistic: {
      price: Math.round(currentPrice * (1 + optimisticReturn / 100) * 100) / 100,
      returnPct: optimisticReturn,
      logic: "行业景气度持续上行，公司业绩超预期，资金持续流入，技术面突破关键阻力位。",
    },
    neutral: {
      price: Math.round(currentPrice * (1 + neutralReturn / 100) * 100) / 100,
      returnPct: neutralReturn,
      logic: "行业平稳发展，公司业绩符合预期，估值处于合理区间，震荡整理为主。",
    },
    pessimistic: {
      price: Math.round(currentPrice * (1 + pessimisticReturn / 100) * 100) / 100,
      returnPct: pessimisticReturn,
      logic: "行业竞争加剧，公司业绩不及预期，估值承压，技术面跌破支撑位。",
    },
  };
}

// 生成辩论观点
function generateDebatePoints(): { bull: DebatePoint[]; bear: DebatePoint[] } {
  return {
    bull: [
      {
        id: "b1",
        title: "行业景气度持续上行",
        content: "AI 算力需求爆发带动半导体设备订单持续增长，公司作为国产设备龙头直接受益。",
        evidence: "2026Q1 新增订单同比增长 45%，在手订单覆盖 18 个月营收。",
        confidence: 85,
      },
      {
        id: "b2",
        title: "国产替代加速",
        content: "美国出口管制升级，国内晶圆厂加速导入国产设备，公司市占率持续提升。",
        evidence: "公司在中芯国际、华虹半导体等头部客户份额提升至 35%。",
        confidence: 80,
      },
      {
        id: "b3",
        title: "技术突破打开成长空间",
        content: "公司 14nm 刻蚀设备通过验证，进入先进制程供应链，打开长期成长天花板。",
        evidence: "14nm 设备已获 3 家客户订单，预计 2027 年贡献营收 15 亿元。",
        confidence: 75,
      },
    ],
    bear: [
      {
        id: "b1",
        title: "估值处于历史高位",
        content: "当前 PE 65 倍，处于近 5 年 90% 分位，已充分反映乐观预期。",
        evidence: "近 5 年 PE 中位数 45 倍，当前溢价 44%。",
        confidence: 70,
      },
      {
        id: "b2",
        title: "行业竞争加剧",
        content: "中微公司、拓荆科技等竞争对手快速崛起，可能侵蚀公司市场份额。",
        evidence: "竞争对手 2026Q1 订单同比增长 60%，增速超过公司。",
        confidence: 65,
      },
      {
        id: "b3",
        title: "地缘政治风险",
        content: "若中美关系缓和，国产替代逻辑可能弱化，影响估值溢价。",
        evidence: "历史数据显示，中美关系缓和期间半导体板块平均回调 15%。",
        confidence: 50,
      },
    ],
  };
}

// 生成风险检查
function generateRiskChecks(): RiskCheck[] {
  return [
    {
      id: "r1",
      category: "估值风险",
      title: "估值处于历史高位",
      description: "PE 65 倍，近 5 年 90% 分位，安全边际较低。",
      severity: "high",
      status: "warning",
    },
    {
      id: "r2",
      category: "流动性风险",
      title: "换手率偏高",
      description: "近 5 日平均换手率 4.2%，高于行业平均 2.1%，存在短期交易拥挤。",
      severity: "medium",
      status: "warning",
    },
    {
      id: "r3",
      category: "财务风险",
      title: "应收账款增长较快",
      description: "应收账款同比增长 35%，高于营收增速 25%，需关注回款风险。",
      severity: "medium",
      status: "warning",
    },
    {
      id: "r4",
      category: "政策风险",
      title: "出口管制政策变化",
      description: "若美国进一步收紧出口管制，可能影响公司海外供应链。",
      severity: "low",
      status: "pass",
    },
    {
      id: "r5",
      category: "合规风险",
      title: "无重大合规问题",
      description: "公司近 3 年无重大违规记录，信息披露规范。",
      severity: "low",
      status: "pass",
    },
  ];
}

// 生成研究报告
function generateReport(target: string, style: InvestmentStyle): ResearchReport {
  const periods = { short: "5 个交易日", swing: "20 个交易日", long: "12 个月" };
  const audiences = { short: "短线交易者", swing: "波段投资者", long: "长期价值投资者" };

  return {
    target,
    style,
    period: periods[style],
    conclusion: {
      direction: style === "short" ? "短期偏多" : style === "swing" ? "中期看好" : "长期推荐",
      confidence: 72,
      audience: audiences[style],
    },
    logic: [
      "行业景气度持续上行，AI 算力需求带动半导体设备订单增长。",
      "公司作为国产设备龙头，市占率持续提升，技术突破打开成长空间。",
      "国产替代逻辑长期成立，政策支持力度加大。",
    ],
    evidence: [
      "2026Q1 新增订单同比增长 45%，在手订单覆盖 18 个月营收。",
      "公司在头部客户份额提升至 35%，14nm 设备通过验证。",
      "近 5 日北向资金净流入 8.5 亿元，机构调研频次增加。",
    ],
    scenarios: generateScenarios(285.6),
    risks: [
      "估值处于历史高位，PE 65 倍，安全边际较低。",
      "行业竞争加剧，竞争对手订单增速超过公司。",
      "地缘政治风险，若中美关系缓和可能影响国产替代逻辑。",
    ],
    watchIndicators: [
      "月度新增订单数据",
      "头部客户份额变化",
      "14nm 设备量产进度",
      "行业 PE 分位变化",
    ],
    reviewPlan: {
      date: style === "short" ? "5 个交易日后" : style === "swing" ? "20 个交易日后" : "3 个月后",
      indicators: ["股价表现", "订单数据", "行业景气度", "估值分位"],
      criteria: "若股价涨幅超过 10% 且订单数据持续向好，则维持看好；若跌破关键支撑位或订单下滑，则重新评估。",
    },
  };
}

// 生成复盘任务
function generateReviewTask(target: string, style: InvestmentStyle): ReviewTask {
  const now = new Date();
  const reviewDate = new Date(now.getTime() + (style === "short" ? 5 : style === "swing" ? 20 : 90) * 24 * 60 * 60 * 1000);

  return {
    id: `review-${Date.now()}`,
    target,
    style,
    createdAt: now.toISOString().split("T")[0],
    reviewDate: reviewDate.toISOString().split("T")[0],
    indicators: ["股价表现", "订单数据", "行业景气度", "估值分位"],
    criteria: "若股价涨幅超过 10% 且订单数据持续向好，则维持看好；若跌破关键支撑位或订单下滑，则重新评估。",
    status: "pending",
  };
}

// Mock Agent 响应生成器
export function generateAgentResponse(
  step: number,
  stepId: WorkflowStep,
  target: string,
  style: InvestmentStyle
): AgentResponse {
  const agentMap: Record<string, string> = {
    step1_question: "lead",
    step2_style: "lead",
    step3_data: "data",
    step4_market: "market",
    step5_industry: "industry",
    step6_fundamental: "fundamental",
    step7_valuation: "valuation",
    step8_technical: "technical",
    step9_sentiment: "sentiment",
    step10_scoring: "lead",
    step11_bull: "bull",
    step12_bear: "bear",
    step13_risk: "risk",
    step14_scenario: "lead",
    step15_conclusion: "manager",
    step16_review: "manager",
  };

  const contentMap: Record<string, string> = {
    step1_question: `已确认研究对象：${target}。我将引导您完成一次完整的基本面分析流程。`,
    step2_style: `投资风格：${style === "short" ? "短线" : style === "swing" ? "波段" : "长期"}。研究周期已设定。`,
    step3_data: "数据收集完成。行情、财务、估值、行业、新闻数据已就绪，无重大缺失项。",
    step4_market: "大盘处于震荡上行趋势，成交量温和放大，赚钱效应回升，风险偏好中性偏多。",
    step5_industry: "半导体设备行业景气度持续上行，AI 算力需求带动订单增长，政策支持力度加大。",
    step6_fundamental: "公司 2026Q1 营收同比增长 35%，净利润增长 45%，ROE 18%，毛利率 42%，财务健康。",
    step7_valuation: "当前 PE 65 倍，处于近 5 年 90% 分位，估值偏高但反映成长预期。",
    step8_technical: "股价站上 MA20 和 MA60，均线多头排列，近 5 日资金净流入 8.5 亿元。",
    step9_sentiment: "近期公告利好（业绩预增），机构调研频次增加，市场情绪偏多。",
    step10_scoring: "多因子评分完成，综合得分 78 分（满分 100）。",
    step11_bull: "看多观点：行业景气度上行 + 国产替代加速 + 技术突破，看多逻辑清晰。",
    step12_bear: "看空观点：估值高位 + 竞争加剧 + 地缘风险，需警惕回调风险。",
    step13_risk: "风险检查完成：估值风险（高）、流动性风险（中）、财务风险（中），整体可控。",
    step14_scenario: "三情景预测：乐观 +25%，中性 -2%，悲观 -15%。",
    step15_conclusion: "研究结论生成完成，请查看完整研究报告。",
    step16_review: "复盘任务已创建，将在指定日期提醒您复盘。",
  };

  const dataMap: Record<string, Record<string, unknown>> = {
    step10_scoring: { scores: generateFactorScores(style), totalScore: 78 },
    step11_bull: { points: generateDebatePoints().bull },
    step12_bear: { points: generateDebatePoints().bear },
    step13_risk: { risks: generateRiskChecks() },
    step14_scenario: { scenarios: generateScenarios(285.6) },
    step15_conclusion: { report: generateReport(target, style) },
    step16_review: { reviewTask: generateReviewTask(target, style) },
  };

  return {
    step,
    stepId,
    agent: agentMap[stepId] as AgentResponse["agent"],
    content: contentMap[stepId] || "分析进行中...",
    data: dataMap[stepId],
    metadata: { source: "mock", timestamp: new Date().toISOString() },
  };
}

// 模拟市场数据
export const mockMarketData = {
  summary: "今日 A 股三大指数集体上涨，上证指数涨 1.12%，深证成指涨 1.58%，创业板指涨 2.05%。北向资金净流入 85 亿元，市场赚钱效应回升。半导体、AI 算力、新能源车板块领涨。",
  indices: [
    { name: "上证指数", code: "000001.SH", price: 3356.78, change: 1.12, volume: 5280 },
    { name: "深证成指", code: "399001.SZ", price: 10582.45, change: 1.58, volume: 6820 },
    { name: "创业板指", code: "399006.SZ", price: 2185.32, change: 2.05, volume: 2850 },
    { name: "沪深 300", code: "000300.SH", price: 3928.56, change: 1.35, volume: 4120 },
  ],
  hotSectors: [
    { name: "电子", change: 3.25, inflow: 28.6,heat:95 },
    { name: "计算机", change: 2.85, inflow: 22.3, heat:88 },
    { name: "通信", change: 2.45, inflow: 18.5, heat:82 },
    { name: "汽车", change: 2.15, inflow: 15.2, heat:78 },
    { name: "机械设备", change: 1.95, inflow: 12.8, heat:75 },
  ],
  activeStocks: [
    { name: "北方华创", code: "002371.SZ", price: 285.6, change: 9.98, reason: "业绩预增" },
    { name: "中芯国际", code: "688981.SH", price: 78.35, change: 7.82, reason: "技术突破" },
    { name: "比亚迪", code: "002594.SZ", price: 285.5, change: 5.65, reason: "销量新高" },
    { name: "宁德时代", code: "300750.SZ", price: 225.8, change: 4.52, reason: "订单增长" },
    { name: "海光信息", code: "688041.SH", price: 82.5, change: 6.85, reason: "AI 芯片需求" },
  ],
  events: [
    { time: "09:30", title: "央行公开市场净投放 2000 亿元", impact: "positive" },
    { time: "10:00", title: "工信部：加快 AI 芯片国产替代", impact: "positive" },
    { time: "14:00", title: "北向资金净流入超 50 亿元", impact: "positive" },
    { time: "15:00", title: "国际油价突破 85 美元", impact: "negative" },
  ],
};

// 模拟复盘数据
export const mockReviewData = {
  history: [
    {
      id: "r1",
      target: "北方华创",
      style: "short" as InvestmentStyle,
      createdAt: "2026-07-15",
      reviewDate: "2026-07-22",
      status: "completed" as const,
      actualResult: { priceChange: 12.5, directionCorrect: true, rangeHit: true },
    },
    {
      id: "r2",
      target: "电子板块",
      style: "swing" as InvestmentStyle,
      createdAt: "2026-06-20",
      reviewDate: "2026-07-20",
      status: "completed" as const,
      actualResult: { priceChange: 8.2, directionCorrect: true, rangeHit: false },
    },
    {
      id: "r3",
      target: "贵州茅台",
      style: "long" as InvestmentStyle,
      createdAt: "2026-03-01",
      reviewDate: "2026-06-01",
      status: "completed" as const,
      actualResult: { priceChange: -5.3, directionCorrect: false, rangeHit: false },
    },
  ],
  stats: {
    totalStudies: 28,
    directionAccuracy: 68,
    rangeHitRate: 52,
    mae: 8.5,
    rmse: 12.3,
    maxDrawdown: -15.2,
    vsHS300: 5.8,
  },
  stylePerformance: [
    { style: "短线", studies: 12, accuracy: 72, avgReturn: 3.5 },
    { style: "波段", studies: 10, accuracy: 65, avgReturn: 5.2 },
    { style: "长期", studies: 6, accuracy: 60, avgReturn: 8.5 },
  ],
};

// ===== 新增：今日AI推荐研究标的 =====
export const mockRecommendedTargets: RecommendedTarget[] = [
  {
    name: "北方华创",
    code: "002371",
    industry: "半导体",
    recommended_style: "swing",
    default_horizon: "20日",
    opportunity_score: 82,
    risk_level: "中",
    reason: "半导体板块热度提升，资金流入增强，技术趋势保持强势。",
    main_risk: "估值偏高，板块短期拥挤度上升。",
    trigger_source: ["板块热度", "资金流", "技术趋势"],
    is_demo_data: true,
  },
  {
    name: "中芯国际",
    code: "688981",
    industry: "半导体制造",
    recommended_style: "long",
    default_horizon: "12个月",
    opportunity_score: 78,
    risk_level: "中",
    reason: "国产替代逻辑长期成立，14nm技术突破打开成长空间。",
    main_risk: "地缘政治风险，行业竞争加剧。",
    trigger_source: ["政策催化", "技术突破", "基本面改善"],
    is_demo_data: true,
  },
  {
    name: "比亚迪",
    code: "002594",
    industry: "新能源汽车",
    recommended_style: "swing",
    default_horizon: "20日",
    opportunity_score: 75,
    risk_level: "低",
    reason: "销量持续创新高，海外扩张加速，行业景气度上行。",
    main_risk: "行业竞争加剧，原材料价格波动。",
    trigger_source: ["基本面改善", "板块热度", "资金流"],
    is_demo_data: true,
  },
  {
    name: "海光信息",
    code: "688041",
    industry: "AI芯片",
    recommended_style: "short",
    default_horizon: "5日",
    opportunity_score: 85,
    risk_level: "高",
    reason: "AI算力需求爆发，短期资金大幅流入，技术面突破关键阻力位。",
    main_risk: "估值处于历史高位，短期涨幅较大存在回调风险。",
    trigger_source: ["板块热度", "资金流", "事件催化"],
    is_demo_data: true,
  },
];

// ===== 新增：复盘曲线拟合数据 =====
export const mockReplayCurveFit: ReplayCurveFit = {
  model_name: "多因子回归拟合模型（演示版）",
  features: ["历史收益率", "历史波动率", "市场指数收益", "行业指数收益", "因子评分", "新闻情绪"],
  dates: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13", "D14", "D15", "D16", "D17", "D18", "D19", "D20"],
  actual_price: [285.6, 288.2, 291.5, 289.8, 293.2, 296.5, 298.1, 302.5, 305.8, 308.2, 312.5, 315.8, 318.2, 320.5, 322.8, 325.2, 328.5, 330.2, 332.8, 335.5],
  agent_forecast_mid: [285.6, 287.5, 289.8, 292.0, 294.2, 296.5, 298.8, 301.0, 303.2, 305.5, 307.8, 310.0, 312.2, 314.5, 316.8, 319.0, 321.2, 323.5, 325.8, 328.0],
  agent_forecast_upper: [285.6, 291.0, 295.5, 299.8, 304.2, 308.5, 312.8, 317.2, 321.5, 325.8, 330.2, 334.5, 338.8, 343.2, 347.5, 351.8, 356.2, 360.5, 364.8, 369.2],
  agent_forecast_lower: [285.6, 284.0, 282.5, 281.0, 279.5, 278.0, 276.5, 275.0, 273.5, 272.0, 270.5, 269.0, 267.5, 266.0, 264.5, 263.0, 261.5, 260.0, 258.5, 257.0],
  ml_fitted_price: [285.6, 287.8, 290.2, 289.5, 292.8, 295.8, 297.5, 301.8, 304.5, 307.2, 311.8, 314.5, 317.5, 319.8, 322.2, 324.5, 327.8, 329.5, 332.2, 334.8],
  prediction_error: [0, 0.4, -1.3, -0.3, 0.4, -0.7, 0.6, 0.7, 1.3, 1.0, 0.7, 1.3, 0.7, 0.7, 0.6, 0.7, 0.7, 0.7, 0.6, 0.7],
  metrics: {
    direction_accuracy: 85,
    interval_hit_rate: 72,
    mae: 2.35,
    rmse: 3.12,
    max_drawdown: -4.5,
    max_positive_deviation: 7.5,
    max_negative_deviation: -3.2,
    relative_hs300_return: 8.5,
    relative_industry_return: 3.2,
    r2: 0.94,
  },
  review_summary: "本次复盘显示，实际价格大部分时间位于预测区间内，区间命中率为72%。机器学习拟合曲线与实际走势方向基本一致，但在第8个交易日后低估了上涨斜率，说明模型对资金加速流入的反应不足。",
};

// ===== 新增：单次复盘详情 =====
export const mockReviewDetail: ReviewDetail = {
  id: "r1",
  target: "北方华创 002371",
  style: "short",
  createdAt: "2026-07-15",
  reviewDate: "2026-07-22",
  conclusion: "短期偏多，建议关注回调买入机会",
  predicted_range: { upper: 320.5, lower: 265.0 },
  curve_fit: mockReplayCurveFit,
  what_went_right: [
    "准确判断行业景气度上行趋势",
    "国产替代逻辑持续验证",
    "资金流入方向判断正确",
  ],
  what_went_wrong: [
    "低估了短期上涨斜率",
    "对估值风险的权重设置偏低",
    "未充分考虑到中期业绩预增的催化作用",
  ],
  model_adjustment: "后续将提高资金流因子的权重，并增加业绩催化事件的实时响应机制。",
};

// ===== 通用股票预测模型 Mock 数据 =====
import type {
  FactorGroup,
  GeneralPredictionModel,
  SampleStockResult,
} from "./mini-types";

// 因子库
export const FACTOR_LIBRARY: FactorGroup[] = [
  {
    group: "动量因子",
    description: "股票过去一段时间的涨跌趋势",
    metrics: ["5日收益率", "20日收益率", "60日收益率", "120日收益率", "价格相对20日均线偏离率", "价格相对60日均线偏离率"],
  },
  {
    group: "反转因子",
    description: "短期涨太多或跌太多后，可能出现均值回归",
    metrics: ["5日涨跌幅极值", "RSI", "KDJ超买超卖", "价格偏离布林带上轨/下轨"],
  },
  {
    group: "价值因子",
    description: "衡量股票估值是否便宜或偏贵",
    metrics: ["PE", "PB", "PS", "PEG", "股息率", "PE历史分位", "PB历史分位"],
  },
  {
    group: "质量因子",
    description: "衡量公司盈利质量和财务稳健性",
    metrics: ["ROE", "ROA", "毛利率", "净利率", "经营现金流/净利润", "资产负债率", "应收账款周转率"],
  },
  {
    group: "成长因子",
    description: "衡量公司收入和利润增长",
    metrics: ["营收同比增速", "净利润同比增速", "扣非净利润增速", "未来一致预期净利润增速", "EPS增速"],
  },
  {
    group: "规模因子",
    description: "衡量公司市值大小和风格暴露",
    metrics: ["总市值", "流通市值", "自由流通市值", "市值分位数"],
  },
  {
    group: "波动率因子",
    description: "衡量股票价格波动和风险",
    metrics: ["20日年化波动率", "60日年化波动率", "最大回撤", "Beta", "下行波动率"],
  },
  {
    group: "流动性因子",
    description: "衡量交易是否活跃，是否容易出现冲击成本",
    metrics: ["日均成交额", "日均换手率", "量比", "买卖价差", "Amihud非流动性指标"],
  },
  {
    group: "资金流因子",
    description: "衡量主力资金、北向资金或大单资金方向",
    metrics: ["主力净流入", "北向资金净流入", "大单净流入", "资金流连续性", "龙虎榜机构净买入"],
  },
  {
    group: "情绪/事件因子",
    description: "衡量新闻、公告、研报和市场舆情影响",
    metrics: ["新闻情绪分数", "公告情绪分数", "研报评级变化", "研报目标价变化", "热搜/舆情热度", "事件催化强度"],
  },
  {
    group: "行业/市场因子",
    description: "衡量个股所在行业和大盘环境",
    metrics: ["行业指数20日收益率", "行业资金流", "行业估值分位", "沪深300收益率", "市场成交额变化", "上涨家数占比"],
  },
  {
    group: "拥挤度因子",
    description: "衡量交易是否过热，是否存在短期拥挤风险",
    metrics: ["成交额历史分位", "换手率历史分位", "融资余额变化", "机构持仓集中度", "涨停/连板热度"],
  },
];

// 默认推荐因子
export const DEFAULT_SELECTED_FACTORS = [
  "20日收益率",
  "60日收益率",
  "PE历史分位",
  "ROE",
  "净利润同比增速",
  "20日波动率",
  "主力资金净流入",
  "新闻情绪分数",
  "行业指数20日收益率",
  "沪深300收益率",
];

// 样本股票池
const SAMPLE_STOCK_POOL = [
  { name: "北方华创", code: "002371", industry: "半导体" },
  { name: "宁德时代", code: "300750", industry: "新能源" },
  { name: "贵州茅台", code: "600519", industry: "白酒" },
  { name: "比亚迪", code: "002594", industry: "汽车" },
  { name: "药明康德", code: "603259", industry: "医药" },
  { name: "招商银行", code: "600036", industry: "银行" },
  { name: "中国平安", code: "601318", industry: "保险" },
  { name: "隆基绿能", code: "601012", industry: "光伏" },
  { name: "中芯国际", code: "688981", industry: "半导体" },
  { name: "海康威视", code: "002415", industry: "安防" },
  { name: "万科A", code: "000002", industry: "房地产" },
  { name: "美的集团", code: "000333", industry: "家电" },
  { name: "格力电器", code: "000651", industry: "家电" },
  { name: "腾讯控股", code: "00700", industry: "互联网" },
  { name: "阿里巴巴", code: "09988", industry: "互联网" },
];

// 生成随机曲线数据
function generateCurveData(basePrice: number, days: number): {
  dates: string[];
  actual_price: number[];
  forecast_mid: number[];
  ml_fitted_price: number[];
  monte_carlo_p10: number[];
  monte_carlo_p50: number[];
  monte_carlo_p90: number[];
  prediction_error: number[];
} {
  const dates: string[] = [];
  const actual_price: number[] = [];
  const forecast_mid: number[] = [];
  const ml_fitted_price: number[] = [];
  const monte_carlo_p10: number[] = [];
  const monte_carlo_p50: number[] = [];
  const monte_carlo_p90: number[] = [];
  const prediction_error: number[] = [];

  const startDate = new Date("2026-07-01");
  let currentPrice = basePrice;
  const trend = (Math.random() - 0.5) * 0.02;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);

    // 实际价格：带随机波动
    const noise = (Math.random() - 0.5) * basePrice * 0.03;
    currentPrice = currentPrice * (1 + trend) + noise;
    actual_price.push(Math.round(currentPrice * 100) / 100);

    // 预测中位线：略滞后于实际
    const forecastLag = currentPrice * (1 + (Math.random() - 0.5) * 0.02);
    forecast_mid.push(Math.round(forecastLag * 100) / 100);

    // ML拟合线：更平滑
    const mlSmooth = basePrice + (currentPrice - basePrice) * 0.85 + (Math.random() - 0.5) * basePrice * 0.01;
    ml_fitted_price.push(Math.round(mlSmooth * 100) / 100);

    // 蒙特卡洛区间
    const volatility = basePrice * 0.05;
    monte_carlo_p10.push(Math.round((currentPrice - volatility * 1.5) * 100) / 100);
    monte_carlo_p50.push(Math.round(currentPrice * 100) / 100);
    monte_carlo_p90.push(Math.round((currentPrice + volatility * 1.5) * 100) / 100);

    // 预测误差
    prediction_error.push(Math.round((currentPrice - forecastLag) * 100) / 100);
  }

  return { dates, actual_price, forecast_mid, ml_fitted_price, monte_carlo_p10, monte_carlo_p50, monte_carlo_p90, prediction_error };
}

// 生成单只股票的拟合结果
function generateSampleStockResult(
  stock: { name: string; code: string; industry: string },
  factors: string[],
  days: number = 20
): SampleStockResult {
  const basePrice = 50 + Math.random() * 200;
  const curveData = generateCurveData(basePrice, days);

  // 生成不太完美的指标
  const r2 = 0.45 + Math.random() * 0.45; // 0.45 - 0.90
  const mae = 1.5 + Math.random() * 4;
  const rmse = 2 + Math.random() * 5;
  const directionCorrect = Math.random() > 0.3; // 70% 正确
  const intervalHit = Math.random() > 0.35; // 65% 命中

  // 模型评分
  const modelScore = Math.round(
    (directionCorrect ? 0.7 : 0.3) * 30 +
    (intervalHit ? 0.65 : 0.35) * 25 +
    r2 * 25 -
    (rmse / 10) * 20
  );

  // 因子贡献
  const factorContributions = factors.slice(0, 3 + Math.floor(Math.random() * 3)).map((factor) => ({
    factor,
    contribution: Math.round((0.1 + Math.random() * 0.25) * 100) / 100,
  }));

  // 归一化因子贡献
  const totalContribution = factorContributions.reduce((sum, f) => sum + f.contribution, 0);
  factorContributions.forEach((f) => {
    f.contribution = Math.round((f.contribution / totalContribution) * 100) / 100;
  });

  // 误差原因
  const errorReasons = [
    "资金流加速，模型低估上涨斜率",
    "突发政策消息导致价格偏离",
    "行业轮动速度快于预期",
    "估值修复速度超预期",
    "市场情绪波动导致短期偏离",
    "北向资金流向与预期相反",
    "业绩预增/预减公告影响",
    "技术面突破关键位后加速",
  ];

  // 蒙特卡洛结果
  const upProbability = 0.4 + Math.random() * 0.3;
  const monteCarloResult = {
    up_probability: Math.round(upProbability * 100) / 100,
    down_probability: Math.round((1 - upProbability) * 100) / 100,
    risk_line_break_probability: Math.round((0.1 + Math.random() * 0.25) * 100) / 100,
    final_return_distribution: Array.from({ length: 20 }, () => Math.round((Math.random() - 0.5) * 20 * 100) / 100),
  };

  return {
    name: stock.name,
    code: stock.code,
    industry: stock.industry,
    model_score: Math.max(55, Math.min(90, modelScore)),
    direction_correct: directionCorrect,
    interval_hit: intervalHit,
    mae: Math.round(mae * 100) / 100,
    rmse: Math.round(rmse * 100) / 100,
    r2: Math.round(r2 * 100) / 100,
    error_reason: errorReasons[Math.floor(Math.random() * errorReasons.length)],
    factor_contributions: factorContributions,
    curve_data: curveData,
    monte_carlo_result: monteCarloResult,
  };
}

// 生成通用预测模型数据
export function generateGeneralPredictionModel(
  selectedFactors: string[] = DEFAULT_SELECTED_FACTORS,
  customStockNames?: string[]
): GeneralPredictionModel {
  let sampleStocks: { name: string; code: string; industry: string }[];

  if (customStockNames && customStockNames.length > 0) {
    // 使用自定义股票
    sampleStocks = customStockNames.map((name, index) => ({
      name,
      code: `${600000 + index}`,
      industry: "未知",
    }));
  } else {
    // 随机抽取10只股票
    const shuffled = [...SAMPLE_STOCK_POOL].sort(() => Math.random() - 0.5);
    sampleStocks = shuffled.slice(0, 10);
  }

  // 生成每只股票的结果
  const sampleResults = sampleStocks.map((stock) => generateSampleStockResult(stock, selectedFactors));

  // 计算汇总指标
  const avgScore = Math.round(sampleResults.reduce((sum, r) => sum + r.model_score, 0) / sampleResults.length);
  const avgDirectionAccuracy = Math.round((sampleResults.filter((r) => r.direction_correct).length / sampleResults.length) * 100) / 100;
  const avgIntervalHitRate = Math.round((sampleResults.filter((r) => r.interval_hit).length / sampleResults.length) * 100) / 100;
  const avgMae = Math.round((sampleResults.reduce((sum, r) => sum + r.mae, 0) / sampleResults.length) * 100) / 100;
  const avgRmse = Math.round((sampleResults.reduce((sum, r) => sum + r.rmse, 0) / sampleResults.length) * 100) / 100;
  const avgR2 = Math.round((sampleResults.reduce((sum, r) => sum + r.r2, 0) / sampleResults.length) * 100) / 100;

  const bestStock = sampleResults.reduce((best, r) => (r.model_score > best.model_score ? r : best), sampleResults[0]);
  const worstStock = sampleResults.reduce((worst, r) => (r.model_score < worst.model_score ? r : worst), sampleResults[0]);

  return {
    model_name: "通用股票预测模型",
    model_type: "多因子回归 + 机器学习拟合 + 蒙特卡洛模拟",
    is_demo_data: true,
    factor_library: FACTOR_LIBRARY,
    selected_factors: selectedFactors,
    sample_size: 10,
    model_summary: {
      average_score: avgScore,
      average_direction_accuracy: avgDirectionAccuracy,
      average_interval_hit_rate: avgIntervalHitRate,
      average_mae: avgMae,
      average_rmse: avgRmse,
      average_r2: avgR2,
      best_stock: `${bestStock.name} ${bestStock.code}`,
      worst_stock: `${worstStock.name} ${worstStock.code}`,
      top_contributing_factors: selectedFactors.slice(0, 3),
      noisy_factors: selectedFactors.slice(3, 5),
      overfitting_risk: selectedFactors.length > 12 ? "高" : selectedFactors.length > 8 ? "中" : "低",
    },
    monte_carlo_settings: {
      simulation_paths: 100,
      horizon_days: 20,
      percentiles: ["P10", "P50", "P90"],
    },
    sample_results: sampleResults,
  };
}

// 全球新闻雷达 Demo 数据
export const MOCK_GLOBAL_NEWS: GlobalNewsEvent[] = [
  {
    country: "美国",
    country_code: "US",
    lat: 37.0902,
    lng: -95.7129,
    title: "AI芯片出口管制新规引发市场关注",
    category: "AI科技",
    importance: "高",
    sentiment: "mixed",
    time: "2026-08-03 09:30",
    summary: "美国拟进一步收紧部分AI芯片出口规则，市场关注国产替代和算力供应链变化。",
    related_a_share_sectors: ["半导体设备", "AI算力", "先进封装", "国产软件"],
    impact_logic: "限制政策可能提升国产替代预期，但也可能扰动高端算力供应。",
    risk_note: "政策细节和执行力度仍存在不确定性。",
    pulse_color: "blue",
    importance_score: 92,
  },
  {
    country: "日本",
    country_code: "JP",
    lat: 36.2048,
    lng: 138.2529,
    title: "日本央行释放政策调整信号",
    category: "央行利率",
    importance: "中",
    sentiment: "neutral",
    time: "2026-08-03 10:10",
    summary: "日本央行官员表示将继续关注通胀和汇率变化，市场对日元波动保持敏感。",
    related_a_share_sectors: ["出口链", "汽车零部件", "消费电子", "汇率敏感资产"],
    impact_logic: "日元波动可能影响亚太资金流和出口竞争格局。",
    risk_note: "央行表态不等同于立即调整政策。",
    pulse_color: "purple",
    importance_score: 65,
  },
  {
    country: "沙特阿拉伯",
    country_code: "SA",
    lat: 23.8859,
    lng: 45.0792,
    title: "中东原油供应扰动推升油价",
    category: "能源商品",
    importance: "高",
    sentiment: "mixed",
    time: "2026-08-03 11:00",
    summary: "市场担忧原油供应阶段性收紧，国际油价短线走强。",
    related_a_share_sectors: ["石油石化", "煤化工", "航运", "航空", "化工"],
    impact_logic: "油价上涨利好上游能源，但可能抬升中下游成本。",
    risk_note: "油价波动对不同行业影响方向不同，需要分行业判断。",
    pulse_color: "orange",
    importance_score: 88,
  },
  {
    country: "德国",
    country_code: "DE",
    lat: 51.1657,
    lng: 10.4515,
    title: "欧洲新能源补贴政策讨论升温",
    category: "新能源",
    importance: "中",
    sentiment: "positive",
    time: "2026-08-03 13:30",
    summary: "欧洲多国讨论延续新能源补贴政策，市场关注光伏、储能和电池出口链。",
    related_a_share_sectors: ["光伏", "储能", "锂电池", "逆变器"],
    impact_logic: "若补贴延续，可能改善海外新能源需求预期。",
    risk_note: "政策落地节奏和贸易壁垒仍需跟踪。",
    pulse_color: "green",
    importance_score: 72,
  },
  {
    country: "印度",
    country_code: "IN",
    lat: 20.5937,
    lng: 78.9629,
    title: "印度电子制造投资计划扩大",
    category: "供应链",
    importance: "中",
    sentiment: "mixed",
    time: "2026-08-03 14:20",
    summary: "印度宣布扩大电子制造投资激励，全球消费电子供应链格局受到关注。",
    related_a_share_sectors: ["消费电子", "电子制造", "PCB", "半导体封测"],
    impact_logic: "供应链转移可能带来竞争压力，也可能带动中国零部件企业出海机会。",
    risk_note: "需要区分整机组装和上游零部件受益方向。",
    pulse_color: "red",
    importance_score: 68,
  },
];

// ================= tradeTI 交易抽象人格测试 - 12道题 =================

export const TRADETI_QUESTIONS: TradeTIQuestion[] = [
  {
    id: 1,
    question_text: "你看到一只股票今天涨停，第一反应是？",
    options: [
      { text: "A. 查涨停原因、板块联动、成交量和风险", type: "pass" },
      { text: "B. 已经涨停了，说明强，明天还能冲", type: "fomo_chaser" },
      { text: "C. 涨停？这是不是天选之股", type: "kline_shaman" },
      { text: "D. 我问问群里大佬能不能买", type: "qin_shihuang" },
    ],
  },
  {
    id: 2,
    question_text: "你买股票前最想知道什么？",
    options: [
      { text: "A. 有没有人说它能翻倍", type: "qin_shihuang" },
      { text: "B. 买入逻辑、风险条件、仓位和复盘标准", type: "pass" },
      { text: "C. K线像不像要起飞", type: "kline_shaman" },
      { text: "D. 它是不是足够安全，最好十年不跌", type: "old_money" },
    ],
  },
  {
    id: 3,
    question_text: "股票亏了10%，你会怎么做？",
    options: [
      { text: "A. 不卖就不亏，回本再说", type: "breakeven_master" },
      { text: "B. 再补一点，摊薄成本，命运会眷顾我", type: "all_in_warrior" },
      { text: "C. 看是否触发原定止损或逻辑失效", type: "pass" },
      { text: "D. 赶紧求一个大神告诉我怎么办", type: "monte_carlo_poet" },
    ],
  },
  {
    id: 4,
    question_text: "如果一只股票涨了8%，你会？",
    options: [
      { text: "A. 立刻卖，落袋为安，赚了就是胜利", type: "breakeven_master" },
      { text: "B. 加仓，强者恒强，今天我是市场之子", type: "all_in_warrior" },
      { text: "C. 不动，我准备拿到退休", type: "old_money" },
      { text: "D. 检查是否达到目标区间，决定减仓、持有或复盘", type: "pass" },
    ],
  },
  {
    id: 5,
    question_text: "你更相信哪种分析？",
    options: [
      { text: "A. 基本面、技术面、资金面、情绪面一起看", type: "pass" },
      { text: "B. 只看K线，价格包含一切，甚至包含我的命", type: "kline_shaman" },
      { text: "C. 只看财报，短期涨跌都是噪音", type: "report_archaeologist" },
      { text: "D. 只看别人总结，节省脑细胞", type: "qin_shihuang" },
    ],
  },
  {
    id: 6,
    question_text: "你如何看待仓位管理？",
    options: [
      { text: "A. 看好就满仓，不看好就空仓", type: "all_in_warrior" },
      { text: "B. 仓位是交易系统的一部分", type: "pass" },
      { text: "C. 仓位是什么？我只知道买入按钮", type: "breakeven_master" },
      { text: "D. 越跌越买，直到我和股票融为一体", type: "report_archaeologist" },
    ],
  },
  {
    id: 7,
    question_text: "你看到某只股票上热搜，会？",
    options: [
      { text: "A. 热搜都上了，不买感觉错过一个时代", type: "fomo_chaser" },
      { text: "B. 看评论区有没有人喊目标价", type: "qin_shihuang" },
      { text: "C. 判断消息是否已被价格反映", type: "pass" },
      { text: "D. 等热度过去半年再研究", type: "old_money" },
    ],
  },
  {
    id: 8,
    question_text: "你做完一次交易后会复盘吗？",
    options: [
      { text: "A. 赢了就是我牛，亏了就是主力坏", type: "all_in_warrior" },
      { text: "B. 不复盘，人生要向前看", type: "fomo_chaser" },
      { text: "C. 会做一个巨复杂模型，但下次不一定用", type: "monte_carlo_poet" },
      { text: "D. 会记录买入理由、结果、错误和下次规则", type: "pass" },
    ],
  },
  {
    id: 9,
    question_text: "你看到模型预测R²很高，会？",
    options: [
      { text: "A. 看样本、过拟合、误差分布和稳定性", type: "pass" },
      { text: "B. R²高就是准，立刻相信", type: "monte_carlo_poet" },
      { text: "C. 先截图发朋友圈", type: "report_archaeologist" },
      { text: "D. 我觉得模型不如一根均线", type: "kline_shaman" },
    ],
  },
  {
    id: 10,
    question_text: "你最喜欢Agent给你什么？",
    options: [
      { text: "A. 直接告诉我代码，别废话", type: "qin_shihuang" },
      { text: "B. 结论、证据、风险、情景和复盘计划", type: "pass" },
      { text: "C. 告诉我什么时候发财", type: "all_in_warrior" },
      { text: "D. 给我一份80页研报，我先收藏", type: "report_archaeologist" },
    ],
  },
  {
    id: 11,
    question_text: "面对市场大跌，你会？",
    options: [
      { text: "A. 闭眼，假装今天不开盘", type: "breakeven_master" },
      { text: "B. 冲进去抄底，富贵险中求", type: "all_in_warrior" },
      { text: "C. 看风险暴露、仓位、是否触发风控", type: "pass" },
      { text: "D. 等市场完全安全了再说", type: "old_money" },
    ],
  },
  {
    id: 12,
    question_text: "你觉得交易最重要的是？",
    options: [
      { text: "A. 胆子大", type: "kline_shaman" },
      { text: "B. 消息快", type: "fomo_chaser" },
      { text: "C. 有人带", type: "monte_carlo_poet" },
      { text: "D. 逻辑、概率、纪律、复盘", type: "pass" },
    ],
  },
];

/** tradeTI 两层计分引擎：通关分 + 非通关人格分 */
export function calculateTradeTIResult(
  answers: { question_id: number; type: "pass" | TradeTIPersonalityId }[]
): { personality_id: TradeTIPersonalityId; pass_score: number; scores: TradeTIScores; is_unlocked: boolean } {
  // 初始化非通关人格分
  const scores: TradeTIScores = {
    old_money: 0,
    qin_shihuang: 0,
    kline_shaman: 0,
    all_in_warrior: 0,
    breakeven_master: 0,
    fomo_chaser: 0,
    report_archaeologist: 0,
    monte_carlo_poet: 0,
  };
  let passScore = 0;

  // 遍历答案：通关分 vs 人格分
  for (const answer of answers) {
    if (answer.type === "pass") {
      passScore += 1;
    } else {
      const t = answer.type as Exclude<TradeTIPersonalityId, "wall_street">;
      scores[t] += 1;
    }
  }

  // 通关分 >= 8 → 华尔街在逃交易员，解锁
  if (passScore >= 8) {
    return {
      personality_id: "wall_street",
      pass_score: passScore,
      scores,
      is_unlocked: true,
    };
  }

  // 未通关：找非通关人格最高分，并列按优先级
  let bestScore = -1;
  let resultType: TradeTIPersonalityId = "old_money";
  const priorityList = TRADETI_PRIORITY as Exclude<TradeTIPersonalityId, "wall_street">[];
  for (const type of priorityList) {
    if (scores[type] > bestScore) {
      bestScore = scores[type];
      resultType = type;
    }
  }

  return {
    personality_id: resultType,
    pass_score: passScore,
    scores,
    is_unlocked: false,
  };
}

// ===== 基于真实 StockResearchContext 生成 Agent 响应 =====

function fmtNum(n: number | undefined, decimals = 2): string {
  if (n === undefined || n === null) return "N/A";
  return n.toFixed(decimals);
}

function fmtPct(n: number | undefined): string {
  if (n === undefined || n === null) return "N/A";
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtMv(n: number | undefined): string {
  if (n === undefined || n === null) return "N/A";
  if (n >= 10000) return `${(n / 10000).toFixed(2)}万亿`;
  return `${n.toFixed(2)}亿`;
}

export function generateAgentResponseFromContext(
  step: number,
  stepId: WorkflowStep,
  target: string,
  style: InvestmentStyle,
  ctx: StockResearchContext,
): AgentResponse {
  const agentMap: Record<string, string> = {
    step1_question: "lead",
    step2_style: "lead",
    step3_data: "data",
    step4_market: "market",
    step5_industry: "industry",
    step6_fundamental: "fundamental",
    step7_valuation: "valuation",
    step8_technical: "technical",
    step9_sentiment: "sentiment",
    step10_scoring: "lead",
    step11_bull: "bull",
    step12_bear: "bear",
    step13_risk: "risk",
    step14_scenario: "lead",
    step15_conclusion: "manager",
    step16_review: "manager",
  };

  const stockName = ctx.stock.name || target;
  const stockCode = ctx.stock.tsCode || "";
  const industry = ctx.stock.industry || "未知";
  const close = ctx.quote?.close;
  const pctChg = ctx.quote?.pctChg;
  const tradeDate = ctx.quote?.tradeDate;
  const missing = ctx.dataQuality.missing;

  const contentMap: Record<string, string> = {
    step1_question: `已确认研究对象：${stockName}（${stockCode}），所属行业：${industry}。我将引导您完成一次完整的基本面分析流程。`,

    step2_style: `投资风格：${style === "short" ? "短线" : style === "swing" ? "波段" : "长期"}。研究周期已设定。数据来源：${ctx.dataQuality.source === "tushare" ? "Tushare 实时" : ctx.dataQuality.source === "cache" ? "缓存" : "演示"}。`,

    step3_data: (() => {
      const parts: string[] = [];
      if (ctx.quote) parts.push(`行情数据（${tradeDate}）`);
      if (ctx.valuation) parts.push("估值数据");
      if (ctx.technical) parts.push("技术指标");
      if (ctx.market) parts.push("市场概览");
      const available = parts.length > 0 ? parts.join("、") + "已就绪" : "无可用数据";
      const missingStr = missing.length > 0 ? `缺失项：${missing.join("、")}` : "无重大缺失";
      return `数据收集完成。${available}。${missingStr}。`;
    })(),

    step4_market: (() => {
      if (ctx.market?.marketSummary) {
        return ctx.market.marketSummary;
      }
      return "当前未获取到市场概览数据，使用默认判断：大盘处于震荡格局，风险偏好中性。";
    })(),

    step5_industry: (() => {
      const ih = ctx.market?.industryHeat;
      if (ih) {
        return `${stockName}所属${industry}行业，行业平均涨跌幅${fmtPct(ih.avgChange)}，热度排名${ih.rank || "N/A"}，热度评分${fmtNum(ih.heat, 0)}。${ih.avgChange && ih.avgChange > 0 ? "行业景气度上行，板块表现强势。" : ih.avgChange && ih.avgChange < 0 ? "行业短期承压，需关注基本面变化。" : "行业表现中性。"}`;
      }
      return `${stockName}所属${industry}行业。当前未获取到行业热度数据，建议结合行业研报进一步分析。`;
    })(),

    step6_fundamental: (() => {
      if (missing.includes("valuation") && !ctx.valuation) {
        return "当前未接入高频财务数据，使用估值与交易数据辅助判断。建议参考公司最新财报获取完整基本面信息。";
      }
      const v = ctx.valuation;
      const parts: string[] = [`${stockName}（${stockCode}）基本面概况：`];
      if (v?.peTtm) parts.push(`PE(TTM) ${fmtNum(v.peTtm, 1)}倍`);
      if (v?.pb) parts.push(`PB ${fmtNum(v.pb, 2)}倍`);
      if (v?.turnoverRate) parts.push(`换手率 ${fmtNum(v.turnoverRate, 2)}%`);
      parts.push("当前未接入高频财务数据（营收/净利润），使用估值与交易数据辅助判断。");
      return parts.join("，");
    })(),

    step7_valuation: (() => {
      const v = ctx.valuation;
      if (!v) return "当前未获取到估值数据，无法进行估值分析。";
      const parts: string[] = [];
      if (v.peTtm) parts.push(`PE(TTM) ${fmtNum(v.peTtm, 1)}倍`);
      if (v.pe) parts.push(`PE ${fmtNum(v.pe, 1)}倍`);
      if (v.pb) parts.push(`PB ${fmtNum(v.pb, 2)}倍`);
      if (v.totalMv) parts.push(`总市值 ${fmtMv(v.totalMv)}`);
      if (v.circMv) parts.push(`流通市值 ${fmtMv(v.circMv)}`);
      if (v.turnoverRate) parts.push(`换手率 ${fmtNum(v.turnoverRate, 2)}%`);
      if (v.volumeRatio) parts.push(`量比 ${fmtNum(v.volumeRatio, 2)}`);
      return `估值数据：${parts.join("，")}。`;
    })(),

    step8_technical: (() => {
      const t = ctx.technical;
      if (!t) return "当前未获取到足够日线数据，无法计算技术指标。";
      const parts: string[] = [];
      if (t.ma5) parts.push(`MA5 ${fmtNum(t.ma5)}`);
      if (t.ma20) parts.push(`MA20 ${fmtNum(t.ma20)}`);
      if (t.ma60) parts.push(`MA60 ${fmtNum(t.ma60)}`);
      if (t.change5d !== undefined) parts.push(`5日涨跌 ${fmtPct(t.change5d)}`);
      if (t.change20d !== undefined) parts.push(`20日涨跌 ${fmtPct(t.change20d)}`);
      if (t.volatility20d !== undefined) parts.push(`20日波动率 ${fmtNum(t.volatility20d, 1)}%`);
      if (t.support20) parts.push(`20日支撑 ${fmtNum(t.support20)}`);
      if (t.pressure20) parts.push(`20日压力 ${fmtNum(t.pressure20)}`);
      const trendText = t.trend === "bullish" ? "均线多头排列，趋势偏多" : t.trend === "bearish" ? "均线空头排列，趋势偏空" : "均线交织，趋势中性";
      return `技术面：${parts.join("，")}。${trendText}。`;
    })(),

    step9_sentiment: (() => {
      const parts: string[] = [];
      if (ctx.quote?.pctChg !== undefined) {
        parts.push(`最新涨跌幅 ${fmtPct(ctx.quote.pctChg)}`);
      }
      if (ctx.valuation?.turnoverRate) {
        const tr = ctx.valuation.turnoverRate;
        parts.push(`换手率 ${fmtNum(tr, 2)}%${tr > 5 ? "，交投活跃" : tr < 1 ? "，交投清淡" : ""}`);
      }
      if (ctx.valuation?.volumeRatio) {
        const vr = ctx.valuation.volumeRatio;
        parts.push(`量比 ${fmtNum(vr, 2)}${vr > 1.5 ? "，放量" : vr < 0.5 ? "，缩量" : ""}`);
      }
      return parts.length > 0 ? `市场情绪参考：${parts.join("，")}。` : "当前情绪面数据有限，建议关注公司公告和行业动态。";
    })(),

    step10_scoring: (() => {
      // Generate factor scores influenced by real data
      const baseScores = generateFactorScores(style);
      // Adjust scores based on real context
      const adjusted = baseScores.map((f) => {
        let adj = 0;
        if (ctx.technical?.trend === "bullish") adj += 5;
        if (ctx.technical?.trend === "bearish") adj -= 5;
        if (ctx.market?.industryHeat && ctx.market.industryHeat.heat && ctx.market.industryHeat.heat > 80) adj += 3;
        const score = Math.max(30, Math.min(95, f.score + adj));
        return { ...f, score, contribution: Math.round((score * f.weight) / 100) };
      });
      const total = adjusted.reduce((sum, f) => sum + f.contribution, 0);
      return JSON.stringify({
        content: `多因子评分完成，综合得分 ${total} 分（满分 100）。评分基于实时行情、估值和技术指标。`,
        data: { scores: adjusted, totalScore: total },
      });
    })(),

    step11_bull: (() => {
      const points: string[] = [];
      if (ctx.technical?.trend === "bullish") points.push("均线多头排列，技术趋势向好");
      if (ctx.market?.industryHeat?.heat && ctx.market.industryHeat.heat > 70) points.push(`${industry}行业热度较高，板块景气度上行`);
      if (ctx.quote?.pctChg && ctx.quote.pctChg > 0) points.push(`最新交易日上涨 ${fmtPct(ctx.quote.pctChg)}，短期动能充足`);
      if (ctx.valuation?.peTtm && ctx.valuation.peTtm < 30) points.push(`PE(TTM) ${fmtNum(ctx.valuation.peTtm, 1)}倍，估值合理`);
      if (points.length === 0) points.push("建议结合基本面研报寻找看多逻辑");
      return JSON.stringify({
        content: `看多观点：${points.join("；")}。`,
        data: { points: points.map((p) => ({ argument: p, evidence: "数据支撑", confidence: 70 })) },
      });
    })(),

    step12_bear: (() => {
      const points: string[] = [];
      if (ctx.technical?.trend === "bearish") points.push("均线空头排列，技术趋势偏弱");
      if (ctx.valuation?.peTtm && ctx.valuation.peTtm > 60) points.push(`PE(TTM) ${fmtNum(ctx.valuation.peTtm, 1)}倍，估值偏高`);
      if (ctx.technical?.volatility20d && ctx.technical.volatility20d > 40) points.push(`20日波动率 ${fmtNum(ctx.technical.volatility20d, 1)}%，波动较大`);
      if (ctx.quote?.pctChg && ctx.quote.pctChg < -3) points.push(`最新交易日下跌 ${fmtPct(ctx.quote.pctChg)}，短期承压`);
      if (points.length === 0) points.push("当前数据未显示明显看空信号，但仍需关注市场系统性风险");
      return JSON.stringify({
        content: `看空观点：${points.join("；")}。`,
        data: { points: points.map((p) => ({ argument: p, evidence: "数据支撑", confidence: 65 })) },
      });
    })(),

    step13_risk: (() => {
      const risks: { name: string; level: string; desc: string }[] = [];
      if (ctx.valuation?.peTtm && ctx.valuation.peTtm > 50) {
        risks.push({ name: "估值风险", level: "高", desc: `PE(TTM) ${fmtNum(ctx.valuation.peTtm, 1)}倍，处于较高水平` });
      } else if (ctx.valuation?.peTtm && ctx.valuation.peTtm > 30) {
        risks.push({ name: "估值风险", level: "中", desc: `PE(TTM) ${fmtNum(ctx.valuation.peTtm, 1)}倍` });
      } else {
        risks.push({ name: "估值风险", level: "低", desc: "估值处于合理区间" });
      }
      if (ctx.technical?.volatility20d && ctx.technical.volatility20d > 40) {
        risks.push({ name: "波动风险", level: "高", desc: `20日波动率 ${fmtNum(ctx.technical.volatility20d, 1)}%` });
      } else {
        risks.push({ name: "波动风险", level: "中", desc: "波动率处于正常范围" });
      }
      if (missing.length > 2) {
        risks.push({ name: "数据缺失风险", level: "中", desc: `缺失数据项：${missing.join("、")}，可能影响分析准确性` });
      }
      return JSON.stringify({
        content: `风险检查完成：${risks.map((r) => `${r.name}（${r.level}）`).join("、")}。`,
        data: { risks },
      });
    })(),

    step14_scenario: (() => {
      const basePrice = close || 100;
      const trend = ctx.technical?.trend || "neutral";
      const vol = ctx.technical?.volatility20d || 25;

      const optRet = Math.max(5, Math.round(vol * 0.6));
      const neuRet = trend === "bullish" ? Math.round(vol * 0.1) : trend === "bearish" ? -Math.round(vol * 0.15) : 0;
      const pesRet = -Math.max(5, Math.round(vol * 0.8));

      const scenarios: ScenarioPrediction = {
        optimistic: {
          price: Math.round(basePrice * (1 + optRet / 100) * 100) / 100,
          returnPct: optRet,
          logic: `${industry}行业景气度上行，技术面趋势向好，资金流入加速。`,
        },
        neutral: {
          price: Math.round(basePrice * (1 + neuRet / 100) * 100) / 100,
          returnPct: neuRet,
          logic: "市场维持震荡格局，个股跟随行业波动。",
        },
        pessimistic: {
          price: Math.round(basePrice * (1 + pesRet / 100) * 100) / 100,
          returnPct: pesRet,
          logic: "市场系统性风险释放，行业景气度下行，估值承压。",
        },
      };
      return JSON.stringify({
        content: `三情景预测：乐观 +${optRet}%，中性 ${neuRet >= 0 ? "+" : ""}${neuRet}%，悲观 ${pesRet}%。基于当前价 ${fmtNum(basePrice)} 元和 20 日波动率 ${fmtNum(vol, 1)}%。`,
        data: { scenarios },
      });
    })(),

    step15_conclusion: (() => {
      const report = generateReport(stockName, style);
      return JSON.stringify({
        content: `研究报告生成完成。${stockName}（${stockCode}）最新价 ${fmtNum(close)}元，涨跌幅 ${fmtPct(pctChg)}。数据来源：${ctx.dataQuality.source}。`,
        data: { report },
      });
    })(),

    step16_review: (() => {
      const reviewTask = generateReviewTask(stockName, style);
      return JSON.stringify({
        content: "复盘任务已创建，将在指定日期提醒您复盘。",
        data: { reviewTask },
      });
    })(),
  };

  const raw = contentMap[stepId] || "分析进行中...";

  // Some steps return JSON with content + data
  let content = raw;
  let data: Record<string, unknown> | undefined;

  if (stepId === "step10_scoring" || stepId === "step11_bull" || stepId === "step12_bear" || stepId === "step13_risk" || stepId === "step14_scenario" || stepId === "step15_conclusion" || stepId === "step16_review") {
    try {
      const parsed = JSON.parse(raw);
      content = parsed.content;
      data = parsed.data;
    } catch {
      // use raw content
    }
  }

  return {
    step,
    stepId,
    agent: agentMap[stepId] as AgentResponse["agent"],
    content,
    data,
    metadata: {
      source: ctx.dataQuality.source,
      timestamp: ctx.dataQuality.fetchedAt,
    },
  };
}
