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
  loadWallCastleProgress,
  saveWallCastleProgress,
  completeWallCastleSubLevel,
  getWallCastleSubLevelStatus,
  WALL_CASTLE_SUB_LEVELS,
  type TraderRoadAgentId,
  type WallCastleSubLevelId,
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
type LocationType = "game" | "submap" | "feature";

interface WorldLocation {
  id: number;
  locationId: string;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  type: LocationType;
  // 点击后进入对应小游戏
  gameId?: string;
  // 点击后进入二级地图
  mapId?: string;
  // 点击后进入功能页
  featureId?: string;
  /** 仅用于兼容旧主线代码，地图点击逻辑不得使用此字段 */
  legacyLevelId?: number;
}

const WORLD_LOCATIONS: WorldLocation[] = [
  // ===== 序章（入港口 → 引导进入华尔堡） =====
  { id: 1, locationId: "knowledge-entrance", name: "金融知识入港口", subtitle: "Knowledge Entrance", x: 48, y: 94, type: "game", gameId: "level-1", legacyLevelId: 1 },
  // ===== 主地图关卡 =====
  { id: 2, locationId: "info-mist-archipelago", name: "信息迷雾群岛", subtitle: "Info Mist Archipelago", x: 20, y: 11, type: "game", gameId: "level-4", legacyLevelId: 4 },
  { id: 3, locationId: "financial-report-ruins", name: "财报考古遗迹", subtitle: "Financial-Report Ruins", x: 83, y: 11, type: "game", gameId: "level-5", legacyLevelId: 5 },
  { id: 4, locationId: "model-swamp", name: "模型沼泽", subtitle: "Model Swamp", x: 49, y: 53, type: "game", gameId: "level-6", legacyLevelId: 6 },
  { id: 5, locationId: "kline-learning", name: "K线图学习", subtitle: "K-Line Study", x: 79, y: 77, type: "game", gameId: "level-7", legacyLevelId: 7 },
  { id: 6, locationId: "market-weather-valley", name: "市场天气谷", subtitle: "Market Weather Valley", x: 17, y: 52, type: "game", gameId: "level-8", legacyLevelId: 8 },
  { id: 7, locationId: "evidence-crossroads", name: "证据岔路口", subtitle: "Evidence Crossroads", x: 52, y: 6, type: "game", gameId: "level-9", legacyLevelId: 9 },
  { id: 8, locationId: "risk-shield-bridge", name: "风险护盾桥", subtitle: "Risk-Shield Bridge", x: 82, y: 61, type: "game", gameId: "level-10", legacyLevelId: 10 },
  // ===== 独立功能节点 =====
  { id: 9, locationId: "city-ranking-tower", name: "城市排名塔", subtitle: "City Ranking Tower", x: 48, y: 38, type: "feature", featureId: "city-ranking" },
  { id: 10, locationId: "brain-training-arena", name: "脑力训练场", subtitle: "Brain Training Arena", x: 85, y: 46, type: "game", gameId: "brain-training" },
  { id: 11, locationId: "finance-quiz-camp", name: "金融 Quiz 营", subtitle: "Financial Quiz Camp", x: 54, y: 86, type: "game", gameId: "finance-quiz" },
  { id: 12, locationId: "wall-castle", name: "华尔堡", subtitle: "Wall Castle", x: 50, y: 23, type: "submap", mapId: "wallCastleMap" },
  { id: 13, locationId: "hotspot-volcano", name: "热点火山与追涨火箭", subtitle: "Hotspot Volcano & Rocket", x: 77, y: 33, type: "game", gameId: "hotspot-volcano" },
  { id: 14, locationId: "review-lighthouse", name: "复盘灯塔", subtitle: "Review Lighthouse", x: 17, y: 74, type: "game", gameId: "review-lighthouse" },
];

// ===== Props =====
export interface GameMapPlayerProps {
  initialLevelId: number | null;
  /** 从外部传入的 locationId，用于从正确之路直接导航到对应地图地标 */
  openLocationId?: string | null;
  onClose: () => void;
  onLevelComplete?: (levelId: number) => void;
}

