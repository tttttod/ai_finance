// ===== 新浪财经 RSS 热门新闻聚合 Provider =====
// 国内可访问的免费公开 RSS，无需 API Key。
// 参考：https://rss.sina.com.cn/rss/finance/index.shtml?from=wap

import {
  type HotNewsItem,
  type HotNewsSentiment,
  DEFAULT_NEWS_KEYWORDS,
  PANIC_KEYWORDS,
  EUPHORIA_KEYWORDS,
  SECTOR_KEYWORD_MAP,
} from "./hot-news-types";

export const SINA_FINANCE_PROVIDER = "sina-finance-rss";

// 新浪财经 RSS 订阅源（国内可访问、免费）
const SINA_FINANCE_FEEDS: ReadonlyArray<{
  url: string;
  channel: string;
  keywords: string[];
}> = [
  {
    url: "https://rss.sina.com.cn/roll/finance/hot_roll.xml",
    channel: "财经要闻",
    keywords: ["A股", "财经", "央行", "政策", "经济", "利率"],
  },
  {
    url: "https://rss.sina.com.cn/finance/jsy.xml",
    channel: "股市及时雨",
    keywords: ["股市", "A股", "沪指", "创业板", "板块"],
  },
  {
    url: "https://rss.sina.com.cn/roll/stock/hot_roll.xml",
    channel: "股票要闻",
    keywords: ["股票", "上市公司", "业绩", "公告", "涨跌"],
  },
  {
    url: "https://rss.sina.com.cn/finance/hkstock.xml",
    channel: "港股",
    keywords: ["港股", "恒生", "港股通", "港币"],
  },
  {
    url: "https://rss.sina.com.cn/finance/usstock.xml",
    channel: "美股",
    keywords: ["美股", "纳斯达克", "标普", "美联储", "中概股"],
  },
];

const FETCH_TIMEOUT_MS = 8000;
const MAX_NEWS_ITEMS = 30;

// ===== 舆情分析（仅作为内容标签，不构成投资建议）=====

function analyzeSentiment(text: string): {
  sentiment: HotNewsSentiment;
  sentimentLabel: "恐慌" | "中性" | "狂热";
} {
  const lowerText = text.toLowerCase();
  let panicCount = 0;
  let euphoriaCount = 0;

  for (const kw of PANIC_KEYWORDS) {
    if (lowerText.includes(kw.toLowerCase())) panicCount++;
  }
  for (const kw of EUPHORIA_KEYWORDS) {
    if (lowerText.includes(kw.toLowerCase())) euphoriaCount++;
  }

  if (panicCount >= 2 || (panicCount > euphoriaCount && panicCount >= 1)) {
    return { sentiment: "panic", sentimentLabel: "恐慌" };
  }
  if (euphoriaCount >= 2 || (euphoriaCount > panicCount && euphoriaCount >= 1)) {
    return { sentiment: "euphoria", sentimentLabel: "狂热" };
  }
  return { sentiment: "neutral", sentimentLabel: "中性" };
}

// ===== 板块关联 =====

function findRelatedSectors(text: string): string[] {
  const sectors: string[] = [];
  const lowerText = text.toLowerCase();

  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORD_MAP)) {
    for (const kw of keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        if (!sectors.includes(sector)) sectors.push(sector);
        break;
      }
    }
  }
  return sectors;
}

// ===== 热度评分 =====

function calculateHotScore(item: {
  publishedAt: string;
  sentiment: HotNewsSentiment;
  title: string;
  summary: string;
  source: string;
}): number {
  let score = 30; // 基础分

  // 时效分
  const pubTime = new Date(item.publishedAt).getTime();
  if (!Number.isNaN(pubTime)) {
    const now = Date.now();
    const hoursDiff = (now - pubTime) / (1000 * 60 * 60);
    if (hoursDiff <= 1) score += 30;
    else if (hoursDiff <= 6) score += 25;
    else if (hoursDiff <= 12) score += 15;
    else if (hoursDiff <= 24) score += 10;
  }

  // 舆情分（仅作为内容标签，不构成投资建议）
  if (item.sentiment !== "neutral") score += 10;

  // 关键词分
  const text = `${item.title} ${item.summary}`;
  let keywordHits = 0;
  for (const kw of DEFAULT_NEWS_KEYWORDS) {
    if (text.includes(kw)) keywordHits++;
  }
  if (keywordHits >= 3) score += 15;
  else if (keywordHits >= 2) score += 10;
  else if (keywordHits >= 1) score += 5;

  // 来源分：新浪财经作为主流财经来源给予稳定加分
  if (item.source.includes("新浪财经")) score += 10;

  return Math.min(100, Math.max(0, score));
}

// ===== 标签提取 =====

function extractTags(title: string, summary: string): string[] {
  const text = `${title} ${summary}`;
  const tags: string[] = [];
  const tagKeywords: Record<string, string[]> = {
    政策: ["政策", "监管", "央行", "降准", "降息", "国务院", "证监会"],
    科技: ["AI", "芯片", "半导体", "科技", "英伟达", "大模型", "量子"],
    宏观: ["GDP", "CPI", "PPI", "通胀", "利率", "汇率", "美联储"],
    行业: ["销量", "产量", "渗透率", "市场份额", "产能"],
    海外: ["美股", "港股", "欧股", "纳斯达克", "标普", "美联储"],
    市场: ["A股", "沪指", "深指", "创业板", "科创板", "北向资金"],
  };

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        if (!tags.includes(tag)) tags.push(tag);
        break;
      }
    }
  }
  return tags.slice(0, 3);
}

