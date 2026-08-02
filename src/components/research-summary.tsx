'use client';

import type { ResearchSummary } from '@/lib/types';

interface Props {
  data: ResearchSummary;
}

function SentimentBadge({ sentiment }: { sentiment: ResearchSummary['keyThemes'][0]['sentiment'] }) {
  const map = {
    bullish: { label: '看多', cls: 'bg-red-50 text-[#dc2626]' },
    neutral: { label: '中性', cls: 'bg-stone-100 text-[#78716c]' },
    bearish: { label: '看空', cls: 'bg-teal-50 text-[#0d9488]' },
  };
  const { label, cls } = map[sentiment];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cls}`}>{label}</span>;
}

export function ResearchSummarySection({ data }: Props) {
  return (
    <div className="space-y-5">
      {/* Overall View */}
      <div className="bg-white rounded-lg border border-[#e7e5e4] p-5 shadow-xs">
        <h2 className="text-lg font-semibold text-[#1c1917] mb-3">研报观点总结</h2>
        <p className="text-sm text-[#44403c] leading-relaxed">{data.overallView}</p>
      </div>

      {/* Key Themes */}
      <div>
        <h3 className="text-sm font-semibold text-[#1c1917] mb-3">核心主题</h3>
        <div className="space-y-3">
          {data.keyThemes.map((theme, index) => (
            <div
              key={theme.theme}
              className={`animate-fade-in-up opacity-0 stagger-${index + 1} bg-white rounded-lg border border-[#e7e5e4] p-4 shadow-xs card-hover`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-[#1c1917]">{theme.theme}</h4>
                <SentimentBadge sentiment={theme.sentiment} />
              </div>
              <p className="text-xs text-[#44403c] leading-relaxed mb-2">{theme.detail}</p>
              <div className="flex flex-wrap gap-1">
                {theme.relatedStocks.map((stock) => (
                  <span
                    key={stock}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-[#57534e] font-medium"
                  >
                    {stock}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column: Opportunities & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opportunity Highlights */}
        <div className="bg-white rounded-lg border border-[#e7e5e4] p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
            <h3 className="text-sm font-semibold text-[#1c1917]">机会亮点</h3>
          </div>
          <ul className="space-y-2">
            {data.opportunityHighlights.map((item, i) => (
              <li key={i} className="text-xs text-[#44403c] leading-relaxed flex items-start gap-1.5">
                <span className="text-[#dc2626] mt-0.5 shrink-0 font-bold text-[10px]">+</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Alerts */}
        <div className="bg-white rounded-lg border border-[#e7e5e4] p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h3 className="text-sm font-semibold text-[#1c1917]">风险提示</h3>
          </div>
          <ul className="space-y-2">
            {data.riskAlerts.map((item, i) => (
              <li key={i} className="text-xs text-[#44403c] leading-relaxed flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5 shrink-0 font-bold text-[10px]">!</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
