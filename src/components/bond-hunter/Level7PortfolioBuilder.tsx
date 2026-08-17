"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Level7Data, PortfolioAllocation } from "./types";
import { GameHeader, SubmitButton } from "./GameUI";
import { PORTFOLIO_ASSETS, PORTFOLIO_CONSTRAINTS, calcPortfolioMetrics } from "./game-engine";

interface Level7Props {
  data: Level7Data;
  onSubmit: (allocation: PortfolioAllocation) => void;
}

export function Level7PortfolioBuilder({ data, onSubmit }: Level7Props) {
  const [allocation, setAllocation] = useState<PortfolioAllocation>({});

  const totalAllocated = Object.values(allocation).reduce((sum, v) => sum + (v || 0), 0);

  const handleSlider = (assetId: string, value: number) => {
    const currentTotal = totalAllocated;
    const currentAssetValue = allocation[assetId] || 0;
    const diff = value - currentAssetValue;
    const newTotal = currentTotal + diff;

    if (newTotal > 100) return;

    setAllocation(prev => ({
      ...prev,
      [assetId]: value,
    }));
  };

  const result = calcPortfolioMetrics(allocation);

  const pieData = PORTFOLIO_ASSETS.map(asset => ({
    name: asset.name,
    value: allocation[asset.id] || 0,
    color: asset.risk === "Low" ? "#3B82F6" : asset.risk === "Medium" ? "#10B981" : "#F59E0B",
  })).filter(d => d.value > 0);

  const riskColor = (risk: string) => risk === "Low" ? "#10B981" : risk === "Medium" ? "#F59E0B" : "#EF4444";

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <GameHeader levelId="level7" title="组合构建 Portfolio Builder" />

      <div className="px-4 md:px-6 space-y-4">
        {/* Budget */}
        <div className="text-center py-3 rounded-lg border border-[#1E293B] bg-[#0F1117]">
          <div className="text-[10px] font-mono text-[#475569] tracking-wider">可配置资金 AVAILABLE</div>
          <div className="text-2xl font-mono font-bold text-[#E2E8F0]">¥{(data.budget / 1000000).toFixed(0)}M</div>
          <div className="text-[10px] font-mono text-[#475569]">已分配: {totalAllocated}% | 剩余: {100 - totalAllocated}%</div>
        </div>

        {/* Allocation sliders */}
        <div className="space-y-4">
          {PORTFOLIO_ASSETS.map((asset) => {
            const value = allocation[asset.id] || 0;
            const color = asset.risk === "Low" ? "#3B82F6" : asset.risk === "Medium" ? "#10B981" : "#F59E0B";

            return (
              <div key={asset.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs font-medium text-[#E2E8F0]">{asset.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: riskColor(asset.risk), backgroundColor: `${riskColor(asset.risk)}15` }}>
                      {asset.risk === "Low" ? "低" : asset.risk === "Medium" ? "中" : "高"}
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
                  <span className="text-[9px] text-[#334155]">上限 {asset.maxAllocation}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Portfolio metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">组合收益率</div>
            <div className="text-base font-mono font-bold text-[#3B82F6]">{result.portfolioYield.toFixed(2)}%</div>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">组合久期</div>
            <div className="text-base font-mono font-bold" style={{
              color: result.portfolioDuration > PORTFOLIO_CONSTRAINTS.durationMax ? "#EF4444" :
                result.portfolioDuration < PORTFOLIO_CONSTRAINTS.durationMin ? "#F59E0B" : "#10B981"
            }}>
              {result.portfolioDuration.toFixed(2)}
            </div>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">利率风险</div>
            <div className="text-sm font-mono font-bold" style={{ color: riskColor(result.interestRateRisk) }}>
              {result.interestRateRisk === "Low" ? "低" : result.interestRateRisk === "Medium" ? "中" : "高"} {result.interestRateRisk}
            </div>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">信用风险</div>
            <div className="text-sm font-mono font-bold" style={{ color: riskColor(result.creditRisk) }}>
              {result.creditRisk === "Low" ? "低" : result.creditRisk === "Medium" ? "中" : "高"} {result.creditRisk}
            </div>
          </div>
        </div>

        {/* Pie chart */}
        <div className="rounded-lg border border-[#1E293B] bg-[#0F1117] p-3">
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">配置分布 ALLOCATION</div>
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
                formatter={(value: number) => [`${value}%`, "占比"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Constraints check */}
        <div className={`px-4 py-3 rounded-lg border ${result.constraintsPassed ? "border-[#10B981]/30 bg-[#10B981]/5" : "border-[#EF4444]/30 bg-[#EF4444]/5"}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{result.constraintsPassed ? "✓" : "⚠️"}</span>
            <span className={`text-xs font-bold ${result.constraintsPassed ? "text-[#10B981]" : "text-[#EF4444]"}`}>
              {result.constraintsPassed ? "风控通过 Risk Passed" : "风控超限 Risk Breach"}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#64748B]">久期范围: {PORTFOLIO_CONSTRAINTS.durationMin}-{PORTFOLIO_CONSTRAINTS.durationMax}</span>
              <span style={{ color: result.portfolioDuration >= PORTFOLIO_CONSTRAINTS.durationMin && result.portfolioDuration <= PORTFOLIO_CONSTRAINTS.durationMax ? "#10B981" : "#EF4444" }}>
                {result.portfolioDuration.toFixed(2)} {result.portfolioDuration >= PORTFOLIO_CONSTRAINTS.durationMin && result.portfolioDuration <= PORTFOLIO_CONSTRAINTS.durationMax ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#64748B]">AA上限: {PORTFOLIO_CONSTRAINTS.maxAA}%</span>
              <span style={{ color: result.creditExposure <= PORTFOLIO_CONSTRAINTS.maxAA ? "#10B981" : "#EF4444" }}>
                {result.creditExposure}% {result.creditExposure <= PORTFOLIO_CONSTRAINTS.maxAA ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#64748B]">现金下限: {PORTFOLIO_CONSTRAINTS.minCash}%</span>
              <span style={{ color: (allocation["cash"] || 0) >= PORTFOLIO_CONSTRAINTS.minCash ? "#10B981" : "#EF4444" }}>
                {allocation["cash"] || 0}% {(allocation["cash"] || 0) >= PORTFOLIO_CONSTRAINTS.minCash ? "✓" : "✗"}
              </span>
            </div>
          </div>
        </div>

        <SubmitButton
          onClick={() => onSubmit(allocation)}
          disabled={totalAllocated !== 100}
          label={totalAllocated !== 100 ? `配置须等于100% (${totalAllocated}%)` : "锁定组合 LOCK IN"}
        />
      </div>
    </div>
  );
}
