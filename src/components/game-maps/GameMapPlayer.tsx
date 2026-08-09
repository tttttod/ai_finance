"use client";

import { useState, useCallback, useEffect } from "react";
import { GAME_MAP_LEVELS, getLevelConfig } from "./game-data";
import type { GameMapLevel } from "./game-data";
import { DIALOGUE_DATA } from "./dialogue-data";
import { QUIZ_DATA } from "./quiz-data";
import { BRAIN_DATA } from "./brain-data";
import { MINIGAME_DATA } from "./minigame-data";
import { DialogueGame } from "./DialogueGame";
import { QuizGame } from "./QuizGame";
import { BrainGame } from "./BrainGame";
import { MiniGame } from "./MiniGame";
import {
  loadTraderRoadProgress,
  completeTraderRoadLevel,
  getTraderRoadLevelsWithStatus,
  getDefaultTraderRoadProgress,
} from "@/lib/trader-road-progress";
import type { TraderRoadProgress } from "@/lib/trader-road-progress";
import { AGENT_TEAM } from "@/lib/mini-types";

interface GameMapPlayerProps {
  levelId: number;
  isOpen: boolean;
  onClose: () => void;
  onLevelComplete?: (levelId: number) => void;
}

export function GameMapPlayer({ levelId, isOpen, onClose, onLevelComplete }: GameMapPlayerProps) {
  const [gamePhase, setGamePhase] = useState<"map" | "playing" | "completed">("map");
  const [progress, setProgress] = useState<TraderRoadProgress>(getDefaultTraderRoadProgress());

  const levelConfig = getLevelConfig(levelId);

  // Load progress on mount
  useEffect(() => {
    if (isOpen) {
      setProgress(loadTraderRoadProgress());
      setGamePhase("map");
    }
  }, [isOpen, levelId]);

  const levelsWithStatus = getTraderRoadLevelsWithStatus(progress);
  const currentLevelStatus = levelsWithStatus.find(l => l.id === levelId);
  const isUnlocked = currentLevelStatus?.status === "available" || currentLevelStatus?.status === "completed";

  const handleStartLevel = useCallback(() => {
    if (!isUnlocked) return;
    setGamePhase("playing");
  }, [isUnlocked]);

  const handleGameComplete = useCallback((passed: boolean) => {
    if (passed) {
      const updated = completeTraderRoadLevel(levelId);
      setProgress(updated);
      onLevelComplete?.(levelId);
      setGamePhase("completed");
    } else {
      // Retry
      setGamePhase("playing");
    }
  }, [levelId, onLevelComplete]);

  const handleRetry = useCallback(() => {
    setGamePhase("playing");
  }, []);

  const handleClose = useCallback(() => {
    setGamePhase("map");
    onClose();
  }, [onClose]);

  if (!isOpen || !levelConfig) return null;

  // Get the game data for this level
  const dialogueData = levelConfig.type === "dialogue" ? DIALOGUE_DATA[levelId] : null;
  const quizData = levelConfig.type === "quiz" ? QUIZ_DATA[levelId] : null;
  const brainData = levelConfig.type === "brain" ? BRAIN_DATA[levelId] : null;
  const miniGameData = levelConfig.type === "minigame" ? MINIGAME_DATA[levelId] : null;

  // Render game content based on type
  const renderGame = () => {
    switch (levelConfig.type) {
      case "dialogue":
        if (!dialogueData) return <div className="p-6 text-center text-slate-400">关卡数据加载中...</div>;
        return <DialogueGame key={`${levelId}-${gamePhase}`} data={dialogueData} onComplete={handleGameComplete} />;
      case "quiz":
        if (!quizData) return <div className="p-6 text-center text-slate-400">关卡数据加载中...</div>;
        return <QuizGame key={`${levelId}-${gamePhase}`} data={quizData} onComplete={handleGameComplete} />;
      case "brain":
        if (!brainData) return <div className="p-6 text-center text-slate-400">关卡数据加载中...</div>;
        return <BrainGame key={`${levelId}-${gamePhase}`} data={brainData} onComplete={handleGameComplete} />;
      case "minigame":
        if (!miniGameData) return <div className="p-6 text-center text-slate-400">关卡数据加载中...</div>;
        return <MiniGame key={`${levelId}-${gamePhase}`} data={miniGameData} onComplete={handleGameComplete} />;
      default:
        return <div className="p-6 text-center text-slate-400">关卡类型未知</div>;
    }
  };

  // Game type labels
  const gameTypeLabels: Record<string, { label: string; icon: string }> = {
    dialogue: { label: "对话闯关", icon: "\uD83D\uDCAC" },
    quiz: { label: "知识翻牌", icon: "\uD83C\uDCCF" },
    brain: { label: "脑力挑战", icon: "\uD83E\uDDE0" },
    minigame: { label: "快速反应", icon: "\u26A1" },
  };

  const typeInfo = gameTypeLabels[levelConfig.type] || gameTypeLabels.dialogue;
  const unlockAgentRole = levelConfig.unlockAgents[0];
  const agent = AGENT_TEAM.find(a => a.role === unlockAgentRole);
  const isLevelCompleted = currentLevelStatus?.status === "completed";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md max-h-[90vh] bg-gradient-to-b from-slate-900 to-slate-950 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col border border-slate-700/50">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{levelConfig.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-white">{levelConfig.title}</h3>
                <p className="text-xs text-slate-400">Level {levelConfig.id} · {levelConfig.subtitle}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Map overview - show when in map phase */}
          {gamePhase === "map" && (
            <div className="mt-3">
              {/* Level progress strip */}
              <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
                {GAME_MAP_LEVELS.map((level) => {
                  const ls = levelsWithStatus.find(l => l.id === level.id);
                  const unlocked = ls?.status === "available" || ls?.status === "completed";
                  const completed = ls?.status === "completed";
                  const isCurrent = level.id === levelId;
                  return (
                    <div
                      key={level.id}
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-blue-600 text-white ring-2 ring-blue-400/50 scale-110"
                          : completed
                          ? "bg-emerald-600/80 text-white"
                          : unlocked
                          ? "bg-slate-700 text-slate-300"
                          : "bg-slate-800 text-slate-600"
                      }`}
                    >
                      {completed ? "✓" : level.id}
                    </div>
                  );
                })}
              </div>

              {/* Level info card */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    levelConfig.type === "dialogue" ? "border-blue-500/30 text-blue-400" :
                    levelConfig.type === "quiz" ? "border-purple-500/30 text-purple-400" :
                    levelConfig.type === "brain" ? "border-cyan-500/30 text-cyan-400" :
                    "border-amber-500/30 text-amber-400"
                  }`}>
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                  {isLevelCompleted && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-500/30">
                      ✓ 已完成
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mb-3">{levelConfig.description}</p>
                {agent && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50 border border-slate-700/30">
                    <span className="text-lg">{agent.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-white">{agent.name}</p>
                      <p className="text-xs text-slate-400">{agent.title}</p>
                    </div>
                    {isLevelCompleted && (
                      <span className="ml-auto text-xs text-emerald-400">已解锁</span>
                    )}
                  </div>
                )}
              </div>

              {/* Start button */}
              <button
                onClick={handleStartLevel}
                disabled={!isUnlocked}
                className={`w-full mt-3 py-3 rounded-lg text-sm font-bold transition-all ${
                  isUnlocked
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                {isLevelCompleted ? "再次挑战" : isUnlocked ? "进入关卡" : "🔒 未解锁"}
              </button>
            </div>
          )}
        </div>

        {/* Game content */}
        {gamePhase === "playing" && (
          <div className="flex-1 overflow-y-auto min-h-[400px]">
            {renderGame()}
          </div>
        )}

        {/* Completed phase */}
        {gamePhase === "completed" && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="text-lg font-bold text-emerald-400 mb-2">关卡完成！</h3>
              {agent && (
                <p className="text-sm text-slate-300 mb-4">
                  {agent.icon} {agent.name} 已解锁
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 rounded-lg bg-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-600 transition-colors"
                >
                  再玩一次
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-lg bg-blue-600/80 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  返回地图
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
