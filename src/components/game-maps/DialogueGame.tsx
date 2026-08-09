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
            <div className="bg-slate-800/80 border border-slate-600/50 rounded-lg p-5 mb-4">
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-mono">
                {displayedText}
                {isTyping && <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse" />}
              </p>
            </div>
            <button
              onClick={isTyping ? handleSkip : handleNext}
              className="w-full py-3 rounded-lg bg-blue-600/80 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              {isTyping ? "\u8DF3\u8FC7 \u25B6" : "\u7EE7\u7EED \u25B6"}
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
              <div className="text-5xl mb-4">\uD83C\uDF89</div>
              <h3 className="text-lg font-bold text-emerald-400 mb-2">\u901A\u5173\u6210\u529F\uFF01</h3>
              <p className="text-slate-300 text-sm mb-4 whitespace-pre-line">{data.goodEnding}</p>
              <div className="text-xs text-slate-400 mb-4">
                \u6B63\u786E\u7387\uFF1A{correctCount}/{totalNodes}
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">\uD83D\uDCAB</div>
              <h3 className="text-lg font-bold text-amber-400 mb-2">\u518D\u8BD5\u4E00\u6B21</h3>
              <p className="text-slate-300 text-sm mb-4 whitespace-pre-line">{data.badEnding}</p>
              <div className="text-xs text-slate-400 mb-4">
                \u6B63\u786E\u7387\uFF1A{correctCount}/{totalNodes}\uFF0C\u9700\u8981 {Math.ceil(totalNodes * 0.6)} \u9898\u6B63\u786E
              </div>
            </>
          )}
          <button
            onClick={() => onComplete(passed)}
            className="w-full py-3 rounded-lg bg-blue-600/80 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            {passed ? "\u7EE7\u7EED\u524D\u8FDB" : "\u91CD\u65B0\u6311\u6218"}
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
          <span className="text-xs text-slate-400">\u6B65\u9AA4 {nodeIndex + 1}/{totalNodes}</span>
          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((nodeIndex + 1) / totalNodes) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scene */}
      <div className="flex-1 px-4 overflow-y-auto">
        <div className="bg-slate-800/80 border border-slate-600/50 rounded-lg p-4 mb-4">
          <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-mono">
            {displayedText}
            {isTyping && <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse" />}
          </p>
          {isTyping && (
            <button onClick={handleSkip} className="mt-2 text-xs text-slate-400 hover:text-slate-200">
              \u70B9\u51FB\u8DF3\u8FC7 \u25B6
            </button>
          )}
        </div>

        {/* Options */}
        {!isTyping && (
          <div className="space-y-2 mb-4">
            {currentNode.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const showResult = showFeedback && isSelected;
              let borderColor = "border-slate-600/50 hover:border-blue-500/50";
              if (showFeedback) {
                if (isSelected) {
                  borderColor = option.correct ? "border-emerald-500/50" : "border-red-500/50";
                } else {
                  borderColor = "border-slate-700/30 opacity-50";
                }
              }
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showFeedback}
                  className={`w-full text-left p-3 rounded-lg border ${borderColor} bg-slate-800/60 transition-all text-sm`}
                >
                  <span className="text-slate-200">{option.text}</span>
                  {showResult && (
                    <span className={`ml-2 text-xs ${option.correct ? "text-emerald-400" : "text-red-400"}`}>
                      {option.correct ? "\u2713 \u6B63\u786E" : "\u2717 \u9519\u8BEF"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback */}
        {showFeedback && selectedOptionData && (
          <div className={`p-3 rounded-lg mb-4 ${selectedOptionData.correct ? "bg-emerald-900/30 border border-emerald-500/30" : "bg-red-900/30 border border-red-500/30"}`}>
            <p className="text-xs text-slate-300 whitespace-pre-line">{selectedOptionData.feedback}</p>
          </div>
        )}
      </div>

      {/* Next button */}
      {showFeedback && (
        <div className="px-4 pb-4">
          <button
            onClick={handleNextNode}
            className="w-full py-3 rounded-lg bg-blue-600/80 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            {nodeIndex < totalNodes - 1 ? "\u4E0B\u4E00\u6B65 \u25B6" : "\u67E5\u770B\u7ED3\u679C"}
          </button>
        </div>
      )}
    </div>
  );
}
