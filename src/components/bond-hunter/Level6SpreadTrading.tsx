"use client";

import { useState } from "react";
import type { Level6Data } from "./types";
import { GameHeader, SubmitButton } from "./GameUI";
import { priceChangeFromDuration } from "./game-engine";

interface Level6Props {
  data: Level6Data;
  onSubmit: (choice: string) => void;
}

export function Level6SpreadTrading({ data, onSubmit }: Level6Props) {
  const [choice, setChoice] = useState<string | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const { bondA, bondB, actualSpreadChange } = data;

  // Calculate returns based on spread change
  const spreadChangeDecimal = actualSpreadChange / 10000;
  const bondAReturn = priceChangeFromDuration(bondA.duration, 0, spreadChangeDecimal) * 100;
  const bondBReturn = priceChangeFromDuration(bondB.duration, 0, spreadChangeDecimal) * 100;

  const newSpreadB = bondB.spread + actualSpreadChange;
  const newSpreadA = bondA.spread + Math.round(actualSpreadChange * 0.3);

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <GameHeader levelId="level6" title="Spread Trading" />

      <div className="px-4 md:px-6 space-y-4">
        {/* Bond comparison */}
        <div className="grid grid-cols-2 gap-3">
          {/* Bond A */}
          <div className={`px-4 py-3 rounded-lg border transition-all duration-300 ${
            choice === "A" ? "border-[#3B82F6] bg-[#3B82F6]/5" : "border-[#1E293B] bg-[#0F1117]"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#E2E8F0]">Bond A</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#10B981]/10 text-[#10B981]">{bondA.rating}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[10px] text-[#475569]">Yield</span>
                <span className="text-xs font-mono font-bold text-[#3B82F6]">{bondA.yield.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-[#475569]">Duration</span>
                <span className="text-xs font-mono font-bold text-[#E2E8F0]">{bondA.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-[#475569]">Spread</span>
                <span className="text-xs font-mono font-bold text-[#F59E0B]">{bondA.spread}bp</span>
              </div>
            </div>
            {choice === "A" && (
              <div className="mt-3 text-center">
                <span className="text-[10px] font-mono text-[#3B82F6]">● SELECTED</span>
              </div>
            )}
          </div>

          {/* Bond B */}
          <div className={`px-4 py-3 rounded-lg border transition-all duration-300 ${
            choice === "B" ? "border-[#F59E0B] bg-[#F59E0B]/5" : "border-[#1E293B] bg-[#0F1117]"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#E2E8F0]">Bond B</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B]">{bondB.rating}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[10px] text-[#475569]">Yield</span>
                <span className="text-xs font-mono font-bold text-[#3B82F6]">{bondB.yield.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-[#475569]">Duration</span>
                <span className="text-xs font-mono font-bold text-[#E2E8F0]">{bondB.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-[#475569]">Spread</span>
                <span className="text-xs font-mono font-bold text-[#F59E0B]">{bondB.spread}bp</span>
              </div>
            </div>
            {choice === "B" && (
              <div className="mt-3 text-center">
                <span className="text-[10px] font-mono text-[#F59E0B]">● SELECTED</span>
              </div>
            )}
          </div>
        </div>

        {/* Spread comparison bar */}
        <div className="px-4 py-3 rounded-lg border border-[#1E293B] bg-[#0F1117]">
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">SPREAD COMPARISON</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-[#475569] w-12">Bond A</span>
            <div className="flex-1 h-3 bg-[#1E293B] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#10B981]" style={{ width: `${(bondA.spread / 300) * 100}%` }} />
            </div>
            <span className="text-[10px] font-mono text-[#10B981] w-14 text-right">{bondA.spread}bp</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#475569] w-12">Bond B</span>
            <div className="flex-1 h-3 bg-[#1E293B] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: `${(bondB.spread / 300) * 100}%` }} />
            </div>
            <span className="text-[10px] font-mono text-[#F59E0B] w-14 text-right">{bondB.spread}bp</span>
          </div>
          <div className="text-[10px] text-[#475569] mt-2 text-center">
            Spread Premium: +{bondB.spread - bondA.spread}bp for AA vs AAA
          </div>
        </div>

        {/* Question */}
        <div className="px-4 py-3 rounded-lg border border-[#3B82F6]/20 bg-[#3B82F6]/5">
          <div className="text-[10px] font-mono text-[#3B82F6] tracking-wider mb-1">TRADING THESIS</div>
          <div className="text-xs text-[#CBD5E1]">
            You believe the market is underpricing AA corporate credit quality. Which bond do you choose?
          </div>
        </div>

        {/* Selection */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setChoice("A")}
            className={`py-3 rounded-lg border font-bold text-sm transition-all ${
              choice === "A" ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]" : "border-[#1E293B] bg-[#0F1117] text-[#94A3B8] hover:border-[#334155]"
            }`}
          >
            Bond A (AAA)
          </button>
          <button
            onClick={() => setChoice("B")}
            className={`py-3 rounded-lg border font-bold text-sm transition-all ${
              choice === "B" ? "border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]" : "border-[#1E293B] bg-[#0F1117] text-[#94A3B8] hover:border-[#334155]"
            }`}
          >
            Bond B (AA)
          </button>
        </div>

        {/* Simulation result */}
        {showSimulation && choice && (
          <div className="space-y-3">
            <div className="px-4 py-3 rounded-lg border border-[#1E293B] bg-[#0F1117]">
              <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">MARKET SIMULATION RESULT</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-[#94A3B8]">Bond A Spread</span>
                  <span className="text-xs font-mono">
                    <span className="text-[#475569]">{bondA.spread}bp → </span>
                    <span style={{ color: newSpreadA < bondA.spread ? "#10B981" : "#EF4444" }}>{newSpreadA}bp</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[#94A3B8]">Bond B Spread</span>
                  <span className="text-xs font-mono">
                    <span className="text-[#475569]">{bondB.spread}bp → </span>
                    <span style={{ color: newSpreadB < bondB.spread ? "#10B981" : "#EF4444" }}>{newSpreadB}bp</span>
                  </span>
                </div>
                <div className="h-px bg-[#1E293B] my-2" />
                <div className="flex justify-between">
                  <span className="text-xs text-[#94A3B8]">Bond A Return</span>
                  <span className="text-xs font-mono font-bold" style={{ color: bondAReturn >= 0 ? "#10B981" : "#EF4444" }}>
                    {bondAReturn >= 0 ? "+" : ""}{bondAReturn.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[#94A3B8]">Bond B Return</span>
                  <span className="text-xs font-mono font-bold" style={{ color: bondBReturn >= 0 ? "#10B981" : "#EF4444" }}>
                    {bondBReturn >= 0 ? "+" : ""}{bondBReturn.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className={`px-4 py-3 rounded-lg text-center ${
              (choice === "B" && bondBReturn > bondAReturn) || (choice === "A" && bondAReturn > bondBReturn)
                ? "border border-[#10B981]/30 bg-[#10B981]/5"
                : "border border-[#EF4444]/30 bg-[#EF4444]/5"
            }`}>
              <div className="text-xs font-bold" style={{
                color: ((choice === "B" && bondBReturn > bondAReturn) || (choice === "A" && bondAReturn > bondBReturn)) ? "#10B981" : "#EF4444"
              }}>
                {((choice === "B" && bondBReturn > bondAReturn) || (choice === "A" && bondAReturn > bondBReturn))
                  ? "✓ Correct trade! Your selection outperformed."
                  : "✗ The other bond performed better this time."}
              </div>
            </div>
          </div>
        )}

        {!showSimulation ? (
          <SubmitButton
            onClick={() => {
              if (choice) setShowSimulation(true);
            }}
            disabled={!choice}
            label="RUN SIMULATION"
          />
        ) : (
          <SubmitButton
            onClick={() => choice && onSubmit(choice)}
            label="CONTINUE"
          />
        )}
      </div>
    </div>
  );
}
