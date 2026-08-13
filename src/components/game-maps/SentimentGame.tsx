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
    explanation: "“彻底崩了”“完了”这类表达带有明显的灾难化和恐慌情绪。",
  },
  {
    id: 2,
    source: "公司公告",
    icon: "📰",
    text: "公司发布季度报告，营业收入同比增长 6.2%。",
    correct: "neutral",
    explanation: "这是一条以事实陈述为主的信息，本身没有明显情绪倾向。",
  },
  {
    id: 3,
    source: "热门评论",
    icon: "🔥",
    text: "这票不可能跌！现在不上车以后只会更贵！",
    correct: "hype",
    explanation: "“不可能跌”“不上车就晚了”是典型的狂热和追涨情绪。",
  },
  {
    id: 4,
    source: "市场快讯",
    icon: "📡",
    text: "主要指数午后小幅回升，成交量较昨日基本持平。",
    correct: "neutral",
    explanation: "这条信息主要描述市场变化，没有明显的恐慌或狂热表达。",
  },
  {
    id: 5,
    source: "社交平台",
    icon: "⚠️",
    text: "赶紧跑！我身边的人都在清仓，再不卖就来不及了！",
    correct: "panic",
    explanation: "“赶紧跑”“来不及了”体现了强烈的群体恐慌和逃离情绪。",
  },
];

const radarItems: RadarItem[] = [
  {
    id: "search",
    icon: "📈",
    source: "搜索热度",
    text: '"星浪科技"24 小时搜索热度上涨 386%',
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
    text: '"满仓冲！""这次绝对不会跌！"等评论开始大量刷屏',
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
  { gain: "+10.5%", heat: 51, feed: "🔥 '是不是要突破了？'" },
  { gain: "+12.8%", heat: 61, feed: "💬 '我刚买就赚了！'" },
  { gain: "+15.7%", heat: 70, feed: "🚀 '还没上车的人真能忍。'" },
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
    "💬 '我朋友已经赚 18% 了！'",
    "🔥 '现在不上车，下一站可能就是 +30%！'",
  ],
};

const bossFeed = [
  "🚀 '起飞！！！今天不可能回头了！'",
  "🔥 '满仓！这种机会一辈子就一次！'",
  "💬 '你还在分析？别人已经赚钱了！'",
  "📣 '最后上车机会！'",
  "⚡ '目标价至少再翻倍！'",
  "😵 '不买真的会后悔！'",
];

const evidenceCards = [
  { icon: "🏢", title: "基本面", value: "没有新的重大变化", tone: "neutral" },
  { icon: "💰", title: "估值", value: "已明显高于此前水平", tone: "warning" },
  { icon: "🚀", title: "股价", value: "+24.8% · 快速拉升", tone: "hot" },
  { icon: "🔥", title: "社区情绪", value: "极度狂热 · FOMO 高发", tone: "hot" },
];

const moodMeta: Record<Mood, { label: string; english: string; icon: string; activeClass: string }> = {
  panic: {
    label: "恐慌",
    english: "PANIC",
    icon: "😱",
    activeClass: "border-[#8cc9ef] bg-[#e7f5ff] text-[#4f86ad] shadow-[0_0_24px_rgba(110,190,240,0.25)]",
  },
  neutral: {
    label: "中性",
    english: "NEUTRAL",
    icon: "😐",
    activeClass: "border-[#c7b9ec] bg-[#f3efff] text-[#75649b] shadow-[0_0_24px_rgba(180,160,230,0.20)]",
  },
  hype: {
    label: "狂热",
    english: "HYPE",
    icon: "🔥",
    activeClass: "border-[#efa6ce] bg-[#fff0f7] text-[#b45e8e] shadow-[0_0_24px_rgba(240,150,200,0.25)]",
  },
};

// ===== Props =====
export type SentimentGameProps = {
  onBack?: () => void;
  onComplete?: () => void;
};

// ===== Agent Message Component =====
function AgentMessage({ children, alert = false }: { children: React.ReactNode; alert?: boolean }) {
  return (
    <section
      className={`relative mt-8 rounded-[26px] border p-4 pl-[82px] shadow-[0_12px_35px_rgba(141,116,180,0.10)] ${
        alert ? "border-[#f0adc5] bg-[#fff2f7]" : "border-[#d9c9ef] bg-[#fff8fd]"
      }`}
    >
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
          <p className="text-[11px] font-black tracking-[0.15em] text-[#c36fa8]">SENTIMENT AGENT</p>
          <span className="rounded-full bg-[#eedff7] px-2 py-0.5 text-[9px] font-bold text-[#87689b]">
            市场情绪观察员
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#655f78]">{children}</p>
      </div>
    </section>
  );
}

