"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { TRADETI_PERSONALITIES } from "@/lib/mini-types";
import type { TradeTIPersonalityId } from "@/lib/mini-types";

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
  id: string;
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
  isMine?: boolean;
  createdAt?: number;
}

// ===== Mock Forum（demo only，明确标注演示数据）=====
const MOCK_FORUM: ForumPost[] = [
  {
    id: "demo-1",
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
    id: "demo-2",
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
    id: "demo-3",
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
    id: "demo-4",
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
    id: "demo-5",
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

// ===== 论坛身份：TPTI 人格 + 自定义用户名 =====

interface ForumIdentity {
  personalityId: TradeTIPersonalityId | "";
  personalityName: string;
  personalityEmoji: string;
  personalityColor: string;
  username: string;
  /** 作者完整展示名：人格名 · 用户名 */
  displayName: string;
  isUnassessed: boolean;
}

const FORUM_USERNAME_KEY = "forum_username";
const FORUM_USER_POSTS_KEY = "forum_user_posts";

/** 从 localStorage 安全读取 TPTI 结果 */
function readTradetiResultType(): TradeTIPersonalityId | "" {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.localStorage.getItem("tradeti_state");
    if (!raw) return "";
    const state = JSON.parse(raw) as { result_type?: TradeTIPersonalityId | "" };
    return state.result_type || "";
  } catch {
    return "";
  }
}

/** 基于 client-id 生成 player_xxxx 短码 */
function generateFallbackUsername(): string {
  if (typeof window === "undefined") return "player_0000";
  let clientId = window.localStorage.getItem("client-id") || "";
  if (!clientId) {
    clientId =
      (window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)) || "";
    window.localStorage.setItem("client-id", clientId);
  }
  // 取最后 4 位字母数字，不足则左补 0
  const tail = clientId.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toLowerCase();
  return `player_${tail.padStart(4, "0")}`;
}

function readForumUsername(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(FORUM_USERNAME_KEY) || "";
}

function writeForumUsername(name: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FORUM_USERNAME_KEY, name);
}

/** 综合 TPTI 结果和用户名，得到当前用户论坛身份 */
function getForumIdentity(): ForumIdentity {
  const personalityId = readTradetiResultType();
  const isUnassessed = !personalityId;
  const personality = personalityId
    ? TRADETI_PERSONALITIES[personalityId]
    : null;
  const personalityName = personality?.name || "未测评型";
  const personalityEmoji = personality?.emoji || "🐣";
  const personalityColor = personality?.color || "#64748B";

  const saved = readForumUsername().trim();
  const username = saved || generateFallbackUsername();
  const displayName = `${personalityName} · ${username}`;

  return {
    personalityId,
    personalityName,
    personalityEmoji,
    personalityColor,
    username,
    displayName,
    isUnassessed,
  };
}

function readUserPosts(): ForumPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FORUM_USER_POSTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ForumPost[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeUserPosts(posts: ForumPost[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      FORUM_USER_POSTS_KEY,
      JSON.stringify(posts.slice(0, 50))
    );
  } catch {
    // 存储失败时静默忽略，不影响发帖 UI
  }
}

