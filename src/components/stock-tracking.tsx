'use client';

import type { StockTracking as StockTrackingType } from '@/lib/types';

interface Props {
  data: StockTrackingType;
}

export function StockTrackingSection({ data }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
          荐股追踪
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">{data.description}</p>
      </div>

      <div className="space-y-4">
        {data.groups.map((group, groupIndex) => {
          const avgChange = group.stocks.reduce((sum, s) => sum + s.cumulativeChange, 0) / group.stocks.length;
          const winCount = group.stocks.filter((s) => s.cumulativeChange > 0).length;

          return (
            <div
              key={group.date}
              className={`animate-fade-in-up opacity-0 stagger-${groupIndex + 1} tech-border rounded-lg overflow-hidden`}
            >
              {/* Group Header */}
              <div className="px-4 py-3 border-b border-white/5 bg-slate-800/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-200 font-data">{group.date}</span>
                  <span className="text-[10px] text-slate-500">
                    共 {group.stocks.length} 只
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">
                    胜率 <span className="font-data font-medium text-slate-200">{winCount}/{group.stocks.length}</span>
                  </span>
                  <span className="text-slate-500">
                    均涨幅 <span className={`font-data font-medium ${avgChange > 0 ? 'text-stock-up' : 'text-stock-down'}`}>
                      {avgChange > 0 ? '+' : ''}{avgChange.toFixed(2)}%
                    </span>
                  </span>
                </div>
              </div>

              {/* Stock Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="py-2 px-4 text-left text-[10px] font-medium text-slate-500">排名</th>
                      <th className="py-2 px-4 text-left text-[10px] font-medium text-slate-500">代码</th>
                      <th className="py-2 px-4 text-left text-[10px] font-medium text-slate-500">股票</th>
                      <th className="py-2 px-4 text-right text-[10px] font-medium text-slate-500">荐股日收盘价</th>
                      <th className="py-2 px-4 text-right text-[10px] font-medium text-slate-500">最新收盘价</th>
                      <th className="py-2 px-4 text-right text-[10px] font-medium text-slate-500">累计涨跌幅</th>
                      <th className="py-2 px-4 text-right text-[10px] font-medium text-slate-500">覆盖机构</th>
                      <th className="py-2 px-4 text-right text-[10px] font-medium text-slate-500">研报数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.stocks.map((stock, i) => {
                      const isUp = stock.cumulativeChange > 0;
                      const changeColor = isUp ? 'text-stock-up' : stock.cumulativeChange < 0 ? 'text-stock-down' : 'text-stock-flat';

                      return (
                        <tr key={stock.code} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 px-4 text-xs font-data text-slate-500">{i + 1}</td>
                          <td className="py-2.5 px-4 text-xs font-data text-slate-500">
                            {stock.code}.{stock.exchange}
                          </td>
                          <td className="py-2.5 px-4 text-sm font-medium text-slate-200">
                            {stock.name}
                          </td>
                          <td className="py-2.5 px-4 text-right text-xs font-data text-slate-400">
                            {stock.recommendDateClose.toFixed(2)} 元
                          </td>
                          <td className="py-2.5 px-4 text-right text-xs font-data text-slate-200">
                            {stock.latestClose.toFixed(2)} 元
                          </td>
                          <td className={`py-2.5 px-4 text-right text-sm font-data font-medium ${changeColor}`}>
                            {isUp ? '+' : ''}{stock.cumulativeChange.toFixed(2)}%
                          </td>
                          <td className="py-2.5 px-4 text-right text-xs font-data text-slate-500">
                            {stock.coverageCount}
                          </td>
                          <td className="py-2.5 px-4 text-right text-xs font-data text-slate-500">
                            {stock.reportCount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
