// ===== 东方财富搜索 热门新闻 Provider =====
// 国内可访问、免费、无需 API Key。
// 对应 AKShare `stock_news_em` 的底层网页接口：
//   https://search-api-web.eastmoney.com/search/jsonp
//   搜索页：https://so.eastmoney.com/news/s?keyword=xxx
//
// 说明：
// - 接口返回 JSONP，服务端剥离 cb 外壳后解析 JSON。
// - 默认并行搜索多个财经关键词，合并去重，按热度 + 时间排序。
// - 若传入 query（如股票代码、行业词、市场词），则只搜索该关键词。
// - 所有源失败时返回空数组，不回退国外源、不使用 mock 数据。

import {
  type HotNewsItem,
  type HotNewsSentiment,
  DEFAULT_NEWS_KEYWORDS,
  PANIC_KEYWORDS,
  EUPHORIA_KEYWORDS,
  SECTOR_KEYWORD_MAP,
  TOP_FINANCE_SOURCES,
} from "./hot-news-types";

export const EASTMONEY_PROVIDER = "eastmoney-search";

const EASTMONEY_SEARCH_URL =
  "https://search-api-web.eastmoney.com/search/jsonp";
const FETCH_TIMEOUT_MS = 8000;
const PAGE_SIZE_PER_KEYWORD = 10;
const MAX_NEWS_ITEMS = 30;

// ===== 舆情分析（仅作为内容标签，不构成投资建议）=====

function analyzeSentiment(text: string): {
  sentiment: HotNewsSentiment;
  sentimentLabel: "恐慌" | "中性" | "狂热";
} {
  let panicCount = 0;
  let euphoriaCount = 0;

  for (const kw of PANIC_KEYWORDS) {
    if (text.includes(kw)) panicCount++;
  }
  for (const kw of EUPHORIA_KEYWORDS) {
    if (text.includes(kw)) euphoriaCount++;
  }

  if (panicCount >= 2 || (panicCount > euphoriaCount && panicCount >= 1)) {
    return { sentiment: "panic", sentimentLabel: "恐慌" };
  }
  if (euphoriaCount >= 2 || (euphoriaCount > panicCount && euphoriaCount >= 1)) {
    return { sentiment: "euphoric", sentimentLabel: "狂热" };
  }
  return { sentiment: "neutral", sentimentLabel: "中性" };
}

// ===== 板块关联 =====

function findRelatedSectors(text: string): string[] {
  const sectors: string[] = [];
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORD_MAP)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
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
    const hoursDiff = (Date.now() - pubTime) / (1000 * 60 * 60);
    if (hoursDiff <= 1) score += 30;
    else if (hoursDiff <= 6) score += 25;
    else if (hoursDiff <= 12) score += 15;
    else if (hoursDiff <= 24) score += 10;
  }

  // 舆情分（仅作为内容标签）
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

  // 来源分：主流财经媒体加分
  if (TOP_FINANCE_SOURCES.some((s) => item.source.includes(s))) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

// ===== 标签提取 =====

