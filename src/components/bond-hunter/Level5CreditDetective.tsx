"use client";

import { useState } from "react";
import type { Level5Data } from "./types";
import { GameHeader, DataCard, SubmitButton } from "./GameUI";

interface Level5Props {
  data: Level5Data;
  onSubmit: (decision: "BUY" | "HOLD" | "SELL") => void;
}

export function Level5CreditDetective({ data, onSubmit }: Level5Props) {
  const [decision, setDecision] = useState<"BUY" | "HOLD" | "SELL" | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { companyName, bond, financials, news } = data;

  const leverage = (financials.totalDebt / (financials.totalDebt + financials.cash) * 100).toFixed(1);
  const interestCoverage = (financials.ebitdaMargin * (100 + financials.revenueGrowth) / 100 / financials.interestExpense * 10).toFixed(1);
  const cashFlowRatio = (financials.operatingCashFlow / financials.interestExpense).toFixed(1);
  const netDebt = financials.totalDebt - financials.cash;
  const creditSpread = (bond.ytm - 2.0).toFixed(0);

  const analysisItems = [
    { label: "Leverage Ratio", value: `${leverage}%`, color: parseFloat(leverage) > 80 ? "#EF4444" : parseFloat(leverage) > 60 ? "#F59E0B" : "#10B981", status: parseFloat(leverage) > 80 ? "HIGH" : parseFloat(leverage) > 60 ? "MODERATE" : "LOW" },
    { label: "Interest Coverage", value: `${interestCoverage}x`, color: parseFloat(interestCoverage) < 2 ? "#EF4444" : parseFloat(interestCoverage) < 4 ? "#F59E0B" : "#10B981", status: parseFloat(interestCoverage) < 2 ? "WEAK" : parseFloat(interestCoverage) < 4 ? "ADEQUATE" : "STRONG" },
    { label: "Cash Flow / Interest", value: `${cashFlowRatio}x`, color: parseFloat(cashFlowRatio) < 1.5 ? "#EF4444" : parseFloat(cashFlowRatio) < 2.5 ? "#F59E0B" : "#10B981", status: parseFloat(cashFlowRatio) < 1.5 ? "TIGHT" : parseFloat(cashFlowRatio) < 2.5 ? "MODERATE" : "COMFORTABLE" },
    { label: "Net Debt", value: `¥${netDebt}B`, color: netDebt > 100 ? "#EF4444" : "#F59E0B", status: netDebt > 100 ? "ELEVATED" : "MANAGEABLE" },
    { label: "Credit Spread", value: `${creditSpread}bp`, color: parseFloat(creditSpread) > 200 ? "#EF4444" : parseFloat(creditSpread) > 100 ? "#F59E0B" : "#10B981", status: parseFloat(creditSpread) > 200 ? "WIDE" : parseFloat(creditSpread) > 100 ? "MODERATE" : "TIGHT" },
  ];

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <GameHeader levelId="level5" title="Credit Detective" />

      <div className="px-4 md:px-6 space-y-4">
        {/* Company header */}
        <div className="px-4 py-3 rounded-lg border border-[#1E293B] bg-[#0F1117]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[#E2E8F0]">{companyName}</div>
              <div className="text-[10px] font-mono text-[#475569]">Corporate Bond: {bond.name}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-[#F59E0B]">{bond.rating}</div>
              <div className="text-[10px] font-mono text-[#475569]">RATING</div>
            </div>
          </div>
        </div>

        {/* Bond details */}
        <div className="grid grid-cols-2 gap-2">
          <DataCard label="COUPON" value={`${bond.couponRate.toFixed(2)}%`} color="#F59E0B" />
          <DataCard label="YTM" value={`${bond.ytm.toFixed(2)}%`} color="#3B82F6" />
          <DataCard label="MATURITY" value={`${bond.remainingYears}Y`} />
          <DataCard label="MARKET PRICE" value={`¥${bond.marketPrice.toFixed(2)}`} color={bond.marketPrice >= 100 ? "#10B981" : "#EF4444"} />
        </div>

        {/* Financials */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">COMPANY FUNDAMENTALS</div>
          <div className="grid grid-cols-3 gap-2">
            <DataCard label="REV GROWTH" value={`${financials.revenueGrowth}%`} color={financials.revenueGrowth > 0 ? "#10B981" : "#EF4444"} />
            <DataCard label="EBITDA MARGIN" value={`${financials.ebitdaMargin}%`} />
            <DataCard label="TOTAL DEBT" value={`¥${financials.totalDebt}B`} color="#EF4444" />
            <DataCard label="CASH" value={`¥${financials.cash}B`} color="#10B981" />
            <DataCard label="INT. EXPENSE" value={`¥${financials.interestExpense}B`} />
            <DataCard label="OP. CASHFLOW" value={`¥${financials.operatingCashFlow}B`} color={financials.operatingCashFlow > financials.interestExpense ? "#10B981" : "#EF4444"} />
          </div>
        </div>

        {/* Analysis toggle */}
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="w-full py-2.5 rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/5 text-xs font-mono font-bold text-[#3B82F6] transition-all hover:bg-[#3B82F6]/10"
        >
          {showAnalysis ? "HIDE" : "SHOW"} CREDIT ANALYSIS
        </button>

        {showAnalysis && (
          <div className="space-y-2">
            {analysisItems.map((item) => (
              <div key={item.label} className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#475569]">{item.label}</div>
                  <div className="text-sm font-mono font-bold" style={{ color: item.color }}>{item.value}</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{
                  color: item.color,
                  backgroundColor: `${item.color}15`,
                }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* News */}
        <div className="px-4 py-3 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5">
          <div className="text-[10px] font-mono text-[#F59E0B] tracking-wider mb-1">LATEST NEWS</div>
          <div className="text-xs text-[#CBD5E1]">{news}</div>
        </div>

        {/* Decision */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">YOUR DECISION</div>
          <div className="grid grid-cols-3 gap-2">
            {(["BUY", "HOLD", "SELL"] as const).map((d) => {
              const colors = { BUY: "#10B981", HOLD: "#F59E0B", SELL: "#EF4444" };
              const isSelected = decision === d;
              return (
                <button
                  key={d}
                  onClick={() => setDecision(d)}
                  className={`py-3 rounded-lg border font-bold text-sm transition-all duration-200 ${
                    isSelected ? "" : "border-[#1E293B] bg-[#0F1117] hover:border-[#334155]"
                  }`}
                  style={isSelected ? {
                    borderColor: colors[d],
                    backgroundColor: `${colors[d]}15`,
                    color: colors[d],
                    boxShadow: `0 0 12px ${colors[d]}20`,
                  } : { color: "#94A3B8" }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <SubmitButton
          onClick={() => decision && onSubmit(decision)}
          disabled={!decision}
          label="CONFIRM DECISION"
        />
      </div>
    </div>
  );
}
