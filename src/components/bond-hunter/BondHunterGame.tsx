"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GameState, GamePage, PlayerProfile, RiskPreference, RateDirection, CurveShape } from "./types";
import { INITIAL_GAME_STATE } from "./types";
import {
  generateLevel1Data, generateLevel2Data, generateLevel4Data,
  generateLevel5Data, generateLevel6Data, generateLevel8Data,
  scoreLevel1, scoreLevel2, scoreLevel3, scoreLevel4, scoreLevel5,
  scoreLevel6, scoreLevel7, scoreLevel8, calculatePerformance,
  saveGameState, loadGameState, clearGameState, saveToLeaderboard,
  PORTFOLIO_ASSETS, PORTFOLIO_CONSTRAINTS, calcPortfolioResult,
} from "./game-engine";
import { LandingPage } from "./LandingPage";
import { PlayerProfilePage } from "./PlayerProfilePage";
import { Level1MacroRadar } from "./Level1MacroRadar";
import { Level2YieldCurve } from "./Level2YieldCurve";
import { Level3BondPricing } from "./Level3BondPricing";
import { Level4DurationSniper } from "./Level4DurationSniper";
import { Level5CreditDetective } from "./Level5CreditDetective";
import { Level6SpreadTrading } from "./Level6SpreadTrading";
import { Level7PortfolioBuilder } from "./Level7PortfolioBuilder";
import { Level8MarketShock } from "./Level8MarketShock";
import { InvestmentCommittee } from "./InvestmentCommittee";
import { PerformanceReport } from "./PerformanceReport";

const LEVEL_ORDER: GamePage[] = [
  "level1", "level2", "level3", "level4",
  "level5", "level6", "level7", "level8",
  "committee", "report",
];

interface BondHunterGameProps {
  onComplete?: (score: number) => void;
}

