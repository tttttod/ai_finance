"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";

type ParliamentGameProps = {
  onBack?: () => void;
  onComplete?: () => void;
};

type Phase =
  | "opening"
  | "puzzle1"
  | "puzzle2"
  | "puzzle3"
  | "puzzle4"
  | "finalChoice"
  | "goodEnding"
  | "badEndingChase"
  | "badEndingSell"
  | "gameOver";

type Stage = "puzzle1" | "puzzle2" | "puzzle3" | "puzzle4" | "finalChoice";
type TagType = "repeat" | "promotion" | "verifiable";
type ZoneType = "bull" | "bear" | "noise";
type DebateAnswer = "support" | "overstated" | "outdated";

type InfoItem = {
  id: string;
  title: string;
  stats: { label: string; value: string }[];
  correctTag: TagType;
  bearReaction?: string;
  sentimentReaction: string;
};

type EvidenceCard = {
  id: string;
  text: string;
  correctZone: ZoneType;
  bullReaction?: string;
  bearReaction?: string;
  sentimentReaction?: string;
};

type DebateRound = {
  speaker: "bull" | "bear";
  statement: string;
  correctAnswer: DebateAnswer;
  feedback: string;
  speakerReaction: string;
};

type FailurePlan = {
  id: "stock" | "operation" | "hotsearch";
  title: string;
  items: string[];
  isCorrect: boolean;
  bullReaction?: string;
  bearReaction?: string;
  sentimentReaction?: string;
};

const MAX_LIVES = 3;

const tagMeta: Record<
  TagType,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  repeat: {
    label: "重复传播",
    icon: "🔁",
    color: "#9333EA",
    bg: "#FAF5FF",
    border: "#D8B4FE",
  },
  promotion: {
    label: "付费推广",
    icon: "📢",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FCD34D",
  },
  verifiable: {
    label: "可核对信号",
    icon: "✅",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#6EE7B7",
  },
};

const infoItems: InfoItem[] = [
  {
    id: "queueVideo",
    title: "排队视频",
    stats: [
      { label: "相关帖子", value: "5,200 条" },
      { label: "使用相同视频的帖子", value: "3,600 条" },
      { label: "拍摄时间", value: "开业第一天" },
      { label: "视频来源", value: "同一位游客" },
    ],
    correctTag: "repeat",
    bearReaction: "排队问题真实存在，但传播规模无法直接代表问题范围。",
    sentimentReaction: "一件事被转发三千次，热度增加了，事件数量仍然是一件。",
  },
  {
    id: "checkinRec",
    title: "打卡推荐",
    stats: [
      { label: "推荐帖子", value: "3,000 条" },
      { label: "标注商业推广", value: "1,800 条" },
      { label: "文案相似度", value: "82%" },
      { label: "主要发布者", value: "旅游博主" },
    ],
    correctTag: "promotion",
    sentimentReaction: "这些内容能够带来关注。判断游客是否愿意再来，还得看消费记录。",
  },
  {
    id: "operationRec",
    title: "经营记录",
    stats: [
      { label: "未来十四天订票率", value: "92%" },
      { label: "二次到访券使用率", value: "27%" },
      { label: "旧乐园二次到访券使用率", value: "18%" },
      { label: "云鲸岛退款率", value: "8%" },
      { label: "旧乐园退款率", value: "3%" },
      { label: "平均排队时间", value: "95 分钟" },
      { label: "公司计划排队时间", value: "45 分钟" },
    ],
    correctTag: "verifiable",
    sentimentReaction: "这些数据来自订票和退款系统，能够同时支持机会与风险。",
  },
];

const evidenceCards: EvidenceCard[] = [
  {
    id: "bookingRate",
    text: "未来十四天订票率达到 92%",
    correctZone: "bull",
    bullReaction: "短期需求确实存在，游客也表达了再次到访的兴趣。",
  },
  {
    id: "returnVisit",
    text: "二次到访券使用率高于旧乐园",
    correctZone: "bull",
  },
  {
    id: "refundRate",
    text: "退款率高于旧乐园",
    correctZone: "bear",
    bearReaction: "我需要证明的是经营压力，热搜里的愤怒表情帮不了我。",
  },
  {
    id: "queueTime",
    text: "平均排队时间超过公司计划",
    correctZone: "bear",
  },
  {
    id: "videoRepeat",
    text: "同一段排队视频被转发 3600 次",
    correctZone: "noise",
    sentimentReaction: "传播规模不等于事件数量。",
  },
  {
    id: "bloggerAds",
    text: "1800 条博主内容带有推广标记",
    correctZone: "noise",
    sentimentReaction: "营销内容可以带来热度，但不能直接代表真实口碑。",
  },
];

const debateRounds: DebateRound[] = [
  {
    speaker: "bull",
    statement:
      "门票预订接近满额，二次到访券使用率也超过旧项目。云鲸岛已经表现出真实需求。",
    correctAnswer: "support",
    feedback: "这段判断使用了可核对记录，也保留了适当范围。",
    speakerReaction: "终于有人允许我讲增长了。",
  },
  {
    speaker: "bear",
    statement:
      "退款率达到旧项目的两倍以上，排队时间也超过计划。服务能力还没有跟上热度。",
    correctAnswer: "support",
    feedback: "当前经营问题有数据支持，而且分析师没有直接给项目判死刑。",
    speakerReaction: "同一家公司可以同时拥有需求和问题。",
  },
  {
    speaker: "bull",
    statement: "既然需求这么强，股价接下来一定会继续上涨。",
    correctAnswer: "overstated",
    feedback:
      "需求强劲可以支撑基本面判断，但股价短期走势受多种因素影响，「一定会」说得太满了。",
    speakerReaction: "好吧，需求能够支持我的判断，股价仍有自己的脾气。",
  },
  {
    speaker: "bear",
    statement: "退款率这么高，这个项目已经失败了。",
    correctAnswer: "overstated",
    feedback:
      "退款率高于预期是真实问题，但直接宣布项目失败，跨度太大，证据还不够。",
    speakerReaction: "当前问题值得观察，现在给整个项目写结局确实太早。",
  },
];

