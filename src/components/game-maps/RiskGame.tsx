"use client";
import Image from "next/image";
import { useState } from "react";

type RiskGameProps = {
  onBack?: () => void;
  onComplete?: () => void;
};

const portfolioItems = [
  { id: "a", label: "重仓单一股票（占组合 60%）", level: "高" },
  { id: "b", label: "持有 10 只不同行业股票", level: "低" },
  { id: "c", label: "使用 2 倍融资杠杆", level: "高" },
  { id: "d", label: "持有 20% 现金", level: "低" },
  { id: "e", label: "全部持仓期限集中在 1 个月", level: "高" },
];

const correctRisks = ["a", "c", "e"];

const leverageItems = [
  {
    id: "1",
    label: "2 倍杠杆买入 50% 仓位",
    risk: "高",
    impact: "一旦下跌 30%，本金亏损 60%",
  },
  {
    id: "2",
    label: "使用国债期货对冲利率风险",
    risk: "低",
    impact: "降低组合波动，保护本金",
  },
  {
    id: "3",
    label: "满仓买入一只小盘股",
    risk: "高",
    impact: "流动性差，跌幅可能远超指数",
  },
  {
    id: "4",
    label: "持有 5 只不同行业蓝筹股",
    risk: "低",
    impact: "分散风险，组合波动较小",
  },
  {
    id: "5",
    label: "集中持有到期日相同的债券",
    risk: "高",
    impact: "利率风险集中，再投资风险高",
  },
];

const correctLeverage = ["1", "3", "5"];

const repairOptions = [
  {
    id: "reduce",
    label: "降低单一股票持仓比例",
    correct: true,
    explanation: "将单只股票占比从 60% 降至 15% 以下，可大幅降低个股爆雷风险。",
  },
  {
    id: "hedge",
    label: "买入看跌期权对冲尾部风险",
    correct: true,
    explanation: "期权对冲可保护组合免受极端行情冲击，是专业的风险管理手段。",
  },
  {
    id: "leverage",
    label: "不降低杠杆，继续满仓操作",
    correct: false,
    explanation: "高杠杆在市场下跌时会造成不可逆的本金损失。",
  },
  {
    id: "cash",
    label: "增加现金储备至 30%",
    correct: true,
    explanation: "充足的现金储备既是防御，也保留市场下跌后的抄底能力。",
  },
  {
    id: "concentrate",
    label: "将所有资金集中到一只股票",
    correct: false,
    explanation: "集中持仓增加了非系统性风险，违背风险管理基本准则。",
  },
];

