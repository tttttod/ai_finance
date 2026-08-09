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
            // Time's up - treat as wrong answer
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
          <div className="text-4xl mb-4">\u26A1</div>
          <h3 className="text-lg font-bold text-white mb-2">{data.title}</h3>
          <p className="text-slate-300 text-sm mb-4">{data.intro}</p>
          <div className="text-xs text-slate-400 mb-6">
            \u5171 {totalRounds} \u8F6E\uFF0C\u6BCF\u8F6E {data.timePerRound} \u79D2\uFF0C\u6B63\u786E\u7387\u9700\u8FBE {Math.round(data.passRate * 100)}%
          </div>
          <button
            onClick={() => setPhase("playing")}
            className="w-full py-3 rounded-lg bg-blue-600/80 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            \u5F00\u59CB\u6311\u6218
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
              <div className="text-5xl mb-4">\uD83C\uDFC6</div>
              <h3 className="text-lg font-bold text-emerald-400 mb-2">\u901A\u5173\u6210\u529F\uFF01</h3>
              <p className="text-slate-300 text-sm mb-2">\u4F60\u7684\u53CD\u5E94\u901F\u5EA6\u548C\u5224\u65AD\u529B\u90FD\u5F88\u51FA\u8272\uFF01</p>
              <div className="text-xs text-slate-400 mb-4">
                \u6B63\u786E\u7387\uFF1A{correctCount}/{totalRounds}
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">\u23F0</div>
              <h3 className="text-lg font-bold text-amber-400 mb-2">\u518D\u8BD5\u4E00\u6B21</h3>
              <p className="text-slate-300 text-sm mb-2">\u52A0\u5FEB\u53CD\u5E94\u901F\u5EA6\uFF0C\u4F60\u53EF\u4EE5\u7684\uFF01</p>
              <div className="text-xs text-slate-400 mb-4">
                \u6B63\u786E\u7387\uFF1A{correctCount}/{totalRounds}\uFF0C\u9700\u8981 {Math.ceil(totalRounds * data.passRate)} \u9898\u6B63\u786E
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

  // Playing
  const isCorrect = selectedOption === currentRoundData.correctIndex;
  const timeUp = timeLeft === 0 && selectedOption === null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">\u7B2C {currentRound + 1}/{totalRounds} \u8F6E</span>
          <div className={`text-sm font-bold font-mono ${timeLeft <= 3 ? "text-red-400 animate-pulse" : "text-white"}`}>
            {timeLeft}s
          </div>
          <span className="text-xs text-emerald-400">\u2713 {correctCount}</span>
        </div>
        {/* Timer bar */}
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 3 ? "bg-red-500" : "bg-blue-500"}`}
            style={{ width: `${(timeLeft / data.timePerRound) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 flex flex-col justify-center">
        <div className="bg-slate-800/80 border border-slate-600/50 rounded-lg p-4 mb-4">
          <p className="text-slate-100 text-sm font-medium text-center">{currentRoundData.question}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2">
          {currentRoundData.options.map((option, idx) => {
            let btnClass = "border-slate-600/50 bg-slate-800/60 hover:border-blue-500/50";
            if (showResult) {
              if (idx === currentRoundData.correctIndex) {
                btnClass = "border-emerald-500/50 bg-emerald-900/30";
              } else if (idx === selectedOption && idx !== currentRoundData.correctIndex) {
                btnClass = "border-red-500/50 bg-red-900/30";
              } else {
                btnClass = "border-slate-700/30 bg-slate-800/30 opacity-50";
              }
            }
            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={showResult}
                className={`p-3 rounded-lg border ${btnClass} text-sm text-slate-200 transition-all`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showResult && (
          <div className={`mt-4 p-3 rounded-lg ${timeUp ? "bg-amber-900/30 border border-amber-500/30" : isCorrect ? "bg-emerald-900/30 border border-emerald-500/30" : "bg-red-900/30 border border-red-500/30"}`}>
            <p className="text-xs text-slate-300">
              {timeUp ? "\u23F0 \u65F6\u95F4\u5230\uFF01" : isCorrect ? "\u2705 \u56DE\u7B54\u6B63\u786E\uFF01" : "\u274C \u56DE\u7B54\u9519\u8BEF"}
            </p>
            <p className="text-xs text-slate-400 mt-1">{currentRoundData.explanation}</p>
          </div>
        )}
      </div>

      {/* Next button */}
      {showResult && (
        <div className="px-4 pb-4">
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-lg bg-blue-600/80 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            {currentRound < totalRounds - 1 ? "\u4E0B\u4E00\u8F6E \u25B6" : "\u67E5\u770B\u7ED3\u679C"}
          </button>
        </div>
      )}
    </div>
  );
}
