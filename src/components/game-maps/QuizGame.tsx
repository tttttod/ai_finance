"use client";

import { useState, useCallback } from "react";
import type { QuizLevelData } from "./game-data";

interface QuizGameProps {
  data: QuizLevelData;
  onComplete: (passed: boolean) => void;
}

export function QuizGame({ data, onComplete }: QuizGameProps) {
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [answeredCards, setAnsweredCards] = useState<Set<string>>(new Set());
  const [correctCount, setCorrectCount] = useState(0);

  const totalCards = data.cards.length;
  const currentCard = data.cards[currentIndex];

  const handleFlip = useCallback((cardId: string) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, []);

  const handleAnswer = useCallback((cardId: string, isCorrect: boolean) => {
    if (answeredCards.has(cardId)) return;
    setAnsweredCards(prev => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  }, [answeredCards]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setPhase("result");
    }
  }, [currentIndex, totalCards]);

  const passed = correctCount >= Math.ceil(totalCards * data.passRate);

  // Intro
  if (phase === "intro") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center">
            <span className="text-2xl">🃏</span>
          </div>
          <h3 className="text-lg font-bold text-[#1E293B] mb-2">{data.title}</h3>
          <p className="text-[#64748B] text-sm mb-4">{data.intro}</p>
          <div className="text-xs text-[#94A3B8] mb-6">
            共 {totalCards} 张卡片, 正确率需达 {Math.round(data.passRate * 100)}%
          </div>
          <button
            onClick={() => setPhase("playing")}
            className="w-full py-3 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            开始挑战
          </button>
        </div>
      </div>
    );
  }

  // Result
  if (phase === "result") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          {passed ? (
            <>
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-lg font-bold text-[#059669] mb-2">通关成功!</h3>
              <p className="text-[#64748B] text-sm mb-2">
                你的金融知识储备已达标。
              </p>
              <div className="text-xs text-[#94A3B8] mb-4">
                正确率: {correctCount}/{totalCards}
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-lg font-bold text-[#D97706] mb-2">继续学习</h3>
              <p className="text-[#64748B] text-sm mb-2">
                金融知识还需要加强, 再试一次吧!
              </p>
              <div className="text-xs text-[#94A3B8] mb-4">
                正确率: {correctCount}/{totalCards}, 需要 {Math.ceil(totalCards * data.passRate)} 题正确
              </div>
            </>
          )}
          <button
            onClick={() => onComplete(passed)}
            className="w-full py-3 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            {passed ? "继续前进" : "重新挑战"}
          </button>
        </div>
      </div>
    );
  }

  // Playing - flip card
  const isFlipped = flippedCards.has(currentCard.id);
  const isAnswered = answeredCards.has(currentCard.id);

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-[#64748B]">卡片 {currentIndex + 1}/{totalCards}</span>
          <div className="flex-1 h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8B5CF6] transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            />
          </div>
          <span className="text-xs text-[#059669] font-medium">✓ {correctCount}</span>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm" style={{ perspective: "1000px" }}>
          <div
            className="relative w-full cursor-pointer transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              minHeight: "220px",
            }}
            onClick={() => !isFlipped && handleFlip(currentCard.id)}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-lg border border-[#E2E8F0] bg-white shadow-md flex items-center justify-center p-6"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center">
                  <span className="text-xl text-[#8B5CF6] font-bold">?</span>
                </div>
                <p className="text-[#1E293B] text-sm font-medium leading-relaxed">{currentCard.statement}</p>
                <p className="text-xs text-[#94A3B8] mt-3">点击翻开卡片</p>
              </div>
            </div>
            {/* Back */}
            <div
              className={`absolute inset-0 rounded-lg border p-5 flex flex-col items-center justify-center shadow-md ${
                currentCard.isCorrect
                  ? "border-[#059669]/40 bg-green-50"
                  : "border-[#DC2626]/40 bg-red-50"
              }`}
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">
                  {currentCard.isCorrect ? "✅" : "❌"}
                </div>
                <p className={`text-sm font-bold mb-2 ${currentCard.isCorrect ? "text-[#059669]" : "text-[#DC2626]"}`}>
                  {currentCard.isCorrect ? "陈述正确" : "陈述错误"}
                </p>
                <p className="text-xs text-[#64748B] leading-relaxed">{currentCard.explanation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 pt-2">
        {isFlipped && !isAnswered && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handleAnswer(currentCard.id, currentCard.isCorrect)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentCard.isCorrect
                  ? "bg-[#059669] text-white hover:bg-green-700"
                  : "bg-[#F5F5F7] border border-[#E2E8F0] text-[#1E293B] hover:bg-[#E2E8F0]"
              }`}
            >
              {currentCard.isCorrect ? "我知道是对的 ✓" : "我判断完成"}
            </button>
          </div>
        )}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            {currentIndex < totalCards - 1 ? "下一张卡片 ▶" : "查看结果"}
          </button>
        )}
      </div>
    </div>
  );
}
