'use client';

import type { FundamentalAnalysis as FundamentalType } from '@/lib/types';

interface Props {
  data: FundamentalType;
}

export function FundamentalSection({ data }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#1c1917]">基本面分析</h2>
        <p className="text-sm text-[#78716c] mt-0.5">
          统计区间: {data.periodStart} → {data.periodEnd}
        </p>
      </div>

      {/* Change Log */}
      {(data.newStocks.length > 0 || data.removedStocks.length > 0) && (
        <div className="bg-white rounded-lg border border-[#e7e5e4] p-4 shadow-xs">
          <p className="text-xs font-medium text-[#78716c] mb-2">共识股变动</p>
          <div className="flex flex-wrap gap-2">
            {data.newStocks.map((name) => (
              <span key={name} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-50 text-[#dc2626]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
                新增 {name}
              </span>
            ))}
            {data.removedStocks.map((name) => (
              <span key={name} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-teal-50 text-[#0d9488]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                移出 {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Consensus Table */}
      <div className="bg-white rounded-lg border border-[#e7e5e4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50/50 border-b border-[#e7e5e4]">
                <th className="py-2.5 px-4 text-left text-[10px] font-medium text-[#78716c]">排名</th>
                <th className="py-2.5 px-4 text-left text-[10px] font-medium text-[#78716c]">股票</th>
                <th className="py-2.5 px-4 text-right text-[10px] font-medium text-[#78716c]">覆盖机构数</th>
                <th className="py-2.5 px-4 text-left text-[10px] font-medium text-[#78716c]">最新评级</th>
                <th className="py-2.5 px-4 text-left text-[10px] font-medium text-[#78716c]">目标价区间</th>
              </tr>
            </thead>
            <tbody>
              {data.stocks.map((stock, i) => (
                <tr key={stock.code} className="border-b border-[#e7e5e4] last:border-b-0">
                  <td className="py-3 px-4 text-xs font-data text-[#78716c]">{i + 1}</td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-[#1c1917]">{stock.name}</span>
                    <span className="text-[10px] text-[#78716c] font-data ml-1.5">
                      ({stock.code}.{stock.exchange})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-data text-sm text-[#1c1917]">
                    {stock.coverageCount}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-[#dc2626] font-medium">
                      {stock.latestRating}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-data text-[#1c1917]">
                    {stock.targetPriceLabel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Cards */}
      <div className="space-y-3">
        {data.stocks.map((stock, index) => (
          <div
            key={stock.code}
            className={`animate-fade-in-up opacity-0 stagger-${index + 1} bg-white rounded-lg border border-[#e7e5e4] p-4 shadow-xs`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-data text-[#78716c]">基本面 {index + 1}.</span>
              <span className="text-sm font-semibold text-[#1c1917]">
                {stock.name} ({stock.code}.{stock.exchange})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="bg-stone-50 rounded px-2.5 py-1.5">
                <p className="text-[10px] text-[#78716c]">共识强度</p>
                <p className="text-xs font-data font-medium text-[#1c1917]">
                  {stock.coverageCount} 家机构 / {stock.reportCount} 篇研报
                </p>
              </div>
              <div className="bg-stone-50 rounded px-2.5 py-1.5">
                <p className="text-[10px] text-[#78716c]">最新评级</p>
                <p className="text-xs font-medium text-[#dc2626]">{stock.latestRating}</p>
              </div>
              <div className="bg-stone-50 rounded px-2.5 py-1.5 col-span-2">
                <p className="text-[10px] text-[#78716c]">目标价</p>
                <p className="text-xs font-data font-medium text-[#1c1917]">{stock.targetPriceLabel}</p>
              </div>
            </div>

            <div className="space-y-2">
              {stock.insights.map((insight) => (
                <div key={insight.tag} className="border-l-2 border-[#dc2626] pl-3 py-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-[#dc2626] font-medium">
                      {insight.tag}
                    </span>
                    <span className="text-[10px] text-[#a8a29e] font-data">
                      机构交叉验证 {insight.institutionCount} 家
                    </span>
                  </div>
                  <p className="text-xs text-[#44403c] leading-relaxed">{insight.summary}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {insight.keywords.map((kw) => (
                      <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-[#78716c]">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
