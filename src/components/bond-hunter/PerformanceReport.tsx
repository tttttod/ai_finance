"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import type { GameState, PerformanceMetrics, LeaderboardEntry } from "./types";
import { getLeaderboard } from "./game-engine";

interface ReportProps {
  performance: PerformanceMetrics;
  state: GameState;
  onRestart: () => void;
}

const RATING_CONFIG: Record<string, { emoji: string; color: string; gradient: string }> = {
  "FIXED INCOME MASTER": { emoji: "🏆", color: "#F59E0B", gradient: "linear-gradient(135deg, #F59E0B, #D97706)" },
  "PORTFOLIO MANAGER": { emoji: "🥇", color: "#10B981", gradient: "linear-gradient(135deg, #10B981, #059669)" },
  "SENIOR ANALYST": { emoji: "🥈", color: "#3B82F6", gradient: "linear-gradient(135deg, #3B82F6, #2563EB)" },
  "FIXED INCOME ANALYST": { emoji: "📊", color: "#8B5CF6", gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)" },
  "JUNIOR ANALYST": { emoji: "📚", color: "#06B6D4", gradient: "linear-gradient(135deg, #06B6D4, #0891B2)" },
  "TRAINEE": { emoji: "🌱", color: "#64748B", gradient: "linear-gradient(135deg, #64748B, #475569)" },
};

