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

  const dialogueData = levelConfig.type === "dialogue" ? DIALOGUE_DATA[levelId] : null;
  const quizData = levelConfig.type === "quiz" ? QUIZ_DATA[levelId] : null;
  const brainData = levelConfig.type === "brain" ? BRAIN_DATA[levelId] : null;
  const miniGameData = levelConfig.type === "minigame" ? MINIGAME_DATA[levelId] : null;

  const renderGame = () => {
    switch (levelConfig.type) {
      case "dialogue":
        if (!dialogueData) return <div className="p-6 text-center text-[#64748B]">关卡数据加载中...</div>;
        return <DialogueGame key={`${levelId}-${gamePhase}`} data={dialogueData} onComplete={handleGameComplete} />;
      case "quiz":
        if (!quizData) return <div className="p-6 text-center text-[#64748B]">关卡数据加载中...</div>;
        return <QuizGame key={`${levelId}-${gamePhase}`} data={quizData} onComplete={handleGameComplete} />;
      case "brain":
        if (!brainData) return <div className="p-6 text-center text-[#64748B]">关卡数据加载中...</div>;
        return <BrainGame key={`${levelId}-${gamePhase}`} data={brainData} onComplete={handleGameComplete} />;
      case "minigame":
        if (!miniGameData) return <div className="p-6 text-center text-[#64748B]">关卡数据加载中...</div>;
        return <MiniGame key={`${levelId}-${gamePhase}`} data={miniGameData} onComplete={handleGameComplete} />;
      default:
        return <div className="p-6 text-center text-[#64748B]">关卡类型未知</div>;
    }
  };

  const gameTypeLabels: Record<string, { label: string; color: string; bg: string }> = {
    dialogue: { label: "对话闯关", color: "text-[#3B82F6]", bg: "bg-blue-50" },
    quiz: { label: "知识翻牌", color: "text-[#8B5CF6]", bg: "bg-violet-50" },
    brain: { label: "脑力挑战", color: "text-[#0D9488]", bg: "bg-teal-50" },
    minigame: { label: "快速反应", color: "text-[#D97706]", bg: "bg-amber-50" },
  };

  const typeInfo = gameTypeLabels[levelConfig.type] || gameTypeLabels.dialogue;
  const unlockAgentRole = levelConfig.unlockAgents[0];
  const agent = AGENT_TEAM.find(a => a.role === unlockAgentRole);
  const isLevelCompleted = currentLevelStatus?.status === "completed";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md max-h-[90vh] bg-[#F5F5F7] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col border border-[#E2E8F0] shadow-xl">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{levelConfig.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-[#1E293B]">{levelConfig.title}</h3>
                <p className="text-xs text-[#64748B]">Level {levelConfig.id} · {levelConfig.subtitle}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-[#F5F5F7] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#1E293B] hover:bg-[#E2E8F0] transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Map overview */}
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
                          ? "bg-[#3B82F6] text-white ring-2 ring-blue-200 scale-110"
                          : completed
                          ? "bg-[#059669] text-white"
                          : unlocked
                          ? "bg-white text-[#1E293B] border border-[#E2E8F0]"
                          : "bg-[#F5F5F7] text-[#94A3B8] border border-[#E2E8F0]"
                      }`}
                    >
                      {completed ? "✓" : level.id}
                    </div>
                  );
                })}
              </div>

              {/* Level info card */}
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.bg} ${typeInfo.color} font-medium`}>
                    {typeInfo.label}
                  </span>
                  {isLevelCompleted && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-[#059669] font-medium">
                      ✓ 已完成
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B] mb-3 leading-relaxed">{levelConfig.description}</p>
                {agent && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F5F5F7] border border-[#E2E8F0]">
                    <span className="text-lg">{agent.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1E293B]">{agent.name}</p>
                      <p className="text-xs text-[#64748B] truncate">{agent.title}</p>
                    </div>
                    {isLevelCompleted && (
                      <span className="text-xs text-[#059669] font-medium flex-shrink-0">已解锁</span>
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
                    ? "bg-[#3B82F6] text-white hover:bg-blue-600 shadow-sm"
                    : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
                }`}
              >
                {isLevelCompleted ? "再次挑战" : isUnlocked ? "进入关卡" : "🔒 未解锁"}
              </button>
            </div>
          )}
        </div>

        {/* Game content */}
        {gamePhase === "playing" && (
          <div className="flex-1 overflow-y-auto min-h-[400px] bg-[#F5F5F7]">
            {renderGame()}
          </div>
        )}

        {/* Completed phase */}
        {gamePhase === "completed" && (
          <div className="flex-1 flex items-center justify-center p-6 bg-[#F5F5F7]">
            <div className="text-center bg-white border border-[#E2E8F0] rounded-lg p-6 w-full max-w-sm">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="text-lg font-bold text-[#059669] mb-2">关卡完成!</h3>
              {agent && (
                <p className="text-sm text-[#64748B] mb-4">
                  {agent.icon} {agent.name} 已解锁
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 rounded-lg bg-[#F5F5F7] border border-[#E2E8F0] text-[#1E293B] text-sm font-medium hover:bg-[#E2E8F0] transition-colors"
                >
                  再玩一次
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-blue-600 transition-colors"
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
