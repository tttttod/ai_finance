"use client";

import { useState, useEffect, useCallback } from "react";

// ===== 关卡常量 =====
const TRADER_ROAD_STORAGE_KEY = "tradeti_game_progress";

export const TRADER_ROAD_LEVELS = [
  { id: 1, title: "开户日", subtitle: "Lead Agent", agent: "lead", icon: "🎯" },
  { id: 2, title: "数据黑市", subtitle: "Data Agent", agent: "data", icon: "📊" },
  { id: 3, title: "市场风暴", subtitle: "Market Agent", agent: "market", icon: "🌪️" },
  { id: 4, title: "政策密函", subtitle: "Industry Agent", agent: "industry", icon: "📜" },
  { id: 5, title: "财报夜审", subtitle: "Fundamental Agent", agent: "fundamental", icon: "📑" },
  { id: 6, title: "价格审判庭", subtitle: "Valuation Agent", agent: "valuation", icon: "⚖️" },
  { id: 7, title: "K线神谕", subtitle: "Technical Agent", agent: "technical", icon: "📈" },
  { id: 8, title: "舆论火场", subtitle: "Sentiment Agent", agent: "sentiment", icon: "🔥" },
  { id: 9, title: "多空议会", subtitle: "Bull / Bear Analyst", agent: "debate", icon: "🏛️" },
  { id: 10, title: "回撤之门", subtitle: "Risk Officer", agent: "risk_manager", icon: "🛡️" },
];

// ===== 游戏进度类型 =====
export interface TraderRoadProgress {
  currentLevel: number;
  unlockedAgents: string[];
  completedLevels: number[];
  failCount: number;
  endings: string[];
}

const DEFAULT_PROGRESS: TraderRoadProgress = {
  currentLevel: 1,
  unlockedAgents: [],
  completedLevels: [],
  failCount: 0,
  endings: [],
};

export function loadProgress(): TraderRoadProgress {
  try {
    const raw = localStorage.getItem(TRADER_ROAD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        currentLevel: parsed.currentLevel || 1,
        unlockedAgents: parsed.unlockedAgents || [],
        completedLevels: parsed.completedLevels || [],
        failCount: parsed.failCount || 0,
        endings: parsed.endings || [],
      };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_PROGRESS };
}

export function saveProgress(progress: TraderRoadProgress) {
  localStorage.setItem(TRADER_ROAD_STORAGE_KEY, JSON.stringify(progress));
}

// ===== 第1关剧情数据 =====
interface StoryOption {
  id: string;
  text: string;
  failDelta: number;
  feedback: string;
}

interface StoryNode {
  id: number;
  scene: string;
  dialogue: string;
  options: StoryOption[];
}

// 开场文案
const LEVEL_1_OPENING = `废弃交易大厅里，只剩下一块还亮着的屏幕。
屏幕上滚动着同一句话：
"热门科技股明日或高开 8%。"

一个穿着旧西装的男人坐在阴影里。
他没有回头，只问你：
"如果你是我，你会不会立刻下单？"

他的名牌已经褪色：
顾明澈，前明星基金经理。

他低声说：
"我以前从不犹豫。后来，我也因此失去了整支团队。"`;

