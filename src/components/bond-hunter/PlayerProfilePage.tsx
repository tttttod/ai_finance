"use client";

import { useState } from "react";
import type { PlayerProfile, RiskPreference } from "./types";

interface PlayerProfilePageProps {
  onSubmit: (profile: PlayerProfile) => void;
}

const RISK_OPTIONS: { value: RiskPreference; label: string; desc: string; color: string }[] = [
  { value: "conservative", label: "Conservative", desc: "Capital preservation first. Prefer short duration, high-grade bonds.", color: "#10B981" },
  { value: "balanced", label: "Balanced", desc: "Seek yield with controlled risk. Moderate duration and credit exposure.", color: "#3B82F6" },
  { value: "aggressive", label: "Aggressive", desc: "Maximize returns. Willing to take on duration and credit risk.", color: "#F59E0B" },
];

export function PlayerProfilePage({ onSubmit }: PlayerProfilePageProps) {
  const [name, setName] = useState("");
  const [analystId, setAnalystId] = useState("");
  const [risk, setRisk] = useState<RiskPreference>("balanced");
  const [step, setStep] = useState<"name" | "risk">("name");

  const handleNameNext = () => {
    if (name.trim().length < 2) return;
    const id = `FI-${String(Date.now()).slice(-6)}`;
    setAnalystId(id);
    setStep("risk");
  };

  const handleStart = () => {
    onSubmit({ name: name.trim(), analystId, riskPreference: risk });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, #0B0E14 0%, #111827 100%)" }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-[#1E293B] bg-[#0F1117]/80 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
            <span className="text-[10px] font-mono text-[#64748B] tracking-wider">ANALYST REGISTRATION</span>
          </div>
          <h2 className="text-2xl font-bold text-[#E2E8F0] mb-1">Player Profile</h2>
          <p className="text-xs text-[#64748B] font-mono">Step {step === "name" ? "1" : "2"} of 2</p>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-[#1E293B] rounded mb-8">
          <div
            className="h-full bg-[#3B82F6] rounded transition-all duration-500"
            style={{ width: step === "name" ? "50%" : "100%" }}
          />
        </div>

        {step === "name" ? (
          <div className="space-y-6">
            {/* Name input */}
            <div>
              <label className="block text-[11px] font-mono text-[#64748B] tracking-wider mb-2">
                ANALYST NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNameNext()}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full px-4 py-3 rounded-lg bg-[#0F1117] border border-[#1E293B] text-[#E2E8F0] text-sm font-mono placeholder:text-[#334155] focus:outline-none focus:border-[#3B82F6] transition-colors"
                autoFocus
              />
            </div>

            <button
              onClick={handleNameNext}
              disabled={name.trim().length < 2}
              className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: name.trim().length >= 2 ? "linear-gradient(135deg, #3B82F6, #2563EB)" : "#1E293B",
              }}
            >
              CONTINUE
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Analyst ID */}
            <div className="px-4 py-3 rounded-lg bg-[#0F1117] border border-[#1E293B] mb-6">
              <div className="text-[10px] font-mono text-[#475569] mb-1">ANALYST ID</div>
              <div className="text-sm font-mono text-[#3B82F6]">{analystId}</div>
              <div className="text-[10px] font-mono text-[#475569] mt-1">{name}</div>
            </div>

            {/* Risk preference */}
            <div>
              <label className="block text-[11px] font-mono text-[#64748B] tracking-wider mb-3">
                RISK PREFERENCE
              </label>
              <div className="space-y-2">
                {RISK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRisk(opt.value)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                      risk === opt.value
                        ? "border-opacity-60 bg-opacity-10"
                        : "border-[#1E293B] bg-[#0F1117] hover:border-[#334155]"
                    }`}
                    style={risk === opt.value ? {
                      borderColor: opt.color,
                      backgroundColor: `${opt.color}15`,
                      boxShadow: `0 0 12px ${opt.color}20`,
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full border-2 transition-all"
                        style={{
                          borderColor: risk === opt.value ? opt.color : "#475569",
                          backgroundColor: risk === opt.value ? opt.color : "transparent",
                        }}
                      />
                      <div>
                        <div className="text-sm font-bold" style={{ color: risk === opt.value ? opt.color : "#94A3B8" }}>
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">{opt.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-6"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
              }}
            >
              BEGIN CHALLENGE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
