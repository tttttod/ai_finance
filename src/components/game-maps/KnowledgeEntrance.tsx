"use client";

import { useState, useEffect, useCallback } from "react";

interface KnowledgeEntranceProps {
  onBack: () => void;
  onComplete: () => void;
}

// ─── 场景数据 ───

interface SceneLine {
  text: string;
  expression?: string;
}

interface KnowledgeCard {
  title: string;
  content: string;
  stampKey: string;
  stampLabel: string;
}

interface SceneData {
  lines: SceneLine[];
  actionLabel?: string;
  secondaryAction?: { label: string; action: () => void };
  knowledgeCard?: KnowledgeCard;
  choices?: {
    id: string;
    label: string;
    correct: boolean;
    feedback: string[];
  }[];
}

const STAMP_INFO: { key: string; label: string; icon: string }[] = [
  { key: "principal", label: "本金", icon: "💰" },
  { key: "return", label: "收益", icon: "📈" },
  { key: "risk", label: "风险", icon: "🛡️" },
];

const SCENES: SceneData[] = [
  // ─── Scene 0: 抵达金融华尔界 ───
  {
    lines: [
      { text: "滴——检测到一位新鲜出炉的 TPTIer！", expression: "微笑" },
      { text: "欢迎抵达金融华尔界！我是你的领航员——Lead Agent。", expression: "微笑" },
      { text: "在这里，金币会散步，价格会坐过山车，连消息都有可能长出翅膀满天飞。", expression: "认真讲解" },
      { text: "不过别担心，我会负责带路。", expression: "微笑" },
    ],
    actionLabel: "向 Lead Agent 打招呼",
  },
  // ─── Scene 1: 欢迎来到入港口 ───
  {
    lines: [
      { text: "这里是金融知识入港口，也是每位 TPTIer 开始冒险的第一站。", expression: "认真讲解" },
      { text: "进入华尔界之前，你需要先领取一张——\n《金融华尔界新手通行证》！", expression: "认真讲解" },
      { text: "呃……本来应该直接发给你的。", expression: "惊讶" },
      { text: "但刚才一阵\u201c市场波动风\u201d吹过来，把通行证上的三个印章吹跑了！", expression: "惊讶" },
      { text: "没有印章，我们连港口的闸机都过不去。", expression: "无奈" },
    ],
    actionLabel: "一起找回来",
  },
  // ─── Scene 2: 本金印章 ───
  {
    lines: [
      { text: "看！第一枚印章就在那艘金币船上。", expression: "微笑" },
      { text: "它代表的是——本金，也就是你最初可以拿来安排和投资的钱。", expression: "认真讲解" },
      { text: "本金就像冒险时携带的补给。", expression: "认真讲解" },
      { text: "如果一上来就把所有补给扔进同一个神秘山洞……\n咳咳，那后面的旅程可能就只能靠喝西北风了。", expression: "无奈" },
    ],
    actionLabel: "查看知识卡",
    knowledgeCard: {
      title: "本金",
      content: "本金是参与投资的基础资金。\n做任何决定前，都要先想清楚：\n这笔钱是否承担得起损失？",
      stampKey: "principal",
      stampLabel: "收下\u300c本金印章\u300d",
    },
  },
  // ─── Scene 3: 收益印章 ───
  {
    lines: [
      { text: "第二枚是收益印章！", expression: "微笑" },
      { text: "收益就是一项选择可能带给你的回报。", expression: "认真讲解" },
      { text: "当然，金融华尔界里没有只会上升、不会下降的魔法电梯。", expression: "认真讲解" },
      { text: "如果有人拍着胸口告诉你——\u201c放心吧，收益超高，而且绝对不会亏！\u201d", expression: "无奈" },
      { text: "这时候先别掏金币，先看看他身后有没有准备好跑路用的小船。", expression: "认真讲解" },
    ],
    actionLabel: "查看知识卡",
    knowledgeCard: {
      title: "收益",
      content: "收益代表投资可能获得的回报，\n但\u201c高收益\u201d通常不会凭空出现。\n它往往伴随着更大的不确定性。",
      stampKey: "return",
      stampLabel: "收下\u300c收益印章\u300d",
    },
  },
  // ─── Scene 4: 风险选择题 ───
  {
    lines: [
      { text: "最后是风险印章。现在来做一道入港选择题！", expression: "认真讲解" },
      { text: "如果你不希望一个箱子翻进海里，就带走所有金币，你会怎么放？", expression: "认真讲解" },
    ],
    choices: [
      {
        id: "A",
        label: "全部放进同一个箱子",
        correct: false,
        feedback: [
          "勇气可嘉，但金币们已经开始集体瑟瑟发抖了！",
          "如果这个箱子出现问题，我们可能会一次失去全部补给。",
        ],
      },
      {
        id: "B",
        label: "分开放进几个箱子",
        correct: true,
        feedback: [
          "正确！不要把所有鸡蛋放在同一个篮子里——",
          "更不要放在一只正在海上蹦迪的篮子里。",
        ],
      },
    ],
    knowledgeCard: {
      title: "风险",
      content: "分散配置不能消除全部风险，\n但可以减少单一选择失败带来的影响。",
      stampKey: "risk",
      stampLabel: "收下\u300c风险印章\u300d",
    },
  },
  // ─── Scene 5: 新手通行证 ───
  {
    lines: [
      { text: "叮！三枚印章收集完成！", expression: "开心" },
      { text: "恭喜你获得——\n《金融华尔界新手通行证》", expression: "开心" },
      { text: "现在你已经掌握了华尔界的第一条生存法则：\n看见收益的时候，也要记得看看它身后跟着多大的风险。", expression: "认真讲解" },
      { text: "真正厉害的 TPTIer，不是每次都猜中涨跌的人。", expression: "认真讲解" },
      { text: "而是面对热闹的市场，依然知道自己在为什么做选择。", expression: "微笑" },
    ],
    actionLabel: "查看前方道路",
  },
  // ─── Scene 6: 华尔堡出现 ───
  {
    lines: [
      { text: "前方就是华尔堡。", expression: "伸手指向远方" },
      { text: "听说那里封存着通往现实世界的钥匙，也藏着十一场为 TPTIer 准备的试炼。", expression: "认真讲解" },
      { text: "知识、判断、情绪和运气——都会在里面悄悄考验你。", expression: "认真讲解" },
      { text: "不过没关系。我会继续担任你的领航员，负责指路、解释规则，以及在你冲动时及时按住你的钱包。", expression: "微笑" },
      { text: "准备好了吗，TPTIer？\n带上你的通行证，我们进城！", expression: "伸手指向远方" },
    ],
    actionLabel: "启程前往华尔堡",
    secondaryAction: { label: "再看看入港知识", action: () => {} },
  },
];

