"use client";

import { useState, useEffect, useCallback } from "react";

// ===== 第1关剧情数据 =====
interface StoryOption {
  label: string;
  isCorrect: boolean;
  feedback: string;
}

interface StoryNode {
  id: number;
  scene: string;
  dialogue: string;
  question: string;
  options: StoryOption[];
}

const LEVEL_1_STORY: StoryNode[] = [
  {
    id: 1,
    scene: "废弃交易大厅里只剩一块还亮着的屏幕，屏幕显示「热门科技股明日或高开8%」。",
    dialogue: "顾明澈问：「如果你是我，你会不会立刻下单？」",
    question: "高开8%，资金涌入，所有人都在说这是新主线。告诉我，我们现在第一个问题该问什么？",
    options: [
      { label: "现在买，明天卖，先赚到再说", isCorrect: false, feedback: "「我以前也是这么说的。」" },
      { label: "是谁推荐的？如果是大V，就可以信", isCorrect: false, feedback: "「你把研究外包给了陌生人的嗓门。」" },
      { label: "我们的研究对象、周期、假设和风险是什么？", isCorrect: true, feedback: "「你没有先问答案。很好。」" },
      { label: "先看涨幅榜，涨得最猛的一定最强", isCorrect: false, feedback: "「涨幅榜是结果，不是理由。」" },
    ],
  },
  {
    id: 2,
    scene: "顾明澈打开一份旧报告，标题「确定性机会，建议重仓」，下方显示「次日跌停，组合回撤17%」。",
    dialogue: "顾明澈问：「那天我也有数据，也有逻辑，也有掌声。错在哪里？」",
    question: "回顾那次失败，真正的错误是什么？",
    options: [
      { label: "你只是运气不好，下次加倍赢回来", isCorrect: false, feedback: "「运气不好？那只是你给自己找的台阶。」" },
      { label: "你只寻找支持自己判断的证据", isCorrect: true, feedback: "「……是的。我只看到了我想看到的。」" },
      { label: "你应该更早听消息", isCorrect: false, feedback: "「消息？你以为我缺的是消息？」" },
      { label: "市场太坏了，没人能负责", isCorrect: false, feedback: "「怪市场？那你和三年前的我一样。」" },
    ],
  },
  {
    id: 3,
    scene: "顾明澈递给玩家一张「研究问题卡」，他说：「如果你能写下这次研究真正要回答的问题，我就跟你走。」",
    dialogue: "顾明澈问：「告诉我，你真正要回答的问题是什么？」",
    question: "选择你认为正确的研究问题：",
    options: [
      { label: "这只股票明天会不会涨？", isCorrect: false, feedback: "「没有人能回答这个问题。你换一个问题。」" },
      { label: "在当前市场环境下，这个标的是否值得在我的周期内承担风险？", isCorrect: true, feedback: "「……这就是我丢掉的那个问题。我跟你走。」" },
      { label: "大家都买了，我现在不买会不会错过？", isCorrect: false, feedback: "「这不是研究问题，这是恐惧。」" },
      { label: "我要怎么证明自己是对的？", isCorrect: false, feedback: "「证明自己对？你应该先想怎么证伪自己。」" },
    ],
  },
];

// ===== 游戏进度类型 =====
interface GameProgress {
  currentLevel: number;
  unlockedLevels: number[];
  completedLevels: number[];
}

const DEFAULT_PROGRESS: GameProgress = {
  currentLevel: 1,
  unlockedLevels: [1],
  completedLevels: [],
};

function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem("tradeti_game_progress");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_PROGRESS;
}

function saveProgress(progress: GameProgress) {
  localStorage.setItem("tradeti_game_progress", JSON.stringify(progress));
}

// ===== 剧情面板状态 =====
type PanelState = "story" | "feedback" | "bad_ending" | "good_ending";

interface Level1PanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLevelComplete: (level: number) => void;
}

