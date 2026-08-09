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

  // Auto-complete if no nodes (empty level)
  useEffect(() => {
    if (totalNodes === 0 && phase === "opening") {
      const timer = setTimeout(() => {
        onComplete(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [totalNodes, phase, onComplete]);

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

  const handleRestart = useCallback(() => {
    setPhase("opening");
    setNodeIndex(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setCorrectCount(0);
    setDisplayedText("");
    setIsTyping(false);
  }, []);

  const passed = correctCount >= Math.ceil(totalNodes * 0.6);

  // ---- Opening phase ----
  if (phase === "opening") {
    return (
      <div className="relative flex flex-col h-full overflow-y-auto">
        {/* 场景背景 */}
        {hasScene && (
          <div className="absolute inset-0">
            <img
              src={data.sceneImage}
              alt="场景"
              className="w-full h-full object-cover"
            />
            {/* 从下到上的渐变遮罩：底部半透明→顶部微暗 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
          </div>
        )}

        {/* 内容 */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-6 min-h-full">
          <div className="max-w-sm w-full">
            <div className={`${hasScene ? "bg-black/40 backdrop-blur-md border border-white/15 shadow-lg shadow-black/10" : "bg-white border-[#E2E8F0]"} rounded-xl p-5 mb-4 shadow-sm`}>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${hasScene ? "text-white/90" : "text-[#1E293B]"}`}>
                {displayedText}
                {isTyping && <span className="inline-block w-0.5 h-4 bg-[#3B82F6] ml-1 animate-pulse" />}
              </p>
            </div>
            <button
              onClick={isTyping ? handleSkip : handleNext}
              className="w-full py-3 rounded-xl bg-[#3B82F6] text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-600/20"
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
          <button
            onClick={handleRestart}
            className="w-full py-2.5 mt-2 rounded-lg border-2 border-dashed border-[#FFD93D] text-[#FF6B35] text-sm font-bold hover:bg-[#FFD93D]/10 transition-colors"
          >
            🔄 重新开始（免费）
          </button>
        </div>
      </div>
    );
  }

  // ---- Dialogue phase ----
  const selectedOptionData = currentNode.options.find(o => o.id === selectedOption);

  return (
    <div className="relative flex flex-col h-full overflow-y-auto">
      {/* 场景背景 */}
      {hasScene && (
        <div className="absolute inset-0">
          <img
            src={data.sceneImage}
            alt="场景"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/10" />
        </div>
      )}

      {/* 内容区域 */}
      <div className="relative z-10 flex flex-col min-h-full">
        {/* Progress */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs ${hasScene ? "text-white/70" : "text-[#64748B]"}`}>
              步骤 {nodeIndex + 1}/{totalNodes}
            </span>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-[#3B82F6] transition-all duration-300 rounded-full"
                style={{ width: `${((nodeIndex + 1) / totalNodes) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 底部对话区 */}
        <div className="flex-1 flex flex-col justify-end px-4 pb-4">
          {/* 底部发光渐变，让过渡更自然 */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-0" />
          <div className="relative z-10">
            {/* 对话气泡 */}
          <div className={`${hasScene ? "bg-black/40 backdrop-blur-md border border-white/15 shadow-lg shadow-black/10" : "bg-white border-[#E2E8F0]"} rounded-xl p-4 mb-3 shadow-sm`}>
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
                let borderColor = hasScene ? "border-white/20 hover:border-[#3B82F6] hover:bg-white/15" : "border-[#E2E8F0] hover:border-[#3B82F6]";
                let bgColor = hasScene ? "bg-black/30 backdrop-blur-sm" : "bg-white";
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
              className="w-full py-3 rounded-xl bg-[#3B82F6] text-white text-sm font-bold hover:bg-blue-600 transition-colors mt-2 shadow-lg shadow-blue-600/20"
            >
              {nodeIndex < totalNodes - 1 ? "下一步 ▶" : "查看结果"}
            </button>
          )}
          </div>{/* end relative z-10 */}
        </div>
      </div>
    </div>
  );
}