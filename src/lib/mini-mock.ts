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
} from "./mini-types";

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
export function generateGeneralPredictionModel(selectedFactors: string[] = DEFAULT_SELECTED_FACTORS): GeneralPredictionModel {
  // 随机抽取10只股票
  const shuffled = [...SAMPLE_STOCK_POOL].sort(() => Math.random() - 0.5);
  const sampleStocks = shuffled.slice(0, 10);

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
