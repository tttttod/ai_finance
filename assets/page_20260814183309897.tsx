"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type RiskGameProps = {
  onBack?: () => void;
  onComplete?: () => void;
};

type Round2Choice = "concentration" | "leverage" | "no-stop";

type RepairChoice = {
  id: string;
  title: string;
  description: string;
  isCorrect: boolean;
  fixes?: "concentration" | "leverage" | "exit";
};

const repairChoices: RepairChoice[] = [
  {
    id: "reduce-tech",
    title: "降低科技行业总仓位",
    description: "减少单一行业暴露，让组合不再被同一种风险主导。",
    isCorrect: true,
    fixes: "concentration",
  },
  {
    id: "remove-leverage",
    title: "取消 2× 杠杆",
    description: "避免同一次价格波动被额外放大。",
    isCorrect: true,
    fixes: "leverage",
  },
  {
    id: "define-exit",
    title: "设置最大可承受损失和退出条件",
    description: "提前定义什么时候减仓或退出，而不是亏损后临时决定。",
    isCorrect: true,
    fixes: "exit",
  },
  {
    id: "watch-more",
    title: "每天多看几次行情",
    description: "提高盯盘频率并不会直接降低仓位、杠杆或退出风险。",
    isCorrect: false,
  },
  {
    id: "swap-tech",
    title: "把科技股 A 换成另一只科技股",
    description: "更换同一行业内的标的，并没有真正降低行业集中度。",
    isCorrect: false,
  },
  {
    id: "fix-later",
    title: "等市场跌了再决定怎么风控",
    description: "风控应该在交易前定义，而不是等风险发生后再补救。",
    isCorrect: false,
  },
];

