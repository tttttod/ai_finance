"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentInfo } from "@/lib/mini-types";
import { AGENT_UNLOCK_META } from "@/lib/mini-types";

interface AgentDetailModalProps {
  agent: AgentInfo;
  unlocked: boolean;
  onClose: () => void;
}

export default function AgentDetailModal({ agent, unlocked, onClose }: AgentDetailModalProps) {
  const meta = AGENT_UNLOCK_META[agent.role];
  const overlayRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  // 点击遮罩关闭
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    // 预加载图片
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = unlocked ? meta.fullBody : meta.lockedAvatar;
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose, unlocked, meta]);

  // 角色对应的描述文案
  const roleDescriptions: Record<string, string> = {
    lead: "研究总控 — 统筹全局研究流程，确认研究问题与投资风格，把控研究方向的正确性。",
    data: "数据分析师 — 负责数据收集、清洗与缺失检查，确保所有分析基于可靠的数据基础。",
    market: "市场环境分析师 — 分析宏观经济、市场趋势、资金流向，判断当前市场环境。",
    industry: "行业政策分析师 — 深入研究行业景气度、政策导向、竞争格局，把握行业机会。",
    fundamental: "基本面分析师 — 聚焦公司财务数据、盈利能力、成长性，评估基本面健康状况。",
    valuation: "估值建模师 — 运用多种估值模型，判断标的合理估值区间与安全边际。",
    technical: "技术资金分析师 — 分析 K 线形态、均线系统、资金流向，捕捉技术面信号。",
    sentiment: "新闻情绪分析师 — 跟踪新闻公告、舆情热度、机构观点，量化市场情绪。",
    bull: "看多研究员 — 从乐观角度挖掘投资亮点，论证看多逻辑与上行空间。",
    bear: "看空研究员 — 从谨慎角度揭示风险隐患，推演看空逻辑与下行风险。",
    risk: "风险官 — 全面检视估值、流动性、财务、政策等风险，确保风险可控。",
    manager: "研究经理 — 综合各方观点，形成最终研究结论与投资建议，生成复盘计划。",
  };

  const imageSrc = unlocked ? meta.fullBody : meta.lockedAvatar;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="relative bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 shadow-md text-slate-500 hover:text-slate-800 hover:bg-white transition-all text-sm"
        >
          ✕
        </button>

        {/* 图片区域 - 使用原始尺寸确保清晰度 */}
        <div className="flex justify-center bg-gradient-to-b from-blue-50 to-white">
          {loaded ? (
            <img
              src={imageSrc}
              alt={agent.name}
              className="w-full h-auto max-h-[70vh] object-contain"
              style={{ imageRendering: "auto" }}
            />
          ) : (
            <div className="w-full aspect-[3/5] flex items-center justify-center bg-slate-100 animate-pulse rounded-t-3xl">
              <span className="text-slate-300 text-sm">加载中...</span>
            </div>
          )}
        </div>

        {/* 信息区域 */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-800">{agent.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
              {agent.title}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {unlocked
              ? (roleDescriptions[agent.role] ?? "该 Agent 负责特定研究环节。")
              : (meta?.unlockHint ?? "通过游戏关卡解锁此 Agent。")}
          </p>
          {!unlocked && (
            <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
              <span>🔒</span>
              <span>未解锁</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}