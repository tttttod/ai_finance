"use client";

import { useState, useCallback, useEffect } from "react";
import { LogOut } from "lucide-react";
import { getLevelConfig, GAME_MAP_LEVELS } from "./game-data";
import { DIALOGUE_DATA } from "./dialogue-data";
import { QUIZ_DATA } from "./quiz-data";
import { BRAIN_DATA } from "./brain-data";
import { MINIGAME_DATA } from "./minigame-data";
import { DialogueGame } from "./DialogueGame";
import { QuizGame } from "./QuizGame";
import { BrainGame } from "./BrainGame";
import { MiniGame } from "./MiniGame";
import { LearningCards } from "./LearningCards";
import { QuizChoice } from "./QuizChoice";
import {
  loadTraderRoadProgress,
  saveTraderRoadProgress,
  type TraderRoadAgentId,
} from "@/lib/trader-road-progress";

// ===== Zone definitions =====
interface MapZone {
  id: number;
  name: string;
  subtitle: string;
  image: string;
  color: string;
  colorLight: string;
  levels: number[];
  // Marker positions as percentages of image (x%, y%)
  markers: { levelId: number; x: number; y: number }[];
}

const MAP_ZONES: MapZone[] = [
  {
    id: 1,
    name: "金融学院区",
    subtitle: "Financial Academy",
    image: "/map-zone-1-v2.jpeg",
    color: "#D97706",
    colorLight: "#FEF3C7",
    levels: [1, 2, 3, 4],
    markers: [
      { levelId: 1, x: 55, y: 78 }, // Market Pier - 底部岛屿中心
      { levelId: 2, x: 50, y: 58 }, // Data Bazaar - 中下岛屿中心
      { levelId: 3, x: 45, y: 40 }, // Market Storm - 中上岛屿中心
      { levelId: 4, x: 55, y: 25 }, // Policy Crossroads - 顶部岛屿中心
    ],
  },
  {
    id: 2,
    name: "交易所区",
    subtitle: "Exchange District",
    image: "/map-zone-2-v2.jpeg",
    color: "#3B82F6",
    colorLight: "#DBEAFE",
    levels: [5, 6, 7],
    markers: [
      { levelId: 5, x: 15, y: 65 },
      { levelId: 6, x: 48, y: 45 },
      { levelId: 7, x: 80, y: 30 },
    ],
  },
  {
    id: 3,
    name: "风险山谷",
    subtitle: "Risk Valley",
    image: "/map-zone-3-v2.jpeg",
    color: "#DC2626",
    colorLight: "#FEE2E2",
    levels: [8, 9, 10],
    markers: [
      { levelId: 8, x: 15, y: 60 },
      { levelId: 9, x: 48, y: 40 },
      { levelId: 10, x: 82, y: 25 },
    ],
  },
];

// World map location hotspots (percentages of image)
interface WorldLocation {
  id: number;
  levelId: number;
  name: string;
  subtitle: string;
  x: number;
  y: number;
}

const WORLD_LOCATIONS: WorldLocation[] = [
  { id: 1, levelId: 1, name: "金融知识入港口", subtitle: "Knowledge Entrance", x: 50, y: 92 },
  { id: 2, levelId: 2, name: "市场天气谷", subtitle: "Market Weather Station", x: 15, y: 55 },
  { id: 3, levelId: 3, name: "信息迷雾群岛", subtitle: "Info Mist Archipelago", x: 22, y: 18 },
  { id: 4, levelId: 4, name: "证据岔路口", subtitle: "Evidence Crossroads", x: 50, y: 8 },
  { id: 5, levelId: 5, name: "风险护盾桥", subtitle: "Risk-Shield Bridge", x: 75, y: 62 },
  { id: 6, levelId: 6, name: "情绪峡谷", subtitle: "Emotion Gorge", x: 38, y: 42 },
  { id: 7, levelId: 7, name: "财报考古遗迹", subtitle: "Financial-Report Ruins", x: 78, y: 15 },
  { id: 8, levelId: 8, name: "热点火山", subtitle: "Hotspot Volcano", x: 80, y: 32 },
  { id: 9, levelId: 9, name: "模型沼泽", subtitle: "Model Swamp", x: 50, y: 65 },
  { id: 10, levelId: 10, name: "验证灯塔", subtitle: "Verification Lighthouse", x: 20, y: 75 },
  { id: 11, levelId: 1, name: "复盘营地", subtitle: "Review Camp", x: 58, y: 85 },
  { id: 12, levelId: 3, name: "脑力训练场", subtitle: "Brain Training Ground", x: 82, y: 48 },
];