export default function KnowledgeEntrance({ onBack, onComplete }: KnowledgeEntranceProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [collectedStamps, setCollectedStamps] = useState<string[]>([]);
  const [showKnowledgeCard, setShowKnowledgeCard] = useState(false);
  const [riskAnswer, setRiskAnswer] = useState<string | null>(null);
  const [riskFeedback, setRiskFeedback] = useState<string[] | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showWallCastle, setShowWallCastle] = useState(false);
  const [entering, setEntering] = useState(true);
  const [showEntranceButton, setShowEntranceButton] = useState(false);

  // 开场动画：进入港口
  useEffect(() => {
    const t1 = setTimeout(() => setEntering(false), 600);
    const t2 = setTimeout(() => setShowEntranceButton(true), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const scene = SCENES[sceneIndex];

  // 当前场景的所有对话行是否已显示完
  const isDialogueComplete = lineIndex >= scene.lines.length - 1;

  // 前进到下一句对话
  const advanceDialogue = useCallback(() => {
    if (lineIndex < scene.lines.length - 1) {
      setLineIndex((i) => i + 1);
    }
  }, [lineIndex, scene.lines.length]);

  // 进入下一幕
  const goToNextScene = useCallback(() => {
    if (sceneIndex < SCENES.length - 1) {
      setSceneIndex((i) => i + 1);
      setLineIndex(0);
      setShowKnowledgeCard(false);
      setRiskAnswer(null);
      setRiskFeedback(null);
      setShowWallCastle(false);
      setShowCertificate(false);
    }
  }, [sceneIndex]);

  // 收集印章
  const collectStamp = useCallback(
    (key: string) => {
      if (!collectedStamps.includes(key)) {
        setCollectedStamps((prev) => [...prev, key]);
      }
      setShowKnowledgeCard(false);
      goToNextScene();
    },
    [collectedStamps, goToNextScene]
  );

  // 处理选择题
  const handleChoice = useCallback(
    (choiceId: string) => {
      const choice = scene.choices?.find((c) => c.id === choiceId);
      if (!choice) return;
      setRiskAnswer(choiceId);
      setRiskFeedback(choice.feedback);

      if (choice.correct) {
        // 答对后，延迟显示知识卡
        setTimeout(() => {
          setShowKnowledgeCard(true);
        }, 1500);
      }
    },
    [scene.choices]
  );

  // 重新选择（答错后）
  const retryChoice = useCallback(() => {
    setRiskAnswer(null);
    setRiskFeedback(null);
  }, []);

  // 完成整个剧情
  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // 处理场景操作按钮
  const handleSceneAction = useCallback(() => {
    if (sceneIndex === 0) {
      // 打招呼 → 下一幕
      goToNextScene();
    } else if (sceneIndex === 1) {
      // 一起找回来 → 下一幕
      goToNextScene();
    } else if (sceneIndex === 2 || sceneIndex === 3) {
      // 查看知识卡 → 显示知识卡
      setShowKnowledgeCard(true);
    } else if (sceneIndex === 5) {
      // 查看前方道路 → 显示通行证动画
      setShowCertificate(true);
      setTimeout(() => {
        setShowCertificate(false);
        setShowWallCastle(true);
        goToNextScene();
      }, 2000);
    } else if (sceneIndex === 6) {
      // 启程前往华尔堡 → 完成
      handleComplete();
    }
  }, [sceneIndex, goToNextScene, handleComplete]);

  // 知识卡按钮
  const handleKnowledgeCardAction = useCallback(() => {
    if (!scene.knowledgeCard) return;
    collectStamp(scene.knowledgeCard.stampKey);
  }, [scene.knowledgeCard, collectStamp]);

  // 印章状态
  const getStampStatus = (key: string) => {
    if (collectedStamps.includes(key)) return "collected";
    // 当前正在收集的印章
    if (scene.knowledgeCard?.stampKey === key && showKnowledgeCard) return "collecting";
    return "empty";
  };

  // ─── 渲染 ───

  // 入场页
  if (entering || !showEntranceButton) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1120]"
        style={{ padding: "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)" }}>
        <div className={`text-center transition-all duration-700 ${entering ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
          <div className="text-5xl mb-4">🏝️</div>
          <h1 className="text-2xl font-bold text-white mb-2">金融知识入港口</h1>
          <p className="text-[#94A3B8] text-sm mb-6">领取新手通行证，开启华尔界冒险</p>
          <button
            onClick={() => { setShowEntranceButton(false); }}
            className="px-8 py-3 rounded-xl text-white font-bold text-base shadow-lg"
            style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
          >
            进入港口
          </button>
        </div>
      </div>
    );
  }

  // 回顾模态框
  if (showReviewModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        style={{ padding: "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)" }}>
        <div className="bg-[#0F172A]/95 backdrop-blur-lg rounded-2xl border border-[#F59E0B]/30 max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-bold text-[#F59E0B] text-center mb-4">入港知识回顾</h2>
          <div className="space-y-3">
            {[
              { icon: "💰", title: "本金", content: "本金是参与投资的基础资金。做任何决定前，都要先想清楚：这笔钱是否承担得起损失？" },
              { icon: "📈", title: "收益", content: "收益代表投资可能获得的回报，但\u201c高收益\u201d通常不会凭空出现。它往往伴随着更大的不确定性。" },
              { icon: "🛡️", title: "风险", content: "分散配置不能消除全部风险，但可以减少单一选择失败带来的影响。" },
            ].map((card) => (
              <div key={card.title} className="bg-[#1E293B]/80 rounded-xl p-4 border border-[#F59E0B]/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{card.icon}</span>
                  <span className="font-bold text-[#F59E0B]">{card.title}</span>
                </div>
                <p className="text-sm text-[#94A3B8] whitespace-pre-line">{card.content}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setShowReviewModal(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#334155] text-white"
            >
              返回
            </button>
            <button
              onClick={() => {
                setShowReviewModal(false);
                setSceneIndex(0);
                setLineIndex(0);
                setCollectedStamps([]);
                setShowKnowledgeCard(false);
                setRiskAnswer(null);
                setRiskFeedback(null);
                setShowCertificate(false);
                setShowWallCastle(false);
              }}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
            >
              重新体验剧情
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0B1120] overflow-hidden"
      style={{ padding: "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)" }}>
      {/* ─── 顶部进度条 ─── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          <span className="text-lg">←</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A3B8]">
            {sceneIndex + 1}/{SCENES.length}
          </span>
          <div className="flex gap-1">
            {SCENES.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{
                  background: i < sceneIndex ? "#F59E0B" : i === sceneIndex ? "#F59E0B" : "#334155",
                  opacity: i === sceneIndex ? 1 : i < sceneIndex ? 0.8 : 0.4,
                }}
              />
            ))}
          </div>
        </div>

        {/* ─── 印章状态 ─── */}
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-1.5">
          {STAMP_INFO.map((s) => {
            const status = getStampStatus(s.key);
            return (
              <div
                key={s.key}
                className="flex items-center gap-1 text-xs transition-all duration-500"
                style={{
                  opacity: status === "collected" ? 1 : status === "collecting" ? 1 : 0.4,
                  transform: status === "collecting" ? "scale(1.15)" : "scale(1)",
                }}
              >
                <span className={status === "collected" ? "animate-bounce" : ""}>
                  {status === "collected" ? s.icon : "❓"}
                </span>
                <span className="text-[10px] hidden sm:inline" style={{ color: status === "collected" ? "#F59E0B" : "#64748B" }}>
                  {s.label}
                </span>
              </div>
            );
          })}
          <span className="text-[10px] text-[#64748B] ml-1">{collectedStamps.length}/3</span>
        </div>
      </div>

      {/* ─── 主要内容区 ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 场景背景装饰 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0F172A]/80 to-transparent" />
          {/* 装饰光点 */}
          <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-[#F59E0B]/20 animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-[#3B82F6]/20 animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/3 right-1/4 w-1 h-1 rounded-full bg-[#F59E0B]/15 animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>

        {/* 通行证动画（场景5） */}
        {showCertificate && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="animate-in zoom-in-95 duration-500 text-center">
              <div className="bg-[#0F172A] rounded-2xl border-2 border-[#F59E0B] p-6 mx-4 max-w-xs shadow-2xl shadow-[#F59E0B]/20">
                <div className="text-3xl mb-2">📜</div>
                <h3 className="text-lg font-bold text-[#F59E0B] mb-1">金融华尔界新手通行证</h3>
                <div className="border-t border-[#F59E0B]/30 my-3" />
                <div className="text-left text-sm space-y-1.5 text-[#94A3B8]">
                  <p>持有人：<span className="text-white font-semibold">TPTIer</span></p>
                  <p>已认证印章：</p>
                  <div className="flex gap-2 justify-center my-2">
                    {collectedStamps.includes("principal") && <span className="text-xl animate-bounce">💰</span>}
                    {collectedStamps.includes("return") && <span className="text-xl animate-bounce" style={{ animationDelay: "0.2s" }}>📈</span>}
                    {collectedStamps.includes("risk") && <span className="text-xl animate-bounce" style={{ animationDelay: "0.4s" }}>🛡️</span>}
                  </div>
                  <p>当前权限：<span className="text-[#22C55E] font-semibold">允许进入华尔堡</span></p>
                  <p>签发人：Lead Agent</p>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-[#22C55E] text-sm font-bold animate-pulse">新手通行证认证成功！</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 华尔堡出现（场景6转场） */}
        {showWallCastle && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
            <div className="animate-in zoom-in-95 duration-700 text-center">
              <div className="text-5xl mb-2">🏰</div>
              <p className="text-white font-bold text-lg">华尔堡已在远处浮现</p>
              <p className="text-[#94A3B8] text-sm mt-1">港口闸门缓缓打开...</p>
            </div>
          </div>
        )}

        {/* ─── 主内容：选择题场景 ─── */}
        {scene.choices && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 relative z-[1]">
            {/* 对话记录 */}
            <div className="w-full max-w-lg mb-6 space-y-3">
              {scene.lines.slice(0, lineIndex + 1).map((line, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <img
                    src="/agent-lead.png"
                    alt="Lead Agent"
                    className="w-8 h-8 rounded-full object-cover border border-[#F59E0B]/40 mt-0.5 shrink-0"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] text-[#F59E0B] font-semibold">Lead Agent</span>
                    <p className="text-sm text-white/90 mt-0.5 whitespace-pre-line">{line.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 选项按钮 */}
            {isDialogueComplete && !riskAnswer && (
              <div className="w-full max-w-lg space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {scene.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice.id)}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold text-left transition-all duration-200 border"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "white",
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold mr-2">
                      {choice.id}
                    </span>
                    {choice.label}
                  </button>
                ))}
              </div>
            )}

            {/* 答题反馈 */}
            {riskFeedback && (
              <div className="w-full max-w-lg mt-4 space-y-2 animate-in fade-in duration-300">
                {riskFeedback.map((fb, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{
                      background: riskAnswer === "B" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      border: `1px solid ${riskAnswer === "B" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                    }}
                  >
                    <span className="text-lg">{riskAnswer === "B" ? "✅" : "❌"}</span>
                    <p className="text-sm text-white/80">{fb}</p>
                  </div>
                ))}

                {/* 答错后重试 */}
                {riskAnswer === "A" && (
                  <button
                    onClick={retryChoice}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white mt-2"
                    style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
                  >
                    再想一想
                  </button>
                )}
              </div>
            )}

            {/* 未完成对话时显示继续按钮 */}
            {!isDialogueComplete && (
              <button
                onClick={advanceDialogue}
                className="mt-4 px-6 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                继续 →
              </button>
            )}
          </div>
        )}

        {/* ─── 主内容：知识卡（覆盖在场景上） ─── */}
        {showKnowledgeCard && scene.knowledgeCard && !scene.choices && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 px-4">
            <div className="animate-in zoom-in-95 duration-300 max-w-sm w-full">
              <div className="bg-[#0F172A]/95 backdrop-blur-lg rounded-2xl border-2 border-[#F59E0B]/40 p-6 shadow-2xl shadow-[#F59E0B]/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💡</span>
                  <h3 className="text-lg font-bold text-[#F59E0B]">
                    {scene.knowledgeCard.title}
                  </h3>
                </div>
                <div className="bg-[#1E293B]/80 rounded-xl p-4 mb-4 border border-[#F59E0B]/20">
                  <p className="text-sm text-[#94A3B8] whitespace-pre-line leading-relaxed">
                    {scene.knowledgeCard.content}
                  </p>
                </div>
                <button
                  onClick={handleKnowledgeCardAction}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg"
                  style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
                >
                  {scene.knowledgeCard.stampLabel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 风险场景的知识卡（特殊处理：选择题场景的知识卡） */}
        {showKnowledgeCard && scene.choices && scene.knowledgeCard && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 px-4">
            <div className="animate-in zoom-in-95 duration-300 max-w-sm w-full">
              <div className="bg-[#0F172A]/95 backdrop-blur-lg rounded-2xl border-2 border-[#F59E0B]/40 p-6 shadow-2xl shadow-[#F59E0B]/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💡</span>
                  <h3 className="text-lg font-bold text-[#F59E0B]">{scene.knowledgeCard.title}</h3>
                </div>
                <div className="bg-[#1E293B]/80 rounded-xl p-4 mb-4 border border-[#F59E0B]/20">
                  <p className="text-sm text-[#94A3B8] whitespace-pre-line leading-relaxed">
                    {scene.knowledgeCard.content}
                  </p>
                </div>
                <button
                  onClick={() => collectStamp(scene.knowledgeCard!.stampKey)}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg"
                  style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
                >
                  {scene.knowledgeCard.stampLabel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── 主内容：普通对话场景 ─── */}
        {!scene.choices && !showKnowledgeCard && !showCertificate && !showWallCastle && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 relative z-[1]">
            {/* Lead Agent 立绘 */}
            <div className="mb-6 animate-in fade-in duration-500">
              <div className="relative">
                <img
                  src="/agent-lead.png"
                  alt="Lead Agent"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#F59E0B]/40 shadow-lg shadow-[#F59E0B]/10"
                />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#0B1120] px-2 py-0.5 rounded-full border border-[#F59E0B]/30">
                  <span className="text-[10px] text-[#F59E0B] font-semibold whitespace-nowrap">Lead Agent</span>
                </div>
              </div>
              <p className="text-[10px] text-[#64748B] text-center mt-1">你的华尔界领航员</p>
            </div>

            {/* 对话框 */}
            <div className="w-full max-w-lg">
              <div className="bg-[#0F172A]/90 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-xl">
                <p className="text-sm text-white/90 whitespace-pre-line leading-relaxed min-h-[3em]">
                  {scene.lines[lineIndex]?.text}
                </p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-6 w-full max-w-lg">
              {/* 对话未完成 → 继续按钮 */}
              {!isDialogueComplete && (
                <button
                  onClick={advanceDialogue}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white/70 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  继续 →
                </button>
              )}

              {/* 对话完成 → 场景操作按钮 */}
              {isDialogueComplete && scene.actionLabel && !showKnowledgeCard && (
                <>
                  <button
                    onClick={handleSceneAction}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg"
                    style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
                  >
                    {scene.actionLabel}
                  </button>

                  {/* 场景6：次按钮 */}
                  {sceneIndex === 6 && scene.secondaryAction && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-[#94A3B8] mt-2 border border-white/10"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                      {scene.secondaryAction.label}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}