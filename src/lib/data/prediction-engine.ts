/**
 * Multi-factor stock prediction engine with 10-day walk-forward backtesting.
 *
 * Server-side only. Uses Tushare data via stock-context-builder.
 * Never expose this module or TUSHARE_TOKEN to the browser.
 */

import { callTushare } from "./tushare-client";
import { resolveTsCode } from "./stock-context-builder";
import { getLatestMarketSnapshot } from "./market-snapshot-store";
import type { StockIdentity } from "./stock-context-types";

// ========== Types ==========

export interface PredictionStock {
  name: string;
  code: string;
  tsCode: string;
  industry: string;
}

export interface PredictionDataQuality {
  source: "tushare" | "cache" | "mock";
  fetchedAt: string;
  missing: string[];
  stale: boolean;
}

export interface PredictionResult {
  direction: "up" | "down" | "neutral";
  directionLabel: string;
  probability: number;
  confidence: "low" | "medium" | "high";
  expectedReturnPct: number;
  riskLevel: "low" | "medium" | "high";
  summary: string;
  riskWarnings: string[];
}

export interface BacktestResult {
  dates: string[];
  actualPrices: number[];
  predictedPrices: number[];
  upperBand: number[];
  lowerBand: number[];
  dailyDirectionCorrect: boolean[];
  metrics: {
    directionAccuracy: number;
    intervalHitRate: number;
    mae: number;
    rmse: number;
    r2: number;
    mape: number;
    sampleDays: number;
  };
}

export interface FactorContribution {
  factor: string;
  value: number;
  contribution: number;
  direction: "positive" | "negative" | "neutral";
  explanation: string;
}

export interface PredictionResponse {
  stock: PredictionStock;
  dataQuality: PredictionDataQuality;
  prediction: PredictionResult;
  backtest: BacktestResult;
  factors: {
    selected: string[];
    contributions: FactorContribution[];
  };
}

// ========== Internal types ==========

interface DailyRow {
  ts_code: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  pre_close: number;
  change: number;
  pct_chg: number;
  vol: number;
  amount: number;
}

interface DailyBasicRow {
  ts_code: string;
  trade_date: string;
  pe: number;
  pe_ttm: number;
  pb: number;
  total_mv: number;
  circ_mv: number;
  turnover_rate: number;
  volume_ratio: number;
}

// ========== Factor computation ==========

interface FactorValues {
  // Momentum
  return5d: number;
  return10d: number;
  return20d: number;
  ma5AboveMa20: number; // 1 if MA5 > MA20, -1 otherwise
  // Volatility
  volatility20d: number;
  consecutiveUpDays: number;
  consecutiveDownDays: number;
  // Valuation
  peTtm: number;
  pb: number;
  // Liquidity
  volumeRatio: number;
  turnoverRateChange: number; // recent vs avg
  amountChange5d: number; // 5-day amount change ratio
  // Market
  marketBias: number; // -1 to 1
}

