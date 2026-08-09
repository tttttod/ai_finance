"use client";

import { useState } from "react";
import type { AgentInfo } from "@/lib/mini-types";
import { AGENT_UNLOCK_META } from "@/lib/mini-types";

interface AgentAvatarProps {
  agent: AgentInfo;
  unlocked: boolean;
  size?: "xs" | "sm" | "md";
}

const SIZE_MAP = {
  xs: 28,
  sm: 36,
  md: 48,
};

export default function AgentAvatar({ agent, unlocked, size = "sm" }: AgentAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const meta = AGENT_UNLOCK_META[agent.role];
  const px = SIZE_MAP[size];

  const src = unlocked
    ? (meta?.avatar ?? "")
    : (meta?.lockedAvatar ?? "");

  const showImg = src && !imgError;

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center overflow-hidden rounded-full border-2 overflow-hidden"
      style={{
        width: px,
        height: px,
        borderColor: unlocked ? "#3B82F6" : "#CBD5E1",
        backgroundColor: unlocked ? "#EFF6FF" : "#F1F5F9",
      }}
    >
      {showImg ? (
        <img
          src={src}
          alt={agent.name}
          onError={() => setImgError(true)}
          className="object-cover w-full h-full"
        />
      ) : unlocked ? (
        // 已解锁但无头像：显示 icon 兜底
        <span style={{ fontSize: px * 0.5 }}>{agent.icon}</span>
      ) : (
        // 未解锁：显示锁图标
        <span style={{ fontSize: px * 0.45, opacity: 0.5 }}>🔒</span>
      )}
    </div>
  );
}