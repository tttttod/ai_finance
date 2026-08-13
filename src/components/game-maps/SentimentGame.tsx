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
      "“彻底崩了”“完了”这类表达带有明显的灾难化和恐慌情绪。",
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
      "“不可能跌”“不上车就晚了”是典型的狂热和追涨情绪。",
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
    icon: "⚠️",
    text: "赶紧跑！我身边的人都在清仓，再不卖就来不及了！",
    correct: "panic",
    explanation:
      "“赶紧跑”“来不及了”体现了强烈的群体恐慌和逃离情绪。",
  },
];

const radarItems: RadarItem[] = [
  {
    id: "search",
    icon: "📈",
    source: "搜索热度",
    text: "“星浪科技”24 小时搜索热度上涨 386%",
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
    icon: "🔥",
    source: "投资社区",
    text: "“满仓冲！”“这次绝对不会跌！”等评论开始大量刷屏",
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
  { gain: "+3.2%", heat: 28, feed: "💬 ‘今天有点强诶。’" },
  { gain: "+6.8%", heat: 39, feed: "📈 热门讨论排名升至 Top 50" },
  { gain: "+10.5%", heat: 51, feed: "🔥 ‘是不是要突破了？’" },
  { gain: "+12.8%", heat: 61, feed: "💬 ‘我刚买就赚了！’" },
  { gain: "+15.7%", heat: 70, feed: "🚀 ‘还没上车的人真能忍。’" },
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
    "🚀 ‘又涨了！刚才没买的人是不是后悔了？’",
    "💬 ‘我朋友已经赚 18% 了！’",
    "🔥 ‘现在不上车，下一站可能就是 +30%！’",
  ],
};

