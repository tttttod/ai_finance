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

function AgentHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mb-6 mt-10">
      <div className="absolute -left-4 -top-12 z-20 h-28 w-28">
        <div className="absolute inset-3 rounded-full bg-[#d8b66f]/40 blur-lg" />
        <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-[#8e673c] bg-[#f3e4bd] shadow-[0_10px_22px_rgba(72,43,24,0.30)]">
          <Image src="/fundamental-agnt.png" alt="Fundamental Agent" fill priority className="object-cover object-top scale-110" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-9 w-9 rotate-[-10deg] items-center justify-center rounded-full border-2 border-[#8e673c] bg-[#f5e7c4] text-lg shadow-md">🔍</div>
      </div>
      <div className="relative ml-10 rounded-2xl border-2 border-[#9a764e] bg-[#f3dfb2] pb-4 pl-16 pr-4 pt-4 shadow-[0_7px_18px_rgba(83,52,28,0.17)]">
        <div className="absolute -left-2 top-6 h-4 w-4 rotate-45 border-b-2 border-l-2 border-[#9a764e] bg-[#f3dfb2]" />
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-black tracking-[0.1em] text-[#70472c]">FUNDAMENTAL AGENT</p>
          <span className="rounded-full bg-[#d9bd7b] px-2 py-0.5 text-[10px] font-bold text-[#5b402b]">基本面分析师</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#5a3e28]">{children}</p>
        <p className="mt-2 text-right text-[11px] italic text-[#98724d]">— Investigation Note</p>
      </div>
    </div>
  );
}

export default function FundamentalGame({ onBack, onComplete }: FundamentalGameProps) {
  const [step, setStep] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameCleared, setGameCleared] = useState(false);
  const [selectedFinancials, setSelectedFinancials] = useState<string[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [step1Wrong, setStep1Wrong] = useState(false);
  const [step2Wrong, setStep2Wrong] = useState(false);
  const [step3Wrong, setStep3Wrong] = useState(false);

  const correctFinancials = ["cashflow", "receivable"];
  const correctEvidence = ["customer", "yearEnd"];
  const financialCorrect = selectedFinancials.length === 2 && correctFinancials.every((id) => selectedFinancials.includes(id));
  const evidenceCorrect = selectedEvidence.length === 2 && correctEvidence.every((id) => selectedEvidence.includes(id));

  function loseLife() {
    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0) { setGameOver(true); return 0; }
      return next;
    });
  }

  function toggleFinancial(id: string) {
    if (gameOver || gameCleared) return;
    setStep1Wrong(false);
    setSelectedFinancials((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  function toggleEvidence(id: string) {
    if (gameOver || gameCleared) return;
    setStep2Wrong(false);
    setSelectedEvidence((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  function submitFinancials() {
    if (financialCorrect) { setStep1Wrong(false); setStep(2); return; }
    loseLife(); setStep1Wrong(true); setSelectedFinancials([]);
  }

  function submitEvidence() {
    if (evidenceCorrect) { setStep2Wrong(false); setStep(3); return; }
    loseLife(); setStep2Wrong(true); setSelectedEvidence([]);
  }

  function submitAction() {
    if (selectedAction === "receivable") { setStep3Wrong(false); setGameCleared(true); return; }
    loseLife(); setStep3Wrong(true); setSelectedAction(null);
  }

  function resetGame() {
    setStep(1); setLives(3); setGameOver(false); setGameCleared(false);
    setSelectedFinancials([]); setSelectedEvidence([]); setSelectedAction(null);
    setStep1Wrong(false); setStep2Wrong(false); setStep3Wrong(false);
  }

  const rank = lives === 3 ? { label: "S级｜王牌财报侦探", icon: "🏆" }
    : lives === 2 ? { label: "A级｜敏锐调查员", icon: "🔎" }
    : { label: "B级｜惊险破案", icon: "🗂️" };

  return (
    <main className="min-h-screen bg-[#2b211a] px-4 py-6 flex justify-center">
      <div className="w-full max-w-md">
        <button type="button" onClick={() => onBack?.()}
          className="mb-4 flex items-center gap-2 rounded-full border border-[#8e673c] bg-[#3a2a20] px-4 py-2 text-sm font-semibold text-[#f3dfb2] shadow-md transition hover:bg-[#493429]">
          <span>←</span>
          <span>返回金融华尔界</span>
        </button>

        <div className="mb-6">
          <div className="mb-4 rounded-xl border border-[#8e673c] bg-[#3a2a20] px-4 py-3 text-[#f3dfb2] shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.18em] text-[#c7a56a]">CURRENT CASE</p>
                <p className="mt-1 font-semibold">案件 01｜星河科技</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="rounded-full bg-[#c7a56a] px-3 py-1 text-xs font-bold text-[#2b211a]">STEP {step}/3</div>
                <div className="flex items-center gap-1" aria-label={`剩余生命 ${lives}`}>
                  {[0, 1, 2].map((heart) => (
                    <span key={heart} className={`text-lg transition ${heart < lives ? "opacity-100" : "grayscale opacity-30"}`}>❤️</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-[#e5cf9d]">
              {step === 1 && "任务：圈出 2 个最值得怀疑的财务指标"}
              {step === 2 && "任务：从补充材料中找出 2 条关键证据"}
              {step === 3 && "任务：决定下一步调查方向"}
            </p>
            <p className="mt-2 text-[11px] text-[#bda77d]">提交错误将失去 1 颗调查之心。</p>
          </div>
          <div className="text-center">
            <p className="text-sm tracking-[0.25em] text-[#c7a56a]">FUNDAMENTAL AGENT</p>
            <h1 className="mt-2 text-3xl font-bold text-[#f3dfb2]">财报侦探</h1>
            <p className="mt-2 text-sm text-[#cdb88d]">数字不会说谎，但数字之间可能藏着秘密。</p>
          </div>
        </div>

        <section className="relative rounded-[30px] border-[3px] border-[#8e673c] bg-[#ead7a5] p-6 shadow-2xl">
          <div className="pointer-events-none absolute -top-3 left-6 right-6 h-6 rounded-full border border-[#8e673c] bg-[#c9a56d] shadow-md" />
          <div className="pointer-events-none absolute -bottom-3 left-6 right-6 h-6 rounded-full border border-[#8e673c] bg-[#c9a56d] shadow-md" />
          <div className="pointer-events-none absolute inset-3 rounded-[24px] border border-[#b99564]/60" />
          <div className="relative">
            <div className="mb-5 border-b border-[#a98557] pb-4 text-center">
              <div className="mb-3 flex justify-center">
                <div className="rotate-[-2deg] rounded-md border-2 border-[#7b5734] bg-[#d8b77d] px-4 py-1 text-xs font-black tracking-[0.18em] text-[#4a321f] shadow-sm">CASE FILE · 001</div>
              </div>
              <p className="text-xs tracking-[0.2em] text-[#7c5a37]">CONFIDENTIAL FILE</p>
              <h2 className="mt-1 text-xl font-bold text-[#3c2a1d]">星河科技 · 2025 年度财务档案</h2>
            </div>

            {!gameOver && !gameCleared && (
              <div className="mb-5 flex items-center justify-center gap-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step >= item ? "bg-[#70472c] text-[#fff1d0]" : "bg-[#d6bd8d] text-[#806344]"}`}>{item}</div>
                ))}
              </div>
            )}

            {gameOver && (
              <>
                <AgentHint>“线索断了，但真正的研究员不会因为一次判断失误就放弃。重新梳理数字，再来一次。”</AgentHint>
                <div className="rounded-2xl border-2 border-[#8f2f25] bg-[#efd0bf] p-6 text-center shadow-md">
                  <div className="text-5xl">💔</div>
                  <h2 className="mt-3 text-2xl font-black text-[#7d3028]">调查失败</h2>
                  <p className="mt-3 text-sm leading-6 text-[#6d4035]">三颗调查之心已经耗尽，案件暂时陷入僵局。</p>
                  <p className="mt-2 text-xs text-[#8a5a4d]">提示：不要单独盯着“涨了多少”，试着寻找不同财务数据之间的矛盾。</p>
                  <button type="button" onClick={resetGame} className="mt-5 w-full rounded-xl bg-[#70472c] py-3 font-bold text-[#fff1d0] shadow-md transition hover:bg-[#5b3822]">重新调查 ❤️❤️❤️</button>
                </div>
              </>
            )}

            {gameCleared && !gameOver && (
              <>
                <AgentHint>“漂亮。你没有急着给公司定罪，而是一步步让数字、证据和调查方向互相验证。”</AgentHint>
                <div className="rounded-2xl border-2 border-[#52724c] bg-[#dce9cf] p-5 shadow-md">
                  <div className="mb-4 flex justify-center">
                    <div className="rotate-[-6deg] rounded-lg border-[3px] border-[#8f2f25] px-4 py-2 text-lg font-black tracking-[0.15em] text-[#8f2f25]">调查完成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl">{rank.icon}</div>
                    <p className="mt-2 text-lg font-black text-[#355037]">{rank.label}</p>
                    <div className="mt-2 flex justify-center gap-1">
                      {[0, 1, 2].map((heart) => (
                        <span key={heart} className={`text-xl ${heart < lives ? "opacity-100" : "grayscale opacity-30"}`}>❤️</span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-lg font-bold text-[#355037]">案件结论</p>
                  <p className="mt-2 text-sm leading-6 text-[#3f4937]">你发现了利润、现金流、应收账款、客户集中度和收入确认时间之间的一组异常关系。这不能直接证明公司存在财务造假，但已经足以支持进一步核查。</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#355037]">Fundamental Agent：“真正的基本面研究，不是找到一个异常数字，而是让多个证据互相验证。”</p>
                </div>
                <div className="mt-4 space-y-3">
                  <button type="button" onClick={() => onComplete?.()} className="w-full rounded-xl bg-[#70472c] py-3 font-bold text-[#fff1d0] shadow-md transition hover:bg-[#5b3822]">完成调查，继续旅程 →</button>
                  <button type="button" onClick={resetGame} className="w-full rounded-xl border border-[#8d6a42] py-3 font-semibold text-[#5b402b]">重新挑战</button>
                </div>
              </>
            )}

            {!gameOver && !gameCleared && step === 1 && (
              <>
                <div className="mb-4 rounded-xl border border-[#b99668] bg-[#f5e7c4] p-3">
                  <p className="text-sm leading-6 text-[#5a3e28]">找出<span className="mx-1 font-bold text-[#8e2f24]">2 个</span>最值得进一步调查的财务指标。</p>
                </div>
                <AgentHint>“先别被漂亮的利润数字骗到。看看公司赚到的钱，真的变成现金了吗？”</AgentHint>
                <div className="space-y-3">
                  {financials.map((item) => {
                    const active = selectedFinancials.includes(item.id);
                    return (
                      <button type="button" key={item.id} onClick={() => toggleFinancial(item.id)}
                        className={`relative w-full rounded-xl p-4 text-left transition-all duration-200 ${active ? "rotate-[-0.4deg] border-[3px] border-[#9f3428] bg-[#f0c7ac] shadow-md" : "border-2 border-[#b99564] bg-[#f8edcf] hover:bg-[#f4e4c1]"}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="font-semibold text-[#3a291d]">{item.label}</span>
                            <div className="mt-1 text-sm text-[#75543a]">{item.value}</div>
                          </div>
                          <div className="relative shrink-0">
                            <span className={`relative z-10 font-bold ${item.change.startsWith("-") ? "text-[#a63b2e]" : "text-[#436b4a]"}`}>{item.change}</span>
                            {active && (
                              <>
                                <div className="pointer-events-none absolute left-1/2 top-1/2 h-11 w-20 -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] rounded-[50%] border-[3px] border-[#a63b2e]" />
                                <div className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-[76px] -translate-x-[48%] -translate-y-[45%] rotate-[5deg] rounded-[50%] border border-[#a63b2e]/70" />
                                <span className="pointer-events-none absolute -right-5 -top-4 rotate-[12deg] text-2xl font-black text-[#a63b2e]">?</span>
                              </>
                            )}
                          </div>
                        </div>
                        {active && (
                          <div className="mt-4 border-t border-[#b86051]/40 pt-3">
                            <div className="flex items-start gap-2 text-[#9f3428]">
                              <span className="rotate-[-12deg] text-lg">✎</span>
                              <div>
                                <p className="text-xs font-bold">调查批注</p>
                                <p className="mt-1 text-xs leading-5">{item.note}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-[#b99564] bg-[#f5e7c4] px-4 py-3">
                  <span className="text-sm text-[#6f4d31]">🔍 已圈选</span>
                  <span className="font-bold text-[#6f4d31]">{selectedFinancials.length} / 2</span>
                </div>
                <button type="button" disabled={selectedFinancials.length !== 2} onClick={submitFinancials}
                  className="mt-5 w-full rounded-xl bg-[#70472c] py-3 font-bold text-[#fff1d0] shadow-md transition hover:bg-[#5b3822] disabled:cursor-not-allowed disabled:opacity-40">提交调查结果</button>
                {step1Wrong && !gameOver && (
                  <div className="mt-4 rotate-[0.4deg] rounded-xl border border-[#b56755] bg-[#efd0bf] p-4 text-sm leading-6 text-[#6f392f]">
                    <p className="font-bold">💔 判断失误，失去 1 颗调查之心</p>
                    <p className="mt-1">再看看利润、现金流和应收账款之间有没有矛盾。</p>
                  </div>
                )}
              </>
            )}

            {!gameOver && !gameCleared && step === 2 && (
              <>
                <div className="mb-4 rounded-xl border border-[#b99668] bg-[#f5e7c4] p-3">
                  <p className="text-sm leading-6 text-[#5a3e28]">你已经发现了财务异常。现在从补充材料中找出<span className="mx-1 font-bold text-[#8e2f24]">2 条</span>最值得继续核查的证据。</p>
                </div>
                <AgentHint>“一个异常数字还不够。真正的调查，要看不同证据能不能互相对上。”</AgentHint>
                <div className="space-y-3">
                  {evidence.map((item) => {
                    const active = selectedEvidence.includes(item.id);
                    return (
                      <button type="button" key={item.id} onClick={() => toggleEvidence(item.id)}
                        className={`w-full rounded-xl border-2 p-4 text-left transition ${active ? "rotate-[-0.3deg] border-[#9f3428] bg-[#f0c7ac] shadow-md" : "border-[#b99564] bg-[#f8edcf]"}`}>
                        <span className="mr-2">📎</span>{item.text}
                        {active && <span className="ml-2 font-bold text-[#9f3428]">✓</span>}
                      </button>
                    );
                  })}
                </div>
                <button type="button" disabled={selectedEvidence.length !== 2} onClick={submitEvidence}
                  className="mt-5 w-full rounded-xl bg-[#70472c] py-3 font-bold text-[#fff1d0] disabled:opacity-40">提交证据</button>
                {step2Wrong && !gameOver && (
                  <div className="mt-4 rounded-xl border border-[#b56755] bg-[#efd0bf] p-4 text-sm leading-6 text-[#6f392f]">
                    <p className="font-bold">💔 证据链不成立，失去 1 颗调查之心</p>
                    <p className="mt-1">注意哪些证据与财务异常直接相关，不要被无关细节干扰。</p>
                  </div>
                )}
              </>
            )}

            {!gameOver && !gameCleared && step === 3 && (
              <>
                <div className="mb-4 rounded-xl border border-[#b99668] bg-[#f5e7c4] p-3">
                  <p className="text-sm leading-6 text-[#5a3e28]">你已经掌握了财务异常和补充证据。现在做出最终决定：<span className="mx-1 font-bold text-[#8e2f24]">选择 1 个</span>下一步调查方向。</p>
                </div>
                <AgentHint>“你已经有证据表明收入和应收账款可能有问题。什么调查能让你一锤定音？”</AgentHint>
                <div className="space-y-3">
                  {actions.map((item) => {
                    const active = selectedAction === item.id;
                    return (
                      <button type="button" key={item.id} onClick={() => { if (!gameOver && !gameCleared) { setStep3Wrong(false); setSelectedAction(item.id); } }}
                        className={`w-full rounded-xl border-2 p-4 text-left transition ${active ? "border-[#9f3428] bg-[#f0c7ac] shadow-md" : "border-[#b99564] bg-[#f8edcf]"}`}>
                        <span className="mr-2">🔍</span>{item.text}
                        {active && <span className="ml-2 font-bold text-[#9f3428]">✓</span>}
                      </button>
                    );
                  })}
                </div>
                <button type="button" disabled={!selectedAction} onClick={submitAction}
                  className="mt-5 w-full rounded-xl bg-[#70472c] py-3 font-bold text-[#fff1d0] disabled:opacity-40">确认调查方向</button>
                {step3Wrong && !gameOver && (
                  <div className="mt-4 rounded-xl border border-[#b56755] bg-[#efd0bf] p-4 text-sm leading-6 text-[#6f392f]">
                    <p className="font-bold">💔 方向错误，失去 1 颗调查之心</p>
                    <p className="mt-1">想想你现在最需要的是什么：股价走势、具体客户信息，还是网友看法？</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}