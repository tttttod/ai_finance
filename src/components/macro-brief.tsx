'use client';

import type { MacroBrief as MacroBriefType } from '@/lib/types';

interface Props {
  data: MacroBriefType;
}

export function MacroBriefSection({ data }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#1c1917]">宏观分析</h2>
        <p className="text-sm text-[#78716c] mt-0.5">{data.description}</p>
      </div>

      <div className="space-y-3">
        {data.news.map((item, index) => (
          <div
            key={item.id}
            className={`animate-fade-in-up opacity-0 stagger-${index + 1} bg-white rounded-lg border border-[#e7e5e4] p-4 shadow-xs card-hover`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-sm font-medium text-[#1c1917] leading-relaxed flex-1">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-[#78716c] font-medium">
                  {item.source}
                </span>
                <span className="text-[10px] text-[#a8a29e] font-data">
                  {item.publishDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                {item.topic}
              </span>
            </div>

            <div className="bg-stone-50 rounded-md px-3 py-2">
              <p className="text-xs text-[#57534e] leading-relaxed">
                <span className="font-medium text-[#1c1917]">市场含义：</span>
                {item.marketImpact}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
