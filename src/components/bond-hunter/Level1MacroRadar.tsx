"use client";

import { useState } from "react";
import type { Level1Data, RateDirection } from "./types";
import { GameHeader, DataCard, OptionButton, SubmitButton } from "./GameUI";

interface Level1Props {
  data: Level1Data;
  onSubmit: (prediction: RateDirection) => void;
}

const RATE_OPTIONS: { value: RateDirection; label: string }[] = [
  { value: "sharp_up", label: "大幅上升 Sharp Up" },
  { value: "slight_up", label: "小幅上升 Slight Up" },
  { value: "unchanged", label: "基本不变 Unchanged" },
  { value: "slight_down", label: "小幅下降 Slight Down" },
  { value: "sharp_down", label: "大幅下降 Sharp Down" },
];

export function Level1MacroRadar({ data, onSubmit }: Level1Props) {
  const [prediction, setPrediction] = useState<RateDirection | null>(null);
  const { macro, news } = data;

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <GameHeader levelId="level1" title="宏观雷达 Macro Radar" />

      <div className="px-4 md:px-6 space-y-4">
        {/* Macro data grid */}
        <div className="grid grid-cols-3 gap-2">
          <DataCard label="GDP 增长" value={`${macro.gdp}%`} color={macro.gdp > 5 ? "#10B981" : "#F59E0B"} />
          <DataCard label="CPI 通胀" value={`${macro.cpi}%`} color={macro.cpi > 2 ? "#EF4444" : "#10B981"} />
          <DataCard label="PPI" value={`${macro.ppi}%`} color={macro.ppi > 0 ? "#F59E0B" : "#10B981"} />
          <DataCard label="PMI" value={macro.pmi.toString()} color={macro.pmi > 50 ? "#10B981" : "#EF4444"} />
          <DataCard label="M2 增速" value={`${macro.m2}%`} color="#3B82F6" />
          <DataCard label="社融 Social Fin" value={`${macro.socialFinancing}%`} color="#8B5CF6" />
          <DataCard label="央行政策 Policy" value={macro.policy} color="#F59E0B" />
          <DataCard label="银行间利率" value={`${macro.interbankRate}%`} color="#06B6D4" />
          <DataCard label="10Y 国债" value={`${macro.treasury10Y}%`} color="#3B82F6" />
        </div>

        {/* News section */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">
            市场新闻 MARKET NEWS
          </div>
          <div className="space-y-2">
            {news.map((item) => (
              <div key={item.id} className="px-4 py-3 rounded-lg border border-[#1E293B] bg-[#0F1117]">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    item.impact === "bullish" ? "bg-[#10B981]/10 text-[#10B981]" :
                    item.impact === "bearish" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                    "bg-[#F59E0B]/10 text-[#F59E0B]"
                  }`}>
                    {item.impact === "bullish" ? "利好" : item.impact === "bearish" ? "利空" : "中性"}
                  </span>
                </div>
                <div className="text-xs text-[#CBD5E1] leading-relaxed">{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">
            判断：未来3个月利率方向 Rate Direction?
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
          label="提交 SUBMIT"
        />
      </div>
    </div>
  );
}
