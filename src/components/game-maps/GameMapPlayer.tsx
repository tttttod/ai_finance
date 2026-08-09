"use client";

import { useState, useEffect } from "react";
import { getLevelConfig, GAME_MAP_LEVELS } from "./game-data";
import { DIALOGUE_DATA } from "./dialogue-data";
import { QUIZ_DATA } from "./quiz-data";
import { BRAIN_DATA } from "./brain-data";
import { MINIGAME_DATA } from "./minigame-data";
import { LEARNING_CARDS } from "./learning-cards-data";
import { QUIZ_QUESTIONS } from "./quiz-choice-data";
import { DialogueGame } from "./DialogueGame";
import { QuizGame } from "./QuizGame";
import { BrainGame } from "./BrainGame";
import { MiniGame } from "./MiniGame";
import { LearningCards } from "./LearningCards";
import { QuizChoice } from "./QuizChoice";
import { useTraderRoadProgress } from "@/lib/trader-road-progress";

// ===== 区域定义 =====
interface MapArea {
  id: string;
  name: string;
  subtitle: string;
  levels: number[];
  color: string;
  colorLight: string;
  icon: string;
  bgGradient: string;
}

const MAP_AREAS: MapArea[] = [
  {
    id: "academy",
    name: "金融学院区",
    subtitle: "基础入门",
    levels: [1, 2, 3, 4],
    color: "#D97706",
    colorLight: "#FEF3C7",
    icon: "\u{1F393}",
    bgGradient: "from-amber-50 to-orange-50",
  },
  {
    id: "exchange",
    name: "交易所区",
    subtitle: "进阶实战",
    levels: [5, 6, 7],
    color: "#3B82F6",
    colorLight: "#DBEAFE",
    icon: "\u{1F3DB}\uFE0F",
    bgGradient: "from-blue-50 to-indigo-50",
  },
  {
    id: "valley",
    name: "风险山谷",
    subtitle: "高阶挑战",
    levels: [8, 9, 10],
    color: "#DC2626",
    colorLight: "#FEE2E2",
    icon: "\u{1F30B}",
    bgGradient: "from-red-50 to-rose-50",
  },
];

// ===== 关卡类型图标 =====
const TYPE_ICONS: Record<string, string> = {
  dialogue: "\u{1F4AC}",
  quiz: "\u{1F0CF}",
  brain: "\u{1F9E0}",
  minigame: "\u{26A1}",
  learning: "\u{1F4DA}",
  quiz_choice: "\u{270D}\uFE0F",
};

// ===== 根据关卡配置解析游戏数据 =====
function resolveGameData(levelId: number) {
  const config = getLevelConfig(levelId);
  if (!config) return null;

  switch (config.type) {
    case "dialogue":
      return { type: "dialogue" as const, data: DIALOGUE_DATA[levelId] };
    case "quiz":
      return { type: "quiz" as const, data: QUIZ_DATA[levelId] };
    case "brain":
      return { type: "brain" as const, data: BRAIN_DATA[levelId] };
    case "minigame":
      return { type: "minigame" as const, data: MINIGAME_DATA[levelId] };
    case "learning": {
      const indices = config.learningCardIndices ?? [];
      const cards = indices.map((i) => LEARNING_CARDS[i]).filter(Boolean);
      return { type: "learning" as const, data: cards };
    }
    case "quiz_choice": {
      const indices = config.quizQuestionIndices ?? [];
      const questions = indices.map((i) => QUIZ_QUESTIONS[i]).filter(Boolean);
      return { type: "quiz_choice" as const, data: questions };
    }
    default:
      return null;
  }
}

interface GameMapPlayerProps {
  initialLevelId?: number;
  onClose: () => void;
  onLevelComplete?: (levelId: number) => void;
}

