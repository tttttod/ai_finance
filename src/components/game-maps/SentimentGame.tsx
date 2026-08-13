"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type SentimentGameProps = {
  onBack?: () => void;
  onComplete?: () => void;
};

type Mood = "panic" | "neutral" | "hype";
type Round = 1 | 2 | 3;

type MoodItem = {
  id: number;
  source: string;
  icon: string;
  text: string;
  correct: Mood;
  explanation: string;
};

type RadarItem = {
  id: string;
  icon: string;
  source: string;
  text: string;
  isSignal: boolean;
};

const moodItems: MoodItem[] = [
  {
    id: 1,
    source: "财经社区",
    icon: "💬",
    text: "完了完了，大盘又跌了！这次是不是要彻底崩了？",
    correct: "panic",
    explanation:
      "\u201c完了\u201d\u201c完了\u201d这类表达带有明显的灾难化和恐慌情绪。",
  },
  {
    id: 2,
    source: "公司公告",
    icon: "📰",
    text: "公司发布季度报告，营业收入同比增长 6.2%。",
    correct: "neutral",
    explanation:
      "这是一条以事实陈述为主的信息，本身没有明显情绪倾向。",
  },
  {
    id: 3,
    source: "热门评论",
    icon: "🔥",
    text: "这票不可能跌！现在不上车以后只会更贵！",
    correct: "hype",
    explanation:
      "\u201c不可能跌\u201d\u201c不上车就晚了\u201d是典型的狂热和追涨情绪。",
  },
  {
    id: 4,
    source: "市场快讯",
    icon: "📡",
    text: "主要指数午后小幅回升，成交量较昨日基本持平。",
    correct: "neutral",
    explanation:
      "这条信息主要描述市场变化，没有明显的恐慌或狂热表达。",
  },
  {
    id: 5,
    source: "社交平台",
    icon: "️",
    text: "赶紧跑！我身边的人都在清仓，再不卖就来不及了！",
    correct: "panic",
    explanation:
      "\u201c赶紧跑\u201d\u201c来不及了\u201d体现了强烈的群体恐慌和逃离情绪。",
  },
];

const radarItems: RadarItem[] = [
  {
    id: "search",
    icon: "",
    source: "搜索热度",
    text: "\u201c星浪科技\u201d24 小时搜索热度上涨 386%",
    isSignal: true,
  },
  {
    id: "office",
    icon: "🏢",
    source: "公司动态",
    text: "公司总部办公区域完成重新装修",
    isSignal: false,
  },
  {
    id: "comments",
    icon: "",
    source: "投资社区",
    text: "\u201c满仓冲！\u201d\u201c这次绝对不会跌！\u201d等评论开始大量刷屏",
    isSignal: true,
  },
  {
    id: "meeting",
    icon: "📅",
    source: "公司公告",
    text: "公司将于下周召开年度股东大会",
    isSignal: false,
  },
  {
    id: "product",
    icon: "📦",
    source: "企业新闻",
    text: "公司本月发布一款常规产品升级版本",
    isSignal: false,
  },
];


type FomoPhase =
  | "flight"
  | "temptation"
  | "afterChase"
  | "waitPressure"
  | "reflection"
  | "concept"
  | "boss"
  | "evidence";

type ReflectionChoice = "logic" | "fomo" | "trend";
type WaitReflectionChoice = "regret" | "fundamental" | "safe";
type BossChoice = "chase" | "wait" | "evidence";
type EvidenceChoice = "fundamental" | "price-sentiment" | "valuation";

const openingFlight = [
  { gain: "+3.2%", heat: 28, feed: "💬 '今天有点强诶。'" },
  { gain: "+6.8%", heat: 39, feed: "📈 热门讨论排名升至 Top 50" },
  { gain: "+10.5%", heat: 51, feed: " '是不是要突破了？'" },
  { gain: "+12.8%", heat: 61, feed: "💬 '我刚买就赚了！'" },
  { gain: "+15.7%", heat: 70, feed: " '还没上车的人真能忍。'" },
];

const chaseSequence = [
  { gain: "+18.4%", heat: 78, label: "追涨后继续上涨" },
  { gain: "+21.8%", heat: 86, label: "看起来……你买对了？" },
  { gain: "+22.4%", heat: 93, label: "情绪来到峰值" },
  { gain: "+17.1%", heat: 88, label: "MARKET REVERSAL" },
  { gain: "+11.8%", heat: 73, label: "快速回落" },
];

const waitPressureScene = {
  gain: "+21.6%",
  heat: 88,
  fomo: 82,
  feed: [
    "🚀 '又涨了！刚才没买的人是不是后悔了？'",
    " '我朋友已经赚 18% 了！'",
    "🔥 '现在不上车，下一站可能就是 +30%！'",
  ],
};