export function BondHunterGame({ onComplete }: BondHunterGameProps) {
  const [state, setState] = useState<GameState>(() => {
    const saved = loadGameState();
    return saved || { ...INITIAL_GAME_STATE, startTime: Date.now() };
  });
  const levelStartTime = useRef(Date.now());

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  useEffect(() => {
    levelStartTime.current = Date.now();
  }, [state.page]);

  const navigate = useCallback((page: GamePage) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  const updateTimeSpent = useCallback((level: string): number => {
    const elapsed = Math.round((Date.now() - levelStartTime.current) / 1000);
    return elapsed;
  }, []);

  // ===== Profile =====
  const handleProfileSubmit = useCallback((profile: PlayerProfile) => {
    setState(prev => ({
      ...prev,
      player: profile,
      page: "level1",
      level1: { ...prev.level1, data: generateLevel1Data() },
    }));
  }, []);

  // ===== Level 1: Macro Radar =====
  const handleLevel1Submit = useCallback((prediction: RateDirection) => {
    const timeSpent = updateTimeSpent("level1");
    setState(prev => {
      const score = scoreLevel1(prediction, prev.level1.data?.correctDirection || "unchanged");
      return {
        ...prev,
        level1: { ...prev.level1, prediction, score, timeSpent },
        page: "level2",
        level2: {
          ...prev.level2,
          data: generateLevel2Data(prev.level1.data?.macro.treasury10Y || 2.0),
        },
      };
    });
  }, [updateTimeSpent]);

  // ===== Level 2: Yield Curve =====
  const handleLevel2Submit = useCallback((shape: CurveShape, yieldPred: number) => {
    const timeSpent = updateTimeSpent("level2");
    setState(prev => {
      const score = scoreLevel2(
        shape, prev.level2.data?.correctShape || "steepening",
        yieldPred, prev.level2.data?.actualFuture10Y || 2.0
      );
      return {
        ...prev,
        level2: { ...prev.level2, shapeGuess: shape, yieldPrediction: yieldPred, score, timeSpent },
        page: "level3",
      };
    });
  }, [updateTimeSpent]);

  // ===== Level 3: Bond Pricing =====
  const handleLevel3Complete = useCallback((interactions: number, finalYield: number) => {
    const timeSpent = updateTimeSpent("level3");
    setState(prev => {
      const score = scoreLevel3(interactions);
      return {
        ...prev,
        level3: { interactions, finalYield, score, timeSpent },
        page: "level4",
        level4: { ...prev.level4, data: generateLevel4Data() },
      };
    });
  }, [updateTimeSpent]);

  // ===== Level 4: Duration Sniper =====
  const handleLevel4Submit = useCallback((bondId: string) => {
    const timeSpent = updateTimeSpent("level4");
    setState(prev => {
      const score = scoreLevel4(bondId, prev.level4.data?.correctBondId || "C", timeSpent);
      return {
        ...prev,
        level4: { ...prev.level4, selectedBond: bondId, score, timeSpent },
        page: "level5",
        level5: { ...prev.level5, data: generateLevel5Data() },
      };
    });
  }, [updateTimeSpent]);

  // ===== Level 5: Credit Detective =====
  const handleLevel5Submit = useCallback((decision: "BUY" | "HOLD" | "SELL") => {
    const timeSpent = updateTimeSpent("level5");
    setState(prev => {
      const score = scoreLevel5(decision, prev.level5.data?.correctDecision || "HOLD");
      return {
        ...prev,
        level5: { ...prev.level5, decision, score, timeSpent },
        page: "level6",
        level6: { ...prev.level6, data: generateLevel6Data() },
      };
    });
  }, [updateTimeSpent]);

  // ===== Level 6: Spread Trading =====
  const handleLevel6Submit = useCallback((choice: string) => {
    const timeSpent = updateTimeSpent("level6");
    setState(prev => {
      const score = scoreLevel6(choice, prev.level6.data?.correctChoice || "B", prev.level6.data?.actualSpreadChange || 0);
      return {
        ...prev,
        level6: { ...prev.level6, choice, score, timeSpent },
        page: "level7",
      };
    });
  }, [updateTimeSpent]);

  // ===== Level 7: Portfolio Builder =====
  const handleLevel7Submit = useCallback((allocation: Record<string, number>) => {
    const timeSpent = updateTimeSpent("level7");
    setState(prev => {
      const result = calcPortfolioResult(PORTFOLIO_ASSETS, allocation, PORTFOLIO_CONSTRAINTS);
      const score = scoreLevel7(result);
      return {
        ...prev,
        level7: { allocation, result, score, timeSpent },
        page: "level8",
        level8: { ...prev.level8, scenario: generateLevel8Data() },
      };
    });
  }, [updateTimeSpent]);

  // ===== Level 8: Market Shock =====
  const handleLevel8Submit = useCallback((decision: string) => {
    const timeSpent = updateTimeSpent("level8");
    setState(prev => {
      const score = scoreLevel8(prev.level8.scenario, decision);
      return {
        ...prev,
        level8: { ...prev.level8, decision, score, timeSpent },
        page: "committee",
      };
    });
  }, [updateTimeSpent]);

  // ===== Committee =====
  const handleCommitteeComplete = useCallback((score: number) => {
    setState(prev => {
      const finalState = { ...prev, committee: { ...prev.committee, score }, page: "report" as GamePage };
      const perf = calculatePerformance(finalState);
      finalState.performance = perf;
      // Save to leaderboard
      if (prev.player) {
        saveToLeaderboard({
          analyst: prev.player.name,
          returnPct: perf.portfolioReturn,
          sharpe: perf.sharpeRatio,
          score: perf.totalScore,
        });
      }
      // 通关回调
      if (onComplete && perf.totalScore >= 40) {
        setTimeout(() => onComplete(perf.totalScore), 500);
      }
      return finalState;
    });
  }, []);

  // ===== Restart =====
  const handleRestart = useCallback(() => {
    clearGameState();
    setState({ ...INITIAL_GAME_STATE, startTime: Date.now() });
  }, []);

  // ===== Render =====
  switch (state.page) {
    case "landing":
      return <LandingPage onStart={() => navigate("profile")} />;
    case "profile":
      return <PlayerProfilePage onSubmit={handleProfileSubmit} />;
    case "level1":
      return state.level1.data ? (
        <Level1MacroRadar data={state.level1.data} onSubmit={handleLevel1Submit} />
      ) : null;
    case "level2":
      return state.level2.data ? (
        <Level2YieldCurve data={state.level2.data} onSubmit={handleLevel2Submit} />
      ) : null;
    case "level3":
      return <Level3BondPricing onComplete={handleLevel3Complete} />;
    case "level4":
      return state.level4.data ? (
        <Level4DurationSniper data={state.level4.data} onSubmit={handleLevel4Submit} />
      ) : null;
    case "level5":
      return state.level5.data ? (
        <Level5CreditDetective data={state.level5.data} onSubmit={handleLevel5Submit} />
      ) : null;
    case "level6":
      return state.level6.data ? (
        <Level6SpreadTrading data={state.level6.data} onSubmit={handleLevel6Submit} />
      ) : null;
    case "level7":
      return <Level7PortfolioBuilder onSubmit={handleLevel7Submit} />;
    case "level8":
      return state.level8.scenario ? (
        <Level8MarketShock
          scenario={state.level8.scenario}
          portfolio={state.level7.result}
          onSubmit={handleLevel8Submit}
        />
      ) : null;
    case "committee":
      return <InvestmentCommittee onComplete={handleCommitteeComplete} />;
    case "report":
      return state.performance ? (
        <PerformanceReport
          performance={state.performance}
          state={state}
          onRestart={handleRestart}
        />
      ) : null;
    default:
      return <LandingPage onStart={() => navigate("profile")} />;
  }
}