function computeFactorValues(
  dailyRows: DailyRow[], // sorted desc (latest first)
  dailyBasicRows: DailyBasicRow[],
  marketBias: number,
): FactorValues {
  const closes = dailyRows.map((r) => r.close);
  const amounts = dailyRows.map((r) => r.amount);

  // Momentum
  const return5d = closes.length >= 6 ? (closes[0] - closes[5]) / closes[5] : 0;
  const return10d = closes.length >= 11 ? (closes[0] - closes[10]) / closes[10] : 0;
  const return20d = closes.length >= 21 ? (closes[0] - closes[20]) / closes[20] : 0;

  const ma5 = closes.length >= 5 ? closes.slice(0, 5).reduce((a, b) => a + b, 0) / 5 : closes[0];
  const ma20 = closes.length >= 20 ? closes.slice(0, 20).reduce((a, b) => a + b, 0) / 20 : closes[0];
  const ma5AboveMa20 = ma5 > ma20 ? 1 : -1;

  // Volatility
  let volatility20d = 0;
  if (closes.length >= 21) {
    const returns: number[] = [];
    for (let i = 0; i < 20; i++) {
      returns.push((closes[i] - closes[i + 1]) / closes[i + 1]);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
    volatility20d = Math.sqrt(variance) * Math.sqrt(252);
  }

  // Consecutive up/down days
  let consecutiveUpDays = 0;
  let consecutiveDownDays = 0;
  for (let i = 0; i < dailyRows.length - 1; i++) {
    if (dailyRows[i].pct_chg > 0) {
      if (consecutiveDownDays > 0) break;
      consecutiveUpDays++;
    } else if (dailyRows[i].pct_chg < 0) {
      if (consecutiveUpDays > 0) break;
      consecutiveDownDays++;
    } else {
      break;
    }
  }

  // Valuation
  const latestBasic = dailyBasicRows.length > 0 ? dailyBasicRows[0] : null;
  const peTtm = latestBasic?.pe_ttm || 0;
  const pb = latestBasic?.pb || 0;

  // Liquidity
  const volumeRatio = latestBasic?.volume_ratio || 1;
  const avgTurnover = dailyBasicRows.length >= 5
    ? dailyBasicRows.slice(0, 5).reduce((a, b) => a + (b.turnover_rate || 0), 0) / 5
    : (latestBasic?.turnover_rate || 0);
  const latestTurnover = latestBasic?.turnover_rate || 0;
  const turnoverRateChange = avgTurnover > 0 ? (latestTurnover - avgTurnover) / avgTurnover : 0;

  const avgAmount5 = amounts.length >= 6
    ? amounts.slice(1, 6).reduce((a, b) => a + b, 0) / 5
    : amounts[0];
  const amountChange5d = avgAmount5 > 0 ? (amounts[0] - avgAmount5) / avgAmount5 : 0;

  return {
    return5d,
    return10d,
    return20d,
    ma5AboveMa20,
    volatility20d,
    consecutiveUpDays,
    consecutiveDownDays,
    peTtm,
    pb,
    volumeRatio,
    turnoverRateChange,
    amountChange5d,
    marketBias,
  };
}

// ========== Factor scoring ==========

interface FactorScoreResult {
  factor: string;
  rawValue: number;
  score: number; // -1 to 1
  weight: number;
  contribution: number; // score * weight
  direction: "positive" | "negative" | "neutral";
  explanation: string;
}

function scoreFactors(
  factors: FactorValues,
  selectedFactors: string[],
): FactorScoreResult[] {
  const results: FactorScoreResult[] = [];

  // Helper: clamp to [-1, 1]
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));

  // Momentum factors
  if (selectedFactors.includes("5日收益率") || selectedFactors.length === 0) {
    const score = clamp(factors.return5d * 10); // 10% move = full score
    results.push({
      factor: "5日收益率",
      rawValue: factors.return5d,
      score,
      weight: 0.15,
      contribution: score * 0.15,
      direction: score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral",
      explanation: `近5日涨跌幅 ${(factors.return5d * 100).toFixed(2)}%，${score > 0 ? "短期动量偏多" : score < 0 ? "短期动量偏空" : "动量中性"}`,
    });
  }

  if (selectedFactors.includes("10日收益率") || selectedFactors.length === 0) {
    const score = clamp(factors.return10d * 5);
    results.push({
      factor: "10日收益率",
      rawValue: factors.return10d,
      score,
      weight: 0.12,
      contribution: score * 0.12,
      direction: score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral",
      explanation: `近10日涨跌幅 ${(factors.return10d * 100).toFixed(2)}%，${score > 0 ? "中期动量偏多" : score < 0 ? "中期动量偏空" : "动量中性"}`,
    });
  }

  if (selectedFactors.includes("20日收益率") || selectedFactors.length === 0) {
    const score = clamp(factors.return20d * 3);
    results.push({
      factor: "20日收益率",
      rawValue: factors.return20d,
      score,
      weight: 0.1,
      contribution: score * 0.1,
      direction: score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral",
      explanation: `近20日涨跌幅 ${(factors.return20d * 100).toFixed(2)}%，${score > 0 ? "长期动量偏多" : score < 0 ? "长期动量偏空" : "动量中性"}`,
    });
  }

  if (selectedFactors.includes("MA5/MA20关系") || selectedFactors.length === 0) {
    const score = factors.ma5AboveMa20;
    results.push({
      factor: "MA5/MA20关系",
      rawValue: factors.ma5AboveMa20,
      score,
      weight: 0.1,
      contribution: score * 0.1,
      direction: score > 0 ? "positive" : "negative",
      explanation: score > 0 ? "MA5在MA20上方，短期趋势偏多" : "MA5在MA20下方，短期趋势偏空",
    });
  }

  // Volatility factors
  if (selectedFactors.includes("20日波动率") || selectedFactors.length === 0) {
    // High volatility reduces confidence (negative score)
    const score = clamp(-factors.volatility20d * 2 + 0.3);
    results.push({
      factor: "20日波动率",
      rawValue: factors.volatility20d,
      score,
      weight: 0.08,
      contribution: score * 0.08,
      direction: score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral",
      explanation: `年化波动率 ${(factors.volatility20d * 100).toFixed(1)}%，${factors.volatility20d > 0.5 ? "波动较高，风险增大" : "波动适中"}`,
    });
  }

  if (selectedFactors.includes("连续涨跌天数") || selectedFactors.length === 0) {
    let score = 0;
    let explanation = "";
    if (factors.consecutiveUpDays >= 3) {
      score = -0.5; // Overbought risk
      explanation = `连续上涨${factors.consecutiveUpDays}日，追涨风险增大`;
    } else if (factors.consecutiveDownDays >= 3) {
      score = 0.3; // Oversold bounce potential
      explanation = `连续下跌${factors.consecutiveDownDays}日，可能存在超跌反弹机会`;
    } else {
      explanation = "无连续涨跌，走势正常";
    }
    results.push({
      factor: "连续涨跌天数",
      rawValue: factors.consecutiveUpDays - factors.consecutiveDownDays,
      score,
      weight: 0.05,
      contribution: score * 0.05,
      direction: score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral",
      explanation,
    });
  }

  // Valuation factors
  if (selectedFactors.includes("PE-TTM") || selectedFactors.length === 0) {
    let score = 0;
    let explanation = "";
    if (factors.peTtm > 0) {
      if (factors.peTtm > 80) {
        score = -0.6;
        explanation = `PE-TTM ${factors.peTtm.toFixed(1)}，估值偏高，存在回调压力`;
      } else if (factors.peTtm > 40) {
        score = -0.2;
        explanation = `PE-TTM ${factors.peTtm.toFixed(1)}，估值中等偏高`;
      } else if (factors.peTtm > 15) {
        score = 0.2;
        explanation = `PE-TTM ${factors.peTtm.toFixed(1)}，估值合理`;
      } else if (factors.peTtm > 0) {
        score = 0.4;
        explanation = `PE-TTM ${factors.peTtm.toFixed(1)}，估值偏低，安全边际较高`;
      }
    } else {
      explanation = "PE-TTM 数据缺失";
    }
    results.push({
      factor: "PE-TTM",
      rawValue: factors.peTtm,
      score,
      weight: 0.12,
      contribution: score * 0.12,
      direction: score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral",
      explanation,
    });
  }

  if (selectedFactors.includes("PB") || selectedFactors.length === 0) {
    let score = 0;
    let explanation = "";
    if (factors.pb > 0) {
      if (factors.pb > 10) {
        score = -0.4;
        explanation = `PB ${factors.pb.toFixed(2)}，估值偏高`;
      } else if (factors.pb > 3) {
        score = 0;
        explanation = `PB ${factors.pb.toFixed(2)}，估值中等`;
      } else if (factors.pb > 0) {
        score = 0.3;
        explanation = `PB ${factors.pb.toFixed(2)}，估值偏低`;
      }
    } else {
      explanation = "PB 数据缺失";
    }
    results.push({
      factor: "PB",
      rawValue: factors.pb,
      score,
      weight: 0.08,
      contribution: score * 0.08,
      direction: score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral",
      explanation,
    });
  }

  // Liquidity factors
  if (selectedFactors.includes("量比") || selectedFactors.length === 0) {
    const score = clamp((factors.volumeRatio - 1) * 0.5);
    results.push({
      factor: "量比",
      rawValue: factors.volumeRatio,
      score,
      weight: 0.06,
      contribution: score * 0.06,
      direction: score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral",
      explanation: `量比 ${factors.volumeRatio.toFixed(2)}，${factors.volumeRatio > 1.5 ? "成交活跃" : factors.volumeRatio < 0.7 ? "成交清淡" : "成交正常"}`,
    });
  }

  if (selectedFactors.includes("换手率变化") || selectedFactors.length === 0) {
    const score = clamp(factors.turnoverRateChange * 0.5);
    results.push({
      factor: "换手率变化",
      rawValue: factors.turnoverRateChange,
      score,
      weight: 0.05,
      contribution: score * 0.05,
      direction: score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral",
      explanation: `换手率变化 ${(factors.turnoverRateChange * 100).toFixed(1)}%，${factors.turnoverRateChange > 0.3 ? "资金关注度提升" : factors.turnoverRateChange < -0.3 ? "资金关注度下降" : "资金关注度稳定"}`,
    });
  }

  if (selectedFactors.includes("成交额变化") || selectedFactors.length === 0) {
    const score = clamp(factors.amountChange5d * 0.5);
    results.push({
      factor: "成交额变化",
      rawValue: factors.amountChange5d,
      score,
      weight: 0.05,
      contribution: score * 0.05,
      direction: score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral",
      explanation: `5日成交额变化 ${(factors.amountChange5d * 100).toFixed(1)}%，${factors.amountChange5d > 0.3 ? "资金流入明显" : factors.amountChange5d < -0.3 ? "资金流出明显" : "资金面平稳"}`,
    });
  }

  // Market factor
  if (selectedFactors.includes("市场环境") || selectedFactors.length === 0) {
    results.push({
      factor: "市场环境",
      rawValue: factors.marketBias,
      score: factors.marketBias,
      weight: 0.1,
      contribution: factors.marketBias * 0.1,
      direction: factors.marketBias > 0.1 ? "positive" : factors.marketBias < -0.1 ? "negative" : "neutral",
      explanation: factors.marketBias > 0.2 ? "大盘环境偏暖，有利于个股上涨" : factors.marketBias < -0.2 ? "大盘环境偏弱，个股承压" : "大盘环境中性",
    });
  }

  return results;
}

