"use client";

import { useEffect } from "react";
import { AGENT_UNLOCK_META } from "@/lib/mini-types";

/**
 * 全局图片预加载组件
 * 在页面加载时预加载所有 Agent 的全身立绘，确保点击弹窗时秒开
 */
export default function AgentImagePreloader() {
  useEffect(() => {
    // 预加载所有 Agent 的全身立绘和头像
    Object.values(AGENT_UNLOCK_META).forEach((meta) => {
      if (meta.fullBody) {
        const img = new Image();
        img.src = meta.fullBody;
      }
      if (meta.avatar) {
        const avatar = new Image();
        avatar.src = meta.avatar;
      }
    });
  }, []);

  return null;
}
