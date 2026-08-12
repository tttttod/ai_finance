"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Level4Data } from "./types";
import { priceChangeFromDuration } from "./game-engine";
import { GameHeader } from "./GameUI";

interface Level4Props {
  data: Level4Data;
  onSubmit: (bondId: string) => void;
}

export function Level4DurationSniper({ data, onSubmit }: Level4Props) {
  const [phase, setPhase] = useState<"info" | "shock" | "result">("info");
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { bonds, shockBp, correctBondId } = data;

  const startShock = useCallback(() => {
    setPhase("shock");
    setTimeLeft(20);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSelect = (bondId: string) => {
    if (showResult) return;
    setSelected(bondId);
    if (timerRef.current) clearInterval(timerRef.current);
    setShowResult(true);

    setTimeout(() => {
      onSubmit(bondId);
    }, 2500);
  };

  const handleTimeout = () => {
    if (timeLeft === 0 && !selected) {
      setShowResult(true);
      setTimeout(() => {
        onSubmit("");
      }, 2500);
    }
  };

  useEffect(() => {
    if (timeLeft === 0 && !selected) {
      handleTimeout();
    }
  }, [timeLeft, selected]);

  // Calculate price changes
  const shockDecimal = shockBp / 10000;
  const bondResults = bonds.map(b => {
    const change = priceChangeFromDuration(b.duration, 0, shockDecimal);
    return { ...b, priceChange: change * 100, newPrice: 100 * (1 + change) };
  });

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <GameHeader levelId="level4" title="Duration Sniper" />

      <div className="px-4 md:px-6 space-y-4">
        {phase === "info" && (
          <>
            {/* Bond cards */}
            <div>
              <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">AVAILABLE BONDS</div>
              <div className="space-y-2">
                {bonds.map((bond) => (
                  <div key={bond.id} className="px-4 py-3 rounded-lg border border-[#1E293B] bg-[#0F1117]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-[#E2E8F0]">{bond.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6]">
                        {bond.id}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#475569]">DURATION</span>
                        <div className="text-sm font-mono font-bold text-[#8B5CF6]">{bond.duration}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#475569]">YIELD</span>
                        <div className="text-sm font-mono font-bold text-[#3B82F6]">{bond.yield.toFixed(2)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula hint */}
            <div className="px-4 py-3 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5">
              <div className="text-[10px] font-mono text-[#F59E0B] tracking-wider mb-1">KEY FORMULA</div>
              <div className="text-xs font-mono text-[#CBD5E1]">
                ΔP/P ≈ -Duration × ΔYield
              </div>
              <div className="text-[10px] text-[#64748B] mt-1">
                Higher duration = greater price sensitivity to yield changes
              </div>
            </div>

            <button
              onClick={startShock}
              className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #EF4444, #DC2626)",
                boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
              }}
            >
              TRIGGER MARKET EVENT
            </button>
          </>
        )}

        {phase === "shock" && (
          <>
            {/* Shock alert */}
            <div className="px-4 py-4 rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 text-center animate-pulse">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="text-sm font-bold text-[#EF4444]">MARKET SHOCK DETECTED</div>
              <div className="text-lg font-mono font-bold text-[#E2E8F0] mt-1">
                Yield +{shockBp}bp
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <div className="text-[10px] font-mono text-[#475569] mb-1">TIME REMAINING</div>
              <div className={`text-3xl font-mono font-bold ${timeLeft <= 5 ? "text-[#EF4444]" : timeLeft <= 10 ? "text-[#F59E0B]" : "text-[#E2E8F0]"}`}>
                {timeLeft}s
              </div>
            </div>

            {/* Question */}
            <div className="text-center">
              <div className="text-sm font-bold text-[#E2E8F0] mb-1">
                Which bond&apos;s price drops the MOST?
              </div>
              <div className="text-[10px] text-[#64748B]">Select the correct answer quickly!</div>
            </div>

            {/* Bond selection */}
            <div className="space-y-2">
              {bonds.map((bond) => {
                const isSelected = selected === bond.id;
                const isCorrect = bond.id === correctBondId;
                const showCorrectness = showResult;

                return (
                  <button
                    key={bond.id}
                    onClick={() => handleSelect(bond.id)}
                    disabled={showResult}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-300 ${
                      showCorrectness
                        ? isCorrect
                          ? "border-[#10B981] bg-[#10B981]/10"
                          : isSelected
                            ? "border-[#EF4444] bg-[#EF4444]/10"
                            : "border-[#1E293B] bg-[#0F1117] opacity-50"
                        : isSelected
                          ? "border-[#3B82F6] bg-[#3B82F6]/10"
                          : "border-[#1E293B] bg-[#0F1117] hover:border-[#334155]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold" style={{
                          color: showCorrectness ? (isCorrect ? "#10B981" : isSelected ? "#EF4444" : "#94A3B8") : isSelected ? "#3B82F6" : "#E2E8F0"
                        }}>
                          {bond.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#475569]">Duration: {bond.duration}</div>
                      </div>
                      {showCorrectness && isCorrect && (
                        <span className="text-xs font-bold text-[#10B981]">✓ CORRECT</span>
                      )}
                      {showCorrectness && isSelected && !isCorrect && (
                        <span className="text-xs font-bold text-[#EF4444]">✗ WRONG</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Show calculation after result */}
            {showResult && (
              <div className="px-4 py-3 rounded-lg border border-[#1E293B] bg-[#0F1117]">
                <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">PRICE CHANGE CALCULATION</div>
                <div className="space-y-2">
                  {bondResults.map((b) => (
                    <div key={b.id} className="flex items-center justify-between">
                      <span className="text-xs text-[#94A3B8]">{b.name}</span>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold" style={{ color: b.id === correctBondId ? "#EF4444" : "#F59E0B" }}>
                          {b.priceChange.toFixed(2)}%
                        </span>
                        <span className="text-[10px] text-[#475569] ml-2">
                          ({b.duration} × {shockBp}bp)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
