"use client";

import { useState, useEffect } from "react";

// ===== Mock 数据 =====
interface HotNewsItem {
  id: number;
  title: string;
  source: string;
  time: string;
  tag: string;
  tagColor: string;
  summary: string;
  hot: number;
}

interface MarketIndex {
  name: string;
  code: string;
  value: string;
  change: string;
  changePercent: string;
  volume: string;
  isUp: boolean;
}

interface ForumPost {
  id: number;
  author: string;
  avatar: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
  tag: string;
}

const MOCK_NEWS: HotNewsItem[] = [
  { id: 1, title: "央行宣布降准0.5个百分点，释放长期资金约1万亿元", source: "新华社", time: "10分钟前", tag: "重磅", tagColor: "#FF6B6B", summary: "中国人民银行决定下调金融机构存款准备金率0.5个百分点，预计释放长期资金约1万亿元，旨在支持实体经济高质量发展。", hot: 9852 },
  { id: 2, title: "AI芯片需求爆发，英伟达股价创历史新高突破$140", source: "财联社", time: "32分钟前", tag: "科技", tagColor: "#8B5CF6", summary: "受AI大模型训练需求持续推动，英伟达股价盘中突破140美元，市值突破3.4万亿美元。", hot: 7631 },
  { id: 3, title: "新能源汽车5月销量同比增长42%，渗透率首超50%", source: "中汽协", time: "1小时前", tag: "行业", tagColor: "#4ECDC4", summary: "5月新能源汽车销量达95.5万辆，同比增长42.1%，市场渗透率首次突破50%大关。", hot: 6240 },
  { id: 4, title: "美联储暗示年内可能降息两次，美元指数走弱", source: "华尔街见闻", time: "2小时前", tag: "海外", tagColor: "#FF6B35", summary: "美联储主席在最新讲话中暗示，若通胀持续回落，年内可能启动两次降息，美元指数应声下跌。", hot: 5180 },
  { id: 5, title: "半导体板块集体走强，中芯国际涨超5%", source: "证券时报", time: "2小时前", tag: "板块", tagColor: "#FFD93D", summary: "受国产替代加速和AI芯片需求双重驱动，半导体板块今日集体走强，中芯国际涨超5%。", hot: 4320 },
  { id: 6, title: "房地产新政满月：一线城市成交量环比增长35%", source: "经济日报", time: "3小时前", tag: "政策", tagColor: "#00FF88", summary: "房地产新政实施满一个月，一线城市新房和二手房成交量环比增长35%，市场信心逐步恢复。", hot: 3890 },
];

const MOCK_INDICES: MarketIndex[] = [
  { name: "上证指数", code: "000001.SH", value: "3,285.67", change: "+32.45", changePercent: "+1.00%", volume: "4,523亿", isUp: true },
  { name: "深证成指", code: "399001.SZ", value: "10,892.34", change: "+128.76", changePercent: "+1.19%", volume: "5,891亿", isUp: true },
  { name: "创业板指", code: "399006.SZ", value: "2,156.89", change: "+45.23", changePercent: "+2.14%", volume: "2,345亿", isUp: true },
  { name: "科创50", code: "000688.SH", value: "985.42", change: "-8.67", changePercent: "-0.87%", volume: "1,234亿", isUp: false },
  { name: "恒生指数", code: "HSI", value: "18,567.23", change: "+156.78", changePercent: "+0.85%", volume: "1,567亿HKD", isUp: true },
  { name: "纳斯达克", code: "IXIC", value: "17,892.45", change: "+234.56", changePercent: "+1.33%", volume: "—", isUp: true },
];

const MOCK_FORUM: ForumPost[] = [
  { id: 1, author: "华尔街在逃交易员", avatar: "", title: "降准之后，银行股还能追吗？", content: "央行降准释放1万亿，银行股今天集体高开。但我觉得利好出尽就是利空，大家怎么看？", likes: 234, comments: 67, time: "15分钟前", tag: "热议" },
  { id: 2, author: "K线萨满", avatar: "🔮", title: "半导体板块技术面分析：突破还是假突破？", content: "中芯国际今天放量突破前高，MACD金叉，但RSI已经进入超买区。从技术面看，短期可能有回调风险。", likes: 189, comments: 45, time: "1小时前", tag: "技术" },
  { id: 3, author: "价值猎人", avatar: "🦅", title: "茅台PE回到25倍，是不是该抄底了？", content: "茅台PE从35倍回到25倍，ROE依然33%+，分红率60%。从价值投资角度看，这个估值已经很有吸引力了。", likes: 156, comments: 89, time: "2小时前", tag: "价值" },
  { id: 4, author: "量化小白", avatar: "🤖", title: "新手求教：怎么判断市场情绪？", content: "最近市场波动很大，想学学怎么判断市场情绪。有没有大佬分享一下经验？看哪些指标比较靠谱？", likes: 98, comments: 34, time: "3小时前", tag: "求助" },
  { id: 5, author: "宏观观察者", avatar: "🌍", title: "美联储降息预期升温，对A股有什么影响？", content: "如果美联储年内降息两次，美元走弱，人民币升值压力加大。理论上利好A股外资流入，但也要警惕热钱快进快出。", likes: 145, comments: 52, time: "4小时前", tag: "宏观" },
];

// ===== 子组件 =====

