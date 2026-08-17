"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { GameHeader, SubmitButton } from "./GameUI";
import { PORTFOLIO_ASSETS, PORTFOLIO_CONSTRAINTS, calcPortfolioResult } from "./game-engine";

interface Level7Props {
  onSubmit: (allocation: Record<string, number>) => void;
}

export function Level7PortfolioBuilder({ onSubmit }: Level7Props) {
  const [allocation, setAllocation] = useState<Record<string, number>>({
    gov_1y: 10,
    gov_5y: 20,
    gov_10y: 20,
    aaa_credit: 15,
    aa_credit: 10,
    cash: 25,
  });

  const totalAllocated = Object.values(allocation).reduce((sum: number, v) => sum + (v || 0), 0);

  const handleSlider = (assetId: string, value: number) => {
    setAllocation(prev => ({
      ...prev,
      [assetId]: value,
    }));
  };

  const result = calcPortfolioResult(PORTFOLIO_ASSETS, allocation, PORTFOLIO_CONSTRAINTS);

  const pieData = PORTFOLIO_ASSETS.map(asset => ({
    name: asset.name,
    value: allocation[asset.id] || 0,
    color: asset.risk === "Low" ? "#3B82F6" : asset.risk === "Medium" ? "#10B981" : "#F59E0B",
  })).filter(d => d.value > 0);

  // Add cash to pie
  const cashValue = allocation["cash"] || 0;
  if (cashValue > 0) {
    pieData.push({ name: "现金 Cash", value: cashValue, color: "#64748B" });
  }

  const riskColor = (risk: string) => risk === "Low" ? "#10B981" : risk === "Medium" ? "#F59E0B" : "#EF4444";

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <GameHeader levelId="level7" title="组合构建 Portfolio Builder" />

      <div className="px-4 md:px-6 space-y-4">
        {/* Budget */}
        <div className="text-center py-3 rounded-lg border border-[#1E293B] bg-[#0F1117]">
          <div className="text-[10px] font-mono text-[#475569] tracking-wider">可配置资金 AVAILABLE</div>
          <div className="text-2xl font-mono font-bold text-[#E2E8F0]">¥100M</div>
          <div className={`text-[10px] font-mono ${totalAllocated === 100 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
            已分配 Allocated: {totalAllocated}% | 剩余 Remaining: {100 - totalAllocated}%
          </div>
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
                  <span className="text-[9px] font-mono text-[#334155]">0%</span>
                  <span className="text-[9px] font-mono text-[#334155]">上限 Max {asset.maxAllocation}%</span>
                </div>
              </div>
            );
          })}

          {/* Cash */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#64748B]" />
                <span className="text-xs font-medium text-[#E2E8F0]">现金 Cash</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#64748B]/10 text-[#64748B]">低</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#64748B]">{cashValue}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={cashValue}
              onChange={(e) => handleSlider("cash", parseInt(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #64748B 0%, #64748B ${(cashValue / 50) * 100}%, #1E293B ${(cashValue / 50) * 100}%, #1E293B 100%)` }}
            />
          </div>
        </div>

        {/* Pie chart */}
        {pieData.length > 0 && (
          <div className="rounded-lg border border-[#1E293B] bg-[#0F1117] p-3">
            <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">配置分布 ALLOCATION</div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F1117", border: "1px solid #1E293B", borderRadius: "8px", fontSize: "11px" }}
                  formatter={(value: number) => [`${value}%`, "占比"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Portfolio metrics */}
        <div className="rounded-lg border border-[#1E293B] bg-[#0F1117] p-3">
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">组合指标 PORTFOLIO METRICS</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] font-mono text-[#475569]">组合收益 Yield</div>
              <div className="text-sm font-mono font-bold text-[#10B981]">{result.portfolioYield.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#475569]">组合久期 Duration</div>
              <div className="text-sm font-mono font-bold text-[#3B82F6]">{result.portfolioDuration.toFixed(2)} 年</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#475569]">利率风险 IR Risk</div>
              <div className="text-sm font-mono font-bold" style={{ color: riskColor(result.interestRateRisk === "LOW" ? "Low" : result.interestRateRisk === "MEDIUM" ? "Medium" : "High") }}>
                {result.interestRateRisk === "LOW" ? "低" : result.interestRateRisk === "MEDIUM" ? "中" : "高"}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#475569]">信用风险 Credit</div>
              <div className="text-sm font-mono font-bold" style={{ color: riskColor(result.creditRisk === "LOW" ? "Low" : result.creditRisk === "MEDIUM" ? "Medium" : "High") }}>
                {result.creditRisk === "LOW" ? "低" : result.creditRisk === "MEDIUM" ? "中" : "高"}
              </div>
            </div>
          </div>
        </div>

        {/* Constraints check */}
        <div className={`px-4 py-3 rounded-lg border ${result.constraintsPassed ? "border-[#10B981]/30 bg-[#10B981]/5" : "border-[#EF4444]/30 bg-[#EF4444]/5"}`}>
          <div className="flex items-center gap-2">
            <span className={`text-lg ${result.constraintsPassed ? "text-[#10B981]" : "text-[#EF4444]"}`}>
              {result.constraintsPassed ? "✓" : "⚠"}
            </span>
            <div>
              <div className={`text-xs font-bold ${result.constraintsPassed ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                {result.constraintsPassed ? "约束检查通过 Constraints Passed" : "约束违反 Constraint Breach"}
              </div>
              <div className="text-[10px] text-[#64748B]">
                久期目标 Duration Target: {PORTFOLIO_CONSTRAINTS.durationMin}-{PORTFOLIO_CONSTRAINTS.durationMax} |
                AA上限 Max: {PORTFOLIO_CONSTRAINTS.maxAA}% |
                现金下限 Min Cash: {PORTFOLIO_CONSTRAINTS.minCash}%
              </div>
            </div>
          </div>
        </div>

        <SubmitButton
          onClick={() => onSubmit(allocation)}
          disabled={totalAllocated !== 100 || !result.constraintsPassed}
          label="提交组合 SUBMIT"
        />
      </div>
    </div>
  );
}
