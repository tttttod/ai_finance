// AI 基本面分析 Agent 工作流类型定义

export type AnalysisWorkflowStep =
  | "idle"
  | "step1_strategy"
  | "step1_confirm"
  | "step2_industry"
  | "step2_confirm"
  | "step3_data"
  | "step3_confirm"
  | "step4_stock"
  | "step4_confirm"
  | "completed";

export interface StrategyViewpoint {
  id: string;
  title: string;
  direction: "bullish" | "bearish" | "neutral";
  summary: string;
  keyPoints: string[];
  relatedIndustries: string[];
  source: string;
  date: string;
}

export interface IndustryCandidate {
  id: string;
  name: string;
  reason: string;
  reasons: string[];
  supportingEvidence: string;
  opposingEvidence: string;
  pendingEvidence: string;
  outlook: "short_term" | "mid_term" | "long_term";
  confidence: "high" | "medium" | "low";
  relatedStocks: string[];
  capitalFlow: number;
  institutionCoverage: number;
  prosperity: "up" | "stable" | "down";
  technicalSignal: "bullish" | "neutral" | "bearish";
}

export interface IndustryDeepData {
  industryId: string;
  capitalFlow: {
    netInflow: number;
    trend: "increasing" | "decreasing" | "stable";
    consecutiveDays: number;
  };
  institutionCoverage: {
    count: number;
    ratingDistribution: { buy: number; hold: number; sell: number };
    targetPriceAvg: number;
  };
  technicalSignal: {
    trend: string;
    ma20Position: string;
    supportLevel: number;
    resistanceLevel: number;
  };
 景气度: {
    level: "high" | "medium" | "low";
    trend: "improving" | "declining" | "stable";
    keyIndicator: string;
  };
}

export interface StockCandidate {
  id: string;
  code: string;
  name: string;
  industry: string;
  price: number;
  currentPrice: number;
  changePercent: number;
  marketCap: number;
  pe: number;
  pb: number;
  institutionCount: number;
  rating: string;
  targetPrice: number;
  upside: number;
  potentialUpside: number;
  reason: string;
  reasons: string[];
  risk: string;
  risks: string[];
}

export interface AnalysisHypothesis {
  id: string;
  type: "industry" | "company" | "style" | "event";
  title: string;
  description: string;
  trigger: string;
  evidenceChain: string[];
  observationMetrics: string[];
  observer: string;
  invalidCondition: string;
  reviewCycle: string;
}

export interface RiskFactor {
  id: string;
  title: string;
  category: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface AnalysisSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  currentStep: AnalysisWorkflowStep;
  userPreferences: {
    investmentStyle: string[]; // 成长/价值/红利/周期
    riskTolerance: "conservative" | "moderate" | "aggressive";
    holdingPeriod: "short" | "medium" | "long";
    excludedIndustries: string[];
    preferredIndustries: string[];
  };
  stepResults: {
    strategyViewpoints: StrategyViewpoint[];
    selectedViewpoints: string[];
    industryCandidates: IndustryCandidate[];
    selectedIndustries: string[];
    industryDeepData: Record<string, IndustryDeepData>;
    stockCandidates: StockCandidate[];
    selectedStocks: string[];
    hypotheses: AnalysisHypothesis[];
    risks: RiskFactor[];
  };
  messages: WorkflowChatMessage[];
}

export interface WorkflowChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  step?: AnalysisWorkflowStep;
  metadata?: {
    action?: string;
    data?: unknown;
  };
}

export interface KnowledgeBaseItem {
  id: string;
  category: string;
  title: string;
  description: string;
  framework: string[];
  examples: string[];
}

// ===== Chat Pipeline Types =====

export type StepStatus = "pending" | "active" | "completed";

export type AnalysisStep =
  | "idle"
  | "step1_info"
  | "step2_evidence"
  | "step3_hypothesis"
  | "step4_fundamental"
  | "step5_technical"
  | "step6_prediction";

export interface ChatOption {
  id: string;
  label: string;
  reason: string;
  risk?: string;
  data?: Record<string, unknown>;
}

export interface PipelineStep {
  id: AnalysisStep;
  title: string;
  description: string;
  status: StepStatus;
  result?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  step?: AnalysisStep;
  options?: ChatOption[];
  metadata?: {
    action?: string;
    data?: unknown;
  };
}

export interface ChatSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  currentStep: AnalysisStep | null;
  pipeline: PipelineStep[];
  messages: ChatMessage[];
}
