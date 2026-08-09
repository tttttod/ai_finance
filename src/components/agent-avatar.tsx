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

const LOCK_SIZE = {
  xs: 8,
  sm: 11,
  md: 14,
};

export default function AgentAvatar({ agent, unlocked, size = "sm" }: AgentAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const meta = AGENT_UNLOCK_META[agent.role];
  const px = SIZE_MAP[size];
  const lockPx = LOCK_SIZE[size];

  // 未解锁也用真实头像，但加小锁覆盖
  const src = meta?.avatar ?? "";
  const showImg = src && !imgError;

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center overflow-hidden rounded-full border-2"
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
      ) : (
        <span style={{ fontSize: px * 0.5 }}>{agent.icon}</span>
      )}

      {/* 未解锁：头像上方加小锁标记 */}
      {!unlocked && (
        <div
          className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-white/80 shadow-sm"
          style={{
            width: lockPx + 4,
            height: lockPx + 4,
          }}
        >
          <svg
            width={lockPx}
            height={lockPx}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      )}
    </div>
  );
}