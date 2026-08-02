'use client';

import type { TechnicalAnalysis as TechnicalType, TechnicalStock } from '@/lib/types';

interface Props {
  data: TechnicalType;
}

function TrendBadge({ trend }: { trend: TechnicalStock['trend'] }) {
  const colorMap: Record<string, string> = {
    '多头趋势': 'bg-red-500/15 text-red-400 border border-red-500/20',
    '高位回撤': 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    '反弹修复': 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    '空头趋势': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    '横盘整理': 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
  };
  const color = colorMap[trend] || 'bg-slate-500/15 text-slate-400 border border-slate-500/20';

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
    <div className={`animate-fade-in-up opacity-0 stagger-${index + 1} tech-border rounded-lg p-4`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-data text-slate-500">{index + 1}.</span>
            <span className="text-sm font-semibold text-slate-100">
              {stock.name} ({stock.code}.{stock.exchange})
            </span>
          </div>
          <p className="text-[10px] text-slate-600 mt-0.5">
            最新交易日: {stock.tradeDate}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-data font-bold text-slate-100">
            {stock.closePrice.toFixed(2)}
          </p>
          <p className={`text-xs font-data font-medium ${changeColor}`}>
            {isUp ? '+' : ''}{stock.dayChange.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* MA & Trend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded px-2.5 py-1.5 border border-white/5">
          <p className="text-[10px] text-slate-500">MA20</p>
          <p className="text-xs font-data font-medium text-slate-200">{stock.ma20.toFixed(2)} 元</p>
        </div>
        <div className="bg-slate-800/50 rounded px-2.5 py-1.5 border border-white/5">
          <p className="text-[10px] text-slate-500">MA60</p>
          <p className="text-xs font-data font-medium text-slate-200">{stock.ma60.toFixed(2)} 元</p>
        </div>
        <div className="bg-slate-800/50 rounded px-2.5 py-1.5 border border-white/5">
          <p className="text-[10px] text-slate-500">趋势判断</p>
          <TrendBadge trend={stock.trend} />
        </div>
      </div>

      {/* Key Levels */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded px-2.5 py-1.5 border border-white/5">
          <p className="text-[10px] text-slate-500">20日支撑 / 压力</p>
          <p className="text-xs font-data text-slate-200">
            <span className="text-emerald-400">{stock.support20.toFixed(2)}</span>
            <span className="text-slate-600 mx-1">~</span>
            <span className="text-red-400">{stock.pressure20.toFixed(2)}</span>
          </p>
        </div>
        <div className="bg-slate-800/50 rounded px-2.5 py-1.5 border border-white/5">
          <p className="text-[10px] text-slate-500">60日区间</p>
          <p className="text-xs font-data text-slate-200">
            {stock.range60Low.toFixed(2)} ~ {stock.range60High.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Analyst Target */}
      <div className="bg-red-500/5 rounded px-3 py-2 mb-3 flex items-center justify-between border border-red-500/10">
        <div>
          <p className="text-[10px] text-slate-500">分析师目标区间</p>
          <p className="text-xs font-data font-medium text-slate-200">{stock.analystTargetLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500">潜在空间</p>
          <p className="text-sm font-data font-bold text-red-400">
            {stock.upsidePotential > 0 ? '+' : ''}{stock.upsidePotential.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Auxiliary Indicators */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center">
          <p className="text-[10px] text-slate-500">20日涨跌</p>
          <p className={`text-xs font-data font-medium ${stock.change20d > 0 ? 'text-stock-up' : 'text-stock-down'}`}>
            {stock.change20d > 0 ? '+' : ''}{stock.change20d.toFixed(2)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500">换手率</p>
          <p className="text-xs font-data text-slate-200">{stock.turnoverRate.toFixed(2)}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500">PE</p>
          <p className="text-xs font-data text-slate-200">{stock.pe.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500">PB</p>
          <p className="text-xs font-data text-slate-200">{stock.pb.toFixed(2)}</p>
        </div>
      </div>

      {/* Conclusions */}
      <div className="border-t border-white/5 pt-3">
        <p className="text-[10px] font-medium text-slate-500 mb-1.5">技术面结论</p>
        <ul className="space-y-1">
          {stock.conclusions.map((c, i) => (
            <li key={i} className="text-xs text-slate-400 leading-relaxed flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5 shrink-0">·</span>
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
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
          技术面分析
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">{data.description}</p>
      </div>

      <div className="space-y-3">
        {data.stocks.map((stock, index) => (
          <StockCard key={stock.code} stock={stock} index={index} />
        ))}
      </div>
    </div>
  );
}
