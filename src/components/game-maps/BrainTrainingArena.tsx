"use client";

import { useState } from "react";
import { ArrowLeft, Star, Sparkles } from "lucide-react";
import { SlidingPuzzle } from "./SlidingPuzzle";
import { PegSolitaire } from "./PegSolitaire";

// ===== 关卡热点定义（百分比坐标） =====
interface BrainTrainingLevel {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  x: number; // 百分比
  y: number; // 百分比
  color: string;
  description: string;
  unlocked: boolean;
}

const BRAIN_LEVELS: BrainTrainingLevel[] = [
  {
    id: "sliding-puzzle",
    name: "数字华容道",
    nameEn: "Number Sliding Puzzle",
    icon: "",
    x: 18,
    y: 22,
    color: "#D97706",
    description: "移动数字方块，按顺序排列",
    unlocked: true,
  },
  {
    id: "calcudoku",
    name: "数回挑战",
    nameEn: "Calcudoku Challenge",
    icon: "",
    x: 78,
    y: 22,
    color: "#3B82F6",
    description: "数字与运算的逻辑迷宫",
    unlocked: false,
  },
  {
    id: "kongming-chess",
    name: "孔明棋",
    nameEn: "Kongming Chess",
    icon: "",
    x: 18,
    y: 48,
    color: "#8B5CF6",
    description: "跳跃消除，留下最后一子",
    unlocked: true,
  },
  {
    id: "langtons-ant",
    name: "兰顿蚂蚁",
    nameEn: "Langton's Ant",
    icon: "",
    x: 78,
    y: 48,
    color: "#059669",
    description: "观察简单规则涌现的复杂图案",
    unlocked: false,
  },
  {
    id: "six-color-maze",
    name: "六色迷盘",
    nameEn: "Six-Color Maze",
    icon: "",
    x: 22,
    y: 72,
    color: "#EC4899",
    description: "在彩色迷宫中找到出路",
    unlocked: false,
  },
  {
    id: "jigsaw-puzzle",
    name: "拼图挑战",
    nameEn: "Jigsaw Puzzle",
    icon: "",
    x: 78,
    y: 72,
    color: "#F59E0B",
    description: "拼合碎片，还原完整画面",
    unlocked: false,
  },
];

interface BrainTrainingArenaProps {
  onBack: () => void;
}

export function BrainTrainingArena({ onBack }: BrainTrainingArenaProps) {
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const handleLevelClick = (level: BrainTrainingLevel) => {
    if (!level.unlocked) return;
    setActiveGame(level.id);
  };

  const handleBackFromGame = () => {
    setActiveGame(null);
  };

  // 如果正在玩游戏，显示游戏组件
  if (activeGame === "sliding-puzzle") {
    return <SlidingPuzzle onBack={handleBackFromGame} />;
  }

  if (activeGame === "kongming-chess") {
    return <PegSolitaire onBack={handleBackFromGame} />;
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* 顶部标题栏 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#1E3A5F] to-[#0F172A] rounded-t-xl">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex-1 text-center">
          <h3 className="text-sm font-bold text-white">脑力训练场</h3>
          <p className="text-[10px] text-white/60">Brain Training Arena</p>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
          <span className="text-xs font-bold text-[#F59E0B]">0/{BRAIN_LEVELS.length}</span>
        </div>
      </div>

      {/* 地图区域 */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {/* 背景地图图片 */}
        <div className="absolute inset-0">
          <img
            src="/brain-training-map.jpg"
            alt="脑力训练场地图"
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* 图片上的暗色遮罩，让热点更突出 */}
          <div className="absolute inset-0 bg-black/5" />
        </div>

        {/* 热点标记 */}
        {BRAIN_LEVELS.map((level) => {
          const isHovered = hoveredLevel === level.id;

          return (
            <div
              key={level.id}
              className="absolute z-10"
              style={{
                left: `${level.x}%`,
                top: `${level.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* 脉冲光效 */}
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{
                  width: "48px",
                  height: "48px",
                  left: "-12px",
                  top: "-12px",
                  backgroundColor: level.color,
                  animationDuration: "2s",
                }}
              />

              {/* 热点按钮 */}
              <button
                onClick={() => handleLevelClick(level)}
                onMouseEnter={() => setHoveredLevel(level.id)}
                onMouseLeave={() => setHoveredLevel(null)}
                className="relative flex flex-col items-center gap-1 group cursor-pointer"
                style={{ transform: isHovered ? "scale(1.15)" : "scale(1)", transition: "transform 0.2s ease-out" }}
              >
                {/* 图标圆圈 */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white/80"
                  style={{ backgroundColor: level.color }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>

                {/* 标签 */}
                <div
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap shadow-md border border-white/60"
                  style={{
                    backgroundColor: isHovered ? level.color : "rgba(255,255,255,0.92)",
                    color: isHovered ? "#fff" : "#1E293B",
                    transition: "all 0.2s ease",
                  }}
                >
                  {level.name}
                </div>
              </button>

              {/* 悬浮详情卡片 */}
              {isHovered && (
                <div
                  className="absolute z-20 w-44 p-3 rounded-xl shadow-xl border border-white/20 backdrop-blur-sm"
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.92)",
                    left: level.x > 50 ? "-190px" : "36px",
                    top: "-20px",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">{level.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{level.name}</p>
                      <p className="text-[10px] text-white/50">{level.nameEn}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/70 leading-relaxed">{level.description}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <div
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: level.color }}
                    >
                      点击开始
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 底部提示 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
          <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <p className="text-[10px] text-white/70 text-center">点击图标开始训练 · 完成全部关卡解锁智慧之门</p>
          </div>
        </div>
      </div>
    </div>
  );
}
