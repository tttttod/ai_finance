// ===== 小程序类型定义 =====

export type InvestmentStyle = "short" | "swing" | "long";
export type HoldingPeriod = "short" | "medium" | "long";

export interface ResearchTarget {
  name: string;
  code?: string;
  type: "stock" | "sector";
}

export interface ResearchConfig {
  target: ResearchTarget;
  style: InvestmentStyle;
  period: HoldingPeriod;
  periodDays: number;
}

export type AgentRole =
  | "lead"
  | "data"
  | "market"
  | "industry"
  | "fundamental"
  | "valuation"
  | "technical"
  | "sentiment"
  | "bull"
  | "bear"
  | "risk"
  | "manager";

export interface AgentInfo {
  role: AgentRole;
  name: string;
  title: string;
  icon: string;
}

export type WorkflowStep =
  | "step1_question"
  | "step2_style"
  | "step3_data"
  | "step4_market"
  | "step5_industry"
  | "step6_fundamental"
  | "step7_valuation"
  | "step8_technical"
  | "step9_sentiment"
  | "step10_scoring"
  | "step11_bull"
  | "step12_bear"
  | "step13_risk"
  | "step14_scenario"
  | "step15_conclusion"
  | "step16_review";

export type StepStatus = "pending" | "active" | "completed";

export interface WorkflowStepInfo {
  id: WorkflowStep;
  number: number;
  title: string;
  agent: AgentRole;
  status: StepStatus;
  result?: string;
}

export interface FactorScore {
  name: string;
  score: number;
  weight: number;
  contribution: number;
}

export interface ScenarioPrediction {
  optimistic: { price: number; returnPct: number; logic: string };
  neutral: { price: number; returnPct: number; logic: string };
  pessimistic: { price: number; returnPct: number; logic: string };
}

export interface DebatePoint {
  id: string;
  title: string;
  content: string;
  evidence: string;
  confidence: number;
}

export interface RiskCheck {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  status: "pass" | "warning" | "fail";
}

export interface ResearchReport {
  target: string;
  style: InvestmentStyle;
  period: string;
  conclusion: { direction: string; confidence: number; audience: string };
  logic: string[];
  evidence: string[];
  scenarios: ScenarioPrediction;
  risks: string[];
  watchIndicators: string[];
  reviewPlan: { date: string; indicators: string[]; criteria: string };
}

export interface ReviewTask {
  id: string;
  target: string;
  style: InvestmentStyle;
  createdAt: string;
  reviewDate: string;
  indicators: string[];
  criteria: string;
  status: "pending" | "completed";
  actualResult?: {
    priceChange: number;
    directionCorrect: boolean;
    rangeHit: boolean;
  };
}

export interface AgentResponse {
  step: number;
  stepId: WorkflowStep;
  agent: AgentRole;
  content: string;
  data?: Record<string, unknown>;
  options?: { id: string; label: string; reason: string }[];
  metadata: { source: string; timestamp: string };
}

// 因子权重配置
export const FACTOR_WEIGHTS: Record<InvestmentStyle, { name: string; weight: number }[]> = {
  short: [
    { name: "资金流", weight: 25 },
    { name: "技术趋势", weight: 25 },
    { name: "板块热度", weight: 20 },
    { name: "事件催化", weight: 15 },
    { name: "市场情绪", weight: 10 },
    { name: "基本面风险", weight: 5 },
  ],
  swing: [
    { name: "行业景气度", weight: 20 },
    { name: "基本面趋势", weight: 20 },
    { name: "估值分位", weight: 20 },
    { name: "技术趋势", weight: 15 },
    { name: "资金持续性", weight: 15 },
    { name: "事件催化", weight: 10 },
  ],
  long: [
    { name: "财务质量", weight: 25 },
    { name: "商业模式与竞争格局", weight: 25 },
    { name: "成长空间", weight: 20 },
    { name: "估值合理性", weight: 15 },
    { name: "现金流质量", weight: 10 },
    { name: "短期市场因素", weight: 5 },
  ],
};

// Agent 团队信息
export const AGENT_TEAM: AgentInfo[] = [
  { role: "lead", name: "研究总控", title: "Lead Agent", icon: "🎯" },
  { role: "data", name: "数据分析师", title: "Data Agent", icon: "📊" },
  { role: "market", name: "市场环境分析师", title: "Market Agent", icon: "" },
  { role: "industry", name: "行业政策分析师", title: "Industry Agent", icon: "🏭" },
  { role: "fundamental", name: "基本面分析师", title: "Fundamental Agent", icon: "📋" },
  { role: "valuation", name: "估值建模师", title: "Valuation Agent", icon: "💰" },
  { role: "technical", name: "技术资金分析师", title: "Technical Agent", icon: "📈" },
  { role: "sentiment", name: "新闻情绪分析师", title: "Sentiment Agent", icon: "📰" },
  { role: "bull", name: "正方研究员", title: "Bull Agent", icon: "🐂" },
  { role: "bear", name: "反方研究员", title: "Bear Agent", icon: "🐻" },
  { role: "risk", name: "风险官", title: "Risk Officer", icon: "️" },
  { role: "manager", name: "研究经理", title: "Research Manager", icon: "👔" },
];

// 16 步工作流定义
export const WORKFLOW_STEPS: { id: WorkflowStep; number: number; title: string; agent: AgentRole }[] = [
  { id: "step1_question", number: 1, title: "确认研究问题", agent: "lead" },
  { id: "step2_style", number: 2, title: "确认投资风格和周期", agent: "lead" },
  { id: "step3_data", number: 3, title: "数据收集与缺失检查", agent: "data" },
  { id: "step4_market", number: 4, title: "市场环境分析", agent: "market" },
  { id: "step5_industry", number: 5, title: "行业与政策分析", agent: "industry" },
  { id: "step6_fundamental", number: 6, title: "公司基本面分析", agent: "fundamental" },
  { id: "step7_valuation", number: 7, title: "估值分析", agent: "valuation" },
  { id: "step8_technical", number: 8, title: "技术与资金分析", agent: "technical" },
  { id: "step9_sentiment", number: 9, title: "新闻公告与情绪分析", agent: "sentiment" },
  { id: "step10_scoring", number: 10, title: "多因子评分", agent: "lead" },
  { id: "step11_bull", number: 11, title: "Bull 正方观点", agent: "bull" },
  { id: "step12_bear", number: 12, title: "Bear 反方观点", agent: "bear" },
  { id: "step13_risk", number: 13, title: "风险官检查", agent: "risk" },
  { id: "step14_scenario", number: 14, title: "三情景预测", agent: "lead" },
  { id: "step15_conclusion", number: 15, title: "研究经理最终结论", agent: "manager" },
  { id: "step16_review", number: 16, title: "复盘任务生成", agent: "manager" },
];