const bossFeed = [
  "🚀 ‘起飞！！！今天不可能回头了！’",
  "🔥 ‘满仓！这种机会一辈子就一次！’",
  "💬 ‘你还在分析？别人已经赚钱了！’",
  "📣 ‘最后上车机会！’",
  "⚡ ‘目标价至少再翻倍！’",
  "😵 ‘不买真的会后悔！’",
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
    icon: "🔥",
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
    icon: "😐",
    activeClass:
      "border-[#c7b9ec] bg-[#f3efff] text-[#75649b] shadow-[0_0_24px_rgba(180,160,230,0.20)]",
  },

  hype: {
    label: "狂热",
    english: "HYPE",
    icon: "🔥",
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

export default function SentimentGame({
  onBack,
  onComplete,
}: SentimentGameProps) {
  const [round, setRound] = useState<Round>(1);

  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  /* ---------------------------
     ROUND 1
     --------------------------- */

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const [moodFeedback, setMoodFeedback] = useState<
    "correct" | "wrong" | null
  >(null);

  const [round1Complete, setRound1Complete] = useState(false);

  const currentItem = moodItems[currentIndex];

  /* ---------------------------
     ROUND 2
     --------------------------- */

  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [radarWrong, setRadarWrong] = useState(false);
  const [round2Complete, setRound2Complete] = useState(false);

  /* ---------------------------
     ROUND 3
     --------------------------- */

  const [fomoPhase, setFomoPhase] = useState<FomoPhase>("flight");
  const [flightTick, setFlightTick] = useState(0);
  const [chaseTick, setChaseTick] = useState(0);
  const [firstAction, setFirstAction] = useState<"chase" | "wait" | null>(null);
  const [reflectionChoice, setReflectionChoice] = useState<ReflectionChoice | null>(null);
  const [reflectionWrong, setReflectionWrong] = useState(false);
  const [waitReflectionChoice, setWaitReflectionChoice] =
    useState<WaitReflectionChoice | null>(null);
  const [waitReflectionWrong, setWaitReflectionWrong] = useState(false);
  const [bossChoice, setBossChoice] = useState<BossChoice | null>(null);
  const [bossWrong, setBossWrong] = useState(false);
  const [evidenceChoice, setEvidenceChoice] = useState<EvidenceChoice | null>(null);
  const [evidenceWrong, setEvidenceWrong] = useState(false);
  const [round3Complete, setRound3Complete] = useState(false);

  const correctSignalIds = radarItems
    .filter((item) => item.isSignal)
    .map((item) => item.id);

  /* ===========================
     通用扣命
     =========================== */

  function loseLife() {
    const nextLives = lives - 1;

    setLives(nextLives);

    if (nextLives <= 0) {
      setGameOver(true);
    }
  }

  /* ===========================
     ROUND 1 FUNCTION
     =========================== */

  function handleMoodSelect(mood: Mood) {
    if (
      moodFeedback ||
      gameOver ||
      round1Complete
    ) {
      return;
    }

    setSelectedMood(mood);
  }

  function submitMoodAnswer() {
    if (
      !selectedMood ||
      moodFeedback ||
      gameOver ||
      round1Complete
    ) {
      return;
    }

    if (selectedMood === currentItem.correct) {
      setMoodFeedback("correct");
      return;
    }

    loseLife();
    setMoodFeedback("wrong");
  }

  function retryMood() {
    if (gameOver) return;

    setSelectedMood(null);
    setMoodFeedback(null);
  }

  function goNextMood() {
    if (moodFeedback !== "correct") return;

    if (currentIndex === moodItems.length - 1) {
      setRound1Complete(true);
      setSelectedMood(null);
      setMoodFeedback(null);
      return;
    }

    setCurrentIndex((prev) => prev + 1);

    setSelectedMood(null);
    setMoodFeedback(null);
  }

  function enterRound2() {
    setRound(2);
    setRound1Complete(false);
  }

  /* ===========================
     ROUND 2 FUNCTION
     =========================== */

  function toggleSignal(id: string) {
    if (
      gameOver ||
      round2Complete
    ) {
      return;
    }

    setRadarWrong(false);

    setSelectedSignals((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      if (prev.length >= 2) {
        return prev;
      }

      return [...prev, id];
    });
  }

  function submitRadar() {
    if (selectedSignals.length !== 2) return;

    const correct =
      selectedSignals.length === correctSignalIds.length &&
      correctSignalIds.every((id) =>
        selectedSignals.includes(id),
      );

    if (correct) {
      setRound2Complete(true);
      setRadarWrong(false);
      return;
    }

    loseLife();

    setRadarWrong(true);
    setSelectedSignals([]);
  }

  /* ===========================
     ROUND 3 FUNCTION
     =========================== */

  function enterRound3() {
    setRound(3);
    setRound2Complete(false);
    setFomoPhase("flight");
    setFlightTick(0);
    setChaseTick(0);
    setFirstAction(null);
    setReflectionChoice(null);
    setReflectionWrong(false);
    setWaitReflectionChoice(null);
    setWaitReflectionWrong(false);
    setBossChoice(null);
    setBossWrong(false);
    setEvidenceChoice(null);
    setEvidenceWrong(false);
    setRound3Complete(false);
  }

  function chooseFirstAction(action: "chase" | "wait") {
    setFirstAction(action);
    setReflectionWrong(false);

    if (action === "chase") {
      setChaseTick(0);
      setFomoPhase("afterChase");
    } else {
      setWaitReflectionChoice(null);
      setWaitReflectionWrong(false);
      setFomoPhase("waitPressure");
    }
  }

  function submitWaitReflection() {
    if (!waitReflectionChoice) return;

    if (waitReflectionChoice === "regret") {
      setWaitReflectionWrong(false);
      setFomoPhase("concept");
      return;
    }

    loseLife();
    setWaitReflectionWrong(true);
    setWaitReflectionChoice(null);
  }

  function submitReflection() {
    if (!reflectionChoice) return;

    if (reflectionChoice === "fomo") {
      setReflectionWrong(false);
      setFomoPhase("concept");
      return;
    }

    loseLife();
    setReflectionWrong(true);
    setReflectionChoice(null);
  }

  function enterBoss() {
    setBossChoice(null);
    setBossWrong(false);
    setFomoPhase("boss");
  }

  function submitBossChoice() {
    if (!bossChoice) return;

    if (bossChoice === "evidence") {
      setBossWrong(false);
      setFomoPhase("evidence");
      return;
    }

    loseLife();
    setBossWrong(true);
    setBossChoice(null);
  }

  function submitEvidenceChoice() {
    if (!evidenceChoice) return;

    if (evidenceChoice === "price-sentiment") {
      setEvidenceWrong(false);
      setRound3Complete(true);
      return;
    }

    loseLife();
    setEvidenceWrong(true);
    setEvidenceChoice(null);
  }

  useEffect(() => {
    if (round !== 3 || gameOver || round3Complete) return;

    if (fomoPhase === "flight") {
      if (flightTick >= openingFlight.length - 1) {
        const timer = window.setTimeout(() => setFomoPhase("temptation"), 850);
        return () => window.clearTimeout(timer);
      }

      const timer = window.setTimeout(
        () => setFlightTick((prev) => prev + 1),
        900,
      );
      return () => window.clearTimeout(timer);
    }

    if (fomoPhase === "afterChase") {
      if (chaseTick >= chaseSequence.length - 1) {
        const timer = window.setTimeout(() => setFomoPhase("reflection"), 1100);
        return () => window.clearTimeout(timer);
      }

      const timer = window.setTimeout(
        () => setChaseTick((prev) => prev + 1),
        900,
      );
      return () => window.clearTimeout(timer);
    }
  }, [round, gameOver, round3Complete, fomoPhase, flightTick, chaseTick]);

  /* ===========================
     RESET
     =========================== */

  function resetGame() {
    setRound(1);

    setLives(3);
    setGameOver(false);

    setCurrentIndex(0);
    setSelectedMood(null);
    setMoodFeedback(null);
    setRound1Complete(false);

    setSelectedSignals([]);
    setRadarWrong(false);
    setRound2Complete(false);

    setFomoPhase("flight");
    setFlightTick(0);
    setChaseTick(0);
    setFirstAction(null);
    setReflectionChoice(null);
    setReflectionWrong(false);
    setWaitReflectionChoice(null);
    setWaitReflectionWrong(false);
    setBossChoice(null);
    setBossWrong(false);
    setEvidenceChoice(null);
    setEvidenceWrong(false);
    setRound3Complete(false);
  }

  /* ===========================
     进度
     =========================== */

  const round1Progress =
    ((currentIndex + (moodFeedback === "correct" ? 1 : 0)) /
      moodItems.length) *
    100;

  const overallRound =
    round === 1 ? "ROUND 1 / 3" : round === 2 ? "ROUND 2 / 3" : "ROUND 3 / 3";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#eef7ff] via-[#f7f1ff] to-[#fff0f8] px-4 py-8 text-[#504a68]">
      <div className="mx-auto w-full max-w-md">
        {/* =====================================================
            TOP HUD
            ===================================================== */}

        <section className="rounded-[26px] border border-[#dacff0] bg-white/75 p-4 shadow-[0_18px_50px_rgba(150,125,185,0.14)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black tracking-[0.22em] text-[#c26fa7]">
                SENTIMENT AGENT
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#514a6b]">
                市场情绪实验室
              </h1>

              <p className="mt-1 text-xs font-bold text-[#9a8cae]">
                {overallRound}
              </p>
            </div>

            {/* 红心 */}
            <div className="text-right">
              <p className="text-[9px] font-bold tracking-[0.16em] text-[#a291ad]">
                EMOTION ENERGY
              </p>

              <div className="mt-1 flex justify-end gap-1">
                {[0, 1, 2].map((heart) => (
                  <span
                    key={heart}
                    className={`text-xl transition-all ${
                      heart < lives
                        ? "scale-100 opacity-100"
                        : "scale-90 grayscale opacity-20"
                    }`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Round 总进度 */}
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-[10px] font-bold text-[#a397b4]">
              <span>MISSION PROGRESS</span>

              <span>
                {round === 1
                  ? "情绪扫描"
                  : round === 2
                    ? "舆情雷达"
                    : "FOMO 火箭"}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#ebe5f5]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8ecdf2] via-[#b59cf0] to-[#ef9ac9] transition-all duration-500"
                style={{
                  width:
                    round === 1
                      ? `${Math.max(8, round1Progress * 0.33)}%`
                      : round === 2
                        ? round2Complete
                          ? "66%"
                          : "52%"
                        : round3Complete
                          ? "100%"
                          : fomoPhase === "flight" || fomoPhase === "temptation"
                            ? "72%"
                            : fomoPhase === "afterChase" ||
                                fomoPhase === "waitPressure" ||
                                fomoPhase === "reflection"
                              ? "80%"
                              : fomoPhase === "concept"
                                ? "86%"
                                : fomoPhase === "boss"
                                  ? "92%"
                                  : "96%",
                }}
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            GAME OVER
            ===================================================== */}

        {gameOver && (
          <>
            <AgentMessage alert>
              “市场里的声音太吵了。没关系，真正的情绪判断需要练习。重新来一次，这次先分清事实和情绪。”
            </AgentMessage>

            <section className="mt-5 rounded-[30px] border-2 border-[#efa9c4] bg-[#fff2f7] p-6 text-center shadow-[0_18px_45px_rgba(230,140,180,0.15)]">
              <div className="text-5xl">
                💔
              </div>

              <p className="mt-3 text-[11px] font-black tracking-[0.2em] text-[#cf6e99]">
                EMOTION OVERLOAD
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#68516b]">
                情绪失控
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#8a7187]">
                三颗情绪能量已经耗尽。
              </p>

              <button
                type="button"
                onClick={resetGame}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#8ccaf0] via-[#b099e9] to-[#e88fbd] py-4 font-black text-white shadow-[0_12px_30px_rgba(190,140,200,0.25)]"
              >
                重新进入情绪实验室 ❤️❤️❤️
              </button>
            </section>
          </>
        )}

        {/* =====================================================
            ROUND 1
            ===================================================== */}

        {!gameOver &&
          round === 1 &&
          !round1Complete && (
            <>
              <AgentMessage>
                “第一步很简单。先别判断市场会涨还是跌——听听这些话本身是什么情绪。”
              </AgentMessage>

              {/* Round 标题 */}
              <section className="mt-5 rounded-[24px] border border-[#d8d3ee] bg-white/65 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.18em] text-[#a58bc1]">
                      ROUND 1
                    </p>

                    <p className="mt-1 font-black text-[#5e5776]">
                      情绪扫描 · MOOD SCAN
                    </p>
                  </div>

                  <div className="rounded-full bg-[#f4e7f5] px-3 py-1 text-xs font-black text-[#ba6d9e]">
                    {currentIndex + 1} / {moodItems.length}
                  </div>
                </div>

                {/* 消息卡片 */}
                <div className="mt-4 rounded-[22px] border-2 border-[#e2daf0] bg-white p-4 text-center shadow-[0_8px_20px_rgba(150,125,185,0.08)]">
                  <div className="text-xs font-bold tracking-[0.1em] text-[#b09bc0]">
                    <span>{currentItem.source}</span>
                    <span className="ml-1">{currentItem.icon}</span>
                  </div>

                  <p className="mt-2 text-lg font-black leading-7 text-[#4d4564]">
                    {currentItem.text}
                  </p>
                </div>

                {/* 情绪判断按钮 */}
                <p className="mt-4 text-[11px] font-black text-[#7a6e89]">
                  这条信息属于哪种情绪？
                </p>

                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(Object.entries(moodMeta) as [Mood, typeof moodMeta[Mood]][]).map(
                    ([key, meta]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleMoodSelect(key)}
                        className={`rounded-2xl border-2 py-3 text-center transition-all duration-200 ${
                          selectedMood === key
                            ? meta.activeClass
                            : "border-[#e4daf0] bg-white text-[#8f819e] hover:border-[#cdbde0]"
                        }`}
                      >
                        <div className="text-2xl">{meta.icon}</div>

                        <p className="mt-1 text-[11px] font-black">
                          {meta.label}
                        </p>
                      </button>
                    ),
                  )}
                </div>

                {/* 提交按钮 */}
                {!moodFeedback && (
                  <button
                    type="button"
                    disabled={!selectedMood}
                    onClick={submitMoodAnswer}
                    className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#8ccaf0] via-[#b099e9] to-[#e88fbd] py-3.5 font-black text-white disabled:opacity-40 shadow-[0_8px_20px_rgba(180,140,200,0.18)]"
                  >
                    判断情绪
                  </button>
                )}

                {/* 正确反馈 */}
                {moodFeedback === "correct" && (
                  <div className="mt-4 rounded-[20px] border-2 border-[#bde0c5] bg-[#f0f9f2] p-4 text-center">
                    <div className="text-2xl">✅</div>

                    <p className="mt-1 text-xs font-black text-[#46945a]">
                      正确！
                    </p>

                    <p className="mt-1 text-xs font-bold text-[#5c8762]">
                      {currentItem.explanation}
                    </p>

                    <button
                      type="button"
                      onClick={goNextMood}
                      className="mt-3 w-full rounded-2xl bg-gradient-to-r from-[#6cd08a] to-[#52b875] py-2.5 font-black text-white shadow-[0_8px_20px_rgba(100,200,120,0.18)]"
                    >
                      {currentIndex === moodItems.length - 1
                        ? "完成情绪扫描"
                        : "下一题"}
                    </button>
                  </div>
                )}

                {/* 错误反馈 */}
                {moodFeedback === "wrong" &&
                  !gameOver && (
                    <div className="mt-4 rounded-[20px] border-2 border-[#f0c0c0] bg-[#fef0f0] p-4 text-center">
                      <div className="text-2xl">💔</div>

                      <p className="mt-1 text-xs font-black text-[#c45252]">
                        再想想看
                      </p>

                      <p className="mt-1 text-xs font-bold text-[#a55a5a]">
                        {currentItem.explanation}
                      </p>

                      <button
                        type="button"
                        onClick={retryMood}
                        className="mt-3 w-full rounded-2xl border-2 border-[#dba8a8] bg-white py-2.5 font-black text-[#b45858]"
                      >
                        再试一次
                      </button>
                    </div>
                  )}
              </section>
            </>
          )}

        {/* =====================================================
            ROUND 1 COMPLETE → ROUND 2 过渡
            ===================================================== */}

        {!gameOver &&
          round === 1 &&
          round1Complete && (
            <>
              <AgentMessage>
                “很好！你已经能识别情绪了。下一步把情绪放进市场里——哪些是真实信号，哪些只是噪音？”
              </AgentMessage>

              <section className="mt-5 rounded-[24px] border border-[#d8d3ee] bg-white/65 p-4 text-center">
                <div className="text-4xl">🎯</div>

                <p className="mt-2 text-xs font-bold tracking-[0.14em] text-[#a58bc1]">
                  ROUND 1 COMPLETE
                </p>

                <p className="mt-1 text-lg font-black text-[#5e5776]">
                  情绪扫描 —— 完成
                </p>

                <button
                  type="button"
                  onClick={enterRound2}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#8ccaf0] via-[#b099e9] to-[#e88fbd] py-3.5 font-black text-white shadow-[0_8px_20px_rgba(180,140,200,0.18)]"
                >
                  进入 Round 2 — 舆情雷达
                </button>
              </section>
            </>
          )}

        {/* =====================================================
            ROUND 2
            ===================================================== */}

        {!gameOver &&
          round === 2 &&
          !round2Complete && (
            <>
              <AgentMessage>
                “搜索热度飙升 + 社区沸腾，是情绪信号还是真实变化？从 5 条信息中选出 2 条你认为最值得关注的异动信号。”
              </AgentMessage>

              <section className="mt-5 rounded-[24px] border border-[#d8d3ee] bg-white/65 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.18em] text-[#a58bc1]">
                      ROUND 2
                    </p>

                    <p className="mt-1 font-black text-[#5e5776]">
                      舆情雷达 · MARKET RADAR
                    </p>
                  </div>

                  <span className="rounded-full bg-[#f4e7f5] px-3 py-1 text-xs font-black text-[#ba6d9e]">
                    选 {selectedSignals.length}/2
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {radarItems.map((item) => {
                    const active = selectedSignals.includes(item.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleSignal(item.id)}
                        className={`w-full rounded-[18px] border-2 p-3 text-left transition-all ${
                          active
                            ? "border-[#d594f0] bg-[#f7edff] shadow-[0_0_20px_rgba(200,140,240,0.15)]"
                            : "border-[#e4daf0] bg-white hover:border-[#cdbde0]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.icon}</span>

                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#b09bc0]">
                            {item.source}
                          </span>

                          {active && (
                            <span className="ml-auto text-xs font-black text-[#b757e0]">
                              ✓ 信号已标记
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm font-bold leading-5 text-[#4d4564]">
                          {item.text}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {radarWrong && !gameOver && (
                  <p className="mt-3 text-center text-xs font-bold text-[#c45252]">
                    💔 再想想：哪些是“值得关注的市场异动信号”，而不是普通的公司日常动态？
                  </p>
                )}

                <button
                  type="button"
                  disabled={selectedSignals.length !== 2}
                  onClick={submitRadar}
                  className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#8ccaf0] via-[#b099e9] to-[#e88fbd] py-3.5 font-black text-white disabled:opacity-40 shadow-[0_8px_20px_rgba(180,140,200,0.18)]"
                >
                  提交信号判断
                </button>
              </section>
            </>
          )}

        {/* =====================================================
            ROUND 2 COMPLETE → ROUND 3 过渡
            ===================================================== */}

        {!gameOver &&
          round === 2 &&
          round2Complete && (
            <>
              <AgentMessage alert>
                “情绪信号已经确认。现在，它们开始推动股价了——你准备好面对 FOMO 了吗？”
              </AgentMessage>

              <section className="mt-5 rounded-[24px] border border-[#d8d3ee] bg-white/65 p-4 text-center">
                <div className="text-4xl">📡</div>

                <p className="mt-2 text-xs font-bold tracking-[0.14em] text-[#a58bc1]">
                  ROUND 2 COMPLETE
                </p>

                <p className="mt-1 text-lg font-black text-[#5e5776]">
                  舆情雷达 —— 完成
                </p>

                <button
                  type="button"
                  onClick={enterRound3}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#f09ad9] via-[#e07bbd] to-[#cf64ab] py-3.5 font-black text-white shadow-[0_8px_20px_rgba(200,100,160,0.25)]"
                >
                  进入 Round 3 — FOMO 火箭 →
                </button>
              </section>
            </>
          )}

        {/* =====================================================
            ROUND 3
            ===================================================== */}

        {!gameOver && round === 3 && !round3Complete && (
          <>

            {/* =====================================================
                PHASE 1：起飞前
                ===================================================== */}

            {fomoPhase === "flight" && (
              <>
                <AgentMessage alert>
                  “股价正在快速拉升……市场情绪开始升温。你看到屏幕上的数字在不断跳动，周围的声音越来越响。”
                </AgentMessage>

                <section className="mt-5 rounded-[26px] border border-[#ead0f0] bg-white/70 p-4 shadow-[0_12px_30px_rgba(150,125,185,0.10)]">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black tracking-[0.18em] text-[#b09bc0]">
                      FOMO 火箭 · 实时行情
                    </p>

                    <span className="rounded-full bg-[#fce4f0] px-2 py-0.5 text-[9px] font-black text-[#d06a9a]">
                      {openingFlight[flightTick].heat}°C
                    </span>
                  </div>

                  {/* 股价仪表盘 */}
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#b09bc0]">
                        当前涨幅
                      </p>

                      <p className="text-4xl font-black text-[#4a4260]">
                        {openingFlight[flightTick].gain}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#b09bc0]">
                        市场热度
                      </p>

                      <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-[#ebe5f5]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#8ecdf2] via-[#b59cf0] to-[#ef9ac9] transition-all duration-500"
                          style={{
                            width: `${openingFlight[flightTick].heat}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 社区动态 */}
                  <div className="mt-4 rounded-[16px] border border-[#e8ddf0] bg-[#faf6ff] p-3">
                    <p className="text-[10px] font-bold text-[#b09bc0]">
                      社区动态
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#4d4564]">
                      {openingFlight[flightTick].feed}
                    </p>
                  </div>
                </section>
              </>
            )}

            {/* =====================================================
                PHASE 2：诱惑时刻
                ===================================================== */}

            {fomoPhase === "temptation" && (
              <>
                <AgentMessage alert>
                  “涨幅已经超过 15%。市场情绪开始沸腾。你看到‘还没上车’的人开始被嘲笑。现在，该你选择了。”
                </AgentMessage>

                <section className="mt-5 rounded-[26px] border-2 border-[#f0c8e0] bg-[#fff0f8] p-6 text-center shadow-[0_12px_30px_rgba(200,120,170,0.12)]">
                  <div className="text-5xl">😵</div>

                  <p className="mt-3 text-base font-black leading-7 text-[#5d5570]">
                    涨幅已经 <span className="text-[#c95a92]">+15.7%</span>
                  </p>

                  <p className="mt-2 text-sm font-bold text-[#8a7187]">
                    社交媒体上越来越多的人在炫耀收益。
                    <br />
                    你感觉自己的心跳在加快。
                  </p>

                  <div className="mt-5 space-y-2">
                    <button
                      type="button"
                      onClick={() => chooseFirstAction("chase")}
                      className="w-full rounded-2xl bg-gradient-to-r from-[#f09ad9] to-[#e88fbd] py-4 font-black text-white shadow-[0_8px_20px_rgba(200,100,160,0.25)]"
                    >
                      🚀 现在上车！不能错过这波！
                    </button>

                    <button
                      type="button"
                      onClick={() => chooseFirstAction("wait")}
                      className="w-full rounded-2xl border-2 border-[#d8c6e0] bg-white py-4 font-black text-[#6b5a7e]"
                    >
                      🧊 继续观察，不着急
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* =====================================================
                PHASE 3A：选择"追涨"后的剧情
                ===================================================== */}

            {fomoPhase === "afterChase" && (
              <>
                <AgentMessage>
                  “你买入了。股价继续上涨——一切看起来都是对的。但你需要继续观察。”
                </AgentMessage>

                <section className="mt-5 rounded-[26px] border border-[#ead0f0] bg-white/70 p-4 shadow-[0_12px_30px_rgba(150,125,185,0.10)]">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black tracking-[0.18em] text-[#b09bc0]">
                      持仓动态
                    </p>

                    <span className="rounded-full bg-[#fce4f0] px-2 py-0.5 text-[9px] font-black text-[#d06a9a]">
                      {chaseSequence[chaseTick].label}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-[#b09bc0]">
                      当前盈利
                    </p>

                    <p className="text-4xl font-black text-[#4a4260]">
                      {chaseSequence[chaseTick].gain}
                    </p>
                  </div>

                  <div className="mt-3">
                    <p className="text-[10px] font-bold text-[#b09bc0]">
                      市场热度
                    </p>

                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#ebe5f5]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8ecdf2] via-[#b59cf0] to-[#ef9ac9] transition-all duration-500"
                        style={{
                          width: `${chaseSequence[chaseTick].heat}%`,
                        }}
                      />
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* =====================================================
                PHASE 3B：选择"追涨"后的反思
                ===================================================== */}

            {fomoPhase === "reflection" &&
              firstAction === "chase" && (
                <>
                  <AgentMessage>
                    “股价从 +22% 快速回落至 +11.8%。你账面上的浮盈正在快速蒸发。刚才你追涨的时候，是什么在驱动你的决定？”
                  </AgentMessage>

                  <section className="mt-5 rounded-[26px] border-2 border-[#f0c8e0] bg-[#fff0f8] p-6 text-center shadow-[0_12px_30px_rgba(200,120,170,0.12)]">
                    <div className="text-4xl">🤔</div>

                    <p className="mt-3 text-lg font-black text-[#5d5570]">
                      回顾你的决策
                    </p>

                    <p className="mt-2 text-sm font-bold text-[#8a7187]">
                      你刚才为什么决定追涨？
                    </p>

                    <div className="mt-5 space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReflectionWrong(false);
                          setReflectionChoice("fomo");
                        }}
                        className={`w-full rounded-[18px] border-2 p-3 text-left transition-all ${
                          reflectionChoice === "fomo"
                            ? "border-[#d594f0] bg-[#f7edff]"
                            : "border-[#e4daf0] bg-white"
                        }`}
                      >
                        <p className="text-sm font-bold text-[#4d4564]">
                          😵 怕错过，周围人都在赚钱让我坐不住
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReflectionWrong(false);
                          setReflectionChoice("logic");
                        }}
                        className={`w-full rounded-[18px] border-2 p-3 text-left transition-all ${
                          reflectionChoice === "logic"
                            ? "border-[#d594f0] bg-[#f7edff]"
                            : "border-[#e4daf0] bg-white"
                        }`}
                      >
                        <p className="text-sm font-bold text-[#4d4564]">
                          🧠 分析了基本面，认为价格仍然合理
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReflectionWrong(false);
                          setReflectionChoice("trend");
                        }}
                        className={`w-full rounded-[18px] border-2 p-3 text-left transition-all ${
                          reflectionChoice === "trend"
                            ? "border-[#d594f0] bg-[#f7edff]"
                            : "border-[#e4daf0] bg-white"
                        }`}
                      >
                        <p className="text-sm font-bold text-[#4d4564]">
                          📈 相信趋势，强者恒强
                        </p>
                      </button>
                    </div>

                    {reflectionWrong && (
                      <p className="mt-3 text-xs font-bold text-[#c45252]">
                        💔 再想想，刚才的决策更多是来自情绪还是理性分析？
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={!reflectionChoice}
                      onClick={submitReflection}
                      className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#f09ad9] to-[#e88fbd] py-3.5 font-black text-white disabled:opacity-40"
                    >
                      确认反思
                    </button>
                  </section>
                </>
              )}

            {/* =====================================================
                PHASE 3C：选择"继续观察"后的独立 FOMO 分支
                ===================================================== */}

            {fomoPhase === "waitPressure" && (
              <>
                <AgentMessage alert>
                  “你选择了继续观察。但股价还在涨——市场开始嘲笑没有上车的人。你虽然没有买入，但开始感到一种奇怪的压力。”
                </AgentMessage>

                <section className="mt-5 rounded-[26px] border-2 border-[#f0c8e0] bg-[#fff0f8] p-6 text-center shadow-[0_12px_30px_rgba(200,120,170,0.12)]">
                  <div className="text-5xl">😰</div>

                  <p className="mt-3 text-lg font-black text-[#5d5570]">
                    股价继续上涨
                  </p>

                  <p className="mt-2 text-4xl font-black text-[#c95a92]">
                    {waitPressureScene.gain}
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-6">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-[#b09bc0]">
                        市场热度
                      </p>

                      <p className="text-lg font-black text-[#4a4260]">
                        {waitPressureScene.heat}°C
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] font-bold text-[#b09bc0]">
                        你的 FOMO 指数
                      </p>

                      <p className="text-lg font-black text-[#c95a92]">
                        {waitPressureScene.fomo}%
                      </p>
                    </div>
                  </div>

                  {/* 社区动态 */}
                  <div className="mt-4 space-y-1">
                    {waitPressureScene.feed.map((feed, i) => (
                      <p
                        key={i}
                        className="rounded-[12px] bg-[#fff5fa] p-2 text-sm font-bold text-[#4d4564]"
                      >
                        {feed}
                      </p>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* =====================================================
                PHASE 3D：继续观察后的反思
                ===================================================== */}

            {fomoPhase === "waitPressure" &&
              firstAction === "wait" &&
              waitReflectionChoice === null && (
                <>
                  <section className="mt-5 rounded-[26px] border-2 border-[#f0c8e0] bg-[#fff0f8] p-6 text-center shadow-[0_12px_30px_rgba(200,120,170,0.12)]">
                    <div className="text-4xl">😰</div>

                    <p className="mt-3 text-lg font-black text-[#5d5570]">
                      没有买入，也一样会焦虑
                    </p>

                    <p className="mt-2 text-sm font-bold text-[#8a7187]">
                      你一直没买，但它还在涨。周围的人都在赚钱。你现在是什么感受？
                    </p>

                    <div className="mt-5 space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setWaitReflectionWrong(false);
                          setWaitReflectionChoice("regret");
                        }}
                        className={`w-full rounded-[18px] border-2 p-3 text-left transition-all ${
                          waitReflectionChoice === "regret"
                            ? "border-[#d594f0] bg-[#f7edff]"
                            : "border-[#e4daf0] bg-white"
                        }`}
                      >
                        <p className="text-sm font-bold text-[#4d4564]">
                          😵 有点后悔刚才没买，怕它继续涨、自己彻底错过
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWaitReflectionWrong(false);
                          setWaitReflectionChoice("fundamental");
                        }}
                        className={`w-full rounded-[18px] border-2 p-3 text-left transition-all ${
                          waitReflectionChoice === "fundamental"
                            ? "border-[#d594f0] bg-[#f7edff]"
                            : "border-[#e4daf0] bg-white"
                        }`}
                      >
                        <p className="text-sm font-bold text-[#4d4564]">
                          🏢 它继续涨，说明基本面一定突然变好了
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWaitReflectionWrong(false);
                          setWaitReflectionChoice("safe");
                        }}
                        className={`w-full rounded-[18px] border-2 p-3 text-left transition-all ${
                          waitReflectionChoice === "safe"
                            ? "border-[#d594f0] bg-[#f7edff]"
                            : "border-[#e4daf0] bg-white"
                        }`}
                      >
                        <p className="text-sm font-bold text-[#4d4564]">
                          🧊 没买就没有亏损，坚持自己的判断
                        </p>
                      </button>
                    </div>

                    {waitReflectionWrong && (
                      <p className="mt-3 text-xs font-bold text-[#c45252]">
                        💔 注意，FOMO 的核心是“害怕错过”——即使没有买入，也可能因为看到别人赚钱而产生焦虑。
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={!waitReflectionChoice}
                      onClick={submitWaitReflection}
                      className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#f09ad9] to-[#e88fbd] py-3.5 font-black text-white disabled:opacity-40"
                    >
                      确认感受
                    </button>
                  </section>
                </>
              )}

            {/* =====================================================
                PHASE 4：FOMO 教学
                ===================================================== */}

            {fomoPhase === "concept" && (
              <>
                <AgentMessage>
                  “很好。现在你已经亲身体验了 FOMO 的力量。无论你选择追涨还是继续观察，市场情绪都会以不同的方式影响你。重要的是——你能意识到它。”
                </AgentMessage>

                <section className="mt-5 rounded-[26px] border-2 border-[#d9b9e9] bg-white/80 p-6 text-center shadow-[0_12px_30px_rgba(150,125,185,0.12)]">
                  <div className="text-5xl">🧠</div>

                  <p className="mt-3 text-[10px] font-black tracking-[0.2em] text-[#b175ae]">
                    FOMO 101
                  </p>

                  <h2 className="mt-2 text-xl font-black text-[#5d5570]">
                    FOMO =
                    <br />
                    Fear of Missing Out
                  </h2>

                  <p className="mt-2 text-sm font-bold text-[#8a7187]">
                    错失恐惧症
                  </p>

                  <div className="mt-5 rounded-[20px] border border-[#eaccf0] bg-[#fcf5ff] p-4 text-left">
                    <p className="text-xs font-bold text-[#b09bc0]">
                      FOMO 的典型特征
                    </p>

                    <ul className="mt-2 space-y-1.5">
                      <li className="flex items-start gap-2 text-sm font-bold text-[#4d4564]">
                        <span>🔥</span>
                        <span>看到别人赚钱时产生焦虑</span>
                      </li>

                      <li className="flex items-start gap-2 text-sm font-bold text-[#4d4564]">
                        <span>⚡</span>
                        <span>害怕错过“一生一次的机会”</span>
                      </li>

                      <li className="flex items-start gap-2 text-sm font-bold text-[#4d4564]">
                        <span>😵</span>
                        <span>即使没买入，也可能因为“没买”而后悔</span>
                      </li>

                      <li className="flex items-start gap-2 text-sm font-bold text-[#4d4564]">
                        <span>💊</span>
                        <span>理性分析被情绪冲动取代</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={enterBoss}
                    className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#8ecdf2] via-[#b49aed] to-[#eb96c1] py-3.5 font-black text-white shadow-[0_8px_20px_rgba(180,145,210,0.18)]"
                  >
                    进入最终挑战 →
                  </button>
                </section>
              </>
            )}

            {/* =====================================================
                PHASE 5：Boss 关
                ===================================================== */}

            {fomoPhase === "boss" && (
              <>
                <AgentMessage alert>
                  “市场现在处于极端狂热状态。众多声音在催促你‘上车’。你能保持冷静吗？”
                </AgentMessage>

                <section className="mt-5 rounded-[26px] border-2 border-[#f0c8e0] bg-[#fff0f8] p-6 shadow-[0_12px_30px_rgba(200,120,170,0.12)]">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚨</span>

                    <p className="text-[10px] font-black tracking-[0.16em] text-[#c95a92]">
                      FOMO BOSS FIGHT
                    </p>
                  </div>

                  <p className="mt-2 text-lg font-black text-[#5d5570]">
                    市场已经处于极端狂热
                  </p>

                  <div className="mt-4 space-y-1 rounded-[16px] bg-[#fff5fa] p-3">
                    {bossFeed.map((feed, i) => (
                      <p
                        key={i}
                        className="text-sm font-bold text-[#4d4564]"
                      >
                        {feed}
                      </p>
                    ))}
                  </div>

                  <p className="mt-4 text-sm font-black text-[#5d5570]">
                    面对这种极端行情，你选择？
                  </p>

                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBossWrong(false);
                        setBossChoice("chase");
                      }}
                      className={`w-full rounded-[18px] border-2 p-3 text-left transition-all ${
                        bossChoice === "chase"
                          ? "border-[#d594f0] bg-[#f7edff]"
                          : "border-[#e4daf0] bg-white"
                      }`}
                    >
                      <p className="text-sm font-bold text-[#4d4564]">
                        🚀 继续追涨，机会不能错过
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBossWrong(false);
                        setBossChoice("wait");
                      }}
                      className={`w-full rounded-[18px] border-2 p-3 text-left transition-all ${
                        bossChoice === "wait"
                          ? "border-[#d594f0] bg-[#f7edff]"
                          : "border-[#e4daf0] bg-white"
                      }`}
                    >
                      <p className="text-sm font-bold text-[#4d4564]">
                        🧊 等待价格回调再考虑
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBossWrong(false);
                        setBossChoice("evidence");
                      }}
                      className={`w-full rounded-[18px] border-2 p-3 text-left transition-all ${
                        bossChoice === "evidence"
                          ? "border-[#d594f0] bg-[#f7edff]"
                          : "border-[#e4daf0] bg-white"
                      }`}
                    >
                      <p className="text-sm font-bold text-[#4d4564]">
                        📊 先看清当前市场的全面信息，再做决定
                      </p>
                    </button>
                  </div>

                  {bossWrong && (
                    <p className="mt-3 text-xs font-bold text-[#c45252]">
                      💔 极端行情里，“继续追”或“只等价格”都没有增加投资证据。
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={!bossChoice}
                    onClick={submitBossChoice}
                    className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#8ecdf2] via-[#b49aed] to-[#eb96c1] py-3.5 font-black text-white disabled:opacity-40"
                  >
                    确认决策
                  </button>
                </section>
              </>
            )}

            {/* =====================================================
                PHASE 6：最终证据
                ===================================================== */}

            {fomoPhase === "evidence" && (
              <>
                <AgentMessage>
                  “好的，先看完信息再做决定。现在你面前有四张卡片——哪一组信息最能说明当前市场情绪正在主导价格？”
                </AgentMessage>

                <section className="mt-5 rounded-[26px] border-2 border-[#f0c8e0] bg-[#fff0f8] p-6 shadow-[0_12px_30px_rgba(200,120,170,0.12)]">
                  <p className="text-[10px] font-black tracking-[0.16em] text-[#c95a92]">
                    EVIDENCE REVIEW
                  </p>

                  <p className="mt-1 text-lg font-black text-[#5d5570]">
                    当前市场信息
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {evidenceCards.map((card) => (
                      <div
                        key={card.title}
                        className={`rounded-[16px] border-2 p-3 text-center ${
                          card.tone === "neutral"
                            ? "border-[#e4daf0] bg-white"
                            : card.tone === "warning"
                              ? "border-[#f0d8a0] bg-[#fffce8]"
                              : "border-[#f0c8e0] bg-[#fff0f8]"
                        }`}
                      >
                        <span className="text-2xl">{card.icon}</span>

                        <p className="mt-1 text-[10px] font-black text-[#b09bc0]">
                          {card.title}
                        </p>

                        <p className="mt-0.5 text-sm font-black text-[#4d4564]">
                          {card.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-sm font-black text-[#5d5570]">
                    哪一组信息组合最能说明当前行情由情绪驱动？
                  </p>

                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEvidenceWrong(false);
                        setEvidenceChoice("fundamental");
                      }}
                      className={`w-full rounded-[18px] border-2 p-3 text-left transition-all ${
                        evidenceChoice === "fundamental"
                          ? "border-[#d594f0] bg-[#f7edff]"
                          : "border-[#e4daf0] bg-white"
                      }`}
                    >
                      <p className="text-sm font-bold text-[#4d4564]">
                        🏢 基本面没有变化 + 估值合理
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEvidenceWrong(false);
                        setEvidenceChoice("price-sentiment");
                      }}
                      className={`w-full rounded-[18px] border-2 p-3 text-left transition-all ${
                        evidenceChoice === "price-sentiment"
                          ? "border-[#d594f0] bg-[#f7edff]"
                          : "border-[#e4daf0] bg-white"
                      }`}
                    >
                      <p className="text-sm font-bold text-[#4d4564]">
                        🚀 股价快速拉升 + 社区情绪极度狂热
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEvidenceWrong(false);
                        setEvidenceChoice("valuation");
                      }}
                      className={`w-full rounded-[18px] border-2 p-3 text-left transition-all ${
                        evidenceChoice === "valuation"
                          ? "border-[#d594f0] bg-[#f7edff]"
                          : "border-[#e4daf0] bg-white"
                      }`}
                    >
                      <p className="text-sm font-bold text-[#4d4564]">
                        💰 估值已明显偏高 + 基本面没有变化
                      </p>
                    </button>
                  </div>

                  {evidenceWrong && (
                    <p className="mt-3 text-xs font-bold text-[#c45252]">
                      💔 股价快速拉升 + 社区情绪狂热，才是当前行情由情绪而非基本面驱动的最直接证据。
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={!evidenceChoice}
                    onClick={submitEvidenceChoice}
                    className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#8ecdf2] via-[#b49aed] to-[#eb96c1] py-3.5 font-black text-white disabled:opacity-40"
                  >
                    确认判断
                  </button>
                </section>
              </>
            )}
          </>
        )}

        {/* =====================================================
            ROUND 3 COMPLETE
            ===================================================== */}

        {!gameOver &&
          round === 3 &&
          round3Complete && (
            <>
              <AgentMessage>
                “漂亮。你不只是看懂了市场情绪，也开始看懂自己的情绪。真正的冷静，不是没有感觉，而是知道感觉什么时候正在替你做决定。”
              </AgentMessage>

              <section className="mt-5 rounded-[32px] border-2 border-[#d9b9e9] bg-white/80 p-6 text-center shadow-[0_20px_50px_rgba(150,125,185,0.14)]">
                <div className="text-6xl">🚀</div>

                <p className="mt-3 text-[10px] font-black tracking-[0.2em] text-[#b175ae]">
                  SENTIMENT MISSION COMPLETE
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#5d5570]">
                  FOMO Survival｜成功脱离情绪风暴
                </h2>

                <div className="mt-4 flex justify-center gap-1">
                  {[0, 1, 2].map((heart) => (
                    <span
                      key={heart}
                      className={`text-2xl ${
                        heart < lives ? "opacity-100" : "grayscale opacity-20"
                      }`}
                    >
                      ❤️
                    </span>
                  ))}
                </div>

                <p className="mt-3 text-lg font-black text-[#bd6e9d]">
                  {lives === 3
                    ? "S级｜情绪驯服者"
                    : lives === 2
                      ? "A级｜冷静观察员"
                      : "B级｜惊险刹车"}
                </p>

                <div className="mt-5 rounded-[24px] border border-[#efc9df] bg-[#fff5fa] p-4 text-left">
                  <p className="text-xs font-black tracking-[0.14em] text-[#bd6d9a]">
                    TODAY&apos;S UNLOCK
                  </p>

                  <p className="mt-2 text-xl font-black text-[#65586d]">
                    FOMO = Fear of Missing Out
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#8a7485]">
                    错失恐惧 / 害怕错过
                  </p>

                  <p className="mt-3 text-sm leading-6 text-[#827382]">
                    市场情绪可以帮助你理解“大家在想什么”，但真正重要的是：
                    <span className="font-black text-[#c36695]">
                      不要让别人的兴奋和恐慌替你做投资决定。
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetGame}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#8ecdf2] via-[#b49aed] to-[#eb96c1] py-4 font-black text-white shadow-[0_12px_30px_rgba(180,145,210,0.22)]"
                >
                  再挑战一次
                </button>

                <button
                  type="button"
                  onClick={() => onComplete?.()}
                  className="mt-3 w-full rounded-2xl border-2 border-[#d9b9e9] bg-white py-4 font-black text-[#6b5a7e] shadow-[0_8px_20px_rgba(150,125,185,0.10)]"
                >
                  完成挑战，返回市场天气谷 →
                </button>
              </section>
            </>
          )}

        {/* Disclaimer */}
        <p className="mt-6 text-center text-[10px] leading-5 text-[#a199aa]">
          市场情绪只能作为辅助信号，不构成任何投资建议。
        </p>
      </div>
    </main>
  );
}