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
          <div className="text-4xl mb-4">\uD83C\uDCCF</div>
          <h3 className="text-lg font-bold text-white mb-2">{data.title}</h3>
          <p className="text-slate-300 text-sm mb-4">{data.intro}</p>
          <div className="text-xs text-slate-400 mb-6">
            \u5171 {totalCards} \u5F20\u5361\u7247\uFF0C\u6B63\u786E\u7387\u9700\u8FBE {Math.round(data.passRate * 100)}%
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
              <div className="text-5xl mb-4">\uD83C\uDF89</div>
              <h3 className="text-lg font-bold text-emerald-400 mb-2">\u901A\u5173\u6210\u529F\uFF01</h3>
              <p className="text-slate-300 text-sm mb-2">
                \u4F60\u7684\u91D1\u878D\u77E5\u8BC6\u50A8\u5907\u5DF2\u8FBE\u6807\u3002
              </p>
              <div className="text-xs text-slate-400 mb-4">
                \u6B63\u786E\u7387\uFF1A{correctCount}/{totalCards}
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">\uD83D\uDCDA</div>
              <h3 className="text-lg font-bold text-amber-400 mb-2">\u7EE7\u7EED\u5B66\u4E60</h3>
              <p className="text-slate-300 text-sm mb-2">
                \u91D1\u878D\u77E5\u8BC6\u8FD8\u9700\u8981\u52A0\u5F3A\uFF0C\u518D\u8BD5\u4E00\u6B21\u5427\uFF01
              </p>
              <div className="text-xs text-slate-400 mb-4">
                \u6B63\u786E\u7387\uFF1A{correctCount}/{totalCards}\uFF0C\u9700\u8981 {Math.ceil(totalCards * data.passRate)} \u9898\u6B63\u786E
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

  // Playing - flip card
  const isFlipped = flippedCards.has(currentCard.id);
  const isAnswered = answeredCards.has(currentCard.id);

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-slate-400">\u5361\u7247 {currentIndex + 1}/{totalCards}</span>
          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            />
          </div>
          <span className="text-xs text-emerald-400">\u2713 {correctCount}</span>
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
              className="absolute inset-0 rounded-xl border border-slate-600/50 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-6"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-center">
                <div className="text-3xl mb-3">\u2753</div>
                <p className="text-slate-200 text-sm font-medium">{currentCard.statement}</p>
                <p className="text-xs text-slate-500 mt-3">\u70B9\u51FB\u7FFB\u5F00\u5361\u7247</p>
              </div>
            </div>
            {/* Back */}
            <div
              className={`absolute inset-0 rounded-xl border p-5 flex flex-col items-center justify-center ${
                currentCard.isCorrect
                  ? "border-emerald-500/50 bg-gradient-to-br from-emerald-900/40 to-slate-900"
                  : "border-red-500/50 bg-gradient-to-br from-red-900/40 to-slate-900"
              }`}
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">
                  {currentCard.isCorrect ? "\u2705" : "\u274C"}
                </div>
                <p className={`text-sm font-bold mb-2 ${currentCard.isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                  {currentCard.isCorrect ? "\u9648\u8FF0\u6B63\u786E" : "\u9648\u8FF0\u9519\u8BEF"}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">{currentCard.explanation}</p>
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
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentCard.isCorrect
                  ? "bg-emerald-600/80 text-white hover:bg-emerald-600"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {currentCard.isCorrect ? "\u6211\u77E5\u9053\u662F\u5BF9\u7684 \u2713" : "\u6211\u5224\u65AD\u5B8C\u6210"}
            </button>
          </div>
        )}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-lg bg-blue-600/80 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            {currentIndex < totalCards - 1 ? "\u4E0B\u4E00\u5F20\u5361\u7247 \u25B6" : "\u67E5\u770B\u7ED3\u679C"}
          </button>
        )}
      </div>
    </div>
  );
}
