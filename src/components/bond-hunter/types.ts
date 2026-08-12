// ===== Bond Hunter: Fixed Income Challenge - Type Definitions =====

export type GamePage =
  | "landing"
  | "profile"
  | "level1"
  | "level2"
  | "level3"
  | "level4"
  | "level5"
  | "level6"
  | "level7"
  | "level8"
  | "committee"
  | "report";

export type RiskPreference = "conservative" | "balanced" | "aggressive";

export type Rating =
  | "FIXED INCOME MASTER"
  | "PORTFOLIO MANAGER"
  | "SENIOR ANALYST"
  | "FIXED INCOME ANALYST"
  | "JUNIOR ANALYST"
  | "TRAINEE";

export interface PlayerProfile {
  name: string;
  analystId: string;
  riskPreference: RiskPreference;
}

// Level 1: Macro Radar
export interface MacroData {
  gdp: number;
  cpi: number;
  ppi: number;
  pmi: number;
  m2: number;
  socialFinancing: number;
  policy: string;
  interbankRate: number;
  treasury10Y: number;
}

export interface MacroNews {
  id: number;
  text: string;
  impact: "bullish" | "bearish" | "neutral";
}

export type RateDirection = "sharp_up" | "slight_up" | "unchanged" | "slight_down" | "sharp_down";

export interface Level1Data {
  macro: MacroData;
  news: MacroNews[];
  correctDirection: RateDirection;
}

// Level 2: Yield Curve
export interface YieldPoint {
  maturity: string;
  years: number;
  yield: number;
}

export type CurveShape = "steepening" | "flattening" | "bull_steepening" | "bear_flattening";

export interface Level2Data {
  curve: YieldPoint[];
  correctShape: CurveShape;
  actualFuture10Y: number;
}

// Level 3: Bond Pricing
export interface BondParams {
  faceValue: number;
  couponRate: number;
  maturity: number;
  frequency: number;
  yieldRate: number;
}

export interface BondMetrics {
  price: number;
  currentYield: number;
  ytm: number;
  duration: number;
  convexity: number;
}

// Level 4: Duration Sniper
export interface DurationBond {
  id: string;
  name: string;
  duration: number;
  yield: number;
  price: number;
}

export interface Level4Data {
  bonds: DurationBond[];
  shockBp: number;
  correctBondId: string;
}

// Level 5: Credit Detective
export interface CompanyFinancials {
  revenueGrowth: number;
  ebitdaMargin: number;
  totalDebt: number;
  cash: number;
  interestExpense: number;
  operatingCashFlow: number;
}

export interface CreditBond {
  name: string;
  rating: string;
  couponRate: number;
  remainingYears: number;
  marketPrice: number;
  ytm: number;
}

export interface Level5Data {
  companyName: string;
  bond: CreditBond;
  financials: CompanyFinancials;
  news: string;
  correctDecision: "BUY" | "HOLD" | "SELL";
}

// Level 6: Spread Trading
export interface SpreadBond {
  id: string;
  rating: string;
  yield: number;
  duration: number;
  spread: number;
}

export interface Level6Data {
  bondA: SpreadBond;
  bondB: SpreadBond;
  correctChoice: string;
  actualSpreadChange: number;
}

// Level 7: Portfolio Builder
export interface PortfolioAsset {
  id: string;
  name: string;
  yield: number;
  duration: number;
  risk: "Low" | "Medium" | "High";
  maxAllocation: number;
  rating: string;
}

export interface PortfolioConstraints {
  durationMin: number;
  durationMax: number;
  maxAA: number;
  maxSingle: number;
  minCash: number;
}

export interface PortfolioResult {
  portfolioYield: number;
  portfolioDuration: number;
  creditExposure: number;
  expectedReturn: number;
  interestRateRisk: "LOW" | "MEDIUM" | "HIGH";
  creditRisk: "LOW" | "MEDIUM" | "HIGH";
  constraintsPassed: boolean;
}

// Level 8: Market Shock
export type ScenarioType = "A" | "B" | "C" | "D" | "E";

