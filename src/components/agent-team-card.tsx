"use client";

import type { AgentInfo } from "@/lib/mini-types";
import { AGENT_UNLOCK_META } from "@/lib/mini-types";
import AgentAvatar from "./agent-avatar";

interface AgentTeamCardProps {
  agent: AgentInfo;
  unlocked: boolean;
}

export default function AgentTeamCard({ agent, unlocked }: AgentTeamCardProps) {
  const meta = AGENT_UNLOCK_META[agent.role];

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-2xl border-2 transition-all ${
        unlocked
          ? "hover:scale-[1.05] shadow-sm"
          : "opacity-60 grayscale"
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
          style={{ color: unlocked ? "#1E40AF" : "#94A3B8" }}
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
    </div>
  );
}
