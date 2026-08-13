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
    data.pairs.forEach((pair: any, idx: number) => {
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
        setTimeout(() => {
          setFlipped([]);
        }, 800);
      }
    }
  }, [flipped, matched, cards]);

  const passed = moves <= totalPairs * 3;

  // Intro
  if (phase === "intro") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center">
            <span className="text-2xl">🧠</span>
          </div>
          <h3 className="text-lg font-bold text-[#1E293B] mb-2">{data.title}</h3>
          <p className="text-[#64748B] text-sm mb-4">{data.intro}</p>
          <div className="text-xs text-[#94A3B8] mb-6">
            共 {totalPairs} 对卡片, 找到所有配对
          </div>
          <button
            onClick={() => { initCards(); setPhase("playing"); }}
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
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="text-lg font-bold text-[#059669] mb-2">通关成功!</h3>
              <p className="text-[#64748B] text-sm mb-2">你的记忆力和判断力都很出色!</p>
              <div className="text-xs text-[#94A3B8] mb-4">
                用时 {elapsed} 秒, 翻牌 {moves} 次
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">💪</div>
              <h3 className="text-lg font-bold text-[#D97706] mb-2">再练练</h3>
              <p className="text-[#64748B] text-sm mb-2">翻牌次数较多, 多练习可以更快!</p>
              <div className="text-xs text-[#94A3B8] mb-4">
                用时 {elapsed} 秒, 翻牌 {moves} 次
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
  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 shadow-sm">
          <span className="text-xs text-[#64748B] font-mono">⏱ {elapsed}s</span>
          <span className="text-xs text-[#1E293B] font-medium">已配对 {matched.size / 2}/{totalPairs}</span>
          <span className="text-xs text-[#64748B] font-mono">翻牌 {moves}次</span>
        </div>
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
                className={`aspect-square rounded-lg border text-xs font-medium flex items-center justify-center p-1 transition-all duration-300 shadow-sm ${
                  isMatched
                    ? "border-[#059669]/40 bg-green-50 text-[#059669] scale-95"
                    : isFlipped
                    ? card.type === "term"
                      ? "border-[#3B82F6]/40 bg-blue-50 text-[#3B82F6]"
                      : "border-[#8B5CF6]/40 bg-violet-50 text-[#8B5CF6]"
                    : "border-[#E2E8F0] bg-white text-[#94A3B8] hover:border-[#3B82F6]/40 hover:shadow"
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
