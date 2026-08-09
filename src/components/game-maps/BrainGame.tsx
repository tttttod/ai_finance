"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { BrainLevelData } from "./game-data";

interface BrainGameProps {
  data: BrainLevelData;
  onComplete: (passed: boolean) => void;
}

interface CardItem {
  id: string;
  text: string;
  pairId: string;
  type: "term" | "definition";
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function BrainGame({ data, onComplete }: BrainGameProps) {
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPairs = data.pairs.length;

  const initCards = useCallback(() => {
    const items: CardItem[] = [];
    data.pairs.forEach((pair, idx) => {
      items.push({ id: `t-${idx}`, text: pair.term, pairId: `p-${idx}`, type: "term" });
      items.push({ id: `d-${idx}`, text: pair.definition, pairId: `p-${idx}`, type: "definition" });
    });
    setCards(shuffleArray(items));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setStartTime(Date.now());
    setElapsed(0);
  }, [data.pairs]);

  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase, startTime]);

  useEffect(() => {
    if (matched.size === totalPairs * 2 && totalPairs > 0 && phase === "playing") {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase("result");
    }
  }, [matched.size, totalPairs, phase]);

  const handleCardClick = useCallback((cardId: string) => {
    if (flipped.length >= 2) return;
    if (flipped.includes(cardId)) return;
    if (matched.has(cardId)) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = newFlipped;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId && firstCard.type !== secondCard.type) {
        // Match!
        setTimeout(() => {
          setMatched(prev => {
            const next = new Set(prev);
            next.add(first);
            next.add(second);
            return next;
          });
          setFlipped([]);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setFlipped([]);
        }, 800);
      }
    }
  }, [flipped, matched, cards]);

  const passed = moves <= totalPairs * 3; // generous threshold

  // Intro
  if (phase === "intro") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          <div className="text-4xl mb-4">\uD83E\uDDE0</div>
          <h3 className="text-lg font-bold text-white mb-2">{data.title}</h3>
          <p className="text-slate-300 text-sm mb-4">{data.intro}</p>
          <div className="text-xs text-slate-400 mb-6">
            \u5171 {totalPairs} \u5BF9\u5361\u7247\uFF0C\u627E\u5230\u6240\u6709\u914D\u5BF9
          </div>
          <button
            onClick={() => { initCards(); setPhase("playing"); }}
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
              <div className="text-5xl mb-4">\uD83C\uDF1F</div>
              <h3 className="text-lg font-bold text-emerald-400 mb-2">\u901A\u5173\u6210\u529F\uFF01</h3>
              <p className="text-slate-300 text-sm mb-2">\u4F60\u7684\u8BB0\u5FC6\u529B\u548C\u5224\u65AD\u529B\u90FD\u5F88\u51FA\u8272\uFF01</p>
              <div className="text-xs text-slate-400 mb-4">
                \u7528\u65F6 {elapsed} \u79D2\uFF0C\u7FFB\u724C {moves} \u6B21
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">\uD83D\uDCAA</div>
              <h3 className="text-lg font-bold text-amber-400 mb-2">\u518D\u7EC3\u7EC3</h3>
              <p className="text-slate-300 text-sm mb-2">\u7FFB\u724C\u6B21\u6570\u8F83\u591A\uFF0C\u591A\u7EC3\u4E60\u53EF\u4EE5\u66F4\u5FEB\uFF01</p>
              <div className="text-xs text-slate-400 mb-4">
                \u7528\u65F6 {elapsed} \u79D2\uFF0C\u7FFB\u724C {moves} \u6B21
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
  return (
    <div className="flex flex-col h-full">
      {/* Stats */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">\u23F1 {elapsed}s</span>
        <span className="text-xs text-slate-400">\u5DF2\u914D\u5BF9 {matched.size / 2}/{totalPairs}</span>
        <span className="text-xs text-slate-400">\u7FFB\u724C {moves}\u6B21</span>
      </div>

      {/* Grid */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id) || matched.has(card.id);
            const isMatched = matched.has(card.id);
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={isMatched}
                className={`aspect-square rounded-lg border text-xs font-medium flex items-center justify-center p-1 transition-all duration-300 ${
                  isMatched
                    ? "border-emerald-500/50 bg-emerald-900/30 text-emerald-300 scale-95"
                    : isFlipped
                    ? card.type === "term"
                      ? "border-blue-500/50 bg-blue-900/40 text-blue-200"
                      : "border-purple-500/50 bg-purple-900/40 text-purple-200"
                    : "border-slate-600/50 bg-slate-800/80 text-slate-400 hover:border-slate-500"
                }`}
              >
                <span className="text-center leading-tight" style={{ fontSize: "10px" }}>
                  {isFlipped ? card.text : "?"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
