"use client";

import { useState, useEffect } from "react";
import { TRADETI_PERSONALITIES } from "@/lib/mini-types";
import type { TradeTIState, TradeTIPersonalityId } from "@/lib/mini-types";

interface OnboardingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMap?: () => void;
  tradeTIResult?: TradeTIState | null;
}

// 人格专属台词
const PERSONALITY_LINES: Record<string, string> = {
  wall_street: "你已经懂得，情绪不能替你下单。",
  old_money: "这次不用观察三年，先从第一关开始。",
  qin_shihuang: "没人会给你打钱，但你可以解锁自己的研究链路。",
  kline_shaman: "K线可以看，但别忘了问为什么。",
  all_in_warrior: "先别梭哈，先把 Lead Agent 找回来。",
  breakeven_master: "成本价不是宇宙中心，研究问题才是起点。",
  fomo_chaser: "别追最后一棒，先学会判断消息是否已经被计价。",
  report_archaeologist: "财报很重要，但地图也要往前走。",
  monte_carlo_poet: "模型不是水晶球，交易之路要一步步补完。",
};

const DEFAULT_LINE = "欢迎来到市场冒险局，你的投研训练从这里开始。";

// 金色粒子配置
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 3}s`,
  duration: `${3 + Math.random() * 2}s`,
  size: 2 + Math.random() * 3,
}));

export default function OnboardingGuideModal({
  isOpen,
  onClose,
  onStartMap,
  tradeTIResult,
}: OnboardingGuideModalProps) {
  const [avatarError, setAvatarError] = useState(false);

  // Reset avatar error state when modal opens
  useEffect(() => {
    if (isOpen) setAvatarError(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const personalityId = tradeTIResult?.result_type || null;
  const personality = personalityId
    ? TRADETI_PERSONALITIES[personalityId as TradeTIPersonalityId]
    : null;
  const avatarSrc = personalityId ? `/avatar_${personalityId}.png` : null;
  const personalityLine = personalityId
    ? PERSONALITY_LINES[personalityId] || DEFAULT_LINE
    : DEFAULT_LINE;
  const personalityName = personality?.name || "市场冒险家";
  const personalityEmoji = personality?.emoji || "🗺️";

  const handleStart = () => {
    if (onStartMap) {
      onStartMap();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* 金色粒子背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-amber-300/60 animate-onboarding-float"
            style={{
              left: p.left,
              bottom: "-10px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* 弹窗主体 */}
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#111827] via-[#1E293B] to-[#0F172A] border border-amber-300/40 shadow-[0_0_40px_rgba(245,158,11,0.25)] overflow-hidden animate-onboarding-enter max-h-[90vh] flex flex-col">
        {/* 扫光效果 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <div className="absolute inset-0 animate-onboarding-shine bg-gradient-to-r from-transparent via-amber-300/10 to-transparent -translate-x-full" />
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-slate-800/80 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="关闭"
        >
          <span className="text-xs">✕</span>
        </button>

        {/* 内容区 - 可滚动 */}
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4">
          {/* 顶部徽章区 */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-300/10 border border-amber-300/30 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-300/90 tracking-wider">
                MARKET ADVENTURE BUREAU
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              市场冒险局入职通知
            </h2>
          </div>

          {/* 人格角色区 */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 mb-4">
            {/* 头像 */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full border-2 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)] overflow-hidden bg-slate-700 animate-onboarding-avatar-glow">
                {avatarSrc && !avatarError ? (
                  <img
                    src={avatarSrc}
                    alt={personalityName}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-amber-300/20 to-orange-500/20">
                    {personalityEmoji}
                  </div>
                )}
              </div>
            </div>
            {/* 人格信息 */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-slate-400 font-medium mb-0.5">
                你的交易人格
              </div>
              <div className="text-sm font-bold text-white truncate">
                {personalityName}
              </div>
              <div className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed line-clamp-2">
                &ldquo;{personalityLine}&rdquo;
              </div>
            </div>
          </div>

          {/* 任务说明区 - 3步 */}
          <div className="mb-4">
            <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-2 px-1">
              冒险指南
            </div>
            <div className="space-y-2">
              {[
                {
                  icon: "🗺️",
                  title: "进入金融华尔界",
                  desc: "点击地图入口，进入交易员成长地图",
                },
                {
                  icon: "🎮",
                  title: "完成关卡试炼",
                  desc: "剧情选择、知识学习、答题或小游戏",
                },
                {
                  icon: "🦸",
                  title: "解锁 Agent 研究天团",
                  desc: "通关后 Agent 加入你的投研链路",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/30 border border-slate-700/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 border border-slate-600/30 flex items-center justify-center text-base flex-shrink-0">
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white">
                      {step.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {step.desc}
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-amber-300/10 border border-amber-300/30 flex items-center justify-center text-[10px] font-bold text-amber-300 flex-shrink-0">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 当前主线任务卡 */}
          <div className="relative p-3 rounded-2xl bg-amber-300/10 border border-amber-300/30 overflow-hidden">
            {/* 任务卡扫光 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div
                className="absolute inset-0 animate-onboarding-shine bg-gradient-to-r from-transparent via-amber-300/15 to-transparent -translate-x-full"
                style={{ animationDelay: "1s" }}
              />
            </div>
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] font-bold text-amber-300 tracking-wider">
                  ✨ 第一项任务
                </span>
              </div>
              <div className="text-xs font-bold text-white mb-1">
                完成第 1 关「开户日」
              </div>
              <div className="text-[11px] text-slate-300/80 mb-2">
                解锁 <span className="text-amber-300 font-bold">Lead Agent 顾明澈</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-300/15 border border-amber-300/20">
                <span className="text-[10px] text-amber-300/90">
                  🎁 奖励：研究总控加入你的投研链路
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮区 - 固定在底部 */}
        <div className="px-5 pb-4 pt-2 bg-gradient-to-t from-[#0F172A] to-transparent">
          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.6)] active:scale-[0.98] transition-all"
          >
            ✨ 开始冒险
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 py-2 text-center text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            我先自己看看
          </button>
          <p className="text-center text-[9px] text-slate-500 mt-2 leading-relaxed">
            本产品用于投资研究训练与信息整理，不构成投资建议。
          </p>
        </div>
      </div>
    </div>
  );
}
