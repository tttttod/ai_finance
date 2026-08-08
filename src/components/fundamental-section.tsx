'use client';

import type { FundamentalAnalysis as FundamentalType } from '@/lib/types';

interface Props {
  data: FundamentalType;
}

export function FundamentalSection({ data }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
          基本面分析
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          统计区间: {data.periodStart} → {data.periodEnd}
        </p>
      </div>

      {/* Change Log */}
      {(data.newStocks.length > 0 || data.removedStocks.length > 0) && (
        <div className="tech-border rounded-lg p-4">
          <p className="text-xs font-medium text-slate-500 mb-2">共识股变动</p>
          <div className="flex flex-wrap gap-2">
            {data.newStocks.map((name) => (
              <span key={name} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                新增 {name}
              </span>
            ))}
            {data.removedStocks.map((name) => (
              <span key={name} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                移出 {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Consensus Table */}
      <div className="tech-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50 border-b border-white/5">
                <th className="py-2.5 px-4 text-left text-[10px] font-medium text-slate-500">排名</th>
                <th className="py-2.5 px-4 text-left text-[10px] font-medium text-slate-500">股票</th>
                <th className="py-2.5 px-4 text-right text-[10px] font-medium text-slate-500">覆盖机构数</th>
                <th className="py-2.5 px-4 text-left text-[10px] font-medium text-slate-500">最新评级</th>
                <th className="py-2.5 px-4 text-left text-[10px] font-medium text-slate-500">目标价区间</th>
              </tr>
            </thead>
            <tbody>
              {data.stocks.map((stock, i) => (
                <tr key={stock.code} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-xs font-data text-slate-500">{i + 1}</td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-slate-200">{stock.name}</span>
                    <span className="text-[10px] text-slate-600 font-data ml-1.5">
                      ({stock.code}.{stock.exchange})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-data font-medium text-blue-400">{stock.coverageCount}</span>
                    <span className="text-[10px] text-slate-600 ml-1">家</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      stock.latestRating === '买入' || stock.latestRating === '优于大市'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {stock.latestRating}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-data text-slate-300">{stock.targetPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Views */}
      {data.stocks.map((stock, index) => (
        <div
          key={stock.code}
          className={`animate-fade-in-up opacity-0 stagger-${index + 1} tech-border rounded-lg p-4`}
        >
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            {stock.name} ({stock.code}.{stock.exchange})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className="bg-slate-800/50 rounded px-2.5 py-1.5 border border-white/5">
              <p className="text-[10px] text-slate-500">共识强度</p>
              <p className="text-xs font-data text-slate-200">{stock.coverageCount} 家 / {stock.reportCount} 篇</p>
            </div>
            <div className="bg-slate-800/50 rounded px-2.5 py-1.5 border border-white/5">
              <p className="text-[10px] text-slate-500">最新评级</p>
              <p className="text-xs font-data text-blue-400">{stock.latestRating}</p>
            </div>
            <div className="bg-slate-800/50 rounded px-2.5 py-1.5 border border-white/5">
              <p className="text-[10px] text-slate-500">目标价</p>
              <p className="text-xs font-data text-slate-200">{stock.targetPrice}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 font-medium">关键观点</p>
            {stock.insights.map((insight, i) => (
              <div key={i} className="bg-slate-800/30 rounded px-3 py-2 border border-white/5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="text-blue-400 font-medium">[{insight.tag}]</span>{' '}
                  {insight.summary}
                </p>
                <p className="text-[10px] text-slate-600 mt-1">
                  {insight.institutionCount} 家机构交叉验证 · {insight.keywords.join('、')}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
