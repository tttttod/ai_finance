"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

// ===== Types =====
type Sentiment = "panic" | "neutral" | "euphoric";

interface HotNewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  summary: string;
  sentiment: Sentiment;
  sentimentLabel: "恐慌" | "中性" | "狂热";
  hotScore: number;
  sector?: string;
  relatedSectors: string[];
  tags: string[];
  image?: string;
}

interface HotNewsMeta {
  provider: string;
  fetchedAt: string;
  query: string;
  isFallback: boolean;
  message?: string;
}

interface ForumPost {
  id: number;
  author: string;
  avatar: string;
  role: string;
  styleTag: string;
  styleColor: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
  tag: string;
}

// ===== Mock Forum（demo only，明确标注演示数据）=====
const MOCK_FORUM: ForumPost[] = [
  {
    id: 1,
    author: "华尔街在逃交易员",
    avatar: "",
    role: "波段交易者",
    styleTag: "右侧趋势",
    styleColor: "#DC2626",
    title: "降准之后，银行股还能追吗？",
    content:
      "央行降准释放1万亿，银行股今天集体高开。但我觉得利好出尽就是利空，大家怎么看？",
    likes: 234,
    comments: 67,
    time: "15分钟前",
    tag: "热议",
  },
  {
    id: 2,
    author: "K线萨满",
    avatar: "",
    role: "技术分析",
    styleTag: "动量交易",
    styleColor: "#8B5CF6",
    title: "半导体板块技术面分析：突破还是假突破？",
    content:
      "中芯国际今天放量突破前高，MACD金叉，但RSI已经进入超买区。从技术面看，短期可能有回调风险。",
    likes: 189,
    comments: 45,
    time: "1小时前",
    tag: "技术",
  },
  {
    id: 3,
    author: "价值猎人",
    avatar: "",
    role: "价值投资",
    styleTag: "左侧布局",
    styleColor: "#0D9488",
    title: "茅台PE回到25倍，是不是该抄底了？",
    content:
      "茅台PE从35倍回到25倍，ROE依然33%+，分红率60%。从价值投资角度看，这个估值已经很有吸引力了。",
    likes: 156,
    comments: 89,
    time: "2小时前",
    tag: "价值",
  },
  {
    id: 4,
    author: "量化小白",
    avatar: "",
    role: "新手观察",
    styleTag: "学习中",
    styleColor: "#F59E0B",
    title: "新手求教：怎么判断市场情绪？",
    content:
      "最近市场波动很大，想学学怎么判断市场情绪。有没有大佬分享一下经验？看哪些指标比较靠谱？",
    likes: 98,
    comments: 34,
    time: "3小时前",
    tag: "求助",
  },
  {
    id: 5,
    author: "宏观观察者",
    avatar: "",
    role: "宏观研究",
    styleTag: "自上而下",
    styleColor: "#3B82F6",
    title: "美联储降息预期升温，对A股有什么影响？",
    content:
      "如果美联储年内降息两次，美元走弱，人民币升值压力加大。理论上利好A股外资流入，但也要警惕热钱快进快出。",
    likes: 145,
    comments: 52,
    time: "4小时前",
    tag: "宏观",
  },
];

// ===== Helpers =====
function formatTime(isoStr: string): string {
  try {
    const date = new Date(isoStr);
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  } catch {
    return "未知时间";
  }
}

function getSentimentColor(sentiment: Sentiment): string {
  switch (sentiment) {
    case "panic":
      return "#DC2626";
    case "euphoric":
      return "#059669";
    default:
      return "#64748B";
  }
}

function getSentimentBg(sentiment: Sentiment): string {
  switch (sentiment) {
    case "panic":
      return "rgba(220, 38, 38, 0.06)";
    case "euphoric":
      return "rgba(5, 150, 105, 0.06)";
    default:
      return "rgba(100, 116, 139, 0.04)";
  }
}

function getProviderLabel(provider: string): string {
  switch (provider) {
    case "eastmoney-search":
      return "东方财富";
    default:
      return provider;
  }
}

