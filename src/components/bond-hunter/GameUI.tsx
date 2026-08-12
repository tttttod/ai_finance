"use client";

import { LEVEL_INFO } from "./types";

interface GameHeaderProps {
  levelId: string;
  title: string;
}

export function GameHeader({ levelId, title }: GameHeaderProps) {
  const info = LEVEL_INFO.find(l => l.id === levelId);
  const levelNum = info ? LEVEL_INFO.indexOf(info) + 1 : 0;
  const totalLevels = LEVEL_INFO.length;

  return (
    <div className="px-4 md:px-6 pt-4 pb-3">
      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: totalLevels }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < levelNum ? "#3B82F6" : i === levelNum ? "#3B82F680" : "#1E293B",
            }}
          />
        ))}
      </div>

      {/* Level info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-xs font-mono font-bold"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #2563EB)",
              color: "#fff",
            }}
          >
            {String(levelNum).padStart(2, "0")}
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#475569] tracking-wider">
              LEVEL {String(levelNum).padStart(2, "0")} / {String(totalLevels).padStart(2, "0")}
            </div>
            <div className="text-sm font-bold text-[#E2E8F0]">{title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[10px] font-mono text-[#475569]">LIVE</span>
        </div>
      </div>
    </div>
  );
}

// Shared data display card
export function DataCard({ label, value, unit, color, large }: {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  large?: boolean;
}) {
  return (
    <div className="px-3 py-2.5 rounded-lg bg-[#0F1117] border border-[#1E293B]">
      <div className="text-[10px] font-mono text-[#475569] tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-mono font-bold ${large ? "text-xl" : "text-base"}`}
          style={{ color: color || "#E2E8F0" }}
        >
          {value}
        </span>
        {unit && <span className="text-[10px] font-mono text-[#475569]">{unit}</span>}
      </div>
    </div>
  );
}

// Shared option button
export function OptionButton({ label, selected, onClick, color }: {
  label: string;
  selected: boolean;
  onClick: () => void;
  color?: string;
}) {
  const c = color || "#3B82F6";
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
        selected ? "" : "border-[#1E293B] bg-[#0F1117] hover:border-[#334155]"
      }`}
      style={selected ? {
        borderColor: c,
        backgroundColor: `${c}15`,
        boxShadow: `0 0 12px ${c}20`,
      } : {}}
    >
      <span className="text-sm font-medium" style={{ color: selected ? c : "#94A3B8" }}>
        {label}
      </span>
    </button>
  );
}

// Shared submit button
export function SubmitButton({ onClick, disabled, label }: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
      style={{
        background: disabled ? "#1E293B" : "linear-gradient(135deg, #3B82F6, #2563EB)",
        boxShadow: disabled ? "none" : "0 0 20px rgba(59, 130, 246, 0.2)",
      }}
    >
      {label || "SUBMIT"}
    </button>
  );
}
