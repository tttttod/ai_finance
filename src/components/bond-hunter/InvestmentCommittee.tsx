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
    title: "Rate Outlook",
    question: "What is your view on interest rates over the next 3 months?",
    options: [
      { value: "sharp_up", label: "Sharp Increase" },
      { value: "slight_up", label: "Slight Increase" },
      { value: "unchanged", label: "Unchanged" },
      { value: "slight_down", label: "Slight Decrease" },
      { value: "sharp_down", label: "Sharp Decrease" },
    ],
  },
  {
    id: "asset",
    title: "Best Asset Class",
    question: "Which asset class offers the best risk-adjusted return currently?",
    options: [
      { value: "short_gov", label: "Short Government Bonds" },
      { value: "long_gov", label: "Long Government Bonds" },
      { value: "aaa_credit", label: "AAA Corporate Bonds" },
      { value: "aa_credit", label: "AA Corporate Bonds" },
      { value: "cash", label: "Cash / Money Market" },
    ],
  },
  {
    id: "duration",
    title: "Duration Strategy",
    question: "How should portfolio duration be adjusted?",
    options: [
      { value: "increase", label: "Increase Duration" },
      { value: "maintain", label: "Maintain Current" },
      { value: "decrease", label: "Decrease Duration" },
    ],
  },
  {
    id: "credit",
    title: "Credit Strategy",
    question: "How should credit bond allocation change?",
    options: [
      { value: "increase", label: "Increase Credit Exposure" },
      { value: "maintain", label: "Maintain Current" },
      { value: "decrease", label: "Decrease Credit Exposure" },
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
            <span className="text-[10px] font-mono text-[#F59E0B] tracking-wider">FINAL STAGE</span>
          </div>
          <h2 className="text-xl font-bold text-[#E2E8F0]">Investment Committee</h2>
          <p className="text-xs text-[#64748B] mt-1">Present your final investment views</p>
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
                QUESTION {step + 1} / {QUESTIONS.length}: {currentQ.title}
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
                FINAL ALLOCATION
              </span>
            </div>
            <div className="text-sm font-medium text-[#E2E8F0] mb-4">
              Set your final portfolio allocation:
            </div>

            <div className="space-y-3 mb-4">
              {[
                { id: "government", label: "Government Bonds", color: "#3B82F6" },
                { id: "aaa", label: "AAA Corporate", color: "#10B981" },
                { id: "aa", label: "AA Corporate", color: "#F59E0B" },
                { id: "cash", label: "Cash", color: "#64748B" },
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
              Total: {totalAlloc}% {totalAlloc !== 100 && `(must equal 100%)`}
            </div>

            <SubmitButton
              onClick={handleAllocationSubmit}
              disabled={totalAlloc !== 100}
              label="SUBMIT TO COMMITTEE"
            />
          </div>
        )}
      </div>
    </div>
  );
}
