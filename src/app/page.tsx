'use client';

import { useEffect, useState } from 'react';
import type { DailyReport } from '@/lib/types';
import { MarketOverviewBar } from '@/components/market-overview';
import { MacroBriefSection } from '@/components/macro-brief';
import { MacroSummarySection } from '@/components/macro-summary';
import { FundamentalSection } from '@/components/fundamental-section';
import { TechnicalSection } from '@/components/technical-section';
import { StockTrackingSection } from '@/components/stock-tracking';
import { ResearchSummarySection } from '@/components/research-summary';
import Link from 'next/link';
import { Sparkles, BookOpen } from 'lucide-react';

type TabId = 'research-summary' | 'macro' | 'fundamental' | 'technical' | 'tracking';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'research-summary', label: '研报观点', icon: '📊' },
  { id: 'macro', label: '宏观分析', icon: '🌐' },
  { id: 'fundamental', label: '基本面', icon: '📈' },
  { id: 'technical', label: '技术面', icon: '📉' },
  { id: 'tracking', label: '荐股追踪', icon: '🎯' },
];

export default function Home() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('research-summary');
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
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-blue-400 rounded-full animate-spin" />
            <div className="absolute inset-2 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin-reverse" />
          </div>
          <p className="text-sm text-slate-500">AI 正在分析市场数据...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">数据加载失败，请刷新重试</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Links */}
      <div className="flex items-center gap-3">
        <Link
          href="/analysis"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-400/20 border border-blue-500/30 text-sm font-medium text-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
        >
          <Sparkles className="w-4 h-4" />
          AI 分析工作台
        </Link>
        <Link
          href="/knowledge"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-400 hover:border-blue-500/20 hover:text-slate-300 transition-all duration-300"
        >
          <BookOpen className="w-4 h-4" />
          知识库
        </Link>
      </div>

      {/* Market Overview */}
      <MarketOverviewBar overview={report.overview} />

      {/* Tab Navigation */}
      <div className="border-b border-white/5">
        <nav className="flex gap-1 overflow-x-auto pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap rounded-t-lg ${
                activeTab === tab.id
                  ? 'text-blue-400 bg-white/5'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
              }`}
            >
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
              )}
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'research-summary' && (
          <ResearchSummarySection data={report.researchSummary} />
        )}

        {activeTab === 'macro' && (
          <div className="space-y-4">
            <MacroSummarySection data={report.macroSummary} />
            <MacroBriefSection data={report.macroBrief} />
          </div>
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
    </div>
  );
}