const bossFeed = [
  "🚀 '起飞！！！今天不可能回头了！'",
  "🔥 '满仓！这种机会一辈子就一次！'",
  "💬 '你还在分析？别人已经赚钱了！'",
  " '最后上车机会！'",
  " '目标价至少再翻倍！'",
  "😵 '不买真的会后悔！'",
];

const evidenceCards = [
  {
    icon: "🏢",
    title: "基本面",
    value: "没有新的重大变化",
    tone: "neutral",
  },
  {
    icon: "💰",
    title: "估值",
    value: "已明显高于此前水平",
    tone: "warning",
  },
  {
    icon: "🚀",
    title: "股价",
    value: "+24.8% · 快速拉升",
    tone: "hot",
  },
  {
    icon: "",
    title: "社区情绪",
    value: "极度狂热 · FOMO 高发",
    tone: "hot",
  },
];

const moodMeta: Record<
  Mood,
  {
    label: string;
    english: string;
    icon: string;
    activeClass: string;
  }
> = {
  panic: {
    label: "恐慌",
    english: "PANIC",
    icon: "😱",
    activeClass:
      "border-[#8cc9ef] bg-[#e7f5ff] text-[#4f86ad] shadow-[0_0_24px_rgba(110,190,240,0.25)]",
  },

  neutral: {
    label: "中性",
    english: "NEUTRAL",
    icon: "",
    activeClass:
      "border-[#c7b9ec] bg-[#f3efff] text-[#75649b] shadow-[0_0_24px_rgba(180,160,230,0.20)]",
  },

  hype: {
    label: "狂热",
    english: "HYPE",
    icon: "",
    activeClass:
      "border-[#efa6ce] bg-[#fff0f7] text-[#b45e8e] shadow-[0_0_24px_rgba(240,150,200,0.25)]",
  },
};

/* ======================================================
   Agent 头像 + 对话组件
   ====================================================== */

