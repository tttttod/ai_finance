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
  { role: "bull", name: "看多研究员", title: "Bull Analyst", icon: "🐂" },
  { role: "bear", name: "看空研究员", title: "Bear Analyst", icon: "🐻" },
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
  { id: "step11_bull", number: 11, title: "看多观点", agent: "bull" },
  { id: "step12_bear", number: 12, title: "看空观点", agent: "bear" },
  { id: "step13_risk", number: 13, title: "风险官检查", agent: "risk" },
  { id: "step14_scenario", number: 14, title: "三情景预测", agent: "lead" },
  { id: "step15_conclusion", number: 15, title: "研究经理最终结论", agent: "manager" },
  { id: "step16_review", number: 16, title: "复盘任务生成", agent: "manager" },
];

// ===== 新增类型：推荐股票 =====
export interface RecommendedTarget {
  name: string;
  code: string;
  industry: string;
  recommended_style: InvestmentStyle;
  default_horizon: string;
  opportunity_score: number;
  risk_level: "低" | "中" | "高";
  reason: string;
  main_risk: string;
  trigger_source: string[];
  is_demo_data: boolean;
}

// ===== 新增类型：用户风格问卷 =====
export interface UserProfileSurvey {
  completed: boolean;
  recommended_style: InvestmentStyle | "";
  default_horizon: string;
  risk_tolerance: string;
  holding_period: string;
  focus_preference: string;
  experience_level: string;
}

export interface SurveyQuestion {
  id: string;
  title: string;
  options: { value: string; label: string; style: InvestmentStyle }[];
}

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: "holding_period",
    title: "你通常能接受的持有周期是？",
    options: [
      { value: "1-10d", label: "1到10个交易日", style: "short" },
      { value: "2w-3m", label: "2周到3个月", style: "swing" },
      { value: "6m+", label: "6个月以上", style: "long" },
    ],
  },
  {
    id: "risk_tolerance",
    title: "如果一只股票短期下跌，你最多能接受多少回撤？",
    options: [
      { value: "5%", label: "5%以内", style: "short" },
      { value: "10%", label: "10%以内", style: "swing" },
      { value: "20%+", label: "20%以上", style: "long" },
    ],
  },
  {
    id: "focus_preference",
    title: "你更关注什么？",
    options: [
      { value: "hotspot", label: "短期热点和资金流", style: "short" },
      { value: "trend", label: "行业趋势和波段机会", style: "swing" },
      { value: "value", label: "公司长期价值和财务质量", style: "long" },
    ],
  },
  {
    id: "time_commitment",
    title: "你每天愿意花多少时间看市场？",
    options: [
      { value: "30m", label: "30分钟以内", style: "short" },
      { value: "30m-2h", label: "30分钟到2小时", style: "swing" },
      { value: "flexible", label: "不固定，更关注长期跟踪", style: "long" },
    ],
  },
  {
    id: "experience",
    title: "你的投资经验是？",
    options: [
      { value: "beginner", label: "新手", style: "long" },
      { value: "intermediate", label: "有一定经验", style: "swing" },
      { value: "experienced", label: "比较熟悉市场", style: "short" },
    ],
  },
];

// ===== 新增类型：复盘曲线拟合 =====
export interface ReplayCurveFit {
  model_name: string;
  features: string[];
  dates: string[];
  actual_price: number[];
  agent_forecast_mid: number[];
  agent_forecast_upper: number[];
  agent_forecast_lower: number[];
  ml_fitted_price: number[];
  prediction_error: number[];
  metrics: {
    direction_accuracy: number;
    interval_hit_rate: number;
    mae: number;
    rmse: number;
    max_drawdown: number;
    max_positive_deviation: number;
    max_negative_deviation: number;
    relative_hs300_return: number;
    relative_industry_return: number;
    r2: number;
  };
  review_summary: string;
}

export interface ReviewDetail {
  id: string;
  target: string;
  style: InvestmentStyle;
  createdAt: string;
  reviewDate: string;
  conclusion: string;
  predicted_range: { upper: number; lower: number };
  curve_fit: ReplayCurveFit;
  what_went_right: string[];
  what_went_wrong: string[];
  model_adjustment: string;
}

// ===== 通用股票预测模型类型 =====
export interface FactorGroup {
  group: string;
  description: string;
  metrics: string[];
}

export interface FactorContribution {
  factor: string;
  contribution: number;
}

export interface CurveData {
  dates: string[];
  actual_price: number[];
  forecast_mid: number[];
  ml_fitted_price: number[];
  monte_carlo_p10: number[];
  monte_carlo_p50: number[];
  monte_carlo_p90: number[];
  prediction_error: number[];
}

export interface MonteCarloResult {
  up_probability: number;
  down_probability: number;
  risk_line_break_probability: number;
  final_return_distribution: number[];
}

