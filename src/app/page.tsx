'use client';

import { useEffect, useState } from 'react';
import type { DailyReport, Sector } from '@/lib/types';
import { MarketOverviewBar } from '@/components/market-overview';
import { SectorCard } from '@/components/sector-card';
import { SectorDetail } from '@/components/sector-detail';
import { MacroBriefSection } from '@/components/macro-brief';
import { FundamentalSection } from '@/components/fundamental-section';
import { TechnicalSection } from '@/components/technical-section';
import { StockTrackingSection } from '@/components/stock-tracking';
import { ChangeLogSection } from '@/components/change-log';

type TabId = 'sectors' | 'macro' | 'fundamental' | 'technical' | 'tracking';

const tabs: { id: TabId; label: string }[] = [
  { id: 'sectors', label: '板块分析' },
  { id: 'macro', label: '宏观分析' },
  { id: 'fundamental', label: '基本面' },
  { id: 'technical', label: '技术面' },
  { id: 'tracking', label: '荐股追踪' },
];

export default function Home() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('sectors');
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

      {/* Change Log */}
      <ChangeLogSection data={report.changeLog} />

      {/* Tab Navigation */}
      <div className="border-b border-[#e7e5e4]">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedSector(null);
              }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#dc2626] text-[#dc2626]'
                  : 'border-transparent text-[#78716c] hover:text-[#1c1917] hover:border-[#d6d3d1]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'sectors' && (
        <>
          {selectedSector ? (
            <SectorDetail
              sector={selectedSector}
              onBack={() => setSelectedSector(null)}
            />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#1c1917]">热门板块</h2>
                  <p className="text-sm text-[#78716c]">
                    主力资金净流入的行业板块
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#78716c]">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
                    连续2日流入
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    仅今日流入
                  </span>
                </div>
              </div>
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
            </>
          )}
        </>
      )}

      {activeTab === 'macro' && (
        <MacroBriefSection data={report.macroBrief} />
      )}

      {activeTab === 'fundamental' && (
        <FundamentalSection data={report.fundamental} />
      )}

      {activeTab === 'technical' && (
        <TechnicalSection data={report.technical} />
      )}

      {activeTab === 'tracking' && (
        <StockTrackingSection data={report.stockTracking} />
      )}
    </div>
  );
}