// ===== Main Component =====
export function GameMapPlayer({
  initialLevelId,
  openLocationId,
  onClose,
  onLevelComplete,
}: GameMapPlayerProps) {
  // 始终从世界地图开始，initialLevelId 仅用于高亮提示
  const [view, setView] = useState<"world" | "zone" | "game" | "submap" | "feature">("world");
  const [activeZoneId, setActiveZoneId] = useState<number | null>(null);
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);
  const [activeSubmapId, setActiveSubmapId] = useState<string | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
  const [hoveredWorldLoc, setHoveredWorldLoc] = useState<number | null>(null);
  const [clickedWorldLoc, setClickedWorldLoc] = useState<number | null>(null);
  const [progress, setProgress] = useState(() => loadTraderRoadProgress());
  // Welcome + guided tour state
  const [mapLoaded, setMapLoaded] = useState(false);
  const [wallCastleLoaded, setWallCastleLoaded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourVisited, setTourVisited] = useState(false);
  const [showWallCastleTour, setShowWallCastleTour] = useState(false);
  const [wallCastleRefreshKey, setWallCastleRefreshKey] = useState(0);

  // Check if first visit - ONLY after map is loaded
  useEffect(() => {
    if (mapLoaded) {
      const hasSeen = localStorage.getItem("financia-waltz-tour-seen");
      if (!hasSeen) {
        setShowWelcome(true);
      }
    }
  }, [mapLoaded]);

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

      // 完成金融知识入港口后，显示华尔堡引导
      if (levelId === 0 || levelId === 1) {
        setShowWallCastleTour(true);
      }
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

  const handleLocationClick = useCallback(
    (loc: WorldLocation) => {
      // 如果是 tour 模式且点击的是特定节点，走 tour 逻辑
      if (showTour && !tourVisited && loc.id === 1) {
        return; // tour 逻辑由外部处理
      }
      // 华尔堡引导：点击华尔堡关闭引导
      if (showWallCastleTour && loc.id === 12) {
        setShowWallCastleTour(false);
        return; // 让后续正常点击逻辑也生效
      }

      setClickedWorldLoc(loc.id);
      setTimeout(() => {
        setClickedWorldLoc(null);

        // 模型沼泽 → 打开固收挑战游戏（新页面）
        if (loc.locationId === "model-swamp") {
          window.open("/bond-hunter", "_blank");
          return;
        }

        switch (loc.type) {
          case "game": {
            // 如果是主线关卡 (level-*)，使用旧 level 逻辑
            if (loc.gameId && loc.gameId.startsWith("level-")) {
              const levelId = parseInt(loc.gameId.replace("level-", ""), 10);
              setActiveLevelId(levelId);
              setActiveGameId(loc.gameId);
              setView("game");
            } else if (loc.gameId) {
              // 独立小游戏（如金融Quiz营、K线图学习等）
              setActiveGameId(loc.gameId);
              setView("game");
            }
            break;
          }
          case "submap": {
            setActiveSubmapId(loc.mapId || null);
            setView("submap");
            break;
          }
          case "feature": {
            setActiveFeatureId(loc.featureId || null);
            setView("feature");
            break;
          }
        }
      }, 300);
    },
    [showTour, tourVisited]
  );

  // 当外部传入 openLocationId 时，自动导航到对应地图地标
  useEffect(() => {
    if (!openLocationId || !mapLoaded) return;
    const target = WORLD_LOCATIONS.find(
      (loc) => loc.locationId === openLocationId
    );
    if (target) {
      // 跳过引导教程，直接导航
      handleLocationClick(target);
    }
  }, [openLocationId, mapLoaded, handleLocationClick]);

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
    // 加载状态：仅显示模糊地图背景 + 金币罗盘，不渲染任何交互元素
    if (!mapLoaded) {
      return (
        <div className="relative w-full flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: "100vh" }}>
          {/* 模糊地图背景 */}
          <img
            src="/map-world-new.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(8px) brightness(0.7) saturate(0.5)", transform: "scale(1.1)" }}
            onLoad={() => setMapLoaded(true)}
            onError={() => setMapLoaded(true)}
          />
          {/* 羊皮纸色蒙版 */}
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(245, 235, 220, 0.4)" }} />

          {/* 金币罗盘 loading */}
          <div className="relative flex flex-col items-center z-10">
            <div
              className="w-20 h-20 rounded-full animate-spin-slow"
              style={{
                border: "3px dashed #D4A853",
                boxShadow: "0 0 20px rgba(212, 168, 83, 0.3), inset 0 0 20px rgba(212, 168, 83, 0.1)",
              }}
            />
            <div
              className="absolute w-14 h-14 rounded-full animate-spin-slower"
              style={{
                border: "2px solid rgba(212, 168, 83, 0.3)",
                borderTop: "2px solid #D4A853",
                boxShadow: "0 0 12px rgba(212, 168, 83, 0.2)",
              }}
            />
            <div
              className="absolute w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, #F5E6C8 0%, #D4A853 100%)",
                border: "2px solid #B8860B",
                boxShadow: "0 0 16px 4px rgba(212, 168, 83, 0.5)",
              }}
            >
              <span className="text-lg" style={{ fontFamily: "serif", fontWeight: 900, color: "#8B6914" }}>₿</span>
            </div>
            <p
              className="mt-6 text-sm font-medium tracking-wider animate-pulse"
              style={{ fontFamily: "serif", color: "#6B5B4B", letterSpacing: "2px" }}
            >
              正在进入金融华尔界...
            </p>
          </div>
        </div>
      );
    }

    // 加载完成：显示完整地图 + 交互标记
    return (

    <div className="relative w-full" style={{ minHeight: "100%" }}>
      <img
        src="/map-world-new.jpg"
        alt="金融华尔界世界地图"
        className="w-full h-auto block"
        draggable={false}
        onLoad={() => setMapLoaded(true)}
      />
      {/* Dark overlay when hovering a location */}
      {hoveredWorldLoc !== null && (
        <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 pointer-events-none" />
      )}
      {/* Location hotspots with micro-interactions */}
      {WORLD_LOCATIONS.map((loc) => {
        // 独立地点（非主线关卡）始终可点击
        const isIndependent = loc.type === "feature" || loc.type === "submap" || (loc.type === "game" && loc.gameId && !loc.gameId.startsWith("level-"));
        const status = isIndependent ? "available" : getLevelStatus(loc.legacyLevelId ?? 0);
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
              if (showTour && !tourVisited && loc.id === 1) {
                // Tour mode: clicking the knowledge-entrance completes the tour
                setTourVisited(true);
                localStorage.setItem("financia-waltz-tour-seen", "true");
                return;
              }
              if (isAvailable) {
                handleLocationClick(loc);
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
            {/* Tour highlight glow on knowledge-entrance (id: 1) */}
            {showTour && !tourVisited && loc.id === 1 && (
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
            {/* Wall Castle tour highlight glow after completing knowledge-entrance */}
            {showWallCastleTour && loc.id === 12 && (
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
                ...(showTour && !tourVisited && loc.id === 1 && {
                  backgroundColor: "#F59E0B",
                  border: "3px solid #FBBF24",
                  borderRadius: "50%",
                  opacity: 1,
                  boxShadow: "0 0 20px 6px rgba(245, 158, 11, 0.6), 0 0 40px rgba(245, 158, 11, 0.3), 0 4px 8px rgba(0,0,0,0.3)",
                }),
                ...(showWallCastleTour && loc.id === 12 && {
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
                  opacity: 0.75,
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
                    opacity: 0.75,
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
    // 独立小游戏（金融Quiz营、K线图学习等）- 无 activeLevelId
    if (!activeLevelId && activeGameId) {
      if (activeGameId === "finance-quiz") {
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-lg">🎯</span>
              <h3 className="text-sm font-bold text-[#1E293B]">金融 Quiz 营</h3>
            </div>
            <div className="flex-1 min-h-0">
              <QuizChoice
                questionIndices={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
                correctQuizIds={progress.correctQuizIds}
                onQuizCorrect={() => {}}
                onComplete={() => {
                  addCoins(10);
                }}
                onClose={() => {
                  setView("world");
                  setActiveGameId(null);
                }}
              />
            </div>
          </div>
        );
      }
      if (activeGameId === "kline-learning") {
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-lg">📊</span>
              <h3 className="text-sm font-bold text-[#1E293B]">K线图学习</h3>
            </div>
            <div className="flex-1 min-h-0">
              <LearningCards
                cardIndices={[0, 1, 2, 3, 4]}
                learnedCards={progress.learnedCards}
                onCardLearned={() => {}}
                onComplete={() => {
                  addCoins(10);
                }}
                onClose={() => {
                  setView("world");
                  setActiveGameId(null);
                }}
              />
            </div>
          </div>
        );
      }
      if (activeGameId === "brain-training") {
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-lg">🧠</span>
              <h3 className="text-sm font-bold text-[#1E293B]">脑力训练场</h3>
            </div>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <p className="text-sm text-[#64748B]">脑力训练游戏即将开放</p>
            </div>
            <button
              onClick={() => { setView("world"); setActiveGameId(null); }}
              className="mt-4 mx-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
            >
              返回世界地图
            </button>
          </div>
        );
      }
      // 兜底
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-sm text-[#64748B]">该小游戏加载中...</p>
          <button onClick={() => { setView("world"); setActiveGameId(null); }} className="mt-4 text-xs text-[#3B82F6] underline">
            返回世界地图
          </button>
        </div>
      );
    }

    // 主线关卡（有 activeLevelId）
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
  // ===== Render: 华尔堡二级地图 =====
  const renderWallCastleMap = () => {
    // 重置进度到初始状态，让三个关卡从金色开始
    if (typeof window !== "undefined") localStorage.removeItem("tpti_wallcastle_progress");
    const progress = loadWallCastleProgress();
    const subLevels = WALL_CASTLE_SUB_LEVELS;

    const handleSubLevelClick = (levelId: WallCastleSubLevelId) => {
      const status = getWallCastleSubLevelStatus(levelId, progress);
      if (status !== "available" && status !== "completed") return;
      const newProgress = completeWallCastleSubLevel(levelId);
      saveWallCastleProgress(newProgress);
      setWallCastleRefreshKey((k) => k + 1);
    };

    const getNodeStyle = (status: string) => {
      switch (status) {
        case "completed":
          return {
            bg: "bg-gradient-to-br from-[#10B981] to-[#059669]",
            border: "border-[#34D399] shadow-[0_0_15px_rgba(16,185,129,0.4)]",
            icon: "✓",
          };
        case "available":
          return {
            bg: "bg-gradient-to-br from-[#D4A017] to-[#D97706]",
            border: "border-[#FDE68A] shadow-[0_0_20px_rgba(212,160,23,0.5)]",
            icon: "▶",
          };
        default:
          return {
            bg: "bg-[#374151]",
            border: "border-[#4B5563]",
            icon: "🔒",
          };
      }
    };

    // 加载状态：仅显示模糊背景 + 金色罗盘，不渲染任何交互元素
    if (!wallCastleLoaded) {
      return (
        <div className="relative w-full flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: "100vh" }}>
          {/* 模糊背景 */}
          <img
            src="/wall-castle-map.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(8px) brightness(0.7) saturate(0.5)", transform: "scale(1.1)" }}
            onLoad={() => setWallCastleLoaded(true)}
            onError={() => setWallCastleLoaded(true)}
          />
          {/* 暗色蒙版 */}
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(26, 26, 46, 0.6)" }} />

          {/* 金色罗盘 loading */}
          <div className="relative flex flex-col items-center z-10">
            <div
              className="w-20 h-20 rounded-full animate-spin-slow"
              style={{
                border: "3px dashed #D4A853",
                boxShadow: "0 0 20px rgba(212, 168, 83, 0.3), inset 0 0 20px rgba(212, 168, 83, 0.1)",
              }}
            />
            <div
              className="absolute w-14 h-14 rounded-full animate-spin-slower"
              style={{
                border: "2px solid rgba(212, 168, 83, 0.3)",
                borderTop: "2px solid #D4A853",
                boxShadow: "0 0 12px rgba(212, 168, 83, 0.2)",
              }}
            />
            <div
              className="absolute w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, #F5E6C8 0%, #D4A853 100%)",
                border: "2px solid #B8860B",
                boxShadow: "0 0 16px 4px rgba(212, 168, 83, 0.5)",
              }}
            >
              <span className="text-lg" style={{ fontFamily: "serif", fontWeight: 900, color: "#8B6914" }}>₿</span>
            </div>
            <p
              className="mt-6 text-sm font-medium tracking-wider animate-pulse"
              style={{ fontFamily: "serif", color: "#D4A853", letterSpacing: "2px" }}
            >
              正在进入华尔堡...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full overflow-y-auto bg-[#1a1a2e]" key={wallCastleRefreshKey}>
        <div className="relative w-full max-w-md mx-auto">
          <img
            src="/wall-castle-map.png"
            alt="华尔堡地图"
            className={`w-full h-auto block ${!wallCastleLoaded ? "invisible" : ""}`}
            onLoad={() => setWallCastleLoaded(true)}
            onError={() => setWallCastleLoaded(true)}
          />

          {/* 3 Sub-Level Nodes */}
          {subLevels.map((level) => {
            const status = getWallCastleSubLevelStatus(level.id, progress);
            const style = getNodeStyle(status);
            return (
              <button
                key={level.id}
                onClick={() => handleSubLevelClick(level.id)}
                className={`absolute cursor-pointer transition-all duration-300 ${
                  status === "locked" ? "opacity-50" : "hover:scale-110"
                }`}
                style={{
                  left: `${level.x}%`,
                  top: `${level.y}%`,
                  width: "11%",
                  transform: "translate(-50%, -50%)",
                  aspectRatio: "1/1",
                }}
                title={level.name}
              >
                <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold border-2 ${style.border} ${style.bg}`}
                  style={{ boxShadow: status !== "locked" ? "0 0 20px rgba(212,160,23,0.3)" : "none" }}>
                  {status === "completed" ? (
                    <span className="text-white font-black text-lg">✓</span>
                  ) : status === "locked" ? (
                    <span className="text-white/60 text-xs">🔒</span>
                  ) : (
                    <span className="text-white text-xs font-bold">▶</span>
                  )}
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-[10px] font-bold ${
                    status === "locked" ? "text-white/40" : "text-white/90"
                  }`}>
                    {level.name}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Other locked locations (待开放) */}
          {[
            { id: "trading-hall", name: "交易大厅", x: 52, y: 24 },
            { id: "skill-workshop", name: "技能工坊", x: 32, y: 74 },
            { id: "team-base", name: "团队基地", x: 79, y: 73 },
            { id: "info-hub", name: "信息中枢", x: 52, y: 54 },
            { id: "airship", name: "情报空艇", x: 86, y: 8 },
          ].map((loc) => (
            <div
              key={loc.id}
              className="absolute pointer-events-none"
              style={{
                left: `${loc.x}%`,
                top: `${loc.y}%`,
                width: "9%",
                transform: "translate(-50%, -50%)",
                aspectRatio: "1/1",
              }}
            >
              <div className="w-full h-full rounded-full bg-[#374151]/70 border border-[#4B5563]/50 flex items-center justify-center">
                <span className="text-white/40 text-[10px]">🔒</span>
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[9px] text-white/30">待开放</span>
              </div>
            </div>
          ))}

          {/* Back Button */}
          <button
            onClick={() => {
              setActiveSubmapId(null);
              setView("world");
            }}
            className="absolute top-3 left-3 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all"
          >
            <span className="text-white text-lg">←</span>
          </button>

          {/* Title */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
              <span className="text-white text-sm font-bold tracking-wider" style={{ fontFamily: "serif" }}>
                🏰 华尔堡
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===== Render: Feature View (e.g. 城市排名塔) =====
  const renderFeatureView = () => {
    if (activeFeatureId === "city-ranking") {
      return (
        <div className="flex flex-col h-full py-6 px-4">
          <div className="text-center mb-6">
            <span className="text-4xl">🏆</span>
            <h3 className="text-lg font-bold text-[#1E293B] mt-2">城市排名塔</h3>
            <p className="text-xs text-[#64748B] mt-1">City Ranking Tower</p>
          </div>
          {/* Ranking list placeholder */}
          <div className="flex-1 space-y-3">
            {[
              { rank: 1, name: "交易员A", coins: 5280, level: 11 },
              { rank: 2, name: "交易员B", coins: 4200, level: 10 },
              { rank: 3, name: "交易员C", coins: 3850, level: 9 },
              { rank: 4, name: "你", coins: progress.coins, level: progress.completedLevels.length, isMe: true },
              { rank: 5, name: "交易员D", coins: 2100, level: 7 },
            ].map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  entry.isMe ? "bg-[#FFFBEB] border border-[#FDE68A]" : "bg-white border border-[#E2E8F0]"
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  entry.rank <= 3 ? "text-white" : "text-[#64748B]"
                }`}
                  style={{
                    background: entry.rank === 1 ? "linear-gradient(135deg, #FFD700, #FFA500)"
                      : entry.rank === 2 ? "linear-gradient(135deg, #C0C0C0, #A8A8A8)"
                      : entry.rank === 3 ? "linear-gradient(135deg, #CD7F32, #B8860B)"
                      : "#F1F5F9"
                  }}
                >
                  {entry.rank}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1E293B]">
                    {entry.name} {entry.isMe && <span className="text-[10px] text-[#D97706]">（你）</span>}
                  </p>
                  <p className="text-[10px] text-[#64748B]">Lv.{entry.level}</p>
                </div>
                <span className="text-xs font-bold text-[#D97706]">🪙 {entry.coins.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setView("world")}
            className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
          >
            返回世界地图
          </button>
        </div>
      );
    }
    // 其他 feature 占位
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-sm text-[#64748B]">功能开发中...</p>
        <button onClick={() => setView("world")} className="mt-4 text-xs text-[#3B82F6] underline">
          返回世界地图
        </button>
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
                  if (view === "game") {
                    // 主线关卡（level-*）从 zone 进入 → 返回 zone
                    // 独立小游戏（无 activeLevelId）从世界地图进入 → 返回 world
                    if (activeLevelId) {
                      setView("zone");
                    } else {
                      setView("world");
                      setActiveGameId(null);
                    }
                  } else if (view === "submap" || view === "feature") {
                    setView("world");
                  } else {
                    setView("world");
                  }
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
                : view === "submap"
                ? activeSubmapId === "wallCastleMap" ? "华尔堡" : "地图"
                : view === "feature"
                ? activeFeatureId === "city-ranking" ? "城市排名塔" : "功能"
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
          {view === "submap" && renderWallCastleMap()}
          {view === "feature" && renderFeatureView()}
        </div>

        {/* Welcome Popup - 仅在地图加载完成后显示 */}
        {showWelcome && mapLoaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl max-w-sm w-[90%] p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
              <h2 className="text-xl font-bold text-center text-[#1E293B]">✨ 欢迎来到「金融华尔界」</h2>
              <div className="mt-4 text-sm text-[#475569] leading-relaxed space-y-2">
                <p>这里不是普通的金融课堂。</p>
                <p>在这片大陆上，你会通过一次次任务，建立属于自己的投资判断力。</p>
                <div className="mt-3 space-y-1.5">
                  <p className="flex items-center gap-2"><span className="text-base">🧠</span> 完成知识关卡，解锁投研 Agent</p>
                  <p className="flex items-center gap-2"><span className="text-base">💰</span> 模拟投资，在涨跌里练习决策</p>
                  <p className="flex items-center gap-2"><span className="text-base">🔍</span> 搜集证据，破解市场迷雾</p>
                  <p className="flex items-center gap-2"><span className="text-base">🏆</span> 完成挑战，登上城市排行榜</p>
                </div>
                <p className="mt-3">每一次选择，都会让你的交易人格继续成长。</p>
                <p className="font-semibold text-[#D97706]">先从「金融知识入港口」开始，让 Lead Agent 带你入门。</p>
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

        {/* Guided Tour Overlay - 仅在地图加载完成后显示 */}
        {showTour && !tourVisited && mapLoaded && (
          <div className="absolute inset-0 z-40 pointer-events-none">
            {/* Dim overlay - full screen, but with hole for knowledge entrance */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Highlight glow around knowledge entrance */}
            <div
              className="absolute pointer-events-none animate-pulse"
              style={{
                left: "48%",
                top: "92%",
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
              className="absolute pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{
                left: "48%",
                top: "80%",
                transform: "translate(-50%, -100%)",
              }}
            >
              <div
                className="bg-white rounded-xl p-4 shadow-xl max-w-[220px] pointer-events-none"
                style={{ border: "2px solid #DAA520" }}
              >
                <p className="text-xs font-bold text-[#3D2B1F]">👀 看这里！</p>
                <p className="text-xs text-[#475569] mt-1">
                  先从「金融知识入港口」开始，让 Lead Agent 带你入门。
                </p>
                <p className="text-[10px] font-semibold text-[#D97706] mt-2">👇 点击「金融知识入港口」</p>
              </div>
            </div>
          </div>
        )}

        {/* Lead Agent Explanation after clicking knowledge-entrance */}
        {showTour && tourVisited && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl max-w-sm w-[90%] p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🧭</span>
                <div>
                  <p className="text-sm font-bold text-[#1E293B]">Lead Agent 顾明澈</p>
                  <p className="text-[10px] text-[#64748B]">你的市场搭子</p>
                </div>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed">
                「欢迎来到金融华尔界，<span className="font-semibold">tradeTI</span>。
              </p>
              <p className="text-sm text-[#475569] leading-relaxed mt-2">
                跟我来，先去「金融知识入港口」完成开户。在这里你会学到基础的市场知识，掌握信息的真伪辨别。
              </p>
              <p className="text-sm text-[#475569] leading-relaxed mt-2">
                完成之后，你就可以前往「华尔堡」——那里有更深的挑战等着你。
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

        {/* Wall Castle tour after completing knowledge-entrance */}
        {showWallCastleTour && !showTour && (
          <div className="absolute inset-0 z-40 pointer-events-none">
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="absolute pointer-events-none animate-pulse"
              style={{
                left: "50%",
                top: "25%",
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
              <span
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl animate-bounce"
                style={{ filter: "drop-shadow(0 0 4px rgba(255,215,0,0.8))" }}
              >
                👆
              </span>
            </div>
            <div
              className="absolute pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{
                left: "50%",
                top: "15%",
                transform: "translate(-50%, -100%)",
              }}
            >
              <div
                className="bg-white rounded-xl p-4 shadow-xl max-w-[220px] pointer-events-none"
                style={{ border: "2px solid #DAA520" }}
              >
                <p className="text-xs font-bold text-[#3D2B1F]">🎯 新目标解锁！</p>
                <p className="text-xs text-[#475569] mt-1">
                  开户完成！接下来前往「华尔堡」——进入二级地图，挑战更深的关卡。
                </p>
                <p className="text-[10px] font-semibold text-[#D97706] mt-2"> 点击「华尔堡」</p>
              </div>
            </div>
            <button
              onClick={() => setShowWallCastleTour(false)}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto px-4 py-1.5 rounded-full bg-white/80 border border-amber-300/60 text-xs text-amber-700 font-medium shadow-sm"
            >
              我知道了
            </button>
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
