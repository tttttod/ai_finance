'use client';

import type { MacroSummary } from '@/lib/types';

interface Props {
  data: MacroSummary;
}

function ImpactBadge({ impact }: { impact: MacroSummary['keyTakeaways'][0]['impact'] }) {
  const map = {
    positive: { label: '利好', cls: 'bg-red-50 text-[#dc2626]' },
    negative: { label: '利空', cls: 'bg-teal-50 text-[#0d9488]' },
    neutral: { label: '中性', cls: 'bg-stone-100 text-[#78716c]' },
  };
  const { label, cls } = map[impact];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cls}`}>{label}</span>;
}

export function MacroSummarySection({ data }: Props) {
  return (
    <div className="bg-white rounded-lg border border-[#e7e5e4] p-5 shadow-xs">
      <h3 className="text-sm font-semibold text-[#1c1917] mb-3">宏观观点总结</h3>
      <p className="text-sm text-[#44403c] leading-relaxed mb-4">{data.overallView}</p>

      <div className="space-y-3">
        {data.keyTakeaways.map((item, index) => (
          <div
            key={item.point}
            className={`animate-fade-in-up opacity-0 stagger-${index + 1} border-l-2 pl-3 py-1.5 ${
              item.impact === 'negative'
                ? 'border-[#0d9488]'
                : item.impact === 'positive'
                  ? 'border-[#dc2626]'
                  : 'border-[#78716c]'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#1c1917]">{item.point}</span>
              <ImpactBadge impact={item.impact} />
            </div>
            <p className="text-xs text-[#57534e] leading-relaxed">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
