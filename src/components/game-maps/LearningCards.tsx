"use client";

/**
 * 多邻国风格学习卡片组件
 * 竖向滑动卡片，正面标题+分类，背面内容+记忆点
 * 学完一张滑到下一张，全部学完获得炒币奖励
 */

import { useState, useCallback } from "react";
import { LEARNING_CARDS, type LearningCard } from "./learning-cards-data";

interface LearningCardsProps {
  /** 当前关卡使用的卡片范围 (0-based index into LEARNING_CARDS) */
  cardIndices: number[];
  /** 已学习的卡片ID列表 */
  learnedCards: number[];
  /** 标记卡片已学习 */
  onCardLearned: (cardId: number) => void;
  /** 全部学完回调 */
  onComplete: () => void;
  /** 关闭 */
  onClose: () => void;
}

export function LearningCards({
  cardIndices,
  learnedCards,
  onCardLearned,
  onComplete,
  onClose,
}: LearningCardsProps) {
  const cards = cardIndices.map((i) => LEARNING_CARDS[i]).filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideDir, setSlideDir] = useState<"none" | "left" | "right">("none");

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const isLastCard = currentIndex >= totalCards - 1;
  const isLearned = currentCard ? learnedCards.includes(currentCard.id) : false;

  const handleFlip = useCallback(() => {
    setIsFlipped((v) => !v);
  }, []);

  const handleNext = useCallback(() => {
    if (!currentCard) return;

    // 标记已学习
    if (!learnedCards.includes(currentCard.id)) {
      onCardLearned(currentCard.id);
    }

    if (isLastCard) {
      // 全部学完
      setSlideDir("left");
      setTimeout(() => {
        onComplete();
      }, 300);
    } else {
      setSlideDir("left");
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setIsFlipped(false);
        setSlideDir("none");
      }, 200);
    }
  }, [currentCard, isLastCard, learnedCards, onCardLearned, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentIndex <= 0) return;
    setSlideDir("right");
    setTimeout(() => {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
      setSlideDir("none");
    }, 200);
  }, [currentIndex]);

  if (!currentCard) return null;

  // 分类颜色映射
  const categoryColors: Record<string, string> = {
    "估值与基本面": "#3B82F6",
    "交易机制": "#8B5CF6",
    "盘面资金": "#F59E0B",
    "宏观与风控": "#059669",
  };
  const catColor = categoryColors[currentCard.category] || "#3B82F6";

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "#F5F5F7" }}>
      {/* 顶部栏 */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#64748B] text-lg"
        >
          ×
        </button>
        {/* 进度条 */}
        <div className="flex-1 h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + (isFlipped ? 0.5 : 0)) / totalCards) * 100}%`,
              background: `linear-gradient(90deg, ${catColor}, ${catColor}88)`,
            }}
          />
        </div>
        <span className="text-xs font-medium text-[#64748B]">
          {currentIndex + 1}/{totalCards}
        </span>
      </div>

      {/* 卡片区域 */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div
          className={`w-full max-w-sm transition-all duration-200 ${
            slideDir === "left"
              ? "-translate-x-8 opacity-0"
              : slideDir === "right"
                ? "translate-x-8 opacity-0"
                : "translate-x-0 opacity-100"
          }`}
        >
          <div
            onClick={handleFlip}
            className="relative cursor-pointer"
            style={{ perspective: "1000px" }}
          >
            <div
              className="relative transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* 正面 */}
              <div
                className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-8"
                style={{ backfaceVisibility: "hidden", minHeight: 320 }}
              >
                {/* 分类标签 */}
                <div
                  className="inline-block px-3 py-1 rounded text-xs font-medium text-white mb-6"
                  style={{ backgroundColor: catColor }}
                >
                  {currentCard.category}
                </div>

                {/* 标题 */}
                <h2 className="text-xl font-bold text-[#1E293B] mb-4 leading-tight">
                  {currentCard.title}
                </h2>

                {/* 提示翻转 */}
                <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2">
                  <div className="w-12 h-1 bg-[#E2E8F0] rounded-full" />
                  <span className="text-xs text-[#94A3B8]">点击翻转查看详情</span>
                </div>

                {/* 已学标记 */}
                {isLearned && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#059669] flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>

              {/* 背面 */}
              <div
                className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6 absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  minHeight: 320,
                }}
              >
                <div
                  className="inline-block px-3 py-1 rounded text-xs font-medium text-white mb-4"
                  style={{ backgroundColor: catColor }}
                >
                  {currentCard.category}
                </div>

                <h3 className="text-base font-bold text-[#1E293B] mb-3">
                  {currentCard.title}
                </h3>

                <p className="text-sm text-[#475569] leading-relaxed mb-6">
                  {currentCard.content}
                </p>

                {/* 记忆点 */}
                {currentCard.highlight && (
                  <div
                    className="rounded-lg px-4 py-3 border"
                    style={{
                      backgroundColor: `${catColor}08`,
                      borderColor: `${catColor}30`,
                    }}
                  >
                    <div className="text-xs font-medium mb-1" style={{ color: catColor }}>
                      记忆要点
                    </div>
                    <div className="text-sm font-bold text-[#1E293B]">
                      {currentCard.highlight}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作区 */}
      <div className="px-4 pb-6 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="w-12 h-12 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ←
          </button>

          <button
            onClick={handleNext}
            className="flex-1 h-12 rounded-lg text-white font-semibold text-sm transition-all active:scale-[0.98]"
            style={{ backgroundColor: catColor }}
          >
            {isLastCard
              ? isFlipped
                ? "完成学习 +5炒币"
                : "翻转查看"
              : isFlipped
                ? "下一张 →"
                : "翻转查看"}
          </button>
        </div>

        {/* 炒币提示 */}
        <div className="mt-3 text-center text-xs text-[#94A3B8]">
          每学完一张卡片获得 <span className="font-bold text-[#F59E0B]">+5 炒币</span>
        </div>
      </div>
    </div>
  );
}
