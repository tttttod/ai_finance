"use client";

import { useEffect, useCallback } from "react";

interface OnboardingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMap?: () => void;
}

const STEPS = [
  {
    icon: "🗺️",
    title: "进入金融华尔界",
    desc: "点击地图入口，进入交易员成长地图。",
  },
  {
    icon: "🎮",
    title: "完成关卡挑战",
    desc: "每一关都是一次交易员试炼，可能是剧情选择、知识学习、答题或小游戏。",
  },
  {
    icon: "🦸",
    title: "解锁 Agent",
    desc: "通关后，对应 Agent 会加入你的研究天团。",
  },
  {
    icon: "🔬",
    title: "补完整条投研链路",
    desc: "Agent 会逐步补全数据、市场、行业、基本面、估值、技术、情绪、风险和复盘能力。",
  },
];

export default function OnboardingGuideModal({
  isOpen,
  onClose,
  onStartMap,
}: OnboardingGuideModalProps) {
  // ESC 键关闭
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-[#FAFAF9] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="relative px-5 pt-5 pb-3">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
            aria-label="关闭"
          >
            <span className="text-sm">✕</span>
          </button>

          {/* 标题 */}
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h2 className="text-lg font-black text-slate-800">
              欢迎来到市场冒险局
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              这里不是荐股软件，而是你的投研训练场。
            </p>
          </div>
        </div>

        {/* 步骤卡片 */}
        <div className="px-5 pb-4">
          <div className="space-y-2">
            {STEPS.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-lg">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                      步骤 {index + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {step.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 提示 */}
          <div className="mt-3 px-1">
            <p className="text-[10px] text-slate-400 leading-relaxed text-center">
              💡 你的第一个任务：点亮 Lead Agent
            </p>
          </div>
        </div>

        {/* 按钮区 */}
        <div className="px-5 pb-4 space-y-2">
          <button
            onClick={onStartMap || onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] transition-all"
          >
            开始冒险
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-slate-500 text-xs font-medium hover:bg-slate-100 transition-colors"
          >
            我先自己看看
          </button>
        </div>

        {/* 免责声明 */}
        <div className="px-5 pb-4">
          <p className="text-[9px] text-slate-400 text-center leading-relaxed">
            本产品仅用于投资研究训练与信息整理，不构成投资建议。
          </p>
        </div>
      </div>
    </div>
  );
}