export default function RiskGame({
  onBack,
  onComplete,
}: RiskGameProps) {
  const [round, setRound] = useState<1 | 2 | 3>(1);

  // =========================
  // ROUND 1
  // =========================
  const [foundRisks, setFoundRisks] = useState<string[]>([]);
  const [scanCount, setScanCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [round1Complete, setRound1Complete] = useState(false);

  const maxScans = 5;
  const requiredRisks = 3;

  // =========================
  // ROUND 2
  // =========================
  const [round2Choice, setRound2Choice] =
    useState<Round2Choice | null>(null);
  const [round2Wrong, setRound2Wrong] = useState(false);
  const [round2Complete, setRound2Complete] = useState(false);

  // =========================
  // ROUND 3
  // =========================
  const [repairSelected, setRepairSelected] = useState<string[]>([]);
  const [repairAttempts, setRepairAttempts] = useState(0);
  const [repairMessage, setRepairMessage] = useState<string | null>(null);
  const [fixedRisks, setFixedRisks] = useState<
    Array<"concentration" | "leverage" | "exit">
  >([]);
  const [round3Complete, setRound3Complete] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showDebriefPage, setShowDebriefPage] = useState(false);

  const repairLimit = 5;

  const riskStatus = useMemo(
    () => ({
      concentration: fixedRisks.includes("concentration") ? "MEDIUM" : "HIGH",
      leverage: fixedRisks.includes("leverage") ? "LOW" : "HIGH",
      exit: fixedRisks.includes("exit") ? "LOW" : "HIGH",
    }),
    [fixedRisks],
  );

  // =========================
  // ROUND 1 FUNCTIONS
  // =========================
  function handleRiskClick(
    id: string,
    isRisk: boolean,
    explanation: string,
  ) {
    if (
      round1Complete ||
      foundRisks.includes(id) ||
      scanCount >= maxScans
    ) {
      return;
    }

    setScanCount((prev) => prev + 1);

    if (isRisk) {
      const next = [...foundRisks, id];
      setFoundRisks(next);
      setMessage(`💥 RISK DETECTED｜${explanation}`);

      if (next.length === requiredRisks) {
        setRound1Complete(true);
      }
      return;
    }

    setMessage(`⚠️ FALSE ALARM｜${explanation}`);
  }

  function resetRound1() {
    setFoundRisks([]);
    setScanCount(0);
    setMessage(null);
    setRound1Complete(false);
  }

  function enterRound2() {
    setRound(2);
    setRound2Choice(null);
    setRound2Wrong(false);
    setRound2Complete(false);
  }

  // =========================
  // ROUND 2 FUNCTIONS
  // =========================
  function submitRound2() {
    if (!round2Choice) return;

    if (round2Choice === "leverage") {
      setRound2Wrong(false);
      setRound2Complete(true);
      return;
    }

    setRound2Wrong(true);
    setRound2Choice(null);
  }

  function enterRound3() {
    setRound(3);
    setRepairSelected([]);
    setRepairAttempts(0);
    setRepairMessage(null);
    setFixedRisks([]);
    setRound3Complete(false);
    setShowSummary(false);
    setShowDebriefPage(false);
  }

  // =========================
  // ROUND 3 FUNCTIONS
  // =========================
  function handleRepair(choice: RepairChoice) {
    if (
      round3Complete ||
      repairSelected.includes(choice.id) ||
      repairAttempts >= repairLimit
    ) {
      return;
    }

    setRepairAttempts((prev) => prev + 1);
    setRepairSelected((prev) => [...prev, choice.id]);

    if (!choice.isCorrect || !choice.fixes) {
      setRepairMessage(`⚠️ NOT A FIX｜${choice.description}`);
      return;
    }

    setFixedRisks((prev) => {
      const next = prev.includes(choice.fixes!)
        ? prev
        : [...prev, choice.fixes!];

      if (next.length === 3) {
        setRound3Complete(true);
      }

      return next;
    });

    setRepairMessage(`✅ RISK REDUCED｜${choice.description}`);
  }

  function resetRound3() {
    setRepairSelected([]);
    setRepairAttempts(0);
    setRepairMessage(null);
    setFixedRisks([]);
    setRound3Complete(false);
    setShowSummary(false);
    setShowDebriefPage(false);
  }

  if (showDebriefPage) {
    return (
      <main className="min-h-[100dvh] bg-[#0f1820] px-4 py-5 text-white">
        <div className="mx-auto w-full max-w-md">
          <header className="rounded-[24px] border border-[#3a4854] bg-[#18232c] p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-full border-[3px] border-[#f0c84b] bg-[#26333d]">
                <Image
                  src="/risk-agent.PNG"
                  alt="Risk Officer"
                  fill
                  priority
                  className="object-cover object-top scale-110"
                />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.16em] text-[#f0c84b]">
                  RISK OFFICER · DEBRIEF
                </p>
                <h1 className="mt-1 text-xl font-black">风险知识复盘</h1>
                <p className="mt-1 text-[12px] font-bold leading-5 text-[#cbd6dd]">
                  找到风险只是第一步。真正的风控，是知道风险从哪里来、怎么放大、如何提前设边界。
                </p>
              </div>
            </div>
          </header>

          <section className="mt-4 space-y-3">
            <article className="rounded-[20px] border border-[#d0d5ce] bg-white p-5 text-[#26313a]">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-black">🏭 集中度风险</h2>
                <span className="rounded-full bg-[#edf1ec] px-2 py-1 text-[10px] font-black text-[#617066]">
                  EXPOSURE
                </span>
              </div>
              <p className="mt-2 text-[14px] font-bold leading-6 text-[#59645d]">
                “持有很多标的”不等于“真正分散”。如果这些标的都受同一个行业、主题或宏观因素影响，组合仍然可能高度集中。
              </p>
              <div className="mt-3 rounded-[14px] bg-[#f4f6f3] px-4 py-3 text-[12px] font-black text-[#46524a]">
                关键问题：我的资产是不是在押同一个方向？
              </div>
            </article>

            <article className="rounded-[20px] border border-[#d0d5ce] bg-white p-5 text-[#26313a]">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-black">⚡ 杠杆风险</h2>
                <span className="rounded-full bg-[#fff0eb] px-2 py-1 text-[10px] font-black text-[#a04839]">
                  AMPLIFIER
                </span>
              </div>
              <p className="mt-2 text-[14px] font-bold leading-6 text-[#59645d]">
                杠杆不会让判断更准确，它只是把已有的价格波动放大。方向判断错了，亏损也会被更快放大。
              </p>
              <div className="mt-3 rounded-[14px] bg-[#fff4ef] px-4 py-3 text-[12px] font-black text-[#7e4338]">
                关键问题：同样的市场波动，会不会因为杠杆变成更大的损失？
              </div>
            </article>

            <article className="rounded-[20px] border border-[#d0d5ce] bg-white p-5 text-[#26313a]">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-black">🚪 退出机制</h2>
                <span className="rounded-full bg-[#fff8d8] px-2 py-1 text-[10px] font-black text-[#80691e]">
                  BOUNDARY
                </span>
              </div>
              <p className="mt-2 text-[14px] font-bold leading-6 text-[#59645d]">
                风控不是“必须机械止损”。更重要的是在交易前明确最大可承受损失，以及什么条件下减仓、退出或重新评估。
              </p>
              <div className="mt-3 rounded-[14px] bg-[#fff8df] px-4 py-3 text-[12px] font-black text-[#6d5b21]">
                关键问题：如果我判断错了，我准备在哪里停下来？
              </div>
            </article>
          </section>

          <section className="mt-4 rounded-[20px] border-2 border-[#d5bd55] bg-[#fff6cf] p-4 text-[#3c3420]">
            <p className="text-[11px] font-black tracking-[0.12em] text-[#78641d]">
              RISK OFFICER CHECKLIST
            </p>
            <h2 className="mt-1 text-lg font-black">做决定前，问自己 3 个问题</h2>
            <div className="mt-3 space-y-2">
              <div className="rounded-[12px] bg-white/70 px-3 py-2 text-[14px] font-black">
                ① 我押得有多集中？
              </div>
              <div className="rounded-[12px] bg-white/70 px-3 py-2 text-[14px] font-black">
                ② 我的损失会不会被放大？
              </div>
              <div className="rounded-[12px] bg-white/70 px-3 py-2 text-[14px] font-black">
                ③ 如果判断错了，我什么时候退出？
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-[20px] bg-[#18232c] p-4 text-center">
            <p className="text-[11px] font-black tracking-[0.14em] text-[#f0c84b]">
              S RANK · 风险拆弹专家
            </p>
            <p className="mt-2 text-[13px] font-bold leading-6 text-[#dce5eb]">
              “风控不是预测市场何时下跌，而是在判断错时，确保一次错误不会让你出局。”
            </p>
            <button
              type="button"
              onClick={() => onComplete?.()}
              className="mt-4 w-full rounded-[14px] bg-[#f0c84b] py-3.5 text-[16px] font-black text-[#202a31]"
            >
              完成风险排雷 →
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#0f1820] px-3 py-4 text-white">
      <div className="mx-auto flex min-h-[calc(100dvh-24px)] w-full max-w-md flex-col gap-2">
        {/* =========================
            TOP HUD
        ========================= */}
        <header className="shrink-0 rounded-[20px] border border-[#3a4854] bg-[#18232c] px-3 py-2.5 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onBack?.()}
              className="rounded-full border border-[#4c5a66] bg-[#23313c] px-3 py-1.5 text-[10px] font-black text-[#dce5eb]"
            >
              ← 金融华尔界
            </button>

            <div className="text-center">
              <p className="text-[8px] font-black tracking-[0.18em] text-[#f0c84b]">
                RISK OFFICER
              </p>
              <h1 className="text-sm font-black">
                风险排雷 · RISK SWEEPER
              </h1>
            </div>

            <div className="text-right">
              <p className="text-[9px] font-black text-[#8fa1b0]">
                ROUND {round} / 3
              </p>

              <p className="mt-0.5 text-xs font-black text-[#f0c84b]">
                {round === 1
                  ? `💣 ${foundRisks.length}/3`
                  : round === 2
                    ? "🚨 ALERT"
                    : `🛠 ${fixedRisks.length}/3`}
              </p>
            </div>
          </div>
        </header>

        {/* =========================
            RISK OFFICER
        ========================= */}
        <section className="relative shrink-0 rounded-[18px] border border-[#3c4b56] bg-[#18232c] py-3 pl-[82px] pr-4">
          <div className="absolute -left-1 -top-2 h-[72px] w-[72px]">
            <div className="absolute inset-1 rounded-full bg-[#f0c84b]/20 blur-lg" />

            <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-[#f0c84b] bg-[#26333d] shadow-lg">
              <Image
                src="/risk-agent.PNG"
                alt="Risk Officer"
                fill
                priority
                className="object-cover object-top scale-110"
              />
            </div>

            <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0f1820] bg-[#f0c84b] text-[11px]">
              🛡️
            </div>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-[9px] font-black tracking-[0.15em] text-[#f0c84b]">
              RISK OFFICER
            </p>

            <span className="rounded-full bg-[#283641] px-2 py-0.5 text-[8px] font-bold text-[#b8c6d0]">
              风险控制官
            </span>
          </div>

          <p className="mt-1 text-[11px] font-medium leading-[17px] text-[#d1dbe2]">
            {round === 1
              ? "不要只看单个标的。先看组合暴露，再看杠杆和退出机制——找到真正会让损失失控的地方。"
              : round === 2
                ? "三个风险都成立，但现在要判断：哪一个会最直接放大同一次价格波动？"
                : "最后一步：别只会指出问题。把这份高风险计划真正修成一份可执行的风控方案。"}
          </p>
        </section>

        {/* =========================
            MAIN GAME AREA
        ========================= */}
        <section
          className={`flex-1 rounded-[24px] border-2 border-[#47545f] bg-[#e9ece5] p-3 text-[#1e2930] shadow-2xl ${
            round === 1 ? "min-h-[560px]" : round === 2 ? "min-h-[600px]" : "min-h-[640px]"
          }`}
        >
          {/* =========================
              ROUND 1
          ========================= */}
          {round === 1 && (
            <div className="flex h-full flex-col">
              <div className="flex shrink-0 items-start justify-between gap-3">
                <div>
                  <p className="text-[8px] font-black tracking-[0.16em] text-[#7e6d2d]">
                    CASE 01 · PORTFOLIO SCAN
                  </p>

                  <h2 className="mt-0.5 text-base font-black">
                    找出 3 个“组合层面”的风险
                  </h2>
                </div>

                <div className="rounded-full bg-[#f0c84b] px-3 py-1 text-[9px] font-black">
                  🔍 {scanCount}/{maxScans}
                </div>
              </div>

              <div className="mt-2 shrink-0 rounded-[14px] border border-[#d8c97f] bg-[#fff8d7] px-4 py-3">
                <p className="text-[10px] font-bold leading-4 text-[#68591f]">
                  规则：不要把“某只股票本身”直接当成风险。请从
                  <b>整体行业暴露、杠杆、退出机制</b>
                  三个维度找雷。最多扫描 5 次。
                </p>
              </div>

              <div className="relative mt-2 min-h-0 flex-1 overflow-hidden rounded-[18px] border-2 border-[#b9beb5] bg-[#fdfdf9] p-3 shadow-inner">
                <div className="flex items-center justify-between border-b border-dashed border-[#c8ccc4] pb-2">
                  <div>
                    <p className="text-[8px] font-bold tracking-[0.15em] text-[#89908a]">
                      INVESTMENT PLAN #018
                    </p>

                    <p className="mt-0.5 text-sm font-black">
                      “科技行情稳赢计划”
                    </p>
                  </div>

                  <span className="rounded-full bg-[#e9ece7] px-2 py-1 text-[8px] font-black text-[#707970]">
                    待审核
                  </span>
                </div>

                {/* 资产配置：把“90%科技暴露”作为整体可点击风险区 */}
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black text-[#68716c]">
                      资产配置
                    </p>

                    <p className="text-[8px] font-bold text-[#7d8580]">
                      总资金 ¥100,000
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleRiskClick(
                        "concentration",
                        true,
                        "科技成长股 55% + AI 芯片股 25% + 科技 ETF 10% = 科技相关暴露 90%。问题不在某一个标的，而在组合高度集中于同一行业。",
                      )
                    }
                    className={`mt-2 w-full min-h-[112px] rounded-[16px] border-2 p-3 transition ${
                      foundRisks.includes("concentration")
                        ? "border-[#d95b43] bg-[#ffe2da]"
                        : "border-[#d3d7d0] bg-white"
                    }`}
                  >
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        ["科技A", "55%"],
                        ["芯片B", "25%"],
                        ["科技ETF", "10%"],
                        ["现金", "10%"],
                      ].map(([name, value]) => (
                        <div
                          key={name}
                          className="rounded-[11px] bg-[#f3f5f1] px-2 py-2.5 text-center"
                        >
                          <p className="text-[10px] font-bold text-[#7b847e]">
                            {name}
                          </p>
                          <p className="mt-0.5 text-xs font-black">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-black text-[#666e69]">
                        科技相关总暴露：90%
                      </span>
                      <span className="text-sm">
                        {foundRisks.includes("concentration") ? "💣" : "🔍"}
                      </span>
                    </div>
                  </button>
                </div>

                {/* 交易计划 */}
                <div className="mt-2">
                  <p className="text-[9px] font-black text-[#68716c]">
                    交易计划
                  </p>

                  <div className="mt-1.5 space-y-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleRiskClick(
                          "leverage",
                          true,
                          "计划在继续上涨时使用 2× 杠杆。杠杆会在同样的价格波动下直接放大盈亏。",
                        )
                      }
                      className={`relative w-full min-h-[62px] rounded-[15px] border-2 px-4 py-3 text-left transition ${
                        foundRisks.includes("leverage")
                          ? "border-[#d95b43] bg-[#ffe2da]"
                          : "border-[#d3d7d0] bg-white"
                      }`}
                    >
                      <p className="text-[10px] font-bold">
                        📈 若行情继续上涨，
                        <span className="font-black">
                          使用 2× 杠杆继续加仓
                        </span>
                      </p>

                      {foundRisks.includes("leverage") && (
                        <span className="absolute right-2 top-1.5">
                          💣
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRiskClick(
                          "no-stop",
                          true,
                          "计划没有预先定义最大可承受损失或退出条件。真正的风险是没有事前规则，而不是‘必须机械止损’。",
                        )
                      }
                      className={`relative w-full min-h-[62px] rounded-[15px] border-2 px-4 py-3 text-left transition ${
                        foundRisks.includes("no-stop")
                          ? "border-[#d95b43] bg-[#ffe2da]"
                          : "border-[#d3d7d0] bg-white"
                      }`}
                    >
                      <p className="text-[10px] font-bold">
                        🚪 暂时
                        <span className="font-black">
                          不设最大亏损或明确退出条件
                        </span>
                        ，之后再看
                      </p>

                      {foundRisks.includes("no-stop") && (
                        <span className="absolute right-2 top-1.5">
                          💣
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRiskClick(
                          "watch-daily",
                          false,
                          "每天查看行情本身不是风险控制措施，也不是核心风险点。它既没有改变仓位，也没有改变杠杆或退出规则。",
                        )
                      }
                      className="w-full min-h-[62px] rounded-[15px] border-2 border-[#d3d7d0] bg-white px-4 py-3 text-left"
                    >
                      <p className="text-[10px] font-bold">
                        👀 每天收盘后查看一次行情
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {message && (
                <div
                  className={`mt-1.5 shrink-0 rounded-[12px] px-3 py-2 text-[10px] font-bold leading-4 ${
                    message.startsWith("💥")
                      ? "border border-[#d95b43] bg-[#ffe2da] text-[#96372c]"
                      : "border border-[#d8bf5f] bg-[#fff5c9] text-[#79641e]"
                  }`}
                >
                  {message}
                </div>
              )}

              {round1Complete ? (
                <button
                  type="button"
                  onClick={enterRound2}
                  className="mt-2 shrink-0 rounded-[14px] bg-[#243440] py-2.5 text-sm font-black text-white"
                >
                  🛡️ 3 个风险已锁定 · 进入 Round 2 →
                </button>
              ) : scanCount >= maxScans ? (
                <button
                  type="button"
                  onClick={resetRound1}
                  className="mt-2 shrink-0 rounded-[14px] bg-[#a64032] py-2.5 text-sm font-black text-white"
                >
                  🚨 扫描机会耗尽 · 重新排雷
                </button>
              ) : null}
            </div>
          )}

          {/* =========================
              ROUND 2
          ========================= */}
          {round === 2 && (
            <div className="flex h-full flex-col">
              <div className="shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black tracking-[0.16em] text-[#a63e2f]">
                      MARKET ALERT
                    </p>

                    <h2 className="mt-0.5 text-base font-black">
                      科技板块突然下跌 -8%
                    </h2>
                  </div>

                  <span className="text-3xl">🚨</span>
                </div>

                <div className="mt-2 rounded-[14px] border border-[#dca99d] bg-[#ffe6df] px-3 py-2">
                  <p className="text-[10px] font-black text-[#8f3429]">
                    情景变化
                  </p>

                  <p className="mt-0.5 text-[10px] font-bold leading-4 text-[#74483f]">
                    三个风险都成立。现在只问一个更具体的问题：
                    在同样的 -8% 价格波动下，哪个因素会最直接放大损失幅度？
                  </p>
                </div>
              </div>

              <div className="mt-2 grid shrink-0 grid-cols-2 gap-2">
                <div className="rounded-[14px] border border-[#c4cac1] bg-white p-2 text-center">
                  <p className="text-[8px] font-bold text-[#757d81]">
                    标的价格变化
                  </p>
                  <p className="mt-1 text-xl font-black text-[#b33f31]">
                    -8%
                  </p>
                </div>

                <div className="rounded-[14px] border border-[#e1ad9f] bg-[#fff0eb] p-2 text-center">
                  <p className="text-[8px] font-bold text-[#8b665e]">
                    2× 杠杆示意
                  </p>
                  <p className="mt-1 text-xl font-black text-[#b33f31]">
                    ≈ -16%
                  </p>
                </div>
              </div>

              <p className="mt-2 shrink-0 text-[10px] font-black">
                哪个风险最直接放大同一次价格波动？
              </p>

              <div className="mt-2 grid min-h-0 flex-1 grid-rows-3 gap-2">
                {[
                  {
                    id: "concentration" as Round2Choice,
                    icon: "🏭",
                    title: "行业集中度过高",
                    note: "让更多资产同时受到同一行业冲击",
                  },
                  {
                    id: "leverage" as Round2Choice,
                    icon: "⚡",
                    title: "2× 杠杆",
                    note: "在相同价格变动下直接放大盈亏幅度",
                  },
                  {
                    id: "no-stop" as Round2Choice,
                    icon: "🚪",
                    title: "没有退出机制",
                    note: "会影响损失持续多久、是否及时处理",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setRound2Wrong(false);
                      setRound2Choice(item.id);
                    }}
                    className={`min-h-[82px] rounded-[16px] border-2 px-4 py-3 text-left transition ${
                      round2Choice === item.id
                        ? "border-[#d95b43] bg-[#ffe2da]"
                        : "border-[#c5cbc1] bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>

                      <div>
                        <p className="text-[14px] font-black">
                          {item.title}
                        </p>

                        <p className="mt-0.5 text-[12px] font-bold leading-5 text-[#747c80]">
                          {item.note}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {round2Wrong && (
                <p className="mt-1.5 shrink-0 text-center text-[9px] font-black text-[#a43d30]">
                  ⚠️ 另外两个同样是真风险，但“直接放大同一次价格波动幅度”的是杠杆。
                </p>
              )}

              {!round2Complete ? (
                <button
                  type="button"
                  disabled={!round2Choice}
                  onClick={submitRound2}
                  className="mt-2 shrink-0 rounded-[14px] bg-[#243440] py-2.5 text-sm font-black text-white disabled:opacity-40"
                >
                  确认风险优先级
                </button>
              ) : (
                <div className="mt-2 shrink-0 rounded-[14px] border-2 border-[#5b9c69] bg-[#e7f6e9] p-3 text-center">
                  <p className="text-[10px] font-black text-[#397347]">
                    ✅ ROUND 2 COMPLETE
                  </p>

                  <p className="mt-1 text-[10px] font-bold text-[#4c6752]">
                    行业集中决定“暴露有多集中”，杠杆决定“波动被放大多少”，退出机制决定“损失是否继续扩大”。
                  </p>

                  <button
                    type="button"
                    onClick={enterRound3}
                    className="mt-2 w-full rounded-[12px] bg-[#243440] py-2.5 text-xs font-black text-white"
                  >
                    进入 Round 3｜风险修复 →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================
              ROUND 3
          ========================= */}
          {round === 3 && (
            <div className="flex h-full flex-col">
              <div className="flex shrink-0 items-start justify-between gap-2">
                <div>
                  <p className="text-[8px] font-black tracking-[0.16em] text-[#37734b]">
                    FINAL TASK · RISK REPAIR
                  </p>

                  <h2 className="mt-0.5 text-base font-black">
                    把高风险计划修成可执行方案
                  </h2>
                </div>

                <div className="rounded-full bg-[#dfe8df] px-2.5 py-1 text-[8px] font-black text-[#526158]">
                  操作 {repairAttempts}/{repairLimit}
                </div>
              </div>

              {/* Risk dashboard */}
              <div className="mt-2 shrink-0 rounded-[16px] border border-[#c1c8bf] bg-white p-3.5">
                {[
                  {
                    key: "concentration" as const,
                    icon: "🏭",
                    label: "行业集中",
                    status: riskStatus.concentration,
                    width:
                      riskStatus.concentration === "HIGH" ? "92%" : "45%",
                  },
                  {
                    key: "leverage" as const,
                    icon: "⚡",
                    label: "杠杆风险",
                    status: riskStatus.leverage,
                    width: riskStatus.leverage === "HIGH" ? "90%" : "22%",
                  },
                  {
                    key: "exit" as const,
                    icon: "🚪",
                    label: "退出机制",
                    status: riskStatus.exit,
                    width: riskStatus.exit === "HIGH" ? "94%" : "28%",
                  },
                ].map((risk) => (
                  <div key={risk.key} className="mb-2 last:mb-0">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[9px] font-black">
                        {risk.icon} {risk.label}
                      </span>

                      <span
                        className={`text-[8px] font-black ${
                          risk.status === "HIGH"
                            ? "text-[#b43d30]"
                            : risk.status === "MEDIUM"
                              ? "text-[#98751f]"
                              : "text-[#37734b]"
                        }`}
                      >
                        {risk.status}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#e8ebe6]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          risk.status === "HIGH"
                            ? "bg-[#cf4f3f]"
                            : risk.status === "MEDIUM"
                              ? "bg-[#d1a933]"
                              : "bg-[#5b9c69]"
                        }`}
                        style={{ width: risk.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-2 shrink-0 text-[9px] font-black">
                请选择真正能降低风险暴露的动作：
              </p>

              <div className="mt-1.5 grid min-h-0 flex-1 grid-cols-2 gap-2.5">
                {repairChoices.map((choice) => {
                  const selected = repairSelected.includes(choice.id);
                  const fixed =
                    choice.fixes && fixedRisks.includes(choice.fixes);

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      disabled={
                        selected ||
                        round3Complete ||
                        repairAttempts >= repairLimit
                      }
                      onClick={() => handleRepair(choice)}
                      className={`min-h-[92px] rounded-[16px] border-2 px-4 py-3.5 text-left transition ${
                        fixed
                          ? "border-[#5b9c69] bg-[#e7f6e9]"
                          : selected && !choice.isCorrect
                            ? "border-[#d7b95d] bg-[#fff5cf]"
                            : "border-[#c8cec5] bg-white"
                      } disabled:cursor-default`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[12px] font-black leading-5">
                          {choice.title}
                        </p>

                        <span className="text-xs">
                          {fixed
                            ? "✅"
                            : selected
                              ? "⚠️"
                              : "＋"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {repairMessage && (
                <div
                  className={`mt-1.5 shrink-0 rounded-[12px] px-3 py-2 text-[10px] font-bold leading-4 ${
                    repairMessage.startsWith("✅")
                      ? "border border-[#78aa83] bg-[#e7f6e9] text-[#3c7048]"
                      : "border border-[#d8bf5f] bg-[#fff5c9] text-[#79641e]"
                  }`}
                >
                  {repairMessage}
                </div>
              )}

              {round3Complete ? (
                <div className="mt-3 shrink-0 rounded-[16px] border-2 border-[#5b9c69] bg-[#e7f6e9] p-4 text-center">
                  <p className="text-2xl">🛡️</p>
                  <p className="mt-1 text-[11px] font-black tracking-[0.12em] text-[#397347]">
                    RISK SHIELD RESTORED
                  </p>
                  <p className="mt-2 text-[12px] font-bold leading-5 text-[#496650]">
                    三个核心风险已经被控制。下一页进入 Risk Officer 的知识复盘。
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDebriefPage(true)}
                    className="mt-3 w-full rounded-[12px] bg-[#243440] py-3 text-sm font-black text-white"
                  >
                    进入风险知识复盘 →
                  </button>
                </div>
              ) : repairAttempts >= repairLimit ? (
                <button
                  type="button"
                  onClick={resetRound3}
                  className="mt-2 shrink-0 rounded-[14px] bg-[#a64032] py-2.5 text-sm font-black text-white"
                >
                  🚨 修复次数耗尽 · 重新拆雷
                </button>
              ) : null}
            </div>
          )}
        </section>

        <p className="shrink-0 text-center text-[8px] font-bold text-[#778895]">
          训练案例用于学习风险识别，不构成投资建议。
        </p>
      </div>
    </main>
  );
}