// 头像：优先用 emoji，无则用昵称首字
function getAvatarText(post: ForumPost): string {
  if (post.avatar) return post.avatar;
  return post.author.slice(0, 1);
}

// ===== Hot News Section =====
function HotNewsSection({
  news,
  loading,
  error,
  meta,
  searchKeyword,
  onSearch,
  onRefresh,
}: {
  news: HotNewsItem[];
  loading: boolean;
  error: string | null;
  meta: HotNewsMeta | null;
  searchKeyword: string;
  onSearch: (kw: string) => void;
  onRefresh: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(searchKeyword);

  useEffect(() => {
    setInputValue(searchKeyword);
  }, [searchKeyword]);

  const handleSearch = () => {
    const kw = inputValue.trim();
    onSearch(kw);
  };

  const handleClear = () => {
    setInputValue("");
    onSearch("");
  };

  // 舆情统计
  const sentimentStats = useMemo(() => {
    const total = news.length;
    if (total === 0) return null;
    let panic = 0;
    let euphoric = 0;
    let neutral = 0;
    for (const n of news) {
      if (n.sentiment === "panic") panic++;
      else if (n.sentiment === "euphoric") euphoric++;
      else neutral++;
    }
    return {
      total,
      panic,
      euphoric,
      neutral,
      panicPct: Math.round((panic / total) * 100),
      euphoricPct: Math.round((euphoric / total) * 100),
      neutralPct: Math.round((neutral / total) * 100),
    };
  }, [news]);

  // 舆情总体判断（仅作为内容标签，不构成投资建议）
  const overallMood = useMemo(() => {
    if (!sentimentStats) return null;
    if (sentimentStats.panicPct > sentimentStats.euphoricPct + 15) {
      return { label: "情绪偏谨慎", color: "#DC2626", desc: "恐慌类新闻占比较高" };
    }
    if (sentimentStats.euphoricPct > sentimentStats.panicPct + 15) {
      return { label: "情绪偏乐观", color: "#059669", desc: "狂热类新闻占比较高" };
    }
    return { label: "情绪中性", color: "#64748B", desc: "市场情绪较为平衡" };
  }, [sentimentStats]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-4 border-2 border-[#FF6B6B]/30 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🔥</span>
          <h3 className="text-sm font-black bg-gradient-to-r from-[#FF6B6B] to-[#FF6B35] bg-clip-text text-transparent">
            热点新闻
          </h3>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-[#FF6B6B] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-slate-400">加载中</span>
          </div>
        </div>
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border-2 border-slate-100 p-3 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-2 bg-slate-50 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🔥</span>
          <h3 className="text-sm font-black text-slate-600">热点新闻</h3>
        </div>
        <div className="text-center py-6">
          <p className="text-2xl mb-2">📡</p>
          <p className="text-xs font-bold text-slate-500 mb-2">{error}</p>
          <button
            onClick={onRefresh}
            className="text-[10px] font-bold text-[#FF6B6B] bg-[#FF6B6B]/10 px-3 py-1.5 rounded-full hover:bg-[#FF6B6B]/20 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-4 border-2 border-[#FF6B6B]/30 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔥</span>
        <h3 className="text-sm font-black bg-gradient-to-r from-[#FF6B6B] to-[#FF6B35] bg-clip-text text-transparent">
          热点新闻
        </h3>
        {meta && (
          <span className="text-[10px] font-bold text-slate-400 ml-auto">
            {getProviderLabel(meta.provider)}
            {meta.fetchedAt && ` · ${formatTime(meta.fetchedAt)}`}
          </span>
        )}
        <button
          onClick={onRefresh}
          className="text-[10px] font-bold text-slate-400 hover:text-[#FF6B6B] transition-colors ml-1"
          title="刷新新闻"
        >
          ↻
        </button>
      </div>

      {/* 搜索框 */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-full px-3 py-2 border border-slate-200 focus-within:border-[#FF6B6B]/50 transition-colors">
            <span className="text-xs">🔍</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="搜索股票、行业、市场关键词..."
              className="flex-1 bg-transparent text-xs font-bold text-slate-700 outline-none placeholder:text-slate-400"
            />
            {inputValue && (
              <button
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-3 py-2 rounded-full bg-[#FF6B6B] text-white text-[10px] font-black hover:bg-[#e55a5a] transition-colors"
          >
            搜索
          </button>
        </div>
        {searchKeyword && (
          <p className="text-[10px] font-bold text-slate-400 mt-1.5 pl-1">
            当前搜索：<span className="text-[#FF6B6B]">「{searchKeyword}」</span>
          </p>
        )}
      </div>

      {/* 舆情解读 */}
      {overallMood && sentimentStats && (
        <div className="mb-3 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs">📊</span>
              <span className="text-[11px] font-black text-slate-700">舆情解读</span>
            </div>
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: overallMood.color }}
            >
              {overallMood.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-100 flex">
              <div
                className="h-full"
                style={{
                  width: `${sentimentStats.panicPct}%`,
                  backgroundColor: "#DC2626",
                }}
              />
              <div
                className="h-full"
                style={{
                  width: `${sentimentStats.neutralPct}%`,
                  backgroundColor: "#94A3B8",
                }}
              />
              <div
                className="h-full"
                style={{
                  width: `${sentimentStats.euphoricPct}%`,
                  backgroundColor: "#059669",
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="text-[#DC2626]">恐慌 {sentimentStats.panicPct}%</span>
            <span className="text-slate-500">中性 {sentimentStats.neutralPct}%</span>
            <span className="text-[#059669]">狂热 {sentimentStats.euphoricPct}%</span>
            <span className="text-slate-400 ml-auto">共 {sentimentStats.total} 条</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed">
            {overallMood.desc}。情绪标签由关键词规则生成，仅作内容聚合，不构成投资建议。
          </p>
        </div>
      )}

      {news.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-xs font-bold text-slate-500">
            {meta?.message || "暂无可用新闻数据，请稍后重试"}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">
            新闻源：{getProviderLabel(meta?.provider || "")}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {news.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl border-2 border-slate-100 p-3 transition-all duration-300 hover:border-[#FF6B6B]/30 hover:shadow-sm cursor-pointer"
                style={{
                  backgroundColor: isExpanded
                    ? getSentimentBg(item.sentiment)
                    : "white",
                  borderColor: isExpanded
                    ? getSentimentColor(item.sentiment) + "40"
                    : undefined,
                }}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full text-white shrink-0 mt-0.5"
                    style={{ backgroundColor: getSentimentColor(item.sentiment) }}
                  >
                    {item.sentimentLabel}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-relaxed line-clamp-2">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500">
                        {item.source}
                      </span>
                      <span className="text-[10px] text-slate-300">·</span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {formatTime(item.publishedAt)}
                      </span>
                      <span className="text-[10px] font-bold text-[#FF6B6B] ml-auto">
                        🔥 {item.hotScore}
                      </span>
                    </div>
                    {item.relatedSectors.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {item.relatedSectors.slice(0, 3).map((sector) => (
                          <span
                            key={sector}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500"
                          >
                            {sector}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed mb-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600"
                        >
                          #{tag}
                        </span>
                      ))}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-[#3B82F6] ml-auto hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          查看原文 →
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===== Forum Section（模拟社区，明确标识演示数据）=====
function ForumSection() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const toggleLike = useCallback((postId: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }, []);

  return (
    <div className="bg-white rounded-3xl p-4 border-2 border-[#8B5CF6]/30 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💬</span>
        <h3 className="text-sm font-black bg-gradient-to-r from-[#8B5CF6] to-[#FF6B6B] bg-clip-text text-transparent">
          模拟社区
        </h3>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
          演示数据
        </span>
        <button
          className="text-[10px] font-black text-[#8B5CF6] ml-auto bg-[#8B5CF6]/10 px-3 py-1 rounded-full hover:bg-[#8B5CF6]/20 transition-colors"
          onClick={() => {
            /* demo only */
          }}
        >
          发帖
        </button>
      </div>
      <div className="space-y-3">
        {MOCK_FORUM.map((post) => {
          const isLiked = likedPosts.has(post.id);
          return (
            <div
              key={post.id}
              className="rounded-2xl border-2 border-slate-100 p-3 transition-all hover:border-[#8B5CF6]/30 hover:shadow-sm"
            >
              {/* 用户身份区 */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                  style={{ backgroundColor: post.styleColor }}
                >
                  {getAvatarText(post)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-slate-800">
                      {post.author}
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: post.styleColor }}
                    >
                      {post.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className="text-[9px] font-bold"
                      style={{ color: post.styleColor }}
                    >
                      · {post.styleTag}
                    </span>
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                  style={{
                    backgroundColor:
                      post.tag === "热议"
                        ? "#FF6B6B"
                        : post.tag === "技术"
                          ? "#8B5CF6"
                          : post.tag === "价值"
                            ? "#0D9488"
                            : post.tag === "求助"
                              ? "#F59E0B"
                              : "#FF6B35",
                  }}
                >
                  {post.tag}
                </span>
                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                  {post.time}
                </span>
              </div>

              <p className="text-xs font-bold text-slate-800 mb-1">{post.title}</p>
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                {post.content}
              </p>
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1 text-[10px] font-bold transition-all ${
                    isLiked ? "text-[#FF6B6B]" : "text-slate-400 hover:text-[#FF6B6B]"
                  }`}
                >
                  <span className="text-sm">{isLiked ? "❤️" : "🤍"}</span>
                  <span>{post.likes + (isLiked ? 1 : 0)}</span>
                </button>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <span className="text-sm">💬</span>
                  <span>{post.comments}</span>
                </span>
                <button
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-[#8B5CF6] transition-colors ml-auto"
                  onClick={() => {
                    /* demo only */
                  }}
                >
                  <span className="text-sm">🔗</span>
                  <span>分享</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Main Component =====
export default function NewsTab() {
  const [currentTime, setCurrentTime] = useState("");
  const [news, setNews] = useState<HotNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsMeta, setNewsMeta] = useState<HotNewsMeta | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch hot news
  const fetchNews = useCallback(async (keyword?: string) => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const url = keyword?.trim()
        ? `/api/hot-news?q=${encodeURIComponent(keyword.trim())}`
        : "/api/hot-news";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setNews(data.data || []);
        setNewsMeta(data.meta || null);
      } else {
        setNewsError("获取新闻失败");
      }
    } catch (err) {
      setNewsError("网络错误，请稍后重试");
      console.error("[NewsTab] fetch news error:", err);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSearch = useCallback(
    (kw: string) => {
      setSearchKeyword(kw);
      fetchNews(kw);
    },
    [fetchNews]
  );

  const handleRefresh = useCallback(() => {
    fetchNews(searchKeyword);
  }, [fetchNews, searchKeyword]);

  return (
    <div className="p-4 space-y-4">
      {/* 时讯头部 */}
      <div className="bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#4ECDC4] rounded-3xl p-4 shadow-lg">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">📡</span>
              <h2 className="text-base font-black bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#4ECDC4] bg-clip-text text-transparent">
                市场时讯
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-500">{currentTime}</span>
          </div>
          <p className="text-xs font-bold text-slate-600 leading-relaxed">
            实时热点资讯 · 舆情情绪解读 · 模拟社区，一站式掌握市场脉搏
          </p>
        </div>
      </div>

      {/* 热点新闻（含搜索 + 舆情解读）*/}
      <HotNewsSection
        news={news}
        loading={newsLoading}
        error={newsError}
        meta={newsMeta}
        searchKeyword={searchKeyword}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
      />

      {/* 模拟社区（演示数据）*/}
      <ForumSection />

      {/* 免责声明 */}
      <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-100">
        <p className="text-[10px] text-amber-600 leading-relaxed font-bold">
          ⚠️ 以上信息仅供参考，不构成投资建议。市场有风险，投资需谨慎。新闻来自东方财富公开搜索聚合，情绪标签仅作内容分类；社区内容为演示数据。
        </p>
      </div>
    </div>
  );
}