export function PerformanceReport({ performance, state, onRestart }: ReportProps) {
  const [animStep, setAnimStep] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimStep(1), 300),
      setTimeout(() => setAnimStep(2), 800),
      setTimeout(() => setAnimStep(3), 1300),
      setTimeout(() => setAnimStep(4), 1800),
    ];
    setLeaderboard(getLeaderboard());
    return () => timers.forEach(clearTimeout);
  }, []);

  const ratingConf = RATING_CONFIG[performance.rating] || RATING_CONFIG["TRAINEE"];
  const playerName = state.player?.name || "Analyst";

  const radarData = [
    { subject: "Return", value: Math.min(100, Math.max(0, 50 + performance.portfolioReturn * 5)) },
    { subject: "Sharpe", value: Math.min(100, performance.sharpeRatio * 50) },
    { subject: "Forecast", value: performance.forecastAccuracy },
    { subject: "Speed", value: performance.decisionSpeed },
    { subject: "Risk Mgmt", value: performance.riskManagement },
    { subject: "Duration", value: performance.durationRisk === "Low" ? 90 : performance.durationRisk === "Medium" ? 60 : 30 },
  ];

  const metricsBar = [
    { name: "Return", value: performance.portfolioReturn, fill: performance.portfolioReturn > 0 ? "#10B981" : "#EF4444" },
    { name: "Alpha", value: performance.alpha, fill: performance.alpha > 0 ? "#10B981" : "#EF4444" },
    { name: "Max DD", value: performance.maxDrawdown, fill: "#EF4444" },
    { name: "Forecast", value: performance.forecastAccuracy * 0.1, fill: "#3B82F6" },
    { name: "Speed", value: performance.decisionSpeed * 0.1, fill: "#8B5CF6" },
    { name: "Risk", value: performance.riskManagement * 0.1, fill: "#F59E0B" },
  ];

  return (
    <div className="min-h-screen pb-8" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <div className="px-4 md:px-6 pt-6 space-y-4">
        {/* Rating reveal */}
        <div className={`text-center transition-all duration-700 ${animStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="text-4xl mb-2">{ratingConf.emoji}</div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-1">YOUR RATING</div>
          <h2
            className="text-xl font-black tracking-tight"
            style={{
              background: ratingConf.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {performance.rating}
          </h2>
          <div className="text-xs text-[#64748B] mt-1">{playerName} | {state.player?.analystId}</div>
        </div>

        {/* Total score */}
        <div className={`text-center transition-all duration-700 ${animStep >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2" style={{ borderColor: ratingConf.color }}>
            <div>
              <div className="text-2xl font-mono font-black" style={{ color: ratingConf.color }}>{performance.totalScore}</div>
              <div className="text-[8px] font-mono text-[#475569]">SCORE</div>
            </div>
          </div>
        </div>

        {/* Key metrics */}
        <div className={`grid grid-cols-3 gap-2 transition-all duration-700 ${animStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="px-3 py-3 rounded-lg bg-[#0F1117] border border-[#1E293B] text-center">
            <div className="text-[10px] font-mono text-[#475569]">RETURN</div>
            <div className="text-lg font-mono font-bold" style={{ color: performance.portfolioReturn >= 0 ? "#10B981" : "#EF4444" }}>
              {performance.portfolioReturn >= 0 ? "+" : ""}{performance.portfolioReturn}%
            </div>
          </div>
          <div className="px-3 py-3 rounded-lg bg-[#0F1117] border border-[#1E293B] text-center">
            <div className="text-[10px] font-mono text-[#475569]">SHARPE</div>
            <div className="text-lg font-mono font-bold text-[#3B82F6]">{performance.sharpeRatio.toFixed(2)}</div>
          </div>
          <div className="px-3 py-3 rounded-lg bg-[#0F1117] border border-[#1E293B] text-center">
            <div className="text-[10px] font-mono text-[#475569]">ALPHA</div>
            <div className="text-lg font-mono font-bold" style={{ color: performance.alpha >= 0 ? "#10B981" : "#EF4444" }}>
              {performance.alpha >= 0 ? "+" : ""}{performance.alpha}%
            </div>
          </div>
        </div>

        {/* Detailed metrics */}
        <div className={`space-y-2 transition-all duration-700 ${animStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="grid grid-cols-2 gap-2">
            <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
              <div className="text-[10px] font-mono text-[#475569]">BENCHMARK</div>
              <div className="text-sm font-mono font-bold text-[#94A3B8]">{performance.benchmarkReturn >= 0 ? "+" : ""}{performance.benchmarkReturn}%</div>
            </div>
            <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
              <div className="text-[10px] font-mono text-[#475569]">MAX DRAWDOWN</div>
              <div className="text-sm font-mono font-bold text-[#EF4444]">{performance.maxDrawdown}%</div>
            </div>
            <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
              <div className="text-[10px] font-mono text-[#475569]">DURATION RISK</div>
              <div className="text-sm font-mono font-bold" style={{ color: performance.durationRisk === "Low" ? "#10B981" : performance.durationRisk === "Medium" ? "#F59E0B" : "#EF4444" }}>
                {performance.durationRisk}
              </div>
            </div>
            <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
              <div className="text-[10px] font-mono text-[#475569]">CREDIT RISK</div>
              <div className="text-sm font-mono font-bold" style={{ color: performance.creditRisk === "Low" ? "#10B981" : performance.creditRisk === "Medium" ? "#F59E0B" : "#EF4444" }}>
                {performance.creditRisk}
              </div>
            </div>
          </div>
        </div>

        {/* Performance scores */}
        <div className={`transition-all duration-700 ${animStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">PERFORMANCE BREAKDOWN</div>
          <div className="rounded-lg border border-[#1E293B] bg-[#0F1117] p-3">
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1E293B" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748B", fontSize: 10 }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score bars */}
        <div className={`transition-all duration-700 ${animStep >= 3 ? "opacity-100" : "opacity-0"}`}>
          <div className="space-y-2">
            {[
              { label: "Forecast Accuracy", value: performance.forecastAccuracy, color: "#3B82F6" },
              { label: "Decision Speed", value: performance.decisionSpeed, color: "#8B5CF6" },
              { label: "Risk Management", value: performance.riskManagement, color: "#F59E0B" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#64748B]">{item.label}</span>
                  <span className="text-[10px] font-mono font-bold" style={{ color: item.color }}>{item.value}%</span>
                </div>
                <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className={`transition-all duration-700 ${animStep >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">LEADERBOARD</div>
          <div className="rounded-lg border border-[#1E293B] bg-[#0F1117] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-1 px-3 py-2 border-b border-[#1E293B]">
              <span className="col-span-1 text-[9px] font-mono text-[#475569]">#</span>
              <span className="col-span-5 text-[9px] font-mono text-[#475569]">ANALYST</span>
              <span className="col-span-2 text-[9px] font-mono text-[#475569] text-right">RETURN</span>
              <span className="col-span-2 text-[9px] font-mono text-[#475569] text-right">SHARPE</span>
              <span className="col-span-2 text-[9px] font-mono text-[#475569] text-right">SCORE</span>
            </div>
            {/* Rows */}
            {leaderboard.slice(0, 10).map((entry, i) => {
              const isPlayer = entry.analyst === playerName;
              return (
                <div
                  key={i}
                  className={`grid grid-cols-12 gap-1 px-3 py-2 border-b border-[#1E293B]/50 ${isPlayer ? "bg-[#3B82F6]/5" : ""}`}
                >
                  <span className="col-span-1 text-[10px] font-mono" style={{ color: i < 3 ? "#F59E0B" : "#64748B" }}>
                    {entry.rank}
                  </span>
                  <span className={`col-span-5 text-[10px] font-medium truncate ${isPlayer ? "text-[#3B82F6]" : "text-[#E2E8F0]"}`}>
                    {entry.analyst} {isPlayer && "← YOU"}
                  </span>
                  <span className="col-span-2 text-[10px] font-mono text-right" style={{ color: entry.returnPct >= 0 ? "#10B981" : "#EF4444" }}>
                    {entry.returnPct >= 0 ? "+" : ""}{entry.returnPct}%
                  </span>
                  <span className="col-span-2 text-[10px] font-mono text-right text-[#3B82F6]">
                    {entry.sharpe.toFixed(2)}
                  </span>
                  <span className="col-span-2 text-[10px] font-mono text-right font-bold" style={{ color: ratingConf.color }}>
                    {entry.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Restart */}
        <button
          onClick={onRestart}
          className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: "linear-gradient(135deg, #3B82F6, #2563EB)",
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)",
          }}
        >
          PLAY AGAIN
        </button>

        {/* Disclaimer */}
        <div className="text-center pt-2">
          <p className="text-[9px] text-[#334155] leading-relaxed">
            This is an educational simulation game. All data, company names, and market scenarios are fictional.
            <br />Not financial advice. For educational and training purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
