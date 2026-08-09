"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { MiniGameLevelData } from "./game-data";

interface MiniGameProps {
  data: MiniGameLevelData;
  onComplete: (passed: boolean) => void;
}

export function MiniGame({ data, onComplete }: MiniGameProps) {
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [currentRound, setCurrentRound] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalRounds = data.rounds.length;
  const currentRoundData = data.rounds[currentRound];

  // Timer
  useEffect(() => {
    if (phase === "playing" && !showResult) {
      setTimeLeft(data.timePerRound);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setShowResult(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase, currentRound, showResult, data.timePerRound]);

  const handleOptionSelect = useCallback((index: number) => {
    if (showResult) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(index);
    setShowResult(true);
    if (index === currentRoundData.correctIndex) {
      setCorrectCount(prev => prev + 1);
    }
  }, [showResult, currentRoundData]);

  const handleNext = useCallback(() => {
    setShowResult(false);
    setSelectedOption(null);
    if (currentRound < totalRounds - 1) {
      setCurrentRound(prev => prev + 1);
    } else {
      setPhase("result");
    }
  }, [currentRound, totalRounds]);

  const passed = correctCount >= Math.ceil(totalRounds * data.passRate);

  // Intro
  if (phase === "intro") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-bold text-[#1E293B] mb-2">{data.title}</h3>
          <p className="text-[#64748B] text-sm mb-4">{data.intro}</p>
          <div className="text-xs text-[#94A3B8] mb-6">
            共 {totalRounds} 轮, 每轮 {data.timePerRound} 秒, 正确率需达 {Math.round(data.passRate * 100)}%
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
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-lg font-bold text-[#059669] mb-2">通关成功!</h3>
              <p className="text-[#64748B] text-sm mb-2">你的反应速度和判断力都很出色!</p>
              <div className="text-xs text-[#94A3B8] mb-4">
                正确率: {correctCount}/{totalRounds}
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-lg font-bold text-[#D97706] mb-2">再试一次</h3>
              <p className="text-[#64748B] text-sm mb-2">加快反应速度, 你可以的!</p>
              <div className="text-xs text-[#94A3B8] mb-4">
                正确率: {correctCount}/{totalRounds}, 需要 {Math.ceil(totalRounds * data.passRate)} 题正确
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

  // Playing
  const isCorrect = selectedOption === currentRoundData.correctIndex;
  const timeUp = timeLeft === 0 && selectedOption === null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#64748B]">第 {currentRound + 1}/{totalRounds} 轮</span>
          <div className={`text-sm font-bold font-mono ${timeLeft <= 3 ? "text-[#DC2626] animate-pulse" : "text-[#1E293B]"}`}>
            {timeLeft}s
          </div>
          <span className="text-xs text-[#059669] font-medium">✓ {correctCount}</span>
        </div>
        {/* Timer bar */}
        <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${timeLeft <= 3 ? "bg-[#DC2626]" : "bg-[#3B82F6]"}`}
            style={{ width: `${(timeLeft / data.timePerRound) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 flex flex-col justify-center">
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 mb-4 shadow-sm">
          <p className="text-[#1E293B] text-sm font-medium text-center leading-relaxed">{currentRoundData.question}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2">
          {currentRoundData.options.map((option, idx) => {
            let btnClass = "border-[#E2E8F0] bg-white hover:border-[#3B82F6]/40 hover:shadow-sm";
            if (showResult) {
              if (idx === currentRoundData.correctIndex) {
                btnClass = "border-[#059669] bg-green-50";
              } else if (idx === selectedOption && idx !== currentRoundData.correctIndex) {
                btnClass = "border-[#DC2626] bg-red-50";
              } else {
                btnClass = "border-[#E2E8F0] bg-[#F5F5F7] opacity-50";
              }
            }
            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={showResult}
                className={`p-3 rounded-lg border ${btnClass} text-sm text-[#1E293B] transition-all shadow-sm`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showResult && (
          <div className={`mt-4 p-3 rounded-lg border ${timeUp ? "bg-amber-50 border-amber-200" : isCorrect ? "bg-green-50 border-[#059669]/30" : "bg-red-50 border-[#DC2626]/30"}`}>
            <p className="text-xs text-[#1E293B] font-medium">
              {timeUp ? "⏰ 时间到!" : isCorrect ? "✅ 回答正确!" : "❌ 回答错误"}
            </p>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{currentRoundData.explanation}</p>
          </div>
        )}
      </div>

      {/* Next button */}
      {showResult && (
        <div className="px-4 pb-4">
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            {currentRound < totalRounds - 1 ? "下一轮 ▶" : "查看结果"}
          </button>
        </div>
      )}
    </div>
  );
}
