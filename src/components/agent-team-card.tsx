"use client";

import { useState, useEffect } from "react";
import type { AgentInfo } from "@/lib/mini-types";
import { AGENT_UNLOCK_META } from "@/lib/mini-types";
import AgentAvatar from "./agent-avatar";
import AgentDetailModal from "./agent-detail-modal";
import AgentUnlockAnimation from "./agent-unlock-animation";

interface AgentTeamCardProps {
  agent: AgentInfo;
  unlocked: boolean;
}

export default function AgentTeamCard({ agent, unlocked }: AgentTeamCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showUnlockPreview, setShowUnlockPreview] = useState(false);
  const meta = AGENT_UNLOCK_META[agent.role];

  // 预加载全身立绘，点击时秒开
  useEffect(() => {
    if (unlocked && meta?.fullBody) {
      const img = new Image();
      img.src = meta.fullBody;
    }
  }, [unlocked, meta]);

  return (
    <>
      <button
        onClick={() => {
          if (unlocked) {
            setShowUnlockPreview(true);
          }
        }}
        className={`flex items-center gap-2 p-2 rounded-2xl border-2 transition-all text-left w-full ${
          unlocked
            ? "hover:scale-[1.05] shadow-sm cursor-pointer active:scale-[0.98]"
            : "cursor-default"
        }`}
        style={{
          backgroundColor: unlocked ? "#EFF6FF" : "#F8FAFC",
          borderColor: unlocked ? "#93C5FD" : "#E2E8F0",
        }}
      >
        {/* 头像区域：固定大小，避免布局跳动 */}
        <AgentAvatar agent={agent} unlocked={unlocked} size="sm" />

        {/* 信息区域 */}
        <div className="min-w-0 flex-1">
          <div
            className="text-[10px] font-black truncate"
            style={{ color: unlocked ? "#1E40AF" : "#475569" }}
          >
            {agent.name}
          </div>
          <div className="text-[10px] text-slate-500 font-bold truncate">
            {agent.title}
          </div>
          {unlocked ? (
            <div className="text-[8px] text-blue-500 font-bold">已解锁</div>
          ) : (
            <div className="text-[8px] text-slate-400 font-bold truncate">
              {meta?.unlockHint ?? "未解锁"}
            </div>
          )}
        </div>
      </button>

      {/* 解锁预览动画 */}
      {showUnlockPreview && (
        <AgentUnlockAnimation
          agent={agent}
          onComplete={() => {
            setShowUnlockPreview(false);
            setShowModal(true);
          }}
        />
      )}

      {/* 弹窗 — 仅已解锁可点击 */}
      {unlocked && showModal && (
        <AgentDetailModal
          agent={agent}
          unlocked={unlocked}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}