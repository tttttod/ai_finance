"use client";

import { useState } from "react";
import type { Level1Data, RateDirection } from "./types";
import { GameHeader, DataCard, OptionButton, SubmitButton } from "./GameUI";

interface Level1Props {
  data: Level1Data;
  onSubmit: (prediction: RateDirection) => void;
}

const RATE_OPTIONS: { value: RateDirection; label: string; desc: string }[] = [
  { value: "sharp_up", label: "Sharp Increase", desc: "Rates rise significantly (>20bp)" },
  { value: "slight_up", label: "Slight Increase", desc: "Rates edge higher (5-20bp)" },
  { value: "unchanged", label: "Basically Unchanged", desc: "Rates stay within 5bp range" },
  { value: "slight_down", label: "Slight Decrease", desc: "Rates drift lower (5-20bp)" },
  { value: "sharp_down", label: "Sharp Decrease", desc: "Rates fall significantly (>20bp)" },
];

const MACRO_ITEMS = [
  { key: "gdp" as const, label: "GDP Growth", unit: "%", fmt: (v: number) => v.toFixed(1) },
  { key: "cpi" as const, label: "CPI", unit: "%", fmt: (v: number) => v.toFixed(1) },
  { key: "ppi" as const, label: "PPI", unit: "%", fmt: (v: number) => v.toFixed(1) },
  { key: "pmi" as const, label: "PMI", unit: "", fmt: (v: number) => v.toFixed(1) },
  { key: "m2" as const, label: "M2 Growth", unit: "%", fmt: (v: number) => v.toFixed(1) },
  { key: "socialFinancing" as const, label: "Social Financing", unit: "%", fmt: (v: number) => v.toFixed(1) },
  { key: "interbankRate" as const, label: "Interbank Rate", unit: "%", fmt: (v: number) => v.toFixed(2) },
  { key: "treasury10Y" as const, label: "10Y Treasury", unit: "%", fmt: (v: number) => v.toFixed(2) },
];

export function Level1MacroRadar({ data, onSubmit }: Level1Props) {
  const [prediction, setPrediction] = useState<RateDirection | null>(null);
  const { macro, news } = data;

  const getColor = (key: string, value: number): string => {
    if (key === "pmi") return value >= 50 ? "#10B981" : "#EF4444";
    if (key === "cpi") return value > 2.5 ? "#EF4444" : value > 1.5 ? "#F59E0B" : "#10B981";
    if (key === "treasury10Y") return "#3B82F6";
    return "#E2E8F0";
  };

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <GameHeader levelId="level1" title="Macro Radar" />

      <div className="px-4 md:px-6 space-y-4">
        {/* Policy banner */}
        <div className="px-4 py-3 rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/5">
          <div className="text-[10px] font-mono text-[#3B82F6] tracking-wider mb-1">CENTRAL BANK POLICY</div>
          <div className="text-sm font-medium text-[#E2E8F0]">{macro.policy}</div>
        </div>

        {/* Macro data grid */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">ECONOMIC INDICATORS</div>
          <div className="grid grid-cols-2 gap-2">
            {MACRO_ITEMS.map((item) => {
              const value = macro[item.key];
              return (
                <DataCard
                  key={item.key}
                  label={item.label}
                  value={item.fmt(value)}
                  unit={item.unit}
                  color={getColor(item.key, value)}
                  large={item.key === "treasury10Y"}
                />
              );
            })}
          </div>
        </div>

        {/* News feed */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">MARKET INTELLIGENCE</div>
          <div className="space-y-2">
            {news.map((n) => (
              <div
                key={n.id}
                className="px-3 py-2.5 rounded-lg border border-[#1E293B] bg-[#0F1117] flex items-start gap-3"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{
                    backgroundColor: n.impact === "bullish" ? "#10B981" : n.impact === "bearish" ? "#EF4444" : "#F59E0B",
                  }}
                />
                <span className="text-xs text-[#CBD5E1] leading-relaxed">{n.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">
            PREDICT: Interest Rate Direction (Next 3 Months)
          </div>
          <div className="space-y-2">
            {RATE_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                label={opt.label}
                selected={prediction === opt.value}
                onClick={() => setPrediction(opt.value)}
              />
            ))}
          </div>
        </div>

        <SubmitButton
          onClick={() => prediction && onSubmit(prediction)}
          disabled={!prediction}
          label="CONFIRM PREDICTION"
        />
      </div>
    </div>
  );
}
