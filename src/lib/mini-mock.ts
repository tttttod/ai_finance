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
} from "./mini-types";

// 模拟研究目标
const MOCK_TARGETS = {
  stock: { name: "北方华创", code: "002371.SZ", type: "stock" as const },
  sector: { name: "电子", type: "sector" as const },
};

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
    step11_bull: "正方观点：行业景气度上行 + 国产替代加速 + 技术突破，看多逻辑清晰。",
    step12_bear: "反方观点：估值高位 + 竞争加剧 + 地缘风险，需警惕回调风险。",
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
    agent: agentMap[stepId] as any,
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
