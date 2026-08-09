"use client";

import { useEffect } from "react";
import { AGENT_UNLOCK_META } from "@/lib/mini-types";

/**
 * 全局图片预加载组件
 * 在页面加载时预加载所有 Agent 的全身立绘和头像（WebP）
 * 确保点击弹窗时秒开
 */
export default function AgentImagePreloader() {
  useEffect(() => {
    const preloadImage = (src: string) => {
      const img = new Image();
      img.fetchPriority = "high";
      img.src = src;
    };

    // 预加载所有 Agent 的 WebP 版本（主格式）
    Object.values(AGENT_UNLOCK_META).forEach((meta) => {
      if (meta.fullBody) {
        preloadImage(meta.fullBody);
      }
      if (meta.avatar) {
        preloadImage(meta.avatar);
      }
      // 也预加载 PNG 降级版本
      if (meta.fullBody) {
        const pngFallback = meta.fullBody.replace(/\.webp$/, ".png");
        if (pngFallback !== meta.fullBody) {
          preloadImage(pngFallback);
        }
      }
      if (meta.avatar) {
        const pngFallback = meta.avatar.replace(/\.webp$/, ".png");
        if (pngFallback !== meta.avatar) {
          preloadImage(pngFallback);
        }
      }
    });
  }, []);

  return null;
}