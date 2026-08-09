"use client";

import { useState, useRef, useEffect } from "react";
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

// ===== 世界地图区域定义 =====
interface MapArea {
  id: string;
  name: string;
  subtitle: string;
  levels: number[];
  color: string;
  icon: string;
}

const MAP_AREAS: MapArea[] = [
  {
    id: "academy",
    name: "金融学院区",
    subtitle: "基础入门 · 关卡 1-4",
    levels: [1, 2, 3, 4],
    color: "#D97706",
    icon: "",
  },
  {
    id: "exchange",
    name: "交易所区",
    subtitle: "进阶实战 · 关卡 5-7",
    levels: [5, 6, 7],
    color: "#3B82F6",
    icon: "\u{1F3DB}\uFE0F",
  },
  {
    id: "valley",
    name: "风险山谷",
    subtitle: "高阶挑战 · 关卡 8-10",
    levels: [8, 9, 10],
    color: "#DC2626",
    icon: "\u{1F30B}",
  },
];

// ===== 世界地图上区域点击热区（百分比坐标） =====
const AREA_HOTSPOTS: Record<string, { x: number; y: number }> = {
  academy: { x: 22, y: 40 },
  exchange: { x: 50, y: 50 },
  valley: { x: 78, y: 40 },
};

// ===== 子地图关卡标记点（百分比坐标） =====
const LEVEL_HOTSPOTS: Record<number, { x: number; y: number }> = {
  1: { x: 15, y: 75 },
  2: { x: 30, y: 55 },
  3: { x: 50, y: 45 },
  4: { x: 70, y: 35 },
  5: { x: 20, y: 65 },
  6: { x: 45, y: 50 },
  7: { x: 72, y: 40 },
  8: { x: 18, y: 60 },
  9: { x: 48, y: 45 },
  10: { x: 78, y: 30 },
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

  // 如果有初始关卡，自动定位到对应区域
  useEffect(() => {
    if (initialLevelId) {
      const area = MAP_AREAS.find((a) => a.levels.includes(initialLevelId));
      if (area) {
        setCurrentAreaId(area.id);
      }
    }
  }, [initialLevelId]);

  const currentArea = MAP_AREAS.find((a) => a.id === currentAreaId);

  // ===== 世界地图视图 =====
  if (view === "world") {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
        <div
          className="bg-white w-full max-w-[430px] rounded-t-3xl overflow-hidden flex flex-col"
          style={{ height: "92vh" }}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
            <h2 className="text-base font-bold text-[#1E293B]">金融华二街</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-lg"
            >
              ×
            </button>
          </div>

          {/* 世界地图 */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="/map-world.jpeg"
              alt="金融华二街世界地图"
              className="w-full h-full object-cover"
            />

            {/* 区域热区按钮 */}
            {MAP_AREAS.map((area) => {
              const pos = AREA_HOTSPOTS[area.id];
              const areaLevels = area.levels;
              const completedCount = areaLevels.filter((l) =>
                progress.completedLevels.includes(l)
              ).length;
              const isUnlocked =
                areaLevels[0] === 1 ||
                progress.completedLevels.includes(areaLevels[0] - 1);
              const isAllComplete = completedCount === areaLevels.length;

              return (
                <button
                  key={area.id}
                  onClick={() => {
                    if (!isUnlocked) return;
                    setCurrentAreaId(area.id);
                    setView("area");
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  {isUnlocked && !isAllComplete && (
                    <span
                      className="absolute w-16 h-16 rounded-full animate-ping opacity-20"
                      style={{ backgroundColor: area.color }}
                    />
                  )}
                  <span
                    className="relative w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 transition-transform hover:scale-110 active:scale-95"
                    style={{
                      backgroundColor: isUnlocked ? area.color : "#94A3B8",
                      borderColor: isAllComplete ? "#059669" : "white",
                      opacity: isUnlocked ? 1 : 0.5,
                    }}
                  >
                    {area.icon}
                    {isAllComplete && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#059669] text-white text-[9px] flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </span>
                  <span
                    className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{
                      color: isUnlocked ? area.color : "#94A3B8",
                      backgroundColor: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {area.name}
                  </span>
                  <span className="text-[9px] text-[#64748B] mt-0.5">
                    {completedCount}/{areaLevels.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 底部信息 */}
          <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#FAFAF9]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#64748B]">
                点击区域进入子地图
              </span>
              <span className="text-xs font-bold text-[#D97706]">
                {"\u{1FA99}"} {progress.coins} 炒币
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== 区域子地图视图 =====
  if (view === "area" && currentArea) {
    const areaLevels = currentArea.levels;
    const areaMapImages: Record<string, string> = {
      academy: "/map-area-1.jpeg",
      exchange: "/map-area-2.jpeg",
      valley: "/map-area-3.jpeg",
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
        <div
          className="bg-white w-full max-w-[430px] rounded-t-3xl overflow-hidden flex flex-col"
          style={{ height: "92vh" }}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
            <button
              onClick={() => setView("world")}
              className="flex items-center gap-1 text-sm text-[#3B82F6] font-medium"
            >
              ← 世界地图
            </button>
            <h2 className="text-sm font-bold text-[#1E293B]">
              {currentArea.icon} {currentArea.name}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-lg"
            >
              ×
            </button>
          </div>

          {/* 子地图图片 + 关卡标记 */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src={areaMapImages[currentArea.id] || "/map-area-1.jpeg"}
              alt={currentArea.name}
              className="w-full h-full object-cover"
            />

            {/* 关卡标记点 */}
            {areaLevels.map((levelId) => {
              const pos = LEVEL_HOTSPOTS[levelId];
              if (!pos) return null;
              const isCompleted = progress.completedLevels.includes(levelId);
              const isUnlocked =
                levelId === 1 ||
                progress.completedLevels.includes(levelId - 1);
              const config = getLevelConfig(levelId);

              return (
                <button
                  key={levelId}
                  onClick={() => {
                    if (!isUnlocked) return;
                    setActiveLevelId(levelId);
                    setView("game");
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  {isUnlocked && !isCompleted && (
                    <span className="absolute w-12 h-12 rounded-full bg-[#3B82F6] animate-ping opacity-20" />
                  )}
                  <span
                    className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md border-2 transition-transform hover:scale-110 active:scale-95"
                    style={{
                      backgroundColor: isCompleted
                        ? "#059669"
                        : isUnlocked
                        ? "#3B82F6"
                        : "#94A3B8",
                      borderColor: "white",
                      color: "white",
                      opacity: isUnlocked ? 1 : 0.6,
                    }}
                  >
                    {isCompleted ? "✓" : isUnlocked ? levelId : ""}
                  </span>
                  <span className="mt-1 text-[9px] font-medium text-white bg-black/40 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {config?.title || `关卡${levelId}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 底部区域导航 */}
          <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#FAFAF9]">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {MAP_AREAS.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => setCurrentAreaId(area.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
                    style={{
                      backgroundColor:
                        area.id === currentAreaId ? area.color : "#E2E8F0",
                      color:
                        area.id === currentAreaId ? "white" : "#64748B",
                    }}
                  >
                    {area.icon}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-[#64748B]">
                {currentArea.subtitle}
              </span>
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

    return (
      <div className="fixed inset-0 z-[60] bg-black/30 flex items-end justify-center">
        <div
          className="bg-white w-full max-w-[430px] rounded-t-3xl overflow-hidden flex flex-col"
          style={{ height: "92vh" }}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
            <button
              onClick={() => {
                setView("area");
                setActiveLevelId(null);
              }}
              className="flex items-center gap-1 text-sm text-[#3B82F6] font-medium"
            >
              ← 返回地图
            </button>
            <h2 className="text-sm font-bold text-[#1E293B]">
              第{activeLevelId}关 · {config.title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-lg"
            >
              ×
            </button>
          </div>

          {/* 游戏内容 */}
          <div className="flex-1 overflow-y-auto">
            {gameData.type === "dialogue" && (
              <DialogueGame
                data={gameData.data}
                onComplete={handleStandardComplete}
              />
            )}
            {gameData.type === "quiz" && (
              <QuizGame
                data={gameData.data}
                onComplete={handleStandardComplete}
              />
            )}
            {gameData.type === "brain" && (
              <BrainGame
                data={gameData.data}
                onComplete={handleStandardComplete}
              />
            )}
            {gameData.type === "minigame" && (
              <MiniGame
                data={gameData.data}
                onComplete={handleStandardComplete}
              />
            )}
            {gameData.type === "learning" && config.learningCardIndices && (
              <LearningCards
                cardIndices={config.learningCardIndices}
                learnedCards={progress.learnedCards}
                onCardLearned={(cardIndex: number) => {}}
                onComplete={handleLearningComplete}
                onClose={() => { setView("area"); setActiveLevelId(null); }}
              />
            )}
            {gameData.type === "quiz_choice" && config.quizQuestionIndices && (
              <QuizChoice
                questionIndices={config.quizQuestionIndices}
                correctQuizIds={progress.correctQuizIds}
                onQuizCorrect={(questionIndex: number) => {}}
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
