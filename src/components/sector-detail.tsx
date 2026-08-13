'use client';

import type { Sector, Stock } from '@/lib/types';

interface Props {
  sector: Sector;
  onBack: () => void;
}

function formatFlow(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万亿`;
  }
  return `${value.toFixed(1)}亿`;
}

function formatMarketCap(value: number): string {
  return `${value.toFixed(0)}亿`;
}

function StockRow({ stock, rank, highlight }: { stock: Stock; rank: number; highlight?: boolean }) {
  const isUp = stock.changePercent > 0;
  const changeColor = isUp ? 'text-stock-up' : stock.changePercent < 0 ? 'text-stock-down' : 'text-stock-flat';

  return (
    <tr className={`border-b border-[#e7e5e4] last:border-b-0 ${highlight ? 'bg-red-50/30' : ''}`}>
      <td className="py-2.5 px-3 text-xs text-[#78716c] font-data">{rank}</td>
      <td className="py-2.5 px-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[#1c1917]">{stock.name}</span>
          <span className="text-[10px] text-[#78716c] font-data">{stock.code}</span>
        </div>
      </td>
      <td className="py-2.5 px-3 text-right font-data text-sm text-[#1c1917]">
        {stock.price.toFixed(2)}
      </td>
      <td className={`py-2.5 px-3 text-right font-data text-sm font-medium ${changeColor}`}>
        {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
      </td>
      <td className="py-2.5 px-3 text-right font-data text-xs text-[#78716c]">
        {formatMarketCap(stock.marketCap)}
      </td>
      <td className="py-2.5 px-3 text-right font-data text-xs text-stock-up">
        +{(stock.mainNetInflow / 10000).toFixed(1)}亿
      </td>
      <td className="py-2.5 px-3 text-right font-data text-xs text-[#78716c]">
        {stock.turnoverRate.toFixed(1)}%
      </td>
    </tr>
  );
}

export function SectorDetail({ sector, onBack }: Props) {
  const isUp = sector.changePercent > 0;
  const changeColor = isUp ? 'text-stock-up' : sector.changePercent < 0 ? 'text-stock-down' : 'text-stock-flat';
  const upRatio = sector.totalStocks > 0 ? (sector.upCount / sector.totalStocks) * 100 : 0;
  const downRatio = sector.totalStocks > 0 ? (sector.downCount / sector.totalStocks) * 100 : 0;

  return (
    <div className="space-y-4 animate-fade-in-up opacity-0">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-[#78716c] hover:text-[#1c1917] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回板块列表
      </button>

      {/* Sector Header */}
      <div className="bg-white rounded-lg border border-[#e7e5e4] p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-[#1c1917]">{sector.name}</h2>
              <span className={`text-lg font-data font-medium ${changeColor}`}>
                {isUp ? '+' : ''}{sector.changePercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-sm text-[#78716c]">
              板块内共 {sector.totalStocks} 只股票
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#78716c]">两日主力净流入合计</p>
            <p className="text-2xl font-data font-bold text-stock-up">
              +{formatFlow(sector.mainNetInflow)}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-stone-50 rounded-md p-3">
            <p className="text-[10px] text-[#78716c] mb-0.5">前一交易日流入</p>
            <p className="text-sm font-data font-medium text-stock-up">
              +{sector.mainNetInflowDay1.toFixed(1)}亿
            </p>
          </div>
          <div className="bg-red-50 rounded-md p-3">
            <p className="text-[10px] text-[#78716c] mb-0.5">当日流入</p>
            <p className="text-sm font-data font-medium text-stock-up">
              +{sector.mainNetInflowDay2.toFixed(1)}亿
            </p>
          </div>
          <div className="bg-stone-50 rounded-md p-3">
            <p className="text-[10px] text-[#78716c] mb-0.5">领涨股</p>
            <p className="text-sm font-medium text-[#1c1917]">
              {sector.leaderStock.name}
              <span className={`ml-2 font-data text-stock-up`}>
                +{sector.leaderStock.changePercent.toFixed(2)}%
              </span>
            </p>
          </div>
          <div className="bg-stone-50 rounded-md p-3">
            <p className="text-[10px] text-[#78716c] mb-0.5">涨跌比</p>
            <p className="text-sm font-data">
              <span className="text-stock-up font-medium">{sector.upCount}</span>
              <span className="text-[#78716c] mx-1">/</span>
              <span className="text-stock-down font-medium">{sector.downCount}</span>
            </p>
          </div>
        </div>

        {/* Up/Down Bar */}
        <div className="mt-4">
          <div className="flex h-2 rounded-full overflow-hidden bg-[#e7e5e4]">
            <div
              className="bg-[#dc2626] transition-all duration-500"
              style={{ width: `${upRatio}%` }}
            />
            <div
              className="bg-[#0d9488] transition-all duration-500"
              style={{ width: `${downRatio}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-[#78716c] font-data">
            <span>上涨 {sector.upCount} ({upRatio.toFixed(0)}%)</span>
            <span>平盘 {sector.flatCount}</span>
            <span>下跌 {sector.downCount} ({downRatio.toFixed(0)}%)</span>
          </div>
        </div>
      </div>

      {/* Top Gainers Table */}
      <div className="bg-white rounded-lg border border-[#e7e5e4] shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#e7e5e4]">
          <h3 className="text-sm font-semibold text-[#1c1917]">涨幅靠前</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50/50 border-b border-[#e7e5e4]">
                <th className="py-2 px-3 text-left text-[10px] font-medium text-[#78716c]">#</th>
                <th className="py-2 px-3 text-left text-[10px] font-medium text-[#78716c]">股票</th>
                <th className="py-2 px-3 text-right text-[10px] font-medium text-[#78716c]">现价</th>
                <th className="py-2 px-3 text-right text-[10px] font-medium text-[#78716c]">涨跌幅</th>
                <th className="py-2 px-3 text-right text-[10px] font-medium text-[#78716c]">流通市值</th>
                <th className="py-2 px-3 text-right text-[10px] font-medium text-[#78716c]">主力净流入</th>
                <th className="py-2 px-3 text-right text-[10px] font-medium text-[#78716c]">换手率</th>
              </tr>
            </thead>
            <tbody>
              {sector.topGainers.map((stock, i) => (
                <StockRow key={stock.code} stock={stock} rank={i + 1} highlight={i === 0} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Market Cap Table */}
      <div className="bg-white rounded-lg border border-[#e7e5e4] shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#e7e5e4]">
          <h3 className="text-sm font-semibold text-[#1c1917]">流通市值靠前</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50/50 border-b border-[#e7e5e4]">
                <th className="py-2 px-3 text-left text-[10px] font-medium text-[#78716c]">#</th>
                <th className="py-2 px-3 text-left text-[10px] font-medium text-[#78716c]">股票</th>
                <th className="py-2 px-3 text-right text-[10px] font-medium text-[#78716c]">现价</th>
                <th className="py-2 px-3 text-right text-[10px] font-medium text-[#78716c]">涨跌幅</th>
                <th className="py-2 px-3 text-right text-[10px] font-medium text-[#78716c]">流通市值</th>
                <th className="py-2 px-3 text-right text-[10px] font-medium text-[#78716c]">主力净流入</th>
                <th className="py-2 px-3 text-right text-[10px] font-medium text-[#78716c]">换手率</th>
              </tr>
            </thead>
            <tbody>
              {sector.topMarketCap.map((stock, i) => (
                <StockRow key={stock.code} stock={stock} rank={i + 1} highlight={i === 0} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
