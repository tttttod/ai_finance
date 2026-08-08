"use client";

import { useState, useEffect } from "react";
import type { NewsItem, NewsCategory, NewsFeedData } from "@/lib/analysis-types";
import {
  Zap,
  FileText,
  Globe,
  Building,
  Clock,
  TrendingUp,
} from "lucide-react";

const CATEGORY_CONFIG: Record<
  NewsCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  flash: {
    label: "快讯",
    icon: <Zap className="w-3.5 h-3.5" />,
    color: "text-amber-400",
  },
  research: {
    label: "研报",
    icon: <FileText className="w-3.5 h-3.5" />,
    color: "text-blue-400",
  },
  macro: {
    label: "宏观",
    icon: <Globe className="w-3.5 h-3.5" />,
    color: "text-cyan-400",
  },
  announcement: {
    label: "公告",
    icon: <Building className="w-3.5 h-3.5" />,
    color: "text-purple-400",
  },
};

interface NewsFeedProps {
  onNewsClick?: (news: NewsItem) => void;
}

export default function NewsFeed({ onNewsClick }: NewsFeedProps) {
  const [activeCategory, setActiveCategory] =
    useState<NewsCategory>("flash");
  const [newsData, setNewsData] = useState<NewsFeedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNewsData(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const getCategoryNews = (): NewsItem[] => {
    if (!newsData) return [];
    const map: Record<NewsCategory, NewsItem[]> = {
      flash: newsData.flashes,
      research: newsData.research,
      macro: newsData.macro,
      announcement: newsData.announcements,
    };
    return map[activeCategory] || [];
  };

  const handleNewsClick = (news: NewsItem) => {
    if (onNewsClick) {
      onNewsClick(news);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category Tabs */}
      <div className="flex border-b border-white/5">
        {(Object.keys(CATEGORY_CONFIG) as NewsCategory[]).map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const count = newsData
            ? (
                {
                  flash: newsData.flashes,
                  research: newsData.research,
                  macro: newsData.macro,
                  announcement: newsData.announcements,
                } as Record<NewsCategory, NewsItem[]>
              )[cat]?.length || 0
            : 0;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all duration-200 border-b-2 ${
                activeCategory === cat
                  ? "border-blue-500 text-blue-400 bg-blue-500/5"
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              {config.icon}
              {config.label}
              <span className="text-[10px] text-slate-600">({count})</span>
            </button>
          );
        })}
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
          </div>
        ) : (
          getCategoryNews().map((news) => (
            <div
              key={news.id}
              onClick={() => handleNewsClick(news)}
              className="p-3 rounded-lg bg-[#0d1220] border border-white/5 hover:border-blue-500/20 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {news.importance === "high" && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-500/20 text-red-400 border border-red-500/20">
                        重要
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">
                      {news.source}
                    </span>
                    <span className="text-[10px] text-slate-600 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {news.publishTime}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-200 mb-1 group-hover:text-blue-300 transition-colors leading-relaxed">
                    {news.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {news.summary}
                  </p>
                  {(news.relatedSectors || news.relatedStocks) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {news.relatedSectors?.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-slate-400 border border-white/5"
                        >
                          {s}
                        </span>
                      ))}
                      {news.relatedStocks?.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5"
                        >
                          <TrendingUp className="w-2 h-2" />
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
