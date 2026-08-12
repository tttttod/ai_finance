"use client";

import { useState, useEffect } from "react";
import type { MarketScenario, PortfolioResult } from "./types";
import { GameHeader, SubmitButton } from "./GameUI";

interface Level8Props {
  scenario: MarketScenario;
  portfolio: PortfolioResult | null;
  onSubmit: (decision: string) => void;
}

const SCENARIO_ICONS: Record<string, string> = {
  A: "📉",
  B: "🔥",
  C: "📊",
  D: "💥",
  E: "🌤️",
};

const SCENARIO_COLORS: Record<string, string> = {
  A: "#10B981",
  B: "#EF4444",
  C: "#F59E0B",
  D: "#EF4444",
  E: "#3B82F6",
};

export function Level8MarketShock({ scenario, portfolio, onSubmit }: Level8Props) {
  const [phase, setPhase] = useState<"intro" | "impact" | "decision" | "result">("intro");
  const [decision, setDecision] = useState<string | null>(null);
  const [animStep, setAnimStep] = useState(0);

  useEffect(() => {
    if (phase === "intro") {
      const t1 = setTimeout(() => setAnimStep(1), 500);
      const t2 = setTimeout(() => setAnimStep(2), 1500);
      const t3 = setTimeout(() => setPhase("impact"), 2500);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "impact") {
      const t = setTimeout(() => {
        if (scenario.decisionRequired) {
          setPhase("decision");
        } else {
          setPhase("result");
          setTimeout(() => onSubmit("OBSERVED"), 2000);
        }
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [phase, scenario, onSubmit]);

  // Calculate portfolio impact
  const yieldChangePct = scenario.yieldChange / 100;
  const spreadChangePct = scenario.spreadChange / 10000;
  const portfolioDuration = portfolio?.portfolioDuration || 4.0;
  const portfolioYield = portfolio?.portfolioYield || 2.0;

  // Gov bond impact (duration-based)
  const govImpact = -portfolioDuration * yieldChangePct * 100;
  // Credit bond impact (duration + spread)
  const creditImpact = govImpact - 3.8 * spreadChangePct * 100;
  // Overall portfolio impact (weighted)
  const overallImpact = govImpact * 0.6 + creditImpact * 0.4;

  const color = SCENARIO_COLORS[scenario.type] || "#3B82F6";

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <GameHeader levelId="level8" title="Market Shock" />

      <div className="px-4 md:px-6 space-y-4">
        {/* Phase: Intro */}
        {phase === "intro" && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className={`text-4xl mb-4 transition-all duration-500 ${animStep >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
              ⚠️
            </div>
            <div className={`text-sm font-mono text-[#EF4444] tracking-wider transition-all duration-500 ${animStep >= 1 ? "opacity-100" : "opacity-0"}`}>
              INCOMING MARKET EVENT
            </div>
            <div className={`mt-4 flex gap-1 transition-all duration-500 ${animStep >= 2 ? "opacity-100" : "opacity-0"}`}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Phase: Impact */}
        {(phase === "impact" || phase === "decision" || phase === "result") && (
          <>
            {/* Scenario card */}
            <div className="px-4 py-4 rounded-lg border text-center" style={{
              borderColor: `${color}40`,
              backgroundColor: `${color}08`,
            }}>
              <div className="text-3xl mb-2">{SCENARIO_ICONS[scenario.type]}</div>
              <div className="text-sm font-bold text-[#E2E8F0] mb-1">Scenario {scenario.type}: {scenario.name}</div>
              <div className="text-xs text-[#94A3B8] leading-relaxed">{scenario.description}</div>
            </div>

            {/* Market impact */}
            <div className="px-4 py-3 rounded-lg border border-[#1E293B] bg-[#0F1117]">
              <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-3">MARKET IMPACT</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">10Y Yield Change</span>
                  <span className="text-sm font-mono font-bold" style={{ color: scenario.yieldChange > 0 ? "#EF4444" : "#10B981" }}>
                    {scenario.yieldChange > 0 ? "+" : ""}{scenario.yieldChange}bp
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Credit Spread Change</span>
                  <span className="text-sm font-mono font-bold" style={{ color: scenario.spreadChange > 0 ? "#EF4444" : "#10B981" }}>
                    {scenario.spreadChange > 0 ? "+" : ""}{scenario.spreadChange}bp
                  </span>
                </div>
              </div>
            </div>

            {/* Portfolio P&L */}
            <div className="px-4 py-3 rounded-lg border" style={{
              borderColor: overallImpact >= 0 ? "#10B98130" : "#EF444430",
              backgroundColor: overallImpact >= 0 ? "#10B98108" : "#EF444408",
            }}>
              <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">PORTFOLIO P&L IMPACT</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Gov Bond Impact</span>
                  <span className="text-xs font-mono font-bold" style={{ color: govImpact >= 0 ? "#10B981" : "#EF4444" }}>
                    {govImpact >= 0 ? "+" : ""}{govImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Credit Bond Impact</span>
                  <span className="text-xs font-mono font-bold" style={{ color: creditImpact >= 0 ? "#10B981" : "#EF4444" }}>
                    {creditImpact >= 0 ? "+" : ""}{creditImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="h-px bg-[#1E293B]" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E2E8F0]">Net Portfolio Impact</span>
                  <span className="text-lg font-mono font-bold" style={{ color: overallImpact >= 0 ? "#10B981" : "#EF4444" }}>
                    {overallImpact >= 0 ? "+" : ""}{overallImpact.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Decision required */}
            {phase === "decision" && (
              <>
                <div className="px-4 py-3 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/5 text-center">
                  <div className="text-sm font-bold text-[#EF4444] mb-1">ACTION REQUIRED</div>
                  <div className="text-xs text-[#94A3B8]">Credit markets are in turmoil. What do you do with your AA credit positions?</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(["BUY_THE_DIP", "HOLD", "SELL"] as const).map((d) => {
                    const colors = { BUY_THE_DIP: "#10B981", HOLD: "#F59E0B", SELL: "#EF4444" };
                    const labels = { BUY_THE_DIP: "BUY DIP", HOLD: "HOLD", SELL: "SELL" };
                    const isSelected = decision === d;
                    return (
                      <button
                        key={d}
                        onClick={() => setDecision(d)}
                        className={`py-3 rounded-lg border font-bold text-xs transition-all ${
                          isSelected ? "" : "border-[#1E293B] bg-[#0F1117] text-[#94A3B8]"
                        }`}
                        style={isSelected ? {
                          borderColor: colors[d],
                          backgroundColor: `${colors[d]}15`,
                          color: colors[d],
                        } : {}}
                      >
                        {labels[d]}
                      </button>
                    );
                  })}
                </div>

                <SubmitButton
                  onClick={() => decision && onSubmit(decision)}
                  disabled={!decision}
                  label="EXECUTE DECISION"
                />
              </>
            )}

            {phase === "result" && !scenario.decisionRequired && (
              <div className="text-center py-4">
                <div className="text-xs font-mono text-[#475569]">Calculating final results...</div>
                <div className="flex justify-center gap-1 mt-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
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
