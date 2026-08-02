'use client';

import type { MarketOverview } from '@/lib/types';

interface Props {
  overview: MarketOverview;
}

function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ChangeBadge({ value }: { value: number }) {
  const isUp = value > 0;
  const isDown = value < 0;
  const color = isUp ? 'text-stock-up' : isDown ? 'text-stock-down' : 'text-stock-flat';
  const bg = isUp ? 'bg-red-500/10' : isDown ? 'bg-emerald-500/10' : 'bg-slate-500/10';
  const prefix = isUp ? '+' : '';

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-data font-medium ${color} ${bg}`}>
      {prefix}{value.toFixed(2)}%
    </span>
  );
}

export function MarketOverviewBar({ overview }: Props) {
  return (
    <div className="animate-fade-in-up opacity-0">
      <div className="tech-border rounded-lg p-4 sm:p-5 glow-blue">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* Date */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">日期</span>
            <span className="text-sm font-data text-slate-200 font-medium">{overview.date}</span>
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-white/10" />

          {/* Shanghai Index */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">上证</span>
            <span className="text-sm font-data text-slate-200 font-medium">
              {formatNumber(overview.shIndex)}
            </span>
            <ChangeBadge value={overview.shChange} />
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-white/10" />

          {/* Shenzhen Index */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">深证</span>
            <span className="text-sm font-data text-slate-200 font-medium">
              {formatNumber(overview.szIndex)}
            </span>
            <ChangeBadge value={overview.szChange} />
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-white/10" />

          {/* Volume */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">成交额</span>
            <span className="text-sm font-data text-slate-200 font-medium">
              {overview.totalVolume.toLocaleString()}亿
            </span>
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-white/10" />

          {/* Sector Stats */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">板块</span>
            <span className="text-xs font-data">
              <span className="text-stock-up font-medium">{overview.upSectors}</span>
              <span className="text-slate-600 mx-1">/</span>
              <span className="text-stock-down font-medium">{overview.downSectors}</span>
              <span className="text-slate-600 mx-0.5">涨/跌</span>
            </span>
          </div>

          {/* Hot sectors count */}
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <span className="text-xs text-slate-500">热门板块</span>
            <span className="text-sm font-data text-blue-400 font-bold">{overview.hotSectorsCount}</span>
            <span className="text-xs text-slate-500">个</span>
          </div>
        </div>
      </div>
    </div>
  );
}