export default function RiskGame({ onBack, onComplete }: RiskGameProps) {
  const [round, setRound] = useState(1);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [selectedLeverage, setSelectedLeverage] = useState<string[]>([]);
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([]);
  const [showDebriefPage, setShowDebriefPage] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [round1Error, setRound1Error] = useState(false);
  const [round2Error, setRound2Error] = useState(false);
  const [round3Error, setRound3Error] = useState(false);

  const toggleRisk = (id: string) => {
    if (gameComplete) return;
    setRound1Error(false);
    setSelectedRisks((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleLeverage = (id: string) => {
    if (gameComplete) return;
    setRound2Error(false);
    setSelectedLeverage((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleRepair = (id: string) => {
    if (gameComplete) return;
    setRound3Error(false);
    setSelectedRepairs((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const submitRound1 = () => {
    const isCorrect =
      correctRisks.every((r) => selectedRisks.includes(r)) &&
      selectedRisks.length === correctRisks.length;
    if (isCorrect) {
      setRound1Error(false);
      setRound(2);
    } else {
      setRound1Error(true);
    }
  };

  const submitRound2 = () => {
    const isCorrect =
      correctLeverage.every((r) => selectedLeverage.includes(r)) &&
      selectedLeverage.length === correctLeverage.length;
    if (isCorrect) {
      setRound2Error(false);
      setRound(3);
    } else {
      setRound2Error(true);
    }
  };

  const submitRound3 = () => {
    const correctRepairs = repairOptions.filter((r) => r.correct).map((r) => r.id);
    const isCorrect =
      correctRepairs.every((r) => selectedRepairs.includes(r)) &&
      selectedRepairs.length === correctRepairs.length;
    if (isCorrect) {
      setRound3Error(false);
      setShowDebriefPage(true);
    } else {
      setRound3Error(true);
    }
  };

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#0c1624] p-3 text-[#d4e4f7]">
      <div className="mx-auto flex h-full w-full max-w-md flex-col gap-2">
        {/* Header */}
        <header className="shrink-0 rounded-[20px] border border-[#1e3a5f] bg-[#0f2035] px-3 py-2.5 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onBack?.()}
              className="rounded-full border border-[#1e3a5f] bg-[#162d4a] px-3 py-1.5 text-[10px] font-bold"
            >
              ← 金融华尔界
            </button>
            <div className="text-center">
              <p className="text-[8px] font-black tracking-[0.18em] text-[#5a8ec9]">
                RISK OFFICER
              </p>
              <p className="text-sm font-black">风险护盾桥</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-[#5a8ec9]">ROUND {round}/3</p>
              <div className="mt-0.5 flex gap-1 text-sm">
                {[1, 2, 3].map((step) => (
                  <span
                    key={step}
                    className={`h-2 w-2 rounded-full ${
                      step <= round ? "bg-[#f59e0b]" : "bg-[#1e3a5f]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          {!showDebriefPage && !gameComplete && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[9px] font-bold text-[#5a8ec9]">
                <span>
                  {round === 1 && "找出组合中的 3 个风险点"}
                  {round === 2 && "判断哪些操作风险高并会放大亏损"}
                  {round === 3 && "选择正确的风险修复措施"}
                </span>
                <span>ROUND {round}/3</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#1a2d44]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#f97316] transition-all duration-300"
                  style={{ width: `${round * 33}%` }}
                />
              </div>
            </div>
          )}
        </header>

        {/* Agent Hint */}
        {!showDebriefPage && !gameComplete && (
          <div className="relative shrink-0 rounded-[20px] border-2 border-[#1e3a5f] bg-[#0f2035] py-2.5 pl-[68px] pr-3 shadow-[0_6px_16px_rgba(0,20,50,0.5)]">
            <div className="absolute -left-1 -top-2 h-[62px] w-[62px]">
              <div className="absolute inset-1 rounded-full bg-[#1e3a5f]/35 blur-lg" />
              <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-[#3a6ea5] bg-[#0f2035] shadow-md">
                <Image
                  src="/risk-agent.PNG"
                  alt="Risk Officer"
                  fill
                  priority
                  className="object-cover object-top scale-110"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#3a6ea5] bg-[#0f2035] text-[11px]">
                🛡️
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-black tracking-[0.12em] text-[#5a8ec9]">
                RISK OFFICER
              </p>
              <span className="rounded-full bg-[#1e3a5f] px-2 py-0.5 text-[8px] font-bold text-[#8ab4f0]">
                风险官
              </span>
            </div>
            <p className="mt-1 text-[11px] font-medium leading-[17px] text-[#b0caf0]">
              {round === 1 && "先扫描一下组合里的风险点。别被收益迷惑，先找隐患。"}
              {round === 2 && "杠杆是把双刃剑。判断哪些操作风险高，会放大亏损。"}
              {round === 3 && "发现风险还不够，要学会修复它。选对修复方案。"}
            </p>
          </div>
        )}

        {/* Game Content */}
        <section className="min-h-0 flex-1 overflow-hidden rounded-[26px] border-[3px] border-[#1e3a5f] bg-[#0a1628] p-3 shadow-2xl">
          <div className="flex h-full flex-col">
            {/* Debrief Page */}
            {showDebriefPage && (
              <div className="flex h-full flex-col justify-center">
                <div className="text-center">
                  <div className="text-5xl">🛡️</div>
                  <p className="mt-2 text-[10px] font-black tracking-[0.16em] text-[#f59e0b]">
                    RISK DEBRIEF
                  </p>
                  <h2 className="mt-1 text-2xl font-black">风险排雷完成</h2>
                </div>
                <div className="mt-4 rounded-[18px] border-2 border-[#1e3a5f] bg-[#0f2035] p-4">
                  <p className="text-xs font-black text-[#f59e0b]">风险知识复盘</p>
                  <ul className="mt-3 space-y-2 text-[11px] leading-5 text-[#b0caf0]">
                    <li className="flex gap-2">
                      <span className="shrink-0 text-[#f59e0b]">✓</span>
                      <span>组合风险扫描：识别集中持仓、高杠杆、期限错配三大隐患</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 text-[#f59e0b]">✓</span>
                      <span>杠杆与风险放大：2 倍杠杆下跌 30% 即亏损 60%，满仓小盘股流动性风险极高</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 text-[#f59e0b]">✓</span>
                      <span>风险修复方案：降低集中度 + 期权对冲 + 增加现金，三管齐下</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 text-[#f59e0b]">✓</span>
                      <span>风险管理不是不投资，而是知道自己在承担什么风险</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => onComplete?.()}
                    className="w-full rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#f97316] py-3 font-bold text-[#0c1624]"
                  >
                    完成风险排雷 →
                  </button>
                </div>
              </div>
            )}

            {/* Round 1 - Portfolio Scan */}
            {!showDebriefPage && round === 1 && (
              <div className="flex h-full flex-col">
                <div className="shrink-0 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black tracking-[0.15em] text-[#5a8ec9]">
                      PORTFOLIO SCAN
                    </p>
                    <h2 className="text-base font-black">风险扫描</h2>
                  </div>
                  <span className="rounded-full bg-[#1e3a5f] px-3 py-1 text-[10px] font-black">
                    选 3 个
                  </span>
                </div>
                <div className="mt-2 grid min-h-0 flex-1 grid-cols-1 gap-1.5">
                  {portfolioItems.map((item) => {
                    const active = selectedRisks.includes(item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleRisk(item.id)}
                        className={`grid grid-cols-[1fr_auto] items-center rounded-[14px] border-2 px-3 py-2 text-left transition ${
                          active
                            ? "border-[#f59e0b] bg-[#1a2d44]"
                            : "border-[#1e3a5f] bg-[#0f2035]"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black">{item.label}</span>
                          </div>
                          {active && (
                            <p className="mt-0.5 text-[9px] font-bold text-[#f59e0b]">
                              ✎ 风险等级：{item.level}
                            </p>
                          )}
                        </div>
                        <span
                          className={`ml-2 text-[10px] font-black ${
                            item.level === "高" ? "text-[#f97316]" : "text-[#34d399]"
                          }`}
                        >
                          {item.level}风险
                        </span>
                      </button>
                    );
                  })}
                </div>
                {round1Error && (
                  <p className="mt-1.5 shrink-0 text-center text-[9px] font-bold text-[#f97316]">
                    💔 再想想，集中持仓、高杠杆、期限错配都是风险点。
                  </p>
                )}
                <button
                  type="button"
                  disabled={selectedRisks.length !== 3}
                  onClick={submitRound1}
                  className="mt-2 shrink-0 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#f97316] py-2.5 text-sm font-black text-[#0c1624] disabled:opacity-40"
                >
                  提交扫描结果 · {selectedRisks.length}/3
                </button>
              </div>
            )}

            {/* Round 2 - Leverage & Risk */}
            {!showDebriefPage && round === 2 && (
              <div className="flex h-full flex-col">
                <div className="shrink-0 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black tracking-[0.15em] text-[#5a8ec9]">
                      LEVERAGE & RISK
                    </p>
                    <h2 className="text-base font-black">杠杆与风险放大</h2>
                  </div>
                  <span className="rounded-full bg-[#1e3a5f] px-3 py-1 text-[10px] font-black">
                    选 3 个
                  </span>
                </div>
                <div className="mt-2 grid min-h-0 flex-1 grid-cols-1 gap-1.5">
                  {leverageItems.map((item) => {
                    const active = selectedLeverage.includes(item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleLeverage(item.id)}
                        className={`rounded-[14px] border-2 px-3 py-2 text-left transition ${
                          active
                            ? "border-[#f59e0b] bg-[#1a2d44]"
                            : "border-[#1e3a5f] bg-[#0f2035]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black">{item.label}</span>
                          <span
                            className={`text-[10px] font-black ${
                              item.risk === "高" ? "text-[#f97316]" : "text-[#34d399]"
                            }`}
                          >
                            {item.risk}风险
                          </span>
                        </div>
                        <p className="mt-1 text-[9px] text-[#8ab4f0]">{item.impact}</p>
                      </button>
                    );
                  })}
                </div>
                {round2Error && (
                  <p className="mt-1.5 shrink-0 text-center text-[9px] font-bold text-[#f97316]">
                    💔 杠杆越高、越集中，风险放大效应越明显。
                  </p>
                )}
                <button
                  type="button"
                  disabled={selectedLeverage.length !== 3}
                  onClick={submitRound2}
                  className="mt-2 shrink-0 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#f97316] py-2.5 text-sm font-black text-[#0c1624] disabled:opacity-40"
                >
                  提交判断 · {selectedLeverage.length}/3
                </button>
              </div>
            )}

            {/* Round 3 - Risk Repair */}
            {!showDebriefPage && round === 3 && (
              <div className="flex h-full flex-col">
                <div className="shrink-0 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black tracking-[0.15em] text-[#5a8ec9]">
                      RISK REPAIR
                    </p>
                    <h2 className="text-base font-black">风险修复</h2>
                  </div>
                  <span className="rounded-full bg-[#1e3a5f] px-3 py-1 text-[10px] font-black">
                    选出正确的修复措施
                  </span>
                </div>
                <div className="mt-2 grid min-h-0 flex-1 grid-cols-1 gap-1.5">
                  {repairOptions.map((item) => {
                    const active = selectedRepairs.includes(item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleRepair(item.id)}
                        className={`rounded-[14px] border-2 px-3 py-2 text-left transition ${
                          active
                            ? "border-[#f59e0b] bg-[#1a2d44]"
                            : "border-[#1e3a5f] bg-[#0f2035]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black">{item.label}</span>
                          {active && (
                            <span className="text-[10px] font-black text-[#f59e0b]">✓</span>
                          )}
                        </div>
                        {active && (
                          <p className="mt-1 text-[9px] text-[#8ab4f0]">{item.explanation}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
                {round3Error && (
                  <p className="mt-1.5 shrink-0 text-center text-[9px] font-bold text-[#f97316]">
                    💔 降低集中度、期权对冲、增加现金都是正确的修复措施。
                  </p>
                )}
                <button
                  type="button"
                  disabled={selectedRepairs.length < 2}
                  onClick={submitRound3}
                  className="mt-2 shrink-0 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#f97316] py-2.5 text-sm font-black text-[#0c1624] disabled:opacity-40"
                >
                  提交修复方案
                </button>
              </div>
            )}
          </div>
        </section>

        <p className="shrink-0 text-center text-[8px] font-bold text-[#3a6ea5]">
          风险训练案例仅用于学习风险管理方法，不构成投资建议。
        </p>
      </div>
    </main>
  );
}