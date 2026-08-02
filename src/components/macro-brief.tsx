'use client';

import type { MacroBrief as MacroBriefType } from '@/lib/types';

interface Props {
  data: MacroBriefType;
}

export function MacroBriefSection({ data }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
          宏观分析
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">{data.description}</p>
      </div>

      <div className="space-y-3">
        {data.news.map((item, index) => (
          <div
            key={item.id}
            className={`animate-fade-in-up opacity-0 stagger-${index + 1} tech-border rounded-lg p-4 card-hover`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-sm font-medium text-slate-200 leading-relaxed flex-1">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/15 text-slate-400 font-medium border border-slate-500/10">
                  {item.source}
                </span>
                <span className="text-[10px] text-slate-600 font-data">
                  {item.publishDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium border border-amber-500/10">
                {item.topic}
              </span>
            </div>

            <div className="bg-slate-800/50 rounded-md px-3 py-2 border border-white/5">
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="font-medium text-slate-200">市场含义：</span>
                {item.marketImpact}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