// ========== Walk-forward backtest ==========

function walkForwardBacktest(
  dailyRows: DailyRow[], // sorted desc, at least 60 rows
  dailyBasicRows: DailyBasicRow[],
  selectedFactors: string[],
  marketBias: number,
  horizonDays: number,
): BacktestResult {
  // We need at least horizonDays + some lookback
  const minRequired = horizonDays + 20;
  const available = dailyRows.length;
  const actualDays = Math.min(horizonDays, available - 20);

  if (actualDays < 3) {
    return {
      dates: [],
      actualPrices: [],
      predictedPrices: [],
      upperBand: [],
      lowerBand: [],
      dailyDirectionCorrect: [],
      metrics: {
        directionAccuracy: 0,
        intervalHitRate: 0,
        mae: 0,
        rmse: 0,
        r2: 0,
        mape: 0,
        sampleDays: 0,
      },
    };
  }

  const dates: string[] = [];
  const actualPrices: number[] = [];
  const predictedPrices: number[] = [];
  const upperBand: number[] = [];
  const lowerBand: number[] = [];
  const dailyDirectionCorrect: boolean[] = [];

  // Walk-forward: for each of the last `actualDays` days,
  // use data BEFORE that day to predict it
  for (let i = actualDays - 1; i >= 0; i--) {
    // The day we're predicting
    const targetIdx = i;
    const targetRow = dailyRows[targetIdx];

    // Data available: everything from targetIdx+1 onwards (older data)
    const historyRows = dailyRows.slice(targetIdx + 1);
    const historyBasicRows = dailyBasicRows.filter(
      (b) => b.trade_date < targetRow.trade_date,
    );

    if (historyRows.length < 20) {
      // Not enough history to compute factors
      continue;
    }

    // Compute factors from history
    const factorVals = computeFactorValues(historyRows, historyBasicRows, marketBias);
    const factorScores = scoreFactors(factorVals, selectedFactors);

    // Compute composite score
    const totalWeight = factorScores.reduce((a, b) => a + b.weight, 0);
    const compositeScore = totalWeight > 0
      ? factorScores.reduce((a, b) => a + b.contribution, 0) / totalWeight
      : 0;

    // Map score to expected return
    const expectedReturnPct = compositeScore * 3; // scale to ~3% max
    const predictedPrice = historyRows[0].close * (1 + expectedReturnPct / 100);

    // Confidence band based on volatility
    const vol = factorVals.volatility20d || 0.3;
    const bandWidth = historyRows[0].close * vol * 0.1;

    dates.push(targetRow.trade_date);
    actualPrices.push(targetRow.close);
    predictedPrices.push(Math.round(predictedPrice * 100) / 100);
    upperBand.push(Math.round((predictedPrice + bandWidth) * 100) / 100);
    lowerBand.push(Math.round((predictedPrice - bandWidth) * 100) / 100);

    // Check direction
    if (targetIdx < dailyRows.length - 1) {
      const actualDirection = targetRow.close > dailyRows[targetIdx + 1].close ? "up" : "down";
      const predictedDirection = predictedPrice > historyRows[0].close ? "up" : "down";
      dailyDirectionCorrect.push(actualDirection === predictedDirection);
    }
  }

  // Compute metrics
  const sampleDays = dates.length;
  if (sampleDays === 0) {
    return {
      dates: [],
      actualPrices: [],
      predictedPrices: [],
      upperBand: [],
      lowerBand: [],
      dailyDirectionCorrect: [],
      metrics: {
        directionAccuracy: 0,
        intervalHitRate: 0,
        mae: 0,
        rmse: 0,
        r2: 0,
        mape: 0,
        sampleDays: 0,
      },
    };
  }

  // Direction accuracy
  const directionCorrect = dailyDirectionCorrect.filter(Boolean).length;
  const directionAccuracy = dailyDirectionCorrect.length > 0
    ? directionCorrect / dailyDirectionCorrect.length
    : 0;

  // Interval hit rate
  let intervalHits = 0;
  for (let i = 0; i < sampleDays; i++) {
    if (actualPrices[i] >= lowerBand[i] && actualPrices[i] <= upperBand[i]) {
      intervalHits++;
    }
  }
  const intervalHitRate = intervalHits / sampleDays;

  // MAE, RMSE, MAPE
  let sumAbsError = 0;
  let sumSqError = 0;
  let sumAbsPctError = 0;
  for (let i = 0; i < sampleDays; i++) {
    const error = actualPrices[i] - predictedPrices[i];
    sumAbsError += Math.abs(error);
    sumSqError += error * error;
    if (actualPrices[i] !== 0) {
      sumAbsPctError += Math.abs(error / actualPrices[i]);
    }
  }
  const mae = Math.round((sumAbsError / sampleDays) * 100) / 100;
  const rmse = Math.round(Math.sqrt(sumSqError / sampleDays) * 100) / 100;
  const mape = Math.round((sumAbsPctError / sampleDays) * 10000) / 100;

  // R²
  const meanActual = actualPrices.reduce((a, b) => a + b, 0) / sampleDays;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < sampleDays; i++) {
    ssTot += (actualPrices[i] - meanActual) ** 2;
    ssRes += (actualPrices[i] - predictedPrices[i]) ** 2;
  }
  const r2 = ssTot > 0 ? Math.round((1 - ssRes / ssTot) * 100) / 100 : 0;

  return {
    dates: dates.reverse(),
    actualPrices: actualPrices.reverse(),
    predictedPrices: predictedPrices.reverse(),
    upperBand: upperBand.reverse(),
    lowerBand: lowerBand.reverse(),
    dailyDirectionCorrect: dailyDirectionCorrect.reverse(),
    metrics: {
      directionAccuracy: Math.round(directionAccuracy * 100) / 100,
      intervalHitRate: Math.round(intervalHitRate * 100) / 100,
      mae,
      rmse,
      r2,
      mape,
      sampleDays,
    },
  };
}

