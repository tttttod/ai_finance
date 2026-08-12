"use client";

import { useState, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { BondParams, BondMetrics } from "./types";
import { calcBondMetrics } from "./game-engine";
import { GameHeader, SubmitButton } from "./GameUI";

interface Level3Props {
  onComplete: (interactions: number, finalYield: number) => void;
}

export function Level3BondPricing({ onComplete }: Level3Props) {
  const [coupon, setCoupon] = useState(3.0);
  const [yieldRate, setYieldRate] = useState(2.5);
  const [maturity, setMaturity] = useState(5);
  const [interactions, setInteractions] = useState(0);

  const params: BondParams = {
    faceValue: 100,
    couponRate: coupon / 100,
    maturity,
    frequency: 2,
    yieldRate: yieldRate / 100,
  };

  const metrics: BondMetrics = calcBondMetrics(params);

  // Generate price-yield curve data
  const curveData = Array.from({ length: 40 }, (_, i) => {
    const y = 0.5 + i * 0.1;
    const m = calcBondMetrics({ ...params, yieldRate: y / 100 });
    return { yield: y, price: m.price };
  });

  const trackInteraction = useCallback(() => {
    setInteractions(prev => prev + 1);
  }, []);

  const priceColor = metrics.price >= 100 ? "#10B981" : metrics.price >= 98 ? "#F59E0B" : "#EF4444";

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <GameHeader levelId="level3" title="Bond Pricing Lab" />

      <div className="px-4 md:px-6 space-y-4">
        {/* Bond specification */}
        <div className="px-4 py-3 rounded-lg border border-[#1E293B] bg-[#0F1117]">
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">BOND SPECIFICATION</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-[#475569] font-mono">FACE VALUE</span>
              <div className="text-sm font-mono font-bold text-[#E2E8F0]">¥100.00</div>
            </div>
            <div>
              <span className="text-[10px] text-[#475569] font-mono">FREQUENCY</span>
              <div className="text-sm font-mono font-bold text-[#E2E8F0]">Semi-Annual</div>
            </div>
          </div>
        </div>

        {/* Price display */}
        <div className="px-4 py-4 rounded-lg border border-[#1E293B] bg-[#0F1117] text-center">
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-1">BOND PRICE</div>
          <div className="text-3xl font-mono font-bold" style={{ color: priceColor }}>
            ¥{metrics.price.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono mt-1" style={{ color: priceColor }}>
            {metrics.price >= 100 ? "PREMIUM" : metrics.price >= 99 ? "NEAR PAR" : "DISCOUNT"}
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">CURRENT YIELD</div>
            <div className="text-sm font-mono font-bold text-[#F59E0B]">{(metrics.currentYield * 100).toFixed(2)}%</div>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">YTM</div>
            <div className="text-sm font-mono font-bold text-[#3B82F6]">{(metrics.ytm * 100).toFixed(2)}%</div>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">DURATION</div>
            <div className="text-sm font-mono font-bold text-[#8B5CF6]">{metrics.duration.toFixed(2)} yrs</div>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
            <div className="text-[10px] font-mono text-[#475569]">CONVEXITY</div>
            <div className="text-sm font-mono font-bold text-[#10B981]">{metrics.convexity.toFixed(2)}</div>
          </div>
        </div>

        {/* Price-Yield curve */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">PRICE-YIELD RELATIONSHIP</div>
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
                  formatter={(value: number) => [`¥${value.toFixed(2)}`, "Price"]}
                  labelFormatter={(label: number) => `Yield: ${label.toFixed(2)}%`}
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
            <span className="text-[10px] font-mono text-[#475569]">Yield ↑ → Price ↓</span>
            <span className="text-[10px] text-[#475569]">|</span>
            <span className="text-[10px] font-mono text-[#475569]">Yield ↓ → Price ↑</span>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {/* Coupon slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-[#475569]">COUPON RATE</span>
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
              <span className="text-[10px] font-mono text-[#475569]">MARKET YIELD</span>
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
              <span className="text-[10px] font-mono text-[#475569]">MATURITY (YEARS)</span>
              <span className="text-xs font-mono font-bold text-[#8B5CF6]">{maturity.toFixed(0)}Y</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={maturity}
              onChange={(e) => { setMaturity(parseInt(e.target.value)); trackInteraction(); }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${((maturity - 1) / 29) * 100}%, #1E293B ${((maturity - 1) / 29) * 100}%, #1E293B 100%)` }}
            />
          </div>
        </div>

        {/* Interaction counter */}
        <div className="text-center">
          <span className="text-[10px] font-mono text-[#475569]">
            Interactions: {interactions} | Explore the relationship between yield, coupon, maturity and price
          </span>
        </div>

        <SubmitButton
          onClick={() => onComplete(interactions, yieldRate)}
          disabled={interactions < 3}
          label={interactions < 3 ? `EXPLORE MORE (${interactions}/3)` : "CONTINUE TO NEXT LEVEL"}
        />
      </div>
    </div>
  );
}