function extractTags(title: string, summary: string): string[] {
  const text = `${title} ${summary}`;
  const tags: string[] = [];
  const tagKeywords: Record<string, string[]> = {
    政策: ["政策", "监管", "央行", "降准", "降息", "国务院", "证监会", "发改委"],
    科技: ["AI", "芯片", "半导体", "科技", "英伟达", "大模型", "量子", "CPO", "光模块"],
    宏观: ["GDP", "CPI", "PPI", "通胀", "利率", "汇率", "美联储", "非农"],
    行业: ["销量", "产量", "渗透率", "市场份额", "产能"],
    海外: ["美股", "港股", "欧股", "纳斯达克", "标普", "美联储", "中概股"],
    市场: ["A股", "沪指", "深指", "创业板", "科创板", "北向资金", "成交额"],
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

function cleanHtml(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

function parseEastmoneyDate(date: string): string {
  if (!date) return new Date().toISOString();
  // 东方财富日期格式："2026-08-15 13:09:00"
  const normalized = date.replace(/-/g, "/");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

// ===== 东方财富搜索 API =====

interface EastmoneyArticle {
  title?: string;
  url?: string;
  content?: string;
  date?: string;
  mediaName?: string;
  code?: string;
  image?: string;
}

interface EastmoneyResponse {
  result?: {
    cmsArticleWebOld?: EastmoneyArticle[];
  };
  hitsTotal?: number;
}

function buildSearchParam(keyword: string): string {
  const param = {
    uid: "",
    keyword,
    type: ["cmsArticleWebOld"],
    client: "web",
    clientType: "web",
    clientVersion: "curr",
    param: {
      cmsArticleWebOld: {
        searchScope: "default",
        sort: "default",
        pageIndex: 1,
        pageSize: PAGE_SIZE_PER_KEYWORD,
        preTag: "",
        postTag: "",
      },
    },
  };
  return encodeURIComponent(JSON.stringify(param));
}

function stripJsonp(text: string): string {
  // 形如 `jQuery123({...})`，剥离首尾的 cb(...)
  const start = text.indexOf("(");
  const end = text.lastIndexOf(")");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start + 1, end);
  }
  return text;
}

async function fetchEastmoneyByKeyword(keyword: string): Promise<HotNewsItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const cb = `emcb_${Math.random().toString(36).slice(2, 12)}`;
    const url = `${EASTMONEY_SEARCH_URL}?cb=${cb}&param=${buildSearchParam(keyword)}`;

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 120 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MarketAdventureNewsBot/1.0; +https://example.com/bot)",
        Accept: "*/*",
        Referer: `https://so.eastmoney.com/news/s?keyword=${encodeURIComponent(keyword)}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Eastmoney HTTP ${res.status} (keyword=${keyword})`);
    }

    const raw = await res.text();
    const jsonText = stripJsonp(raw);
    const data = JSON.parse(jsonText) as EastmoneyResponse;

    const articles = data.result?.cmsArticleWebOld ?? [];
    return articles
      .filter((a) => a.title && a.url)
      .map((a) => {
        const title = cleanHtml(a.title);
        const summaryRaw = cleanHtml(a.content);
        const summary = truncate(summaryRaw || title, 160);
        const analysisText = `${title} ${summary}`;
        const { sentiment, sentimentLabel } = analyzeSentiment(analysisText);
        const relatedSectors = findRelatedSectors(analysisText);
        const tags = extractTags(title, summary);
        const mediaName = cleanHtml(a.mediaName) || "东方财富";
        const source = mediaName.startsWith("东方财富")
          ? mediaName
          : `东方财富 · ${mediaName}`;

        const item: HotNewsItem = {
          id: `em-${a.code || Buffer.from(a.url as string).toString("base64url").slice(0, 20)}`,
          title,
          source,
          publishedAt: parseEastmoneyDate(a.date || ""),
          url: a.url as string,
          summary,
          sentiment,
          sentimentLabel,
          hotScore: 0,
          sector: relatedSectors[0],
          relatedSectors,
          tags,
          image: a.image || undefined,
        };
        item.hotScore = calculateHotScore(item);
        return item;
      });
  } finally {
    clearTimeout(timeout);
  }
}

// ===== 去重与排序 =====

function deduplicateNews(items: HotNewsItem[]): HotNewsItem[] {
  const seen = new Set<string>();
  const result: HotNewsItem[] = [];

  for (const item of items) {
    if (item.url && seen.has(item.url)) continue;
    if (item.url) seen.add(item.url);

    const titleKey = item.title.replace(/\s+/g, "").slice(0, 20);
    if (seen.has(titleKey)) continue;
    seen.add(titleKey);

    result.push(item);
  }

  return result;
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
  const keywords = query?.trim()
    ? [query.trim()]
    : DEFAULT_NEWS_KEYWORDS;

  const results = await Promise.allSettled(
    keywords.map((kw) => fetchEastmoneyByKeyword(kw)),
  );

  const allItems: HotNewsItem[] = [];
  const failedKeywords: string[] = [];

  results.forEach((result, index) => {
    const kw = keywords[index];
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    } else {
      failedKeywords.push(kw);
      const reason =
        result.reason instanceof Error ? result.reason.message : String(result.reason);
      console.warn(`[hot-news] Eastmoney keyword "${kw}" failed:`, reason);
    }
  });

  if (allItems.length === 0) {
    return {
      items: [],
      provider: EASTMONEY_PROVIDER,
      isFallback: true,
      message: "暂无可用新闻数据，请稍后重试",
    };
  }

  const deduped = deduplicateNews(allItems);
  const sorted = sortNews(deduped);

  return {
    items: sorted.slice(0, MAX_NEWS_ITEMS),
    provider: EASTMONEY_PROVIDER,
    isFallback: false,
    message:
      failedKeywords.length > 0 && !query?.trim()
        ? `部分关键词加载失败：${failedKeywords.join("、")}`
        : undefined,
  };
}
