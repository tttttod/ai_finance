// ===== Bond Hunter: Game Engine =====
// Bond math, market generation, scoring

import type {
  MacroData, MacroNews, RateDirection, Level1Data,
  YieldPoint, CurveShape, Level2Data,
  BondParams, BondMetrics,
  DurationBond, Level4Data,
  CompanyFinancials, CreditBond, Level5Data,
  SpreadBond, Level6Data,
  PortfolioAsset, PortfolioConstraints, PortfolioResult,
  MarketScenario, ScenarioType,
  GameState, PerformanceMetrics, Rating, LeaderboardEntry,
} from "./types";

// ===== Random Helpers =====
export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function round(n: number, decimals: number = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

// ===== Bond Math =====
export function calcBondPrice(params: BondParams): number {
  const { faceValue, couponRate, maturity, frequency, yieldRate } = params;
  const n = maturity * frequency;
  const c = (faceValue * couponRate) / frequency;
  const y = yieldRate / frequency;
  if (y === 0) return faceValue + c * n;
  const pvCoupons = c * (1 - Math.pow(1 + y, -n)) / y;
  const pvFace = faceValue / Math.pow(1 + y, n);
  return round(pvCoupons + pvFace, 4);
}

export function calcDuration(params: BondParams): number {
  const { faceValue, couponRate, maturity, frequency, yieldRate } = params;
  const n = maturity * frequency;
  const c = (faceValue * couponRate) / frequency;
  const y = yieldRate / frequency;
  if (y === 0) return maturity;

  let weightedSum = 0;
  let totalPrice = 0;

  for (let t = 1; t <= n; t++) {
    const cf = t < n ? c : c + faceValue;
    const pv = cf / Math.pow(1 + y, t);
    const timePeriod = t / frequency;
    weightedSum += timePeriod * pv;
    totalPrice += pv;
  }

  return round(weightedSum / totalPrice, 4);
}

export function calcConvexity(params: BondParams): number {
  const { faceValue, couponRate, maturity, frequency, yieldRate } = params;
  const n = maturity * frequency;
  const c = (faceValue * couponRate) / frequency;
  const y = yieldRate / frequency;
  if (y === 0) return (maturity * (maturity + 1)) / (frequency * frequency);

  let convexitySum = 0;
  let totalPrice = 0;

  for (let t = 1; t <= n; t++) {
    const cf = t < n ? c : c + faceValue;
    const pv = cf / Math.pow(1 + y, t);
    const timePeriod = t / frequency;
    convexitySum += timePeriod * (timePeriod + 1 / frequency) * pv;
    totalPrice += pv;
  }

  return round(convexitySum / (totalPrice * Math.pow(1 + y, 2)), 4);
}

export function calcBondMetrics(params: BondParams): BondMetrics {
  const price = calcBondPrice(params);
  const duration = calcDuration(params);
  const convexity = calcConvexity(params);
  const currentYield = round((params.faceValue * params.couponRate) / price, 6);
  return {
    price,
    currentYield,
    ytm: params.yieldRate,
    duration,
    convexity,
  };
}

export function priceChangeFromDuration(duration: number, convexity: number, deltaYield: number): number {
  return round(-duration * deltaYield + 0.5 * convexity * deltaYield * deltaYield, 6);
}

// ===== Portfolio Calculations =====
export function calcPortfolioYield(assets: PortfolioAsset[], allocation: Record<string, number>): number {
  let total = 0;
  for (const asset of assets) {
    total += (asset.yield / 100) * ((allocation[asset.id] || 0) / 100);
  }
  return round(total * 100, 2);
}

export function calcPortfolioDuration(assets: PortfolioAsset[], allocation: Record<string, number>): number {
  let total = 0;
  for (const asset of assets) {
    total += asset.duration * ((allocation[asset.id] || 0) / 100);
  }
  return round(total, 2);
}

export function calcPortfolioResult(
  assets: PortfolioAsset[],
  allocation: Record<string, number>,
  constraints: PortfolioConstraints
): PortfolioResult {
  const portfolioYield = calcPortfolioYield(assets, allocation);
  const portfolioDuration = calcPortfolioDuration(assets, allocation);

  const aaAsset = assets.find(a => a.rating === "AA" || a.id.includes("aa"));
  const creditExposure = aaAsset ? (allocation[aaAsset.id] || 0) : 0;

  const expectedReturn = round(portfolioYield * (1 - creditExposure * 0.001), 2);

  let interestRateRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (portfolioDuration > 5.5) interestRateRisk = "HIGH";
  else if (portfolioDuration > 3.5) interestRateRisk = "MEDIUM";

  let creditRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (creditExposure > 15) creditRisk = "HIGH";
  else if (creditExposure > 8) creditRisk = "MEDIUM";

  const constraintsPassed =
    portfolioDuration >= constraints.durationMin &&
    portfolioDuration <= constraints.durationMax &&
    creditExposure <= constraints.maxAA &&
    Object.values(allocation).every(v => v <= constraints.maxSingle) &&
    (allocation["cash"] || 0) >= constraints.minCash;

  return {
    portfolioYield,
    portfolioDuration,
    creditExposure,
    expectedReturn,
    interestRateRisk,
    creditRisk,
    constraintsPassed,
  };
}

// ===== Market Generation =====
const POLICY_STATES = [
  "Easing bias strengthened",
  "Maintaining accommodative stance",
  "Neutral with tightening bias",
  "Gradual tightening cycle",
  "Emergency easing measures",
];

const NEWS_POOL_BULLISH = [
  "Economic growth slowed for two consecutive quarters",
  "Inflation persistently below market expectations",
  "Central bank signals accommodative policy shift",
  "Global demand weakness weighs on exports",
  "Real estate sector continues to contract",
  "Consumer confidence index hits 12-month low",
];

const NEWS_POOL_BEARISH = [
  "Manufacturing PMI rebounds above expansion threshold",
  "CPI rises faster than expected, inflation concerns grow",
  "Central bank maintains hawkish rhetoric on rates",
  "Credit growth accelerates, leverage risks rising",
  "Infrastructure spending drives economic recovery",
  "Employment data exceeds all forecasts",
];

const NEWS_POOL_NEUTRAL = [
  "Trade surplus narrows but remains positive",
  "Interbank rates stable around policy rate",
  "Government bond issuance proceeds smoothly",
  "Foreign capital flows remain balanced",
];

function generateMacroNews(impact: "bullish" | "bearish" | "neutral"): MacroNews[] {
  const pool = impact === "bullish" ? NEWS_POOL_BULLISH : impact === "bearish" ? NEWS_POOL_BEARISH : NEWS_POOL_NEUTRAL;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((text, i) => ({ id: i + 1, text, impact }));
}

export function generateLevel1Data(): Level1Data {
  const scenario = pick(["easing", "neutral", "tightening"] as const);

  let macro: MacroData;
  let correctDirection: RateDirection;
  let newsImpact: "bullish" | "bearish" | "neutral";

  if (scenario === "easing") {
    macro = {
      gdp: round(rand(3.5, 4.5), 1),
      cpi: round(rand(0.3, 1.2), 1),
      ppi: round(rand(-2.0, -0.5), 1),
      pmi: round(rand(47.0, 49.5), 1),
      m2: round(rand(7.5, 9.5), 1),
      socialFinancing: round(rand(2.5, 4.0), 1),
      policy: pick(["Easing bias strengthened", "Cut RRR by 25bp", "Cut policy rate by 10bp"]),
      interbankRate: round(rand(1.5, 2.0), 2),
      treasury10Y: round(rand(1.8, 2.2), 2),
    };
    correctDirection = pick(["slight_down", "sharp_down"] as RateDirection[]);
    newsImpact = "bullish";
  } else if (scenario === "tightening") {
    macro = {
      gdp: round(rand(5.5, 6.8), 1),
      cpi: round(rand(2.0, 3.5), 1),
      ppi: round(rand(1.0, 3.0), 1),
      pmi: round(rand(50.5, 52.0), 1),
      m2: round(rand(5.5, 7.0), 1),
      socialFinancing: round(rand(1.0, 2.5), 1),
      policy: pick(["Gradual tightening cycle", "Raised policy rate by 10bp", "Reducing liquidity injection"]),
      interbankRate: round(rand(2.5, 3.5), 2),
      treasury10Y: round(rand(2.5, 3.2), 2),
    };
    correctDirection = pick(["slight_up", "sharp_up"] as RateDirection[]);
    newsImpact = "bearish";
  } else {
    macro = {
      gdp: round(rand(4.8, 5.3), 1),
      cpi: round(rand(1.2, 2.0), 1),
      ppi: round(rand(-0.3, 0.5), 1),
      pmi: round(rand(49.5, 50.5), 1),
      m2: round(rand(6.5, 8.0), 1),
      socialFinancing: round(rand(2.0, 3.5), 1),
      policy: pick(["Maintaining accommodative stance", "Neutral stance maintained"]),
      interbankRate: round(rand(1.8, 2.5), 2),
      treasury10Y: round(rand(2.0, 2.5), 2),
    };
    correctDirection = "unchanged";
    newsImpact = "neutral";
  }

  return {
    macro,
    news: generateMacroNews(newsImpact),
    correctDirection,
  };
}

export function generateLevel2Data(treasury10Y: number): Level2Data {
  const shape = pick(["steepening", "flattening", "bull_steepening", "bear_flattening"] as CurveShape[]);
  const base10Y = treasury10Y;

  let curve: YieldPoint[];
  let actualFuture10Y: number;

  const spread1y3y = round(rand(0.10, 0.20), 2);
  const spread3y5y = round(rand(0.10, 0.20), 2);
  const spread5y7y = round(rand(0.08, 0.15), 2);
  const spread7y10y = round(rand(0.10, 0.20), 2);
  const spread10y30y = round(rand(0.20, 0.35), 2);

  const y1Y = round(base10Y - spread1y3y - spread3y5y - spread5y7y - spread7y10y, 2);
  const y3Y = round(y1Y + spread1y3y, 2);
  const y5Y = round(y3Y + spread3y5y, 2);
  const y7Y = round(y5Y + spread5y7y, 2);
  const y10Y = round(y7Y + spread7y10y, 2);
  const y30Y = round(y10Y + spread10y30y, 2);

  curve = [
    { maturity: "1Y", years: 1, yield: Math.max(0.5, y1Y) },
    { maturity: "3Y", years: 3, yield: Math.max(0.7, y3Y) },
    { maturity: "5Y", years: 5, yield: Math.max(0.9, y5Y) },
    { maturity: "7Y", years: 7, yield: Math.max(1.0, y7Y) },
    { maturity: "10Y", years: 10, yield: Math.max(1.2, y10Y) },
    { maturity: "30Y", years: 30, yield: Math.max(1.5, y30Y) },
  ];

  if (shape === "steepening") {
    actualFuture10Y = round(y10Y + rand(0.05, 0.20), 2);
  } else if (shape === "flattening") {
    actualFuture10Y = round(y10Y + rand(-0.10, 0.05), 2);
  } else if (shape === "bull_steepening") {
    actualFuture10Y = round(y10Y - rand(0.10, 0.30), 2);
  } else {
    actualFuture10Y = round(y10Y + rand(0.05, 0.15), 2);
  }

  return { curve, correctShape: shape, actualFuture10Y };
}

export function generateLevel4Data(): Level4Data {
  const bonds: DurationBond[] = [
    {
      id: "A",
      name: "1Y Government Bond",
      duration: round(rand(0.8, 1.0), 1),
      yield: round(rand(1.2, 1.6), 2),
      price: 100,
    },
    {
      id: "B",
      name: "5Y Government Bond",
      duration: round(rand(4.0, 4.8), 1),
      yield: round(rand(1.5, 1.9), 2),
      price: 100,
    },
    {
      id: "C",
      name: "10Y Government Bond",
      duration: round(rand(7.5, 8.5), 1),
      yield: round(rand(1.8, 2.3), 2),
      price: 100,
    },
  ];

  const shockBp = pick([20, 25, 30, 35, 40, 50]);
  return { bonds, shockBp, correctBondId: "C" };
}

export function generateLevel5Data(): Level5Data {
  const companies = [
    {
      companyName: "Star River Real Estate",
      bond: { name: "XH2029", rating: "AA", couponRate: 4.50, remainingYears: 3.2, marketPrice: 101.20, ytm: 4.05 } as CreditBond,
      financials: {
        revenueGrowth: -8,
        ebitdaMargin: 18,
        totalDebt: 120,
        cash: 15,
        interestExpense: 8,
        operatingCashFlow: 10,
      } as CompanyFinancials,
      news: "Star River Real Estate sales declined for three consecutive quarters",
      correctDecision: "SELL" as const,
    },
    {
      companyName: "Dragon Tech Industries",
      bond: { name: "DT2028", rating: "AA+", couponRate: 3.80, remainingYears: 4.1, marketPrice: 99.50, ytm: 3.95 } as CreditBond,
      financials: {
        revenueGrowth: 15,
        ebitdaMargin: 25,
        totalDebt: 50,
        cash: 30,
        interestExpense: 3,
        operatingCashFlow: 20,
      } as CompanyFinancials,
      news: "Dragon Tech secures major government contract, revenue outlook upgraded",
      correctDecision: "BUY" as const,
    },
    {
      companyName: "Phoenix Energy Group",
      bond: { name: "PH2030", rating: "A+", couponRate: 4.20, remainingYears: 5.5, marketPrice: 100.80, ytm: 4.00 } as CreditBond,
      financials: {
        revenueGrowth: 3,
        ebitdaMargin: 20,
        totalDebt: 80,
        cash: 25,
        interestExpense: 5,
        operatingCashFlow: 15,
      } as CompanyFinancials,
      news: "Phoenix Energy maintains stable operations amid energy transition",
      correctDecision: "HOLD" as const,
    },
  ];

  return pick(companies);
}

export function generateLevel6Data(): Level6Data {
  const bondA: SpreadBond = {
    id: "A",
    rating: "AAA",
    yield: round(rand(2.6, 3.0), 2),
    duration: round(rand(3.0, 4.0), 1),
    spread: randInt(60, 100),
  };

  const spreadPremium = randInt(60, 100);
  const bondB: SpreadBond = {
    id: "B",
    rating: "AA",
    yield: round(bondA.yield + spreadPremium / 100, 2),
    duration: round(bondA.duration + rand(0, 0.8), 1),
    spread: bondA.spread + spreadPremium,
  };

  const correctChoice = "B";
  const actualSpreadChange = randInt(-60, 40);

  return { bondA, bondB, correctChoice, actualSpreadChange };
}

export function generateLevel8Data(): MarketScenario {
  const scenarios: MarketScenario[] = [
    {
      type: "A",
      name: "Central Bank Rate Cut",
      description: "The central bank unexpectedly cuts the policy rate by 25bp. Markets rally as liquidity floods the system.",
      yieldChange: -40,
      spreadChange: -15,
      decisionRequired: false,
    },
    {
      type: "B",
      name: "Inflation Rebound",
      description: "CPI surges above 3%, triggering rate hike fears. Long-duration assets face severe selling pressure.",
      yieldChange: 50,
      spreadChange: 10,
      decisionRequired: false,
    },
    {
      type: "C",
      name: "Economic Recession",
      description: "GDP growth turns negative. Government bonds rally but credit spreads widen sharply as default fears rise.",
      yieldChange: -50,
      spreadChange: 100,
      decisionRequired: false,
    },
    {
      type: "D",
      name: "Credit Crisis",
      description: "A major corporate default triggers panic in credit markets. AA bond prices plummet as spreads explode.",
      yieldChange: 20,
      spreadChange: 190,
      decisionRequired: true,
      correctDecision: "SELL",
    },
    {
      type: "E",
      name: "Soft Landing",
      description: "Economic data shows balanced growth. Mild yield decline and tightening credit spreads benefit all assets.",
      yieldChange: -10,
      spreadChange: -30,
      decisionRequired: false,
    },
  ];

  return pick(scenarios);
}

// ===== Portfolio Assets =====
export const PORTFOLIO_ASSETS: PortfolioAsset[] = [
  { id: "gov_1y", name: "1Y Government", yield: 1.40, duration: 0.9, risk: "Low", maxAllocation: 40, rating: "GOV" },
  { id: "gov_5y", name: "5Y Government", yield: 1.70, duration: 4.5, risk: "Low", maxAllocation: 40, rating: "GOV" },
  { id: "gov_10y", name: "10Y Government", yield: 2.00, duration: 8.2, risk: "Medium", maxAllocation: 40, rating: "GOV" },
  { id: "aaa_credit", name: "AAA Credit", yield: 2.80, duration: 3.5, risk: "Medium", maxAllocation: 40, rating: "AAA" },
  { id: "aa_credit", name: "AA Credit", yield: 3.60, duration: 3.8, risk: "High", maxAllocation: 20, rating: "AA" },
];

export const PORTFOLIO_CONSTRAINTS: PortfolioConstraints = {
  durationMin: 3.5,
  durationMax: 5.5,
  maxAA: 20,
  maxSingle: 40,
  minCash: 5,
};

// ===== Scoring =====
const RATE_DIRECTION_MAP: Record<RateDirection, number> = {
  sharp_up: 2,
  slight_up: 1,
  unchanged: 0,
  slight_down: -1,
  sharp_down: -2,
};

export function scoreLevel1(prediction: RateDirection | null, correct: RateDirection): number {
  if (!prediction) return 0;
  if (prediction === correct) return 100;
  const diff = Math.abs(RATE_DIRECTION_MAP[prediction] - RATE_DIRECTION_MAP[correct]);
  if (diff === 1) return 60;
  if (diff === 2) return 30;
  return 10;
}

export function scoreLevel2(
  shapeGuess: CurveShape | null,
  correctShape: CurveShape,
  yieldPred: number | null,
  actualYield: number
): number {
  let shapeScore = 0;
  if (shapeGuess === correctShape) shapeScore = 60;
  else shapeScore = 20;

  let yieldScore = 0;
  if (yieldPred !== null) {
    const error = Math.abs(yieldPred - actualYield);
    if (error < 0.05) yieldScore = 40;
    else if (error < 0.10) yieldScore = 30;
    else if (error < 0.20) yieldScore = 20;
    else if (error < 0.30) yieldScore = 10;
  }

  return shapeScore + yieldScore;
}

export function scoreLevel3(interactions: number): number {
  if (interactions >= 8) return 100;
  if (interactions >= 5) return 80;
  if (interactions >= 3) return 60;
  return 40;
}

export function scoreLevel4(selected: string | null, correct: string, timeSpent: number): number {
  if (!selected) return 0;
  const correct_score = selected === correct ? 80 : 20;
  const timeBonus = timeSpent < 10 ? 20 : timeSpent < 15 ? 15 : timeSpent < 20 ? 10 : 5;
  return correct_score + timeBonus;
}

export function scoreLevel5(decision: "BUY" | "HOLD" | "SELL" | null, correct: "BUY" | "HOLD" | "SELL"): number {
  if (!decision) return 0;
  if (decision === correct) return 100;
  return 30;
}

export function scoreLevel6(choice: string | null, correct: string, spreadChange: number): number {
  if (!choice) return 0;
  const correctChoice = choice === correct;
  if (correctChoice && spreadChange < 0) return 100;
  if (correctChoice) return 70;
  if (spreadChange > 0) return 30;
  return 10;
}

export function scoreLevel7(result: PortfolioResult | null): number {
  if (!result) return 0;
  let score = 50;
  if (result.constraintsPassed) score += 30;
  if (result.portfolioYield > 2.0) score += 10;
  if (result.interestRateRisk === "LOW") score += 10;
  else if (result.interestRateRisk === "MEDIUM") score += 5;
  return score;
}

export function scoreLevel8(scenario: MarketScenario | null, decision: string | null): number {
  if (!scenario) return 0;
  if (!scenario.decisionRequired) return 80;
  if (!decision) return 0;
  if (decision === scenario.correctDecision) return 100;
  return 30;
}

// ===== Final Performance Calculation =====
export function calculatePerformance(state: GameState): PerformanceMetrics {
  const levelScores = [
    state.level1.score,
    state.level2.score,
    state.level3.score,
    state.level4.score,
    state.level5.score,
    state.level6.score,
    state.level7.score,
    state.level8.score,
    state.committee.score,
  ];

  const totalScore = Math.round(levelScores.reduce((a, b) => a + b, 0) / levelScores.length);

  // Simulate portfolio return based on decisions
  const baseReturn = 2.0;
  const scoreBonus = (totalScore - 50) * 0.08;
  const portfolioReturn = round(baseReturn + scoreBonus + rand(-0.5, 0.5), 2);
  const benchmarkReturn = round(4.0 + rand(-1, 1), 2);
  const alpha = round(portfolioReturn - benchmarkReturn, 2);

  const maxDrawdown = round(-(rand(1.0, 4.0) * (1 - totalScore / 200)), 2);
  const sharpeRatio = round(0.5 + (totalScore / 100) * 1.5 + rand(-0.2, 0.2), 2);

  let durationRisk: "Low" | "Medium" | "High" = "Medium";
  if (state.level7.result) {
    durationRisk = state.level7.result.interestRateRisk === "HIGH" ? "High" :
      state.level7.result.interestRateRisk === "LOW" ? "Low" : "Medium";
  }

  let creditRisk: "Low" | "Medium" | "High" = "Medium";
  if (state.level7.result) {
    creditRisk = state.level7.result.creditRisk === "HIGH" ? "High" :
      state.level7.result.creditRisk === "LOW" ? "Low" : "Medium";
  }

  const forecastAccuracy = Math.round(50 + (state.level1.score + state.level2.score) / 4);
  const totalTime = levelScores.reduce((_, b) => b, 0);
  const decisionSpeed = Math.min(100, Math.round(60 + totalScore * 0.3 + rand(0, 10)));
  const riskManagement = Math.round(50 + (state.level4.score + state.level7.score + state.level8.score) / 3 * 0.5);

  let rating: Rating;
  if (totalScore >= 90) rating = "FIXED INCOME MASTER";
  else if (totalScore >= 80) rating = "PORTFOLIO MANAGER";
  else if (totalScore >= 70) rating = "SENIOR ANALYST";
  else if (totalScore >= 60) rating = "FIXED INCOME ANALYST";
  else if (totalScore >= 50) rating = "JUNIOR ANALYST";
  else rating = "TRAINEE";

  return {
    portfolioReturn,
    benchmarkReturn,
    alpha,
    maxDrawdown,
    sharpeRatio: Math.max(0.1, sharpeRatio),
    durationRisk,
    creditRisk,
    forecastAccuracy: Math.min(100, forecastAccuracy),
    decisionSpeed: Math.min(100, decisionSpeed),
    riskManagement: Math.min(100, riskManagement),
    totalScore,
    rating,
  };
}

// ===== Leaderboard =====
const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, analyst: "Alex Chen", returnPct: 9.82, sharpe: 1.91, score: 96 },
  { rank: 2, analyst: "Emily Wang", returnPct: 8.71, sharpe: 1.72, score: 92 },
  { rank: 3, analyst: "Jason Liu", returnPct: 7.93, sharpe: 1.58, score: 89 },
  { rank: 4, analyst: "Sarah Zhang", returnPct: 7.21, sharpe: 1.45, score: 85 },
  { rank: 5, analyst: "Michael Li", returnPct: 6.54, sharpe: 1.32, score: 81 },
  { rank: 6, analyst: "Lisa Huang", returnPct: 5.87, sharpe: 1.18, score: 76 },
  { rank: 7, analyst: "David Wu", returnPct: 5.12, sharpe: 1.05, score: 72 },
  { rank: 8, analyst: "Jennifer Zhao", returnPct: 4.33, sharpe: 0.91, score: 67 },
];

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem("bond-hunter-leaderboard");
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return DEFAULT_LEADERBOARD;
}

export function saveToLeaderboard(entry: Omit<LeaderboardEntry, "rank">): LeaderboardEntry[] {
  const lb = getLeaderboard();
  lb.push({ ...entry, rank: 0 });
  lb.sort((a, b) => b.score - a.score);
  const ranked = lb.map((e, i) => ({ ...e, rank: i + 1 })).slice(0, 20);
  try {
    localStorage.setItem("bond-hunter-leaderboard", JSON.stringify(ranked));
  } catch { /* ignore */ }
  return ranked;
}

// ===== Game State Persistence =====
const STORAGE_KEY = "bond-hunter-game-state";

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function loadGameState(): GameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}