export default function Level1Panel({ isOpen, onClose, onLevelComplete }: Level1PanelProps) {
  const [nodeIndex, setNodeIndex] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [panelState, setPanelState] = useState<PanelState>("story");
  const [lastFeedback, setLastFeedback] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [progress, setProgress] = useState<GameProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    if (isOpen) {
      setProgress(loadProgress());
      setNodeIndex(0);
      setFailCount(0);
      setPanelState("story");
      setLastFeedback("");
      setSelectedOption(null);
    }
  }, [isOpen]);

  const currentNode = LEVEL_1_STORY[nodeIndex];

  const handleSelect = useCallback((optionIndex: number) => {
    const option = currentNode.options[optionIndex];
    setSelectedOption(optionIndex);
    setLastFeedback(option.feedback);

    if (option.isCorrect) {
      // 正确选项 -> 显示反馈 -> 进入下一节点
      setPanelState("feedback");
      setTimeout(() => {
        if (nodeIndex < LEVEL_1_STORY.length - 1) {
          setNodeIndex((prev) => prev + 1);
          setPanelState("story");
          setSelectedOption(null);
        } else {
          // 通关
          const newProgress = {
            ...progress,
            completedLevels: [...new Set([...progress.completedLevels, 1])],
            unlockedLevels: [...new Set([...progress.unlockedLevels, 1, 2])],
          };
          saveProgress(newProgress);
          setProgress(newProgress);
          setPanelState("good_ending");
          onLevelComplete(1);
        }
      }, 2000);
    } else {
      // 错误选项
      const newFailCount = failCount + 1;
      setFailCount(newFailCount);
      setPanelState("feedback");

      if (newFailCount >= 2) {
        // 坏结局
        setTimeout(() => {
          setPanelState("bad_ending");
        }, 2000);
      } else {
        // 继续
        setTimeout(() => {
          if (nodeIndex < LEVEL_1_STORY.length - 1) {
            setNodeIndex((prev) => prev + 1);
          }
          setPanelState("story");
          setSelectedOption(null);
        }, 2000);
      }
    }
  }, [currentNode, failCount, nodeIndex, progress, onLevelComplete]);

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
            {panelState !== "bad_ending" && panelState !== "good_ending" && (
              <span className="text-[10px] text-slate-400">
                {nodeIndex + 1}/{LEVEL_1_STORY.length}
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
                  <div className="text-[10px] text-slate-400">Lead Agent · 研究总控</div>
                </div>
              </div>

              {/* 场景描述 */}
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
                <p className="text-xs text-slate-300 leading-relaxed">{currentNode.scene}</p>
              </div>

              {/* 对白 */}
              <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                <p className="text-xs text-blue-200 leading-relaxed">{currentNode.dialogue}</p>
              </div>

              {/* 问题 */}
              <div className="text-center">
                <p className="text-sm text-white font-medium">{currentNode.question}</p>
              </div>

              {/* 选项 */}
              <div className="space-y-2">
                {currentNode.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className="w-full text-left p-3 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/50 hover:border-blue-500/50 transition-all text-xs text-slate-200 leading-relaxed"
                  >
                    <span className="text-blue-400 font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {option.label}
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
                <p className="text-sm text-white text-center leading-relaxed">{lastFeedback}</p>
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
                💔
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">顾明澈转身离开了</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  「你还是和三年前那些人一样。我先走了。」
                </p>
                <p className="text-[10px] text-slate-500 mt-4">
                  错误次数达到 2 次，本关失败。请重新挑战。
                </p>
              </div>
              <button
                onClick={() => {
                  setNodeIndex(0);
                  setFailCount(0);
                  setPanelState("story");
                  setSelectedOption(null);
                }}
                className="px-6 py-2 rounded-xl bg-blue-500/20 border border-blue-400/60 text-blue-200 text-xs font-bold hover:bg-blue-500/30 transition-all"
              >
                重新挑战
              </button>
            </div>
          )}

          {/* 好结局 */}
          {panelState === "good_ending" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30">
                🎉
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">顾明澈决定跟你走</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  「这就是我丢掉的那个问题。谢谢你帮我找回来。」
                </p>
                <p className="text-[10px] text-emerald-400 mt-4 font-bold">
                  第1关「开户日」通关！Lead Agent 顾明澈已解锁。
                </p>
                <p className="text-[10px] text-slate-500 mt-2">
                  第2关「数据黑市」已解锁。
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-200 text-xs font-bold hover:bg-emerald-500/30 transition-all"
              >
                返回地图
              </button>
            </div>
          )}
        </div>

        {/* 底部进度条 */}
        {panelState !== "bad_ending" && panelState !== "good_ending" && (
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