function HotNewsSection() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-3xl p-4 border-2 border-[#FF6B6B]/30 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔥</span>
        <h3 className="text-sm font-black bg-gradient-to-r from-[#FF6B6B] to-[#FF6B35] bg-clip-text text-transparent">
          热点新闻
        </h3>
        <span className="text-[10px] font-bold text-slate-400 ml-auto">实时更新</span>
      </div>
      <div className="space-y-2.5">
        {MOCK_NEWS.map((news) => {
          const isExpanded = expandedId === news.id;
          return (
            <div
              key={news.id}
              className="rounded-2xl border-2 border-slate-100 p-3 transition-all duration-300 hover:border-[#FF6B6B]/30 hover:shadow-sm cursor-pointer"
              style={{
                backgroundColor: isExpanded ? `${news.tagColor}08` : "white",
                borderColor: isExpanded ? `${news.tagColor}40` : undefined,
              }}
              onClick={() => setExpandedId(isExpanded ? null : news.id)}
            >
              <div className="flex items-start gap-2">
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: news.tagColor }}
                >
                  {news.tag}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-relaxed line-clamp-2">
                    {news.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-400">{news.source}</span>
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className="text-[10px] font-bold text-slate-400">{news.time}</span>
                    <span className="text-[10px] font-bold text-[#FF6B6B] ml-auto">
                      🔥 {news.hot >= 10000 ? `${(news.hot / 10000).toFixed(1)}万` : news.hot}
                    </span>
                  </div>
                </div>
              </div>
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                    {news.summary}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MarketSection() {
  return (
    <div className="bg-white rounded-3xl p-4 border-2 border-[#4ECDC4]/30 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg"></span>
        <h3 className="text-sm font-black bg-gradient-to-r from-[#4ECDC4] to-[#00D4FF] bg-clip-text text-transparent">
          今日行情
        </h3>
        <span className="text-[10px] font-bold text-slate-400 ml-auto">
          {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}
        </span>
      </div>
      <div className="space-y-2">
        {MOCK_INDICES.map((idx) => (
          <div
            key={idx.code}
            className="flex items-center justify-between py-2.5 px-3 rounded-xl border border-slate-100 transition-all hover:shadow-sm"
            style={{
              backgroundColor: idx.isUp ? "rgba(220, 38, 38, 0.03)" : "rgba(5, 150, 105, 0.03)",
            }}
          >
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-800">{idx.name}</div>
              <div className="text-[10px] font-bold text-slate-400">{idx.code}</div>
            </div>
            <div className="text-right">
              <div
                className="text-sm font-mono font-black"
                style={{ color: idx.isUp ? "#DC2626" : "#059669" }}
              >
                {idx.value}
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span
                  className="text-[10px] font-mono font-bold"
                  style={{ color: idx.isUp ? "#DC2626" : "#059669" }}
                >
                  {idx.change}
                </span>
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{
                    color: idx.isUp ? "#DC2626" : "#059669",
                    backgroundColor: idx.isUp ? "rgba(220, 38, 38, 0.1)" : "rgba(5, 150, 105, 0.1)",
                  }}
                >
                  {idx.changePercent}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span>两市成交额</span>
          <span className="text-slate-600">10,414亿</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mt-1">
          <span>北向资金</span>
          <span className="text-[#DC2626]">+45.6亿</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mt-1">
          <span>涨跌比</span>
          <span className="text-[#DC2626]">3,245 : 1,567 : 234</span>
        </div>
      </div>
    </div>
  );
}

function ForumSection() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const toggleLike = (postId: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-3xl p-4 border-2 border-[#8B5CF6]/30 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💬</span>
        <h3 className="text-sm font-black bg-gradient-to-r from-[#8B5CF6] to-[#FF6B6B] bg-clip-text text-transparent">
          用户论谈
        </h3>
        <button className="text-[10px] font-black text-[#8B5CF6] ml-auto bg-[#8B5CF6]/10 px-3 py-1 rounded-full hover:bg-[#8B5CF6]/20 transition-colors">
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
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{post.avatar}</span>
                <span className="text-xs font-black text-slate-700">{post.author}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{
                    backgroundColor:
                      post.tag === "热议" ? "#FF6B6B" :
                      post.tag === "技术" ? "#8B5CF6" :
                      post.tag === "价值" ? "#4ECDC4" :
                      post.tag === "求助" ? "#FFD93D" : "#FF6B35",
                  }}
                >
                  {post.tag}
                </span>
                <span className="text-[10px] font-bold text-slate-400 ml-auto">{post.time}</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mb-1">{post.title}</p>
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{post.content}</p>
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
                <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-[#8B5CF6] transition-colors ml-auto">
                  <span className="text-sm"></span>
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

// ===== 主组件 =====
export default function NewsTab() {
  const [currentTime, setCurrentTime] = useState("");

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
            热点资讯 · 实时行情 · 投资社区，一站式掌握市场脉搏
          </p>
        </div>
      </div>

      {/* 热点新闻 */}
      <HotNewsSection />

      {/* 今日行情 */}
      <MarketSection />

      {/* 用户论谈 */}
      <ForumSection />

      {/* 免责声明 */}
      <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-100">
        <p className="text-[10px] text-amber-600 leading-relaxed font-bold">
          ⚠️ 以上信息仅供参考，不构成投资建议。市场有风险，投资需谨慎。论谈内容为用户自发分享，不代表平台观点。
        </p>
      </div>
    </div>
  );
}