export function GameMapPlayer({
  initialLevelId,
  onClose,
  onLevelComplete,
}: GameMapPlayerProps) {
  const { progress, addCoins } = useTraderRoadProgress();
  const [view, setView] = useState<"world" | "area" | "game">(
    initialLevelId ? "game" : "world"
  );
  const [currentAreaId, setCurrentAreaId] = useState<string | null>(null);
  const [activeLevelId, setActiveLevelId] = useState<number | null>(
    initialLevelId ?? null
  );
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");

  useEffect(() => {
    if (initialLevelId) {
      const area = MAP_AREAS.find((a) => a.levels.includes(initialLevelId));
      if (area) setCurrentAreaId(area.id);
    }
  }, [initialLevelId]);

  const currentArea = MAP_AREAS.find((a) => a.id === currentAreaId);

  const getLevelStatus = (levelId: number) => {
    const isCompleted = progress.completedLevels.includes(levelId);
    const isUnlocked =
      levelId === 1 || progress.completedLevels.includes(levelId - 1);
    return { isCompleted, isUnlocked };
  };

  const getAreaStatus = (area: MapArea) => {
    const completed = area.levels.filter(
      (l) => progress.completedLevels.includes(l)
    ).length;
    const isUnlocked =
      area.levels[0] === 1 ||
      progress.completedLevels.includes(area.levels[0] - 1);
    return { completed, total: area.levels.length, isUnlocked, isAllDone: completed === area.levels.length };
  };

  // ===== 世界地图视图 =====
  if (view === "world") {
    return (
      <div className="fixed inset-0 z-50 bg-black/30 flex items-end justify-center" onClick={onClose}>
        <div
          className="bg-white w-full max-w-[430px] rounded-t-3xl overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out]"
          style={{ height: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-lg font-bold text-[#1E293B]">金融华二街</h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">完成关卡，解锁 Agent 研究员</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-xl hover:bg-[#E2E8F0] transition-colors"
            >
              ×
            </button>
          </div>

          {/* 地图路径 SVG */}
          <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9]">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet">
              {/* 背景装饰 - 云朵 */}
              <circle cx="60" cy="80" r="30" fill="#E2E8F0" opacity="0.4" />
              <circle cx="90" cy="70" r="25" fill="#E2E8F0" opacity="0.3" />
              <circle cx="320" cy="120" r="35" fill="#E2E8F0" opacity="0.3" />
              <circle cx="350" cy="110" r="20" fill="#E2E8F0" opacity="0.4" />
              <circle cx="200" cy="500" r="40" fill="#E2E8F0" opacity="0.2" />

              {/* 连接路径 - 蜿蜒小路 */}
              <path
                d="M 200 130 Q 120 200 130 280 Q 140 340 200 370 Q 280 400 270 480"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="6"
                strokeDasharray="8 6"
                strokeLinecap="round"
              />
              {/* 路径光效 */}
              <path
                d="M 200 130 Q 120 200 130 280 Q 140 340 200 370 Q 280 400 270 480"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="4 12"
                strokeLinecap="round"
                opacity="0.4"
              >
                <animate attributeName="stroke-dashoffset" from="0" to="-32" dur="3s" repeatCount="indefinite" />
              </path>

              {/* 路径上的小圆点装饰 */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                const t = (i + 1) / 10;
                // Approximate positions along the path
                const positions = [
                  { x: 185, y: 165 },
                  { x: 155, y: 210 },
                  { x: 135, y: 250 },
                  { x: 133, y: 290 },
                  { x: 145, y: 330 },
                  { x: 170, y: 355 },
                  { x: 210, y: 370 },
                  { x: 250, y: 390 },
                  { x: 268, y: 430 },
                ];
                const pos = positions[i];
                return (
                  <circle
                    key={i}
                    cx={pos.x}
                    cy={pos.y}
                    r="3"
                    fill="#94A3B8"
                    opacity="0.5"
                  />
                );
              })}
            </svg>

            {/* 区域卡片 */}
            <div className="relative z-10 flex flex-col items-center gap-6 py-8 px-6 h-full justify-center">
              {MAP_AREAS.map((area, idx) => {
                const status = getAreaStatus(area);
                return (
                  <button
                    key={area.id}
                    onClick={() => {
                      if (!status.isUnlocked) return;
                      setSlideDir(idx > (MAP_AREAS.findIndex(a => a.id === currentAreaId) ?? -1) ? "right" : "left");
                      setCurrentAreaId(area.id);
                      setView("area");
                    }}
                    className="w-full max-w-[340px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ opacity: status.isUnlocked ? 1 : 0.5 }}
                  >
                    <div
                      className="rounded-2xl border-2 p-4 flex items-center gap-4 transition-all"
                      style={{
                        borderColor: status.isAllDone ? "#059669" : status.isUnlocked ? area.color : "#CBD5E1",
                        backgroundColor: status.isUnlocked ? area.colorLight : "#F8FAFC",
                        boxShadow: status.isUnlocked ? `0 4px 14px ${area.color}20` : "none",
                      }}
                    >
                      {/* 区域图标 */}
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{
                          backgroundColor: status.isUnlocked ? area.color : "#CBD5E1",
                          color: "white",
                        }}
                      >
                        {area.icon}
                      </div>

                      {/* 区域信息 */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1E293B]">{area.name}</span>
                          {status.isAllDone && (
                            <span className="w-5 h-5 rounded-full bg-[#059669] text-white text-[10px] flex items-center justify-center">✓</span>
                          )}
                          {!status.isUnlocked && (
                            <span className="text-xs">{"\u{1F512}"}</span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#64748B]">{area.subtitle} · 关卡 {area.levels[0]}-{area.levels[area.levels.length - 1]}</span>
                        {/* 进度条 */}
                        <div className="mt-2 h-1.5 rounded-full bg-white/60 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(status.completed / status.total) * 100}%`,
                              backgroundColor: area.color,
                            }}
                          />
                        </div>
                      </div>

                      {/* 进度数字 */}
                      <div className="text-right shrink-0">
                        <span className="text-lg font-bold" style={{ color: area.color }}>
                          {status.completed}
                        </span>
                        <span className="text-[11px] text-[#94A3B8]">/{status.total}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 底部 */}
          <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#FAFAF9] flex items-center justify-between">
            <span className="text-[11px] text-[#64748B]">
              总进度 {progress.completedLevels.length}/10 关
            </span>
            <span className="text-sm font-bold text-[#D97706]">
              {"\u{1FA99}"} {progress.coins} 炒币
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ===== 区域子地图视图 =====
  if (view === "area" && currentArea) {
    const areaLevels = currentArea.levels;

    return (
      <div className="fixed inset-0 z-50 bg-black/30 flex items-end justify-center" onClick={() => setView("world")}>
        <div
          className="bg-white w-full max-w-[430px] rounded-t-3xl overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out]"
          style={{ height: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <button
              onClick={() => setView("world")}
              className="flex items-center gap-1 text-sm text-[#3B82F6] font-medium hover:opacity-80"
            >
              ← 返回
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentArea.icon}</span>
              <h2 className="text-sm font-bold text-[#1E293B]">{currentArea.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-xl hover:bg-[#E2E8F0] transition-colors"
            >
              ×
            </button>
          </div>

          {/* 子地图 - 棋盘路径 */}
          <div className={`flex-1 relative overflow-hidden bg-gradient-to-b ${currentArea.bgGradient}`}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet">
              {/* 背景装饰 */}
              <circle cx="50" cy="100" r="60" fill={currentArea.color} opacity="0.04" />
              <circle cx="350" cy="400" r="80" fill={currentArea.color} opacity="0.04" />
              <circle cx="200" cy="550" r="50" fill={currentArea.color} opacity="0.03" />

              {/* 蜿蜒路径 */}
              {areaLevels.length > 1 && (() => {
                const nodePositions = areaLevels.map((_, i) => {
                  const total = areaLevels.length;
                  const yStart = 100;
                  const yEnd = 500;
                  const yStep = (yEnd - yStart) / (total - 1);
                  const y = yStart + i * yStep;
                  const x = i % 2 === 0 ? 130 : 270;
                  return { x, y };
                });

                let pathD = `M ${nodePositions[0].x} ${nodePositions[0].y}`;
                for (let i = 1; i < nodePositions.length; i++) {
                  const prev = nodePositions[i - 1];
                  const curr = nodePositions[i];
                  const midY = (prev.y + curr.y) / 2;
                  pathD += ` Q ${prev.x} ${midY} ${(prev.x + curr.x) / 2} ${midY} T ${curr.x} ${curr.y}`;
                }

                return (
                  <>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={currentArea.color}
                      strokeWidth="5"
                      strokeDasharray="10 6"
                      strokeLinecap="round"
                      opacity="0.25"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke={currentArea.color}
                      strokeWidth="2"
                      strokeDasharray="4 12"
                      strokeLinecap="round"
                      opacity="0.5"
                    >
                      <animate attributeName="stroke-dashoffset" from="0" to="-32" dur="2s" repeatCount="indefinite" />
                    </path>
                  </>
                );
              })()}
            </svg>

            {/* 关卡节点 */}
            <div className="relative z-10 flex flex-col items-center gap-8 py-10 px-6 h-full">
              {areaLevels.map((levelId, idx) => {
                const { isCompleted, isUnlocked } = getLevelStatus(levelId);
                const config = getLevelConfig(levelId);
                const total = areaLevels.length;
                const yPercent = 15 + (idx / Math.max(total - 1, 1)) * 70;
                const xPercent = idx % 2 === 0 ? 28 : 68;

                return (
                  <button
                    key={levelId}
                    onClick={() => {
                      if (!isUnlocked) return;
                      setActiveLevelId(levelId);
                      setView("game");
                    }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-transform hover:scale-110 active:scale-95"
                    style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                  >
                    {/* 脉冲动画 */}
                    {isUnlocked && !isCompleted && (
                      <span
                        className="absolute w-14 h-14 rounded-full animate-ping opacity-15"
                        style={{ backgroundColor: currentArea.color }}
                      />
                    )}

                    {/* 节点圆圈 */}
                    <div
                      className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-[3px] transition-all"
                      style={{
                        backgroundColor: isCompleted ? "#059669" : isUnlocked ? currentArea.color : "#CBD5E1",
                        borderColor: "white",
                      }}
                    >
                      {isCompleted ? (
                        <span className="text-white text-lg font-bold">✓</span>
                      ) : isUnlocked ? (
                        <span className="text-white text-base">{TYPE_ICONS[config?.type || ""] || levelId}</span>
                      ) : (
                        <span className="text-white/60 text-sm">{"\u{1F512}"}</span>
                      )}
                    </div>

                    {/* 关卡标签 */}
                    <div
                      className="mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-sm"
                      style={{
                        backgroundColor: isCompleted ? "#059669" : isUnlocked ? currentArea.color : "#CBD5E1",
                        color: "white",
                      }}
                    >
                      {config?.title || `关卡${levelId}`}
                    </div>

                    {/* 玩法标签 */}
                    {isUnlocked && (
                      <span className="text-[9px] text-[#94A3B8] mt-0.5">
                        {config?.type === "learning" ? "知识学习" : config?.type === "quiz_choice" ? "答题闯关" : config?.type === "dialogue" ? "对话闯关" : config?.type === "quiz" ? "知识翻牌" : config?.type === "brain" ? "脑力配对" : "快速反应"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 底部区域切换 */}
          <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#FAFAF9]">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {MAP_AREAS.map((area) => {
                  const isActive = area.id === currentAreaId;
                  return (
                    <button
                      key={area.id}
                      onClick={() => {
                        if (area.id === currentAreaId) return;
                        setSlideDir(MAP_AREAS.indexOf(area) > MAP_AREAS.indexOf(currentArea) ? "right" : "left");
                        setCurrentAreaId(area.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                      style={{
                        backgroundColor: isActive ? area.color : "#E2E8F0",
                        color: isActive ? "white" : "#64748B",
                      }}
                    >
                      <span>{area.icon}</span>
                      <span>{area.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== 游戏视图 =====
  if (view === "game" && activeLevelId) {
    const config = getLevelConfig(activeLevelId);
    const gameData = resolveGameData(activeLevelId);
    if (!config || !gameData) return null;

    const handleStandardComplete = (passed: boolean) => {
      if (passed) {
        addCoins(10);
        onLevelComplete?.(activeLevelId);
      }
      setView("area");
      setActiveLevelId(null);
    };

    const handleLearningComplete = () => {
      addCoins(20);
      onLevelComplete?.(activeLevelId);
      setView("area");
      setActiveLevelId(null);
    };

    const handleQuizChoiceComplete = () => {
      addCoins(20);
      onLevelComplete?.(activeLevelId);
      setView("area");
      setActiveLevelId(null);
    };

    const areaForLevel = MAP_AREAS.find((a) => a.levels.includes(activeLevelId));

    return (
      <div className="fixed inset-0 z-[60] bg-black/30 flex items-end justify-center">
        <div
          className="bg-white w-full max-w-[430px] rounded-t-3xl overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out]"
          style={{ height: "92vh" }}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <button
              onClick={() => {
                setView("area");
                setActiveLevelId(null);
              }}
              className="flex items-center gap-1 text-sm text-[#3B82F6] font-medium hover:opacity-80"
            >
              ← 返回地图
            </button>
            <div className="flex items-center gap-2">
              {areaForLevel && <span className="text-base">{areaForLevel.icon}</span>}
              <h2 className="text-sm font-bold text-[#1E293B]">
                第{activeLevelId}关 · {config.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-xl hover:bg-[#E2E8F0] transition-colors"
            >
              ×
            </button>
          </div>

          {/* 游戏内容 */}
          <div className="flex-1 overflow-y-auto">
            {gameData.type === "dialogue" && (
              <DialogueGame data={gameData.data} onComplete={handleStandardComplete} />
            )}
            {gameData.type === "quiz" && (
              <QuizGame data={gameData.data} onComplete={handleStandardComplete} />
            )}
            {gameData.type === "brain" && (
              <BrainGame data={gameData.data} onComplete={handleStandardComplete} />
            )}
            {gameData.type === "minigame" && (
              <MiniGame data={gameData.data} onComplete={handleStandardComplete} />
            )}
            {gameData.type === "learning" && config.learningCardIndices && (
              <LearningCards
                cardIndices={config.learningCardIndices}
                learnedCards={progress.learnedCards}
                onCardLearned={() => {}}
                onComplete={handleLearningComplete}
                onClose={() => { setView("area"); setActiveLevelId(null); }}
              />
            )}
            {gameData.type === "quiz_choice" && config.quizQuestionIndices && (
              <QuizChoice
                questionIndices={config.quizQuestionIndices}
                correctQuizIds={progress.correctQuizIds}
                onQuizCorrect={() => {}}
                onComplete={handleQuizChoiceComplete}
                onClose={() => { setView("area"); setActiveLevelId(null); }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
