'use client';

import type { ResearchSummary } from '@/lib/types';

interface Props {
  data: ResearchSummary;
}

function SentimentBadge({ sentiment }: { sentiment: ResearchSummary['keyThemes'][0]['sentiment'] }) {
  const map = {
    bullish: { label: '看多', cls: 'bg-red-500/15 text-red-400 border border-red-500/20' },
    neutral: { label: '中性', cls: 'bg-slate-500/15 text-slate-400 border border-slate-500/20' },
    bearish: { label: '看空', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
  };
  const { label, cls } = map[sentiment];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cls}`}>{label}</span>;
}

export function ResearchSummarySection({ data }: Props) {
  return (
    <div className="space-y-5">
      {/* Overall View */}
      <div className="tech-border rounded-lg p-5 glow-blue">
        <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
          研报观点总结
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">{data.overallView}</p>
      </div>

      {/* Key Themes */}
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          核心主题
        </h3>
        <div className="space-y-3">
          {data.keyThemes.map((theme, index) => (
            <div
              key={theme.theme}
              className={`animate-fade-in-up opacity-0 stagger-${index + 1} tech-border rounded-lg p-4 card-hover`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-100">{theme.theme}</h4>
                <SentimentBadge sentiment={theme.sentiment} />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">{theme.detail}</p>
              <div className="flex flex-wrap gap-1">
                {theme.relatedStocks.map((stock) => (
                  <span
                    key={stock}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-medium border border-blue-500/10"
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
        <div className="tech-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
            <h3 className="text-sm font-semibold text-slate-100">机会亮点</h3>
          </div>
          <ul className="space-y-2">
            {data.opportunityHighlights.map((item, i) => (
              <li key={i} className="text-xs text-slate-400 leading-relaxed flex items-start gap-1.5">
                <span className="text-red-400 mt-0.5 shrink-0 font-bold text-[10px]">+</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Alerts */}
        <div className="tech-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
            <h3 className="text-sm font-semibold text-slate-100">风险提示</h3>
          </div>
          <ul className="space-y-2">
            {data.riskAlerts.map((item, i) => (
              <li key={i} className="text-xs text-slate-400 leading-relaxed flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5 shrink-0 font-bold text-[10px]">!</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
