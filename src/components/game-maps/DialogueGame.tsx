"use client";

import { useState, useEffect, useCallback } from "react";
import type { DialogueLevelData, DialogueNode } from "./game-data";

interface DialogueGameProps {
  data: DialogueLevelData;
  onComplete: (passed: boolean) => void;
}

export function DialogueGame({ data, onComplete }: DialogueGameProps) {
  const [phase, setPhase] = useState<"opening" | "dialogue" | "result">("opening");
  const [nodeIndex, setNodeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const currentNode = data.nodes[nodeIndex];
  const totalNodes = data.nodes.length;

  // Typewriter effect
  useEffect(() => {
    if (phase === "opening" || phase === "dialogue") {
      const text = phase === "opening" ? data.opening : currentNode.scene;
      setIsTyping(true);
      setDisplayedText("");
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [phase, nodeIndex, data.opening, currentNode?.scene]);

  const handleSkip = useCallback(() => {
    if (isTyping) {
      const text = phase === "opening" ? data.opening : currentNode.scene;
      setDisplayedText(text);
      setIsTyping(false);
    }
  }, [isTyping, phase, data.opening, currentNode?.scene]);

  const handleNext = useCallback(() => {
    if (isTyping) {
      handleSkip();
      return;
    }
    if (phase === "opening") {
      setPhase("dialogue");
    }
  }, [isTyping, phase, handleSkip]);

  const handleOptionSelect = useCallback((optionId: string) => {
    if (showFeedback) return;
    setSelectedOption(optionId);
    setShowFeedback(true);
    const option = currentNode.options.find(o => o.id === optionId);
    if (option?.correct) {
      setCorrectCount(prev => prev + 1);
    }
  }, [showFeedback, currentNode]);

  const handleNextNode = useCallback(() => {
    setShowFeedback(false);
    setSelectedOption(null);
    if (nodeIndex < totalNodes - 1) {
      setNodeIndex(prev => prev + 1);
    } else {
      setPhase("result");
    }
  }, [nodeIndex, totalNodes]);

  const passed = correctCount >= Math.ceil(totalNodes * 0.6);

  // Opening phase
  if (phase === "opening") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-sm w-full">
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 mb-4 shadow-sm">
              <p className="text-[#1E293B] text-sm leading-relaxed whitespace-pre-line">
                {displayedText}
                {isTyping && <span className="inline-block w-0.5 h-4 bg-[#3B82F6] ml-1 animate-pulse" />}
              </p>
            </div>
            <button
              onClick={isTyping ? handleSkip : handleNext}
              className="w-full py-3 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              {isTyping ? "跳过 ▶" : "继续 ▶"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Result phase
  if (phase === "result") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          {passed ? (
            <>
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-lg font-bold text-[#059669] mb-2">通关成功!</h3>
              <p className="text-[#64748B] text-sm mb-4 whitespace-pre-line">{data.goodEnding}</p>
              <div className="text-xs text-[#94A3B8] mb-4">
                正确率: {correctCount}/{totalNodes}
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">💫</div>
              <h3 className="text-lg font-bold text-[#D97706] mb-2">再试一次</h3>
              <p className="text-[#64748B] text-sm mb-4 whitespace-pre-line">{data.badEnding}</p>
              <div className="text-xs text-[#94A3B8] mb-4">
                正确率: {correctCount}/{totalNodes}, 需要 {Math.ceil(totalNodes * 0.6)} 题正确
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

  // Dialogue phase
  const selectedOptionData = currentNode.options.find(o => o.id === selectedOption);

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-[#64748B]">步骤 {nodeIndex + 1}/{totalNodes}</span>
          <div className="flex-1 h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3B82F6] transition-all duration-300"
              style={{ width: `${((nodeIndex + 1) / totalNodes) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scene */}
      <div className="flex-1 px-4 overflow-y-auto">
        {/* Dialogue bubble */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 mb-4 shadow-sm">
          <p className="text-[#1E293B] text-sm leading-relaxed whitespace-pre-line">
            {displayedText}
            {isTyping && <span className="inline-block w-0.5 h-4 bg-[#3B82F6] ml-1 animate-pulse" />}
          </p>
          {isTyping && (
            <button onClick={handleSkip} className="mt-2 text-xs text-[#64748B] hover:text-[#3B82F6]">
              点击跳过 ▶
            </button>
          )}
        </div>

        {/* Options */}
        {!isTyping && (
          <div className="space-y-2 mb-4">
            {currentNode.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const showResult = showFeedback && isSelected;
              let borderColor = "border-[#E2E8F0] hover:border-[#3B82F6]";
              let bgColor = "bg-white";
              if (showFeedback) {
                if (isSelected) {
                  borderColor = option.correct ? "border-[#059669]" : "border-[#DC2626]";
                  bgColor = option.correct ? "bg-green-50" : "bg-red-50";
                } else {
                  borderColor = "border-[#E2E8F0] opacity-50";
                  bgColor = "bg-white";
                }
              }
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showFeedback}
                  className={`w-full text-left p-3 rounded-lg border ${borderColor} ${bgColor} transition-all text-sm shadow-sm`}
                >
                  <span className="text-[#1E293B]">{option.text}</span>
                  {showResult && (
                    <span className={`ml-2 text-xs font-medium ${option.correct ? "text-[#059669]" : "text-[#DC2626]"}`}>
                      {option.correct ? "✓ 正确" : "✗ 错误"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback */}
        {showFeedback && selectedOptionData && (
          <div className={`p-3 rounded-lg mb-4 border ${selectedOptionData.correct ? "bg-green-50 border-[#059669]/30" : "bg-red-50 border-[#DC2626]/30"}`}>
            <p className="text-xs text-[#1E293B] whitespace-pre-line leading-relaxed">{selectedOptionData.feedback}</p>
          </div>
        )}
      </div>

      {/* Next button */}
      {showFeedback && (
        <div className="px-4 pb-4">
          <button
            onClick={handleNextNode}
            className="w-full py-3 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            {nodeIndex < totalNodes - 1 ? "下一步 ▶" : "查看结果"}
          </button>
        </div>
      )}
    </div>
  );
}
