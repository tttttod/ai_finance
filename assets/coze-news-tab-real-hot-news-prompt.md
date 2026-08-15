# Coze 修改 Prompt：第四页「时讯」接入新浪财经 RSS

## 目标

第四页「时讯」(`src/components/news-tab.tsx`) 的热点新闻通过统一接口获取真实新闻：

```txt
GET /api/hot-news
```

前端只请求该接口，不直接绑定具体新闻网站。

## 数据源

第一版只接入国内可访问、免费、无需 API Key 的新浪财经 RSS：

- 财经要闻：`https://rss.sina.com.cn/roll/finance/hot_roll.xml`
- 股市及时雨：`https://rss.sina.com.cn/finance/jsy.xml`
- 股票要闻：`https://rss.sina.com.cn/roll/stock/hot_roll.xml`
- 港股：`https://rss.sina.com.cn/finance/hkstock.xml`
- 美股：`https://rss.sina.com.cn/finance/usstock.xml`

参考来源：新浪 RSS 财经频道
https://rss.sina.com.cn/rss/finance/index.shtml?from=wap

## 处理要求

1. 删除或停用 GDELT、Google News RSS 等国外源。
2. 默认 provider：`sina-finance-rss`。
3. 服务端并行拉取 5 路 RSS，单个失败不影响其他源。
4. 解析 `<item>` 后统一转换为 `HotNewsItem`：
   - `id`、`title`、`summary`、`url`、`source`、`publishedAt`
   - `sentiment`、`sentimentLabel`、`relatedSectors`、`tags`、`hotScore`
5. `source` 显示为「新浪财经 · 栏目名」。
6. 保留情绪识别逻辑，但仅作为辅助内容标签，不构成投资建议。
7. 支持 `?q=` 参数：从标题和摘要中做本地关键词过滤。
8. 所有 RSS 子源都失败时返回空数组，前端显示“暂无可用新闻数据 / 请稍后重试”。
9. 不要回退到国外源，不要使用 mock 新闻冒充真实数据。
10. 前端 provider 映射：`sina-finance-rss` → `新浪财经 RSS`。

## 文件

- `src/app/api/hot-news/route.ts`
- `src/lib/data/hot-news-provider.ts`
- `src/lib/data/hot-news-types.ts`
- `src/components/news-tab.tsx`
- `SPEC.md`
