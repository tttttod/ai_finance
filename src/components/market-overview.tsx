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
  const bg = isUp ? 'bg-red-50' : isDown ? 'bg-teal-50' : 'bg-stone-50';
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
      <div className="bg-white rounded-lg border border-[#e7e5e4] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* Date */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716c]">日期</span>
            <span className="text-sm font-data text-[#1c1917] font-medium">{overview.date}</span>
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-[#e7e5e4]" />

          {/* Shanghai Index */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716c]">上证</span>
            <span className="text-sm font-data text-[#1c1917] font-medium">
              {formatNumber(overview.shIndex)}
            </span>
            <ChangeBadge value={overview.shChange} />
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-[#e7e5e4]" />

          {/* Shenzhen Index */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716c]">深证</span>
            <span className="text-sm font-data text-[#1c1917] font-medium">
              {formatNumber(overview.szIndex)}
            </span>
            <ChangeBadge value={overview.szChange} />
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-[#e7e5e4]" />

          {/* Volume */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716c]">成交额</span>
            <span className="text-sm font-data text-[#1c1917] font-medium">
              {overview.totalVolume.toLocaleString()}亿
            </span>
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-[#e7e5e4]" />

          {/* Sector Stats */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#78716c]">板块</span>
            <span className="text-xs font-data">
              <span className="text-stock-up font-medium">{overview.upSectors}</span>
              <span className="text-[#78716c] mx-0.5">/</span>
              <span className="text-stock-down font-medium">{overview.downSectors}</span>
            </span>
            <span className="text-xs text-[#78716c]">
              热门 <span className="text-[#dc2626] font-medium font-data">{overview.hotSectorsCount}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
