"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export type TechnicalGameProps = {
  onBack?: () => void;
  onComplete?: () => void;
};

type Mode = "learn" | "practice" | "exam" | "review" | "summary";
type CandleTone = "bull" | "bear" | "doji";

type PracticeQuestion = {
  id: number;
  title: string;
  subtitle: string;
  kind: "body" | "bullbear" | "upper" | "lower" | "doji" | "trend";
};

type ExamQuestion = {
  question: string;
  options: string[];
  correct: number;
  explain: string;
};

const learnTitles = [
  "K 线是什么",
  "阳线与阴线",
  "实体与影线",
  "常见 K 线图鉴",
];

const practiceQuestions: PracticeQuestion[] = [
  { id: 1, title: "找到实体 Body", subtitle: "点击 K 线中表示开盘价与收盘价之间区域的部分。", kind: "body" },
  { id: 2, title: "判断阳线 / 阴线", subtitle: "Open = 102，Close = 108，这根 K 线属于哪一类？", kind: "bullbear" },
  { id: 3, title: "理解长上影线", subtitle: "这根 K 线最直接说明这一周期发生了什么？", kind: "upper" },
  { id: 4, title: "理解长下影线", subtitle: "这根 K 线最直接说明这一周期发生了什么？", kind: "lower" },
  { id: 5, title: "认识十字线", subtitle: "十字线最明显的结构特征是什么？", kind: "doji" },
  { id: 6, title: "把几根 K 线连起来看", subtitle: "观察连续高点与低点，这段价格更接近哪一种结构？", kind: "trend" },
];

const examQuestions: ExamQuestion[] = [
  {
    question: "一根 K 线最基础记录的是哪四个价格？",
    options: ["买一、卖一、成交量、换手率", "开盘、最高、最低、收盘", "昨日收盘、今日均价、涨停、跌停"],
    correct: 1,
    explain: "K 线最基础的四个价格是 Open / High / Low / Close，也就是 OHLC。",
  },
  {
    question: "如果 Close < Open，这根 K 线最准确的描述是？",
    options: ["阳线", "一定会继续下跌", "阴线"],
    correct: 2,
    explain: "Close 低于 Open 时属于阴线，但它只描述这一周期，不代表下一周期一定继续下跌。",
  },
  {
    question: "长上影线最直接说明什么？",
    options: ["价格曾冲得更高，但后来回落", "上涨趋势已经结束", "明天一定下跌"],
    correct: 0,
    explain: "长上影首先描述盘中价格曾向上运行、随后回落。它不是确定性的未来预测。",
  },
  {
    question: "判断一小段价格走势时，更应该优先关注什么？",
    options: ["最后一根 K 线的颜色", "出现一根阳线就认定上涨趋势", "连续高点和低点的结构"],
    correct: 2,
    explain: "趋势需要上下文。连续高点与低点的变化，比单独一根 K 线更能帮助观察价格结构。",
  },
];

function MiniCandle({
  tone = "bull",
  upper = 28,
  lower = 28,
  body = 58,
  label,
}: {
  tone?: CandleTone;
  upper?: number;
  lower?: number;
  body?: number;
  label?: string;
}) {
  const isDoji = tone === "doji";
  const totalHeight = 150;
  const topGap = 10;
  const bottomGap = 10;
  const drawable = totalHeight - topGap - bottomGap;

  const wickClass =
    tone === "bull"
      ? "bg-[#ef4444]"
      : tone === "bear"
        ? "bg-[#22c55e]"
        : "bg-[#a43f51]";

  if (isDoji) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative h-[150px] w-[56px]">
          <div
            className={`absolute left-1/2 w-[3px] -translate-x-1/2 ${wickClass}`}
            style={{ top: topGap, height: drawable }}
          />
          <div className="absolute left-1/2 top-[73px] h-[4px] w-[40px] -translate-x-1/2 rounded-full bg-[#a43f51]" />
        </div>
        {label && (
          <p className="mt-1 text-center text-[11px] font-black text-[#4e596f]">
            {label}
          </p>
        )}
      </div>
    );
  }

  const totalParts = upper + body + lower;
  const topWick = Math.max(0, Math.round((upper / totalParts) * drawable));
  const bodyHeight = Math.max(14, Math.round((body / totalParts) * drawable));
  const lowerWick = Math.max(0, drawable - topWick - bodyHeight);

  const bodyTop = topGap + topWick;
  const lowerTop = bodyTop + bodyHeight;

  const bodyClass =
    tone === "bull"
      ? "border-[#dc2626] bg-[#ef4444]"
      : "border-[#16a34a] bg-[#22c55e]";

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[150px] w-[56px]">
        {topWick > 0 && (
          <div
            className={`absolute left-1/2 w-[3px] -translate-x-1/2 ${wickClass}`}
            style={{ top: topGap, height: topWick }}
          />
        )}

        <div
          className={`absolute left-1/2 w-[40px] -translate-x-1/2 border-2 ${bodyClass}`}
          style={{ top: bodyTop, height: bodyHeight }}
        />

        {lowerWick > 0 && (
          <div
            className={`absolute left-1/2 w-[3px] -translate-x-1/2 ${wickClass}`}
            style={{ top: lowerTop, height: lowerWick }}
          />
        )}
      </div>

      {label && (
        <p className="mt-1 text-center text-[11px] font-black text-[#4e596f]">
          {label}
        </p>
      )}
    </div>
  );
}

