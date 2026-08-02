'use client';

import type { StockTracking as StockTrackingType } from '@/lib/types';

interface Props {
  data: StockTrackingType;
}

export function StockTrackingSection({ data }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#1c1917]">荐股追踪</h2>
        <p className="text-sm text-[#78716c] mt-0.5">{data.description}</p>
      </div>

      <div className="space-y-4">
        {data.groups.map((group, groupIndex) => {
          const avgChange = group.stocks.reduce((sum, s) => sum + s.cumulativeChange, 0) / group.stocks.length;
          const winCount = group.stocks.filter((s) => s.cumulativeChange > 0).length;

          return (
            <div
              key={group.date}
              className={`animate-fade-in-up opacity-0 stagger-${groupIndex + 1} bg-white rounded-lg border border-[#e7e5e4] shadow-xs overflow-hidden`}
            >
              {/* Group Header */}
              <div className="px-4 py-3 border-b border-[#e7e5e4] bg-stone-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#1c1917] font-data">{group.date}</span>
                  <span className="text-[10px] text-[#78716c]">
                    共 {group.stocks.length} 只
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#78716c]">
                    胜率 <span className="font-data font-medium text-[#1c1917]">{winCount}/{group.stocks.length}</span>
                  </span>
                  <span className="text-[#78716c]">
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
                    <tr className="border-b border-[#e7e5e4]">
                      <th className="py-2 px-4 text-left text-[10px] font-medium text-[#78716c]">排名</th>
                      <th className="py-2 px-4 text-left text-[10px] font-medium text-[#78716c]">代码</th>
                      <th className="py-2 px-4 text-left text-[10px] font-medium text-[#78716c]">股票</th>
                      <th className="py-2 px-4 text-right text-[10px] font-medium text-[#78716c]">荐股日收盘价</th>
                      <th className="py-2 px-4 text-right text-[10px] font-medium text-[#78716c]">最新收盘价</th>
                      <th className="py-2 px-4 text-right text-[10px] font-medium text-[#78716c]">累计涨跌幅</th>
                      <th className="py-2 px-4 text-right text-[10px] font-medium text-[#78716c]">覆盖机构</th>
                      <th className="py-2 px-4 text-right text-[10px] font-medium text-[#78716c]">研报数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.stocks.map((stock, i) => {
                      const isUp = stock.cumulativeChange > 0;
                      const changeColor = isUp ? 'text-stock-up' : stock.cumulativeChange < 0 ? 'text-stock-down' : 'text-stock-flat';
                      const rowBg = isUp ? 'bg-red-50/20' : '';

                      return (
                        <tr key={stock.code} className={`border-b border-[#e7e5e4] last:border-b-0 ${rowBg}`}>
                          <td className="py-2.5 px-4 text-xs font-data text-[#78716c]">{i + 1}</td>
                          <td className="py-2.5 px-4 text-xs font-data text-[#78716c]">
                            {stock.code}.{stock.exchange}
                          </td>
                          <td className="py-2.5 px-4 text-sm font-medium text-[#1c1917]">
                            {stock.name}
                          </td>
                          <td className="py-2.5 px-4 text-right text-xs font-data text-[#1c1917]">
                            {stock.recommendDateClose.toFixed(2)} 元
                          </td>
                          <td className="py-2.5 px-4 text-right text-xs font-data text-[#1c1917]">
                            {stock.latestClose.toFixed(2)} 元
                          </td>
                          <td className={`py-2.5 px-4 text-right text-sm font-data font-medium ${changeColor}`}>
                            {isUp ? '+' : ''}{stock.cumulativeChange.toFixed(2)}%
                          </td>
                          <td className="py-2.5 px-4 text-right text-xs font-data text-[#78716c]">
                            {stock.coverageCount}
                          </td>
                          <td className="py-2.5 px-4 text-right text-xs font-data text-[#78716c]">
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
