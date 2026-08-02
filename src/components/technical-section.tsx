'use client';

import type { TechnicalAnalysis as TechnicalType, TechnicalStock } from '@/lib/types';

interface Props {
  data: TechnicalType;
}

function TrendBadge({ trend }: { trend: TechnicalStock['trend'] }) {
  const colorMap: Record<string, string> = {
    '多头趋势': 'bg-red-50 text-[#dc2626]',
    '高位回撤': 'bg-amber-50 text-amber-700',
    '反弹修复': 'bg-blue-50 text-blue-700',
    '空头趋势': 'bg-teal-50 text-[#0d9488]',
    '横盘整理': 'bg-stone-100 text-[#78716c]',
  };
  const color = colorMap[trend] || 'bg-stone-100 text-[#78716c]';

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${color}`}>
      {trend}
    </span>
  );
}

function StockCard({ stock, index }: { stock: TechnicalStock; index: number }) {
  const isUp = stock.dayChange > 0;
  const changeColor = isUp ? 'text-stock-up' : stock.dayChange < 0 ? 'text-stock-down' : 'text-stock-flat';

  return (
    <div className={`animate-fade-in-up opacity-0 stagger-${index + 1} bg-white rounded-lg border border-[#e7e5e4] p-4 shadow-xs`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-data text-[#78716c]">{index + 1}.</span>
            <span className="text-sm font-semibold text-[#1c1917]">
              {stock.name} ({stock.code}.{stock.exchange})
            </span>
          </div>
          <p className="text-[10px] text-[#a8a29e] mt-0.5">
            最新交易日: {stock.tradeDate}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-data font-bold text-[#1c1917]">
            {stock.closePrice.toFixed(2)}
          </p>
          <p className={`text-xs font-data font-medium ${changeColor}`}>
            {isUp ? '+' : ''}{stock.dayChange.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* MA & Trend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        <div className="bg-stone-50 rounded px-2.5 py-1.5">
          <p className="text-[10px] text-[#78716c]">MA20</p>
          <p className="text-xs font-data font-medium text-[#1c1917]">{stock.ma20.toFixed(2)} 元</p>
        </div>
        <div className="bg-stone-50 rounded px-2.5 py-1.5">
          <p className="text-[10px] text-[#78716c]">MA60</p>
          <p className="text-xs font-data font-medium text-[#1c1917]">{stock.ma60.toFixed(2)} 元</p>
        </div>
        <div className="bg-stone-50 rounded px-2.5 py-1.5">
          <p className="text-[10px] text-[#78716c]">趋势判断</p>
          <TrendBadge trend={stock.trend} />
        </div>
      </div>

      {/* Key Levels */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-stone-50 rounded px-2.5 py-1.5">
          <p className="text-[10px] text-[#78716c]">20日支撑 / 压力</p>
          <p className="text-xs font-data text-[#1c1917]">
            <span className="text-[#0d9488]">{stock.support20.toFixed(2)}</span>
            <span className="text-[#a8a29e] mx-1">~</span>
            <span className="text-[#dc2626]">{stock.pressure20.toFixed(2)}</span>
          </p>
        </div>
        <div className="bg-stone-50 rounded px-2.5 py-1.5">
          <p className="text-[10px] text-[#78716c]">60日区间</p>
          <p className="text-xs font-data text-[#1c1917]">
            {stock.range60Low.toFixed(2)} ~ {stock.range60High.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Analyst Target */}
      <div className="bg-red-50/50 rounded px-3 py-2 mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[#78716c]">分析师目标区间</p>
          <p className="text-xs font-data font-medium text-[#1c1917]">{stock.analystTargetLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#78716c]">潜在空间</p>
          <p className="text-sm font-data font-bold text-[#dc2626]">
            {stock.upsidePotential > 0 ? '+' : ''}{stock.upsidePotential.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Auxiliary Indicators */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center">
          <p className="text-[10px] text-[#78716c]">20日涨跌</p>
          <p className={`text-xs font-data font-medium ${stock.change20d > 0 ? 'text-stock-up' : 'text-stock-down'}`}>
            {stock.change20d > 0 ? '+' : ''}{stock.change20d.toFixed(2)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-[#78716c]">换手率</p>
          <p className="text-xs font-data text-[#1c1917]">{stock.turnoverRate.toFixed(2)}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-[#78716c]">PE</p>
          <p className="text-xs font-data text-[#1c1917]">{stock.pe.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-[#78716c]">PB</p>
          <p className="text-xs font-data text-[#1c1917]">{stock.pb.toFixed(2)}</p>
        </div>
      </div>

      {/* Conclusions */}
      <div className="border-t border-[#e7e5e4] pt-3">
        <p className="text-[10px] font-medium text-[#78716c] mb-1.5">技术面结论</p>
        <ul className="space-y-1">
          {stock.conclusions.map((c, i) => (
            <li key={i} className="text-xs text-[#44403c] leading-relaxed flex items-start gap-1.5">
              <span className="text-[#dc2626] mt-0.5 shrink-0">·</span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TechnicalSection({ data }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#1c1917]">技术面分析</h2>
        <p className="text-sm text-[#78716c] mt-0.5">{data.description}</p>
      </div>

      <div className="space-y-3">
        {data.stocks.map((stock, index) => (
          <StockCard key={stock.code} stock={stock} index={index} />
        ))}
      </div>
    </div>
  );
}
