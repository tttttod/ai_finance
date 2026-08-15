"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

type ParliamentGameProps = {
  onBack?: () => void;
  onComplete?: () => void;
  addCoins?: (amount: number) => void;
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
  | "restart";

type TagType = "repeat" | "promotion" | "verifiable";
type InfoItem = {
  id: string;
  title: string;
  stats: { label: string; value: string }[];
  correctTag: TagType;
  bullReaction: string;
  bearReaction: string;
  sentimentReaction: string;
};

type EvidenceCard = {
  id: string;
  text: string;
  correctZone: "bull" | "bear" | "noise";
  bullReaction?: string;
  bearReaction?: string;
  sentimentReaction?: string;
};

type DebateRound = {
  speaker: "bull" | "bear";
  statement: string;
  correctAnswer: "support" | "overstated" | "outdated";
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

// ===== 数据定义 =====

const tagMeta: Record<TagType, { label: string; icon: string; color: string; bg: string; border: string }> = {
  repeat: { label: "重复传播", icon: "🔁", color: "#9333EA", bg: "#FAF5FF", border: "#D8B4FE" },
  promotion: { label: "付费推广", icon: "📢", color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
  verifiable: { label: "可核对信号", icon: "✅", color: "#059669", bg: "#ECFDF5", border: "#6EE7B7" },
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
    bullReaction: "",
    bearReaction: "排队问题真实存在，传播规模无法直接代表问题范围。",
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
    bullReaction: "",
    bearReaction: "",
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
    bullReaction: "",
    bearReaction: "",
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
    statement: "门票预订接近满额，二次到访券使用率也超过旧项目。云鲸岛已经表现出真实需求。",
    correctAnswer: "support",
    feedback: "这段判断使用了可核对记录，也保留了适当范围。",
    speakerReaction: "终于有人允许我讲增长了。",
  },
  {
    speaker: "bear",
    statement: "退款率达到旧项目的两倍以上，排队时间也超过计划。服务能力还没有跟上热度。",
    correctAnswer: "support",
    feedback: "当前经营问题有数据支持，而且分析师没有直接给项目判死刑。",
    speakerReaction: "同一家公司可以同时拥有需求和问题。",
  },
  {
    speaker: "bull",
    statement: "既然需求这么强，股价接下来一定会继续上涨。",
    correctAnswer: "overstated",
    feedback: "需求强劲可以支撑基本面判断，但股价短期走势受多种因素影响，「一定会」说得太满了。",
    speakerReaction: "好吧，需求能够支持我的判断，股价仍有自己的脾气。",
  },
  {
    speaker: "bear",
    statement: "退款率这么高，这个项目已经失败了。",
    correctAnswer: "overstated",
    feedback: "退款率高于预期是真实问题，但直接宣布项目失败，跨度太大，证据还不够。",
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

// ===== 子组件 =====

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
    lead: { name: "Lead Agent", title: "研究总控", emoji: "🎬", color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE", img: "/lead_agent.png" },
    sentiment: { name: "Sentiment Agent", title: "情绪分析师", emoji: "💗", color: "#DB2777", bg: "#FDF2F8", border: "#F9A8D4", img: "/sentiment_agent.PNG" },
    bull: { name: "Bull Analyst", title: "看多分析师", emoji: "📈", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5", img: "/bull_agent.png" },
    bear: { name: "Bear Analyst", title: "看空分析师", emoji: "📉", color: "#059669", bg: "#ECFDF5", border: "#6EE7B7", img: "/bear_agent.png" },
  }[agent];

  const isRight = side === "right";

  return (
    <div className={`flex items-start gap-2.5 ${isRight ? "flex-row-reverse" : ""}`}>
      <div className="relative shrink-0">
        <div
          className="w-11 h-11 rounded-full overflow-hidden border-2 shadow-sm"
          style={{ borderColor: agentMeta.border, background: agentMeta.bg }}
        >
          <div className="w-full h-full flex items-center justify-center text-xl">
            {agentMeta.emoji}
          </div>
        </div>
      </div>
      <div className={`max-w-[78%] ${isRight ? "text-right" : ""}`}>
        <div className={`flex items-center gap-1.5 mb-1 ${isRight ? "justify-end" : ""}`}>
          <span className="text-[10px] font-bold tracking-wide" style={{ color: agentMeta.color }}>
            {agentMeta.name}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: agentMeta.bg, color: agentMeta.color }}>
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
      {/* 议会厅顶部装饰 */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-[#94A3B8]" />
          <span className="text-xs font-bold tracking-[0.2em] text-[#64748B]">PARLIAMENT HALL</span>
          <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-[#94A3B8]" />
        </div>
      </div>
      {children}
    </div>
  );
}

function ContinueButton({ onClick, disabled = false, label = "继续" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
        disabled
          ? "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
          : "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg hover:shadow-xl active:scale-[0.98]"
      }`}
      style={disabled ? {} : { boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)" }}
    >
      {label}
    </button>
  );
}

// ===== 主组件 =====

export default function ParliamentGame({ onBack, onComplete, addCoins }: ParliamentGameProps) {
  const [phase, setPhase] = useState<Phase>("opening");
  const [openingStep, setOpeningStep] = useState(0);
  const [coins, setCoins] = useState(50);

  // 谜题一：热搜标签
  const [puzzle1Index, setPuzzle1Index] = useState(0);
  const [puzzle1Selected, setPuzzle1Selected] = useState<TagType | null>(null);
  const [puzzle1Feedback, setPuzzle1Feedback] = useState(false);
  const [puzzle1Wrong, setPuzzle1Wrong] = useState(false);

  // 谜题二：多空分牌
  const [puzzle2Cards, setPuzzle2Cards] = useState<EvidenceCard[]>(evidenceCards);
  const [puzzle2Zones, setPuzzle2Zones] = useState<{ bull: string[]; bear: string[]; noise: string[] }>({
    bull: [],
    bear: [],
    noise: [],
  });
  const [puzzle2SelectedCard, setPuzzle2SelectedCard] = useState<string | null>(null);
  const [puzzle2Feedback, setPuzzle2Feedback] = useState<{ cardId: string; correct: boolean; zone: string } | null>(null);
  const [puzzle2AllCorrect, setPuzzle2AllCorrect] = useState(false);

  // 谜题三：议会辩论
  const [puzzle3Index, setPuzzle3Index] = useState(0);
  const [puzzle3Selected, setPuzzle3Selected] = useState<"support" | "overstated" | "outdated" | null>(null);
  const [puzzle3Feedback, setPuzzle3Feedback] = useState(false);

  // 谜题四：失效条件
  const [puzzle4Selected, setPuzzle4Selected] = useState<string | null>(null);
  const [puzzle4Feedback, setPuzzle4Feedback] = useState(false);

  // 错误结局计数
  const [failCount, setFailCount] = useState(0);

  const handleRestart = useCallback(() => {
    setPhase("opening");
    setOpeningStep(0);
    setPuzzle1Index(0);
    setPuzzle1Selected(null);
    setPuzzle1Feedback(false);
    setPuzzle1Wrong(false);
    setPuzzle2Cards(evidenceCards);
    setPuzzle2Zones({ bull: [], bear: [], noise: [] });
    setPuzzle2SelectedCard(null);
    setPuzzle2Feedback(null);
    setPuzzle2AllCorrect(false);
    setPuzzle3Index(0);
    setPuzzle3Selected(null);
    setPuzzle3Feedback(false);
    setPuzzle4Selected(null);
    setPuzzle4Feedback(false);
  }, []);

  const handlePayRestart = () => {
    if (coins >= 50) {
      setCoins((c) => c - 50);
      setFailCount((f) => f + 1);
      handleRestart();
    }
  };

  // ===== 渲染各个阶段 =====

  const renderOpening = () => {
    const steps = [
      { agent: "lead" as const, text: "议会钟声响起，中央屏幕弹出两条热搜。" },
      { agent: "bull" as const, text: "连续两个周末门票售罄，这个项目已经火了。公司的增长才刚开始。", side: "left" as const },
      { agent: "bear" as const, text: "排队、退款、服务混乱。热度正在透支游客的耐心。", side: "right" as const },
      { agent: "lead" as const, text: "左边让我想加仓，右边让我现在就卖。他们说得都挺像真的。" },
      { agent: "sentiment" as const, text: "两边都在用热搜讲故事。先看看这些声音来自多少件真实事件。" },
    ];

    const current = steps[openingStep];
    const isLast = openingStep === steps.length - 1;

    return (
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🏛️</span>
            <h2 className="text-base font-bold text-[#1E293B]">多空议会：热搜开庭</h2>
          </div>
          <p className="text-xs text-[#64748B]">
            星湾娱乐的"云鲸岛乐园"开业后连续登上热搜。有人说门票抢不到，有人说游客正在退款。
          </p>
        </div>

        <ParliamentHall>
          <div className="space-y-4 min-h-[180px]">
            <AgentBubble agent={current.agent} side={(current as any).side || "left"}>
              {current.text}
            </AgentBubble>
          </div>
        </ParliamentHall>

        <div className="mt-4 flex gap-2">
          <div className="flex-1 flex items-center justify-center gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === openingStep ? "w-4 bg-[#6366F1]" : i < openingStep ? "bg-[#A5B4FC]" : "bg-[#E2E8F0]"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => {
              if (isLast) {
                setPhase("puzzle1");
              } else {
                setOpeningStep((s) => s + 1);
              }
            }}
            className="px-5 py-2 rounded-lg text-sm font-bold bg-[#6366F1] text-white hover:bg-[#4F46E5] transition-colors"
          >
            {isLast ? "开始清理" : "继续"}
          </button>
        </div>
      </div>
    );
  };

  // ===== 谜题一：清理热搜 =====

  const handleTagSelect = (tag: TagType) => {
    if (puzzle1Feedback) return;
    setPuzzle1Selected(tag);
    const currentItem = infoItems[puzzle1Index];
    const isCorrect = tag === currentItem.correctTag;
    setPuzzle1Wrong(!isCorrect);
    setPuzzle1Feedback(true);
  };

  const handlePuzzle1Next = () => {
    if (puzzle1Index < infoItems.length - 1) {
      setPuzzle1Index((i) => i + 1);
      setPuzzle1Selected(null);
      setPuzzle1Feedback(false);
      setPuzzle1Wrong(false);
    } else {
      setPhase("puzzle2");
    }
  };

  const renderPuzzle1 = () => {
    const currentItem = infoItems[puzzle1Index];
    const tag = tagMeta[currentItem.correctTag];

    return (
      <div className="flex flex-col h-full">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <h2 className="text-base font-bold text-[#1E293B]">谜题一：清理热搜</h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#6366F1] font-bold">
              {puzzle1Index + 1} / {infoItems.length}
            </span>
          </div>
          <p className="text-xs text-[#64748B]">为面前的信息选择正确的标签。</p>
        </div>

        {/* 信息卡片 */}
        <div
          className="rounded-xl p-4 mb-4 border-2 transition-all"
          style={{
            background: puzzle1Feedback ? tag.bg : "#FFFFFF",
            borderColor: puzzle1Feedback ? tag.border : "#E2E8F0",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📋</span>
            <h3 className="text-sm font-bold text-[#1E293B]">{currentItem.title}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {currentItem.stats.map((s) => (
              <div key={s.label} className="bg-[#F8FAFC] rounded-lg px-3 py-2">
                <p className="text-[10px] text-[#64748B]">{s.label}</p>
                <p className="text-sm font-bold text-[#1E293B] mt-0.5 font-mono">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 标签选择 */}
        <div className="space-y-2 mb-4">
          {(Object.keys(tagMeta) as TagType[]).map((key) => {
            const t = tagMeta[key];
            const isSelected = puzzle1Selected === key;
            const isCorrect = puzzle1Feedback && key === currentItem.correctTag;
            const isWrong = puzzle1Feedback && isSelected && key !== currentItem.correctTag;

            return (
              <button
                key={key}
                onClick={() => handleTagSelect(key)}
                disabled={puzzle1Feedback}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  puzzle1Feedback ? "cursor-default" : "hover:shadow-md active:scale-[0.98]"
                }`}
                style={{
                  background: isCorrect ? t.bg : isWrong ? "#FEF2F2" : "#FFFFFF",
                  borderColor: isCorrect ? t.border : isWrong ? "#FCA5A5" : "#E2E8F0",
                }}
              >
                <span className="text-xl">{t.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: isCorrect ? t.color : isWrong ? "#DC2626" : "#1E293B" }}>
                    {t.label}
                  </p>
                </div>
                {isCorrect && <span className="text-green-600 text-lg">✓</span>}
                {isWrong && <span className="text-red-500 text-lg">✗</span>}
              </button>
            );
          })}
        </div>

        {/* 反馈 */}
        {puzzle1Feedback && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            {puzzle1Wrong ? (
              <div className="bg-[#FEF2F2] rounded-xl p-3 border border-[#FECACA] mb-3">
                <p className="text-xs font-bold text-[#DC2626] mb-1">再想想</p>
                <p className="text-xs text-[#7F1D1D]">
                  这个信息的正确标签是「{tag.label}」。
                </p>
              </div>
            ) : null}
            <AgentBubble agent="sentiment">
              {currentItem.sentimentReaction}
            </AgentBubble>
            {currentItem.bearReaction && (
              <div className="mt-3">
                <AgentBubble agent="bear" side="right">
                  {currentItem.bearReaction}
                </AgentBubble>
              </div>
            )}
          </div>
        )}

        {puzzle1Feedback && (
          <div className="mt-3">
            <ContinueButton
              onClick={handlePuzzle1Next}
              label={puzzle1Index < infoItems.length - 1 ? "下一条信息" : "进入分牌阶段"}
            />
          </div>
        )}
      </div>
    );
  };

  // ===== 谜题二：多空分牌 =====

  const handleCardClick = (cardId: string) => {
    if (puzzle2Feedback) return;
    setPuzzle2SelectedCard(cardId === puzzle2SelectedCard ? null : cardId);
  };

  const handleZoneClick = (zone: "bull" | "bear" | "noise") => {
    if (!puzzle2SelectedCard || puzzle2Feedback) return;
    const card = evidenceCards.find((c) => c.id === puzzle2SelectedCard);
    if (!card) return;

    const isCorrect = card.correctZone === zone;

    // 加入对应区域
    setPuzzle2Zones((prev) => ({
      ...prev,
      [zone]: [...prev[zone], card.id],
    }));

    // 从待处理列表移除
    setPuzzle2Cards((prev) => prev.filter((c) => c.id !== card.id));

    // 显示反馈
    setPuzzle2Feedback({ cardId: card.id, correct: isCorrect, zone });
    setPuzzle2SelectedCard(null);
  };

  const handlePuzzle2Continue = () => {
    setPuzzle2Feedback(null);
    if (puzzle2Cards.length === 0) {
      // 检查是否全部正确
      const allCorrect = evidenceCards.every((card) => {
        const zone = (Object.keys(puzzle2Zones) as ("bull" | "bear" | "noise")[]).find((z) =>
          puzzle2Zones[z].includes(card.id)
        );
        return zone === card.correctZone;
      });
      if (allCorrect) {
        setPuzzle2AllCorrect(true);
      } else {
        // 重置，让玩家重新分
        setPuzzle2Cards(evidenceCards);
        setPuzzle2Zones({ bull: [], bear: [], noise: [] });
      }
    }
  };

  const renderPuzzle2 = () => {
    const zoneLabels = {
      bull: { label: "看多证据", icon: "📈", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
      bear: { label: "看空证据", icon: "📉", color: "#059669", bg: "#ECFDF5", border: "#6EE7B7" },
      noise: { label: "热度噪声", icon: "🔇", color: "#6B7280", bg: "#F9FAFB", border: "#D1D5DB" },
    };

    if (puzzle2AllCorrect) {
      return (
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🃏</span>
              <h2 className="text-base font-bold text-[#1E293B]">证据分类完成</h2>
            </div>
            <p className="text-xs text-[#64748B]">所有卡片都放在了正确的位置。</p>
          </div>
          <ParliamentHall>
            <div className="space-y-4">
              <AgentBubble agent="sentiment">
                现在他们讨论的是同一家公司，而不是两个互相吵架的话题。
              </AgentBubble>
              <AgentBubble agent="bull" side="left">
                短期需求确实存在，游客也表达了再次到访的兴趣。
              </AgentBubble>
              <AgentBubble agent="bear" side="right">
                我需要证明的是经营压力，热搜里的愤怒表情帮不了我。
              </AgentBubble>
            </div>
          </ParliamentHall>
          <div className="mt-4">
            <ContinueButton onClick={() => setPhase("puzzle3")} label="进入议会辩论" />
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
              <h2 className="text-base font-bold text-[#1E293B]">谜题二：多空分牌</h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#6366F1] font-bold">
              剩余 {puzzle2Cards.length} 张
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            先点选一张卡片，再点击下方对应的区域放入。
          </p>
        </div>

        {/* 待分配卡片 */}
        <div className="bg-[#F8FAFC] rounded-xl p-3 mb-3 border border-[#E2E8F0]">
          <p className="text-[11px] font-bold text-[#64748B] mb-2">待分配证据</p>
          <div className="space-y-2 max-h-[140px] overflow-y-auto">
            {puzzle2Cards.map((card) => {
              const isSelected = puzzle2SelectedCard === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={puzzle2Feedback !== null}
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

        {/* 三个区域 */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {(["bull", "bear", "noise"] as const).map((zone) => {
            const z = zoneLabels[zone];
            const zoneCards = puzzle2Zones[zone];
            const isTargetable = puzzle2SelectedCard !== null && !puzzle2Feedback;

            return (
              <button
                key={zone}
                onClick={() => handleZoneClick(zone)}
                disabled={!puzzle2SelectedCard || puzzle2Feedback !== null}
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
                  {zoneCards.length} 张
                </p>
              </button>
            );
          })}
        </div>

        {/* 反馈 */}
        {puzzle2Feedback && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div
              className={`rounded-xl p-3 mb-3 border ${
                puzzle2Feedback.correct
                  ? "bg-[#ECFDF5] border-[#6EE7B7]"
                  : "bg-[#FEF2F2] border-[#FCA5A5]"
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${puzzle2Feedback.correct ? "text-[#059669]" : "text-[#DC2626]"}`}>
                {puzzle2Feedback.correct ? "分类正确" : "分类有误"}
              </p>
              <p className="text-xs" style={{ color: puzzle2Feedback.correct ? "#065F46" : "#7F1D1D" }}>
                {puzzle2Feedback.correct
                  ? "这张卡片放在了正确的区域。"
                  : "这张卡片应该放在别的区域，继续尝试。剩余卡片分完后会重新检查。"}
              </p>
            </div>
            {/* 角色反应 */}
            {(() => {
              const card = evidenceCards.find((c) => c.id === puzzle2Feedback?.cardId);
              if (!card || !puzzle2Feedback.correct) return null;
              if (card.bullReaction && puzzle2Feedback.zone === "bull") {
                return (
                  <AgentBubble agent="bull" side="left">
                    {card.bullReaction}
                  </AgentBubble>
                );
              }
              if (card.bearReaction && puzzle2Feedback.zone === "bear") {
                return (
                  <AgentBubble agent="bear" side="right">
                    {card.bearReaction}
                  </AgentBubble>
                );
              }
              if (card.sentimentReaction && puzzle2Feedback.zone === "noise") {
                return (
                  <AgentBubble agent="sentiment">
                    {card.sentimentReaction}
                  </AgentBubble>
                );
              }
              return null;
            })()}
          </div>
        )}

        {puzzle2Feedback && (
          <div className="mt-3">
            <ContinueButton onClick={handlePuzzle2Continue} label="继续" />
          </div>
        )}
      </div>
    );
  };

  // ===== 谜题三：议会辩论 =====

  const handleDebateAnswer = (answer: "support" | "overstated" | "outdated") => {
    if (puzzle3Feedback) return;
    setPuzzle3Selected(answer);
    setPuzzle3Feedback(true);
  };

  const handlePuzzle3Next = () => {
    if (puzzle3Index < debateRounds.length - 1) {
      setPuzzle3Index((i) => i + 1);
      setPuzzle3Selected(null);
      setPuzzle3Feedback(false);
    } else {
      setPhase("puzzle4");
    }
  };

  const renderPuzzle3 = () => {
    const round = debateRounds[puzzle3Index];
    const isCorrect = puzzle3Selected === round.correctAnswer;

    const answerOptions = [
      { id: "support" as const, label: "证据支持", icon: "✅", color: "#059669" },
      { id: "overstated" as const, label: "表述过头", icon: "⚠️", color: "#D97706" },
      { id: "outdated" as const, label: "信息过期", icon: "🕐", color: "#6B7280" },
    ];

    return (
      <div className="flex flex-col h-full">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚖️</span>
              <h2 className="text-base font-bold text-[#1E293B]">谜题三：议会辩论</h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#6366F1] font-bold">
              {puzzle3Index + 1} / {debateRounds.length}
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            判断分析师的发言是否合理。
          </p>
        </div>

        {/* 发言人 */}
        <ParliamentHall>
          <AgentBubble agent={round.speaker} side={round.speaker === "bull" ? "left" : "right"}>
            {round.statement}
          </AgentBubble>
        </ParliamentHall>

        {/* 选项 */}
        <div className="mt-4 space-y-2">
          {answerOptions.map((opt) => {
            const isSelected = puzzle3Selected === opt.id;
            const isCorrectAnswer = puzzle3Feedback && opt.id === round.correctAnswer;
            const isWrongSelected = puzzle3Feedback && isSelected && opt.id !== round.correctAnswer;

            return (
              <button
                key={opt.id}
                onClick={() => handleDebateAnswer(opt.id)}
                disabled={puzzle3Feedback}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  puzzle3Feedback ? "cursor-default" : "hover:shadow-md active:scale-[0.98]"
                }`}
                style={{
                  background: isCorrectAnswer
                    ? "#ECFDF5"
                    : isWrongSelected
                    ? "#FEF2F2"
                    : isSelected
                    ? "#EEF2FF"
                    : "#FFFFFF",
                  borderColor: isCorrectAnswer
                    ? "#6EE7B7"
                    : isWrongSelected
                    ? "#FCA5A5"
                    : isSelected
                    ? "#6366F1"
                    : "#E2E8F0",
                }}
              >
                <span className="text-xl">{opt.icon}</span>
                <span
                  className="text-sm font-bold"
                  style={{
                    color: isCorrectAnswer ? "#059669" : isWrongSelected ? "#DC2626" : "#1E293B",
                  }}
                >
                  {opt.label}
                </span>
                {isCorrectAnswer && <span className="ml-auto text-green-600">✓</span>}
                {isWrongSelected && <span className="ml-auto text-red-500">✗</span>}
              </button>
            );
          })}
        </div>

        {/* 反馈 */}
        {puzzle3Feedback && (
          <div className="flex-1 min-h-0 overflow-y-auto mt-4">
            <div
              className={`rounded-xl p-3 mb-3 border ${
                isCorrect ? "bg-[#ECFDF5] border-[#6EE7B7]" : "bg-[#FEF2F2] border-[#FCA5A5]"
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${isCorrect ? "text-[#059669]" : "text-[#DC2626]"}`}>
                {isCorrect ? "判断准确" : "再想想"}
              </p>
              <p className="text-xs" style={{ color: isCorrect ? "#065F46" : "#7F1D1D" }}>
                {round.feedback}
              </p>
            </div>

            {isCorrect && (
              <AgentBubble agent={round.speaker} side={round.speaker === "bull" ? "left" : "right"}>
                {round.speakerReaction}
              </AgentBubble>
            )}

            {!isCorrect && puzzle3Index === 1 && (
              <AgentBubble agent="lead">
                奇怪，我同时同意了两个人。
              </AgentBubble>
            )}
          </div>
        )}

        {puzzle3Feedback && (
          <div className="mt-3">
            <ContinueButton
              onClick={handlePuzzle3Next}
              label={puzzle3Index < debateRounds.length - 1 ? "下一轮辩论" : "设置失效条件"}
            />
          </div>
        )}
      </div>
    );
  };

  // ===== 谜题四：失效条件 =====

  const handlePlanSelect = (planId: string) => {
    if (puzzle4Feedback) return;
    setPuzzle4Selected(planId);
  };

  const handlePuzzle4Confirm = () => {
    if (!puzzle4Selected) return;
    setPuzzle4Feedback(true);
  };

  const renderPuzzle4 = () => {
    const selectedPlan = failurePlans.find((p) => p.id === puzzle4Selected);
    const isCorrect = selectedPlan?.isCorrect;

    return (
      <div className="flex flex-col h-full">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📋</span>
            <h2 className="text-base font-bold text-[#1E293B]">谜题四：失效条件</h2>
          </div>
          <p className="text-xs text-[#64748B]">
            为两位分析师选择一份观察计划，明确观点何时失效。
          </p>
        </div>

        {/* 方案列表 */}
        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto mb-3">
          {failurePlans.map((plan) => {
            const isSelected = puzzle4Selected === plan.id;
            const showCorrect = puzzle4Feedback && plan.isCorrect;
            const showWrong = puzzle4Feedback && isSelected && !plan.isCorrect;

            return (
              <button
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                disabled={puzzle4Feedback}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  puzzle4Feedback ? "cursor-default" : "hover:shadow-md active:scale-[0.99]"
                }`}
                style={{
                  background: showCorrect
                    ? "#ECFDF5"
                    : showWrong
                    ? "#FEF2F2"
                    : isSelected
                    ? "#EEF2FF"
                    : "#FFFFFF",
                  borderColor: showCorrect
                    ? "#6EE7B7"
                    : showWrong
                    ? "#FCA5A5"
                    : isSelected
                    ? "#6366F1"
                    : "#E2E8F0",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">
                    {plan.id === "stock" ? "📊" : plan.id === "operation" ? "📈" : "🔥"}
                  </span>
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: showCorrect ? "#059669" : showWrong ? "#DC2626" : "#1E293B",
                    }}
                  >
                    {plan.title}
                  </p>
                  {showCorrect && <span className="ml-auto text-green-600">✓</span>}
                  {showWrong && <span className="ml-auto text-red-500">✗</span>}
                </div>
                <ul className="space-y-1 ml-7">
                  {plan.items.map((item, i) => (
                    <li key={i} className="text-xs text-[#64748B] flex items-start gap-1.5">
                      <span className="text-[8px] mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* 反馈 */}
        {puzzle4Feedback && selectedPlan && (
          <div className="mb-3">
            <div
              className={`rounded-xl p-3 mb-3 border ${
                isCorrect ? "bg-[#ECFDF5] border-[#6EE7B7]" : "bg-[#FEF2F2] border-[#FCA5A5]"
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${isCorrect ? "text-[#059669]" : "text-[#DC2626]"}`}>
                {isCorrect ? "计划合理" : "这个计划有问题"}
              </p>
              <p className="text-xs" style={{ color: isCorrect ? "#065F46" : "#7F1D1D" }}>
                {isCorrect
                  ? "观点需要绑定可观察的经营指标，而不是股价或情绪热度。"
                  : "好的失效条件应该直接检验观点成立的理由，而不是间接指标。"}
              </p>
            </div>

            {selectedPlan.bullReaction && (
              <div className="mb-2">
                <AgentBubble agent="bull" side="left">
                  {selectedPlan.bullReaction}
                </AgentBubble>
              </div>
            )}
            {selectedPlan.bearReaction && (
              <div className="mb-2">
                <AgentBubble agent="bear" side="right">
                  {selectedPlan.bearReaction}
                </AgentBubble>
              </div>
            )}
            {selectedPlan.sentimentReaction && (
              <AgentBubble agent="sentiment">
                {selectedPlan.sentimentReaction}
              </AgentBubble>
            )}
          </div>
        )}

        {!puzzle4Feedback ? (
          <ContinueButton onClick={handlePuzzle4Confirm} disabled={!puzzle4Selected} label="确认选择" />
        ) : isCorrect ? (
          <ContinueButton onClick={() => setPhase("finalChoice")} label="进入最终决策" />
        ) : (
          <button
            onClick={() => {
              setPuzzle4Selected(null);
              setPuzzle4Feedback(false);
            }}
            className="w-full py-3 rounded-xl text-sm font-bold bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] transition-colors"
          >
            重新选择
          </button>
        )}
      </div>
    );
  };

  // ===== 最终选择 =====

  const handleFinalChoice = (choice: "chase" | "sell" | "hold") => {
    if (choice === "chase") {
      setPhase("badEndingChase");
    } else if (choice === "sell") {
      setPhase("badEndingSell");
    } else {
      setPhase("goodEnding");
      addCoins?.(30);
      onComplete?.();
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
            你持有 2000 元星湾娱乐，正在考虑增加 8000 元投入。现在，做出你的选择。
          </p>
        </div>

        <ParliamentHall>
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border-2 border-[#FCA5A5] flex items-center justify-center text-xl mb-1">
                📈
              </div>
              <p className="text-[10px] font-bold text-[#DC2626]">BULL</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs text-[#64748B] mb-1">你的决定</p>
              <p className="text-lg font-bold text-[#1E293B]">2,000 → ?</p>
            </div>
            <div className="flex flex-col items-center">
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
              style={{ background: choice.bg, borderColor: choice.border }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{choice.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold" style={{ color: choice.color }}>
                      {choice.title}
                    </p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/60" style={{ color: choice.color }}>
                      {choice.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569]">{choice.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-3">
          <p className="text-[10px] text-center text-[#94A3B8]">
            你的选择将触发不同结局
          </p>
        </div>
      </div>
    );
  };

  // ===== 结局 =====

  const renderGoodEnding = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] flex items-center justify-center text-4xl mb-4 shadow-lg">
          🏛️
        </div>
        <h2 className="text-xl font-bold text-[#1E293B] mb-2">正确结局</h2>
        <p className="text-sm text-[#64748B] mb-6">解锁技能：多空辩论</p>

        <div className="w-full space-y-3 text-left">
          <div className="bg-[#F0FDF4] rounded-xl p-4 border border-[#BBF7D0]">
            <p className="text-xs text-[#166534] font-bold mb-2">议会厅两侧的灯同时亮起</p>
            <p className="text-xs text-[#166534]/80 leading-relaxed">
              中央屏幕将看多报告和看空报告并排保存。
            </p>
          </div>

          <AgentBubble agent="sentiment">
            我的工作到这里。声音已经清理干净，接下来该由他们讨论未来了。
          </AgentBubble>

          <AgentBubble agent="lead">
            我以前听谁说得顺耳，就容易坐到谁那边。现在我会问，他的观点靠什么成立，又会在什么时候失效。
          </AgentBubble>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FEF2F2] rounded-xl p-3 border border-[#FECACA] text-center">
              <span className="text-2xl">📈</span>
              <p className="text-xs font-bold text-[#DC2626] mt-1">Bull Analyst</p>
              <p className="text-[10px] text-[#7F1D1D]">加入团队</p>
            </div>
            <div className="bg-[#ECFDF5] rounded-xl p-3 border border-[#A7F3D0] text-center">
              <span className="text-2xl">📉</span>
              <p className="text-xs font-bold text-[#059669] mt-1">Bear Analyst</p>
              <p className="text-[10px] text-[#065F46]">加入团队</p>
            </div>
          </div>

          <div className="bg-[#EEF2FF] rounded-xl p-4 border border-[#C7D2FE]">
            <p className="text-xs font-bold text-[#4338CA] mb-2">🎖️ 新技能：多空辩论</p>
            <ul className="space-y-1">
              {["生成看多逻辑", "生成看空逻辑", "标出双方使用的证据", "设置观点失效条件"].map((s, i) => (
                <li key={i} className="text-xs text-[#4338CA]/80 flex items-center gap-2">
                  <span>✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ContinueButton onClick={() => onBack?.()} label="返回地图" />
      </div>
    </div>
  );

  const renderBadEnding = (type: "chase" | "sell") => {
    const isChase = type === "chase";
    const meta = isChase
      ? {
          title: "热搜追高团",
          emoji: "📈",
          color: "#DC2626",
          bg: "#FEF2F2",
          border: "#FCA5A5",
          lead: "两周后，订票率降至 63%，退款率升至 11%。公司宣布暂时限制入园人数。",
          analyst: "也许下一条热搜能把游客带回来。",
          analystAgent: "bull" as const,
        }
      : {
          title: "一条差评退场",
          emoji: "📉",
          color: "#059669",
          bg: "#ECFDF5",
          border: "#6EE7B7",
          lead: "两周后，园区增加服务人员，平均排队时间降到 48 分钟，退款率回落到 4%。订票率保持在 86%。",
          analyst: "问题改善了，我们的结论却留在开业第一天。",
          analystAgent: "lead" as const,
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
          <h2 className="text-lg font-bold text-[#1E293B] mb-1">错误结局</h2>
          <p className="text-sm font-bold mb-6" style={{ color: meta.color }}>
            「{meta.title}」
          </p>

          <div className="w-full space-y-4 text-left">
            <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
              <p className="text-xs text-[#475569] leading-relaxed">{meta.lead}</p>
            </div>

            <AgentBubble agent={meta.analystAgent} side={meta.analystAgent === ("bear" as string) ? "right" : "left"}>
              {meta.analyst}
            </AgentBubble>

            <div className="bg-[#FFFBEB] rounded-xl p-4 border border-[#FDE68A]">
              <p className="text-xs font-bold text-[#92400E] mb-2">💡 思考</p>
              <p className="text-xs text-[#92400E]/80 leading-relaxed">
                {isChase
                  ? "热搜里的热门故事容易让我们只看到一面。好的决策需要同时考虑机会和风险，并为观点设置失效条件。"
                  : "被负面情绪牵着走，容易错过问题改善的机会。给自己留出观察期，比匆忙下结论更重要。"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <button
            onClick={handlePayRestart}
            disabled={coins < 50}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
              coins < 50
                ? "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
                : "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white shadow-lg hover:shadow-xl active:scale-[0.98]"
            }`}
          >
            💰 支付 50 金币重新开始 ({coins} 金币)
          </button>
          <button
            onClick={() => onBack?.()}
            className="w-full py-3 rounded-xl text-sm font-bold bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] transition-colors"
          >
            返回关卡列表
          </button>
        </div>
      </div>
    );
  };

  // ===== 主渲染 =====

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] rounded-xl overflow-hidden">
      {/* 顶部条 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] bg-white">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors"
        >
          <span>←</span>
          <span className="text-xs">返回</span>
        </button>
        <div className="flex items-center gap-1">
          <span className="text-sm">💰</span>
          <span className="text-xs font-bold text-[#D97706]">{coins}</span>
        </div>
      </div>

      {/* 游戏内容区 */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {phase === "opening" && renderOpening()}
        {phase === "puzzle1" && renderPuzzle1()}
        {phase === "puzzle2" && renderPuzzle2()}
        {phase === "puzzle3" && renderPuzzle3()}
        {phase === "puzzle4" && renderPuzzle4()}
        {phase === "finalChoice" && renderFinalChoice()}
        {phase === "goodEnding" && renderGoodEnding()}
        {phase === "badEndingChase" && renderBadEnding("chase")}
        {phase === "badEndingSell" && renderBadEnding("sell")}
      </div>
    </div>
  );
}
