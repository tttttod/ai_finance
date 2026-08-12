# Coze 修改 Prompt：第四页「时讯」接入真实热门新闻

请为当前项目新增“真实热门新闻聚合”能力，用来替换第四页「时讯」里的 mock 新闻数据。

## 背景

当前项目第四页是「时讯」，组件为：

- `src/components/news-tab.tsx`

现在该组件内部写死了：

- `MOCK_NEWS`
- `MOCK_INDICES`
- `MOCK_FORUM`

其中新闻部分不是实时数据。

由于当前没有开通 Tushare 的 `news` 新闻接口权限，所以请不要依赖 Tushare news。请改成一个可扩展的新闻聚合方案。

## 目标

新增统一新闻接口：

```txt
GET /api/hot-news
```

前端第四页「时讯」只请求这个接口，不直接绑定具体新闻源。

第一版新闻源优先使用：

1. GDELT DOC API
2. Google News RSS 或可用聚合源
3. 指定财经网站 RSS，如有可用 feed
4. 如果全部失败，返回空数据并显示“暂无实时新闻”，不要用 mock 冒充实时新闻

## 统一返回格式

`GET /api/hot-news` 返回：

```ts
{
  success: boolean;
  data: HotNewsItem[];
  meta: {
    provider: string;
    fetchedAt: string;
    query: string;
    isFallback: boolean;
    message?: string;
  };
}
```

其中：

```ts
type HotNewsSentiment = "panic" | "neutral" | "euphoria";

interface HotNewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  summary: string;
  sentiment: HotNewsSentiment;
  sentimentLabel: "恐慌" | "中性" | "狂热";
  hotScore: number;
  relatedSectors: string[];
  tags: string[];
}
```

## 后端实现要求

新增文件：

```txt
src/app/api/hot-news/route.ts
```

可新增工具文件：

```txt
src/lib/data/hot-news-types.ts
src/lib/data/hot-news-provider.ts
```

## 1. 默认查询关键词

默认拉取最近 24 小时与金融市场相关的新闻。

关键词建议：

```txt
A股
港股
美股
半导体
AI芯片
新能源
房地产
券商
人民币
美联储
降息
CPI
PPI
原油
黄金
```

可以组合成 query。

## 2. GDELT Provider

优先实现 GDELT DOC API。

请求示例方向：

```txt
https://api.gdeltproject.org/api/v2/doc/doc?query=关键词&mode=artlist&format=json&timespan=24h&sort=hybridrel
```

注意：

- query 需要 URL encode；
- 需要设置超时；
- 失败时不要导致整个接口崩溃；
- 返回结果需要映射成统一 `HotNewsItem`。

GDELT 返回字段可能包含：

- `title`
- `url`
- `sourceCountry`
- `domain`
- `seendate`
- `socialimage`
- `language`

请根据可用字段映射：

```ts
title => title
domain => source
seendate => publishedAt
url => url
```

`summary` 如果没有，可以用 `title` 生成简短摘要。

## 3. Google News RSS Provider，可作为备用

如果 GDELT 失败，可以尝试 Google News RSS。

示例：

```txt
https://news.google.com/rss/search?q=关键词&hl=zh-CN&gl=CN&ceid=CN:zh-Hans
```

要求：

- 解析 RSS XML；
- 提取标题、链接、发布时间、来源；
- 映射成统一 `HotNewsItem`；
- 如果项目没有 XML parser，可以使用轻量解析，或新增依赖，但优先避免过重依赖。

## 4. 指定财经网站 RSS，预留扩展

设计 provider 时预留：

```ts
fetchFromRssFeeds(feeds: string[]): Promise<HotNewsItem[]>
```

后续可以接：

- 东方财富
- 证券时报
- 第一财经
- 华尔街见闻
- 财联社
- 新浪财经

但第一版不要求全部实现。

## 舆情判断

请在后端对新闻标题和摘要做简单规则判断，生成：

```ts
sentiment: "panic" | "neutral" | "euphoria";
sentimentLabel: "恐慌" | "中性" | "狂热";
```

规则示例：

### 恐慌 panic

关键词：

```txt
暴跌
跳水
崩盘
恐慌
大跌
跌停
踩踏
抛售
爆雷
违约
亏损扩大
监管调查
```

### 狂热 euphoria

关键词：

```txt
暴涨
涨停潮
抢筹
爆发
大涨
创新高
翻倍
资金涌入
火爆
全线拉升
```

### 中性 neutral