// ===== Main Component =====
export function SentimentGame({ onBack, onComplete }: SentimentGameProps) {
  const [round, setRound] = useState<Round>(1);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  /* ROUND 1 */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [moodFeedback, setMoodFeedback] = useState<"correct" | "wrong" | null>(null);
  const [round1Complete, setRound1Complete] = useState(false);
  const currentItem = moodItems[currentIndex];

  /* ROUND 2 */
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [radarWrong, setRadarWrong] = useState(false);
  const [round2Complete, setRound2Complete] = useState(false);

  /* ROUND 3 */
  const [fomoPhase, setFomoPhase] = useState<FomoPhase>("flight");
  const [flightTick, setFlightTick] = useState(0);
  const [chaseTick, setChaseTick] = useState(0);
  const [firstAction, setFirstAction] = useState<"chase" | "wait" | null>(null);
  const [reflectionChoice, setReflectionChoice] = useState<ReflectionChoice | null>(null);
  const [reflectionWrong, setReflectionWrong] = useState(false);
  const [waitReflectionChoice, setWaitReflectionChoice] = useState<WaitReflectionChoice | null>(null);
  const [waitReflectionWrong, setWaitReflectionWrong] = useState(false);
  const [bossChoice, setBossChoice] = useState<BossChoice | null>(null);
  const [bossWrong, setBossWrong] = useState(false);
  const [evidenceChoice, setEvidenceChoice] = useState<EvidenceChoice | null>(null);
  const [evidenceWrong, setEvidenceWrong] = useState(false);
  const [round3Complete, setRound3Complete] = useState(false);

  const correctSignalIds = radarItems.filter((item) => item.isSignal).map((item) => item.id);

  function loseLife() {
    const nextLives = lives - 1;
    setLives(nextLives);
    if (nextLives <= 0) setGameOver(true);
  }

  /* ROUND 1 */
  function handleMoodSelect(mood: Mood) {
    if (moodFeedback || gameOver || round1Complete) return;
    setSelectedMood(mood);
  }

  function submitMoodAnswer() {
    if (!selectedMood || moodFeedback || gameOver || round1Complete) return;
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

  /* ROUND 2 */
  function toggleSignal(id: string) {
    if (gameOver || round2Complete) return;
    setRadarWrong(false);
    setSelectedSignals((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  function submitRadar() {
    if (selectedSignals.length !== 2) return;
    const correct = correctSignalIds.every((id) => selectedSignals.includes(id));
    if (correct) {
      setRound2Complete(true);
      setRadarWrong(false);
      return;
    }
    loseLife();
    setRadarWrong(true);
    setSelectedSignals([]);
  }

  /* ROUND 3 */
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
      const timer = window.setTimeout(() => setFlightTick((prev) => prev + 1), 900);
      return () => window.clearTimeout(timer);
    }
    if (fomoPhase === "afterChase") {
      if (chaseTick >= chaseSequence.length - 1) {
        const timer = window.setTimeout(() => setFomoPhase("reflection"), 1100);
        return () => window.clearTimeout(timer);
      }
      const timer = window.setTimeout(() => setChaseTick((prev) => prev + 1), 900);
      return () => window.clearTimeout(timer);
    }
  }, [round, gameOver, round3Complete, fomoPhase, flightTick, chaseTick]);

  // 通关后调用 onComplete
  useEffect(() => {
    if (round3Complete) {
      onComplete?.();
    }
  }, [round3Complete, onComplete]);

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

  const round1Progress = ((currentIndex + (moodFeedback === "correct" ? 1 : 0)) / moodItems.length) * 100;
  const overallRound = round === 1 ? "ROUND 1 / 3" : round === 2 ? "ROUND 2 / 3" : "ROUND 3 / 3";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#eef7ff] via-[#f7f1ff] to-[#fff0f8] px-4 py-8 text-[#504a68]">
      <div className="mx-auto w-full max-w-md">
        {/* ===== TOP HUD ===== */}
        <section className="rounded-[26px] border border-[#dacff0] bg-white/75 p-4 shadow-[0_18px_50px_rgba(150,125,185,0.14)] backdrop-blur-md">
          {/* 返回按钮 */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 rounded-full bg-[#f0e8f7] px-3 py-1.5 text-[10px] font-bold text-[#7a6190] transition-all hover:bg-[#e5d9f0]"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              返回金融华尔界
            </button>

            {/* 红心 */}
            <div className="text-right">
              <p className="text-[9px] font-bold tracking-[0.16em] text-[#a291ad]">EMOTION ENERGY</p>
              <div className="mt-1 flex justify-end gap-1">
                {[0, 1, 2].map((heart) => (
                  <span
                    key={heart}
                    className={`text-xl transition-all ${
                      heart < lives ? "scale-100 opacity-100" : "scale-90 grayscale opacity-20"
                    }`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black tracking-[0.22em] text-[#c26fa7]">SENTIMENT AGENT</p>
              <h1 className="mt-1 text-2xl font-black text-[#514a6b]">市场情绪实验室</h1>
              <p className="mt-1 text-xs font-bold text-[#9a8cae]">{overallRound}</p>
            </div>
          </div>
          {/* Round 总进度 */}
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-[10px] font-bold text-[#a397b4]">
              <span>MISSION PROGRESS</span>
              <span>{round === 1 ? "情绪扫描" : round === 2 ? "舆情雷达" : "FOMO 火箭"}</span>
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
                            : fomoPhase === "afterChase" || fomoPhase === "waitPressure" || fomoPhase === "reflection"
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

        {/* ===== GAME OVER ===== */}
        {gameOver && (
          <>
            <AgentMessage alert>
              "市场里的声音太吵了。没关系，真正的情绪判断需要练习。重新来一次，这次先分清事实和情绪。"
            </AgentMessage>
            <section className="mt-5 rounded-[30px] border-2 border-[#efa9c4] bg-[#fff2f7] p-6 text-center shadow-[0_18px_45px_rgba(230,140,180,0.15)]">
              <div className="text-5xl">💔</div>
              <p className="mt-3 text-[11px] font-black tracking-[0.2em] text-[#cf6e99]">EMOTION OVERLOAD</p>
              <h2 className="mt-2 text-2xl font-black text-[#68516b]">情绪失控</h2>
              <p className="mt-3 text-sm leading-6 text-[#8a7187]">三颗情绪能量已经耗尽。</p>
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

        {/* ===== ROUND 1 ===== */}
        {!gameOver && round === 1 && !round1Complete && (
          <>
            <AgentMessage>
              "第一步很简单。先别判断市场会涨还是跌——听听这些话本身是什么情绪。"
            </AgentMessage>
            <section className="mt-5 rounded-[24px] border border-[#d8d3ee] bg-white/65 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black tracking-[0.18em] text-[#a58bc1]">ROUND 1</p>
                  <p className="mt-1 font-black text-[#5e5776]">情绪扫描 · MOOD SCAN</p>
                </div>
                <div className="rounded-full bg-[#f4e7f5] px-3 py-1 text-xs font-black text-[#ba6d9e]">
                  {currentIndex + 1}/{moodItems.length}
                </div>
              </div>
            </section>
            {/* 信息卡 */}
            <section className="relative mt-4 overflow-hidden rounded-[30px] border border-[#d3daf1] bg-white/80 p-5 shadow-[0_18px_45px_rgba(120,140,180,0.12)]">
              <div className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-[#9fdcff]/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-[#f0abd2]/20 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentItem.icon}</span>
                  <span className="rounded-full border border-[#d5dbed] bg-[#f5f7ff] px-2.5 py-0.5 text-[9px] font-bold tracking-[0.1em] text-[#8c93ac]">
                    {currentItem.source}
                  </span>
                </div>
                <p className="mt-4 text-base font-bold leading-7 text-[#434356]">"{currentItem.text}"</p>
              </div>
            </section>
            {/* 情绪选择 */}
            <section className="mt-4 grid grid-cols-3 gap-3">
              {(["panic", "neutral", "hype"] as Mood[]).map((mood) => {
                const meta = moodMeta[mood];
                const isActive = selectedMood === mood;
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => handleMoodSelect(mood)}
                    className={`rounded-2xl border-2 p-3 text-center transition-all duration-200 ${
                      isActive ? meta.activeClass : "border-[#e6def0] bg-white text-[#9a8ca8]"
                    }`}
                  >
                    <p className="text-2xl">{meta.icon}</p>
                    <p className="mt-1 text-[11px] font-black">{meta.label}</p>
                    <p className="text-[8px] font-bold tracking-wider opacity-70">{meta.english}</p>
                  </button>
                );
              })}
            </section>
            {/* 提交 */}
            {selectedMood && !moodFeedback && (
              <button
                type="button"
                onClick={submitMoodAnswer}
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#8ecdf2] via-[#b59cf0] to-[#ef9ac9] py-3.5 font-black text-white shadow-[0_8px_22px_rgba(180,140,220,0.25)]"
              >
                确认判断
              </button>
            )}
            {/* 反馈 */}
            {moodFeedback === "correct" && (
              <section className="mt-4 rounded-2xl border border-[#b2e0b2] bg-[#efffef] p-4">
                <p className="text-sm font-bold text-[#2d7a4a]">✅ 正确！</p>
                <p className="mt-1 text-xs leading-5 text-[#437a55]">{currentItem.explanation}</p>
                <button
                  type="button"
                  onClick={goNextMood}
                  className="mt-3 rounded-xl bg-gradient-to-r from-[#62c974] to-[#4ab05c] px-5 py-2 text-xs font-black text-white"
                >
                  {currentIndex === moodItems.length - 1 ? "进入下一轮 →" : "下一条 →"}
                </button>
              </section>
            )}
            {moodFeedback === "wrong" && (
              <section className="mt-4 rounded-2xl border border-[#f0adc5] bg-[#fff2f7] p-4">
                <p className="text-sm font-bold text-[#b45e6e]">❌ 再想想</p>
                <p className="mt-1 text-xs leading-5 text-[#8a6a72]">
                  这条信息其实带有明显的
                  <strong>{moodMeta[currentItem.correct].label}</strong>情绪。
                </p>
                <button
                  type="button"
                  onClick={retryMood}
                  className="mt-3 rounded-xl bg-gradient-to-r from-[#e88fbd] to-[#d975a8] px-5 py-2 text-xs font-black text-white"
                >
                  重新判断
                </button>
              </section>
            )}
          </>
        )}

        {/* ===== ROUND 1 COMPLETE → 进入 Round 2 ===== */}
        {!gameOver && round === 1 && round1Complete && (
          <>
            <AgentMessage>
              "不错！你已经能分辨出恐慌、中性和狂热的语气了。这只是第一步——在真实市场中，这些情绪会伪装成'新闻'和'快讯'，让你误以为它们很重要。准备好了吗？"
            </AgentMessage>
            <button
              type="button"
              onClick={enterRound2}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#8ecdf2] via-[#b59cf0] to-[#ef9ac9] py-4 font-black text-white shadow-[0_12px_30px_rgba(180,140,220,0.25)]"
            >
              进入舆情雷达 →
            </button>
          </>
        )}

        {/* ===== ROUND 2 ===== */}
        {!gameOver && round === 2 && !round2Complete && (
          <>
            <AgentMessage>
              "你的情报板上有 5 条信息。其中只有 2 条是真正的'异动信号'——意味着它们可能预示着股价的重大变化。请选出那 2 条信号。"
            </AgentMessage>
            <section className="mt-5 rounded-[24px] border border-[#d8d3ee] bg-white/65 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black tracking-[0.18em] text-[#a58bc1]">ROUND 2</p>
                  <p className="mt-1 font-black text-[#5e5776]">舆情雷达 · SIGNAL SCAN</p>
                </div>
                <div className="rounded-full bg-[#f4e7f5] px-3 py-1 text-xs font-black text-[#ba6d9e]">
                  {selectedSignals.length}/2
                </div>
              </div>
            </section>
            {/* 雷达卡片 */}
            <section className="mt-4 space-y-3">
              {radarItems.map((item) => {
                const isSelected = selectedSignals.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSignal(item.id)}
                    className={`w-full rounded-[20px] border-2 p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-[#b59cf0] bg-[#f5f0ff] shadow-[0_0_20px_rgba(180,155,230,0.2)]"
                        : "border-[#e0daf0] bg-white/75 hover:border-[#cdc0e8]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="rounded-full border border-[#e0daf0] bg-[#f8f5ff] px-2 py-0.5 text-[9px] font-bold text-[#9a8ca8]">
                        {item.source}
                      </span>
                      {isSelected && (
                        <span className="ml-auto rounded-full bg-[#b59cf0] px-2 py-0.5 text-[9px] font-black text-white">
                          已选
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#434356]">{item.text}</p>
                  </button>
                );
              })}
            </section>
            {/* 提交 */}
            {selectedSignals.length === 2 && (
              <button
                type="button"
                onClick={submitRadar}
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#8ecdf2] via-[#b59cf0] to-[#ef9ac9] py-3.5 font-black text-white shadow-[0_8px_22px_rgba(180,140,220,0.25)]"
              >
                确认信号
              </button>
            )}
            {radarWrong && (
              <section className="mt-4 rounded-2xl border border-[#f0adc5] bg-[#fff2f7] p-4">
                <p className="text-sm font-bold text-[#b45e6e]">❌ 信号识别错误</p>
                <p className="mt-1 text-xs leading-5 text-[#8a6a72]">
                  提示：真正的异动信号通常伴随着搜索热度飙升、社区情绪极端化等特征。
                </p>
              </section>
            )}
          </>
        )}

        {/* ===== ROUND 2 COMPLETE → 进入 Round 3 ===== */}
        {!gameOver && round === 2 && round2Complete && (
          <>
            <AgentMessage>
              "很好！你已经学会在噪音中识别真正的信号。但最难的挑战还在后面——当市场情绪达到顶峰，你能否保持冷静？"
            </AgentMessage>
            <button
              type="button"
              onClick={enterRound3}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#8ecdf2] via-[#b59cf0] to-[#ef9ac9] py-4 font-black text-white shadow-[0_12px_30px_rgba(180,140,220,0.25)]"
            >
              进入 FOMO 挑战 →
            </button>
          </>
        )}

        {/* ===== ROUND 3 ===== */}
        {!gameOver && round === 3 && !round3Complete && (
          <>
            {/* 阶段 1: 起飞阶段 - 自动播放 */}
            {fomoPhase === "flight" && (
              <>
                <AgentMessage alert>
                  "⚠️ 检测到一只股票正在快速拉升。市场情绪正在升温…"
                </AgentMessage>
                <section className="mt-5 space-y-3">
                  {openingFlight.slice(0, flightTick + 1).map((item, i) => (
                    <div
                      key={i}
                      className="animate-fadeIn rounded-[20px] border border-[#e0daf0] bg-white/75 p-4"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-[#fff0f5] px-2.5 py-0.5 text-xs font-black text-[#d46a8e]">
                          {item.gain}
                        </span>
                        <span className="text-[10px] font-bold text-[#a38cb5]">热度 {item.heat}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[#5e5776]">{item.feed}</p>
                    </div>
                  ))}
                  {flightTick >= openingFlight.length - 1 && (
                    <p className="animate-pulse text-center text-xs font-bold text-[#cf6e99]">
                      市场情绪正在升温...
                    </p>
                  )}
                </section>
              </>
            )}

            {/* 阶段 2: 诱惑 - 选择追涨还是等待 */}
            {fomoPhase === "temptation" && (
              <>
                <AgentMessage alert>
                  "股价已经涨了 +15.7%！市场的讨论热度快速上升，现在你打算怎么做？"
                </AgentMessage>
                <section className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => chooseFirstAction("chase")}
                    className="rounded-2xl border-2 border-[#efa6ce] bg-[#fff0f7] p-5 text-center transition-all hover:shadow-[0_0_24px_rgba(240,150,200,0.3)]"
                  >
                    <p className="text-3xl">🚀</p>
                    <p className="mt-2 text-sm font-black text-[#b45e8e]">追涨买入</p>
                    <p className="mt-1 text-[10px] font-bold text-[#8a6a82]">不想错过这波行情</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => chooseFirstAction("wait")}
                    className="rounded-2xl border-2 border-[#c7b9ec] bg-[#f3efff] p-5 text-center transition-all hover:shadow-[0_0_24px_rgba(180,160,230,0.3)]"
                  >
                    <p className="text-3xl">🧘</p>
                    <p className="mt-2 text-sm font-black text-[#75649b]">继续观察</p>
                    <p className="mt-1 text-[10px] font-bold text-[#75649b]">先看看情况</p>
                  </button>
                </section>
              </>
            )}

            {/* 阶段 3: 追涨后 - 体验追涨后的起伏 */}
            {fomoPhase === "afterChase" && (
              <>
                <AgentMessage alert>
                  "你选择了追涨买入。接下来会发生什么？"
                </AgentMessage>
                <section className="mt-5 space-y-3">
                  {chaseSequence.slice(0, chaseTick + 1).map((item, i) => (
                    <div
                      key={i}
                      className={`animate-fadeIn rounded-[20px] border p-4 ${
                        item.label === "MARKET REVERSAL"
                          ? "border-[#f0adc5] bg-[#fff2f7]"
                          : item.label === "快速回落"
                            ? "border-[#c7d4f0] bg-[#f5f8ff]"
                            : "border-[#e0f0d8] bg-[#f5fff2]"
                      }`}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                            item.label === "MARKET REVERSAL" || item.label === "快速回落"
                              ? "bg-[#ffe8ee] text-[#d45a6e]"
                              : "bg-[#e0ffe8] text-[#3a9a5a]"
                          }`}
                        >
                          {item.gain}
                        </span>
                        <span className="text-[10px] font-bold text-[#a38cb5]">热度 {item.heat}</span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-[#5e5776]">{item.label}</p>
                    </div>
                  ))}
                </section>
              </>
            )}

            {/* 阶段 4: 等待后的压力 - 没买也有 FOMO */}
            {fomoPhase === "waitPressure" && (
              <>
                <AgentMessage alert>
                  "你没有买入，但股价继续上涨……"
                </AgentMessage>
                <section className="mt-5 rounded-[20px] border border-[#d8d3ee] bg-white/75 p-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#e0ffe8] px-3 py-1 text-sm font-black text-[#3a9a5a]">
                      {waitPressureScene.gain}
                    </span>
                    <span className="text-xs font-bold text-[#a38cb5]">热度 {waitPressureScene.heat}</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {waitPressureScene.feed.map((f, i) => (
                      <p key={i} className="text-sm font-semibold leading-6 text-[#5e5776]">
                        {f}
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl bg-[#fff0f7] p-3 text-center">
                    <p className="text-xs font-bold text-[#cf6e99]">
                      你的 FOMO 指数：{waitPressureScene.fomo}/100
                    </p>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#f0e0f0]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#f0a0c0] to-[#e880b0]"
                        style={{ width: `${waitPressureScene.fomo}%` }}
                      />
                    </div>
                  </div>
                </section>
                <section className="mt-4">
                  <p className="text-center text-xs font-bold text-[#9a8cae]">
                    没有追涨的你，现在是什么感觉？
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {(["regret", "fundamental", "safe"] as WaitReflectionChoice[]).map((choice) => {
                      const labels: Record<WaitReflectionChoice, { label: string; icon: string }> = {
                        regret: { label: "后悔没买", icon: "😣" },
                        fundamental: { label: "看基本面", icon: "📊" },
                        safe: { label: "安全第一", icon: "🛡️" },
                      };
                      const isActive = waitReflectionChoice === choice;
                      const isWrong = waitReflectionWrong && choice === waitReflectionChoice;
                      return (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setWaitReflectionChoice(choice)}
                          className={`rounded-xl border-2 p-3 text-center transition-all ${
                            isActive && !isWrong
                              ? "border-[#b59cf0] bg-[#f5f0ff]"
                              : isWrong
                                ? "border-[#f0adc5] bg-[#fff2f7]"
                                : "border-[#e0daf0] bg-white/75"
                          }`}
                        >
                          <p className="text-xl">{labels[choice].icon}</p>
                          <p className="mt-1 text-[10px] font-black text-[#5e5776]">{labels[choice].label}</p>
                        </button>
                      );
                    })}
                  </div>
                  {waitReflectionChoice && (
                    <button
                      type="button"
                      onClick={submitWaitReflection}
                      className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#b59cf0] to-[#ef9ac9] py-3 font-black text-white"
                    >
                      确认感受
                    </button>
                  )}
                </section>
              </>
            )}

            {/* 阶段 5: 反思 - 追涨后的选择 */}
            {fomoPhase === "reflection" && (
              <>
                <AgentMessage alert>
                  "股价从高点回落了。回顾刚才的决策，你现在的想法是？"
                </AgentMessage>
                <section className="mt-5 space-y-3">
                  {(["fomo", "logic", "trend"] as ReflectionChoice[]).map((choice) => {
                    const labels: Record<ReflectionChoice, { label: string; desc: string }> = {
                      fomo: { label: "😰 后悔没及时卖出", desc: "刚才应该在高点卖掉的" },
                      logic: { label: "📐 关注基本面", desc: "这家公司到底值不值这个价？" },
                      trend: { label: "📈 趋势还在，继续持有", desc: "短期波动正常，长期看涨" },
                    };
                    const isActive = reflectionChoice === choice;
                    const isWrong = reflectionWrong && choice === reflectionChoice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setReflectionChoice(choice)}
                        className={`w-full rounded-[20px] border-2 p-4 text-left transition-all ${
                          isActive && !isWrong
                            ? "border-[#b59cf0] bg-[#f5f0ff]"
                            : isWrong
                              ? "border-[#f0adc5] bg-[#fff2f7]"
                              : "border-[#e0daf0] bg-white/75"
                        }`}
                      >
                        <p className="text-sm font-black text-[#5e5776]">{labels[choice].label}</p>
                        <p className="mt-1 text-xs text-[#8a7a98]">{labels[choice].desc}</p>
                      </button>
                    );
                  })}
                </section>
                {reflectionChoice && (
                  <button
                    type="button"
                    onClick={submitReflection}
                    className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#b59cf0] to-[#ef9ac9] py-3 font-black text-white"
                  >
                    确认想法
                  </button>
                )}
              </>
            )}

            {/* 阶段 6: 概念学习 */}
            {fomoPhase === "concept" && (
              <>
                <AgentMessage>
                  "很好！你已经体验到了 FOMO 的运作机制——它不关心你买不买，它只关心'别人好像赚了钱'。这就是 FOMO 的底层逻辑：社会比较 + 损失厌恶。"
                </AgentMessage>
                <section className="mt-5 rounded-[20px] border border-[#d8d3ee] bg-white/75 p-5">
                  <h3 className="text-sm font-black text-[#5e5776]">🧠 FOMO 的三个核心机制</h3>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-[#e0daf0] bg-[#f8f5ff] p-3">
                      <p className="text-xs font-black text-[#75649b]">1. 社会证明</p>
                      <p className="mt-1 text-[10px] leading-5 text-[#8a7a98]">
                        看到别人赚钱 = 我的大脑释放焦虑信号
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#e0daf0] bg-[#f8f5ff] p-3">
                      <p className="text-xs font-black text-[#75649b]">2. 损失厌恶</p>
                      <p className="mt-1 text-[10px] leading-5 text-[#8a7a98]">
                        "错过"的痛苦 {'>'} "买到"的快乐，大约 2 倍
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#e0daf0] bg-[#f8f5ff] p-3">
                      <p className="text-xs font-black text-[#75649b]">3. 叙事放大</p>
                      <p className="mt-1 text-[10px] leading-5 text-[#8a7a98]">
                        社交媒体把 impulse 放大成urgency
                      </p>
                    </div>
                  </div>
                </section>
                <button
                  type="button"
                  onClick={enterBoss}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#8ecdf2] via-[#b59cf0] to-[#ef9ac9] py-4 font-black text-white shadow-[0_12px_30px_rgba(180,140,220,0.25)]"
                >
                  进入最终挑战 →
                </button>
              </>
            )}

            {/* 阶段 7: BOSS 战 */}
            {fomoPhase === "boss" && (
              <>
                <AgentMessage alert>
                  "⚠️ 最终 BOSS 战！市场情绪达到顶峰，你正面临最大的 FOMO 压力。记住刚才学到的，做出理性的选择。"
                </AgentMessage>
                <section className="mt-5 space-y-2">
                  {bossFeed.map((feed, i) => (
                    <div
                      key={i}
                      className="animate-fadeIn rounded-[16px] border border-[#f0d0e0] bg-[#fff5f9] p-3 text-center"
                      style={{ animationDelay: `${i * 200}ms` }}
                    >
                      <p className="text-sm font-bold text-[#b45e6e]">{feed}</p>
                    </div>
                  ))}
                </section>
                <section className="mt-4 space-y-3">
                  {(["chase", "wait", "evidence"] as BossChoice[]).map((choice) => {
                    const labels: Record<BossChoice, { label: string; desc: string }> = {
                      chase: { label: "🚀 满仓追涨", desc: "这种机会不常有！" },
                      wait: { label: "🧘 继续等待", desc: "等回调再入场" },
                      evidence: { label: "🔍 先看证据", desc: "收集更多信息再做决定" },
                    };
                    const isActive = bossChoice === choice;
                    const isWrong = bossWrong && choice === bossChoice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setBossChoice(choice)}
                        className={`w-full rounded-[20px] border-2 p-4 text-left transition-all ${
                          isActive && !isWrong
                            ? "border-[#b59cf0] bg-[#f5f0ff]"
                            : isWrong
                              ? "border-[#f0adc5] bg-[#fff2f7]"
                              : "border-[#e0daf0] bg-white/75"
                        }`}
                      >
                        <p className="text-sm font-black text-[#5e5776]">{labels[choice].label}</p>
                        <p className="mt-1 text-xs text-[#8a7a98]">{labels[choice].desc}</p>
                      </button>
                    );
                  })}
                </section>
                {bossChoice && (
                  <button
                    type="button"
                    onClick={submitBossChoice}
                    className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#b59cf0] to-[#ef9ac9] py-3 font-black text-white"
                  >
                    确认行动
                  </button>
                )}
              </>
            )}

            {/* 阶段 8: 证据分析 */}
            {fomoPhase === "evidence" && (
              <>
                <AgentMessage>
                  "让我们看看客观数据，而不是被情绪裹挟。"
                </AgentMessage>
                <section className="mt-5 grid grid-cols-2 gap-3">
                  {evidenceCards.map((card) => (
                    <div
                      key={card.title}
                      className={`rounded-[20px] border-2 p-4 ${
                        card.tone === "hot"
                          ? "border-[#f0adc5] bg-[#fff5f9]"
                          : card.tone === "warning"
                            ? "border-[#f0d8a0] bg-[#fffcf5]"
                            : "border-[#d0daf0] bg-[#f5f8ff]"
                      }`}
                    >
                      <p className="text-lg">{card.icon}</p>
                      <p className="mt-1 text-xs font-black text-[#5e5776]">{card.title}</p>
                      <p className="mt-1 text-[10px] font-bold leading-4 text-[#8a7a98]">{card.value}</p>
                    </div>
                  ))}
                </section>
                <section className="mt-4 space-y-3">
                  {(["fundamental", "price-sentiment", "valuation"] as EvidenceChoice[]).map((choice) => {
                    const labels: Record<EvidenceChoice, { label: string; desc: string }> = {
                      fundamental: { label: "🏢 基本面没变", desc: "公司价值没有变化，现在买入合理" },
                      ["price-sentiment"]: { label: "🚀 股价+情绪过热", desc: "股价已大幅上涨，情绪极度狂热" },
                      valuation: { label: "💰 估值偏高", desc: "现在买入成本较高，但长期持有" },
                    };
                    const isActive = evidenceChoice === choice;
                    const isWrong = evidenceWrong && choice === evidenceChoice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setEvidenceChoice(choice)}
                        className={`w-full rounded-[20px] border-2 p-4 text-left transition-all ${
                          isActive && !isWrong
                            ? "border-[#b59cf0] bg-[#f5f0ff]"
                            : isWrong
                              ? "border-[#f0adc5] bg-[#fff2f7]"
                              : "border-[#e0daf0] bg-white/75"
                        }`}
                      >
                        <p className="text-sm font-black text-[#5e5776]">{labels[choice].label}</p>
                        <p className="mt-1 text-xs text-[#8a7a98]">{labels[choice].desc}</p>
                      </button>
                    );
                  })}
                </section>
                {evidenceChoice && (
                  <button
                    type="button"
                    onClick={submitEvidenceChoice}
                    className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#b59cf0] to-[#ef9ac9] py-3 font-black text-white"
                  >
                    得出结论
                  </button>
                )}
              </>
            )}
          </>
        )}

        {/* ===== ROUND 3 COMPLETE ===== */}
        {!gameOver && round3Complete && (
          <>
            <AgentMessage>
              "恭喜你通过了 FOMO 挑战！🎉 记住：市场情绪就像天气，变化无常。真正的投资决策应该基于事实和逻辑，而不是恐慌或狂热。"
            </AgentMessage>
            <section className="mt-5 rounded-[30px] border-2 border-[#b2e0b2] bg-[#f0fff0] p-6 text-center shadow-[0_18px_45px_rgba(100,200,100,0.15)]">
              <div className="text-5xl">🏆</div>
              <p className="mt-3 text-[11px] font-black tracking-[0.2em] text-[#4a8a5a]">MISSION COMPLETE</p>
              <h2 className="mt-2 text-2xl font-black text-[#3a6a4a]">情绪实验室通关！</h2>
              <p className="mt-3 text-sm leading-6 text-[#5a8a6a]">
                你已经掌握了识别市场情绪和应对 FOMO 的核心技能。
              </p>
              <button
                type="button"
                onClick={onBack}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#62c974] to-[#4ab05c] py-4 font-black text-white shadow-[0_12px_30px_rgba(74,176,92,0.25)]"
              >
                返回金融华尔界 🎉
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}