'use client';

import type { MacroSummary } from '@/lib/types';

interface Props {
  data: MacroSummary;
}

function ImpactBadge({ impact }: { impact: MacroSummary['keyTakeaways'][0]['impact'] }) {
  const map = {
    positive: { label: '利好', cls: 'bg-red-500/15 text-red-400 border border-red-500/20' },
    negative: { label: '利空', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
    neutral: { label: '中性', cls: 'bg-slate-500/15 text-slate-400 border border-slate-500/20' },
  };
  const { label, cls } = map[impact];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cls}`}>{label}</span>;
}

export function MacroSummarySection({ data }: Props) {
  return (
    <div className="tech-border rounded-lg p-5 glow-blue">
      <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
        <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
        宏观观点总结
      </h3>
      <p className="text-sm text-slate-300 leading-relaxed mb-4">{data.overallView}</p>

      <div className="space-y-3">
        {data.keyTakeaways.map((item, index) => (
          <div
            key={item.point}
            className={`animate-fade-in-up opacity-0 stagger-${index + 1} border-l-2 pl-3 py-1.5 ${
              item.impact === 'negative'
                ? 'border-emerald-400'
                : item.impact === 'positive'
                  ? 'border-red-400'
                  : 'border-slate-500'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-200">{item.point}</span>
              <ImpactBadge impact={item.impact} />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