function formatPostTime(createdAt: number): string {
  const diff = Date.now() - createdAt;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

/** 标签颜色映射 */
function getTagColor(tag: string, fallback: string): string {
  if (tag === "热议") return "#FF6B6B";
  if (tag === "技术") return "#8B5CF6";
  if (tag === "价值") return "#0D9488";
  if (tag === "求助") return "#F59E0B";
  if (tag === "宏观") return "#3B82F6";
  if (tag === "我") return "#EC4899";
  return fallback;
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

// ===== 发帖弹窗 =====
const FORUM_TAG_OPTIONS = [
  { label: "热议", color: "#FF6B6B" },
  { label: "技术", color: "#8B5CF6" },
  { label: "价值", color: "#0D9488" },
  { label: "求助", color: "#F59E0B" },
  { label: "宏观", color: "#3B82F6" },
  { label: "闲聊", color: "#FF6B35" },
] as const;

function PostComposer({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; tag: string }) => void;
}) {
  const [identity, setIdentity] = useState<ForumIdentity>(() =>
    getForumIdentity()
  );
  const [username, setUsername] = useState(identity.username);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<string>(FORUM_TAG_OPTIONS[0].label);
  const [usernameEdited, setUsernameEdited] = useState(false);

  // 弹窗打开时同步最新身份（反映 TPTI 测试结果或用户名变化）
  useEffect(() => {
    if (!open) return;
    const current = getForumIdentity();
    setIdentity(current);
    setUsername(current.username);
    setUsernameEdited(false);
  }, [open]);

  if (!open) return null;

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const valid = trimmedTitle.length >= 2 && trimmedContent.length >= 2;

  const handleSubmit = () => {
    if (!valid) return;
    const finalUsername = username.trim() || identity.username;
    // 写入自定义用户名（下次自动回填）
    if (finalUsername && finalUsername !== readForumUsername()) {
      writeForumUsername(finalUsername);
    }
    onSubmit({
      title: trimmedTitle,
      content: trimmedContent,
      tag,
    });
    setTitle("");
    setContent("");
    setTag(FORUM_TAG_OPTIONS[0].label);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl border-2 border-[#8B5CF6]/30 shadow-2xl max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur px-4 pt-4 pb-3 border-b border-slate-100 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <span className="text-lg">✍️</span>
            <h3 className="text-sm font-black bg-gradient-to-r from-[#8B5CF6] to-[#FF6B6B] bg-clip-text text-transparent">
              发布到模拟社区
            </h3>
            <button
              onClick={onClose}
              className="ml-auto w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-black flex items-center justify-center"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* 身份区 */}
          <div className="rounded-2xl border-2 border-slate-100 p-3 bg-slate-50/60">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-sm"
                style={{ backgroundColor: identity.personalityColor }}
              >
                <span className="text-white">{identity.personalityEmoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 truncate">
                  {identity.personalityName}
                  <span className="text-slate-400 mx-1">·</span>
                  <span className="text-slate-600">{username || identity.username}</span>
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                  {identity.isUnassessed
                    ? "完成开场 TPTI 测试后，这里会显示你的交易人格"
                    : "来自 TPTI 人格测试结果"}
                </p>
              </div>
            </div>

            {/* 自定义用户名（可选） */}
            <div className="mt-2.5">
              <label className="text-[10px] font-black text-slate-500 mb-1 block">
                自定义用户名
              </label>
              <input
                type="text"
                value={username}
                maxLength={20}
                placeholder="例如：小陈、trader_88"
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameEdited(true);
                }}
                className="w-full h-9 px-3 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:border-[#8B5CF6] focus:outline-none"
              />
              {usernameEdited && username.trim().length < 2 && username.length > 0 && (
                <p className="text-[10px] font-bold text-amber-500 mt-1">
                  用户名至少 2 个字符，留空则使用自动生成的 player_xxxx
                </p>
              )}
            </div>
          </div>

          {/* 标题 */}
          <div>
            <label className="text-[10px] font-black text-slate-500 mb-1 block">
              标题
            </label>
            <input
              type="text"
              value={title}
              maxLength={40}
              placeholder="一句话说清你想聊什么"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:border-[#8B5CF6] focus:outline-none"
            />
          </div>

          {/* 正文 */}
          <div>
            <label className="text-[10px] font-black text-slate-500 mb-1 block">
              内容
            </label>
            <textarea
              value={content}
              maxLength={500}
              rows={4}
              placeholder="分享你的观察、困惑或观点……"
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:border-[#8B5CF6] focus:outline-none resize-none"
            />
            <div className="text-right text-[10px] font-bold text-slate-300 mt-1">
              {content.length}/500
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="text-[10px] font-black text-slate-500 mb-1 block">
              标签
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FORUM_TAG_OPTIONS.map((option) => {
                const selected = option.label === tag;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setTag(option.label)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                      selected
                        ? "text-white shadow-sm scale-105"
                        : "text-slate-500 bg-slate-100 hover:bg-slate-200"
                    }`}
                    style={selected ? { backgroundColor: option.color } : undefined}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] font-bold text-slate-400 leading-relaxed bg-amber-50 border border-amber-100 rounded-xl p-2">
            仅为本地 demo：内容保存在当前浏览器，不会上传服务器，也不构成任何投资建议。
          </p>
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur px-4 py-3 border-t border-slate-100 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-black text-slate-600 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!valid}
            className="flex-[2] h-10 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF6B6B] text-white text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            发布
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Forum Section（模拟社区，明确标识演示数据）=====
function ForumSection() {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [composerOpen, setComposerOpen] = useState(false);
  const [userPosts, setUserPosts] = useState<ForumPost[]>([]);
  // 用 tick 触发用户帖子时间相对刷新
  const [, setTick] = useState(0);

  // 挂载后读取本地用户帖子
  useEffect(() => {
    setUserPosts(readUserPosts());
  }, []);

  // 每分钟刷新一次「刚刚/N分钟前」
  useEffect(() => {
    const timer = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  // 监听其他标签页 / TPTI 测试完成后写入的 tradeti_state 变化
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "tradeti_state" || e.key === FORUM_USER_POSTS_KEY) {
        setUserPosts(readUserPosts());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleLike = useCallback((postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }, []);

  const handleCreatePost = useCallback(
    (data: { title: string; content: string; tag: string }) => {
      const identity = getForumIdentity();
      const tagOption =
        FORUM_TAG_OPTIONS.find((option) => option.label === data.tag) ||
        FORUM_TAG_OPTIONS[0];
      const newPost: ForumPost = {
        id: `me-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        author: identity.displayName,
        avatar: identity.personalityEmoji,
        role: identity.personalityName,
        styleTag: identity.isUnassessed ? "未测评" : "TPTI 认证",
        styleColor: identity.personalityColor,
        title: data.title,
        content: data.content,
        likes: 0,
        comments: 0,
        time: "刚刚",
        tag: "我",
        isMine: true,
        createdAt: Date.now(),
      };
      const next = [newPost, ...userPosts];
      setUserPosts(next);
      writeUserPosts(next);
      setComposerOpen(false);
    },
    [userPosts]
  );

  // 用户帖子置顶，再接演示数据；用户帖子的时间按 createdAt 实时计算
  const mergedPosts = useMemo<ForumPost[]>(() => {
    const refreshed = userPosts.map((post) =>
      post.createdAt
        ? { ...post, time: formatPostTime(post.createdAt) }
        : post
    );
    return [...refreshed, ...MOCK_FORUM];
  }, [userPosts]);

  return (
    <div className="bg-white rounded-3xl p-4 border-2 border-[#8B5CF6]/30 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💬</span>
        <h3 className="text-sm font-black bg-gradient-to-r from-[#8B5CF6] to-[#FF6B6B] bg-clip-text text-transparent">
          模拟社区
        </h3>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
          本地演示
        </span>
        <button
          className="text-[10px] font-black text-white ml-auto bg-gradient-to-r from-[#8B5CF6] to-[#FF6B6B] px-3 py-1 rounded-full shadow-sm hover:opacity-90 transition-opacity"
          onClick={() => setComposerOpen(true)}
        >
          + 发帖
        </button>
      </div>
      <div className="space-y-3">
        {mergedPosts.map((post) => {
          const isLiked = likedPosts.has(post.id);
          const tagColor = getTagColor(post.tag, post.styleColor);
          return (
            <div
              key={post.id}
              className={`rounded-2xl border-2 p-3 transition-all hover:shadow-sm ${
                post.isMine
                  ? "border-[#8B5CF6]/30 bg-gradient-to-br from-[#8B5CF6]/[0.03] to-[#FF6B6B]/[0.03]"
                  : "border-slate-100 hover:border-[#8B5CF6]/30"
              }`}
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
                    <span className="text-xs font-black text-slate-800 truncate max-w-full">
                      {post.author}
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
                  style={{ backgroundColor: tagColor }}
                >
                  {post.tag}
                </span>
                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                  {post.time}
                </span>
              </div>

              <p className="text-xs font-black text-slate-800 mb-1">{post.title}</p>
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed whitespace-pre-wrap break-words">
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
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-300 ml-auto">
                  <span className="text-sm">🔗</span>
                  <span>分享（demo）</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <PostComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSubmit={handleCreatePost}
      />
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