export interface SampleStockResult {
  name: string;
  code: string;
  industry: string;
  model_score: number;
  direction_correct: boolean;
  interval_hit: boolean;
  mae: number;
  rmse: number;
  r2: number;
  error_reason: string;
  factor_contributions: FactorContribution[];
  curve_data: CurveData;
  monte_carlo_result: MonteCarloResult;
}

export interface ModelSummary {
  average_score: number;
  average_direction_accuracy: number;
  average_interval_hit_rate: number;
  average_mae: number;
  average_rmse: number;
  average_r2: number;
  best_stock: string;
  worst_stock: string;
  top_contributing_factors: string[];
  noisy_factors: string[];
  overfitting_risk: string;
}

export interface GeneralPredictionModel {
  model_name: string;
  model_type: string;
  is_demo_data: boolean;
  factor_library: FactorGroup[];
  selected_factors: string[];
  sample_size: number;
  model_summary: ModelSummary;
  monte_carlo_settings: {
    simulation_paths: number;
    horizon_days: number;
    percentiles: string[];
  };
  sample_results: SampleStockResult[];
}

// 全球新闻雷达类型
export type NewsCategory =
  | '宏观经济'
  | '央行利率'
  | '汇率'
  | '地缘政治'
  | '能源商品'
  | 'AI科技'
  | '半导体'
  | '新能源'
  | '医药监管'
  | '贸易政策'
  | '供应链'
  | '消费需求';

export type NewsImportance = '高' | '中' | '低';
export type NewsSentiment = 'positive' | 'negative' | 'neutral' | 'mixed';
export type PulseColor = 'red' | 'blue' | 'orange' | 'green' | 'purple';

export interface GlobalNewsEvent {
  country: string;
  country_code: string;
  lat: number;
  lng: number;
  title: string;
  category: NewsCategory;
  importance: NewsImportance;
  sentiment: NewsSentiment;
  time: string;
  summary: string;
  related_a_share_sectors: string[];
  impact_logic: string;
  risk_note: string;
  pulse_color: PulseColor;
  importance_score?: number;
}

export interface ResearchClue {
  source: string;
  country: string;
  title: string;
  related_a_share_sectors: string[];
  created_at: string;
}

export interface GlobalNewsRadar {
  is_demo_data: boolean;
  selected_country: string | null;
  events: GlobalNewsEvent[];
  research_clues: ResearchClue[];
}

// ================= tradeTI 交易抽象人格测试 (Trade Type Indicator) =================

/** 9种 tradeTI 人格 ID */
export type TradeTIPersonalityId =
  | "wall_street"
  | "old_money"
  | "qin_shihuang"
  | "kline_shaman"
  | "all_in_warrior"
  | "breakeven_master"
  | "fomo_chaser"
  | "report_archaeologist"
  | "monte_carlo_poet";

/** tradeTI 人格配置 */
export interface TradeTIPersonality {
  id: TradeTIPersonalityId;
  name: string;           // 人格名称
  emoji: string;
  color: string;          // 主色 hex
  description: string;    // 人格说明
  typical_issues: string; // 典型问题
  is_unlock: boolean;     // 是否可通关
  block_buttons: string[]; // 拦截页按钮
  block_small_link?: string; // 拦截页小链接
  block_reason: string;   // 拦截原因
}

/** 一道 tradeTI 测试题 */
export interface TradeTIQuestion {
  id: number; // 1-12
  question_text: string;
  options: {
    text: string;
    personality: TradeTIPersonalityId;
  }[];
}

/** tradeTI 计分状态 */
export interface TradeTIScores {
  wall_street: number;
  old_money: number;
  qin_shihuang: number;
  kline_shaman: number;
  all_in_warrior: number;
  breakeven_master: number;
  fomo_chaser: number;
  report_archaeologist: number;
  monte_carlo_poet: number;
}

/** tradeTI 测试结果 */
export interface TradeTIResult {
  personality_id: TradeTIPersonalityId;
  personality_name: string;
  emoji: string;
  color: string;
  description: string;
  is_unlocked: boolean;
  scores: TradeTIScores;
  total_questions: number;
}

/** tradeTI 完整状态（持久化到 localStorage） */
export interface TradeTIState {
  completed: boolean;
  is_unlocked: boolean;
  result_type: TradeTIPersonalityId | "";
  scores: TradeTIScores;
  answers: { question_id: number; chosen: TradeTIPersonalityId }[];
  completed_at?: string;
}