不命中明显恐慌或狂热关键词时，默认为中性。

## 关联 A 股板块

请根据关键词给新闻打上相关板块：

示例规则：

```ts
AI / 算力 / 芯片 / 英伟达 => ["AI算力", "半导体", "消费电子"]
新能源 / 电池 / 光伏 / 储能 => ["新能源", "电池", "光伏"]
房地产 / 地产 / 房贷 => ["房地产", "银行"]
美联储 / 降息 / 美债 / 美元 => ["金融", "贵金属", "出口链"]
原油 / OPEC / 油价 => ["石油石化", "化工"]
黄金 / 金价 => ["贵金属"]
医药 / 创新药 / 医保 => ["医药生物"]
券商 / 牛市 / 成交额 => ["券商", "金融科技"]
```

输出到：

```ts
relatedSectors: string[];
tags: string[];
```

## 热度评分

给每条新闻计算 `hotScore`，范围 0-100。

建议规则：

```txt
hotScore = 基础分 + 时效分 + 舆情分 + 来源分 + 关键词分
```

示例：

- 24 小时内：+20
- 6 小时内：+30
- 恐慌或狂热：+20
- 命中多个金融关键词：+10
- 来源为主流财经媒体：+10

最终限制在 0-100。

## 去重和排序

请对新闻去重：

- 标题完全相同去重；
- URL 相同去重；
- 标题高度相似可以简单用前 20 个字符去重。

排序：

1. `hotScore` 高的优先；
2. 发布时间新的优先。

默认返回前 20 条。

## 前端改造

修改：

```txt
src/components/news-tab.tsx
```

## 新闻部分

删除或停止使用 `MOCK_NEWS` 作为实时新闻来源。

改为：

```ts
fetch("/api/hot-news")
```

需要处理：

- loading 状态；
- error 状态；
- 空数据状态；
- 数据来源展示；
- `fetchedAt` 展示；
- `provider` 展示。

新闻卡片展示字段：

- 舆情标签：恐慌 / 中性 / 狂热；
- 标题；
- 来源；
- 发布时间；
- 热度；
- 摘要；
- 相关板块；
- 点击可展开详情；
- 可以点击原文链接，新窗口打开。

## 今日行情部分

`NewsTab` 里的行情数据不要继续使用 `MOCK_INDICES`，应复用：

```txt
GET /api/market-snapshot
```

展示其中的：

- `indices`
- `tradeDate`
- `source`
- `stale`

如果 `source` 是 `mock`，显示：

```txt
行情为演示数据
```

## 用户论谈部分

`MOCK_FORUM` 可以暂时保留，但必须标注：

```txt
社区内容为演示数据
```

不要让它看起来像真实用户数据。

## 降级逻辑

如果所有新闻源都失败，接口返回：

```ts
{
  success: true,
  data: [],
  meta: {
    provider: "none",
    fetchedAt: "...",
    query: "...",
    isFallback: true,
    message: "暂无实时新闻数据，请稍后重试"
  }
}
```

前端显示：

```txt
暂无实时新闻数据，请稍后重试
```

不要展示 mock 新闻冒充实时新闻。

## 环境变量

第一版 GDELT 和 Google News RSS 不需要 Key。

但请预留：

```txt
NEWS_PROVIDER=gdelt
NEWS_QUERY=
NEWS_RSS_FEEDS=
```

如果以后接 NewsAPI / SerpApi / Bing News，可以继续扩展 provider。

## 验收标准

1. 第四页「时讯」新闻不再使用硬编码 `MOCK_NEWS`。
2. 页面通过 `/api/hot-news` 获取新闻。
3. `/api/hot-news` 默认使用 GDELT 或 Google News RSS 获取最近 24 小时新闻。
4. 每条新闻有标题、来源、时间、链接、摘要、舆情标签、热度分、相关板块。
5. 舆情标签能区分：恐慌 / 中性 / 狂热。
6. 新闻按热度和时间排序。
7. 无数据时显示空状态，不展示假新闻。
8. 行情部分复用 `/api/market-snapshot`。
9. 社区讨论可以保留 mock，但必须标注“演示数据”。
10. 不引入浏览器端敏感 Key。

## 重要原则

第四页「时讯」应该接统一新闻聚合层 `/api/hot-news`，不要直接在前端绑定某个新闻网站。

未来如果切换到 Tushare news、NewsAPI、SerpApi、Bing News 或自建新闻源，只需要改 provider，不需要重写第四页前端。

