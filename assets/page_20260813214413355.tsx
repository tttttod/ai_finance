"use client";

import Image from "next/image";
import { useState } from "react";

type FundamentalGameProps = {
  onBack?: () => void;
  onComplete?: () => void;
};

const financials = [
  { id: "revenue", label: "营业收入", value: "12.0 亿元", change: "+25%", note: "增长很快，原因是什么？" },
  { id: "profit", label: "净利润", value: "2.1 亿元", change: "+48%", note: "利润增长是否有现金支持？" },
  { id: "cashflow", label: "经营活动现金流", value: "0.3 亿元", change: "-72%", note: "利润上涨，现金为什么反而下降？" },
  { id: "receivable", label: "应收账款", value: "4.8 亿元", change: "+95%", note: "这么多钱为什么还没收回来？" },
  { id: "inventory", label: "存货", value: "1.9 亿元", change: "+12%", note: "库存变化是否异常？" },
];

const evidence = [
  { id: "customer", text: "前五大客户销售占比从 31% 上升至 68%" },
  { id: "office", text: "公司今年重新装修了总部办公室" },
  { id: "yearEnd", text: "12 月确认的收入占全年收入 37%" },
];

const actions = [
  { id: "price", text: "查看公司近期股价走势" },
  { id: "receivable", text: "查看应收账款账龄及主要客户" },
  { id: "forum", text: "查看论坛网友是否普遍看多" },
];

const cashQualityOptions = [
  {
    id: "healthy",
    title: "现金质量健康",
    text: "利润增长很快，说明经营现金流暂时下降并不重要。",
  },
  {
    id: "warning",
    title: "利润含金量需警惕",
    text: "利润大涨，但经营现金流大降、应收大增，说明利润尚未充分转化为现金。",
  },
  {
    id: "valuation",
    title: "估值过低",
    text: "当前主要问题是市场可能低估了公司。",
  },
];

const conclusionOptions = [
  { id: "fraud", text: "可以直接认定公司存在财务造假。" },
  { id: "ignore", text: "增长很快，所以这些异常可以先忽略。" },
  {
    id: "verify",
    text: "异常已经形成证据链，应继续核查收入质量、回款与客户集中度，但不能仅凭这些直接定性。",
  },
];

function AgentHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative shrink-0 rounded-[20px] border-2 border-[#9a764e] bg-[#f3dfb2] py-2.5 pl-[68px] pr-3 shadow-[0_6px_16px_rgba(83,52,28,0.14)]">
      <div className="absolute -left-1 -top-2 h-[62px] w-[62px]">
        <div className="absolute inset-1 rounded-full bg-[#d8b66f]/35 blur-lg" />
        <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-[#8e673c] bg-[#f3e4bd] shadow-md">
          <Image
            src="/fundamental-agnt.png"
            alt="Fundamental Agent"
            fill
            priority
            className="object-cover object-top scale-110"
          />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#8e673c] bg-[#f5e7c4] text-[11px]">
          🔍
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-[9px] font-black tracking-[0.12em] text-[#70472c]">
          FUNDAMENTAL AGENT
        </p>
        <span className="rounded-full bg-[#d9bd7b] px-2 py-0.5 text-[8px] font-bold text-[#5b402b]">
          基本面分析师
        </span>
      </div>

      <p className="mt-1 text-[11px] font-medium leading-[17px] text-[#5a3e28]">
        {children}
      </p>
    </div>
  );
}

export default function FundamentalGame({
  onBack,
  onComplete,
}: FundamentalGameProps) {
  const [step, setStep] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameCleared, setGameCleared] = useState(false);

  const [selectedFinancials, setSelectedFinancials] = useState<string[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedCashQuality, setSelectedCashQuality] = useState<string | null>(null);
  const [selectedConclusion, setSelectedConclusion] = useState<string | null>(null);

  const [step1Wrong, setStep1Wrong] = useState(false);
  const [step2Wrong, setStep2Wrong] = useState(false);
  const [step3Wrong, setStep3Wrong] = useState(false);
  const [step4Wrong, setStep4Wrong] = useState(false);
  const [step5Wrong, setStep5Wrong] = useState(false);

  const correctFinancials = ["cashflow", "receivable"];
  const correctEvidence = ["customer", "yearEnd"];

  const financialCorrect =
    selectedFinancials.length === 2 &&
    correctFinancials.every((id) => selectedFinancials.includes(id));

  const evidenceCorrect =
    selectedEvidence.length === 2 &&
    correctEvidence.every((id) => selectedEvidence.includes(id));

  function loseLife() {
    setLives((prev) => {
      const next = prev - 1;

      if (next <= 0) {
        setGameOver(true);
        return 0;
      }

      return next;
    });
  }

  function toggleFinancial(id: string) {
    if (gameOver || gameCleared) return;
    setStep1Wrong(false);

    setSelectedFinancials((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  function toggleEvidence(id: string) {
    if (gameOver || gameCleared) return;
    setStep2Wrong(false);

    setSelectedEvidence((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  function submitFinancials() {
    if (financialCorrect) {
      setStep1Wrong(false);
      setStep(2);
      return;
    }
    loseLife();
    setStep1Wrong(true);
    setSelectedFinancials([]);
  }

  function submitEvidence() {
    if (evidenceCorrect) {
      setStep2Wrong(false);
      setStep(3);
      return;
    }
    loseLife();
    setStep2Wrong(true);
    setSelectedEvidence([]);
  }

  function submitAction() {
    if (selectedAction === "receivable") {
      setStep3Wrong(false);
      setStep(4);
      return;
    }
    loseLife();
    setStep3Wrong(true);
    setSelectedAction(null);
  }

  function submitCashQuality() {
    if (selectedCashQuality === "warning") {
      setStep4Wrong(false);
      setStep(5);
      return;
    }
    loseLife();
    setStep4Wrong(true);
    setSelectedCashQuality(null);
  }

  function submitConclusion() {
    if (selectedConclusion === "verify") {
      setStep5Wrong(false);
      setGameCleared(true);
      return;
    }
    loseLife();
    setStep5Wrong(true);
    setSelectedConclusion(null);
  }

  function resetGame() {
    setStep(1);
    setLives(3);
    setGameOver(false);
    setGameCleared(false);

    setSelectedFinancials([]);
    setSelectedEvidence([]);
    setSelectedAction(null);
    setSelectedCashQuality(null);
    setSelectedConclusion(null);

    setStep1Wrong(false);
    setStep2Wrong(false);
    setStep3Wrong(false);
    setStep4Wrong(false);
    setStep5Wrong(false);
  }

  const rank =
    lives === 3
      ? { label: "S级｜王牌财报侦探", icon: "🏆" }
      : lives === 2
        ? { label: "A级｜敏锐调查员", icon: "🔎" }
        : { label: "B级｜惊险破案", icon: "🗂️" };

  const taskText =
    step === 1
      ? "圈出 2 个最值得怀疑的财务指标"
      : step === 2
        ? "从补充材料中找出 2 条关键证据"
        : step === 3
          ? "决定下一步最该调查什么"
          : step === 4
            ? "判断利润的“含金量”"
            : "给出谨慎、专业的研究结论";

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#2b211a] p-3 text-[#3c2a1d]">
      <div className="mx-auto flex h-full w-full max-w-md flex-col gap-2">
        <header className="shrink-0 rounded-[20px] border border-[#8e673c] bg-[#3a2a20] px-3 py-2.5 text-[#f3dfb2] shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onBack?.()}
              className="rounded-full border border-[#8e673c] bg-[#493429] px-3 py-1.5 text-[10px] font-bold"
            >
              ← 金融华尔界
            </button>

            <div className="text-center">
              <p className="text-[8px] font-black tracking-[0.18em] text-[#c7a56a]">
                CURRENT CASE
              </p>
              <p className="text-sm font-black">财报侦探 · 星河科技</p>
            </div>

            <div className="text-right">
              <p className="text-[8px] font-black text-[#c7a56a]">STEP {step}/5</p>
              <div className="mt-0.5 flex gap-0.5">
                {[0, 1, 2].map((heart) => (
                  <span
                    key={heart}
                    className={`text-base ${
                      heart < lives ? "opacity-100" : "grayscale opacity-25"
                    }`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          </div>

          {!gameOver && !gameCleared && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[9px] font-bold text-[#d9c092]">
                <span>{taskText}</span>
                <span>{step}/5</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#5b4433]">
                <div
                  className="h-full rounded-full bg-[#c7a56a] transition-all duration-300"
                  style={{ width: `${step * 20}%` }}
                />
              </div>
            </div>
          )}
        </header>

        {!gameOver && !gameCleared && (
          <AgentHint>
            {step === 1 &&
              "先别被漂亮的利润数字骗到。看看公司赚到的钱，真的变成现金了吗？"}
            {step === 2 &&
              "一个异常数字还不够。真正的调查，要看不同证据能不能互相对上。"}
            {step === 3 &&
              "别急着下结论。下一步调查应该优先验证最核心的矛盾。"}
            {step === 4 &&
              "利润表说“赚了”，现金流量表却说“钱没进来”——这就是利润质量问题。"}
            {step === 5 &&
              "研究员最后要做的，不是夸大结论，而是明确：我们知道什么、还不知道什么。"}
          </AgentHint>
        )}

        <section className="min-h-0 flex-1 overflow-hidden rounded-[26px] border-[3px] border-[#8e673c] bg-[#ead7a5] p-3 shadow-2xl">
          <div className="flex h-full flex-col">
            {gameOver && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="text-5xl">💔</div>
                <p className="mt-2 text-[10px] font-black tracking-[0.18em] text-[#8f2f25]">
                  INVESTIGATION FAILED
                </p>
                <h2 className="mt-1 text-2xl font-black text-[#7d3028]">
                  调查失败
                </h2>
                <p className="mt-3 max-w-xs text-sm leading-6 text-[#6d4035]">
                  三颗调查之心已经耗尽。重新梳理“利润、现金流、应收账款”之间的关系再试一次。
                </p>
                <button
                  type="button"
                  onClick={resetGame}
                  className="mt-5 w-full max-w-xs rounded-xl bg-[#70472c] py-3 font-bold text-[#fff1d0]"
                >
                  重新调查 ❤️❤️❤️
                </button>
              </div>
            )}

            {gameCleared && !gameOver && (
              <div className="flex h-full flex-col justify-center">
                <div className="text-center">
                  <div className="text-5xl">{rank.icon}</div>
                  <p className="mt-2 text-[10px] font-black tracking-[0.16em] text-[#52724c]">
                    CASE CLOSED
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#355037]">
                    调查完成
                  </h2>
                  <p className="mt-2 text-lg font-black text-[#355037]">
                    {rank.label}
                  </p>
                </div>

                <div className="mt-4 rounded-[18px] border-2 border-[#52724c] bg-[#dce9cf] p-4">
                  <p className="text-xs font-black text-[#355037]">案件结论</p>
                  <p className="mt-2 text-[12px] leading-5 text-[#3f4937]">
                    利润增长、经营现金流下降、应收账款激增、客户集中度上升以及年末收入集中确认，
                    已形成值得继续核查的证据链，但这些现象本身不能直接证明财务造假。
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => onComplete?.()}
                    className="w-full rounded-xl bg-[#70472c] py-3 font-bold text-[#fff1d0]"
                  >
                    完成调查，继续旅程 →
                  </button>

                  <button
                    type="button"
                    onClick={resetGame}
                    className="w-full rounded-xl border border-[#8d6a42] py-2.5 font-semibold text-[#5b402b]"
                  >
                    重新挑战
                  </button>
                </div>
              </div>
            )}

            {!gameOver && !gameCleared && step === 1 && (
              <div className="flex h-full flex-col">
                <div className="shrink-0 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black tracking-[0.15em] text-[#7c5a37]">
                      CASE FILE · 001
                    </p>
                    <h2 className="text-base font-black">找出异常指标</h2>
                  </div>
                  <span className="rounded-full bg-[#d8b77d] px-3 py-1 text-[10px] font-black">
                    选 2 个
                  </span>
                </div>

                <div className="mt-2 grid min-h-0 flex-1 grid-cols-1 gap-1.5">
                  {financials.map((item) => {
                    const active = selectedFinancials.includes(item.id);

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleFinancial(item.id)}
                        className={`grid grid-cols-[1fr_auto] items-center rounded-[14px] border-2 px-3 py-2 text-left transition ${
                          active
                            ? "border-[#9f3428] bg-[#f0c7ac]"
                            : "border-[#b99564] bg-[#f8edcf]"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black">{item.label}</span>
                            <span className="text-[10px] text-[#75543a]">{item.value}</span>
                          </div>
                          {active && (
                            <p className="mt-0.5 truncate text-[9px] font-bold text-[#9f3428]">
                              ✎ {item.note}
                            </p>
                          )}
                        </div>

                        <span
                          className={`ml-2 text-[12px] font-black ${
                            item.change.startsWith("-")
                              ? "text-[#a63b2e]"
                              : "text-[#436b4a]"
                          }`}
                        >
                          {item.change}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {step1Wrong && !gameOver && (
                  <p className="mt-1.5 shrink-0 text-center text-[9px] font-bold text-[#8f2f25]">
                    💔 再看看利润、现金流和应收账款之间有没有矛盾。
                  </p>
                )}

                <button
                  type="button"
                  disabled={selectedFinancials.length !== 2}
                  onClick={submitFinancials}
                  className="mt-2 shrink-0 rounded-xl bg-[#70472c] py-2.5 text-sm font-black text-[#fff1d0] disabled:opacity-40"
                >
                  提交调查结果 · {selectedFinancials.length}/2
                </button>
              </div>
            )}

            {!gameOver && !gameCleared && step === 2 && (
              <div className="flex h-full flex-col">
                <div className="shrink-0 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black tracking-[0.15em] text-[#7c5a37]">
                      EVIDENCE BOARD
                    </p>
                    <h2 className="text-base font-black">补齐证据链</h2>
                  </div>
                  <span className="rounded-full bg-[#d8b77d] px-3 py-1 text-[10px] font-black">
                    选 2 条
                  </span>
                </div>

                <div className="mt-3 grid flex-1 grid-rows-3 gap-2">
                  {evidence.map((item) => {
                    const active = selectedEvidence.includes(item.id);

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleEvidence(item.id)}
                        className={`flex items-center rounded-[16px] border-2 px-4 text-left text-[12px] font-bold leading-5 ${
                          active
                            ? "border-[#9f3428] bg-[#f0c7ac]"
                            : "border-[#b99564] bg-[#f8edcf]"
                        }`}
                      >
                        <span className="mr-2">📎</span>
                        {item.text}
                        {active && <span className="ml-auto text-[#9f3428]">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {step2Wrong && !gameOver && (
                  <p className="mt-1.5 shrink-0 text-center text-[9px] font-bold text-[#8f2f25]">
                    💔 哪些材料能解释“利润上涨，但现金没有同步进来”？
                  </p>
                )}

                <button
                  type="button"
                  disabled={selectedEvidence.length !== 2}
                  onClick={submitEvidence}
                  className="mt-2 shrink-0 rounded-xl bg-[#70472c] py-2.5 text-sm font-black text-[#fff1d0] disabled:opacity-40"
                >
                  提交证据 · {selectedEvidence.length}/2
                </button>
              </div>
            )}

            {!gameOver && !gameCleared && step === 3 && (
              <div className="flex h-full flex-col">
                <div className="shrink-0">
                  <p className="text-[9px] font-black tracking-[0.15em] text-[#7c5a37]">
                    NEXT MOVE
                  </p>
                  <h2 className="text-base font-black">下一步调查什么？</h2>
                </div>

                <div className="mt-3 grid flex-1 grid-rows-3 gap-2">
                  {actions.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setStep3Wrong(false);
                        setSelectedAction(item.id);
                      }}
                      className={`flex items-center rounded-[16px] border-2 px-4 text-left text-[12px] font-bold ${
                        selectedAction === item.id
                          ? "border-[#9f3428] bg-[#f0c7ac]"
                          : "border-[#b99564] bg-[#f8edcf]"
                      }`}
                    >
                      🔎 <span className="ml-2">{item.text}</span>
                    </button>
                  ))}
                </div>

                {step3Wrong && !gameOver && (
                  <p className="mt-1.5 shrink-0 text-center text-[9px] font-bold text-[#8f2f25]">
                    💔 当前最值得继续验证的是收入质量和回款情况。
                  </p>
                )}

                <button
                  type="button"
                  disabled={!selectedAction}
                  onClick={submitAction}
                  className="mt-2 shrink-0 rounded-xl bg-[#70472c] py-2.5 text-sm font-black text-[#fff1d0] disabled:opacity-40"
                >
                  锁定调查方向
                </button>
              </div>
            )}

            {!gameOver && !gameCleared && step === 4 && (
              <div className="flex h-full flex-col">
                <div className="shrink-0">
                  <p className="text-[9px] font-black tracking-[0.15em] text-[#7c5a37]">
                    PROFIT QUALITY CHECK
                  </p>
                  <h2 className="text-base font-black">利润真的“赚到手”了吗？</h2>
                </div>

                <div className="mt-2 grid shrink-0 grid-cols-3 gap-1.5">
                  <div className="rounded-[14px] border border-[#b99564] bg-[#f8edcf] p-2 text-center">
                    <p className="text-[8px] font-bold text-[#7c5a37]">净利润</p>
                    <p className="mt-1 text-sm font-black text-[#436b4a]">+48%</p>
                  </div>
                  <div className="rounded-[14px] border border-[#b99564] bg-[#f8edcf] p-2 text-center">
                    <p className="text-[8px] font-bold text-[#7c5a37]">经营现金流</p>
                    <p className="mt-1 text-sm font-black text-[#a63b2e]">-72%</p>
                  </div>
                  <div className="rounded-[14px] border border-[#b99564] bg-[#f8edcf] p-2 text-center">
                    <p className="text-[8px] font-bold text-[#7c5a37]">应收账款</p>
                    <p className="mt-1 text-sm font-black text-[#a63b2e]">+95%</p>
                  </div>
                </div>

                <p className="mt-2 shrink-0 text-[11px] font-black text-[#5a3e28]">
                  这组数据最合理的判断是？
                </p>

                <div className="mt-2 grid flex-1 grid-rows-3 gap-1.5">
                  {cashQualityOptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setStep4Wrong(false);
                        setSelectedCashQuality(item.id);
                      }}
                      className={`rounded-[14px] border-2 px-3 py-2 text-left ${
                        selectedCashQuality === item.id
                          ? "border-[#9f3428] bg-[#f0c7ac]"
                          : "border-[#b99564] bg-[#f8edcf]"
                      }`}
                    >
                      <p className="text-[10px] font-black">{item.title}</p>
                      <p className="mt-0.5 text-[9px] leading-4 text-[#6f4d31]">
                        {item.text}
                      </p>
                    </button>
                  ))}
                </div>

                {step4Wrong && !gameOver && (
                  <p className="mt-1 shrink-0 text-center text-[9px] font-bold text-[#8f2f25]">
                    💔 利润大涨但现金流恶化，通常不是“现金质量健康”的信号。
                  </p>
                )}

                <button
                  type="button"
                  disabled={!selectedCashQuality}
                  onClick={submitCashQuality}
                  className="mt-2 shrink-0 rounded-xl bg-[#70472c] py-2.5 text-sm font-black text-[#fff1d0] disabled:opacity-40"
                >
                  判断利润质量
                </button>
              </div>
            )}

            {!gameOver && !gameCleared && step === 5 && (
              <div className="flex h-full flex-col">
                <div className="shrink-0">
                  <p className="text-[9px] font-black tracking-[0.15em] text-[#7c5a37]">
                    RESEARCH VERDICT
                  </p>
                  <h2 className="text-base font-black">给出研究结论</h2>
                </div>

                <div className="mt-2 shrink-0 rounded-[16px] border border-[#9a764e] bg-[#f5e7c4] p-3">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] font-bold text-[#6f4d31]">
                    <span>✓ 经营现金流 -72%</span>
                    <span>✓ 应收账款 +95%</span>
                    <span>✓ 客户集中度 68%</span>
                    <span>✓ 12 月收入占比 37%</span>
                  </div>
                </div>

                <p className="mt-2 shrink-0 text-[11px] font-black text-[#5a3e28]">
                  作为 Fundamental Agent，你应该怎么写结论？
                </p>

                <div className="mt-2 grid flex-1 grid-rows-3 gap-2">
                  {conclusionOptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setStep5Wrong(false);
                        setSelectedConclusion(item.id);
                      }}
                      className={`flex items-center rounded-[16px] border-2 px-4 text-left text-[11px] font-bold leading-5 ${
                        selectedConclusion === item.id
                          ? "border-[#9f3428] bg-[#f0c7ac]"
                          : "border-[#b99564] bg-[#f8edcf]"
                      }`}
                    >
                      {item.text}
                    </button>
                  ))}
                </div>

                {step5Wrong && !gameOver && (
                  <p className="mt-1.5 shrink-0 text-center text-[9px] font-bold text-[#8f2f25]">
                    💔 基本面研究要谨慎：异常支持“继续核查”，不等于可以直接定性。
                  </p>
                )}

                <button
                  type="button"
                  disabled={!selectedConclusion}
                  onClick={submitConclusion}
                  className="mt-2 shrink-0 rounded-xl bg-[#70472c] py-2.5 text-sm font-black text-[#fff1d0] disabled:opacity-40"
                >
                  提交最终结论
                </button>
              </div>
            )}
          </div>
        </section>

        <p className="shrink-0 text-center text-[8px] font-bold text-[#a78e72]">
          训练案例仅用于学习基本面分析方法，不构成投资建议。
        </p>
      </div>
    </main>
  );
}
