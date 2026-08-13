"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { PORTFOLIO_ASSETS, PORTFOLIO_CONSTRAINTS, calcPortfolioResult } from "./game-engine";
import type { PortfolioResult } from "./types";
import { GameHeader, SubmitButton } from "./GameUI";

interface Level7Props {
  onSubmit: (allocation: Record<string, number>) => void;
}

const RISK_COLORS: Record<string, string> = {
  Low: "#10B981",
  Medium: "#F59E0B",
  High: "#EF4444",
};

const ASSET_COLORS = ["#3B82F6", "#06B6D4", "#8B5CF6", "#10B981", "#F59E0B"];

export function Level7PortfolioBuilder({ onSubmit }: Level7Props) {
  const [allocation, setAllocation] = useState<Record<string, number>>({
    gov_1y: 20,
    gov_5y: 25,
    gov_10y: 15,
    aaa_credit: 20,
    aa_credit: 10,
    cash: 10,
  });

  const totalAllocated = Object.values(allocation).reduce((a, b) => a + b, 0);

  const result: PortfolioResult = useMemo(() => {
    return calcPortfolioResult(PORTFOLIO_ASSETS, allocation, PORTFOLIO_CONSTRAINTS);
  }, [allocation]);

  const pieData = Object.entries(allocation)
    .filter(([, v]) => v > 0)
    .map(([key, value], i) => ({
      name: key === "cash" ? "Cash" : PORTFOLIO_ASSETS.find(a => a.id === key)?.name || key,
      value,
      color: key === "cash" ? "#64748B" : ASSET_COLORS[PORTFOLIO_ASSETS.findIndex(a => a.id === key)] || "#64748B",
    }));

  const handleSlider = (id: string, value: number) => {
    setAllocation(prev => ({ ...prev, [id]: value }));
  };

  const riskColor = (risk: string) => RISK_COLORS[risk] || "#64748B";

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <GameHeader levelId="level7" title="Portfolio Builder" />

      <div className="px-4 md:px-6 space-y-4">
        {/* Budget */}
        <div className="px-4 py-3 rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/5 text-center">
          <div className="text-[10px] font-mono text-[#3B82F6] tracking-wider">TOTAL CAPITAL</div>
          <div className="text-2xl font-mono font-bold text-[#E2E8F0]">¥100,000,000</div>
        </div>

        {/* Allocation total */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0F1117] border border-[#1E293B]">
          <span className="text-[10px] font-mono text-[#475569]">ALLOCATION TOTAL</span>
          <span className={`text-sm font-mono font-bold ${totalAllocated === 100 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
            {totalAllocated}%
            {totalAllocated !== 100 && (
              <span className="text-[10px] text-[#EF4444] ml-1">
                ({totalAllocated > 100 ? "OVER" : "UNDER"})
              </span>
            )}
          </span>
        </div>

        {/* Allocation sliders */}
        <div className="space-y-3">
          {[...PORTFOLIO_ASSETS, { id: "cash", name: "Cash", yield: 0.5, duration: 0, risk: "Low" as const, maxAllocation: 100, rating: "CASH" }].map((asset, i) => {
            const value = allocation[asset.id] || 0;
            const color = asset.id === "cash" ? "#64748B" : ASSET_COLORS[i];
            return (
              <div key={asset.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs font-medium text-[#E2E8F0]">{asset.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: riskColor(asset.risk), backgroundColor: `${riskColor(asset.risk)}15` }}>
                      {asset.risk}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold" style={{ color }}>{value}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={asset.maxAllocation}
                  step={5}
                  value={value}
                  onChange={(e) => handleSlider(asset.id, parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, ${color} 0%, ${color} ${(value / asset.maxAllocation) * 100}%, #1E293B ${(value / asset.maxAllocation) * 100}%, #1E293B 100%)` }}
                />
                <div className="flex justify-between mt-0.5">
                  <span className="text-[9px] text-[#334155]">0%</span>
                  <span className="text-[9px] text-[#334155]">Max {asset.maxAllocation}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Portfolio metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">PORTFOLIO YIELD</div>
            <div className="text-base font-mono font-bold text-[#3B82F6]">{result.portfolioYield.toFixed(2)}%</div>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">DURATION</div>
            <div className="text-base font-mono font-bold" style={{
              color: result.portfolioDuration > PORTFOLIO_CONSTRAINTS.durationMax ? "#EF4444" :
                result.portfolioDuration < PORTFOLIO_CONSTRAINTS.durationMin ? "#F59E0B" : "#10B981"
            }}>
              {result.portfolioDuration.toFixed(2)}
            </div>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">INT. RATE RISK</div>
            <div className="text-sm font-mono font-bold" style={{ color: riskColor(result.interestRateRisk) }}>
              {result.interestRateRisk}
            </div>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">CREDIT RISK</div>
            <div className="text-sm font-mono font-bold" style={{ color: riskColor(result.creditRisk) }}>
              {result.creditRisk}
            </div>
          </div>
        </div>

        {/* Pie chart */}
        <div className="rounded-lg border border-[#1E293B] bg-[#0F1117] p-3">
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">ALLOCATION BREAKDOWN</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#0F1117", border: "1px solid #1E293B", borderRadius: "8px", fontSize: "11px" }}
                formatter={(value: number) => [`${value}%`, "Allocation"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Constraints check */}
        <div className={`px-4 py-3 rounded-lg border ${result.constraintsPassed ? "border-[#10B981]/30 bg-[#10B981]/5" : "border-[#EF4444]/30 bg-[#EF4444]/5"}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{result.constraintsPassed ? "✓" : "⚠️"}</span>
            <span className={`text-xs font-bold ${result.constraintsPassed ? "text-[#10B981]" : "text-[#EF4444]"}`}>
              {result.constraintsPassed ? "Risk Limits Passed" : "Risk Limit Breach"}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#64748B]">Duration: {PORTFOLIO_CONSTRAINTS.durationMin}-{PORTFOLIO_CONSTRAINTS.durationMax}</span>
              <span style={{ color: result.portfolioDuration >= PORTFOLIO_CONSTRAINTS.durationMin && result.portfolioDuration <= PORTFOLIO_CONSTRAINTS.durationMax ? "#10B981" : "#EF4444" }}>
                {result.portfolioDuration.toFixed(2)} {result.portfolioDuration >= PORTFOLIO_CONSTRAINTS.durationMin && result.portfolioDuration <= PORTFOLIO_CONSTRAINTS.durationMax ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#64748B]">AA Max: {PORTFOLIO_CONSTRAINTS.maxAA}%</span>
              <span style={{ color: result.creditExposure <= PORTFOLIO_CONSTRAINTS.maxAA ? "#10B981" : "#EF4444" }}>
                {result.creditExposure}% {result.creditExposure <= PORTFOLIO_CONSTRAINTS.maxAA ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#64748B]">Cash Min: {PORTFOLIO_CONSTRAINTS.minCash}%</span>
              <span style={{ color: (allocation["cash"] || 0) >= PORTFOLIO_CONSTRAINTS.minCash ? "#10B981" : "#EF4444" }}>
                {allocation["cash"] || 0}% {(allocation["cash"] || 0) >= PORTFOLIO_CONSTRAINTS.minCash ? "✓" : "✗"}
              </span>
            </div>
          </div>
        </div>

        <SubmitButton
          onClick={() => onSubmit(allocation)}
          disabled={totalAllocated !== 100}
          label={totalAllocated !== 100 ? `ALLOCATION MUST EQUAL 100% (${totalAllocated}%)` : "LOCK IN PORTFOLIO"}
        />
      </div>
    </div>
  );
}