// ===== Props =====
export interface GameMapPlayerProps {
  initialLevelId: number | null;
  onClose: () => void;
  onLevelComplete?: (levelId: number) => void;
}

// ===== Main Component =====
export function GameMapPlayer({
  initialLevelId,
  onClose,
  onLevelComplete,
}: GameMapPlayerProps) {
  // 始终从世界地图开始，initialLevelId 仅用于高亮提示
  const [view, setView] = useState<"world" | "zone" | "game">("world");
  const [activeZoneId, setActiveZoneId] = useState<number | null>(null);
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
  const [hoveredWorldLoc, setHoveredWorldLoc] = useState<number | null>(null);
  const [clickedWorldLoc, setClickedWorldLoc] = useState<number | null>(null);
  const [progress, setProgress] = useState(() => loadTraderRoadProgress());

  // Start from world map view
  useEffect(() => {
    // Just ensure we start at world view
  }, []);

  useEffect(() => {
    saveTraderRoadProgress(progress);
  }, [progress]);

  const addCoins = useCallback(
    (amount: number) => {
      setProgress((prev) => ({ ...prev, coins: prev.coins + amount }));
    },
    []
  );

  const handleLevelComplete = useCallback(
    (levelId: number) => {
      if (progress.completedLevels.includes(levelId)) return;
      const config = getLevelConfig(levelId);
      if (!config) return;

      // 去重并排序
      const newCompleted = [...new Set([...progress.completedLevels, levelId])].sort((a, b) => a - b);

      // 去重解锁 Agent
      const newAgents = [...progress.unlockedAgents];
      if (config.unlockAgents) {
        for (const agent of config.unlockAgents) {
          if (!newAgents.includes(agent as TraderRoadAgentId)) {
            newAgents.push(agent as TraderRoadAgentId);
          }
        }
      }

      // 清理当前关卡失败次数
      const newFailCounts = { ...progress.levelFailCounts };
      delete newFailCounts[String(levelId)];

      const newProgress = {
        ...progress,
        completedLevels: newCompleted,
        unlockedAgents: newAgents,
        currentLevel: Math.max(progress.currentLevel, levelId + 1),
        levelFailCounts: newFailCounts,
      };

      // 同步保存到 localStorage，确保父组件回调时能读到最新进度
      const savedProgress = saveTraderRoadProgress(newProgress);
      setProgress(savedProgress);
      onLevelComplete?.(levelId);
    },
    [progress, onLevelComplete]
  );

  const getLevelStatus = useCallback(
    (levelId: number): "completed" | "available" | "locked" => {
      if (progress.completedLevels.includes(levelId)) return "completed";
      if (levelId === 1) return "available";
      if (progress.completedLevels.includes(levelId - 1)) return "available";
      return "locked";
    },
    [progress]
  );

  const getZoneProgress = useCallback(
    (zoneId: number) => {
      const zone = MAP_ZONES.find((z) => z.id === zoneId);
      if (!zone) return { done: 0, total: 0 };
      const done = zone.levels.filter((l) =>
        progress.completedLevels.includes(l)
      ).length;
      return { done, total: zone.levels.length };
    },
    [progress]
  );

  const isZoneUnlocked = useCallback(
    (zoneId: number) => {
      if (zoneId === 1) return true;
      const prevZone = MAP_ZONES.find((z) => z.id === zoneId - 1);
      if (!prevZone) return false;
      return prevZone.levels.some((l) =>
        progress.completedLevels.includes(l)
      );
    },
    [progress]
  );

  // ===== Render: World Map (Vintage Treasure Map Style) =====
  const renderWorldMap = () => {
    return (
    <div className="relative w-full flex-1 min-h-0 overflow-hidden">
      {/* Adventure map background image */}
      <img
        src="/map-world-adventure.jpeg"
        alt="金融华尔界世界地图"
        className="w-full h-full object-contain"
        draggable={false}
      />
      {/* Dark overlay when hovering a location */}
      {hoveredWorldLoc !== null && (
        <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 pointer-events-none" />
      )}
      {/* Location hotspots with micro-interactions */}
      {WORLD_LOCATIONS.map((loc) => {
        const status = getLevelStatus(loc.levelId);
        const isHovered = hoveredWorldLoc === loc.id;
        const isClicked = clickedWorldLoc === loc.id;
        const isAvailable = status === "available" || status === "completed";

        return (
          <button
            key={loc.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out group"
            style={{
              left: `${loc.x}%`,
              top: `${loc.y}%`,
              transform: `translate(-50%, -50%) ${isHovered ? "translateY(-8px)" : ""} ${isClicked ? "scale(1.05)" : "scale(1)"}`,
              zIndex: isHovered ? 50 : 10,
            }}
            onClick={() => {
              if (isAvailable) {
                setClickedWorldLoc(loc.id);
                setTimeout(() => {
                  setClickedWorldLoc(null);
                  setActiveLevelId(loc.levelId);
                  setView("game");
                }, 300);
              }
            }}
            onMouseEnter={() => setHoveredWorldLoc(loc.id)}
            onMouseLeave={() => {
              setHoveredWorldLoc(null);
              setClickedWorldLoc(null);
            }}
          >
            {/* Golden sparkle glint - default blinking */}
            {isAvailable && (
              <span
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                style={{
                  background: "radial-gradient(circle, #FFD700 0%, #DAA520 50%, transparent 100%)",
                  boxShadow: "0 0 6px 2px rgba(218, 165, 32, 0.6)",
                  animationDuration: "2s",
                }}
              />
            )}
            {/* Warm gold outer glow on hover */}
            {isHovered && isAvailable && (
              <span
                className="absolute rounded-full transition-all duration-300"
                style={{
                  width: 52,
                  height: 52,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(circle, rgba(218, 165, 32, 0.5) 0%, rgba(218, 165, 32, 0.2) 50%, transparent 100%)",
                  boxShadow: "0 0 20px 8px rgba(218, 165, 32, 0.4)",
                }}
              />
            )}
            {/* Main location marker */}
            <span
              className="relative flex items-center justify-center rounded-full transition-all duration-300"
              style={{
                width: 36,
                height: 36,
                backgroundColor: status === "completed" ? "#059669" : isAvailable ? "#DAA520" : "#94A3B8",
                border: "2px solid rgba(255, 248, 220, 0.8)",
                boxShadow: isHovered && isAvailable
                  ? "0 0 16px 4px rgba(218, 165, 32, 0.6), 0 4px 8px rgba(0,0,0,0.3)"
                  : "0 2px 4px rgba(0,0,0,0.2)",
                opacity: isAvailable ? 1 : 0.5,
              }}
            >
              {status === "completed" ? (
                <span className="text-white text-sm font-bold">✓</span>
              ) : isAvailable ? (
                <span className="text-white text-xs font-bold">{loc.levelId}</span>
              ) : (
                <span className="text-white text-xs">🔒</span>
              )}
            </span>
            {/* Location name tooltip on hover */}
            {isHovered && isAvailable && (
              <div
                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, #F5E6C8 0%, #E8D5A8 100%)",
                  border: "1px solid #8B7355",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                <p className="text-xs font-bold text-[#3D2B1F]" style={{ fontFamily: "serif" }}>
                  {loc.name}
                </p>
                <p className="text-[9px] text-[#6B5B4B] italic">
                  {loc.subtitle}
                </p>
                {status === "available" && (
                  <p className="text-[9px] font-semibold text-[#8B4513] mt-0.5">
                    点击开始挑战 →
                  </p>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
  };

  // ===== Render: Zone Map =====
  const renderZoneMap = () => {
    const zone = MAP_ZONES.find((z) => z.id === activeZoneId);
    if (!zone) return null;

    return (
      <div className="relative w-full h-full">
        <img
          src={zone.image}
          alt={zone.name}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {/* Level markers - 多巴胺风格 */}
        {zone.markers.map((marker) => {
          const status = getLevelStatus(marker.levelId);
          const config = getLevelConfig(marker.levelId);
          const isHovered = hoveredMarker === marker.levelId;

          // 多巴胺配色：每个关卡一个荧光色
          const dopamineColors: Record<string, { bg: string; glow: string; emoji: string }> = {
            "1": { bg: "#FF6B35", glow: "rgba(255, 107, 53, 0.5)", emoji: "🎯" }, // 荧光橙
            "2": { bg: "#00D4FF", glow: "rgba(0, 212, 255, 0.5)", emoji: "📚" }, // 荧光蓝
            "3": { bg: "#FFD93D", glow: "rgba(255, 217, 61, 0.5)", emoji: "" }, // 荧光黄
            "4": { bg: "#00FF88", glow: "rgba(0, 255, 136, 0.5)", emoji: "🔍" }, // 荧光绿
          };
          const colorInfo = dopamineColors[String(marker.levelId)] || { bg: zone.color, glow: "rgba(59, 130, 246, 0.5)", emoji: "🎮" };

          return (
            <button
              key={marker.levelId}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
              style={{
                left: `${marker.x}%`,
                top: `${marker.y}%`,
              }}
              onClick={() => {
                if (status !== "locked") {
                  setActiveLevelId(marker.levelId);
                  setView("game");
                }
              }}
              onMouseEnter={() => setHoveredMarker(marker.levelId)}
              onMouseLeave={() => setHoveredMarker(null)}
            >
              {/* 弹跳动画 for available */}
              {status === "available" && (
                <span className="absolute inset-0 animate-bounce" style={{ animationDuration: "2s" }}>
                  <span
                    className="absolute inset-0 rounded-full opacity-40"
                    style={{ backgroundColor: colorInfo.glow, filter: "blur(8px)" }}
                  />
                </span>
              )}
              {/* 脉冲光环 for available */}
              {status === "available" && (
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-40"
                  style={{ backgroundColor: colorInfo.bg }}
                />
              )}
              {/* 外圈发光 */}
              <span
                className="absolute rounded-full transition-all duration-300"
                style={{
                  width: isHovered ? 68 : 60,
                  height: isHovered ? 68 : 60,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: colorInfo.glow,
                  filter: "blur(6px)",
                  opacity: status === "locked" ? 0.3 : 0.6,
                }}
              />
              {/* 主按钮 */}
              <span
                className="relative flex items-center justify-center rounded-full shadow-lg transition-all duration-300"
                style={{
                  width: isHovered ? 60 : 52,
                  height: isHovered ? 60 : 52,
                  backgroundColor: status === "completed" ? "#059669" : status === "locked" ? "#94A3B8" : colorInfo.bg,
                  border: "3px solid white",
                  boxShadow: status === "locked" ? "none" : `0 0 20px ${colorInfo.glow}, 0 4px 12px rgba(0,0,0,0.2)`,
                  opacity: status === "locked" ? 0.5 : 1,
                }}
              >
                {status === "completed" ? (
                  <span className="text-white text-xl drop-shadow-md">✓</span>
                ) : status === "locked" ? (
                  <span className="text-white text-lg">🔒</span>
                ) : (
                  <span className="text-2xl drop-shadow-md">{colorInfo.emoji}</span>
                )}
              </span>
              {/* 关卡数字标签 */}
              {status !== "locked" && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white rounded-full px-2 py-0.5 shadow-md border-2 font-black text-[10px]"
                  style={{
                    borderColor: status === "completed" ? "#059669" : colorInfo.bg,
                    color: status === "completed" ? "#059669" : colorInfo.bg,
                  }}
                >
                  Lv.{marker.levelId}
                </span>
              )}
              {/* Tooltip */}
              {isHovered && status !== "locked" && config && (
                <div
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border-2 px-4 py-2.5 whitespace-nowrap z-50"
                  style={{ borderColor: colorInfo.bg }}
                >
                  <p className="text-sm font-black text-[#1E293B]">
                    {colorInfo.emoji} 第{marker.levelId}关：{config.title}
                  </p>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    {config.type === "dialogue" ? "🎭 对话闯关" : config.type === "quiz" ? "🃏 知识翻牌" : config.type === "brain" ? "🧠 脑力配对" : " 快速反应"}
                  </p>
                  {status === "available" && (
                    <p
                      className="text-[10px] font-bold mt-1"
                      style={{ color: colorInfo.bg }}
                    >
                      点击开始挑战 →
                    </p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // ===== Render: Game =====
  const renderGame = () => {
    if (!activeLevelId) return null;
    const config = getLevelConfig(activeLevelId);
    if (!config) return null;
    const zone = MAP_ZONES.find((z) => z.levels.includes(activeLevelId));

    return (
      <div className="flex flex-col h-full">
        {/* Game header */}
        <div className="flex items-center gap-2 mb-3 px-1">
          {zone && (
            <span
              className="text-lg"
              style={{ filter: "grayscale(0)" }}
            >
              {zone.id === 1 ? "🏫" : zone.id === 2 ? "🏛️" : "🌋"}
            </span>
          )}
          <h3 className="text-sm font-bold text-[#1E293B]">
            第{activeLevelId}关：{config.title}
          </h3>
          <span className="text-[10px] text-[#64748B] ml-auto">
            {config.type === "learning" ? "知识学习" : config.type === "quiz_choice" ? "答题闯关" : config.type === "dialogue" ? "对话闯关" : config.type === "quiz" ? "知识翻牌" : config.type === "brain" ? "脑力配对" : "快速反应"}
          </span>
        </div>
        {/* Game content */}
        <div className="flex-1 min-h-0">
          {config.type === "dialogue" && (
            <DialogueGame
              data={DIALOGUE_DATA[activeLevelId]}
              onComplete={(passed) => {
                if (passed) {
                  handleLevelComplete(activeLevelId);
                  setView("zone");
                  setActiveLevelId(null);
                } else {
                  // 失败时不解锁，回到 zone 让玩家重新尝试
                  setView("zone");
                  setActiveLevelId(null);
                }
              }}
            />
          )}
          {config.type === "quiz" && (
            <QuizGame
              data={QUIZ_DATA[activeLevelId]}
              onComplete={() => {
                handleLevelComplete(activeLevelId);
                setView("zone");
                setActiveLevelId(null);
              }}
            />
          )}
          {config.type === "brain" && (
            <BrainGame
              data={BRAIN_DATA[activeLevelId]}
              onComplete={() => {
                handleLevelComplete(activeLevelId);
                setView("zone");
                setActiveLevelId(null);
              }}
            />
          )}
          {config.type === "minigame" && (
            <MiniGame
              data={MINIGAME_DATA[activeLevelId]}
              onComplete={() => {
                handleLevelComplete(activeLevelId);
                setView("zone");
                setActiveLevelId(null);
              }}
            />
          )}
          {config.type === "learning" && config.learningCardIndices && (
            <LearningCards
              cardIndices={config.learningCardIndices}
              learnedCards={progress.learnedCards}
              onCardLearned={() => {}}
              onComplete={() => {
                addCoins(20);
                handleLevelComplete(activeLevelId);
                setView("zone");
                setActiveLevelId(null);
              }}
              onClose={() => {
                setView("zone");
                setActiveLevelId(null);
              }}
            />
          )}
          {config.type === "quiz_choice" && config.quizQuestionIndices && (
            <QuizChoice
              questionIndices={config.quizQuestionIndices}
              correctQuizIds={progress.correctQuizIds}
              onQuizCorrect={() => {}}
              onComplete={() => {
                addCoins(20);
                handleLevelComplete(activeLevelId);
                setView("zone");
                setActiveLevelId(null);
              }}
              onClose={() => {
                setView("zone");
                setActiveLevelId(null);
              }}
            />
          )}
        </div>
      </div>
    );
  };

  // ===== Main Render =====
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* 9:16 Panel */}
      <div className="relative bg-[#F5F5F7] w-full h-full max-w-[min(100vw,56.25vh)] max-h-[min(100vh,177.78vw)] overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b rounded-t-3xl transition-all duration-300"
          style={
            view === "world"
              ? {
                  background: "linear-gradient(135deg, #F5E6C8 0%, #E8D5A8 100%)",
                  borderColor: "#8B7355",
                }
              : {
                  backgroundColor: "white",
                  borderColor: "#E2E8F0",
                }
          }
        >
          <div className="flex items-center gap-2">
            {view !== "world" && (
              <button
                onClick={() => {
                  if (view === "game") setView("zone");
                  else setView("world");
                }}
                className="w-7 h-7 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0] transition-colors text-sm"
              >
                ←
              </button>
            )}
            <h2
              className="text-base font-bold"
              style={
                view === "world"
                  ? { color: "#3D2B1F", fontFamily: "serif" }
                  : { color: "#1E293B" }
              }
            >
              {view === "world"
                ? "金融华尔界"
                : view === "zone"
                ? MAP_ZONES.find((z) => z.id === activeZoneId)?.name ?? ""
                : `第${activeLevelId}关`}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#D97706]">
              🪙 {progress.coins}
            </span>
            <button
              onClick={onClose}
              aria-label="退出"
              title="退出"
              className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-[#475569] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-all duration-200"
            >
              <LogOut className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto ${view === "world" ? "p-0" : "p-4"}`}>
          {view === "world" && renderWorldMap()}
          {view === "zone" && renderZoneMap()}
          {view === "game" && renderGame()}
        </div>

        {/* Zone nav bar (zone view) */}
        {view === "zone" && (
          <div className="flex items-center gap-2 px-4 py-2 border-t border-[#E2E8F0] bg-white rounded-b-3xl">
            {MAP_ZONES.map((z) => {
              const zp = getZoneProgress(z.id);
              const unlocked = isZoneUnlocked(z.id);
              const isActive = z.id === activeZoneId;
              return (
                <button
                  key={z.id}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                    isActive
                      ? "text-white shadow-sm"
                      : unlocked
                      ? "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                      : "bg-[#F8FAFC] text-[#CBD5E1] cursor-not-allowed"
                  }`}
                  style={
                    isActive ? { backgroundColor: z.color } : undefined
                  }
                  onClick={() => {
                    if (unlocked) setActiveZoneId(z.id);
                  }}
                  disabled={!unlocked}
                >
                  {z.name} {zp.done}/{zp.total}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default GameMapPlayer;