const LEVEL_1_STORY: StoryNode[] = [
  {
    id: 1,
    scene: `顾明澈看着屏幕：
"高开 8%，资金涌入，所有人都在说这是新主线。"
"告诉我，我们现在第一个问题该问什么？"`,
    dialogue: "",
    options: [
      {
        id: "1A",
        text: "现在买，明天卖，先赚到再说。",
        failDelta: 1,
        feedback: "顾明澈沉默了一下：\u201c我以前也是这么说的。\u201d",
      },
      {
        id: "1B",
        text: "是谁推荐的？如果是大 V，就可以信。",
        failDelta: 1,
        feedback: "顾明澈冷笑：\u201c你把研究外包给了陌生人的嗓门。\u201d",
      },
      {
        id: "1C",
        text: "我们的研究对象、周期、假设和风险是什么？",
        failDelta: 0,
        feedback: "顾明澈抬头：\u201c你没有先问答案。很好。\u201d",
      },
      {
        id: "1D",
        text: "先看涨幅榜，涨得最猛的一定最强。",
        failDelta: 1,
        feedback: "顾明澈：\u201c涨幅榜是结果，不是理由。\u201d",
      },
    ],
  },
  {
    id: 2,
    scene: `顾明澈打开一份旧报告。
标题是：\u201c确定性机会，建议重仓。\u201d
报告日期下面，有一行红字：
\u201c次日跌停，组合回撤 17%。\u201d

他说：
\u201c那天我也有数据，也有逻辑，也有掌声。错在哪里？\u201d`,
    dialogue: "",
    options: [
      {
        id: "2A",
        text: "你只是运气不好，下次加倍赢回来。",
        failDelta: 1,
        feedback: "顾明澈的手指停住：\u201c这句话我听过，在我自己嘴里。\u201d",
      },
      {
        id: "2B",
        text: "你只寻找支持自己判断的证据。",
        failDelta: 0,
        feedback: "顾明澈：\u201c是的。我当时不是在研究，是在为结论辩护。\u201d",
      },
      {
        id: "2C",
        text: "你应该更早听消息。",
        failDelta: 1,
        feedback: "顾明澈：\u201c更早听错消息，只会更早犯错。\u201d",
      },
      {
        id: "2D",
        text: "市场太坏了，没人能负责。",
        failDelta: 1,
        feedback: "顾明澈：\u201c交易员最危险的时刻，是把责任交给市场。\u201d",
      },
    ],
  },
  {
    id: 3,
    scene: `顾明澈递给你一张空白卡片：
\u201c如果你能写下这次研究真正要回答的问题，我就跟你走。\u201d`,
    dialogue: "",
    options: [
      {
        id: "3A",
        text: "这只股票明天会不会涨？",
        failDelta: 1,
        feedback: "问题过窄，只关注短期结果。",
      },
      {
        id: "3B",
        text: "在当前市场环境下，这个标的是否值得在我的周期内承担风险？",
        failDelta: 0,
        feedback: "这是一张合格的研究问题卡：环境、标的、周期、风险都在里面。",
      },
      {
        id: "3C",
        text: "大家都买了，我现在不买会不会错过？",
        failDelta: 1,
        feedback: "这是情绪问题，不是研究问题。",
      },
      {
        id: "3D",
        text: "我要怎么证明自己是对的？",
        failDelta: 1,
        feedback: "这是心魔，不是研究。",
      },
    ],
  },
];

// ===== 剧情面板状态 =====
type PanelState = "opening" | "story" | "feedback" | "bad_ending" | "good_ending";

interface Level1PanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLevelComplete: (level: number) => void;
  onGoToResearch?: () => void;
}

