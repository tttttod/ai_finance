"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { AgentInfo } from "@/lib/mini-types";
import { AGENT_UNLOCK_META } from "@/lib/mini-types";

interface AgentUnlockAnimationProps {
  agent: AgentInfo;
  onComplete: () => void;
}

type Phase = "mystery" | "flipping" | "revealed" | "done";

// 金色粒子
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

const GOLD_COLORS = [
  "#FFD700",
  "#FFA500",
  "#FF8C00",
  "#FFE4B5",
  "#FFF8DC",
  "#F0E68C",
];

export default function AgentUnlockAnimation({
  agent,
  onComplete,
}: AgentUnlockAnimationProps) {
  const [phase, setPhase] = useState<Phase>("mystery");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const meta = AGENT_UNLOCK_META[agent.role];

  // 生成粒子
  const spawnParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        opacity: 1,
        color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
      });
    }
    setParticles(newParticles);
  }, []);

  // 粒子动画
  useEffect(() => {
    if (particles.length === 0) return;
    let frame: number;
    const animate = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // gravity
            opacity: p.opacity - 0.015,
          }))
          .filter((p) => p.opacity > 0)
      );
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [particles.length > 0]);

  // 动画流程控制
  useEffect(() => {
    // Phase 1: 1.2s 后开始翻转
    const flipTimer = setTimeout(() => {
      setPhase("flipping");
      spawnParticles();
      setShowFlash(true);
    }, 1200);

    // Phase 2: 翻转完成后显示
    const revealTimer = setTimeout(() => {
      setShowFlash(false);
      setPhase("revealed");
    }, 2000);

    // Phase 3: 显示恭喜文案
    const congratsTimer = setTimeout(() => {
      setShowCongrats(true);
    }, 2400);

    // Phase 4: 自动关闭
    const doneTimer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(revealTimer);
      clearTimeout(congratsTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  // 点击跳过（仅在动画播放完成后允许）
  const handleSkip = useCallback(() => {
    if (phase === "revealed") {
      setPhase("done");
      onComplete();
    }
  }, [onComplete, phase]);

  const isFlipped = phase === "revealed" || phase === "done";
  const isMystery = phase === "mystery";
  // 动画播放完成后才允许点击跳过
  const canSkip = phase === "revealed";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={canSkip ? handleSkip : undefined}
      style={{
        backgroundColor: "rgba(0,0,0,0.85)",
        cursor: canSkip ? "pointer" : "default",
      }}
    >
      {/* 背景光晕 */}
      <div
        className="absolute inset-0"
        style={{
          background: isFlipped
            ? "radial-gradient(circle at center, rgba(59,130,246,0.15) 0%, transparent 70%)"
            : "radial-gradient(circle at center, rgba(255,215,0,0.1) 0%, transparent 70%)",
          transition: "background 0.8s ease",
        }}
      />

      {/* 闪光遮罩 */}
      {showFlash && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,215,0,0.3) 40%, transparent 70%)",
            animation: "agentFlash 0.6s ease-out forwards",
          }}
        />
      )}

      {/* 粒子层 */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: `translate(${p.x * 30}px, ${p.y * 30}px)`,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* 卡牌容器 */}
      <div
        className="relative z-30"
        style={{
          perspective: "1000px",
          width: 200,
          height: 280,
        }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* 正面：神秘卡牌 */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center border-2"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
              borderColor: isMystery ? "#FFD700" : "#B8860B",
              boxShadow: isMystery
                ? "0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,215,0,0.2), inset 0 0 20px rgba(255,215,0,0.1)"
                : "0 0 10px rgba(255,215,0,0.2)",
              animation: isMystery ? "mysteryPulse 2s ease-in-out infinite" : "none",
            }}
          >
            {/* 装饰角 */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#FFD700]/60 rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#FFD700]/60 rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#FFD700]/60 rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#FFD700]/60 rounded-br-lg" />

            {/* 中央问号 */}
            <div
              className="text-6xl font-black mb-4"
              style={{
                color: "#FFD700",
                textShadow: "0 0 20px rgba(255,215,0,0.5), 0 0 40px rgba(255,215,0,0.3)",
                animation: "questionFloat 2s ease-in-out infinite",
              }}
            >
              ?
            </div>

            {/* 底部文字 */}
            <div className="text-[10px] font-bold text-[#FFD700]/80 tracking-widest">
              MYSTERY AGENT
            </div>
          </div>

          {/* 背面：揭晓卡牌 */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center border-2 overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)",
              borderColor: "#3B82F6",
              boxShadow: "0 0 30px rgba(59,130,246,0.4), 0 0 60px rgba(59,130,246,0.2)",
            }}
          >
            {/* 顶部光效 */}
            <div
              className="absolute top-0 left-0 right-0 h-20"
              style={{
                background: "linear-gradient(180deg, rgba(59,130,246,0.2) 0%, transparent 100%)",
              }}
            />

            {/* 头像 */}
            <div
              className="relative w-24 h-24 rounded-full border-4 border-[#3B82F6] overflow-hidden mb-4 flex items-center justify-center"
              style={{
                backgroundColor: "#EFF6FF",
                boxShadow: "0 0 20px rgba(59,130,246,0.3)",
                animation: isFlipped ? "avatarReveal 0.6s ease-out 0.2s both" : "none",
              }}
            >
              {meta?.avatar ? (
                <img
                  src={meta.avatar}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-4xl">{agent.icon}</span>
              )}
            </div>

            {/* 名字 */}
            <div
              className="text-lg font-black text-[#1E40AF] mb-1"
              style={{
                animation: isFlipped ? "textSlideUp 0.5s ease-out 0.4s both" : "none",
              }}
            >
              {agent.name}
            </div>

            {/* Title */}
            <div
              className="text-xs font-bold text-[#3B82F6] mb-2"
              style={{
                animation: isFlipped ? "textSlideUp 0.5s ease-out 0.5s both" : "none",
              }}
            >
              {agent.title}
            </div>

            {/* 已解锁标签 */}
            <div
              className="px-3 py-1 rounded-full bg-[#3B82F6] text-white text-[10px] font-bold"
              style={{
                animation: isFlipped ? "tagPop 0.4s ease-out 0.6s both" : "none",
                boxShadow: "0 2px 8px rgba(59,130,246,0.4)",
              }}
            >
              已解锁
            </div>

            {/* 装饰角 */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#3B82F6]/40 rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#3B82F6]/40 rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#3B82F6]/40 rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#3B82F6]/40 rounded-br-lg" />
          </div>
        </div>
      </div>

      {/* 恭喜文案 */}
      {showCongrats && (
        <div
          className="absolute z-40 bottom-32 left-0 right-0 flex flex-col items-center"
          style={{
            animation: "congratsFadeIn 0.5s ease-out both",
          }}
        >
          <div
            className="text-xl font-black mb-2"
            style={{
              background: "linear-gradient(135deg, #FFD700, #FFA500, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
              filter: "drop-shadow(0 2px 4px rgba(255,215,0,0.3))",
            }}
          >
            恭喜获得新 Agent!
          </div>
          <div className="text-sm text-white/80 font-bold">
            {agent.name} — {agent.title} 已加入研究团队
          </div>
          <div className="text-[10px] text-white/50 mt-4">点击任意位置关闭</div>
        </div>
      )}

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes mysteryPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,215,0,0.2), inset 0 0 20px rgba(255,215,0,0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,215,0,0.3), inset 0 0 30px rgba(255,215,0,0.2);
          }
        }

        @keyframes questionFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes agentFlash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes avatarReveal {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          60% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes textSlideUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes tagPop {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          60% {
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes congratsFadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
