'use client';

import { useEffect, useState } from 'react';
import type { DailyReport, Sector } from '@/lib/types';
import { MarketOverviewBar } from '@/components/market-overview';
import { SectorCard } from '@/components/sector-card';
import { SectorDetail } from '@/components/sector-detail';

export default function Home() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/report')
      .then((res) => res.json())
      .then((data: { success: boolean; data: DailyReport }) => {
        if (data.success) {
          setReport(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#78716c]">正在加载数据...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#78716c]">数据加载失败，请刷新重试</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <MarketOverviewBar overview={report.overview} />

      {/* Hot Sectors Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1c1917]">热门板块</h2>
          <p className="text-sm text-[#78716c]">
            连续两个交易日主力资金净流入的行业板块
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#78716c]">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
            资金流入
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0d9488]" />
            资金流出
          </span>
        </div>
      </div>

      {/* Sector Detail or Grid */}
      {selectedSector ? (
        <SectorDetail
          sector={selectedSector}
          onBack={() => setSelectedSector(null)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.hotSectors.map((sector, index) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              index={index}
              onClick={() => setSelectedSector(sector)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
