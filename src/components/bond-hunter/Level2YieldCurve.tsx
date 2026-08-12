"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import type { Level2Data, CurveShape } from "./types";
import { GameHeader, OptionButton, SubmitButton } from "./GameUI";

interface Level2Props {
  data: Level2Data;
  onSubmit: (shape: CurveShape, yieldPred: number) => void;
}

const SHAPE_OPTIONS: { value: CurveShape; label: string; desc: string }[] = [
  { value: "steepening", label: "Steepening", desc: "Long-end rates rising faster than short-end" },
  { value: "flattening", label: "Flattening", desc: "Short-end rates rising faster than long-end" },
  { value: "bull_steepening", label: "Bull Steepening", desc: "Rates falling, short-end falling faster" },
  { value: "bear_flattening", label: "Bear Flattening", desc: "Rates rising, short-end rising faster" },
];

export function Level2YieldCurve({ data, onSubmit }: Level2Props) {
  const [shape, setShape] = useState<CurveShape | null>(null);
  const [yieldPred, setYieldPred] = useState<string>("");
  const { curve } = data;

  const chartData = curve.map((p) => ({
    name: p.maturity,
    yield: p.yield,
  }));

  const current10Y = curve.find(p => p.maturity === "10Y")?.yield || 2.0;

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <GameHeader levelId="level2" title="Yield Curve Lab" />

      <div className="px-4 md:px-6 space-y-4">
        {/* Yield curve chart */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">GOVERNMENT BOND YIELD CURVE</div>
          <div className="rounded-lg border border-[#1E293B] bg-[#0F1117] p-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={{ stroke: "#1E293B" }} />
                <YAxis
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  axisLine={{ stroke: "#1E293B" }}
                  domain={["auto", "auto"]}
                  tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F1117",
                    border: "1px solid #1E293B",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#64748B" }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, "Yield"]}
                />
                <Area
                  type="monotone"
                  dataKey="yield"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#yieldGradient)"
                  dot={{ fill: "#3B82F6", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current yields table */}
        <div className="grid grid-cols-3 gap-2">
          {curve.map((p) => (
            <div key={p.maturity} className="px-3 py-2 rounded-lg bg-[#0F1117] border border-[#1E293B] text-center">
              <div className="text-[10px] font-mono text-[#475569]">{p.maturity}</div>
              <div className="text-sm font-mono font-bold text-[#E2E8F0]">{p.yield.toFixed(2)}%</div>
            </div>
          ))}
        </div>

        {/* Shape question */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">
            IDENTIFY: Current yield curve regime?
          </div>
          <div className="space-y-2">
            {SHAPE_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                label={opt.label}
                selected={shape === opt.value}
                onClick={() => setShape(opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Yield prediction */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">
            PREDICT: 10Y Treasury yield in 1 month? (Current: {current10Y.toFixed(2)}%)
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={parseFloat(Math.max(0.5, current10Y - 1).toFixed(1))}
              max={parseFloat((current10Y + 1).toFixed(1))}
              step={0.01}
              value={yieldPred || current10Y.toString()}
              onChange={(e) => setYieldPred(e.target.value)}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((parseFloat(yieldPred || current10Y.toString()) - (current10Y - 1)) / 2) * 100}%, #1E293B ${((parseFloat(yieldPred || current10Y.toString()) - (current10Y - 1)) / 2) * 100}%, #1E293B 100%)`,
              }}
            />
            <div className="px-3 py-2 rounded-lg bg-[#0F1117] border border-[#1E293B] min-w-[80px] text-center">
              <span className="text-sm font-mono font-bold text-[#3B82F6]">
                {(yieldPred ? parseFloat(yieldPred) : current10Y).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <SubmitButton
          onClick={() => shape && onSubmit(shape, yieldPred ? parseFloat(yieldPred) : current10Y)}
          disabled={!shape}
          label="CONFIRM ANALYSIS"
        />
      </div>
    </div>
  );
}