export default function TechnicalGame({ onBack, onComplete }: TechnicalGameProps) {
  const [mode, setMode] = useState<Mode>("learn");
  const [learnIndex, setLearnIndex] = useState(0);

  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceChoice, setPracticeChoice] = useState<string | null>(null);
  const [practiceCorrect, setPracticeCorrect] = useState(false);
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);

  const [examIndex, setExamIndex] = useState(0);
  const [examChoice, setExamChoice] = useState<number | null>(null);
  const [examFeedback, setExamFeedback] = useState<string | null>(null);
  const [examScore, setExamScore] = useState(0);

  const currentProgress = useMemo(() => {
    if (mode === "learn") return ((learnIndex + 1) / 4) * 35;
    if (mode === "practice") return 35 + ((practiceIndex + 1) / 6) * 40;
    if (mode === "exam") return 75 + ((examIndex + 1) / 4) * 25;
    return 100;
  }, [mode, learnIndex, practiceIndex, examIndex]);

  function nextLearn() {
    if (learnIndex < 3) setLearnIndex((v) => v + 1);
    else setMode("practice");
  }

  function resetPracticeState() {
    setPracticeChoice(null);
    setPracticeCorrect(false);
    setPracticeFeedback(null);
  }

  function submitPractice(choice: string) {
    if (practiceCorrect) return;
    const q = practiceQuestions[practiceIndex];
    let correct = false;
    let success = "";
    let retry = "";

    if (q.kind === "body") {
      correct = choice === "body";
      success = "正确。实体 Body 位于开盘价与收盘价之间，表示这一周期从 Open 到 Close 的价格变化。";
      retry = "再看看：影线很细，实体是中间较粗的矩形区域。";
    } else if (q.kind === "bullbear") {
      correct = choice === "bull";
      success = "正确。Close 108 > Open 102，所以这是一根阳线。注意：阳线只说明这一周期收盘高于开盘，不代表下一周期一定上涨。";
      retry = "再想一下：阳线 / 阴线的核心看 Open 与 Close 的大小关系。";
    } else if (q.kind === "upper") {
      correct = choice === "pullback";
      success = "正确。长上影线说明价格盘中曾冲到更高位置，但后来回落。它首先描述“发生了什么”，不是“明天一定跌”。";
      retry = "这道题只问这一周期发生了什么，不要把单根 K 线当成确定性的未来预测。";
    } else if (q.kind === "lower") {
      correct = choice === "rebound";
      success = "正确。长下影线说明价格盘中曾跌到更低位置，但之后又回升。它不等于“市场一定见底”。";
      retry = "先描述盘中价格走过的路径：价格曾更低，后来发生了什么？";
    } else if (q.kind === "doji") {
      correct = choice === "close-open";
      success = "正确。十字线最明显的结构特征是开盘价与收盘价非常接近，因此实体很小，甚至看起来像一条横线。";
      retry = "观察它的实体：为什么中间几乎只剩一条横线？";
    } else if (q.kind === "trend") {
      correct = choice === "up";
      success = "正确。这段结构中高点与低点整体都在抬高，更接近上涨结构。趋势判断要看连续价格结构，而不是只看最后一根 K 线。";
      retry = "再看高点和低点：它们整体是在抬高、降低，还是主要横向往返？";
    }

    setPracticeChoice(choice);
    if (correct) {
      setPracticeCorrect(true);
      setPracticeFeedback(`✅ ${success}`);
    } else {
      setPracticeFeedback(`💡 ${retry}`);
    }
  }

  function nextPractice() {
    if (!practiceCorrect) return;
    if (practiceIndex < practiceQuestions.length - 1) {
      setPracticeIndex((v) => v + 1);
      resetPracticeState();
    } else {
      setMode("exam");
      setExamIndex(0);
    }
  }

  function submitExam(choiceIndex: number) {
    if (examFeedback) return;
    const q = examQuestions[examIndex];
    const isCorrect = choiceIndex === q.correct;
    setExamChoice(choiceIndex);
    if (isCorrect) setExamScore((v) => v + 1);
    setExamFeedback(`${isCorrect ? "✅" : "💡"} ${q.explain}`);
  }

  function nextExam() {
    if (!examFeedback) return;
    if (examIndex < examQuestions.length - 1) {
      setExamIndex((v) => v + 1);
      setExamChoice(null);
      setExamFeedback(null);
    } else {
      const wrongCount = examQuestions.length - examScore;

      if (wrongCount >= 2) {
        setMode("review");
      } else {
        setMode("summary");
      }
    }
  }


  if (mode === "review") {
    const wrongCount = examQuestions.length - examScore;

    function restartLearning() {
      setMode("learn");
      setLearnIndex(0);
      setPracticeIndex(0);
      resetPracticeState();
      setExamIndex(0);
      setExamChoice(null);
      setExamFeedback(null);
      setExamScore(0);
    }

    return (
      <main className="min-h-[100dvh] bg-[#080d1b] px-4 py-5 text-white">
        <div className="mx-auto w-full max-w-md">
          <section className="rounded-[26px] border border-[#33466e] bg-gradient-to-b from-[#172242] to-[#10172d] p-5 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-full border-[3px] border-[#5dd9d2] bg-[#101a31]">
                <Image
                  src="/technical-agent.PNG"
                  alt="Technical Agent"
                  fill
                  priority
                  className="object-cover object-top"
                />
              </div>
              <div>
                <p className="text-[11px] font-black tracking-[0.15em] text-[#5dd9d2]">
                  TECHNICAL AGENT · REVIEW REQUIRED
                </p>
                <h1 className="mt-1 text-2xl font-black">先复习，再回来</h1>
                <p className="mt-1 text-[13px] font-semibold leading-5 text-[#b8c5e6]">
                  这次毕业测试错了 {wrongCount} 题，说明还有几个基础点需要重新巩固。
                </p>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-[22px] border border-[#e4c87e] bg-[#fff7df] p-5 text-[#5d4a18]">
            <p className="text-[12px] font-black tracking-[0.12em]">
              REVIEW RULE
            </p>
            <p className="mt-2 text-[15px] font-black leading-7">
              技术分析不是猜对答案，而是看懂价格留下的证据。
            </p>
            <p className="mt-2 text-[13px] font-semibold leading-6">
              本关规则：毕业测试错 0–1 题可以通过；错 2 题及以上，需要重新完成学习与训练后再参加测试。
            </p>
          </section>

          <section className="mt-4 space-y-3">
            {[
              "重新确认 OHLC：Open / High / Low / Close",
              "重新理解阳线与阴线：Close 和 Open 的关系",
              "重新区分实体、上影线、下影线",
              "重新认识常见 K 线形态和它们的价格行为",
              "重新练习连续 K 线的高点 / 低点结构",
            ].map((item, idx) => (
              <div
                key={item}
                className="rounded-[18px] border border-[#d7dced] bg-white p-4 text-[#20273a]"
              >
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eef3fb] text-[11px] font-black text-[#4e6b91]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[13px] font-bold leading-6">{item}</p>
                </div>
              </div>
            ))}
          </section>

          <button
            type="button"
            onClick={restartLearning}
            className="mt-4 w-full rounded-[15px] bg-[#5dd9d2] py-3.5 text-[15px] font-black text-[#0b1723]"
          >
            返回 Lesson 01 重新学习 →
          </button>
        </div>
      </main>
    );
  }

  if (mode === "summary") {
    const summaryItems = [
      ["01", "K 线记录四个价格", "Open / High / Low / Close：开盘、最高、最低、收盘。"],
      ["02", "实体看 Open 与 Close", "A 股常见显示里红色为阳线、绿色为阴线；不过真正判断仍看 Close 与 Open 的关系。"],
      ["03", "影线记录盘中路径", "长上影表示价格曾向上走得更高后回落；长下影表示价格曾向下走得更低后回升。"],
      ["04", "十字线代表实体很小", "开盘价和收盘价非常接近时，实体会很小，甚至看起来像一条横线。"],
      ["05", "单根 K 线不是预言", "连续高点和低点的结构，比只看某一根 K 线更有上下文。"],
    ];

    return (
      <main className="min-h-[100dvh] bg-[#080d1b] px-4 py-5 text-white">
        <div className="mx-auto w-full max-w-md">
          <section className="rounded-[26px] border border-[#33466e] bg-gradient-to-b from-[#172242] to-[#10172d] p-5 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-full border-[3px] border-[#5dd9d2] bg-[#101a31]">
                <Image
                  src="/technical-agent.PNG"
                  alt="Technical Agent"
                  fill
                  priority
                  className="object-cover object-top"
                />
              </div>
              <div>
                <p className="text-[11px] font-black tracking-[0.15em] text-[#5dd9d2]">TECHNICAL AGENT · DEBRIEF</p>
                <h1 className="mt-1 text-2xl font-black">K 线基础毕业</h1>
                <p className="mt-1 text-[13px] font-semibold leading-5 text-[#b8c5e6]">学习 → 练习 → 测试，你已经完成完整的 K 线入门训练。</p>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-[22px] border border-[#d7dced] bg-white p-5 text-[#20273a]">
            <p className="text-[11px] font-black tracking-[0.14em] text-[#4e6b91]">FINAL SCORE</p>
            <div className="mt-2 flex items-end justify-between">
              <div><p className="text-4xl font-black">{examScore}/4</p><p className="mt-1 text-[12px] font-semibold text-[#6f788e]">毕业测试得分</p></div>
              <div className="rounded-full bg-[#e8f8f6] px-4 py-2 text-[12px] font-black text-[#267e79]">K-LINE BASICS</div>
            </div>
          </section>

          <section className="mt-4 space-y-3">
            {summaryItems.map(([n, title, body]) => (
              <article key={n} className="rounded-[20px] border border-[#d7dced] bg-white p-4 text-[#20273a]">
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f8f6] text-[12px] font-black text-[#267e79]">{n}</span>
                  <div><h2 className="text-[15px] font-black">{title}</h2><p className="mt-1 text-[13px] font-semibold leading-6 text-[#626b80]">{body}</p></div>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-4 rounded-[22px] border border-[#4a5c8a] bg-[#141d39] p-5">
            <p className="text-[11px] font-black tracking-[0.14em] text-[#5dd9d2]">TECHNICAL AGENT RULE</p>
            <p className="mt-2 text-[16px] font-black leading-7">“K 线不是预言，它只是把价格走过的路画出来。”</p>
            <button type="button" onClick={() => onComplete?.()} className="mt-4 w-full rounded-[15px] bg-[#5dd9d2] py-3.5 text-[15px] font-black text-[#0b1723]">完成 K 线学习 →</button>
          </section>
        </div>
      </main>
    );
  }

  const modeLabel = mode === "learn" ? `学习 ${learnIndex + 1}/4` : mode === "practice" ? `训练 ${practiceIndex + 1}/6` : `测试 ${examIndex + 1}/4`;

  return (
    <main className="min-h-[100dvh] bg-[#080d1b] px-3 py-4 text-white">
      <div className="mx-auto w-full max-w-md">
        <header className="rounded-[22px] border border-[#33466e] bg-[#111a34] px-4 py-3 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => onBack?.()} className="rounded-full border border-[#3e507a] bg-[#182344] px-3 py-2 text-[11px] font-black text-[#d7e1ff]">← 金融华尔界</button>
            <div className="text-center"><p className="text-[10px] font-black tracking-[0.15em] text-[#5dd9d2]">TECHNICAL AGENT</p><h1 className="text-[15px] font-black">K 线学习站</h1></div>
            <div className="text-right"><p className="text-[10px] font-black text-[#91a2cf]">{modeLabel}</p><p className="mt-0.5 text-[11px] font-black text-[#5dd9d2]">{mode === "learn" ? learnTitles[learnIndex] : mode === "practice" ? "TRAINING" : "FINAL QUIZ"}</p></div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#202c50]"><div className="h-full rounded-full bg-gradient-to-r from-[#5dd9d2] to-[#7e7ef0] transition-all duration-500" style={{ width: `${currentProgress}%` }} /></div>
        </header>

        <section className="mt-3 flex items-center gap-3 rounded-[20px] border border-[#33466e] bg-[#111a34] p-3.5">
          <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-full border-[3px] border-[#5dd9d2] bg-[#182344]">
            <Image
              src="/technical-agent.PNG"
              alt="Technical Agent"
              fill
              priority
              className="object-cover object-top"
            />
          </div>
          <div><div className="flex items-center gap-2"><p className="text-[10px] font-black tracking-[0.13em] text-[#5dd9d2]">TECHNICAL AGENT</p><span className="rounded-full bg-[#202d50] px-2 py-1 text-[9px] font-black text-[#aebbe0]">技术分析员</span></div><p className="mt-1.5 text-[12px] font-semibold leading-5 text-[#c2cdea]">{mode === "learn" ? "先学懂，再做题。每一页只讲一个核心概念，学完以后再进入训练模式。" : mode === "practice" ? "现在开始练习。答对后我会解释为什么，然后由你自己点击进入下一题。" : "最后是毕业测试。别急着选，先回忆刚刚学过的结构和逻辑。"}</p></div>
        </section>

        {mode === "learn" && (
          <section className="mt-3 rounded-[26px] border-2 border-[#394d79] bg-[#f6f7fb] p-4 text-[#1f2639] shadow-2xl">
            {learnIndex === 0 && (
              <div>
                <p className="text-[10px] font-black tracking-[0.14em] text-[#4e6b91]">LESSON 01 · OHLC</p>
                <h2 className="mt-1 text-xl font-black">一根 K 线到底是什么？</h2>
                <div className="mt-4 rounded-[18px] border border-[#d8dfed] bg-white p-4">
                  <p className="text-[13px] font-black leading-6">一根 K 线记录某一个时间周期内的四个关键价格：</p>
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    {[["Open","开盘价","这一周期开始时的价格"],["High","最高价","这一周期到达过的最高价格"],["Low","最低价","这一周期到达过的最低价格"],["Close","收盘价","这一周期结束时的价格"]].map(([en,zh,desc]) => (
                      <div key={en} className="rounded-[14px] bg-[#f2f5fb] p-3"><p className="text-[13px] font-black text-[#3c526f]">{en}</p><p className="mt-0.5 text-[12px] font-black">{zh}</p><p className="mt-1 text-[10px] font-semibold leading-4 text-[#788297]">{desc}</p></div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex justify-center"><div className="relative h-[330px] w-[205px] rounded-[24px] border border-[#d8dfed] bg-white"><div className="absolute left-1/2 top-7 -translate-x-1/2 rounded-full bg-[#eef3fb] px-3 py-1.5 text-[11px] font-black text-[#4f607d]">High 110</div><div className="absolute left-1/2 top-[65px] h-[73px] w-[4px] -translate-x-1/2 rounded-full bg-[#ef4444]" /><div className="absolute left-1/2 top-[137px] h-[94px] w-[82px] -translate-x-1/2 rounded-[10px] border-[3px] border-[#dc2626] bg-[#ef4444]" /><div className="absolute left-[14px] top-[144px] rounded-xl bg-[#fff0f2] px-2.5 py-1.5 text-[10px] font-black text-[#a53d50]">Close 108</div><div className="absolute right-[14px] top-[199px] rounded-xl bg-[#eef0ff] px-2.5 py-1.5 text-[10px] font-black text-[#586aca]">Open 102</div><div className="absolute left-1/2 top-[229px] h-[50px] w-[4px] -translate-x-1/2 rounded-full bg-[#ef4444]" /><div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[#eef3fb] px-3 py-1.5 text-[11px] font-black text-[#4f607d]">Low 99</div></div></div>
                <div className="mt-4 rounded-[16px] border border-[#e5d59e] bg-[#fff8dd] px-4 py-3"><p className="text-[12px] font-black leading-5 text-[#745f1e]">💡 先记住一句：K 线不是一个“涨跌符号”，它首先是一张 OHLC 价格记录图。</p></div>
              </div>
            )}

            {learnIndex === 1 && (
              <div>
                <p className="text-[10px] font-black tracking-[0.14em] text-[#4e6b91]">LESSON 02 · BULL & BEAR</p><h2 className="mt-1 text-xl font-black">阳线与阴线怎么看？</h2>
                <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-[18px] border border-[#f0cfd5] bg-white p-4 text-center"><MiniCandle tone="bull" label="阳线" /><p className="mt-2 text-[13px] font-black text-[#b64455]">Close ＞ Open</p><p className="mt-1 text-[11px] font-semibold leading-5 text-[#6e788d]">收盘价高于开盘价。</p></div><div className="rounded-[18px] border border-[#cce8dd] bg-white p-4 text-center"><MiniCandle tone="bear" label="阴线" /><p className="mt-2 text-[13px] font-black text-[#237760]">Close ＜ Open</p><p className="mt-1 text-[11px] font-semibold leading-5 text-[#6e788d]">收盘价低于开盘价。</p></div></div>
                <div className="mt-4 rounded-[16px] border border-[#e5d59e] bg-[#fff8dd] px-4 py-3"><p className="text-[12px] font-black leading-5 text-[#745f1e]">💡 本关统一采用 A 股常见配色：红色 = 阳线，绿色 = 阴线。看到红色先想到 Close ＞ Open，看到绿色先想到 Close ＜ Open。</p></div>
                <div className="mt-3 rounded-[16px] bg-[#eef3fb] px-4 py-3"><p className="text-[12px] font-bold leading-5 text-[#53627c]">阳线只说明“这一周期收盘高于开盘”；阴线只说明“这一周期收盘低于开盘”。它们都不能单独保证下一周期怎么走。</p></div>
              </div>
            )}

            {learnIndex === 2 && (
              <div>
                <p className="text-[10px] font-black tracking-[0.14em] text-[#4e6b91]">LESSON 03 · BODY & SHADOW</p><h2 className="mt-1 text-xl font-black">实体和影线分别代表什么？</h2>
                <div className="mt-4 rounded-[20px] border border-[#d8dfed] bg-white p-4"><div className="grid grid-cols-[120px_1fr] items-center gap-4"><div className="flex justify-center"><MiniCandle tone="bull" upper={46} lower={34} body={54} /></div><div className="space-y-3"><div><p className="text-[13px] font-black">实体 Body</p><p className="mt-1 text-[11px] font-semibold leading-5 text-[#6f788e]">开盘价与收盘价之间的区域。</p></div><div><p className="text-[13px] font-black">上影线 Upper Shadow</p><p className="mt-1 text-[11px] font-semibold leading-5 text-[#6f788e]">从实体上沿到最高价，表示价格曾经走得更高。</p></div><div><p className="text-[13px] font-black">下影线 Lower Shadow</p><p className="mt-1 text-[11px] font-semibold leading-5 text-[#6f788e]">从实体下沿到最低价，表示价格曾经走得更低。</p></div></div></div></div>
                <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-[18px] border border-[#d8dfed] bg-white p-3 text-center"><MiniCandle tone="bull" upper={70} lower={16} body={42} label="长上影" /><p className="mt-2 text-[11px] font-semibold leading-5 text-[#6d768b]">价格曾冲到更高位置，但后来回落。</p></div><div className="rounded-[18px] border border-[#d8dfed] bg-white p-3 text-center"><MiniCandle tone="bear" upper={16} lower={70} body={42} label="长下影" /><p className="mt-2 text-[11px] font-semibold leading-5 text-[#6d768b]">价格曾跌到更低位置，但后来回升。</p></div></div>
                <div className="mt-4 rounded-[16px] border border-[#e5d59e] bg-[#fff8dd] px-4 py-3"><p className="text-[12px] font-black leading-5 text-[#745f1e]">💡 影线首先告诉你“盘中走过哪里”，不是直接告诉你“未来一定去哪”。</p></div>
              </div>
            )}

            {learnIndex === 3 && (
              <div>
                <p className="text-[10px] font-black tracking-[0.14em] text-[#4e6b91]">
                  LESSON 04 · CANDLE ATLAS
                </p>
                <h2 className="mt-1 text-xl font-black">阳线常见基本图形</h2>

                <div className="mt-3 rounded-[16px] border border-[#e5d59e] bg-[#fff8dd] px-4 py-3">
                  <p className="text-[12px] font-black leading-5 text-[#745f1e]">
                    🇨🇳 本关继续使用 A 股常见配色：<span className="text-[#c73232]">红色实体 = 阳线</span>。
                    下列名称参考你给的图表，但“应用说明”改成更严谨的价格行为描述，不把单根 K 线直接当成确定的买卖信号。
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    {
                      name: "大阳线",
                      upper: 8,
                      lower: 8,
                      body: 84,
                      source: "截图常见说法：强烈涨势",
                      desc: "实体很长，Close 明显高于 Open，说明这一周期从开盘到收盘上涨幅度较大、买方力量较强。",
                    },
                    {
                      name: "大阳下影线",
                      upper: 6,
                      lower: 34,
                      body: 60,
                      source: "截图常见说法：低档超强",
                      desc: "阳线实体较长，同时存在明显下影。说明盘中曾下探，但随后收复较多失地并收在开盘价上方。",
                    },
                    {
                      name: "大阳上影线",
                      upper: 34,
                      lower: 6,
                      body: 60,
                      source: "截图常见说法：高档换手",
                      desc: "阳线实体较长，同时存在明显上影。说明盘中曾冲得更高，之后有所回落；高位出现时常需留意上方抛压与换手。",
                    },
                    {
                      name: "小阳线",
                      upper: 28,
                      lower: 28,
                      body: 24,
                      source: "截图常见说法：方向不明，多方稍强",
                      desc: "实体较小，Close 仅略高于 Open。说明这一周期上涨幅度有限，多方略占优，但方向性并不强。",
                    },
                    {
                      name: "上影小阳线",
                      upper: 50,
                      lower: 14,
                      body: 22,
                      source: "截图常见说法：多方主导，需谨慎",
                      desc: "小阳线带较长上影，说明收盘仍高于开盘，但盘中冲高后有明显回落，需要结合所处位置判断上方压力。",
                    },
                    {
                      name: "下影小阳线",
                      upper: 14,
                      lower: 50,
                      body: 22,
                      source: "截图常见说法：多方强势",
                      desc: "小阳线带较长下影，说明盘中曾明显下探后回升，并最终收在开盘价上方，体现一定承接。",
                    },
                    {
                      name: "阳线锤形线",
                      upper: 4,
                      lower: 70,
                      body: 22,
                      source: "截图常见说法：高档差、低档佳",
                      desc: "实体位于上部、下影明显较长、上影很短或接近没有。低位出现时常被关注为潜在企稳信号；高位出现时含义不同，必须结合趋势和位置。",
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="grid grid-cols-[88px_1fr] items-center gap-4 rounded-[18px] border border-[#d8dfed] bg-white p-4"
                    >
                      <div className="flex justify-center">
                        <MiniCandle
                          tone="bull"
                          upper={item.upper}
                          lower={item.lower}
                          body={item.body}
                          label={item.name}
                        />
                      </div>

                      <div>
                        <p className="text-[14px] font-black text-[#272f43]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-[11px] font-black leading-5 text-[#a44747]">
                          {item.source}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold leading-5 text-[#697388]">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[18px] border border-[#d8dfed] bg-white p-4">
                  <div className="flex items-center gap-4">
                    <MiniCandle tone="doji" upper={50} lower={50} label="十字线 Doji" />
                    <div>
                      <p className="text-[13px] font-black">十字线是另一类结构</p>
                      <p className="mt-1 text-[11px] font-semibold leading-5 text-[#6f788e]">
                        当 Open 与 Close 非常接近时，实体缩得很小，视觉上接近一条横线。
                        T 字线、倒 T 字线、长十字等，本质上可以继续从“实体大小 + 上下影长度”来理解。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[16px] border border-[#c8d6ea] bg-[#eef3fb] px-4 py-3">
                  <p className="text-[12px] font-bold leading-5 text-[#53627c]">
                    📌 更严谨的读法：先描述形状和当期价格行为，再结合它出现的位置、前后趋势、成交量等上下文判断意义。
                    例如“大阳上影线”不能脱离位置就直接等同于“换手”或“见顶”。
                  </p>
                </div>
              </div>
            )}

            <button type="button" onClick={nextLearn} className="mt-5 w-full rounded-[15px] bg-[#182344] py-3.5 text-[14px] font-black text-white">{learnIndex === 3 ? "我学会了，开始训练 →" : "我看懂了，继续 →"}</button>
          </section>
        )}

        {mode === "practice" && (
          <section className="mt-3 rounded-[26px] border-2 border-[#394d79] bg-[#f6f7fb] p-4 text-[#1f2639] shadow-2xl">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black tracking-[0.14em] text-[#4e6b91]">TRAINING {practiceIndex + 1}/6</p><h2 className="mt-1 text-xl font-black">{practiceQuestions[practiceIndex].title}</h2><p className="mt-2 text-[12px] font-semibold leading-5 text-[#6d768b]">{practiceQuestions[practiceIndex].subtitle}</p></div><span className="rounded-full bg-[#e7f8f6] px-3 py-1.5 text-[11px] font-black text-[#267e79]">PRACTICE</span></div>

            {practiceQuestions[practiceIndex].kind === "body" && (<div className="mt-4 flex justify-center"><div className="relative h-[330px] w-[205px] rounded-[24px] border border-[#d8dfed] bg-white"><button type="button" onClick={() => submitPractice("upper")} className="absolute left-1/2 top-[48px] h-[80px] w-14 -translate-x-1/2 rounded-xl border-2 border-dashed border-[#a8b4cb]" /><div className="absolute left-1/2 top-[59px] h-[70px] w-[4px] -translate-x-1/2 rounded-full bg-[#ef4444]" /><button type="button" onClick={() => submitPractice("body")} className={`absolute left-1/2 top-[128px] h-[98px] w-[86px] -translate-x-1/2 rounded-[10px] border-[3px] ${practiceChoice === "body" ? "border-[#dc2626] bg-[#fecaca]" : "border-[#dc2626] bg-[#ef4444]"}`}><span className="text-[12px] font-black text-[#8f2f3f]">BODY?</span></button><button type="button" onClick={() => submitPractice("lower")} className="absolute left-1/2 top-[226px] h-[60px] w-14 -translate-x-1/2 rounded-xl border-2 border-dashed border-[#a8b4cb]" /><div className="absolute left-1/2 top-[225px] h-[62px] w-[4px] -translate-x-1/2 rounded-full bg-[#ef4444]" /></div></div>)}

            {practiceQuestions[practiceIndex].kind === "bullbear" && (<div className="mt-4"><div className="rounded-[18px] border border-[#d8dfed] bg-white p-4"><div className="grid grid-cols-2 gap-3"><div className="rounded-[14px] bg-[#f2f5fb] p-3"><p className="text-[11px] font-bold text-[#7b8498]">Open</p><p className="mt-1 text-xl font-black">102</p></div><div className="rounded-[14px] bg-[#f2f5fb] p-3"><p className="text-[11px] font-bold text-[#7b8498]">Close</p><p className="mt-1 text-xl font-black">108</p></div></div></div><div className="mt-3 grid grid-cols-2 gap-3"><button type="button" onClick={() => submitPractice("bull")} className={`min-h-[78px] rounded-[16px] border-2 px-4 py-3 text-left ${practiceChoice === "bull" ? "border-[#d87b89] bg-[#fff0f2]" : "border-[#d7ddec] bg-white"}`}><p className="text-[14px] font-black">📈 阳线</p><p className="mt-1 text-[11px] font-semibold text-[#737d92]">Close ＞ Open</p></button><button type="button" onClick={() => submitPractice("bear")} className={`min-h-[78px] rounded-[16px] border-2 px-4 py-3 text-left ${practiceChoice === "bear" ? "border-[#5ca88d] bg-[#edf9f4]" : "border-[#d7ddec] bg-white"}`}><p className="text-[14px] font-black">📉 阴线</p><p className="mt-1 text-[11px] font-semibold text-[#737d92]">Close ＜ Open</p></button></div></div>)}

            {practiceQuestions[practiceIndex].kind === "upper" && (<div className="mt-4"><div className="flex justify-center rounded-[20px] border border-[#d8dfed] bg-white py-4"><MiniCandle tone="bull" upper={78} lower={14} body={38} label="长上影线" /></div><div className="mt-3 space-y-2.5">{[["pullback","价格曾冲得更高，但后来回落"],["mustfall","明天一定会跌"],["top","说明上涨趋势已经结束"]].map(([id,label]) => (<button key={id} type="button" onClick={() => submitPractice(id)} className={`w-full min-h-[62px] rounded-[16px] border-2 px-4 py-3 text-left text-[13px] font-black leading-5 ${practiceChoice === id ? "border-[#667fe0] bg-[#eef0ff]" : "border-[#d7ddec] bg-white"}`}>{label}</button>))}</div></div>)}

            {practiceQuestions[practiceIndex].kind === "lower" && (<div className="mt-4"><div className="flex justify-center rounded-[20px] border border-[#d8dfed] bg-white py-4"><MiniCandle tone="bear" upper={14} lower={78} body={38} label="长下影线" /></div><div className="mt-3 space-y-2.5">{[["rebound","价格曾跌得更低，但后来回升"],["mustrise","明天一定会上涨"],["bottom","说明这里一定是市场底部"]].map(([id,label]) => (<button key={id} type="button" onClick={() => submitPractice(id)} className={`w-full min-h-[62px] rounded-[16px] border-2 px-4 py-3 text-left text-[13px] font-black leading-5 ${practiceChoice === id ? "border-[#667fe0] bg-[#eef0ff]" : "border-[#d7ddec] bg-white"}`}>{label}</button>))}</div></div>)}

            {practiceQuestions[practiceIndex].kind === "doji" && (<div className="mt-4"><div className="flex justify-center rounded-[20px] border border-[#d8dfed] bg-white py-4"><MiniCandle tone="doji" upper={58} lower={58} label="十字线 Doji" /></div><div className="mt-3 space-y-2.5">{[["close-open","开盘价与收盘价非常接近，实体很小"],["huge-body","实体非常长，代表单边涨跌很强"],["future","说明下一周期一定会反转"]].map(([id,label]) => (<button key={id} type="button" onClick={() => submitPractice(id)} className={`w-full min-h-[62px] rounded-[16px] border-2 px-4 py-3 text-left text-[13px] font-black leading-5 ${practiceChoice === id ? "border-[#667fe0] bg-[#eef0ff]" : "border-[#d7ddec] bg-white"}`}>{label}</button>))}</div></div>)}

            {practiceQuestions[practiceIndex].kind === "trend" && (<div className="mt-4"><div className="flex h-[240px] items-end justify-between gap-3 rounded-[20px] border border-[#d8dfed] bg-white px-4 pb-5 pt-4">{[18,27,36,48,59].map((bottom,i) => (<div key={i} className="relative h-full flex-1"><div className={`absolute left-1/2 w-[3px] -translate-x-1/2 rounded-full ${i % 2 === 0 ? "bg-[#ef4444]" : "bg-[#22c55e]"}`} style={{ bottom: `${bottom}%`, height: "82px" }} /><div className={`absolute left-1/2 h-[52px] w-[28px] -translate-x-1/2 rounded-[5px] border-2 ${i % 2 === 0 ? "border-[#dc2626] bg-[#ef4444]" : "border-[#16a34a] bg-[#22c55e]"}`} style={{ bottom: `${bottom + 8}%` }} /></div>))}</div><div className="mt-3 space-y-2.5">{[["up","上涨结构｜高点与低点整体抬高"],["down","下跌结构｜高点与低点整体降低"],["sideways","震荡结构｜主要在相近区间内往返"]].map(([id,label]) => (<button key={id} type="button" onClick={() => submitPractice(id)} className={`w-full min-h-[64px] rounded-[16px] border-2 px-4 py-3 text-left text-[13px] font-black leading-5 ${practiceChoice === id ? "border-[#667fe0] bg-[#eef0ff]" : "border-[#d7ddec] bg-white"}`}>{label}</button>))}</div></div>)}

            {practiceFeedback && <div className={`mt-4 rounded-[16px] border px-4 py-3 text-[12px] font-bold leading-5 ${practiceCorrect ? "border-[#b9dcd8] bg-[#ecfaf8] text-[#30716b]" : "border-[#e5d59e] bg-[#fff8dd] text-[#745f1e]"}`}>{practiceFeedback}</div>}
            {practiceCorrect && <button type="button" onClick={nextPractice} className="mt-3 w-full rounded-[15px] bg-[#182344] py-3.5 text-[14px] font-black text-white">{practiceIndex === practiceQuestions.length - 1 ? "训练完成，进入毕业测试 →" : "我理解了，下一题 →"}</button>}
          </section>
        )}

        {mode === "exam" && (
          <section className="mt-3 rounded-[26px] border-2 border-[#394d79] bg-[#f6f7fb] p-4 text-[#1f2639] shadow-2xl">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black tracking-[0.14em] text-[#4e6b91]">FINAL QUIZ {examIndex + 1}/4</p><h2 className="mt-1 text-xl font-black">K 线毕业测试</h2></div><span className="rounded-full bg-[#fff0d8] px-3 py-1.5 text-[11px] font-black text-[#9a6819]">TEST</span></div>
            <div className="mt-4 rounded-[18px] border border-[#d8dfed] bg-white p-4"><p className="text-[15px] font-black leading-6">{examQuestions[examIndex].question}</p></div>
            <div className="mt-3 space-y-2.5">
              {examQuestions[examIndex].options.map((option, idx) => {
                const correctIndex = examQuestions[examIndex].correct;
                const answered = examChoice !== null;
                const isSelected = examChoice === idx;
                const isCorrectOption = idx === correctIndex;

                let optionClass = "border-[#d7ddec] bg-white";
                if (answered && isCorrectOption) {
                  optionClass = "border-[#55a36d] bg-[#ecfaf1]";
                } else if (answered && isSelected && !isCorrectOption) {
                  optionClass = "border-[#d86a78] bg-[#fff0f2]";
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={!!examFeedback}
                    onClick={() => submitExam(idx)}
                    className={`w-full min-h-[64px] rounded-[16px] border-2 px-4 py-3 text-left text-[13px] font-black leading-5 ${optionClass} disabled:cursor-default`}
                  >
                    <span
                      className={`mr-2 ${
                        answered && isCorrectOption
                          ? "text-[#2f8250]"
                          : answered && isSelected && !isCorrectOption
                            ? "text-[#b74759]"
                            : "text-[#667fe0]"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {option}
                    {answered && isCorrectOption && (
                      <span className="ml-2 text-[#2f8250]">✓</span>
                    )}
                    {answered && isSelected && !isCorrectOption && (
                      <span className="ml-2 text-[#b74759]">✕</span>
                    )}
                  </button>
                );
              })}
            </div>
            {examFeedback && (
              <>
                <div
                  className={`mt-4 rounded-[16px] border px-4 py-3 text-[12px] font-bold leading-5 ${
                    examChoice === examQuestions[examIndex].correct
                      ? "border-[#bfdcd8] bg-[#ecfaf8] text-[#30716b]"
                      : "border-[#efc3c9] bg-[#fff1f3] text-[#9c3f4d]"
                  }`}
                >
                  <p className="font-black">
                    {examChoice === examQuestions[examIndex].correct
                      ? "✅ 回答正确"
                      : "❌ 回答错误"}
                  </p>
                  <p className="mt-1">{examQuestions[examIndex].explain}</p>
                </div>
                <button
                  type="button"
                  onClick={nextExam}
                  className="mt-3 w-full rounded-[15px] bg-[#182344] py-3.5 text-[14px] font-black text-white"
                >
                  {examIndex === examQuestions.length - 1
                    ? "查看毕业总结 →"
                    : "下一题 →"}
                </button>
              </>
            )}
          </section>
        )}

        <p className="mt-3 text-center text-[10px] font-semibold text-[#6f7da9]">本关用于学习 K 线基础概念，不构成投资建议。</p>
      </div>
    </main>
  );
}