const failurePlans: FailurePlan[] = [
  {
    id: "stock",
    title: "方案 A：看股价",
    items: ["股价下跌 5%，看多观点失效", "股价上涨 5%，看空观点失效"],
    isCorrect: false,
    bullReaction: "股价每天都在投票，它无法单独解释游客还会不会来。",
  },
  {
    id: "operation",
    title: "方案 B：看经营变化",
    items: [
      "订票率降到 70% 以下，二次到访券使用率低于 18%，看多观点失效",
      "退款率回到 3% 左右，平均排队时间降到 50 分钟以内，看空观点失效",
      "两周后统一检查",
    ],
    isCorrect: true,
    bullReaction: "需求消失时，我会承认增长故事失效。",
    bearReaction: "经营问题改善时，我也会撤回警告。",
  },
  {
    id: "hotsearch",
    title: "方案 C：继续看热搜",
    items: ["出现负面热搜，看多观点失效", "出现正面热搜，看空观点失效"],
    isCorrect: false,
    sentimentReaction: "这样研究下去，两位分析师每天都得跟着手机通知改口。",
  },
];

function AgentBubble({
  agent,
  children,
  side = "left",
}: {
  agent: "lead" | "sentiment" | "bull" | "bear";
  children: React.ReactNode;
  side?: "left" | "right";
}) {
  const agentMeta = {
    lead: {
      name: "Lead Agent",
      title: "研究总控",
      emoji: "🎬",
      color: "#6366F1",
      bg: "#EEF2FF",
      border: "#C7D2FE",
      img: "/lead_agent.png",
    },
    sentiment: {
      name: "Sentiment Agent",
      title: "情绪分析师",
      emoji: "💗",
      color: "#DB2777",
      bg: "#FDF2F8",
      border: "#F9A8D4",
      img: "/sentiment_agent.PNG",
    },
    bull: {
      name: "Bull Analyst",
      title: "看多分析师",
      emoji: "📈",
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#FCA5A5",
      img: "/bull_agent.png",
    },
    bear: {
      name: "Bear Analyst",
      title: "看空分析师",
      emoji: "📉",
      color: "#059669",
      bg: "#ECFDF5",
      border: "#6EE7B7",
      img: "/bear_agent.png",
    },
  }[agent];

  const isRight = side === "right";

  return (
    <div className={`flex items-start gap-2.5 ${isRight ? "flex-row-reverse" : ""}`}>
      <div
        className="relative w-11 h-11 shrink-0 rounded-full overflow-hidden border-2 shadow-sm"
        style={{ borderColor: agentMeta.border, background: agentMeta.bg }}
      >
        <Image
          src={agentMeta.img}
          alt={agentMeta.name}
          fill
          sizes="44px"
          className="object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 -z-10 flex items-center justify-center text-xl">
          {agentMeta.emoji}
        </div>
      </div>

      <div className={`max-w-[78%] ${isRight ? "text-right" : ""}`}>
        <div className={`flex items-center gap-1.5 mb-1 ${isRight ? "justify-end" : ""}`}>
          <span
            className="text-[10px] font-bold tracking-wide"
            style={{ color: agentMeta.color }}
          >
            {agentMeta.name}
          </span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: agentMeta.bg, color: agentMeta.color }}
          >
            {agentMeta.title}
          </span>
        </div>

        <div
          className="px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm"
          style={{
            background: "#FFFFFF",
            border: `1px solid ${agentMeta.border}`,
            borderTopLeftRadius: isRight ? "20px" : "6px",
            borderTopRightRadius: isRight ? "6px" : "20px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function ParliamentHall({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-2xl p-5 shadow-inner"
      style={{
        background: "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)",
        border: "1px solid #E2E8F0",
      }}
    >
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-[#94A3B8]" />
          <span className="text-xs font-bold tracking-[0.2em] text-[#64748B]">
            PARLIAMENT HALL
          </span>
          <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-[#94A3B8]" />
        </div>
      </div>
      {children}
    </div>
  );
}

function ContinueButton({
  onClick,
  disabled = false,
  label = "继续",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
        disabled
          ? "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
          : "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg hover:shadow-xl active:scale-[0.98]"
      }`}
      style={
        disabled ? {} : { boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)" }
      }
    >
      {label}
    </button>
  );
}

function LivesBar({ lives }: { lives: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`剩余生命 ${lives}`}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={`text-base transition-all duration-300 ${
            index < lives ? "scale-100" : "grayscale opacity-20 scale-90"
          }`}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}

function StageClear({
  title,
  subtitle,
  onContinue,
  buttonLabel,
}: {
  title: string;
  subtitle: string;
  onContinue: () => void;
  buttonLabel: string;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-5">
        <div className="w-20 h-20 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-4xl mb-4 shadow-sm">
          ✓
        </div>
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#059669] mb-2">
          STAGE CLEAR
        </p>
        <h2 className="text-xl font-bold text-[#1E293B] mb-2">{title}</h2>
        <p className="text-sm text-[#64748B] max-w-[320px]">{subtitle}</p>
      </div>
      <ContinueButton onClick={onContinue} label={buttonLabel} />
    </div>
  );
}

export default function ParliamentGame({
  onBack,
  onComplete,
}: ParliamentGameProps) {
  const [phase, setPhase] = useState<Phase>("opening");
  const [lives, setLives] = useState(MAX_LIVES);
  const [retryStage, setRetryStage] = useState<Stage>("puzzle1");
  const [openingStep, setOpeningStep] = useState(0);
  const [showStageClear, setShowStageClear] = useState<null | 1 | 2 | 3 | 4>(null);

  // 每一道小题只因“第一次错误”扣一条命，避免玩家连续试选被瞬间扣光。
  const [penalizedKeys, setPenalizedKeys] = useState<Set<string>>(new Set());

  const [puzzle1Index, setPuzzle1Index] = useState(0);
  const [puzzle1Selected, setPuzzle1Selected] = useState<TagType | null>(null);
  const [puzzle1Feedback, setPuzzle1Feedback] = useState<"correct" | "wrong" | null>(
    null
  );

  const [puzzle2Cards, setPuzzle2Cards] =
    useState<EvidenceCard[]>(evidenceCards);
  const [puzzle2Zones, setPuzzle2Zones] = useState<Record<ZoneType, string[]>>({
    bull: [],
    bear: [],
    noise: [],
  });
  const [puzzle2SelectedCard, setPuzzle2SelectedCard] = useState<string | null>(
    null
  );
  const [puzzle2Feedback, setPuzzle2Feedback] = useState<{
    cardId: string;
    correct: boolean;
    zone: ZoneType;
  } | null>(null);

  const [puzzle3Index, setPuzzle3Index] = useState(0);
  const [puzzle3Selected, setPuzzle3Selected] =
    useState<DebateAnswer | null>(null);
  const [puzzle3Feedback, setPuzzle3Feedback] = useState(false);

  const [puzzle4Selected, setPuzzle4Selected] = useState<string | null>(null);
  const [puzzle4Feedback, setPuzzle4Feedback] = useState(false);

  const starCount = useMemo(() => {
    if (lives === 3) return 3;
    if (lives === 2) return 2;
    return 1;
  }, [lives]);

  const resetPuzzle1 = useCallback(() => {
    setPuzzle1Index(0);
    setPuzzle1Selected(null);
    setPuzzle1Feedback(null);
  }, []);

  const resetPuzzle2 = useCallback(() => {
    setPuzzle2Cards(evidenceCards);
    setPuzzle2Zones({ bull: [], bear: [], noise: [] });
    setPuzzle2SelectedCard(null);
    setPuzzle2Feedback(null);
  }, []);

  const resetPuzzle3 = useCallback(() => {
    setPuzzle3Index(0);
    setPuzzle3Selected(null);
    setPuzzle3Feedback(false);
  }, []);

  const resetPuzzle4 = useCallback(() => {
    setPuzzle4Selected(null);
    setPuzzle4Feedback(false);
  }, []);

  const resetAll = useCallback(() => {
    setLives(MAX_LIVES);
    setPenalizedKeys(new Set());
    setOpeningStep(0);
    setShowStageClear(null);
    resetPuzzle1();
    resetPuzzle2();
    resetPuzzle3();
    resetPuzzle4();
    setPhase("opening");
  }, [resetPuzzle1, resetPuzzle2, resetPuzzle3, resetPuzzle4]);

  const retryCurrentStage = useCallback(() => {
    setLives(MAX_LIVES);
    setPenalizedKeys(new Set());
    setShowStageClear(null);

    if (retryStage === "puzzle1") {
      resetPuzzle1();
      setPhase("puzzle1");
    } else if (retryStage === "puzzle2") {
      resetPuzzle2();
      setPhase("puzzle2");
    } else if (retryStage === "puzzle3") {
      resetPuzzle3();
      setPhase("puzzle3");
    } else if (retryStage === "puzzle4") {
      resetPuzzle4();
      setPhase("puzzle4");
    } else {
      setPhase("finalChoice");
    }
  }, [retryStage, resetPuzzle1, resetPuzzle2, resetPuzzle3, resetPuzzle4]);

  const loseLife = useCallback(
    (key: string, stage: Stage) => {
      if (penalizedKeys.has(key)) return;

      setPenalizedKeys((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });

      setLives((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          setRetryStage(stage);
          setTimeout(() => setPhase("gameOver"), 350);
        }
        return next;
      });
    },
    [penalizedKeys]
  );

  const renderOpening = () => {
    const steps = [
      {
        agent: "lead" as const,
        text: "议会钟声响起，中央屏幕弹出两条热搜。",
      },
      {
        agent: "bull" as const,
        text: "连续两个周末门票售罄，这个项目已经火了。公司的增长才刚开始。",
        side: "left" as const,
      },
      {
        agent: "bear" as const,
        text: "排队、退款、服务混乱。热度正在透支游客的耐心。",
        side: "right" as const,
      },
      {
        agent: "lead" as const,
        text: "左边让我想加仓，右边让我现在就卖。他们说得都挺像真的。",
      },
      {
        agent: "sentiment" as const,
        text: "两边都在用热搜讲故事。先看看这些声音来自多少件真实事件。",
      },
    ];

    const current = steps[openingStep];
    const isLast = openingStep === steps.length - 1;

    return (
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🏛️</span>
            <h2 className="text-base font-bold text-[#1E293B]">
              多空议会：热搜开庭
            </h2>
          </div>
          <p className="text-xs text-[#64748B]">
            星湾娱乐的“云鲸岛乐园”开业后连续登上热搜。有人说门票抢不到，有人说游客正在退款。
          </p>
        </div>

        <ParliamentHall>
          <div className="space-y-4 min-h-[180px]">
            <AgentBubble
              agent={current.agent}
              side={(current as { side?: "left" | "right" }).side || "left"}
            >
              {current.text}
            </AgentBubble>
          </div>
        </ParliamentHall>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => setPhase("puzzle1")}
            className="text-xs font-semibold text-[#94A3B8] hover:text-[#64748B]"
          >
            跳过剧情
          </button>

          <div className="flex-1 flex items-center justify-center gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === openingStep
                    ? "w-4 bg-[#6366F1]"
                    : i < openingStep
                    ? "bg-[#A5B4FC]"
                    : "bg-[#E2E8F0]"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (isLast) setPhase("puzzle1");
              else setOpeningStep((s) => s + 1);
            }}
            className="px-5 py-2 rounded-lg text-sm font-bold bg-[#6366F1] text-white hover:bg-[#4F46E5] active:scale-[0.98] transition-all"
          >
            {isLast ? "开始调查" : "继续"}
          </button>
        </div>
      </div>
    );
  };

  const handleTagSelect = (tag: TagType) => {
    if (puzzle1Feedback === "correct") return;

    const currentItem = infoItems[puzzle1Index];
    const isCorrect = tag === currentItem.correctTag;

    setPuzzle1Selected(tag);

    if (isCorrect) {
      setPuzzle1Feedback("correct");
    } else {
      setPuzzle1Feedback("wrong");
      loseLife(`p1-${currentItem.id}`, "puzzle1");
    }
  };

  const handlePuzzle1Next = () => {
    if (puzzle1Index < infoItems.length - 1) {
      setPuzzle1Index((i) => i + 1);
      setPuzzle1Selected(null);
      setPuzzle1Feedback(null);
    } else {
      setShowStageClear(1);
    }
  };

  const renderPuzzle1 = () => {
    if (showStageClear === 1) {
      return (
        <StageClear
          title="信息清洗完成"
          subtitle="你已经把重复传播、商业推广和可核对经营信号分开了。"
          onContinue={() => {
            setShowStageClear(null);
            setPhase("puzzle2");
          }}
          buttonLabel="进入多空分牌"
        />
      );
    }

    const currentItem = infoItems[puzzle1Index];
    const correctTag = tagMeta[currentItem.correctTag];

    return (
      <div className="flex flex-col h-full">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <h2 className="text-base font-bold text-[#1E293B]">
                Stage 1 · 清理热搜
              </h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#6366F1] font-bold">
              {puzzle1Index + 1} / {infoItems.length}
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            判断眼前的信息属于哪一种信号。答错会失去一条生命，但同一道题只扣一次。
          </p>
        </div>

        <div
          className="rounded-xl p-4 mb-4 border-2 transition-all"
          style={{
            background:
              puzzle1Feedback === "correct" ? correctTag.bg : "#FFFFFF",
            borderColor:
              puzzle1Feedback === "correct" ? correctTag.border : "#E2E8F0",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📋</span>
            <h3 className="text-sm font-bold text-[#1E293B]">
              {currentItem.title}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {currentItem.stats.map((s) => (
              <div key={s.label} className="bg-[#F8FAFC] rounded-lg px-3 py-2">
                <p className="text-[10px] text-[#64748B]">{s.label}</p>
                <p className="text-sm font-bold text-[#1E293B] mt-0.5 font-mono">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 mb-3">
          {(Object.keys(tagMeta) as TagType[]).map((key) => {
            const t = tagMeta[key];
            const isSelected = puzzle1Selected === key;
            const isCorrect =
              puzzle1Feedback === "correct" && key === currentItem.correctTag;
            const isWrong =
              puzzle1Feedback === "wrong" &&
              isSelected &&
              key !== currentItem.correctTag;

            return (
              <button
                key={key}
                onClick={() => handleTagSelect(key)}
                disabled={puzzle1Feedback === "correct"}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  puzzle1Feedback === "correct"
                    ? "cursor-default"
                    : "hover:shadow-md active:scale-[0.98]"
                }`}
                style={{
                  background: isCorrect
                    ? t.bg
                    : isWrong
                    ? "#FEF2F2"
                    : "#FFFFFF",
                  borderColor: isCorrect
                    ? t.border
                    : isWrong
                    ? "#FCA5A5"
                    : "#E2E8F0",
                }}
              >
                <span className="text-xl">{t.icon}</span>
                <p
                  className="text-sm font-bold flex-1"
                  style={{
                    color: isCorrect
                      ? t.color
                      : isWrong
                      ? "#DC2626"
                      : "#1E293B",
                  }}
                >
                  {t.label}
                </p>
                {isCorrect && <span className="text-green-600">✓</span>}
                {isWrong && <span className="text-red-500">✗</span>}
              </button>
            );
          })}
        </div>

        {puzzle1Feedback === "wrong" && (
          <div className="bg-[#FEF2F2] rounded-xl p-3 border border-[#FECACA] mb-3">
            <p className="text-xs font-bold text-[#DC2626] mb-1">
              -1 ❤️ · 再判断一次
            </p>
            <p className="text-xs text-[#7F1D1D]">
              先别急着看“热不热”，想想它能不能直接验证游客行为或经营变化。
            </p>
          </div>
        )}

        {puzzle1Feedback === "correct" && (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
            <AgentBubble agent="sentiment">
              {currentItem.sentimentReaction}
            </AgentBubble>
            {currentItem.bearReaction && (
              <AgentBubble agent="bear" side="right">
                {currentItem.bearReaction}
              </AgentBubble>
            )}
          </div>
        )}

        {puzzle1Feedback === "correct" && (
          <div className="mt-3">
            <ContinueButton
              onClick={handlePuzzle1Next}
              label={
                puzzle1Index < infoItems.length - 1
                  ? "下一条信息"
                  : "完成信息清洗"
              }
            />
          </div>
        )}
      </div>
    );
  };

  const handleCardClick = (cardId: string) => {
    setPuzzle2Feedback(null);
    setPuzzle2SelectedCard((current) => (current === cardId ? null : cardId));
  };

  const handleZoneClick = (zone: ZoneType) => {
    if (!puzzle2SelectedCard) return;

    const card = evidenceCards.find((c) => c.id === puzzle2SelectedCard);
    if (!card) return;

    const isCorrect = card.correctZone === zone;
    setPuzzle2Feedback({ cardId: card.id, correct: isCorrect, zone });

    if (!isCorrect) {
      loseLife(`p2-${card.id}`, "puzzle2");
      setPuzzle2SelectedCard(null);
      return;
    }

    setPuzzle2Zones((prev) => ({
      ...prev,
      [zone]: [...prev[zone], card.id],
    }));
    setPuzzle2Cards((prev) => prev.filter((c) => c.id !== card.id));
    setPuzzle2SelectedCard(null);
  };

  const renderPuzzle2 = () => {
    if (showStageClear === 2) {
      return (
        <StageClear
          title="证据分牌完成"
          subtitle="看多、看空和热度噪声已经被分开。双方终于开始讨论同一组事实。"
          onContinue={() => {
            setShowStageClear(null);
            setPhase("puzzle3");
          }}
          buttonLabel="进入议会辩论"
        />
      );
    }

    const zoneLabels = {
      bull: {
        label: "看多证据",
        icon: "📈",
        color: "#DC2626",
        bg: "#FEF2F2",
        border: "#FCA5A5",
      },
      bear: {
        label: "看空证据",
        icon: "📉",
        color: "#059669",
        bg: "#ECFDF5",
        border: "#6EE7B7",
      },
      noise: {
        label: "热度噪声",
        icon: "🔇",
        color: "#6B7280",
        bg: "#F9FAFB",
        border: "#D1D5DB",
      },
    };

    const finished = puzzle2Cards.length === 0;

    if (finished) {
      return (
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🃏</span>
              <h2 className="text-base font-bold text-[#1E293B]">
                所有证据已归位
              </h2>
            </div>
            <p className="text-xs text-[#64748B]">
              这次不会因为一张错牌把六张全部重置。
            </p>
          </div>

          <ParliamentHall>
            <div className="space-y-4">
              <AgentBubble agent="sentiment">
                现在他们讨论的是同一家公司，而不是两个互相吵架的话题。
              </AgentBubble>
              <AgentBubble agent="bull">
                短期需求确实存在，游客也表达了再次到访的兴趣。
              </AgentBubble>
              <AgentBubble agent="bear" side="right">
                我需要证明的是经营压力，热搜里的愤怒表情帮不了我。
              </AgentBubble>
            </div>
          </ParliamentHall>

          <div className="mt-4">
            <ContinueButton
              onClick={() => setShowStageClear(2)}
              label="完成证据分牌"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🃏</span>
              <h2 className="text-base font-bold text-[#1E293B]">
                Stage 2 · 多空分牌
              </h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#6366F1] font-bold">
              剩余 {puzzle2Cards.length} 张
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            先选卡片，再放入区域。放错会扣一条命，卡片会留在原处供你重新判断。
          </p>
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-3 mb-3 border border-[#E2E8F0]">
          <p className="text-[11px] font-bold text-[#64748B] mb-2">
            待分配证据
          </p>
          <div className="space-y-2 max-h-[150px] overflow-y-auto">
            {puzzle2Cards.map((card) => {
              const isSelected = puzzle2SelectedCard === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all text-sm ${
                    isSelected ? "shadow-md scale-[1.01]" : "hover:bg-white"
                  }`}
                  style={{
                    background: isSelected ? "#EEF2FF" : "#FFFFFF",
                    borderColor: isSelected ? "#6366F1" : "#E2E8F0",
                  }}
                >
                  {card.text}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {(["bull", "bear", "noise"] as ZoneType[]).map((zone) => {
            const z = zoneLabels[zone];
            const isTargetable = puzzle2SelectedCard !== null;
            return (
              <button
                key={zone}
                onClick={() => handleZoneClick(zone)}
                disabled={!puzzle2SelectedCard}
                className={`p-3 rounded-xl border-2 transition-all ${
                  isTargetable ? "hover:shadow-md active:scale-[0.96]" : ""
                }`}
                style={{
                  background: z.bg,
                  borderColor: isTargetable ? z.color : z.border,
                  borderStyle: isTargetable ? "dashed" : "solid",
                }}
              >
                <div className="text-xl mb-1">{z.icon}</div>
                <p className="text-[11px] font-bold" style={{ color: z.color }}>
                  {z.label}
                </p>
                <p className="text-[10px] text-[#64748B] mt-1">
                  {puzzle2Zones[zone].length} 张
                </p>
              </button>
            );
          })}
        </div>

        {puzzle2Feedback && (
          <div
            className={`rounded-xl p-3 mb-3 border ${
              puzzle2Feedback.correct
                ? "bg-[#ECFDF5] border-[#6EE7B7]"
                : "bg-[#FEF2F2] border-[#FCA5A5]"
            }`}
          >
            <p
              className={`text-xs font-bold mb-1 ${
                puzzle2Feedback.correct ? "text-[#059669]" : "text-[#DC2626]"
              }`}
            >
              {puzzle2Feedback.correct ? "分类正确 ✓" : "-1 ❤️ · 分类有误"}
            </p>
            <p
              className={`text-xs ${
                puzzle2Feedback.correct ? "text-[#065F46]" : "text-[#7F1D1D]"
              }`}
            >
              {puzzle2Feedback.correct
                ? "证据已经放入对应区域。"
                : "卡片没有被放进去，请重新判断它真正支持哪一方。"}
            </p>
          </div>
        )}

        {puzzle2Feedback?.correct &&
          (() => {
            const card = evidenceCards.find(
              (c) => c.id === puzzle2Feedback.cardId
            );
            if (!card) return null;
            if (card.bullReaction)
              return <AgentBubble agent="bull">{card.bullReaction}</AgentBubble>;
            if (card.bearReaction)
              return (
                <AgentBubble agent="bear" side="right">
                  {card.bearReaction}
                </AgentBubble>
              );
            if (card.sentimentReaction)
              return (
                <AgentBubble agent="sentiment">
                  {card.sentimentReaction}
                </AgentBubble>
              );
            return null;
          })()}
      </div>
    );
  };

  const handleDebateAnswer = (answer: DebateAnswer) => {
    if (puzzle3Feedback) return;

    const round = debateRounds[puzzle3Index];
    setPuzzle3Selected(answer);
    setPuzzle3Feedback(true);

    if (answer !== round.correctAnswer) {
      loseLife(`p3-${puzzle3Index}`, "puzzle3");
    }
  };

  const handlePuzzle3Next = () => {
    if (puzzle3Index < debateRounds.length - 1) {
      setPuzzle3Index((i) => i + 1);
      setPuzzle3Selected(null);
      setPuzzle3Feedback(false);
    } else {
      setShowStageClear(3);
    }
  };

  const renderPuzzle3 = () => {
    if (showStageClear === 3) {
      return (
        <StageClear
          title="议会审议完成"
          subtitle="你已经学会区分“证据支持”和“结论说得太满”。"
          onContinue={() => {
            setShowStageClear(null);
            setPhase("puzzle4");
          }}
          buttonLabel="设置失效条件"
        />
      );
    }

    const round = debateRounds[puzzle3Index];
    const isCorrect = puzzle3Selected === round.correctAnswer;

    const answerOptions = [
      { id: "support" as const, label: "证据支持", icon: "✅" },
      { id: "overstated" as const, label: "表述过头", icon: "⚠️" },
      { id: "outdated" as const, label: "信息过期", icon: "🕐" },
    ];

    return (
      <div className="flex flex-col h-full">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚖️</span>
              <h2 className="text-base font-bold text-[#1E293B]">
                Stage 3 · 议会辩论
              </h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#6366F1] font-bold">
              {puzzle3Index + 1} / {debateRounds.length}
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            判断分析师的结论是否真的被证据支持。
          </p>
        </div>

        <ParliamentHall>
          <AgentBubble
            agent={round.speaker}
            side={round.speaker === "bull" ? "left" : "right"}
          >
            {round.statement}
          </AgentBubble>
        </ParliamentHall>

        <div className="mt-4 space-y-2">
          {answerOptions.map((opt) => {
            const selected = puzzle3Selected === opt.id;
            const correctAnswer =
              puzzle3Feedback && opt.id === round.correctAnswer;
            const wrongSelected =
              puzzle3Feedback && selected && opt.id !== round.correctAnswer;

            return (
              <button
                key={opt.id}
                onClick={() => handleDebateAnswer(opt.id)}
                disabled={puzzle3Feedback}
                className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 hover:shadow-md active:scale-[0.98]"
                style={{
                  background: correctAnswer
                    ? "#ECFDF5"
                    : wrongSelected
                    ? "#FEF2F2"
                    : "#FFFFFF",
                  borderColor: correctAnswer
                    ? "#6EE7B7"
                    : wrongSelected
                    ? "#FCA5A5"
                    : "#E2E8F0",
                }}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className="text-sm font-bold text-[#1E293B] flex-1">
                  {opt.label}
                </span>
                {correctAnswer && <span className="text-green-600">✓</span>}
                {wrongSelected && <span className="text-red-500">✗</span>}
              </button>
            );
          })}
        </div>

        {puzzle3Feedback && (
          <div
            className={`rounded-xl p-3 mt-4 border ${
              isCorrect
                ? "bg-[#ECFDF5] border-[#6EE7B7]"
                : "bg-[#FEF2F2] border-[#FCA5A5]"
            }`}
          >
            <p
              className={`text-xs font-bold mb-1 ${
                isCorrect ? "text-[#059669]" : "text-[#DC2626]"
              }`}
            >
              {isCorrect ? "判断准确 ✓" : "-1 ❤️ · 判断有偏差"}
            </p>
            <p
              className={`text-xs ${
                isCorrect ? "text-[#065F46]" : "text-[#7F1D1D]"
              }`}
            >
              {round.feedback}
            </p>
          </div>
        )}

        {puzzle3Feedback && (
          <div className="mt-3">
            <AgentBubble
              agent={round.speaker}
              side={round.speaker === "bull" ? "left" : "right"}
            >
              {round.speakerReaction}
            </AgentBubble>
          </div>
        )}

        {puzzle3Feedback && (
          <div className="mt-3">
            <ContinueButton
              onClick={handlePuzzle3Next}
              label={
                puzzle3Index < debateRounds.length - 1
                  ? "下一轮辩论"
                  : "完成议会审议"
              }
            />
          </div>
        )}
      </div>
    );
  };

  const handlePuzzle4Confirm = () => {
    if (!puzzle4Selected || puzzle4Feedback) return;

    const selectedPlan = failurePlans.find((p) => p.id === puzzle4Selected);
    if (!selectedPlan) return;

    setPuzzle4Feedback(true);

    if (!selectedPlan.isCorrect) {
      loseLife(`p4-${selectedPlan.id}`, "puzzle4");
    }
  };

  const renderPuzzle4 = () => {
    if (showStageClear === 4) {
      return (
        <StageClear
          title="观察计划已建立"
          subtitle="观点现在不再靠情绪维持，而是绑定了可观察、可证伪的经营条件。"
          onContinue={() => {
            setShowStageClear(null);
            setPhase("finalChoice");
          }}
          buttonLabel="进入最终决策"
        />
      );
    }

    const selectedPlan = failurePlans.find((p) => p.id === puzzle4Selected);
    const isCorrect = selectedPlan?.isCorrect === true;

    return (
      <div className="flex flex-col h-full">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📋</span>
            <h2 className="text-base font-bold text-[#1E293B]">
              Stage 4 · 失效条件
            </h2>
          </div>
          <p className="text-xs text-[#64748B]">
            为两位分析师选择一份观察计划，明确观点什么时候应该撤回。
          </p>
        </div>

        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto mb-3">
          {failurePlans.map((plan) => {
            const selected = puzzle4Selected === plan.id;
            const correct = puzzle4Feedback && plan.isCorrect;
            const wrong = puzzle4Feedback && selected && !plan.isCorrect;

            return (
              <button
                key={plan.id}
                onClick={() => {
                  if (!puzzle4Feedback) setPuzzle4Selected(plan.id);
                }}
                disabled={puzzle4Feedback}
                className="w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md active:scale-[0.99]"
                style={{
                  background: correct
                    ? "#ECFDF5"
                    : wrong
                    ? "#FEF2F2"
                    : selected
                    ? "#EEF2FF"
                    : "#FFFFFF",
                  borderColor: correct
                    ? "#6EE7B7"
                    : wrong
                    ? "#FCA5A5"
                    : selected
                    ? "#6366F1"
                    : "#E2E8F0",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span>
                    {plan.id === "stock" ? "📊" : plan.id === "operation" ? "📈" : "🔥"}
                  </span>
                  <p className="text-sm font-bold text-[#1E293B] flex-1">
                    {plan.title}
                  </p>
                  {correct && <span className="text-green-600">✓</span>}
                  {wrong && <span className="text-red-500">✗</span>}
                </div>
                <ul className="space-y-1 ml-7">
                  {plan.items.map((item) => (
                    <li
                      key={item}
                      className="text-xs text-[#64748B] flex items-start gap-1.5"
                    >
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {puzzle4Feedback && selectedPlan && (
          <div
            className={`rounded-xl p-3 mb-3 border ${
              isCorrect
                ? "bg-[#ECFDF5] border-[#6EE7B7]"
                : "bg-[#FEF2F2] border-[#FCA5A5]"
            }`}
          >
            <p
              className={`text-xs font-bold mb-1 ${
                isCorrect ? "text-[#059669]" : "text-[#DC2626]"
              }`}
            >
              {isCorrect ? "计划合理 ✓" : "-1 ❤️ · 这个计划有问题"}
            </p>
            <p
              className={`text-xs ${
                isCorrect ? "text-[#065F46]" : "text-[#7F1D1D]"
              }`}
            >
              {isCorrect
                ? "观点需要绑定可观察的经营指标，而不是股价或情绪热度。"
                : "好的失效条件应该直接检验观点成立的理由，而不是间接指标。"}
            </p>
          </div>
        )}

        {puzzle4Feedback && selectedPlan?.bullReaction && (
          <div className="mb-2">
            <AgentBubble agent="bull">{selectedPlan.bullReaction}</AgentBubble>
          </div>
        )}
        {puzzle4Feedback && selectedPlan?.bearReaction && (
          <div className="mb-2">
            <AgentBubble agent="bear" side="right">
              {selectedPlan.bearReaction}
            </AgentBubble>
          </div>
        )}
        {puzzle4Feedback && selectedPlan?.sentimentReaction && (
          <div className="mb-2">
            <AgentBubble agent="sentiment">
              {selectedPlan.sentimentReaction}
            </AgentBubble>
          </div>
        )}

        {!puzzle4Feedback ? (
          <ContinueButton
            onClick={handlePuzzle4Confirm}
            disabled={!puzzle4Selected}
            label="确认观察计划"
          />
        ) : isCorrect ? (
          <ContinueButton
            onClick={() => setShowStageClear(4)}
            label="完成失效条件"
          />
        ) : (
          <button
            onClick={() => {
              setPuzzle4Selected(null);
              setPuzzle4Feedback(false);
            }}
            className="w-full py-3 rounded-xl text-sm font-bold bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
          >
            重新选择
          </button>
        )}
      </div>
    );
  };

  const handleFinalChoice = (choice: "chase" | "sell" | "hold") => {
    if (choice === "hold") {
      // 这里只进入成功页，不提前 onComplete。
      setPhase("goodEnding");
      return;
    }

    loseLife(`final-${choice}`, "finalChoice");

    // 还有生命时展示剧情错误结局；刚好归零时由 loseLife 自动进入 gameOver。
    if (lives > 1) {
      setPhase(choice === "chase" ? "badEndingChase" : "badEndingSell");
    }
  };

  const renderFinalChoice = () => {
    const choices = [
      {
        id: "chase" as const,
        title: "大幅加仓",
        subtitle: "投入 8000 元",
        icon: "🚀",
        color: "#DC2626",
        bg: "#FEF2F2",
        border: "#FCA5A5",
        desc: "订票接近满额，现在投入八千元。",
      },
      {
        id: "hold" as const,
        title: "提交双向计划",
        subtitle: "保留持仓 + 观察",
        icon: "⚖️",
        color: "#6366F1",
        bg: "#EEF2FF",
        border: "#C7D2FE",
        desc: "保留现有持仓，两周后检查经营数据再决定。",
      },
      {
        id: "sell" as const,
        title: "卖出持仓",
        subtitle: "全部清仓",
        icon: "📉",
        color: "#059669",
        bg: "#ECFDF5",
        border: "#6EE7B7",
        desc: "退款率太高，卖出全部持仓，以后也不看这家公司。",
      },
    ];

    return (
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎯</span>
            <h2 className="text-base font-bold text-[#1E293B]">最终决策</h2>
          </div>
          <p className="text-xs text-[#64748B]">
            你持有 2000 元星湾娱乐，正在考虑增加 8000 元投入。现在，根据前面的证据做决定。
          </p>
        </div>

        <ParliamentHall>
          <div className="flex justify-between items-center gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border-2 border-[#FCA5A5] flex items-center justify-center text-xl mb-1">
                📈
              </div>
              <p className="text-[10px] font-bold text-[#DC2626]">BULL</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs text-[#64748B] mb-1">你的决定</p>
              <p className="text-lg font-bold text-[#1E293B]">2,000 → ?</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#ECFDF5] border-2 border-[#6EE7B7] flex items-center justify-center text-xl mb-1">
                📉
              </div>
              <p className="text-[10px] font-bold text-[#059669]">BEAR</p>
            </div>
          </div>
        </ParliamentHall>

        <div className="mt-4 space-y-2 flex-1 min-h-0 overflow-y-auto">
          {choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleFinalChoice(choice.id)}
              className="w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md active:scale-[0.99]"
              style={{
                background: choice.bg,
                borderColor: choice.border,
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{choice.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p
                      className="text-sm font-bold"
                      style={{ color: choice.color }}
                    >
                      {choice.title}
                    </p>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/60"
                      style={{ color: choice.color }}
                    >
                      {choice.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569]">{choice.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderBadEnding = (type: "chase" | "sell") => {
    const isChase = type === "chase";
    const meta = isChase
      ? {
          title: "热搜追高",
          emoji: "📈",
          color: "#DC2626",
          bg: "#FEF2F2",
          border: "#FCA5A5",
          lead: "两周后，订票率降至 63%，退款率升至 11%。公司宣布暂时限制入园人数。",
          lesson:
            "热门故事容易让我们只看到一面。需求存在，不代表短期股价一定继续上涨。",
        }
      : {
          title: "情绪清仓",
          emoji: "📉",
          color: "#059669",
          bg: "#ECFDF5",
          border: "#6EE7B7",
          lead: "两周后，园区增加服务人员，平均排队时间降到 48 分钟，退款率回落到 4%。订票率保持在 86%。",
          lesson:
            "问题存在，也不等于项目已经失败。给经营改善留出观察窗口，比立即下结论更稳健。",
        };

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4"
            style={{ background: meta.bg, border: `2px solid ${meta.border}` }}
          >
            {meta.emoji}
          </div>

          <p className="text-[11px] font-bold tracking-[0.2em] text-[#DC2626] mb-1">
            DECISION MISSED
          </p>
          <h2 className="text-lg font-bold text-[#1E293B] mb-1">
            「{meta.title}」
          </h2>
          <p className="text-xs text-[#DC2626] font-bold mb-5">-1 ❤️</p>

          <div className="w-full space-y-3 text-left">
            <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
              <p className="text-xs text-[#475569] leading-relaxed">
                {meta.lead}
              </p>
            </div>
            <div className="bg-[#FFFBEB] rounded-xl p-4 border border-[#FDE68A]">
              <p className="text-xs font-bold text-[#92400E] mb-2">
                💡 这一步的问题
              </p>
              <p className="text-xs text-[#92400E]/80 leading-relaxed">
                {meta.lesson}
              </p>
            </div>
          </div>
        </div>

        <ContinueButton
          onClick={() => setPhase("finalChoice")}
          label="回到最终决策"
        />
      </div>
    );
  };

  const renderGameOver = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-5">
        <div className="text-6xl mb-4">💔</div>
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#DC2626] mb-2">
          CHALLENGE FAILED
        </p>
        <h2 className="text-2xl font-black text-[#1E293B] mb-2">挑战失败</h2>
        <p className="text-sm text-[#64748B] max-w-[320px] mb-5">
          多空议会暂时休庭。重新挑战当前阶段，不需要从开场剧情全部重来。
        </p>

        <div className="flex gap-1.5 mb-6">
          <span className="opacity-20 grayscale text-2xl">❤️</span>
          <span className="opacity-20 grayscale text-2xl">❤️</span>
          <span className="opacity-20 grayscale text-2xl">❤️</span>
        </div>

        <div className="w-full rounded-xl bg-[#FFF7ED] border border-[#FED7AA] p-4 text-left">
          <p className="text-xs font-bold text-[#9A3412] mb-1">本次重试点</p>
          <p className="text-sm font-bold text-[#7C2D12]">
            {retryStage === "puzzle1"
              ? "Stage 1 · 清理热搜"
              : retryStage === "puzzle2"
              ? "Stage 2 · 多空分牌"
              : retryStage === "puzzle3"
              ? "Stage 3 · 议会辩论"
              : retryStage === "puzzle4"
              ? "Stage 4 · 失效条件"
              : "最终决策"}
          </p>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <ContinueButton onClick={retryCurrentStage} label="❤️ 满血重试当前阶段" />
        <button
          onClick={resetAll}
          className="w-full py-3 rounded-xl text-sm font-bold bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
        >
          从头开始
        </button>
        <button
          onClick={onBack}
          className="w-full py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#64748B]"
        >
          返回地图
        </button>
      </div>
    </div>
  );

  const renderGoodEnding = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-1">
        <div className="text-center pt-4 pb-5">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#EEF2FF] to-[#DDD6FE] flex items-center justify-center text-4xl mb-3 shadow-lg">
            🏆
          </div>
          <p className="text-[11px] font-black tracking-[0.24em] text-[#6366F1] mb-1">
            LEVEL CLEAR
          </p>
          <h2 className="text-2xl font-black text-[#1E293B] mb-1">
            闯关成功！
          </h2>
          <p className="text-sm text-[#64748B]">多空议会 · 热搜开庭</p>

          <div className="flex justify-center gap-1 mt-3 text-2xl">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={star <= starCount ? "" : "grayscale opacity-20"}
              >
                ⭐
              </span>
            ))}
          </div>

          <p className="text-xs font-bold text-[#6366F1] mt-1">
            {starCount === 3
              ? "完美通关"
              : starCount === 2
              ? "稳健通关"
              : "逆风通关"}
          </p>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl bg-white border border-[#E2E8F0] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-black text-[#1E293B]">本关战绩</p>
              <LivesBar lives={lives} />
            </div>

            <div className="space-y-2">
              {[
                ["🔍", "信息清洗", "完成"],
                ["🃏", "证据归类", "完成"],
                ["⚖️", "论点判断", "完成"],
                ["📋", "失效条件", "已建立"],
              ].map(([icon, label, status]) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-1.5 border-b last:border-b-0 border-[#F1F5F9]"
                >
                  <span className="text-xs font-semibold text-[#475569]">
                    {icon} {label}
                  </span>
                  <span className="text-xs font-bold text-[#059669]">
                    {status} ✓
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] p-4">
            <p className="text-xs font-bold text-[#4338CA] mb-1">
              🎖️ 解锁能力
            </p>
            <p className="text-lg font-black text-[#312E81] mb-3">「多空辩论」</p>
            <div className="space-y-1.5">
              {[
                "区分热度与真实证据",
                "同时建立看多与看空逻辑",
                "判断结论有没有超出证据",
                "为投资观点设置失效条件",
              ].map((text) => (
                <p key={text} className="text-xs text-[#4338CA]">
                  ✓ {text}
                </p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FEF2F2] rounded-xl p-3 border border-[#FECACA] text-center">
              <span className="text-2xl">📈</span>
              <p className="text-xs font-bold text-[#DC2626] mt-1">
                Bull Analyst
              </p>
              <p className="text-[10px] text-[#7F1D1D]">加入研究团队</p>
            </div>
            <div className="bg-[#ECFDF5] rounded-xl p-3 border border-[#A7F3D0] text-center">
              <span className="text-2xl">📉</span>
              <p className="text-xs font-bold text-[#059669] mt-1">
                Bear Analyst
              </p>
              <p className="text-[10px] text-[#065F46]">加入研究团队</p>
            </div>
          </div>

          <AgentBubble agent="lead">
            我以前听谁说得顺耳，就容易坐到谁那边。现在我会先问：观点靠什么成立，又会在什么时候失效。
          </AgentBubble>
        </div>
      </div>

      <div className="mt-4">
        <ContinueButton
          onClick={() => {
            // 到这里才真正通知外层：这一关完成了。
            onComplete?.();
            onBack?.();
          }}
          label="完成关卡 · 返回地图"
        />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] bg-white">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors"
        >
          <span>←</span>
          <span className="text-xs">返回</span>
        </button>

        <div className="flex items-center gap-3">
          {phase !== "goodEnding" && phase !== "gameOver" && (
            <>
              <span className="text-[10px] font-bold text-[#94A3B8]">
                LIFE
              </span>
              <LivesBar lives={lives} />
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {phase === "opening" && renderOpening()}
        {phase === "puzzle1" && renderPuzzle1()}
        {phase === "puzzle2" && renderPuzzle2()}
        {phase === "puzzle3" && renderPuzzle3()}
        {phase === "puzzle4" && renderPuzzle4()}
        {phase === "finalChoice" && renderFinalChoice()}
        {phase === "badEndingChase" && renderBadEnding("chase")}
        {phase === "badEndingSell" && renderBadEnding("sell")}
        {phase === "gameOver" && renderGameOver()}
        {phase === "goodEnding" && renderGoodEnding()}
      </div>
    </div>
  );
}