function AgentMessage({
  children,
  alert = false,
}: {
  children: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <section
      className={`relative mt-8 rounded-[26px] border p-4 pl-[82px] shadow-[0_12px_35px_rgba(141,116,180,0.10)] ${
        alert
          ? "border-[#f0adc5] bg-[#fff2f7]"
          : "border-[#d9c9ef] bg-[#fff8fd]"
      }`}
    >
      {/* Agent 圆形头像 */}
      <div className="absolute -left-2 -top-5 h-[82px] w-[82px]">
        <div className="absolute inset-2 rounded-full bg-[#e7a9d1]/30 blur-xl" />
        <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-[#dba4ce] bg-gradient-to-br from-[#ffe7f5] via-[#efe6ff] to-[#dff3ff] shadow-[0_8px_22px_rgba(173,118,167,0.22)]">
          <Image
            src="/sentiment_agent.PNG"
            alt="Sentiment Agent"
            fill
            priority
            className="object-cover object-top scale-110"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#f2b5d7] text-sm shadow-md">
          💗
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-black tracking-[0.15em] text-[#c36fa8]">
            SENTIMENT AGENT
          </p>
          <span className="rounded-full bg-[#eedff7] px-2 py-0.5 text-[9px] font-bold text-[#87689b]">
            市场情绪观察员
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#655f78]">
          {children}
        </p>
      </div>
    </section>
  );
}

/* ======================================================
   主组件
   ====================================================== */

export default function SentimentGame({
  onBack,
  onComplete,
}: SentimentGameProps) {
  const [round, setRound] = useState<Round>(1);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameCleared, setGameCleared] = useState(false);
  const [round3Complete, setRound3Complete] = useState(false);

  // Round 1
  const [moodIndex, setMoodIndex] = useState(0);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [round1Wrong, setRound1Wrong] = useState(false);

  // Round 2
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [round2Wrong, setRound2Wrong] = useState(false);

  // Round 3
  const [fomoPhase, setFomoPhase] = useState<FomoPhase>("flight");
  const [flightIndex, setFlightIndex] = useState(0);
  const [fomoChoice, setFomoChoice] = useState<"chase" | "wait" | null>(null);
  const [chaseIndex, setChaseIndex] = useState(0);
  const [reflectionChoice, setReflectionChoice] =
    useState<ReflectionChoice | null>(null);
  const [waitReflectionChoice, setWaitReflectionChoice] =
    useState<WaitReflectionChoice | null>(null);
  const [bossIndex, setBossIndex] = useState(0);
  const [bossChoice, setBossChoice] = useState<BossChoice | null>(null);
  const [evidenceChoice, setEvidenceChoice] =
    useState<EvidenceChoice | null>(null);
  const [bossWrong, setBossWrong] = useState(false);
  const [evidenceWrong, setEvidenceWrong] = useState(false);
  const [round3Wrong, setRound3Wrong] = useState(false);

  const currentItem = moodItems[moodIndex];
  const totalMoodItems = moodItems.length;
  const totalFlight = openingFlight.length;
  const totalChase = chaseSequence.length;
  const totalBoss = bossFeed.length;

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

  function resetGame() {
    setRound(1);
    setLives(3);
    setGameOver(false);
    setGameCleared(false);
    setRound3Complete(false);
    setMoodIndex(0);
    setSelectedMood(null);
    setShowFeedback(false);
    setRound1Wrong(false);
    setSelectedSignals([]);
    setRound2Wrong(false);
    setFomoPhase("flight");
    setFlightIndex(0);
    setFomoChoice(null);
    setChaseIndex(0);
    setReflectionChoice(null);
    setWaitReflectionChoice(null);
    setBossIndex(0);
    setBossChoice(null);
    setEvidenceChoice(null);
    setBossWrong(false);
    setEvidenceWrong(false);
    setRound3Wrong(false);
  }

  /* ======================================================
     Round 1 逻辑
     ====================================================== */

  function handleMoodSelect(mood: Mood) {
    if (showFeedback || gameOver || gameCleared) return;
    setSelectedMood(mood);
  }

  function handleMoodSubmit() {
    if (!selectedMood || showFeedback) return;
    if (selectedMood === currentItem.correct) {
      setShowFeedback(true);
      setRound1Wrong(false);
      setTimeout(() => {
        if (moodIndex + 1 < totalMoodItems) {
          setMoodIndex((i) => i + 1);
          setSelectedMood(null);
          setShowFeedback(false);
        } else {
          setRound(2);
        }
      }, 1600);
    } else {
      loseLife();
      setShowFeedback(true);
      setRound1Wrong(true);
      setTimeout(() => {
        setSelectedMood(null);
        setShowFeedback(false);
        setRound1Wrong(false);
      }, 1600);
    }
  }

  /* ======================================================
     Round 2 逻辑
     ====================================================== */

  function toggleSignal(id: string) {
    if (gameOver || gameCleared) return;
    setRound2Wrong(false);
    setSelectedSignals((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleRound2Submit() {
    const correctIds = radarItems.filter((i) => i.isSignal).map((i) => i.id);
    const isCorrect =
      selectedSignals.length === 2 &&
      correctIds.every((id) => selectedSignals.includes(id));
    if (isCorrect) {
      setRound(3);
      setRound2Wrong(false);
    } else {
      loseLife();
      setRound2Wrong(true);
      setSelectedSignals([]);
    }
  }

  /* ======================================================
     Round 3 逻辑
     ====================================================== */

  function startFomoRound() {
    setFomoPhase("flight");
    setFlightIndex(0);
    setFomoChoice(null);
    setChaseIndex(0);
    setReflectionChoice(null);
    setWaitReflectionChoice(null);
    setBossIndex(0);
    setBossChoice(null);
    setEvidenceChoice(null);
    setBossWrong(false);
    setEvidenceWrong(false);
    setRound3Wrong(false);
  }

  function handleFomoChoice(choice: "chase" | "wait") {
    setFomoChoice(choice);
    if (choice === "chase") {
      setFomoPhase("afterChase");
      setChaseIndex(0);
    } else {
      setFomoPhase("waitPressure");
    }
  }

  function handleReflection(choice: ReflectionChoice) {
    setReflectionChoice(choice);
    if (choice === "fomo") {
      setRound3Wrong(true);
      setTimeout(() => setRound3Wrong(false), 1800);
    } else {
      setRound3Wrong(false);
      setFomoPhase("concept");
    }
  }

  function handleWaitReflection(choice: WaitReflectionChoice) {
    setWaitReflectionChoice(choice);
    if (choice === "regret") {
      setRound3Wrong(true);
      setTimeout(() => setRound3Wrong(false), 1800);
    } else {
      setRound3Wrong(false);
      setFomoPhase("concept");
    }
  }

  function handleBoss(choice: BossChoice) {
    setBossChoice(choice);
    if (choice === "evidence") {
      setFomoPhase("evidence");
      setBossWrong(false);
    } else {
      loseLife();
      setBossWrong(true);
      setTimeout(() => setBossWrong(false), 1800);
    }
  }

  function handleEvidence(choice: EvidenceChoice) {
    setEvidenceChoice(choice);
    if (choice === "fundamental") {
      setRound3Complete(true);
      setGameCleared(true);
      setEvidenceWrong(false);
    } else {
      loseLife();
      setEvidenceWrong(true);
      setTimeout(() => setEvidenceWrong(false), 1800);
    }
  }

  /* ======================================================
     渲染
     ====================================================== */

  const taskText =
    round === 1
      ? "判断这条信息的情绪类型"
      : round === 2
        ? "找出 2 条异动信号"
        : fomoPhase === "flight"
          ? "感受市场情绪升温"
          : fomoPhase === "temptation"
            ? "做出你的选择"
            : fomoPhase === "afterChase"
              ? "观察追涨后的走势"
              : fomoPhase === "waitPressure"
                ? "感受观望的压力"
                : fomoPhase === "reflection"
                  ? "反思你的感受"
                  : fomoPhase === "concept"
                    ? "理解 FOMO 是什么"
                    : fomoPhase === "boss"
                      ? "应对 Boss 关"
                      : "做出最终判断";

  const roundProgress =
    round === 1
      ? ((moodIndex + 1) / totalMoodItems) * 100
      : round === 2
        ? (selectedSignals.length / 2) * 100
        : round === 3 && fomoPhase === "flight"
          ? ((flightIndex + 1) / totalFlight) * 100
          : round === 3 && fomoPhase === "afterChase"
            ? ((chaseIndex + 1) / totalChase) * 100
            : round === 3 && fomoPhase === "boss"
              ? ((bossIndex + 1) / totalBoss) * 100
              : 100;

  const roundLabel =
    round === 1
      ? "ROUND 1 · 情绪扫描"
      : round === 2
        ? "ROUND 2 · 舆情雷达"
        : "ROUND 3 · FOMO 火箭";

  return (
    <main className="h-[100dvh] overflow-hidden bg-gradient-to-b from-[#e7f1ff] via-[#f5efff] to-[#ffe7f5] p-3 text-[#3a3a48]">
      <div className="mx-auto flex h-full w-full max-w-md flex-col gap-2">
        {/* 顶部状态栏 */}
        <header className="shrink-0 rounded-[22px] border border-[#d9c9ef] bg-white/80 px-3 py-2.5 text-[#655f78] shadow-[0_12px_35px_rgba(141,116,180,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onBack?.()}
              className="rounded-full border border-[#d9c9ef] bg-white px-3 py-1.5 text-[10px] font-bold text-[#87689b] shadow-sm"
            >
              ← 金融华尔界
            </button>
            <div className="text-center">
              <p className="text-[8px] font-black tracking-[0.18em] text-[#c36fa8]">
                SENTIMENT LAB
              </p>
              <p className="text-sm font-black">情绪实验室 · 星浪科技</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-[#c36fa8]">{roundLabel}</p>
              <div className="mt-0.5 flex gap-0.5">
                {[0, 1, 2].map((heart) => (
                  <span
                    key={heart}
                    className={`text-base ${
                      heart < lives ? "opacity-100" : "grayscale opacity-25"
                    }`}
                  >
                    💗
                  </span>
                ))}
              </div>
            </div>
          </div>
          {!gameOver && !gameCleared && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[9px] font-bold text-[#87689b]">
                <span>{taskText}</span>
                <span>
                  {round === 1
                    ? `${moodIndex + 1}/${totalMoodItems}`
                    : round === 2
                      ? `${selectedSignals.length}/2`
                      : fomoPhase === "flight"
                        ? `${flightIndex + 1}/${totalFlight}`
                        : fomoPhase === "afterChase"
                          ? `${chaseIndex + 1}/${totalChase}`
                          : fomoPhase === "boss"
                            ? `${bossIndex + 1}/${totalBoss}`
                            : ""}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#efe6ff]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#a78bfa] via-[#f472b6] to-[#60a5fa] transition-all duration-300"
                  style={{ width: `${roundProgress}%` }}
                />
              </div>
            </div>
          )}
        </header>

        {/* 游戏内容区 */}
        <section className="min-h-0 flex-1 overflow-hidden rounded-[26px] border-[3px] border-[#d9c9ef] bg-white/90 p-3 shadow-[0_20px_60px_rgba(141,116,180,0.10)] backdrop-blur">
          <div className="flex h-full flex-col">
            {/* 游戏结束 */}
            {gameOver && !gameCleared && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="text-5xl">💔</div>
                <p className="mt-2 text-[10px] font-black tracking-[0.18em] text-[#f0adc5]">
                  GAME OVER
                </p>
                <h2 className="mt-1 text-2xl font-black text-[#b45e8e]">
                  情绪失控
                </h2>
                <p className="mt-3 max-w-xs text-sm leading-6 text-[#655f78]">
                  三颗心已经耗尽。重新感受市场情绪的波动再试一次。
                </p>
                <button
                  type="button"
                  onClick={resetGame}
                  className="mt-5 w-full max-w-xs rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#f472b6] py-3 font-bold text-white shadow-lg"
                >
                  再挑战一次 💗💗💗
                </button>
              </div>
            )}

            {/* 通关完成 */}
            {gameCleared && round3Complete && (
              <div className="flex h-full flex-col justify-center">
                <div className="text-center">
                  <div className="text-5xl"></div>
                  <p className="mt-2 text-[10px] font-black tracking-[0.16em] text-[#8cc9ef]">
                    CASE CLOSED
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#4f86ad]">
                    情绪观察完成
                  </h2>
                </div>
                <AgentMessage>
                  你成功识别了市场情绪的变化，理解了 FOMO 的运作方式，并在压力下做出了理性判断。
                  这正是成熟投资者最重要的能力之一。
                </AgentMessage>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => onComplete?.()}
                    className="w-full rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#f472b6] py-3 font-bold text-white shadow-lg"
                  >
                    完成挑战，返回市场天气谷 →
                  </button>
                  <button
                    type="button"
                    onClick={resetGame}
                    className="w-full rounded-xl border border-[#d9c9ef] py-2.5 font-semibold text-[#87689b]"
                  >
                    再挑战一次
                  </button>
                </div>
              </div>
            )}

            {/* Round 1 */}
            {!gameOver && !gameCleared && round === 1 && (
              <div className="flex h-full flex-col">
                <div className="shrink-0 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black tracking-[0.15em] text-[#c36fa8]">
                      ROUND 1 · 情绪扫描
                    </p>
                    <h2 className="text-base font-black">判断信息情绪</h2>
                  </div>
                  <span className="rounded-full bg-[#efe6ff] px-3 py-1 text-[10px] font-black text-[#87689b]">
                    {moodIndex + 1}/{totalMoodItems}
                  </span>
                </div>

                <div className="mt-3 rounded-[18px] border border-[#d9c9ef] bg-[#faf5ff] p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{currentItem.icon}</span>
                    <div>
                      <p className="text-[9px] font-bold text-[#87689b]">
                        {currentItem.source}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-[#3a3a48]">
                        {currentItem.text}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(Object.keys(moodMeta) as Mood[]).map((mood) => {
                    const active = selectedMood === mood;
                    const meta = moodMeta[mood];
                    return (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => handleMoodSelect(mood)}
                        className={`flex flex-col items-center rounded-[16px] border-2 p-3 transition ${
                          active
                            ? meta.activeClass
                            : "border-[#d9c9ef] bg-white text-[#87689b]"
                        }`}
                      >
                        <span className="text-2xl">{meta.icon}</span>
                        <span className="mt-1 text-[10px] font-black">
                          {meta.label}
                        </span>
                        <span className="text-[8px] font-bold opacity-60">
                          {meta.english}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {showFeedback && selectedMood && (
                  <div
                    className={`mt-3 rounded-[16px] border p-3 ${
                      selectedMood === currentItem.correct
                        ? "border-[#8cc9ef] bg-[#e7f5ff]"
                        : "border-[#f0adc5] bg-[#fff2f7]"
                    }`}
                  >
                    <p className="text-[10px] font-black">
                      {selectedMood === currentItem.correct
                        ? "✅ 正确！"
                        : "💔 再想想"}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-[#655f78]">
                      {currentItem.explanation}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!selectedMood || showFeedback}
                  onClick={handleMoodSubmit}
                  className="mt-auto rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#f472b6] py-2.5 text-sm font-black text-white shadow-lg disabled:opacity-40"
                >
                  提交判断
                </button>
              </div>
            )}

            {/* Round 2 */}
            {!gameOver && !gameCleared && round === 2 && (
              <div className="flex h-full flex-col">
                <div className="shrink-0 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black tracking-[0.15em] text-[#c36fa8]">
                      ROUND 2 · 舆情雷达
                    </p>
                    <h2 className="text-base font-black">找出异动信号</h2>
                  </div>
                  <span className="rounded-full bg-[#efe6ff] px-3 py-1 text-[10px] font-black text-[#87689b]">
                    选 2 条
                  </span>
                </div>

                <div className="mt-3 grid flex-1 gap-2">
                  {radarItems.map((item) => {
                    const active = selectedSignals.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleSignal(item.id)}
                        className={`flex items-center rounded-[16px] border-2 px-4 py-3 text-left transition ${
                          active
                            ? "border-[#f0adc5] bg-[#fff2f7] shadow-[0_0_20px_rgba(240,150,200,0.20)]"
                            : "border-[#d9c9ef] bg-white"
                        }`}
                      >
                        <span className="mr-3 text-xl">{item.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-bold text-[#87689b]">
                            {item.source}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-4 text-[#3a3a48]">
                            {item.text}
                          </p>
                        </div>
                        {active && (
                          <span className="ml-2 text-[#f0adc5]">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {round2Wrong && (
                  <p className="mt-2 shrink-0 text-center text-[9px] font-bold text-[#f0adc5]">
                    💔 再观察一下，哪些是真正的异动信号？
                  </p>
                )}

                <button
                  type="button"
                  disabled={selectedSignals.length !== 2}
                  onClick={handleRound2Submit}
                  className="mt-2 shrink-0 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#f472b6] py-2.5 text-sm font-black text-white shadow-lg disabled:opacity-40"
                >
                  提交信号 · {selectedSignals.length}/2
                </button>
              </div>
            )}

            {/* Round 3 - FOMO 火箭 */}
            {!gameOver && !gameCleared && round === 3 && (
              <div className="flex h-full flex-col">
                {/* Flight 阶段 */}
                {fomoPhase === "flight" && (
                  <div className="flex h-full flex-col">
                    <div className="shrink-0">
                      <p className="text-[9px] font-black tracking-[0.15em] text-[#c36fa8]">
                        ROUND 3 · FOMO 火箭
                      </p>
                      <h2 className="text-base font-black">感受市场升温</h2>
                    </div>
                    <div className="mt-3 flex flex-1 flex-col items-center justify-center">
                      <div className="text-6xl">🚀</div>
                      <div className="mt-4 w-full rounded-[18px] border border-[#d9c9ef] bg-[#faf5ff] p-4 text-center">
                        <p className="text-2xl font-black text-[#a78bfa]">
                          {openingFlight[flightIndex].gain}
                        </p>
                        <p className="mt-1 text-[10px] text-[#87689b]">
                          搜索热度 {openingFlight[flightIndex].heat}
                        </p>
                        <p className="mt-2 text-[11px] text-[#655f78]">
                          {openingFlight[flightIndex].feed}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (flightIndex + 1 < totalFlight) {
                          setFlightIndex((i) => i + 1);
                        } else {
                          setFomoPhase("temptation");
                        }
                      }}
                      className="mt-2 shrink-0 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#f472b6] py-2.5 text-sm font-black text-white shadow-lg"
                    >
                      {flightIndex + 1 < totalFlight ? "继续观察 →" : "做出选择 →"}
                    </button>
                  </div>
                )}

                {/* Temptation 阶段 */}
                {fomoPhase === "temptation" && !fomoChoice && (
                  <div className="flex h-full flex-col">
                    <div className="shrink-0">
                      <p className="text-[9px] font-black tracking-[0.15em] text-[#c36fa8]">
                        做出你的选择
                      </p>
                      <h2 className="text-base font-black">现在怎么做？</h2>
                    </div>
                    <div className="mt-3 grid flex-1 grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleFomoChoice("chase")}
                        className="flex flex-col items-center rounded-[20px] border-2 border-[#f0adc5] bg-[#fff2f7] p-4 shadow-lg transition hover:scale-[1.02]"
                      >
                        <span className="text-4xl"></span>
                        <span className="mt-2 text-sm font-black text-[#b45e8e]">
                          现在上车
                        </span>
                        <span className="mt-1 text-[9px] text-[#87689b]">
                          追涨买入
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFomoChoice("wait")}
                        className="flex flex-col items-center rounded-[20px] border-2 border-[#8cc9ef] bg-[#e7f5ff] p-4 shadow-lg transition hover:scale-[1.02]"
                      >
                        <span className="text-4xl">👀</span>
                        <span className="mt-2 text-sm font-black text-[#4f86ad]">
                          继续观察
                        </span>
                        <span className="mt-1 text-[9px] text-[#87689b]">
                          保持观望
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 追涨后走势 */}
                {fomoPhase === "afterChase" && (
                  <div className="flex h-full flex-col">
                    <div className="shrink-0">
                      <p className="text-[9px] font-black tracking-[0.15em] text-[#c36fa8]">
                        追涨后
                      </p>
                      <h2 className="text-base font-black">观察走势</h2>
                    </div>
                    <div className="mt-3 flex flex-1 flex-col items-center justify-center">
                      <div className="w-full rounded-[18px] border border-[#d9c9ef] bg-[#faf5ff] p-4 text-center">
                        <p className="text-2xl font-black text-[#a78bfa]">
                          {chaseSequence[chaseIndex].gain}
                        </p>
                        <p className="mt-1 text-[10px] text-[#87689b]">
                          热度 {chaseSequence[chaseIndex].heat}
                        </p>
                        <p className="mt-2 text-[11px] text-[#655f78]">
                          {chaseSequence[chaseIndex].label}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (chaseIndex + 1 < totalChase) {
                          setChaseIndex((i) => i + 1);
                        } else {
                          setFomoPhase("reflection");
                        }
                      }}
                      className="mt-2 shrink-0 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#f472b6] py-2.5 text-sm font-black text-white shadow-lg"
                    >
                      {chaseIndex + 1 < totalChase ? "继续 →" : "反思 →"}
                    </button>
                  </div>
                )}

                {/* 追涨后反思 */}
                {fomoPhase === "reflection" && (
                  <div className="flex h-full flex-col">
                    <div className="shrink-0">
                      <p className="text-[9px] font-black tracking-[0.15em] text-[#c36fa8]">
                        反思
                      </p>
                      <h2 className="text-base font-black">
                        你为什么会追涨？
                      </h2>
                    </div>
                    <div className="mt-3 grid flex-1 gap-2">
                      {(
                        [
                          {
                            id: "logic",
                            text: "我觉得基本面确实好",
                            icon: "",
                          },
                          {
                            id: "fomo",
                            text: "看到别人赚钱我急了",
                            icon: "",
                          },
                          {
                            id: "trend",
                            text: "趋势看起来很强",
                            icon: "",
                          },
                        ] as { id: ReflectionChoice; text: string; icon: string }[]
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleReflection(opt.id)}
                          className={`flex items-center rounded-[16px] border-2 px-4 py-3 text-left transition ${
                            reflectionChoice === opt.id
                              ? opt.id === "fomo"
                                ? "border-[#f0adc5] bg-[#fff2f7]"
                                : "border-[#8cc9ef] bg-[#e7f5ff]"
                              : "border-[#d9c9ef] bg-white"
                          }`}
                        >
                          <span className="mr-3 text-xl">{opt.icon}</span>
                          <span className="text-[11px] font-bold text-[#3a3a48]">
                            {opt.text}
                          </span>
                        </button>
                      ))}
                    </div>
                    {round3Wrong && (
                      <p className="mt-2 shrink-0 text-center text-[9px] font-bold text-[#f0adc5]">
                        💔 再想想，真正驱动你的是情绪还是理性？
                      </p>
                    )}
                  </div>
                )}

                {/* 观望压力 */}
                {fomoPhase === "waitPressure" && !waitReflectionChoice && (
                  <div className="flex h-full flex-col">
                    <div className="shrink-0">
                      <p className="text-[9px] font-black tracking-[0.15em] text-[#c36fa8]">
                        观望的压力
                      </p>
                      <h2 className="text-base font-black">
                        +{waitPressureScene.gain}
                      </h2>
                    </div>
                    <div className="mt-3 rounded-[18px] border border-[#d9c9ef] bg-[#faf5ff] p-4">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div>
                          <p className="text-[9px] text-[#87689b]">热度</p>
                          <p className="text-lg font-black text-[#a78bfa]">
                            {waitPressureScene.heat}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#87689b]">FOMO</p>
                          <p className="text-lg font-black text-[#f0adc5]">
                            {waitPressureScene.fomo}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {waitPressureScene.feed.map((f, i) => (
                          <p key={i} className="text-[11px] text-[#655f78]">
                            {f}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 grid flex-1 gap-2">
                      {(
                        [
                          {
                            id: "regret",
                            text: "后悔没早点买",
                            icon: "😢",
                          },
                          {
                            id: "fundamental",
                            text: "冷静分析基本面",
                            icon: "📊",
                          },
                          {
                            id: "safe",
                            text: "没买就没风险",
                            icon: "️",
                          },
                        ] as {
                          id: WaitReflectionChoice;
                          text: string;
                          icon: string;
                        }[]
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleWaitReflection(opt.id)}
                          className={`flex items-center rounded-[16px] border-2 px-4 py-3 text-left transition ${
                            waitReflectionChoice === opt.id
                              ? opt.id === "regret"
                                ? "border-[#f0adc5] bg-[#fff2f7]"
                                : "border-[#8cc9ef] bg-[#e7f5ff]"
                              : "border-[#d9c9ef] bg-white"
                          }`}
                        >
                          <span className="mr-3 text-xl">{opt.icon}</span>
                          <span className="text-[11px] font-bold text-[#3a3a48]">
                            {opt.text}
                          </span>
                        </button>
                      ))}
                    </div>
                    {round3Wrong && (
                      <p className="mt-2 shrink-0 text-center text-[9px] font-bold text-[#f0adc5]">
                         这是 FOMO 的典型反应，再想想
                      </p>
                    )}
                  </div>
                )}

                {/* FOMO 概念教学 */}
                {fomoPhase === "concept" && (
                  <div className="flex h-full flex-col">
                    <div className="shrink-0">
                      <p className="text-[9px] font-black tracking-[0.15em] text-[#c36fa8]">
                        FOMO 是什么
                      </p>
                      <h2 className="text-base font-black">
                        Fear of Missing Out
                      </h2>
                    </div>
                    <div className="mt-3 rounded-[18px] border border-[#d9c9ef] bg-[#faf5ff] p-4">
                      <p className="text-[11px] leading-5 text-[#655f78]">
                        <span className="font-black text-[#a78bfa]">
                          FOMO（错失恐惧）
                        </span>
                        是指看到别人获利时，害怕自己错过机会而产生的焦虑和冲动。
                        它会让人在高点追涨、在低点恐慌卖出。
                      </p>
                      <p className="mt-3 text-[11px] leading-5 text-[#655f78]">
                        <span className="font-black text-[#f0adc5]">
                          识别 FOMO 的方法：
                        </span>
                        问自己"如果没人讨论这只股票，我还会买吗？"如果答案是否定的，那可能就是 FOMO 在驱动你。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFomoPhase("boss")}
                      className="mt-auto rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#f472b6] py-2.5 text-sm font-black text-white shadow-lg"
                    >
                      进入 Boss 关 →
                    </button>
                  </div>
                )}

                {/* Boss 关 */}
                {fomoPhase === "boss" && !bossChoice && (
                  <div className="flex h-full flex-col">
                    <div className="shrink-0">
                      <p className="text-[9px] font-black tracking-[0.15em] text-[#c36fa8]">
                        BOSS 关
                      </p>
                      <h2 className="text-base font-black">社区狂热</h2>
                    </div>
                    <div className="mt-3 rounded-[18px] border border-[#f0adc5] bg-[#fff2f7] p-4">
                      <div className="space-y-2">
                        {bossFeed.slice(0, bossIndex + 1).map((f, i) => (
                          <p key={i} className="text-[11px] text-[#b45e8e]">
                            {f}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 grid flex-1 gap-2">
                      {(
                        [
                          {
                            id: "chase",
                            text: "跟着冲！",
                            icon: "🔥",
                          },
                          {
                            id: "wait",
                            text: "再等等看",
                            icon: "⏳",
                          },
                          {
                            id: "evidence",
                            text: "先看证据再决定",
                            icon: "🔍",
                          },
                        ] as { id: BossChoice; text: string; icon: string }[]
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleBoss(opt.id)}
                          className={`flex items-center rounded-[16px] border-2 px-4 py-3 text-left transition ${
                            bossChoice === opt.id
                              ? opt.id === "evidence"
                                ? "border-[#8cc9ef] bg-[#e7f5ff]"
                                : "border-[#f0adc5] bg-[#fff2f7]"
                              : "border-[#d9c9ef] bg-white"
                          }`}
                        >
                          <span className="mr-3 text-xl">{opt.icon}</span>
                          <span className="text-[11px] font-bold text-[#3a3a48]">
                            {opt.text}
                          </span>
                        </button>
                      ))}
                    </div>
                    {bossWrong && (
                      <p className="mt-2 shrink-0 text-center text-[9px] font-bold text-[#f0adc5]">
                        💔 在狂热中保持冷静，先看证据
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={!bossChoice}
                      onClick={() => {
                        if (bossChoice === "evidence") {
                          setFomoPhase("evidence");
                        }
                      }}
                      className="mt-2 shrink-0 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#f472b6] py-2.5 text-sm font-black text-white shadow-lg disabled:opacity-40"
                    >
                      确认选择
                    </button>
                  </div>
                )}

                {/* 证据判断 */}
                {fomoPhase === "evidence" && (
                  <div className="flex h-full flex-col">
                    <div className="shrink-0">
                      <p className="text-[9px] font-black tracking-[0.15em] text-[#c36fa8]">
                        最终判断
                      </p>
                      <h2 className="text-base font-black">
                        你会依据什么做决策？
                      </h2>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {evidenceCards.map((card) => (
                        <div
                          key={card.title}
                          className={`rounded-[14px] border p-3 text-center ${
                            card.tone === "hot"
                              ? "border-[#f0adc5] bg-[#fff2f7]"
                              : card.tone === "warning"
                                ? "border-[#f5c56a] bg-[#fff8e7]"
                                : "border-[#8cc9ef] bg-[#e7f5ff]"
                          }`}
                        >
                          <span className="text-xl">{card.icon}</span>
                          <p className="mt-1 text-[9px] font-bold text-[#87689b]">
                            {card.title}
                          </p>
                          <p className="mt-0.5 text-[10px] font-black text-[#3a3a48]">
                            {card.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid flex-1 gap-2">
                      {(
                        [
                          {
                            id: "fundamental",
                            text: "基于基本面分析",
                            icon: "📊",
                          },
                          {
                            id: "price-sentiment",
                            text: "基于价格和情绪",
                            icon: "📈",
                          },
                          {
                            id: "valuation",
                            text: "基于估值水平",
                            icon: "💰",
                          },
                        ] as {
                          id: EvidenceChoice;
                          text: string;
                          icon: string;
                        }[]
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleEvidence(opt.id)}
                          className={`flex items-center rounded-[16px] border-2 px-4 py-3 text-left transition ${
                            evidenceChoice === opt.id
                              ? opt.id === "fundamental"
                                ? "border-[#8cc9ef] bg-[#e7f5ff]"
                                : "border-[#f0adc5] bg-[#fff2f7]"
                              : "border-[#d9c9ef] bg-white"
                          }`}
                        >
                          <span className="mr-3 text-xl">{opt.icon}</span>
                          <span className="text-[11px] font-bold text-[#3a3a48]">
                            {opt.text}
                          </span>
                        </button>
                      ))}
                    </div>
                    {evidenceWrong && (
                      <p className="mt-2 shrink-0 text-center text-[9px] font-bold text-[#f0adc5]">
                        💔 理性投资者应该基于基本面做决策
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <p className="shrink-0 text-center text-[8px] font-bold text-[#b8a8d0]">
          训练案例仅用于学习市场情绪分析，不构成投资建议。
        </p>
      </div>
    </main>
  );
}
