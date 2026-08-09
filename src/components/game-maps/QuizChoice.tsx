"use client";

/**
 * 多邻国风格选择题组件
 * 四选一，即时反馈（正确/错误动画），答对加炒币
 */

import { useState, useCallback } from "react";
import { QUIZ_QUESTIONS, type QuizQuestion } from "./quiz-choice-data";

interface QuizChoiceProps {
  /** 当前关卡使用的题目范围 (0-based index into QUIZ_QUESTIONS) */
  questionIndices: number[];
  /** 已答对的题目ID列表 */
  correctQuizIds: number[];
  /** 记录答对的题目 */
  onQuizCorrect: (quizId: number) => void;
  /** 全部答完回调 */
  onComplete: () => void;
  /** 关闭 */
  onClose: () => void;
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

export function QuizChoice({
  questionIndices,
  correctQuizIds,
  onQuizCorrect,
  onComplete,
  onClose,
}: QuizChoiceProps) {
  const questions = questionIndices.map((i) => QUIZ_QUESTIONS[i]).filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLast = currentIndex >= totalQuestions - 1;

  const handleSelect = useCallback(
    (optionIdx: number) => {
      if (showResult || !currentQ) return;
      setSelectedOption(optionIdx);
      setShowResult(true);

      const isCorrect = optionIdx === currentQ.answer;
      if (isCorrect) {
        setCorrectCount((c) => c + 1);
        if (!correctQuizIds.includes(currentQ.id)) {
          onQuizCorrect(currentQ.id);
        }
      } else {
        setShakeWrong(true);
        setTimeout(() => setShakeWrong(false), 500);
      }
    },
    [showResult, currentQ, correctQuizIds, onQuizCorrect]
  );

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowResult(false);
    }
  }, [isLast, onComplete]);

  if (!currentQ) return null;

  const isCorrect = selectedOption === currentQ.answer;

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
        <div className="flex-1 h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 bg-[#3B82F6]"
            style={{ width: `${((currentIndex + (showResult ? 1 : 0)) / totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-[#64748B]">
          {currentIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* 计分 */}
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-[#64748B]">
          答对 <span className="font-bold text-[#059669]">{correctCount}</span> / {totalQuestions}
        </span>
        <span className="text-xs text-[#F59E0B] font-medium">
          每题 +10 炒币
        </span>
      </div>

      {/* 题目区域 */}
      <div className="flex-1 px-4 py-4 flex flex-col">
        {/* 分类标签 */}
        <div className="mb-3">
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[#3B82F6]/10 text-[#3B82F6]">
            {currentQ.category}
          </span>
        </div>

        {/* 题目 */}
        <h2 className="text-lg font-bold text-[#1E293B] mb-6 leading-relaxed">
          {currentQ.question}
        </h2>

        {/* 选项 */}
        <div className={`flex flex-col gap-3 ${shakeWrong ? "animate-[shake_0.3s_ease-in-out]" : ""}`}>
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isAnswer = idx === currentQ.answer;
            let borderColor = "#E2E8F0";
            let bgColor = "#FFFFFF";
            let textColor = "#1E293B";
            let labelBg = "#F1F5F9";
            let labelColor = "#64748B";

            if (showResult) {
              if (isAnswer) {
                borderColor = "#059669";
                bgColor = "#F0FDF4";
                textColor = "#059669";
                labelBg = "#059669";
                labelColor = "#FFFFFF";
              } else if (isSelected && !isCorrect) {
                borderColor = "#DC2626";
                bgColor = "#FEF2F2";
                textColor = "#DC2626";
                labelBg = "#DC2626";
                labelColor = "#FFFFFF";
              }
            } else if (isSelected) {
              borderColor = "#3B82F6";
              bgColor = "#EFF6FF";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className="flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all active:scale-[0.98] disabled:cursor-default"
                style={{
                  borderColor,
                  backgroundColor: bgColor,
                }}
              >
                <span
                  className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: labelBg, color: labelColor }}
                >
                  {OPTION_LABELS[idx]}
                </span>
                <span className="text-sm font-medium" style={{ color: textColor }}>
                  {option}
                </span>
                {showResult && isAnswer && (
                  <span className="ml-auto text-[#059669] text-lg">✓</span>
                )}
                {showResult && isSelected && !isCorrect && (
                  <span className="ml-auto text-[#DC2626] text-lg">✗</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 反馈区域 */}
        {showResult && (
          <div
            className="mt-6 p-4 rounded-lg border"
            style={{
              backgroundColor: isCorrect ? "#F0FDF4" : "#FEF2F2",
              borderColor: isCorrect ? "#BBF7D0" : "#FECACA",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{isCorrect ? "🎉" : "💡"}</span>
              <span
                className="text-sm font-bold"
                style={{ color: isCorrect ? "#059669" : "#DC2626" }}
              >
                {isCorrect ? "回答正确！+10 炒币" : "答错了，记住正确答案"}
              </span>
            </div>
            {!isCorrect && (
              <p className="text-xs text-[#64748B] mt-1">
                正确答案是 <span className="font-bold text-[#059669]">{OPTION_LABELS[currentQ.answer]}. {currentQ.options[currentQ.answer]}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="px-4 pb-6 pt-2">
        {showResult ? (
          <button
            onClick={handleNext}
            className="w-full h-12 rounded-lg bg-[#3B82F6] text-white font-semibold text-sm transition-all active:scale-[0.98]"
          >
            {isLast ? `完成答题 获得 ${correctCount * 10} 炒币` : "下一题 →"}
          </button>
        ) : (
          <div className="text-center text-xs text-[#94A3B8] py-3">
            选择一个答案
          </div>
        )}
      </div>

      {/* shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
