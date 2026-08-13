'use client';

import type { Sector } from '@/lib/types';

interface Props {
  sector: Sector;
  index: number;
  onClick: () => void;
}

function formatFlow(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万亿`;
  }
  return `${value.toFixed(1)}亿`;
}

export function SectorCard({ sector, index, onClick }: Props) {
  const isUp = sector.changePercent > 0;
  const changeColor = isUp ? 'text-stock-up' : sector.changePercent < 0 ? 'text-stock-down' : 'text-stock-flat';
  const upRatio = sector.totalStocks > 0 ? (sector.upCount / sector.totalStocks) * 100 : 0;
  const downRatio = sector.totalStocks > 0 ? (sector.downCount / sector.totalStocks) * 100 : 0;

  return (
    <div
      className={`animate-fade-in-up opacity-0 stagger-${index + 1} bg-white rounded-lg border border-[#e7e5e4] p-4 sm:p-5 shadow-xs card-hover cursor-pointer`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-[#1c1917]">{sector.name}</h3>
          <span className={`text-sm font-data font-medium ${changeColor}`}>
            {isUp ? '+' : ''}{sector.changePercent.toFixed(2)}%
          </span>
          {sector.flowType === 'today_only' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
              仅今日
            </span>
          )}
          {sector.flowType === 'continuous' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-[#dc2626] font-medium">
              连续2日
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-[#78716c]">主力净流入</p>
          <p className="text-sm font-data font-medium text-stock-up">
            +{formatFlow(sector.mainNetInflow)}
          </p>
        </div>
      </div>

      {/* Up/Down Bar */}
      <div className="mb-3">
        <div className="flex h-1.5 rounded-full overflow-hidden bg-[#e7e5e4]">
          <div
            className="bg-[#dc2626] transition-all duration-300"
            style={{ width: `${upRatio}%` }}
          />
          <div
            className="bg-[#0d9488] transition-all duration-300"
            style={{ width: `${downRatio}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-[#78716c] font-data">
          <span>涨 {sector.upCount}</span>
          <span>平 {sector.flatCount}</span>
          <span>跌 {sector.downCount}</span>
        </div>
      </div>

      {/* Two-day flow */}
      <div className="flex gap-3 mb-3">
        <div className="flex-1 bg-red-50/50 rounded px-2 py-1.5">
          <p className="text-[10px] text-[#78716c]">前一交易日</p>
          <p className="text-xs font-data font-medium text-stock-up">
            +{sector.mainNetInflowDay1.toFixed(1)}亿
          </p>
        </div>
        <div className="flex-1 bg-red-50 rounded px-2 py-1.5">
          <p className="text-[10px] text-[#78716c]">当日</p>
          <p className="text-xs font-data font-medium text-stock-up">
            +{sector.mainNetInflowDay2.toFixed(1)}亿
          </p>
        </div>
      </div>

      {/* Leader Stock */}
      <div className="border-t border-[#e7e5e4] pt-3">
        <p className="text-[10px] text-[#78716c] mb-1.5">领涨股</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#1c1917]">{sector.leaderStock.name}</span>
            <span className="text-xs text-[#78716c] font-data">{sector.leaderStock.code}</span>
          </div>
          <span className="text-sm font-data font-medium text-stock-up">
            +{sector.leaderStock.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Click hint */}
      <div className="mt-2 text-center">
        <span className="text-[10px] text-[#a8a29e]">点击查看详情 →</span>
      </div>
    </div>
  );
}