// ===== 文本清洗 =====

function decodeXmlEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractXmlTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const match = regex.exec(xml);
  return match ? decodeXmlEntities(match[1]) : "";
}

function generateSummary(title: string, description?: string): string {
  const cleanDesc = description ? decodeXmlEntities(description) : "";
  if (cleanDesc.length > 20) {
    return cleanDesc.slice(0, 150) + (cleanDesc.length > 150 ? "..." : "");
  }
  return title;
}

function parsePubDate(pubDate: string): string {
  if (!pubDate) return new Date().toISOString();
  const parsed = new Date(pubDate);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function inferChannelSector(channel: string): string {
  if (channel.includes("港股")) return "港股";
  if (channel.includes("美股")) return "美股";
  if (channel.includes("股票")) return "A股";
  if (channel.includes("股市")) return "A股";
  return "财经";
}

// ===== 单个新浪 RSS 源解析 =====

async function fetchFromSinaFeed(feed: {
  url: string;
  channel: string;
}): Promise<HotNewsItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      next: { revalidate: 120 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MarketAdventureNewsBot/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });

    if (!res.ok) {
      throw new Error(`Sina RSS HTTP ${res.status} (${feed.channel})`);
    }

    const xml = await res.text();
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const items: HotNewsItem[] = [];
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = extractXmlTag(itemXml, "title");
      const link = extractXmlTag(itemXml, "link");
      const pubDate = extractXmlTag(itemXml, "pubDate") || extractXmlTag(itemXml, "dc:date");
      const description = extractXmlTag(itemXml, "description");
      const rssSource = extractXmlTag(itemXml, "source") || extractXmlTag(itemXml, "author");

      if (!title || !link) continue;

      const source = rssSource ? `新浪财经 · ${rssSource}` : `新浪财经 · ${feed.channel}`;
      const summary = generateSummary(title, description);
      const analysisText = `${title} ${summary}`;
      const { sentiment, sentimentLabel } = analyzeSentiment(analysisText);
      const relatedSectors = findRelatedSectors(analysisText);
      const tags = extractTags(title, summary);
      const channelSector = inferChannelSector(feed.channel);
      const sector = relatedSectors[0] || channelSector;

      const item: HotNewsItem = {
        id: `sina-${Buffer.from(link).toString("base64url").slice(0, 24)}`,
        title,
        source,
        publishedAt: parsePubDate(pubDate),
        url: link,
        summary,
        sentiment,
        sentimentLabel,
        hotScore: 0,
        sector,
        relatedSectors,
        tags,
      };
      item.hotScore = calculateHotScore(item);
      items.push(item);
    }

    return items;
  } finally {
    clearTimeout(timeout);
  }
}

// ===== 去重、过滤与排序 =====

function deduplicateNews(items: HotNewsItem[]): HotNewsItem[] {
  const seen = new Set<string>();
  const result: HotNewsItem[] = [];

  for (const item of items) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);

    const titleKey = item.title.replace(/\s+/g, "").slice(0, 20).toLowerCase();
    if (seen.has(titleKey)) continue;
    seen.add(titleKey);

    result.push(item);
  }

  return result;
}

function filterByQuery(items: HotNewsItem[], query?: string): HotNewsItem[] {
  if (!query?.trim()) return items;

  // 支持空格 / 逗号 / OR 分隔关键词，命中任一关键词即保留；
  // 短语带引号时作为完整关键词匹配。
  const tokens = query
    .split(/\s+(?:OR)\s+|[\s,，、]+/i)
    .map((token) => token.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);

  if (tokens.length === 0) return items;

  return items.filter((item) => {
    const haystack = `${item.title} ${item.summary}`.toLowerCase();
    return tokens.some((token) => haystack.includes(token.toLowerCase()));
  });
}

function sortNews(items: HotNewsItem[]): HotNewsItem[] {
  return [...items].sort((a, b) => {
    if (b.hotScore !== a.hotScore) return b.hotScore - a.hotScore;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

// ===== 主入口 =====

export async function fetchHotNews(query?: string): Promise<{
  items: HotNewsItem[];
  provider: string;
  isFallback: boolean;
  message?: string;
}> {
  const results = await Promise.allSettled(
    SINA_FINANCE_FEEDS.map((feed) => fetchFromSinaFeed(feed)),
  );

  const allItems: HotNewsItem[] = [];
  const failedFeeds: string[] = [];

  results.forEach((result, index) => {
    const feed = SINA_FINANCE_FEEDS[index];
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    } else {
      failedFeeds.push(feed.channel);
      const reason =
        result.reason instanceof Error ? result.reason.message : String(result.reason);
      console.warn(`[hot-news] Sina RSS ${feed.channel} failed:`, reason);
    }
  });

  if (allItems.length === 0) {
    return {
      items: [],
      provider: SINA_FINANCE_PROVIDER,
      isFallback: true,
      message: "暂无可用新闻数据，请稍后重试",
    };
  }

  const deduped = deduplicateNews(allItems);
  const filtered = filterByQuery(deduped, query);
  const sorted = sortNews(filtered);

  return {
    items: sorted.slice(0, MAX_NEWS_ITEMS),
    provider: SINA_FINANCE_PROVIDER,
    isFallback: false,
    message:
      failedFeeds.length > 0
        ? `部分栏目加载失败：${failedFeeds.join("、")}`
        : undefined,
  };
}
