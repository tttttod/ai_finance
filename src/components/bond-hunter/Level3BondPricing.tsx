"use client";

import { useState } from "react";
import type { Level3Data } from "./types";
import { GameHeader, SubmitButton } from "./GameUI";
import { calcBondPrice, calcDuration, calcConvexity } from "./game-engine";

interface Level3Props {
  data: Level3Data;
  onComplete: (interactions: number) => void;
}

export function Level3BondPricing({ data, onComplete }: Level3Props) {
  const [coupon, setCoupon] = useState(data.defaultCoupon);
  const [yieldRate, setYieldRate] = useState(data.defaultYield);
  const [maturity, setMaturity] = useState(data.defaultMaturity);
  const [interactions, setInteractions] = useState(0);

  const price = calcBondPrice(100, coupon / 100, yieldRate / 100, maturity, 2);
  const duration = calcDuration(100, coupon / 100, yieldRate / 100, maturity, 2);
  const convexity = calcConvexity(100, coupon / 100, yieldRate / 100, maturity, 2);
  const currentYield = (coupon / price * 100);

  const trackInteraction = () => setInteractions(prev => prev + 1);

  // Generate price-yield curve data
  const curveData = [];
  for (let y = 0.5; y <= 6; y += 0.25) {
    curveData.push({
      yield: y,
      price: calcBondPrice(100, coupon / 100, y / 100, maturity, 2),
    });
  }

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <GameHeader levelId="level3" title="债券定价 Bond Pricing" />

      <div className="px-4 md:px-6 space-y-4">
        {/* Bond price display */}
        <div className="text-center py-4 rounded-lg border border-[#1E293B] bg-[#0F1117]">
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-1">债券价格 BOND PRICE</div>
          <div className={`text-4xl font-mono font-bold ${price >= 100 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
            ¥{price.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-[#475569] mt-1">
            {price >= 100 ? "溢价 Premium" : "折价 Discount"}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-2">
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">当期收益率</div>
            <div className="text-sm font-mono font-bold text-[#F59E0B]">{currentYield.toFixed(2)}%</div>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">YTM</div>
            <div className="text-sm font-mono font-bold text-[#3B82F6]">{(yieldRate).toFixed(2)}%</div>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">久期 Duration</div>
            <div className="text-sm font-mono font-bold text-[#8B5CF6]">{duration.toFixed(2)} 年</div>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">凸性 Convex</div>
            <div className="text-sm font-mono font-bold text-[#10B981]">{convexity.toFixed(2)}</div>
          </div>
        </div>

        {/* Price-Yield curve */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">价格-收益率关系 PRICE-YIELD</div>
          <div className="rounded-lg border border-[#1E293B] bg-[#0F1117] p-3">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={curveData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  dataKey="yield"
                  tick={{ fill: "#64748B", fontSize: 10 }}
                  axisLine={{ stroke: "#1E293B" }}
                  tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                />
                <YAxis
                  tick={{ fill: "#64748B", fontSize: 10 }}
                  axisLine={{ stroke: "#1E293B" }}
                  domain={["auto", "auto"]}
                  tickFormatter={(v: number) => `¥${v.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F1117", border: "1px solid #1E293B", borderRadius: "8px", fontSize: "11px" }}
                  formatter={(value: number) => [`¥${value.toFixed(2)}`, "价格 Price"]}
                  labelFormatter={(label: number) => `收益率: ${label.toFixed(2)}%`}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#3B82F6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[10px] font-mono text-[#475569]">收益率↑ → 价格↓</span>
            <span className="text-[10px] text-[#475569]">|</span>
            <span className="text-[10px] font-mono text-[#475569]">收益率↓ → 价格↑</span>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {/* Coupon slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-[#475569]">票息 COUPON</span>
              <span className="text-xs font-mono font-bold text-[#F59E0B]">{coupon.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={6}
              step={0.25}
              value={coupon}
              onChange={(e) => { setCoupon(parseFloat(e.target.value)); trackInteraction(); }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${((coupon - 0.5) / 5.5) * 100}%, #1E293B ${((coupon - 0.5) / 5.5) * 100}%, #1E293B 100%)` }}
            />
          </div>

          {/* Yield slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-[#475569]">市场收益率 YIELD</span>
              <span className="text-xs font-mono font-bold text-[#3B82F6]">{yieldRate.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={6}
              step={0.05}
              value={yieldRate}
              onChange={(e) => { setYieldRate(parseFloat(e.target.value)); trackInteraction(); }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((yieldRate - 0.5) / 5.5) * 100}%, #1E293B ${((yieldRate - 0.5) / 5.5) * 100}%, #1E293B 100%)` }}
            />
          </div>

          {/* Maturity slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-[#475569]">期限 MATURITY</span>
              <span className="text-xs font-mono font-bold text-[#8B5CF6]">{maturity.toFixed(0)}年</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={maturity}
              onChange={(e) => { setMaturity(parseFloat(e.target.value)); trackInteraction(); }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${((maturity - 1) / 29) * 100}%, #1E293B ${((maturity - 1) / 29) * 100}%, #1E293B 100%)` }}
            />
          </div>
        </div>

        <SubmitButton
          onClick={() => onComplete(interactions)}
          label="完成实验 COMPLETE"
        />
      </div>
    </div>
  );
}
