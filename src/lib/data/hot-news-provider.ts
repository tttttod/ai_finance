// ===== 热门新闻聚合 Provider =====

import {
  type HotNewsItem,
  type HotNewsSentiment,
  DEFAULT_NEWS_KEYWORDS,
  PANIC_KEYWORDS,
  EUPHORIA_KEYWORDS,
  SECTOR_KEYWORD_MAP,
  TOP_FINANCE_SOURCES,
} from "./hot-news-types";

// ===== 舆情分析 =====

function analyzeSentiment(text: string): { sentiment: HotNewsSentiment; sentimentLabel: "恐慌" | "中性" | "狂热" } {
  const lowerText = text.toLowerCase();
  let panicCount = 0;
  let euphoriaCount = 0;

  for (const kw of PANIC_KEYWORDS) {
    if (lowerText.includes(kw)) panicCount++;
  }
  for (const kw of EUPHORIA_KEYWORDS) {
    if (lowerText.includes(kw)) euphoriaCount++;
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
  const now = Date.now();
  const pubTime = new Date(item.publishedAt).getTime();
  const hoursDiff = (now - pubTime) / (1000 * 60 * 60);
  if (hoursDiff <= 1) score += 30;
  else if (hoursDiff <= 6) score += 25;
  else if (hoursDiff <= 12) score += 15;
  else if (hoursDiff <= 24) score += 10;

  // 舆情分
  if (item.sentiment !== "neutral") score += 10;

  // 关键词分
  const text = item.title + " " + item.summary;
  let keywordHits = 0;
  for (const kw of DEFAULT_NEWS_KEYWORDS) {
    if (text.includes(kw)) keywordHits++;
  }
  if (keywordHits >= 3) score += 15;
  else if (keywordHits >= 2) score += 10;
  else if (keywordHits >= 1) score += 5;

  // 来源分
  const isTopSource = TOP_FINANCE_SOURCES.some((s) => item.source.toLowerCase().includes(s));
  if (isTopSource) score += 10;

  return Math.min(100, Math.max(0, score));
}

// ===== 提取标签 =====

function extractTags(title: string, summary: string): string[] {
  const text = title + " " + summary;
  const tags: string[] = [];
  const tagKeywords: Record<string, string[]> = {
    "政策": ["政策", "监管", "央行", "降准", "降息", "国务院", "证监会"],
    "科技": ["AI", "芯片", "半导体", "科技", "英伟达", "大模型", "量子"],
    "宏观": ["GDP", "CPI", "PPI", "通胀", "利率", "汇率", "美联储"],
    "行业": ["销量", "产量", "渗透率", "市场份额", "产能"],
    "海外": ["美股", "港股", "欧股", "纳斯达克", "标普", "美联储"],
    "市场": ["A股", "沪指", "深指", "创业板", "科创板", "北向资金"],
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

// ===== 生成摘要 =====

function generateSummary(title: string, description?: string): string {
  if (description && description.length > 20) {
    return description.slice(0, 150) + (description.length > 150 ? "..." : "");
  }
  return title;
}

// ===== GDELT Provider =====

interface GdeltArticle {
  title?: string;
  url?: string;
  domain?: string;
  seendate?: string;
  sourceCountry?: string;
  socialimage?: string;
  language?: string;
}

async function fetchFromGdelt(query: string): Promise<HotNewsItem[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodedQuery}&mode=artlist&format=json&timespan=24h&sort=hybridrel&maxrecords=30&sourcelang=chi`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FinanceNewsBot/1.0)" },
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`GDELT HTTP ${res.status}`);

    const data = await res.json();
    const articles: GdeltArticle[] = data?.articles || [];

    if (articles.length === 0) throw new Error("GDELT returned no articles");

    return articles
      .filter((a) => a.title && a.url)
      .map((a) => {
        const title = a.title || "";
        const summary = generateSummary(title);
        const { sentiment, sentimentLabel } = analyzeSentiment(title + " " + summary);
        const relatedSectors = findRelatedSectors(title + " " + summary);
        const tags = extractTags(title, summary);

        let publishedAt = new Date().toISOString();
        if (a.seendate) {
          try {
            // GDELT seendate format: "20240101T120000Z" or similar
            const cleaned = a.seendate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
            publishedAt = new Date(cleaned).toISOString();
          } catch {
            // keep default
          }
        }

        const item: HotNewsItem = {
          id: `gdelt-${Buffer.from(a.url || title).toString("base64").slice(0, 16)}`,
          title,
          source: a.domain || "unknown",
          publishedAt,
          url: a.url || "",
          summary,
          sentiment,
          sentimentLabel,
          hotScore: 0,
          relatedSectors,
          tags,
        };
        item.hotScore = calculateHotScore(item);
        return item;
      });
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ===== Google News RSS Provider =====

async function fetchFromGoogleNewsRSS(query: string): Promise<HotNewsItem[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FinanceNewsBot/1.0)" },
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Google News RSS HTTP ${res.status}`);

    const xml = await res.text();
    return parseRssXml(xml);
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function parseRssXml(xml: string): HotNewsItem[] {
  const items: HotNewsItem[] = [];

  // Simple XML parsing for RSS items
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const title = extractXmlTag(itemXml, "title") || "";
    const link = extractXmlTag(itemXml, "link") || "";
    const pubDate = extractXmlTag(itemXml, "pubDate") || "";
    const source = extractXmlTag(itemXml, "source") || "Google News";
    const description = extractXmlTag(itemXml, "description") || "";

    if (!title || !link) continue;

    // Clean HTML entities from title
    const cleanTitle = title
      .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
      .replace(/<[^>]*>/g, "")
      .trim();

    const cleanDesc = description
      .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
      .replace(/<[^>]*>/g, "")
      .trim();

    const summary = generateSummary(cleanTitle, cleanDesc);
    const { sentiment, sentimentLabel } = analyzeSentiment(cleanTitle + " " + summary);
    const relatedSectors = findRelatedSectors(cleanTitle + " " + summary);
    const tags = extractTags(cleanTitle, summary);

    let publishedAt = new Date().toISOString();
    if (pubDate) {
      try {
        publishedAt = new Date(pubDate).toISOString();
      } catch {
        // keep default
      }
    }

    const item: HotNewsItem = {
      id: `gnews-${Buffer.from(link).toString("base64").slice(0, 16)}`,
      title: cleanTitle,
      source,
      publishedAt,
      url: link,
      summary,
      sentiment,
      sentimentLabel,
      hotScore: 0,
      relatedSectors,
      tags,
    };
    item.hotScore = calculateHotScore(item);
    items.push(item);
  }

  return items;
}

function extractXmlTag(xml: string, tag: string): string {
  // Handle both <tag>value</tag> and <tag attr="...">value</tag>
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : "";
}

// ===== 去重与排序 =====

function deduplicateNews(items: HotNewsItem[]): HotNewsItem[] {
  const seen = new Set<string>();
  const result: HotNewsItem[] = [];

  for (const item of items) {
    // URL 去重
    if (seen.has(item.url)) continue;
    seen.add(item.url);

    // 标题前20字符去重
    const titleKey = item.title.slice(0, 20);
    if (seen.has(titleKey)) continue;
    seen.add(titleKey);

    result.push(item);
  }

  return result;
}

function sortNews(items: HotNewsItem[]): HotNewsItem[] {
  return items.sort((a, b) => {
    // 热度优先
    if (b.hotScore !== a.hotScore) return b.hotScore - a.hotScore;
    // 时间次之
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
  const searchQuery = query || DEFAULT_NEWS_KEYWORDS.slice(0, 5).join(" OR ");

  // Try GDELT first
  try {
    const gdeltItems = await fetchFromGdelt(searchQuery);
    if (gdeltItems.length > 0) {
      const deduped = deduplicateNews(gdeltItems);
      const sorted = sortNews(deduped);
      return {
        items: sorted.slice(0, 20),
        provider: "gdelt",
        isFallback: false,
      };
    }
  } catch (err) {
    console.warn("[hot-news] GDELT failed:", err instanceof Error ? err.message : err);
  }

  // Fallback to Google News RSS
  try {
    const gnewsItems = await fetchFromGoogleNewsRSS(searchQuery);
    if (gnewsItems.length > 0) {
      const deduped = deduplicateNews(gnewsItems);
      const sorted = sortNews(deduped);
      return {
        items: sorted.slice(0, 20),
        provider: "google-news-rss",
        isFallback: false,
      };
    }
  } catch (err) {
    console.warn("[hot-news] Google News RSS failed:", err instanceof Error ? err.message : err);
  }

  // All providers failed
  return {
    items: [],
    provider: "none",
    isFallback: true,
    message: "暂无实时新闻数据，请稍后重试",
  };
}