/** 9种人格完整配置 */
export const TRADETI_PERSONALITIES: Record<TradeTIPersonalityId, TradeTIPersonality> = {
  wall_street: {
    id: "wall_street",
    name: "华尔街在逃交易员",
    emoji: "🏦",
    color: "#0D9488",
    description: "你不是没有情绪，而是知道情绪不能替你下单。你会看逻辑、看风险、看仓位，也会在交易结束后复盘自己哪里做对、哪里犯病。",
    typical_issues: "暂无",
    is_unlock: true,
    block_buttons: [],
    block_reason: "",
  },
  old_money: {
    id: "old_money",
    name: "老钱，老了才有钱",
    emoji: "👴",
    color: "#D97706",
    description: "你不是不想赚钱，你只是每次机会来了都想再观察三年。",
    typical_issues: "过度保守。犹豫太久。机会确认时，行情可能已经走完。",
    is_unlock: false,
    block_buttons: ["继续定投余额宝", "返回重测"],
    block_reason: "你不是不想赚钱，你只是每次机会来了都想再观察三年。",
  },
  qin_shihuang: {
    id: "qin_shihuang",
    name: "我是秦始皇，打钱！",
    emoji: "👑",
    color: "#DC2626",
    description: "你对投资最大的误解，是觉得财富路径可以通过别人直接转账完成。",
    typical_issues: "不想分析。只想别人给代码。容易被荐股、内幕、暴富故事吸引。",
    is_unlock: false,
    block_buttons: ["下载反诈APP", "返回重测"],
    block_reason: "你对投资最大的误解，是觉得财富路径可以通过别人直接转账完成。",
  },
  kline_shaman: {
    id: "kline_shaman",
    name: "K线萨满",
    emoji: "🔮",
    color: "#7C3AED",
    description: "你不是在看K线，你是在和蜡烛图进行神秘交流。",
    typical_issues: "过度迷信技术形态。忽略基本面和风险。容易把随机波动解释成天机。",
    is_unlock: false,
    block_buttons: ["给均线上香", "返回重测"],
    block_reason: "你不是在看K线，你是在和蜡烛图进行神秘交流。",
  },
  all_in_warrior: {
    id: "all_in_warrior",
    name: "梭哈战神",
    emoji: "⚔️",
    color: "#FF6B35",
    description: "你的交易系统很简单：看好，满仓；看错，嘴硬。",
    typical_issues: "没有仓位管理。过度进攻。情绪上头。容易把一次判断变成人生决战。",
    is_unlock: false,
    block_buttons: ["下载反诈APP", "卸载炒股软件"],
    block_small_link: "我冷静了，返回重测",
    block_reason: "你的交易系统很简单：看好，满仓；看错，嘴硬。",
  },
  breakeven_master: {
    id: "breakeven_master",
    name: "回本就卖宗师",
    emoji: "📉",
    color: "#F59E0B",
    description: "你赚钱时像短跑冠军，亏钱时像长期股东。",
    typical_issues: "小赚就跑。大亏死扛。盈亏比长期不健康。",
    is_unlock: false,
    block_buttons: ["练习止盈止损", "返回重测"],
    block_reason: "你赚钱时像短跑冠军，亏钱时像长期股东。",
  },
  fomo_chaser: {
    id: "fomo_chaser",
    name: "利好已出尽还在冲",
    emoji: "🚀",
    color: "#EC4899",
    description: "你总是在热搜第三天，宣布自己发现了时代主线。",
    typical_issues: "追热点。FOMO严重。容易买在情绪顶点。",
    is_unlock: false,
    block_buttons: ["冷静10分钟", "返回重测"],
    block_reason: "你总是在热搜第三天，宣布自己发现了时代主线。",
  },
  report_archaeologist: {
    id: "report_archaeologist",
    name: "财报考古学家",
    emoji: "📜",
    color: "#8B5CF6",
    description: "你研究得很深，但市场已经从新石器时代涨到了AI时代。",
    typical_issues: "只看基本面。忽略市场节奏。研究很完整，但执行太慢。",
    is_unlock: false,
    block_buttons: ["继续读年报", "返回重测"],
    block_reason: "你研究得很深，但市场已经从新石器时代涨到了AI时代。",
  },
  monte_carlo_poet: {
    id: "monte_carlo_poet",
    name: "蒙特卡洛诗人",
    emoji: "🎲",
    color: "#06B6D4",
    description: "你有很多模型，但市场只用一根阴线就让它们集体沉默。",
    typical_issues: "过度模型化。容易过拟合。忘记模型只是辅助，不是水晶球。",
    is_unlock: false,
    block_buttons: ["降低过拟合", "返回重测"],
    block_reason: "你有很多模型，但市场只用一根阴线就让它们集体沉默。",
  },
};

/** tradeTI 判定优先级（并列时按此顺序，越低越优先） */
export const TRADETI_PRIORITY: TradeTIPersonalityId[] = [
  "qin_shihuang",
  "all_in_warrior",
  "fomo_chaser",
  "breakeven_master",
  "kline_shaman",
  "monte_carlo_poet",
  "report_archaeologist",
  "old_money",
  "wall_street",
];