export interface MarketScenario {
  type: ScenarioType;
  name: string;
  description: string;
  yieldChange: number;
  spreadChange: number;
  decisionRequired: boolean;
  correctDecision?: "BUY_THE_DIP" | "HOLD" | "SELL";
}

// Investment Committee
export interface CommitteeAnswers {
  rateDirection: RateDirection;
  bestAsset: string;
  durationAction: "increase" | "maintain" | "decrease";
  creditAction: "increase" | "maintain" | "decrease";
  allocation: { government: number; aaa: number; aa: number; cash: number };
}

// Performance
export interface PerformanceMetrics {
  portfolioReturn: number;
  benchmarkReturn: number;
  alpha: number;
  maxDrawdown: number;
  sharpeRatio: number;
  durationRisk: "Low" | "Medium" | "High";
  creditRisk: "Low" | "Medium" | "High";
  forecastAccuracy: number;
  decisionSpeed: number;
  riskManagement: number;
  totalScore: number;
  rating: Rating;
}

// Leaderboard
export interface LeaderboardEntry {
  rank: number;
  analyst: string;
  returnPct: number;
  sharpe: number;
  score: number;
}

// Full Game State
export interface GameState {
  page: GamePage;
  player: PlayerProfile | null;
  level1: {
    data: Level1Data | null;
    prediction: RateDirection | null;
    score: number;
    timeSpent: number;
  };
  level2: {
    data: Level2Data | null;
    shapeGuess: CurveShape | null;
    yieldPrediction: number | null;
    score: number;
    timeSpent: number;
  };
  level3: {
    interactions: number;
    finalYield: number | null;
    score: number;
    timeSpent: number;
  };
  level4: {
    data: Level4Data | null;
    selectedBond: string | null;
    score: number;
    timeSpent: number;
  };
  level5: {
    data: Level5Data | null;
    decision: "BUY" | "HOLD" | "SELL" | null;
    score: number;
    timeSpent: number;
  };
  level6: {
    data: Level6Data | null;
    choice: string | null;
    score: number;
    timeSpent: number;
  };
  level7: {
    allocation: Record<string, number>;
    result: PortfolioResult | null;
    score: number;
    timeSpent: number;
  };
  level8: {
    scenario: MarketScenario | null;
    decision: string | null;
    score: number;
    timeSpent: number;
  };
  committee: {
    answers: CommitteeAnswers | null;
    score: number;
  };
  performance: PerformanceMetrics | null;
  startTime: number;
}

export const INITIAL_GAME_STATE: GameState = {
  page: "landing",
  player: null,
  level1: { data: null, prediction: null, score: 0, timeSpent: 0 },
  level2: { data: null, shapeGuess: null, yieldPrediction: null, score: 0, timeSpent: 0 },
  level3: { interactions: 0, finalYield: null, score: 0, timeSpent: 0 },
  level4: { data: null, selectedBond: null, score: 0, timeSpent: 0 },
  level5: { data: null, decision: null, score: 0, timeSpent: 0 },
  level6: { data: null, choice: null, score: 0, timeSpent: 0 },
  level7: { allocation: {}, result: null, score: 0, timeSpent: 0 },
  level8: { scenario: null, decision: null, score: 0, timeSpent: 0 },
  committee: { answers: null, score: 0 },
  performance: null,
  startTime: Date.now(),
};

// Level info for navigation
export const LEVEL_INFO: { id: string; title: string; subtitle: string; icon: string }[] = [
  { id: "level1", title: "Macro Radar", subtitle: "Level 01", icon: "01" },
  { id: "level2", title: "Yield Curve Lab", subtitle: "Level 02", icon: "02" },
  { id: "level3", title: "Bond Pricing Lab", subtitle: "Level 03", icon: "03" },
  { id: "level4", title: "Duration Sniper", subtitle: "Level 04", icon: "04" },
  { id: "level5", title: "Credit Detective", subtitle: "Level 05", icon: "05" },
  { id: "level6", title: "Spread Trading", subtitle: "Level 06", icon: "06" },
  { id: "level7", title: "Portfolio Builder", subtitle: "Level 07", icon: "07" },
  { id: "level8", title: "Market Shock", subtitle: "Level 08", icon: "08" },
];
