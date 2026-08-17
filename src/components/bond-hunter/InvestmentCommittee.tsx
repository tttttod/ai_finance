"use client";

import { useState } from "react";
import type { RateDirection } from "./types";
import { GameHeader, OptionButton, SubmitButton } from "./GameUI";

interface CommitteeProps {
  onComplete: (score: number) => void;
}

const QUESTIONS = [
  {
    id: "rate",
    title: "利率展望 Rate Outlook",
    question: "你对未来3个月利率方向的判断是？",
    options: [
      { value: "sharp_up", label: "大幅上升 Sharp Up" },
      { value: "slight_up", label: "小幅上升 Slight Up" },
      { value: "unchanged", label: "基本不变 Unchanged" },
      { value: "slight_down", label: "小幅下降 Slight Down" },
      { value: "sharp_down", label: "大幅下降 Sharp Down" },
    ],
  },
  {
    id: "asset",
    title: "最优资产 Best Asset",
    question: "当前哪类资产的风险调整后收益最优？",
    options: [
      { value: "short_gov", label: "短期国债 Short Gov" },
      { value: "long_gov", label: "长期国债 Long Gov" },
      { value: "aaa_credit", label: "AAA信用债 AAA Corp" },
      { value: "aa_credit", label: "AA信用债 AA Corp" },
      { value: "cash", label: "现金/货币市场 Cash" },
    ],
  },
  {
    id: "duration",
    title: "久期策略 Duration",
    question: "组合久期应如何调整？",
    options: [
      { value: "increase", label: "拉长久期 Increase" },
      { value: "maintain", label: "维持不变 Maintain" },
      { value: "decrease", label: "缩短久期 Decrease" },
    ],
  },
  {
    id: "credit",
    title: "信用策略 Credit",
    question: "信用债配置应如何变化？",
    options: [
      { value: "increase", label: "增加信用敞口 Increase" },
      { value: "maintain", label: "维持不变 Maintain" },
      { value: "decrease", label: "减少信用敞口 Decrease" },
    ],
  },
];

export function InvestmentCommittee({ onComplete }: CommitteeProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [allocation, setAllocation] = useState({ government: 35, aaa: 30, aa: 15, cash: 20 });

  const currentQ = QUESTIONS[step];
  const totalSteps = QUESTIONS.length + 1; // +1 for allocation

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(step + 1); // Go to allocation step
    }
  };

  const handleAllocationSubmit = () => {
    // Calculate committee score
    let score = 0;
    const totalQ = QUESTIONS.length;

    // Rate direction - reward moderate answers
    if (answers.rate === "slight_down" || answers.rate === "unchanged") score += 25;
    else if (answers.rate === "slight_up") score += 15;
    else score += 10;

    // Asset class
    if (answers.asset === "aaa_credit") score += 25;
    else if (answers.asset === "short_gov") score += 20;
    else score += 10;

    // Duration
    if (answers.duration === "maintain") score += 25;
    else if (answers.duration === "decrease") score += 15;
    else score += 10;

    // Credit
    if (answers.credit === "maintain" || answers.credit === "decrease") score += 25;
    else score += 10;

    onComplete(score);
  };

  const totalAlloc = allocation.government + allocation.aaa + allocation.aa + allocation.cash;

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <div className="px-4 md:px-6 pt-4 pb-3">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-[#F59E0B]/30 bg-[#F59E0B]/5 mb-3">
            <span className="text-[10px] font-mono text-[#F59E0B] tracking-wider">最终关卡 FINAL STAGE</span>
          </div>
          <h2 className="text-xl font-bold text-[#E2E8F0]">投资委员会 Investment Committee</h2>
          <p className="text-xs text-[#64748B] mt-1">陈述你的最终投资观点</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: i <= step ? "#F59E0B" : "#1E293B" }}
            />
          ))}
        </div>
      </div>

      <div className="px-4 md:px-6">
        {step < QUESTIONS.length ? (
          <div>
            <div className="mb-2">
              <span className="text-[10px] font-mono text-[#F59E0B] tracking-wider">
                问题 {step + 1} / {QUESTIONS.length}: {currentQ.title}
              </span>
            </div>
            <div className="text-sm font-medium text-[#E2E8F0] mb-4">{currentQ.question}</div>
            <div className="space-y-2">
              {currentQ.options.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={answers[currentQ.id] === opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  color="#F59E0B"
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-2">
              <span className="text-[10px] font-mono text-[#F59E0B] tracking-wider">
                最终配置 FINAL ALLOCATION
              </span>
            </div>
            <div className="text-sm font-medium text-[#E2E8F0] mb-4">
              设定你的最终组合配置:
            </div>

            <div className="space-y-3 mb-4">
              {[
                { id: "government", label: "利率债 Government", color: "#3B82F6" },
                { id: "aaa", label: "AAA信用债 AAA Corp", color: "#10B981" },
                { id: "aa", label: "AA信用债 AA Corp", color: "#F59E0B" },
                { id: "cash", label: "现金 Cash", color: "#64748B" },
              ].map((item) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-[#E2E8F0]">{item.label}</span>
                    </div>
                    <span className="text-xs font-mono font-bold" style={{ color: item.color }}>
                      {allocation[item.id as keyof typeof allocation]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={allocation[item.id as keyof typeof allocation]}
                    onChange={(e) => setAllocation(prev => ({ ...prev, [item.id]: parseInt(e.target.value) }))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${item.color} 0%, ${item.color} ${allocation[item.id as keyof typeof allocation]}%, #1E293B ${allocation[item.id as keyof typeof allocation]}%, #1E293B 100%)` }}
                  />
                </div>
              ))}
            </div>

            <div className={`text-center text-xs font-mono mb-4 ${totalAlloc === 100 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
              合计: {totalAlloc}% {totalAlloc !== 100 && `(须等于100%)`}
            </div>

            <SubmitButton
              onClick={handleAllocationSubmit}
              disabled={totalAlloc !== 100}
              label="提交投委会 SUBMIT"
            />
          </div>
        )}
      </div>
    </div>
  );
}