export default function Level1Panel({ isOpen, onClose, onLevelComplete, onGoToResearch }: Level1PanelProps) {
  const [nodeIndex, setNodeIndex] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [panelState, setPanelState] = useState<PanelState>("opening");
  const [lastFeedback, setLastFeedback] = useState("");
  const [progress, setProgress] = useState<TraderRoadProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    if (isOpen) {
      setProgress(loadProgress());
      setNodeIndex(0);
      setFailCount(0);
      setPanelState("opening");
      setLastFeedback("");
    }
  }, [isOpen]);

  const currentNode = LEVEL_1_STORY[nodeIndex];

  const handleStartGame = useCallback(() => {
    setPanelState("story");
  }, []);

  const handleSelect = useCallback((optionIndex: number) => {
    const option = currentNode.options[optionIndex];
    setLastFeedback(option.feedback);

    if (option.failDelta === 0) {
      // 正确选项 -> 显示反馈 -> 进入下一节点
      setPanelState("feedback");
      setTimeout(() => {
        if (nodeIndex < LEVEL_1_STORY.length - 1) {
          setNodeIndex((prev) => prev + 1);
          setPanelState("story");
        } else {
          // 通关
          const newProgress: TraderRoadProgress = {
            currentLevel: 2,
            unlockedAgents: [...new Set([...progress.unlockedAgents, "lead"])],
            completedLevels: [...new Set([...progress.completedLevels, 1])],
            failCount: 0,
            endings: [...progress.endings, "good_1"],
          };
          saveProgress(newProgress);
          setProgress(newProgress);
          setPanelState("good_ending");
          onLevelComplete(1);
        }
      }, 2500);
    } else {
      // 错误选项
      const newFailCount = failCount + 1;
      setFailCount(newFailCount);
      setPanelState("feedback");

      if (newFailCount >= 2) {
        // 坏结局
        setTimeout(() => {
          const newProgress: TraderRoadProgress = {
            ...progress,
            failCount: 0,
            endings: [...progress.endings, "bad_1"],
          };
          saveProgress(newProgress);
          setProgress(newProgress);
          setPanelState("bad_ending");
        }, 2500);
      } else {
        // 继续
        setTimeout(() => {
          if (nodeIndex < LEVEL_1_STORY.length - 1) {
            setNodeIndex((prev) => prev + 1);
          }
          setPanelState("story");
        }, 2500);
      }
    }
  }, [currentNode, failCount, nodeIndex, progress, onLevelComplete]);

  const handleRestart = useCallback(() => {
    setNodeIndex(0);
    setFailCount(0);
    setPanelState("opening");
    setLastFeedback("");
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎯</span>
            <span className="text-xs font-bold text-white">第1关 · 开户日</span>
          </div>
          <div className="flex items-center gap-2">
            {(panelState === "story" || panelState === "opening") && (
              <span className="text-[10px] text-slate-400">
                {panelState === "opening" ? "开场" : `${nodeIndex + 1}/${LEVEL_1_STORY.length}`}
              </span>
            )}
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 开场画面 */}
          {panelState === "opening" && (
            <div className="space-y-4">
              {/* 角色头像 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-2xl shadow-lg border-2 border-slate-500/30">
                  👤
                </div>
                <div>
                  <div className="text-sm font-bold text-white">顾明澈</div>
                  <div className="text-[10px] text-slate-400">Lead Agent / 研究总控</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">前明星基金经理，现失意交易员</div>
                </div>
              </div>

              {/* 开场文案 */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{LEVEL_1_OPENING}</p>
              </div>

              {/* 开始按钮 */}
              <button
                onClick={handleStartGame}
                className="w-full py-3 rounded-xl bg-blue-500/20 border border-blue-400/60 text-blue-200 text-sm font-bold hover:bg-blue-500/30 transition-all"
              >
                进入剧情
              </button>
            </div>
          )}

          {/* 剧情状态 */}
          {panelState === "story" && currentNode && (
            <div className="space-y-4">
              {/* 角色头像 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">
                  👤
                </div>
                <div>
                  <div className="text-sm font-bold text-white">顾明澈</div>
                  <div className="text-[10px] text-slate-400">Lead Agent / 研究总控</div>
                </div>
              </div>

              {/* 场景描述 */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{currentNode.scene}</p>
              </div>

              {/* 选项 */}
              <div className="space-y-2">
                {currentNode.options.map((option, idx) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(idx)}
                    className="w-full text-left p-3 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/50 hover:border-blue-500/50 transition-all text-xs text-slate-200 leading-relaxed"
                  >
                    <span className="text-blue-400 font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 反馈状态 */}
          {panelState === "feedback" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30 animate-pulse">
                👤
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 max-w-xs">
                <p className="text-sm text-white text-center leading-relaxed whitespace-pre-line">{lastFeedback}</p>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {/* 坏结局 */}
          {panelState === "bad_ending" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-3xl shadow-lg shadow-red-500/30">
                💀
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-lg font-bold text-red-400">坏结局 · 先有答案的人</h3>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 max-w-xs">
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
{`顾明澈重新坐回屏幕前。
他开始删掉所有反对意见，只留下支持买入的证据。
第二天，屏幕变成一片刺眼的绿色。
他没有回头，只说：
"原来我从来没有离开过那一天。"`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRestart}
                className="px-6 py-2.5 rounded-xl bg-blue-500/20 border border-blue-400/60 text-blue-200 text-xs font-bold hover:bg-blue-500/30 transition-all"
              >
                重新开始第 1 关
              </button>
            </div>
          )}

          {/* 通关结局 */}
          {panelState === "good_ending" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30">
                🎯
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-lg font-bold text-emerald-400">Lead Agent 已解锁</h3>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 max-w-xs">
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
{`顾明澈把那张"研究问题卡"收进口袋。
大厅里的第一盏灯亮了。
他说：
"从今天起，我不再替你给答案。"
"我会先帮你把问题问清楚。"`}
                  </p>
                </div>

                {/* 解锁说明 */}
                <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                  <p className="text-xs text-emerald-300 font-bold mb-2">Lead Agent / 研究总控 已加入你的 Agent 链路。</p>
                  <p className="text-[10px] text-slate-400 mb-1">能力解锁：</p>
                  <div className="grid grid-cols-2 gap-1">
                    {["确认研究问题", "拆解分析任务", "调度后续 Agent", "汇总最终结论"].map((ability) => (
                      <div key={ability} className="text-[10px] text-emerald-200 flex items-center gap-1">
                        <span className="text-emerald-400">✓</span>
                        {ability}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 双按钮 */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all"
                >
                  返回地图
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onGoToResearch?.();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-200 text-xs font-bold hover:bg-emerald-500/30 transition-all"
                >
                  去研究页体验
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 底部进度条 */}
        {(panelState === "story" || panelState === "opening") && (
          <div className="p-3 border-t border-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">容错</span>
              <div className="flex-1 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    failCount === 0 ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                  style={{ width: `${((2 - failCount) / 2) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500">{2 - failCount}/2</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
