# AGENTS.md

## 项目概览

A股板块追踪 Web 应用 — 每日追踪 A 股行业板块主力资金流向，展示热门板块及其成分股信息。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS 4
- **包管理**: pnpm

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── report/route.ts       # GET /api/report - 获取每日完整报告（含全部模块）
│   │   ├── sectors/route.ts      # GET /api/sectors - 获取所有板块列表
│   │   └── sectors/[id]/route.ts # GET /api/sectors/:id - 获取单个板块详情
│   ├── layout.tsx                # 根布局（Header + Footer）
│   ├── page.tsx                  # 首页仪表盘（Tab 切换 6 大模块，默认展示研报观点总结）
│   └── globals.css               # 全局样式 + 金融主题色
├── components/
│   ├── ui/                       # shadcn/ui 组件库
│   ├── market-overview.tsx       # 市场概览条（指数、成交额、板块统计）
│   ├── sector-card.tsx           # 板块卡片（列表展示用）
│   ├── sector-detail.tsx         # 板块详情（含涨幅/市值排行表）
│   ├── research-summary.tsx      # 研报观点总结（综合观点/主题/机会/风险）
│   ├── macro-summary.tsx         # 宏观观点总结（整体判断+关键要点）
│   ├── macro-brief.tsx           # 宏观分析（财经热点快照详情）
│   ├── fundamental-section.tsx   # 基本面分析（机构研报共识）
│   ├── technical-section.tsx     # 技术面分析（均线/支撑压力/趋势）
│   ├── stock-tracking.tsx        # 荐股追踪（历史荐股累计表现）
│   └── change-log.tsx            # 变更日志（相对上一版变化）
└── lib/
    ├── types.ts                  # 数据类型定义（含全部 5 模块类型）
    ├── mock-data.ts              # 模拟数据层（后续可替换为真实 API）
    └── utils.ts                  # 通用工具函数
```

## 功能模块

1. **研报观点总结** — 综合基本面+技术面+板块数据的整体观点，含核心主题、机会亮点、风险提示
2. **宏观分析** — 宏观观点总结（利好/利空/中性判断）+ 中外财经热点快照详情
3. **基本面分析** — 机构研报共识（覆盖机构数、评级、目标价、关键观点）
4. **技术面分析** — MA20/MA60 均线、20日支撑/压力位、趋势判断、分析师目标价空间
5. **荐股追踪** — 历史荐股累计涨跌幅表现，按日期分组，含胜率统计
6. **板块资金** — 主力资金净流入行业板块，区分"连续2日流入"与"仅今日流入"

## 数据说明

当前使用 `src/lib/mock-data.ts` 提供模拟数据，包含 8 个热门板块（传媒、计算机、食品饮料、汽车、家用电器、农林牧渔、商贸零售、社会服务）及宏观/基本面/技术面/荐股追踪的完整数据。后续可替换为真实 Tushare API 调用。

## 设计规范

详见 `DESIGN.md`，核心要点：
- 暖白底色 (#FAFAF9)，A股红 (#DC2626) 表示涨/资金流入，青绿 (#0D9488) 表示跌/资金流出
- 数字使用等宽字体，卡片式布局，轻量动效
