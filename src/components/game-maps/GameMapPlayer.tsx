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
  { id: 1, levelId: 1, name: "金融知识入港口", subtitle: "Knowledge Entrance", x: 50, y: 88 },
  { id: 2, levelId: 2, name: "市场天气站", subtitle: "Market Weather Station", x: 28, y: 76 },
  { id: 3, levelId: 3, name: "信息迷雾群岛", subtitle: "Info Mist Archipelago", x: 22, y: 22 },
  { id: 4, levelId: 4, name: "证据岔路口", subtitle: "Evidence Crossroads", x: 50, y: 10 },
  { id: 5, levelId: 5, name: "风险护盾桥", subtitle: "Risk-Shield Bridge", x: 68, y: 26 },
  { id: 6, levelId: 6, name: "情绪峡谷", subtitle: "Emotion Gorge", x: 38, y: 38 },
  { id: 7, levelId: 7, name: "财报告遗迹", subtitle: "Financial-Report Ruins", x: 78, y: 14 },
  { id: 8, levelId: 8, name: "热点火山", subtitle: "Hotspot Volcano", x: 80, y: 36 },
  { id: 9, levelId: 9, name: "模型沼泽", subtitle: "Model Swamp", x: 50, y: 50 },
  { id: 10, levelId: 10, name: "验证灯塔", subtitle: "Verification Lighthouse", x: 30, y: 60 },
  { id: 11, levelId: 1, name: "复盘营地", subtitle: "Review Camp", x: 58, y: 70 },
  { id: 12, levelId: 3, name: "脑力训练场", subtitle: "Brain Training Ground", x: 74, y: 68 },
  { id: 13, levelId: 1, name: "金融 Quiz 营", subtitle: "Financial Quiz Camp", x: 42, y: 80 },
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
  // Welcome + guided tour state
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourVisited, setTourVisited] = useState(false);

  // Check if first visit
  useEffect(() => {
    const hasSeen = localStorage.getItem("financia-waltz-tour-seen");
    if (!hasSeen) {
      setShowWelcome(true);
    }
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
    <div className="relative w-full flex-1 min-h-0 overflow-y-auto">
      {/* Vintage map background image - full height, scrollable */}
      <div className="relative w-full" style={{ minHeight: "178vh" }}>
      <img
        src="/map-world-new.jpg"
        alt="金融华尔界世界地图"
        className="w-full h-auto"
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
              if (showTour && !tourVisited && loc.id === 13) {
                // Tour mode: clicking the Quiz Camp completes the tour
                setTourVisited(true);
                localStorage.setItem("financia-waltz-tour-seen", "true");
                return;
              }
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
            {/* Tour highlight glow on Quiz Camp (id: 13) */}
            {showTour && !tourVisited && loc.id === 13 && (
              <span
                className="absolute rounded-full animate-ping"
                style={{
                  width: 60,
                  height: 60,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  border: "3px solid #FFD700",
                  boxShadow: "0 0 20px 8px rgba(255, 215, 0, 0.6)",
                  animationDuration: "1.5s",
                }}
              />
            )}
            {/* Main location marker - 冒险徽章风格 */}
            <span
              className="relative flex items-center justify-center transition-all duration-300 select-none"
              style={{
                width: 40,
                height: 40,
                transform: `rotate(${loc.id % 2 === 0 ? 2 : -2}deg)`,
                ...(status === "completed" && {
                  backgroundColor: "#0D9488",
                  border: "2px solid #14B8A6",
                  borderRadius: "50%",
                  opacity: 0.85,
                  boxShadow: "0 0 8px rgba(13, 148, 136, 0.3), 0 2px 6px rgba(0,0,0,0.1)",
                }),
                ...(status === "available" && !showTour && {
                  backgroundColor: "#D4A853",
                  border: "2.5px solid #C9953A",
                  borderRadius: "50%",
                  opacity: 1,
                  boxShadow: isHovered
                    ? "0 0 16px 4px rgba(212, 168, 83, 0.6), 0 4px 8px rgba(0,0,0,0.3)"
                    : "0 0 10px rgba(212, 168, 83, 0.4), 0 2px 6px rgba(0,0,0,0.15)",
                }),
                ...(showTour && !tourVisited && loc.id === 13 && {
                  backgroundColor: "#F59E0B",
                  border: "3px solid #FBBF24",
                  borderRadius: "50%",
                  opacity: 1,
                  boxShadow: "0 0 20px 6px rgba(245, 158, 11, 0.6), 0 0 40px rgba(245, 158, 11, 0.3), 0 4px 8px rgba(0,0,0,0.3)",
                }),
                ...(status === "locked" && {
                  backgroundColor: "#C4B5A5",
                  border: "2px solid #A8A29E",
                  borderRadius: "50%",
                  opacity: 0.5,
                  boxShadow: "none",
                }),
              }}
            >
              {status === "completed" ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : status === "available" ? (
                <svg className="w-4 h-4 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[#8B7D6B]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
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
    </div>
  );
  };

  // ===== Render: Zone Map =====
  const renderZoneMap = () => {
    const zone = MAP_ZONES.find((z) => z.id === activeZoneId);
    if (!zone) return null;

    // 找出当前区域第一个可挑战的关卡（作为"当前任务"）
    const firstAvailable = zone.markers
      .filter((m) => getLevelStatus(m.levelId) === "available")
      .sort((a, b) => a.levelId - b.levelId)[0];
    const currentLevelId = firstAvailable?.levelId ?? null;

    return (
      <div className="relative w-full h-full">
        <img
          src={zone.image}
          alt={zone.name}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {/* Level markers - 冒险徽章风格 */}
        {zone.markers.map((marker) => {
          const status = getLevelStatus(marker.levelId);
          const config = getLevelConfig(marker.levelId);
          const isHovered = hoveredMarker === marker.levelId;
          const isCurrent = status === "available" && marker.levelId === currentLevelId;

          // 随机旋转角度（-3deg ~ 3deg），让每个徽章有手绘感
          const rotAngles: Record<number, number> = {};
          marker.levelId % 2 === 0 ? (rotAngles[marker.levelId] = 2) : (rotAngles[marker.levelId] = -2);
          const rotate = marker.levelId % 2 === 0 ? 2 : -2;

          // 徽章尺寸
          const badgeSize = status === "locked" ? 40 : status === "completed" ? 40 : isCurrent ? 56 : 48;

          return (
            <button
              key={marker.levelId}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer"
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
              {/* ===== 当前任务：箭头指示器 ===== */}
              {isCurrent && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDuration: "1.5s" }}>
                  <div className="flex flex-col items-center">
                    <span className="text-orange-400 text-xs font-black whitespace-nowrap drop-shadow-md">
                      先点我！
                    </span>
                    <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3a1 1 0 011 1v10.586l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* ===== 当前任务：呼吸光晕 ===== */}
              {isCurrent && (
                <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ animationDuration: "2s" }}>
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: "#F59E0B",
                      filter: "blur(10px)",
                      width: badgeSize + 24,
                      height: badgeSize + 24,
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </span>
              )}

              {/* ===== 徽章主体 ===== */}
              <span
                className="relative flex items-center justify-center shadow-lg transition-all duration-300 select-none"
                style={{
                  width: isHovered && !isCurrent ? badgeSize + 4 : badgeSize,
                  height: isHovered && !isCurrent ? badgeSize + 4 : badgeSize,
                  transform: `rotate(${rotate}deg)`,
                  ...(status === "locked" && {
                    backgroundColor: "#C4B5A5",
                    border: "2px solid #A8A29E",
                    borderRadius: "50%",
                    opacity: 0.55,
                    boxShadow: "none",
                  }),
                  ...(status === "available" && !isCurrent && {
                    backgroundColor: "#D4A853",
                    border: "2.5px solid #C9953A",
                    borderRadius: "50%",
                    opacity: 1,
                    boxShadow: "0 0 12px rgba(212, 168, 83, 0.4), 0 2px 8px rgba(0,0,0,0.15)",
                  }),
                  ...(isCurrent && {
                    backgroundColor: "#F59E0B",
                    border: "3px solid #FBBF24",
                    borderRadius: "50%",
                    opacity: 1,
                    boxShadow: "0 0 20px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245, 158, 11, 0.2), 0 2px 8px rgba(0,0,0,0.15)",
                  }),
                  ...(status === "completed" && {
                    backgroundColor: "#0D9488",
                    border: "2px solid #14B8A6",
                    borderRadius: "50%",
                    opacity: 0.85,
                    boxShadow: "0 0 8px rgba(13, 148, 136, 0.3), 0 2px 6px rgba(0,0,0,0.1)",
                  }),
                }}
              >
                {/* 徽章内图案 */}
                {status === "locked" && (
                  <svg className="w-4 h-4 text-[#8B7D6B]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                )}
                {status === "completed" && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {status === "available" && !isCurrent && (
                  <span className="text-white font-black text-sm drop-shadow-sm">{marker.levelId}</span>
                )}
                {isCurrent && (
                  <span className="text-white font-black text-base drop-shadow-md">{marker.levelId}</span>
                )}
              </span>

              {/* ===== 关卡名称标签 ===== */}
              {status !== "locked" && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
                    style={{
                      backgroundColor: isCurrent ? "rgba(245, 158, 11, 0.2)" : "rgba(255,255,255,0.6)",
                      color: isCurrent ? "#D97706" : "#78716C",
                      backdropFilter: "blur(2px)",
                    }}
                  >
                    {config?.title ?? `第${marker.levelId}关`}
                  </span>
                </div>
              )}

              {/* ===== Tooltip ===== */}
              {isHovered && status !== "locked" && config && (
                <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border px-3 py-2 whitespace-nowrap z-50"
                  style={{ borderColor: isCurrent ? "#F59E0B" : "#D4A853" }}
                >
                  <p className="text-xs font-bold text-[#1E293B]">
                    {config.type === "dialogue" ? "🎭 对话闯关" : config.type === "quiz" ? "🃏 知识翻牌" : config.type === "brain" ? "🧠 脑力配对" : " 快速反应"}
                  </p>
                  {status === "available" && (
                    <p className="text-[10px] font-bold mt-0.5" style={{ color: isCurrent ? "#F59E0B" : "#D4A853" }}>
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
        <div className={`flex-1 ${view === "world" ? "overflow-hidden" : "overflow-y-auto"} ${view === "world" ? "p-0" : "p-4"}`}>
          {view === "world" && renderWorldMap()}
          {view === "zone" && renderZoneMap()}
          {view === "game" && renderGame()}
        </div>

        {/* Welcome Popup */}
        {showWelcome && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl max-w-sm w-[90%] p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
              <h2 className="text-xl font-bold text-center text-[#1E293B]">✨ 欢迎来到「金融华尔界」</h2>
              <div className="mt-4 text-sm text-[#475569] leading-relaxed space-y-2">
                <p>这里不是普通的金融课堂。</p>
                <p>在这片大陆上，你会通过一次次任务，建立属于自己的投资判断力。</p>
                <div className="mt-3 space-y-1.5">
                  <p className="flex items-center gap-2"><span className="text-base">🧠</span> 做 Quiz，赚取第一桶金币</p>
                  <p className="flex items-center gap-2"><span className="text-base">💰</span> 模拟投资，在涨跌里练习决策</p>
                  <p className="flex items-center gap-2"><span className="text-base">🔍</span> 搜集证据，破解市场迷雾</p>
                  <p className="flex items-center gap-2"><span className="text-base">🏆</span> 完成挑战，登上城市排行榜</p>
                </div>
                <p className="mt-3">每一次选择，都会让你的交易人格继续成长。</p>
                <p className="font-semibold text-[#D97706]">准备好了吗？先从你的第一笔启动资金开始。</p>
              </div>
              <button
                onClick={() => {
                  setShowWelcome(false);
                  setShowTour(true);
                }}
                className="mt-5 w-full py-2.5 rounded-xl text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
              >
                出发！
              </button>
            </div>
          </div>
        )}

        {/* Guided Tour Overlay */}
        {showTour && !tourVisited && (
          <div className="absolute inset-0 z-40 pointer-events-none">
            {/* Dim overlay - full screen, but with hole for quiz camp */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Highlight glow around quiz camp */}
            <div
              className="absolute pointer-events-auto animate-pulse"
              style={{
                left: "42%",
                top: "80%",
                width: 80,
                height: 80,
                transform: "translate(-50%, -50%)",
              }}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              {/* Arrow pointing down */}
              <span
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl animate-bounce"
                style={{ filter: "drop-shadow(0 0 4px rgba(255,215,0,0.8))" }}
              >
                👆
              </span>
            </div>
            {/* Speech bubble */}
            <div
              className="absolute pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{
                left: "42%",
                top: "75%",
                transform: "translate(-50%, -100%)",
              }}
            >
              <div
                className="bg-white rounded-xl p-4 shadow-xl max-w-[220px]"
                style={{ border: "2px solid #DAA520" }}
              >
                <p className="text-xs font-bold text-[#3D2B1F]">👀 看这里！</p>
                <p className="text-xs text-[#475569] mt-1">
                  冒险开始之前，先去赚点启动资金吧。
                </p>
                <p className="text-[10px] font-semibold text-[#D97706] mt-2">👇 点击「金融 Quiz 营」</p>
              </div>
            </div>
          </div>
        )}

        {/* NPC Explanation after clicking Quiz Camp */}
        {showTour && tourVisited && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl max-w-sm w-[90%] p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🧭</span>
                <div>
                  <p className="text-sm font-bold text-[#1E293B]">Lead Agent</p>
                  <p className="text-[10px] text-[#64748B]">你的市场搭子</p>
                </div>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed">
                「欢迎来到金融华尔界，<span className="font-semibold">tradeTI</span>。
              </p>
              <p className="text-sm text-[#475569] leading-relaxed mt-2">
                在这片大陆上，每个角落都藏着市场的秘密。从金融 Quiz 营开始，一步步积累你的知识和资金。
              </p>
              <p className="text-sm text-[#475569] leading-relaxed mt-2">
                准备好了就出发吧——记住，独立思考是你最强大的武器。」
              </p>
              <button
                onClick={() => {
                  setShowTour(false);
                }}
                className="mt-5 w-full py-2.5 rounded-xl text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}
              >
                开始冒险！
              </button>
            </div>
          </div>
        )}

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
