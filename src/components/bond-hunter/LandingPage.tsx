"use client";

import { useState, useEffect } from "react";

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [loaded, setLoaded] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 50%, #0B0E14 100%)" }}>
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating data particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-[10px] font-mono opacity-20"
            style={{
              color: i % 3 === 0 ? "#3B82F6" : i % 3 === 1 ? "#10B981" : "#F59E0B",
              left: `${(i * 5.3) % 100}%`,
              top: `${(i * 7.1) % 100}%`,
              animation: `float ${3 + (i % 4)}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {i % 4 === 0 ? `${(1.5 + i * 0.1).toFixed(2)}%` : i % 4 === 1 ? `${(100 + i * 10).toFixed(0)}bp` : i % 4 === 2 ? `¥${(50 + i * 5).toFixed(2)}` : `${(i * 0.3).toFixed(1)}Y`}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded border border-[#1E293B] bg-[#0F1117]/80">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[11px] font-mono text-[#64748B] tracking-wider">SYSTEM ONLINE</span>
          <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>

        {/* Title */}
        <h1
          className={`text-4xl md:text-6xl font-black tracking-tighter text-center mb-2 ${glitch ? "translate-x-[2px]" : ""}`}
          style={{
            background: "linear-gradient(135deg, #E2E8F0 0%, #3B82F6 50%, #E2E8F0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            transition: "transform 0.05s",
          }}
        >
          FIXED INCOME
        </h1>
        <h1
          className={`text-4xl md:text-6xl font-black tracking-tighter text-center mb-4 ${glitch ? "-translate-x-[2px]" : ""}`}
          style={{
            background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #3B82F6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            transition: "transform 0.05s",
          }}
        >
          CHALLENGE
        </h1>

        {/* Subtitle */}
        <p className="text-[#64748B] text-sm md:text-base font-mono tracking-[0.3em] mb-12 text-center">
          BUILD &middot; PREDICT &middot; INVEST &middot; SURVIVE
        </p>

        {/* Stats preview */}
        <div className="flex gap-6 mb-12">
          {[
            { label: "LEVELS", value: "08" },
            { label: "ASSETS", value: "05" },
            { label: "SCENARIOS", value: "05" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-mono font-bold text-[#E2E8F0]">{stat.value}</div>
              <div className="text-[10px] font-mono text-[#475569] tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="group relative px-12 py-4 rounded-lg font-bold text-sm tracking-wider transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #3B82F6, #2563EB)",
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <span className="relative z-10 text-white">START GAME</span>
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
          />
        </button>

        {/* Bottom info */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 text-[10px] font-mono text-[#475569]">
            <span>v2.0.24</span>
            <span className="w-1 h-1 rounded-full bg-[#475569]" />
            <span>FIXED INCOME SIMULATION</span>
            <span className="w-1 h-1 rounded-full bg-[#475569]" />
            <span>EDUCATIONAL USE ONLY</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
