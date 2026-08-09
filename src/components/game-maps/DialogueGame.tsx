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
  const hasScene = !!data.sceneImage;

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

  // ---- Opening phase ----
  if (phase === "opening") {
    return (
      <div className="relative flex flex-col h-full overflow-hidden">
        {/* 场景背景 */}
        {hasScene && (
          <div className="absolute inset-0">
            <img
              src={data.sceneImage}
              alt="场景"
              className="w-full h-full object-cover"
            />
            {/* 从下到上的渐变遮罩：底部全黑→顶部半透明 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
          </div>
        )}

        {/* 内容 */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-6">
          <div className="max-w-sm w-full">
            <div className={`${hasScene ? "bg-black/60 backdrop-blur-sm border border-white/10" : "bg-white border-[#E2E8F0]"} rounded-lg p-5 mb-4 shadow-sm`}>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${hasScene ? "text-white/90" : "text-[#1E293B]"}`}>
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

  // ---- Result phase ----
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

  // ---- Dialogue phase ----
  const selectedOptionData = currentNode.options.find(o => o.id === selectedOption);

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* 场景背景 */}
      {hasScene && (
        <div className="absolute inset-0">
          <img
            src={data.sceneImage}
            alt="场景"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
        </div>
      )}

      {/* 内容区域 */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Progress */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs ${hasScene ? "text-white/60" : "text-[#64748B]"}`}>
              步骤 {nodeIndex + 1}/{totalNodes}
            </span>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3B82F6] transition-all duration-300"
                style={{ width: `${((nodeIndex + 1) / totalNodes) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 底部对话区 */}
        <div className="flex-1 flex flex-col justify-end px-4 pb-4">
          {/* 对话气泡 */}
          <div className={`${hasScene ? "bg-black/60 backdrop-blur-sm border border-white/10" : "bg-white border-[#E2E8F0]"} rounded-lg p-4 mb-3 shadow-sm`}>
            <p className={`text-sm leading-relaxed whitespace-pre-line ${hasScene ? "text-white/90" : "text-[#1E293B]"}`}>
              {displayedText}
              {isTyping && <span className="inline-block w-0.5 h-4 bg-[#3B82F6] ml-1 animate-pulse" />}
            </p>
            {isTyping && (
              <button onClick={handleSkip} className={`mt-2 text-xs ${hasScene ? "text-white/50 hover:text-white" : "text-[#64748B] hover:text-[#3B82F6]"}`}>
                点击跳过 ▶
              </button>
            )}
          </div>

          {/* Options */}
          {!isTyping && (
            <div className="space-y-2 mb-1">
              {currentNode.options.map((option) => {
                const isSelected = selectedOption === option.id;
                const showResult = showFeedback && isSelected;
                let borderColor = hasScene ? "border-white/20 hover:border-[#3B82F6]" : "border-[#E2E8F0] hover:border-[#3B82F6]";
                let bgColor = hasScene ? "bg-black/50 backdrop-blur-sm" : "bg-white";
                if (showFeedback) {
                  if (isSelected) {
                    borderColor = option.correct ? "border-[#059669]" : "border-[#DC2626]";
                    bgColor = option.correct ? "bg-green-900/60" : "bg-red-900/60";
                  } else {
                    borderColor = "border-white/10 opacity-50";
                    bgColor = "bg-black/30";
                  }
                }
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={showFeedback}
                    className={`w-full text-left p-3 rounded-lg border ${borderColor} ${bgColor} transition-all text-sm shadow-sm`}
                  >
                    <span className={hasScene ? "text-white/90" : "text-[#1E293B]"}>
                      {option.text}
                    </span>
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
            <div className={`p-3 rounded-lg mb-1 border backdrop-blur-sm ${selectedOptionData.correct ? "bg-green-900/60 border-[#059669]/30" : "bg-red-900/60 border-[#DC2626]/30"}`}>
              <p className="text-xs text-white/90 whitespace-pre-line leading-relaxed">{selectedOptionData.feedback}</p>
            </div>
          )}

          {/* Next button */}
          {showFeedback && (
            <button
              onClick={handleNextNode}
              className="w-full py-3 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-blue-600 transition-colors mt-2"
            >
              {nodeIndex < totalNodes - 1 ? "下一步 ▶" : "查看结果"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}