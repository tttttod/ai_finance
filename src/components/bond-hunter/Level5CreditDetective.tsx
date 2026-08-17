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
    { label: "杠杆率 Leverage", value: `${leverage}%`, color: parseFloat(leverage) > 80 ? "#EF4444" : parseFloat(leverage) > 60 ? "#F59E0B" : "#10B981", status: parseFloat(leverage) > 80 ? "高 HIGH" : parseFloat(leverage) > 60 ? "中 MOD" : "低 LOW" },
    { label: "利息覆盖 Coverage", value: `${interestCoverage}x`, color: parseFloat(interestCoverage) < 2 ? "#EF4444" : parseFloat(interestCoverage) < 4 ? "#F59E0B" : "#10B981", status: parseFloat(interestCoverage) < 2 ? "弱 WEAK" : parseFloat(interestCoverage) < 4 ? "一般 OK" : "强 STRONG" },
    { label: "现金流/利息 CF Ratio", value: `${cashFlowRatio}x`, color: parseFloat(cashFlowRatio) < 1.5 ? "#EF4444" : parseFloat(cashFlowRatio) < 2.5 ? "#F59E0B" : "#10B981", status: parseFloat(cashFlowRatio) < 1.5 ? "紧张 TIGHT" : parseFloat(cashFlowRatio) < 2.5 ? "适中 MOD" : "充裕 OK" },
    { label: "净债务 Net Debt", value: `¥${netDebt}B`, color: netDebt > 100 ? "#EF4444" : "#F59E0B", status: netDebt > 100 ? "偏高 HIGH" : "可控 OK" },
    { label: "信用利差 Spread", value: `${creditSpread}bp`, color: parseFloat(creditSpread) > 200 ? "#EF4444" : parseFloat(creditSpread) > 100 ? "#F59E0B" : "#10B981", status: parseFloat(creditSpread) > 200 ? "宽 WIDE" : parseFloat(creditSpread) > 100 ? "适中 MOD" : "窄 TIGHT" },
  ];

  return (
    <div className="min-h-screen pb-6" style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <GameHeader levelId="level5" title="信用侦探 Credit Detective" />

      <div className="px-4 md:px-6 space-y-4">
        {/* Company header */}
        <div className="px-4 py-3 rounded-lg border border-[#1E293B] bg-[#0F1117]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[#E2E8F0]">{companyName}</div>
              <div className="text-[10px] font-mono text-[#475569]">信用债: {bond.name}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-[#F59E0B]">{bond.rating}</div>
              <div className="text-[10px] font-mono text-[#475569]">评级 RATING</div>
            </div>
          </div>
        </div>

        {/* Bond details */}
        <div className="grid grid-cols-2 gap-2">
          <DataCard label="票息 COUPON" value={`${bond.couponRate.toFixed(2)}%`} color="#F59E0B" />
          <DataCard label="到期收益率 YTM" value={`${bond.ytm.toFixed(2)}%`} color="#3B82F6" />
          <DataCard label="剩余期限 MATURITY" value={`${bond.remainingYears}年`} />
          <DataCard label="市场价格 PRICE" value={`¥${bond.marketPrice.toFixed(2)}`} color={bond.marketPrice >= 100 ? "#10B981" : "#EF4444"} />
        </div>

        {/* Financials */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">公司基本面 FUNDAMENTALS</div>
          <div className="grid grid-cols-3 gap-2">
            <DataCard label="营收增长 REV" value={`${financials.revenueGrowth}%`} color={financials.revenueGrowth > 0 ? "#10B981" : "#EF4444"} />
            <DataCard label="EBITDA利润率" value={`${financials.ebitdaMargin}%`} />
            <DataCard label="总债务 DEBT" value={`¥${financials.totalDebt}B`} color="#EF4444" />
            <DataCard label="现金 CASH" value={`¥${financials.cash}B`} color="#10B981" />
            <DataCard label="利息支出 INT" value={`¥${financials.interestExpense}B`} />
            <DataCard label="经营现金流 OCF" value={`¥${financials.operatingCashFlow}B`} color={financials.operatingCashFlow > financials.interestExpense ? "#10B981" : "#EF4444"} />
          </div>
        </div>

        {/* Analysis toggle */}
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="w-full py-2.5 rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/5 text-xs font-mono font-bold text-[#3B82F6] transition-all hover:bg-[#3B82F6]/10"
        >
          {showAnalysis ? "收起" : "展开"} 信用分析 CREDIT ANALYSIS
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
          <div className="text-[10px] font-mono text-[#F59E0B] tracking-wider mb-1">最新消息 LATEST NEWS</div>
          <div className="text-xs text-[#CBD5E1]">{news}</div>
        </div>

        {/* Decision */}
        <div>
          <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-2">你的决策 YOUR DECISION</div>
          <div className="grid grid-cols-3 gap-2">
            {(["BUY", "HOLD", "SELL"] as const).map((d) => {
              const colors = { BUY: "#10B981", HOLD: "#F59E0B", SELL: "#EF4444" };
              const labels = { BUY: "买入 BUY", HOLD: "持有 HOLD", SELL: "卖出 SELL" };
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
                  {labels[d]}
                </button>
              );
            })}
          </div>
        </div>

        <SubmitButton
          onClick={() => decision && onSubmit(decision)}
          disabled={!decision}
          label="确认决策 CONFIRM"
        />
      </div>
    </div>
  );
}
