"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

   现在头像区域只是一个占位圆形。

   后面有图片以后，我们会把里面的 SA 替换成：
   <Image src="/sentiment-agent.png" ... />
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
      {/* Agent 圆形头像预留位 */}
      <div className="absolute -left-2 -top-5 h-[82px] w-[82px]">
        {/* 光晕 */}
        <div className="absolute inset-2 rounded-full bg-[#e7a9d1]/30 blur-xl" />

        {/* 头像圆 */}
        <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-[#dba4ce] bg-gradient-to-br from-[#ffe7f5] via-[#efe6ff] to-[#dff3ff] shadow-[0_8px_22px_rgba(173,118,167,0.22)]">
          <Image
            src="/sentiment_agent.PNG"
            alt="Sentiment Agent"
            fill
            priority
            className="object-cover object-top scale-110"
          />
        </div>

        {/* 小情绪徽章 */}
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

export default function Home() {
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
      // 这里故意不立刻判错：先让玩家看到“追涨后还继续赚钱”的诱惑。
      setChaseTick(0);
      setFomoPhase("afterChase");
    } else {
      // “继续观察”不是“追涨”，因此进入独立分支：
      // 玩家没有买入，但行情继续冲高，让他体验“没买也会产生 FOMO”。
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
                    {currentIndex + 1}/
                    {moodItems.length}
                  </div>
                </div>
              </section>

              {/* 信息卡 */}
              <section className="relative mt-4 overflow-hidden rounded-[30px] border border-[#d3daf1] bg-white/80 p-5 shadow-[0_18px_45px_rgba(120,140,180,0.12)]">
                {/* 背景光 */}
                <div className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-[#9fdcff]/20 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-[#f0abd2]/20 blur-3xl" />

                <div className="relative flex items-center justify-between">
                  <div className="rounded-full border border-[#d5dbed] bg-[#f5f7ff] px-3 py-1 text-[9px] font-black tracking-[0.13em] text-[#8c93ac]">
                    LIVE FEED
                  </div>

                  <span className="text-[10px] font-bold text-[#aaa2b6]">
                    SIGNAL {currentIndex + 1}
                  </span>
                </div>

                <div className="relative mt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {currentItem.icon}
                    </span>

                    <span className="text-xs font-black text-[#9a83a6]">
                      {currentItem.source}
                    </span>
                  </div>

                  <p className="mt-5 text-xl font-black leading-8 text-[#514c66]">
                    “{currentItem.text}”
                  </p>
                </div>

                {/* 情绪波形 */}
                <div className="mt-6 flex h-12 items-end gap-1 opacity-70">
                  {[
                    34, 61, 42, 78, 55, 35, 82, 48,
                    68, 40, 76, 52,
                  ].map((height, index) => (
                    <div
                      key={index}
                      className="w-full rounded-full bg-gradient-to-t from-[#9bcff1] via-[#b7a7ee] to-[#eda1c9]"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  ))}
                </div>
              </section>

              {/* 三档按钮 */}
              <section className="mt-5">
                <p className="mb-3 text-center text-[10px] font-black tracking-[0.16em] text-[#a397b4]">
                  HOW DOES THIS FEEL?
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(moodMeta) as Mood[]).map(
                    (mood) => {
                      const meta = moodMeta[mood];
                      const active =
                        selectedMood === mood;

                      return (
                        <button
                          key={mood}
                          type="button"
                          onClick={() =>
                            handleMoodSelect(mood)
                          }
                          className={`rounded-[22px] border p-3 text-center transition-all duration-200 ${
                            active
                              ? meta.activeClass
                              : "border-[#ddd8ed] bg-white/65 text-[#958ca2] hover:-translate-y-0.5 hover:border-[#cfc2e6]"
                          }`}
                        >
                          <div className="text-3xl">
                            {meta.icon}
                          </div>

                          <p className="mt-2 font-black">
                            {meta.label}
                          </p>

                          <p className="mt-1 text-[8px] font-bold tracking-[0.13em] opacity-60">
                            {meta.english}
                          </p>
                        </button>
                      );
                    },
                  )}
                </div>
              </section>

              {/* 提交 */}
              {!moodFeedback && (
                <button
                  type="button"
                  disabled={!selectedMood}
                  onClick={submitMoodAnswer}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#8dcdf2] via-[#ad9ded] to-[#e99bc8] py-4 font-black text-white shadow-[0_12px_28px_rgba(177,145,210,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  锁定情绪判断
                </button>
              )}

              {/* 回答正确 */}
              {moodFeedback === "correct" && (
                <section className="mt-5 rounded-[24px] border border-[#a9dcd4] bg-[#effcf9] p-4">
                  <p className="font-black text-[#4a9f92]">
                    ✓ 情绪扫描命中
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#66837f]">
                    {currentItem.explanation}
                  </p>

                  <button
                    type="button"
                    onClick={goNextMood}
                    className="mt-4 w-full rounded-xl bg-[#7ec8bd] py-3 font-black text-white"
                  >
                    {currentIndex ===
                    moodItems.length - 1
                      ? "完成 Round 1 →"
                      : "扫描下一条 →"}
                  </button>
                </section>
              )}

              {/* 回答错误 */}
              {moodFeedback === "wrong" &&
                !gameOver && (
                  <section className="mt-5 rounded-[24px] border border-[#efb3ca] bg-[#fff1f6] p-4">
                    <p className="font-black text-[#c96791]">
                      💔 情绪判断偏差
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#8b6c7d]">
                      Sentiment Agent：
                      “先看看它是在陈述事实，还是在放大恐惧或兴奋。”
                    </p>

                    <button
                      type="button"
                      onClick={retryMood}
                      className="mt-4 w-full rounded-xl border border-[#e5bfd0] bg-white/70 py-3 font-black text-[#b46d8f]"
                    >
                      重新判断这一条
                    </button>
                  </section>
                )}
            </>
          )}

        {/* =====================================================
            ROUND 1 COMPLETE
            ===================================================== */}

        {!gameOver &&
          round === 1 &&
          round1Complete && (
            <>
              <AgentMessage>
                “很好。你已经能听出情绪了。可现实里的市场不会一条一条给你出题——接下来，我们要从噪音里抓信号。”
              </AgentMessage>

              <section className="mt-5 rounded-[30px] border-2 border-[#c9b8ea] bg-white/75 p-6 text-center shadow-[0_18px_45px_rgba(150,125,185,0.12)]">
                <div className="text-5xl">
                  🧠
                </div>

                <p className="mt-3 text-[10px] font-black tracking-[0.18em] text-[#ae85be]">
                  MOOD SCAN COMPLETE
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#5f5571]">
                  情绪扫描完成
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#867993]">
                  你已经可以区分：
                </p>

                <div className="mt-4 flex justify-center gap-3 text-sm font-black">
                  <span className="rounded-full bg-[#e7f5ff] px-3 py-1 text-[#5c91b5]">
                    😱 恐慌
                  </span>

                  <span className="rounded-full bg-[#f2effc] px-3 py-1 text-[#776a99]">
                    😐 中性
                  </span>

                  <span className="rounded-full bg-[#fff0f7] px-3 py-1 text-[#b66a91]">
                    🔥 狂热
                  </span>
                </div>

                <button
                  type="button"
                  onClick={enterRound2}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#8dcdf2] via-[#b09dec] to-[#ec9cc8] py-4 font-black text-white shadow-[0_12px_30px_rgba(177,145,210,0.22)]"
                >
                  进入 Round 2｜舆情雷达 →
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
                “市场上每天有无数消息。但 Sentiment Agent 不是什么都听——我们只抓真正能反映群体情绪变化的信号。”
              </AgentMessage>

              {/* Round 2 标题 */}
              <section className="mt-5 rounded-[24px] border border-[#d8d3ee] bg-white/65 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.18em] text-[#a58bc1]">
                      ROUND 2
                    </p>

                    <p className="mt-1 font-black text-[#5e5776]">
                      舆情雷达 · SIGNAL RADAR
                    </p>
                  </div>

                  <div className="rounded-full bg-[#eaf6ff] px-3 py-1 text-xs font-black text-[#699bc0]">
                    选 2 条
                  </div>
                </div>
              </section>

              {/* 雷达 */}
              <section className="relative mt-4 overflow-hidden rounded-[30px] border border-[#cadcf0] bg-[#eef9ff]/80 p-5 shadow-[0_18px_45px_rgba(130,160,190,0.12)]">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#92cae5]/25" />

                <div className="pointer-events-none absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#a7bee4]/30" />

                <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d3aedd]/35" />

                {/* 中心扫描 */}
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#a7cfe7] bg-white/60 shadow-[0_0_30px_rgba(130,190,225,0.22)]">
                  <div className="text-center">
                    <div className="text-3xl">
                      📡
                    </div>

                    <p className="mt-1 text-[8px] font-black tracking-[0.15em] text-[#799bb0]">
                      SCANNING
                    </p>
                  </div>
                </div>

                <p className="relative mt-5 text-center text-sm font-bold leading-6 text-[#728394]">
                  从下面 5 条信息中，找出
                  <span className="mx-1 font-black text-[#bf6e9f]">
                    2 条
                  </span>
                  最能证明市场情绪正在明显升温的信号。
                </p>
              </section>

              {/* 雷达信息卡 */}
              <div className="mt-5 space-y-3">
                {radarItems.map((item) => {
                  const active =
                    selectedSignals.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        toggleSignal(item.id)
                      }
                      className={`w-full rounded-[22px] border p-4 text-left transition-all duration-200 ${
                        active
                          ? "rotate-[-0.3deg] border-[#df93bd] bg-[#fff0f7] shadow-[0_10px_28px_rgba(220,140,185,0.16)]"
                          : "border-[#ddd9eb] bg-white/70 hover:-translate-y-0.5 hover:border-[#cfc0e6]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${
                            active
                              ? "bg-[#f8cfe3]"
                              : "bg-[#f2eff8]"
                          }`}
                        >
                          {item.icon}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] font-black tracking-[0.12em] text-[#9c88a7]">
                              {item.source}
                            </p>

                            {active && (
                              <span className="rounded-full bg-[#e69bc2] px-2 py-0.5 text-[9px] font-black text-white">
                                TARGET
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm font-bold leading-6 text-[#5e586e]">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 当前锁定数量 */}
              <div className="mt-4 flex items-center justify-between rounded-[20px] border border-[#d9d6e7] bg-white/60 px-4 py-3">
                <span className="text-xs font-bold text-[#978ca0]">
                  📡 已锁定情绪信号
                </span>

                <span className="font-black text-[#bd719e]">
                  {selectedSignals.length} / 2
                </span>
              </div>

              <button
                type="button"
                disabled={
                  selectedSignals.length !== 2
                }
                onClick={submitRadar}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#8dcdf2] via-[#b09dec] to-[#ec9cc8] py-4 font-black text-white shadow-[0_12px_30px_rgba(177,145,210,0.22)] transition disabled:cursor-not-allowed disabled:opacity-35"
              >
                分析情绪信号
              </button>

              {radarWrong && !gameOver && (
                <section className="mt-5 rounded-[24px] border border-[#efb3ca] bg-[#fff1f6] p-4">
                  <p className="font-black text-[#c96791]">
                    💔 雷达锁定错误，失去 1 颗情绪能量
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#8b6c7d]">
                    Sentiment Agent：
                    “别只看它是不是金融新闻。问自己：它真的能说明很多投资者正在变得更兴奋或更恐慌吗？”
                  </p>
                </section>
              )}
            </>
          )}

        {/* =====================================================
            ROUND 2 COMPLETE
            ===================================================== */}

        {!gameOver &&
          round === 2 &&
          round2Complete && (
            <>
              <AgentMessage>
                “抓到了。搜索热度和群体刷屏，比办公室装修更能反映市场情绪。现在，我们已经知道市场正在变热了……”
              </AgentMessage>

              <section className="mt-5 rounded-[30px] border-2 border-[#dbb7eb] bg-white/75 p-6 text-center shadow-[0_18px_45px_rgba(150,125,185,0.13)]">
                <div className="text-5xl">
                  📡
                </div>

                <p className="mt-3 text-[10px] font-black tracking-[0.2em] text-[#aa7fc2]">
                  SIGNAL LOCKED
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#5d5570]">
                  舆情雷达完成
                </h2>

                <div className="mt-4 rounded-[22px] border border-[#f0c8dd] bg-[#fff4fa] p-4 text-left">
                  <p className="text-xs font-black text-[#bc719b]">
                    MARKET STATUS
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#766778]">
                      市场热度
                    </span>

                    <span className="rounded-full bg-[#f4b7d3] px-3 py-1 text-xs font-black text-white">
                      快速升温 ↑
                    </span>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#f0e5ed]">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#8bcff2] via-[#b297eb] to-[#ed90bd]" />
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-[#88798f]">
                  但发现市场正在狂热，并不代表你已经不会被它影响。
                </p>

                <p className="mt-3 font-black text-[#bf6f9f]">
                  下一步：检测你自己的情绪。
                </p>

                <button
                  type="button"
                  onClick={enterRound3}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#ef9ec9] via-[#c895ed] to-[#8fcdf2] py-4 font-black text-white shadow-[0_12px_30px_rgba(190,140,205,0.22)]"
                >
                  Round 3｜FOMO 火箭 🚀
                </button>
              </section>
            </>
          )}


        {/* =====================================================
            ROUND 3｜FOMO SURVIVAL · 单屏游戏舱
            ===================================================== */}

        {!gameOver && round === 3 && !round3Complete && (
          <div className="fixed inset-0 z-50 h-[100dvh] overflow-hidden bg-gradient-to-b from-[#eef7ff] via-[#f7f1ff] to-[#fff0f8] p-3 text-[#504a68]">
            <div className="mx-auto flex h-full w-full max-w-md flex-col gap-2">
              {/* 单屏 HUD */}
              <header className="shrink-0 rounded-[22px] border border-[#dacff0] bg-white/85 px-4 py-3 shadow-[0_10px_30px_rgba(150,125,185,0.12)] backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-black tracking-[0.18em] text-[#c26fa7]">
                      ROUND 3 · FINAL BOSS
                    </p>
                    <h2 className="mt-0.5 text-lg font-black text-[#514a6b]">
                      FOMO SURVIVAL 🚀
                    </h2>
                  </div>

                  <div className="text-right">
                    <p className="text-[8px] font-bold tracking-[0.12em] text-[#a291ad]">
                      EMOTION ENERGY
                    </p>
                    <div className="mt-0.5 flex justify-end gap-0.5">
                      {[0, 1, 2].map((heart) => (
                        <span
                          key={heart}
                          className={`text-lg ${
                            heart < lives
                              ? "opacity-100"
                              : "grayscale opacity-20"
                          }`}
                        >
                          ❤️
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </header>

              {/* Agent：固定在游戏舱上方，不再占一整块长页面 */}
              <section
                className={`relative shrink-0 rounded-[20px] border py-2.5 pl-[70px] pr-3 ${
                  fomoPhase === "afterChase" ||
                  fomoPhase === "boss" ||
                  fomoPhase === "evidence"
                    ? "border-[#efb0c8] bg-[#fff2f7]"
                    : "border-[#d9c9ef] bg-[#fff8fd]"
                }`}
              >
                <div className="absolute -left-1 -top-2 h-[62px] w-[62px]">
                  <div className="absolute inset-1 rounded-full bg-[#e7a9d1]/35 blur-lg" />
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-[#dba4ce] bg-gradient-to-br from-[#ffe7f5] via-[#efe6ff] to-[#dff3ff] shadow-md">
                    {/* 以后这里直接换 Sentiment Agent 头像 */}
                    <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-[#dba4ce] bg-gradient-to-br from-[#ffe7f5] via-[#efe6ff] to-[#dff3ff] shadow-md">
                    <Image
                      src="/sentiment_agent.PNG"
                      alt="Sentiment Agent"
                      fill
                      priority
                      className="object-cover object-top scale-110"
                    />
                  </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#f2b5d7] text-[11px]">
                    💗
                  </div>
                </div>

                <p className="text-[9px] font-black tracking-[0.13em] text-[#c36fa8]">
                  SENTIMENT AGENT
                </p>
                <p className="mt-0.5 text-[12px] font-medium leading-[18px] text-[#655f78]">
                  {fomoPhase === "flight" &&
                    "“先别做决定。只看行情，注意你什么时候开始坐不住。”"}
                  {fomoPhase === "temptation" &&
                    "“按钮出现了。别猜正确答案，只问自己：你为什么想行动？”"}
                  {fomoPhase === "afterChase" &&
                    "“追进去后居然还在涨。冲动有时会先奖励你——这正是危险的地方。”"}
                  {fomoPhase === "waitPressure" &&
                    "“你刚才选择了继续观察，可它又涨了。注意：没有买入，也一样可能开始后悔、焦虑、怕错过。”"}
                  {fomoPhase === "reflection" &&
                    "“回头看：刚才到底是什么让你按下了‘现在上车’？”"}
                  {fomoPhase === "concept" &&
                    "“抓到了。给这种感觉一个名字，下次它出现时你就更容易认出它。”"}
                  {fomoPhase === "boss" &&
                    "“最终压力测试。市场会更吵，这次别只忍住——去找证据。”"}
                  {fomoPhase === "evidence" &&
                    "“把热闹关小一点。只看证据：到底是什么真正发生了变化？”"}
                </p>
              </section>

              {/* 主游戏区：所有阶段都在原地替换 */}
              <div className="min-h-0 flex-1">
                {/* PHASE 1：自动行情 */}
                {(fomoPhase === "flight" || fomoPhase === "temptation") && (
                  <section className="flex h-full flex-col overflow-hidden rounded-[26px] border border-[#d8c9ee] bg-white/80 p-4 shadow-[0_16px_40px_rgba(180,130,190,0.12)]">
                    <div className="flex shrink-0 items-center justify-between">
                      <div>
                        <p className="text-[8px] font-black tracking-[0.15em] text-[#a78cae]">
                          STARWAVE TECH · LIVE
                        </p>
                        <p className="text-sm font-black text-[#5f5873]">
                          星浪科技
                        </p>
                      </div>

                      <span className="rounded-full bg-[#f4dfef] px-2.5 py-1 text-[9px] font-black text-[#b66f99]">
                        {fomoPhase === "flight" ? "行情运行中" : "机会窗口？"}
                      </span>
                    </div>

                    <div className="mt-2 grid min-h-0 flex-1 grid-cols-[1fr_1.15fr] gap-3">
                      {/* 左：火箭 */}
                      <div className="flex flex-col items-center justify-center rounded-[22px] bg-gradient-to-b from-[#fff6fb] to-[#eef8ff] p-3">
                        <p className="text-[8px] font-black tracking-[0.14em] text-[#a196aa]">
                          PRICE MOMENTUM
                        </p>
                        <div
                          className="mt-1 text-6xl transition-all duration-700"
                          style={{
                            transform: `translateY(${-flightTick * 3}px) rotate(${flightTick * 2}deg)`,
                          }}
                        >
                          🚀
                        </div>
                        <p className="mt-1 text-3xl font-black text-[#d7679a]">
                          {openingFlight[flightTick].gain}
                        </p>
                        <p className="text-[9px] font-bold text-[#9b8ea5]">
                          今日涨幅
                        </p>
                      </div>

                      {/* 右：热度 + 实时声音 */}
                      <div className="flex min-h-0 flex-col gap-2">
                        <div className="shrink-0 rounded-[18px] border border-[#eadcec] bg-[#fff8fc] p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black tracking-[0.12em] text-[#9d8ca7]">
                              MARKET HEAT
                            </span>
                            <span className="text-xs font-black text-[#c86798]">
                              {openingFlight[flightTick].heat}/100
                            </span>
                          </div>
                          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#eee4ef]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#8ed2f4] via-[#b79af0] to-[#f18eae] transition-all duration-700"
                              style={{
                                width: `${openingFlight[flightTick].heat}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="min-h-0 flex-1 rounded-[18px] border border-[#e3ddec] bg-white/70 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[8px] font-black tracking-[0.12em] text-[#a58ea9]">
                              LIVE CROWD FEED
                            </p>
                            <span className="text-[8px] font-black text-[#bd779f]">
                              {flightTick + 1} SIGNALS
                            </span>
                          </div>

                          <div className="mt-2 space-y-1.5">
                            {openingFlight
                              .slice(Math.max(0, flightTick - 2), flightTick + 1)
                              .map((item, index) => (
                                <div
                                  key={`${item.gain}-${index}`}
                                  className="rounded-xl bg-[#faf4fb] px-2.5 py-2 text-[10px] font-bold leading-4 text-[#756777]"
                                >
                                  {item.feed}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 shrink-0">
                      {fomoPhase === "flight" ? (
                        <div className="rounded-[18px] border border-[#d9d3ec] bg-[#f8f5ff] px-4 py-3 text-center">
                          <p className="text-[10px] font-black tracking-[0.12em] text-[#9386a3]">
                            行情正在自动推进 · 先不要操作
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-[1.35fr_1fr] gap-2">
                          <button
                            type="button"
                            onClick={() => chooseFirstAction("chase")}
                            className="animate-pulse rounded-[18px] bg-gradient-to-r from-[#f28fb5] to-[#df7fb9] px-3 py-3.5 text-sm font-black text-white shadow-[0_10px_26px_rgba(225,110,165,0.28)]"
                          >
                            🚀 现在上车
                          </button>

                          <button
                            type="button"
                            onClick={() => chooseFirstAction("wait")}
                            className="rounded-[18px] border border-[#cad8e8] bg-[#eef7ff] px-3 py-3.5 text-xs font-black text-[#6c8da4]"
                          >
                            🧊 继续观察
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* PHASE 2：追进去后，先涨后跌 */}
                {fomoPhase === "afterChase" && (
                  <section className="flex h-full flex-col rounded-[26px] border border-[#efb1c7] bg-gradient-to-b from-[#fff3f8] to-[#f5f1ff] p-4 shadow-[0_16px_40px_rgba(215,120,165,0.14)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[8px] font-black tracking-[0.15em] text-[#c36a93]">
                          POSITION OPENED
                        </p>
                        <p className="text-sm font-black text-[#65556b]">
                          你已经追涨上车
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
                          chaseTick >= 3
                            ? "bg-[#ffe1e7] text-[#d25876]"
                            : "bg-[#e6f8ef] text-[#4b9d79]"
                        }`}
                      >
                        {chaseSequence[chaseTick].label}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center">
                      <div
                        className={`text-7xl transition-all duration-500 ${
                          chaseTick >= 3 ? "rotate-[135deg]" : ""
                        }`}
                      >
                        🚀
                      </div>

                      <p
                        className={`mt-2 text-4xl font-black ${
                          chaseTick >= 3 ? "text-[#d85f78]" : "text-[#d5679a]"
                        }`}
                      >
                        {chaseSequence[chaseTick].gain}
                      </p>

                      <p className="mt-1 text-xs font-black text-[#8e7d92]">
                        {chaseTick < 3
                          ? "“看起来……你真的买对了？”"
                          : "⚠ MARKET REVERSAL"}
                      </p>

                      <div className="mt-4 w-full rounded-[20px] border border-white/70 bg-white/65 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black tracking-[0.12em] text-[#9d8ca7]">
                            MARKET HEAT
                          </span>
                          <span className="text-xs font-black text-[#c86798]">
                            {chaseSequence[chaseTick].heat}/100
                          </span>
                        </div>
                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#eee4ef]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#8ed2f4] via-[#b79af0] to-[#f18eae] transition-all duration-700"
                            style={{
                              width: `${chaseSequence[chaseTick].heat}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 rounded-[18px] border border-[#edcad9] bg-white/70 px-4 py-3 text-center">
                      <p className="text-[10px] font-black text-[#a96986]">
                        {chaseTick < 3
                          ? "短期上涨正在强化你的冲动……"
                          : "价格突然回落。接下来，回看自己的决策动机。"}
                      </p>
                    </div>
                  </section>
                )}

                {/* PHASE 3A：选择“继续观察”后的独立 FOMO 分支 */}
                {fomoPhase === "waitPressure" && (
                  <section className="flex h-full flex-col rounded-[26px] border border-[#d8c8ef] bg-gradient-to-b from-[#f8f4ff] to-[#fff4fa] p-4 shadow-[0_16px_40px_rgba(170,130,195,0.12)]">
                    <div className="shrink-0 flex items-center justify-between">
                      <div>
                        <p className="text-[8px] font-black tracking-[0.15em] text-[#a678ad]">
                          YOU WAITED · MARKET KEPT RISING
                        </p>
                        <p className="mt-0.5 text-sm font-black text-[#62576e]">
                          你没有追涨，但行情还在冲
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-[#d6679a]">
                          {waitPressureScene.gain}
                        </p>
                        <p className="text-[8px] font-black text-[#a67a93]">
                          MARKET HEAT {waitPressureScene.heat}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 grid min-h-0 flex-1 grid-cols-[0.8fr_1.2fr] gap-2">
                      <div className="flex flex-col items-center justify-center rounded-[20px] bg-white/60 p-2">
                        <div className="text-6xl">🚀</div>
                        <p className="mt-2 text-[8px] font-black tracking-[0.12em] text-[#ae728e]">
                          FOMO PRESSURE
                        </p>
                        <p className="mt-1 text-xl font-black text-[#cf6998]">
                          {waitPressureScene.fomo}%
                        </p>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#f0dfe9]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#b8a7ed] via-[#e992c4] to-[#ff859c]"
                            style={{ width: `${waitPressureScene.fomo}%` }}
                          />
                        </div>
                      </div>

                      <div className="min-h-0 rounded-[20px] border border-[#ead7e8] bg-white/65 p-2.5">
                        <p className="text-[8px] font-black tracking-[0.12em] text-[#aa7799]">
                          LIVE CROWD FEED
                        </p>

                        <div className="mt-1.5 space-y-1.5">
                          {waitPressureScene.feed.map((message) => (
                            <div
                              key={message}
                              className="rounded-lg bg-[#fff7fb] px-2 py-1.5 text-[9px] font-bold leading-3.5 text-[#765f70]"
                            >
                              {message}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 shrink-0">
                      <p className="text-center text-[11px] font-black text-[#685e73]">
                        现在，你最明显感受到的是什么？
                      </p>

                      <div className="mt-2 grid grid-cols-1 gap-1.5">
                        {[
                          {
                            id: "regret" as WaitReflectionChoice,
                            text: "😵 有点后悔刚才没买，怕它继续涨、自己彻底错过",
                          },
                          {
                            id: "fundamental" as WaitReflectionChoice,
                            text: "🏢 它继续涨，说明基本面一定突然变好了",
                          },
                          {
                            id: "safe" as WaitReflectionChoice,
                            text: "✅ 涨得越快，说明现在买进去反而越安全",
                          },
                        ].map((choice) => (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => {
                              setWaitReflectionChoice(choice.id);
                              setWaitReflectionWrong(false);
                            }}
                            className={`rounded-[14px] border px-3 py-2 text-left text-[10px] font-bold leading-4 ${
                              waitReflectionChoice === choice.id
                                ? "border-[#df8db8] bg-[#fff0f7] text-[#7a526b]"
                                : "border-[#e0dbea] bg-white/75 text-[#70697c]"
                            }`}
                          >
                            {choice.text}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!waitReflectionChoice}
                      onClick={submitWaitReflection}
                      className="mt-2 shrink-0 rounded-[18px] bg-gradient-to-r from-[#8ecdf2] via-[#b49aed] to-[#eb96c1] py-3 text-sm font-black text-white disabled:opacity-35"
                    >
                      识别这股感觉
                    </button>

                    {waitReflectionWrong && !gameOver && (
                      <p className="mt-1.5 shrink-0 text-center text-[9px] font-bold text-[#c96791]">
                        💔 行情上涨没有自动带来新的基本面证据，也不会让追涨变得更安全。
                      </p>
                    )}
                  </section>
                )}

                {/* PHASE 3B：选择“现在上车”后的追涨反思 */}
                {fomoPhase === "reflection" && (
                  <section className="flex h-full flex-col rounded-[26px] border border-[#d9cbed] bg-white/80 p-4">
                    <div className="shrink-0 text-center">
                      <div className="text-4xl">🪞</div>
                      <p className="mt-1 text-[9px] font-black tracking-[0.15em] text-[#af78a0]">
                        DECISION REPLAY
                      </p>
                      <h3 className="mt-1 text-lg font-black text-[#5f566e]">
                        刚才真正推动你买入的是什么？
                      </h3>
                    </div>

                    <div className="mt-3 grid flex-1 grid-rows-3 gap-2">
                      {[
                        {
                          id: "logic" as ReflectionChoice,
                          text: "📊 因为基本面出现了新的重大变化",
                        },
                        {
                          id: "fomo" as ReflectionChoice,
                          text: "😵 因为它一直涨，我怕再不上车就错过",
                        },
                        {
                          id: "trend" as ReflectionChoice,
                          text: "📈 因为上涨本身就证明这是一笔好投资",
                        },
                      ].map((choice) => (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => {
                            setReflectionChoice(choice.id);
                            setReflectionWrong(false);
                          }}
                          className={`flex items-center rounded-[18px] border px-4 text-left text-[12px] font-bold leading-[18px] ${
                            reflectionChoice === choice.id
                              ? "border-[#df8db8] bg-[#fff0f7] text-[#7a526b]"
                              : "border-[#e0dbea] bg-white/70 text-[#70697c]"
                          }`}
                        >
                          {choice.text}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={!reflectionChoice}
                      onClick={submitReflection}
                      className="mt-3 shrink-0 rounded-[18px] bg-gradient-to-r from-[#8ecdf2] via-[#b49aed] to-[#eb96c1] py-3.5 text-sm font-black text-white disabled:opacity-35"
                    >
                      锁定真正动机
                    </button>

                    {reflectionWrong && !gameOver && (
                      <p className="mt-2 shrink-0 text-center text-[10px] font-bold text-[#c96791]">
                        💔 再想想：刚才并没有出现新的基本面证据，你却因为上涨而追了进去。
                      </p>
                    )}
                  </section>
                )}

                {/* PHASE 4：FOMO 概念解锁 */}
                {fomoPhase === "concept" && (
                  <section className="flex h-full flex-col items-center justify-center rounded-[26px] border-2 border-[#e99abe] bg-gradient-to-br from-[#fff4fa] via-[#f7efff] to-[#eef8ff] p-5 text-center shadow-[0_15px_35px_rgba(210,135,180,0.15)]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#f4b6d3] text-3xl shadow-md">
                      🧠
                    </div>

                    <p className="mt-4 text-[9px] font-black tracking-[0.2em] text-[#bd6b98]">
                      NEW CONCEPT UNLOCKED
                    </p>

                    <h3 className="mt-1 text-4xl font-black text-[#c15f93]">
                      FOMO
                    </h3>

                    <p className="mt-2 text-base font-black text-[#6a5b70]">
                      Fear of Missing Out
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#8c7386]">
                      错失恐惧 · 害怕错过
                    </p>

                    <div className="mt-4 rounded-[20px] border border-[#efc5dc] bg-white/65 p-4 text-left">
                      <p className="text-[12px] leading-5 text-[#786a79]">
                        当“别人都赚到了”“再不上车就没机会了”开始催你行动，
                        你可能不是在根据投资逻辑决策，而是在被
                        <span className="font-black text-[#c65f91]">
                          “怕错过”
                        </span>
                        推着走。
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={enterBoss}
                      className="mt-4 w-full rounded-[18px] bg-gradient-to-r from-[#ef8fb9] via-[#c68fe9] to-[#8fcdf2] py-3.5 text-sm font-black text-white"
                    >
                      我认识它了 · 进入最终压力测试 →
                    </button>
                  </section>
                )}

                {/* PHASE 5：最终 Boss */}
                {fomoPhase === "boss" && (
                  <section className="flex h-full flex-col overflow-hidden rounded-[26px] border-2 border-[#ef9eb7] bg-gradient-to-b from-[#fff0f4] via-[#f9edff] to-[#eef8ff] p-4 shadow-[0_0_35px_rgba(238,110,155,0.16)]">
                    <div className="flex shrink-0 items-center justify-between">
                      <div>
                        <p className="text-[8px] font-black tracking-[0.15em] text-[#d2587c]">
                          ⚠ EXTREME SENTIMENT
                        </p>
                        <p className="text-sm font-black text-[#65546b]">
                          星浪科技 · 最终压力测试
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-[#dd5f8e]">
                          +24.8%
                        </p>
                        <p className="text-[8px] font-black text-[#b77591]">
                          FOMO 96%
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 grid min-h-0 flex-1 grid-cols-[0.8fr_1.2fr] gap-2">
                      <div className="flex flex-col items-center justify-center rounded-[20px] bg-white/55 p-2">
                        <div className="text-6xl">🚀</div>
                        <div className="mt-2 w-full">
                          <p className="text-center text-[8px] font-black text-[#ae728e]">
                            FOMO PRESSURE
                          </p>
                          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#f0dfe7]">
                            <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-[#d4a7ed] via-[#ef83ba] to-[#ff7185]" />
                          </div>
                        </div>
                      </div>

                      <div className="min-h-0 rounded-[20px] border border-[#f0cbdc] bg-white/60 p-2.5">
                        <p className="text-[8px] font-black tracking-[0.12em] text-[#b66d91]">
                          LIVE CROWD FEED
                        </p>
                        <div className="mt-1.5 space-y-1">
                          {bossFeed.slice(0, 5).map((message) => (
                            <div
                              key={message}
                              className="rounded-lg bg-[#fff7fb] px-2 py-1.5 text-[9px] font-bold leading-3.5 text-[#765c6b]"
                            >
                              {message}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 shrink-0 grid grid-cols-3 gap-2">
                      {[
                        {
                          id: "chase" as BossChoice,
                          text: "🔥 追涨",
                        },
                        {
                          id: "wait" as BossChoice,
                          text: "⏰ 再等等",
                        },
                        {
                          id: "evidence" as BossChoice,
                          text: "🛡 查证据",
                        },
                      ].map((choice) => (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => {
                            setBossChoice(choice.id);
                            setBossWrong(false);
                          }}
                          className={`rounded-[16px] border px-2 py-3 text-[11px] font-black ${
                            bossChoice === choice.id
                              ? "border-[#dc86b0] bg-[#fff0f7] text-[#a65d85]"
                              : "border-[#e3d7e7] bg-white/70 text-[#766b7c]"
                          }`}
                        >
                          {choice.text}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={!bossChoice}
                      onClick={submitBossChoice}
                      className="mt-2 shrink-0 rounded-[18px] bg-gradient-to-r from-[#ee8fb7] via-[#c891e8] to-[#8fcdf2] py-3 text-sm font-black text-white disabled:opacity-35"
                    >
                      执行决定
                    </button>

                    {bossWrong && !gameOver && (
                      <p className="mt-1.5 shrink-0 text-center text-[9px] font-bold text-[#c95e82]">
                        💔 极端行情里，“继续追”或“只等价格”都没有增加投资证据。
                      </p>
                    )}
                  </section>
                )}

                {/* PHASE 6：Evidence Mode */}
                {fomoPhase === "evidence" && (
                  <section className="flex h-full flex-col rounded-[26px] border border-[#b8d7e7] bg-gradient-to-b from-[#f3fbff] to-[#faf5ff] p-4">
                    <div className="shrink-0 flex items-center justify-between">
                      <div>
                        <p className="text-[8px] font-black tracking-[0.16em] text-[#6799b5]">
                          EVIDENCE MODE
                        </p>
                        <h3 className="text-base font-black text-[#566775]">
                          关掉情绪噪音，只看证据
                        </h3>
                      </div>
                      <span className="rounded-full bg-[#e3f5ff] px-2.5 py-1 text-[9px] font-black text-[#6092ad]">
                        🛡 CALM MODE
                      </span>
                    </div>

                    <div className="mt-2 grid shrink-0 grid-cols-2 gap-2">
                      {evidenceCards.map((card) => (
                        <div
                          key={card.title}
                          className={`rounded-[16px] border p-2.5 ${
                            card.tone === "hot"
                              ? "border-[#efc2d4] bg-[#fff3f8]"
                              : card.tone === "warning"
                                ? "border-[#ead7b8] bg-[#fffaf0]"
                                : "border-[#d2e3eb] bg-white/70"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{card.icon}</span>
                            <p className="text-[10px] font-black text-[#6a6873]">
                              {card.title}
                            </p>
                          </div>
                          <p className="mt-1 text-[9px] font-bold leading-3.5 text-[#887d89]">
                            {card.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-2 shrink-0 text-center text-[11px] font-black text-[#65727f]">
                      现在，真正变化最大的是哪一组？
                    </p>

                    <div className="mt-2 grid flex-1 grid-rows-3 gap-1.5">
                      {[
                        {
                          id: "fundamental" as EvidenceChoice,
                          text: "🏢 基本面发生重大改善",
                        },
                        {
                          id: "price-sentiment" as EvidenceChoice,
                          text: "🚀 价格与市场情绪急剧升温",
                        },
                        {
                          id: "valuation" as EvidenceChoice,
                          text: "💰 估值变得更便宜、更安全",
                        },
                      ].map((choice) => (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => {
                            setEvidenceChoice(choice.id);
                            setEvidenceWrong(false);
                          }}
                          className={`flex items-center rounded-[16px] border px-3 text-left text-[11px] font-bold ${
                            evidenceChoice === choice.id
                              ? "border-[#89bfdc] bg-[#eef9ff] text-[#527891]"
                              : "border-[#e0dbea] bg-white/70 text-[#70697c]"
                          }`}
                        >
                          {choice.text}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={!evidenceChoice}
                      onClick={submitEvidenceChoice}
                      className="mt-2 shrink-0 rounded-[18px] bg-gradient-to-r from-[#8fcdf2] via-[#a8b4ef] to-[#d898d8] py-3 text-sm font-black text-white disabled:opacity-35"
                    >
                      提交证据判断
                    </button>

                    {evidenceWrong && !gameOver && (
                      <p className="mt-1.5 shrink-0 text-center text-[9px] font-bold text-[#c96791]">
                        💔 基本面没出现新变化，估值反而更贵。再看一眼。
                      </p>
                    )}
                  </section>
                )}
              </div>

              {/* 单屏底部提示 */}
              <p className="shrink-0 text-center text-[8px] font-bold leading-3 text-[#a399ad]">
                市场情绪只能作为辅助信号，不构成任何投资建议。
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            SENTIMENT GAME COMPLETE
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