// ========== Market bias ==========

async function computeMarketBias(): Promise<number> {
  try {
    const snapshot = await getLatestMarketSnapshot();
    if (!snapshot) return 0;

    // Use indices to determine market bias
    let bias = 0;
    if (snapshot.indices && snapshot.indices.length > 0) {
      const upCount = snapshot.indices.filter((i) => i.change > 0).length;
      const downCount = snapshot.indices.filter((i) => i.change < 0).length;
      bias = (upCount - downCount) / snapshot.indices.length;
    }

    // Adjust by summary sentiment
    if (snapshot.summary) {
      const positiveWords = ["上涨", "利好", "反弹", "走强", "回暖", "突破"];
      const negativeWords = ["下跌", "利空", "回调", "走弱", "下行", "破位"];
      for (const word of positiveWords) {
        if (snapshot.summary.includes(word)) bias += 0.1;
      }
      for (const word of negativeWords) {
        if (snapshot.summary.includes(word)) bias -= 0.1;
      }
    }

    return Math.max(-1, Math.min(1, bias));
  } catch {
    return 0;
  }
}

// ========== Main prediction function ==========

export async function buildStockPrediction(
  query: string,
  selectedFactors: string[],
  horizonDays: number = 10,
): Promise<PredictionResponse> {
  // 1. Resolve stock identity
  const identity = await resolveTsCode(query);
  if (!identity) {
    throw new Error(`无法识别股票: ${query}`);
  }

  const missing: string[] = [];
  let source: "tushare" | "cache" | "mock" = "tushare";

  // 2. Fetch daily data (at least 60 trading days)
  let dailyRows: DailyRow[] = [];
  try {
    dailyRows = await callTushare<DailyRow>(
      "daily",
      { ts_code: identity.tsCode },
      "ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount",
    );
    dailyRows.sort((a, b) => b.trade_date.localeCompare(a.trade_date));
    dailyRows = dailyRows.slice(0, 120); // Get up to 120 days for safety
  } catch (err) {
    console.error("[prediction] daily fetch failed:", (err as Error).message);
    missing.push("daily");
  }

  if (dailyRows.length < 25) {
    if (missing.length === 0) missing.push("insufficient_data");
    source = dailyRows.length > 0 ? "tushare" : "mock";
    throw new Error(
      `历史数据不足（仅${dailyRows.length}日），无法完成${horizonDays}日回测。需要至少25个交易日数据。`,
    );
  }

  // 3. Fetch daily_basic (valuation)
  let dailyBasicRows: DailyBasicRow[] = [];
  try {
    dailyBasicRows = await callTushare<DailyBasicRow>(
      "daily_basic",
      { ts_code: identity.tsCode },
      "ts_code,trade_date,pe,pe_ttm,pb,total_mv,circ_mv,turnover_rate,volume_ratio",
    );
    dailyBasicRows.sort((a, b) => b.trade_date.localeCompare(a.trade_date));
    dailyBasicRows = dailyBasicRows.slice(0, 60);
  } catch (err) {
    console.error("[prediction] daily_basic fetch failed:", (err as Error).message);
    missing.push("valuation");
  }

  // 4. Compute market bias
  const marketBias = await computeMarketBias();

  // 5. Compute factor values and scores for current prediction
  const factorValues = computeFactorValues(dailyRows, dailyBasicRows, marketBias);
  const factorScores = scoreFactors(factorValues, selectedFactors);

  // 6. Compute composite prediction
  const totalWeight = factorScores.reduce((a, b) => a + b.weight, 0);
  const compositeScore = totalWeight > 0
    ? factorScores.reduce((a, b) => a + b.contribution, 0) / totalWeight
    : 0;

  // Map to direction
  let direction: "up" | "down" | "neutral";
  let directionLabel: string;
  if (compositeScore > 0.15) {
    direction = "up";
    directionLabel = "模型倾向看涨";
  } else if (compositeScore < -0.15) {
    direction = "down";
    directionLabel = "模型倾向看跌";
  } else {
    direction = "neutral";
    directionLabel = "模型倾向中性";
  }

  // Probability (map score to 0-1 range)
  const probability = Math.round(Math.max(0.1, Math.min(0.9, 0.5 + compositeScore * 0.8)) * 100) / 100;

  // Confidence
  const absScore = Math.abs(compositeScore);
  let confidence: "low" | "medium" | "high";
  if (absScore > 0.4) confidence = "high";
  else if (absScore > 0.2) confidence = "medium";
  else confidence = "low";

  // Expected return
  const expectedReturnPct = Math.round(compositeScore * 3 * 100) / 100;

  // Risk level
  const vol = factorValues.volatility20d;
  let riskLevel: "low" | "medium" | "high";
  if (vol > 0.6 || factorValues.consecutiveUpDays >= 5) riskLevel = "high";
  else if (vol > 0.35 || factorValues.consecutiveUpDays >= 3) riskLevel = "medium";
  else riskLevel = "low";

  // Risk warnings
  const riskWarnings: string[] = [];
  if (vol > 0.5) riskWarnings.push("近期波动率较高，价格波动风险增大");
  if (factorValues.consecutiveUpDays >= 4) riskWarnings.push("连续上涨多日，短期追涨风险较高");
  if (factorValues.consecutiveDownDays >= 4) riskWarnings.push("连续下跌多日，需关注是否企稳");
  if (factorValues.peTtm > 60) riskWarnings.push("当前估值偏高，存在估值回调压力");
  if (factorValues.volumeRatio > 2.5) riskWarnings.push("量比异常偏高，可能存在异动");
  if (marketBias < -0.3) riskWarnings.push("大盘环境偏弱，个股可能承压");
  if (riskWarnings.length === 0) {
    riskWarnings.push("当前无明显异常信号，但仍需关注市场变化");
  }

  // Summary
  const topPositive = factorScores
    .filter((f) => f.score > 0.1)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 2)
    .map((f) => f.factor);
  const topNegative = factorScores
    .filter((f) => f.score < -0.1)
    .sort((a, b) => a.contribution - b.contribution)
    .slice(0, 2)
    .map((f) => f.factor);

  let summary = `${directionLabel}，上涨概率约${Math.round(probability * 100)}%。`;
  if (topPositive.length > 0) {
    summary += `${topPositive.join("、")}等因素偏积极；`;
  }
  if (topNegative.length > 0) {
    summary += `${topNegative.join("、")}等因素提示风险。`;
  }
  summary += "该结果仅供研究参考，不构成投资建议。";

  // 7. Walk-forward backtest
  const backtest = walkForwardBacktest(dailyRows, dailyBasicRows, selectedFactors, marketBias, horizonDays);

  // 8. Build response
  const stock: PredictionStock = {
    name: identity.name,
    code: identity.symbol,
    tsCode: identity.tsCode,
    industry: identity.industry,
  };

  const dataQuality: PredictionDataQuality = {
    source,
    fetchedAt: new Date().toISOString(),
    missing,
    stale: false,
  };

  const prediction: PredictionResult = {
    direction,
    directionLabel,
    probability,
    confidence,
    expectedReturnPct,
    riskLevel,
    summary,
    riskWarnings,
  };

  const contributions: FactorContribution[] = factorScores.map((f) => ({
    factor: f.factor,
    value: Math.round(f.rawValue * 10000) / 10000,
    contribution: Math.round(Math.abs(f.contribution) * 100) / 100,
    direction: f.direction,
    explanation: f.explanation,
  }));

  return {
    stock,
    dataQuality,
    prediction,
    backtest,
    factors: {
      selected: selectedFactors,
      contributions,
    },
  };
}
