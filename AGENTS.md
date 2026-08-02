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
│   │   ├── report/route.ts       # GET /api/report - 获取每日完整报告
│   │   ├── sectors/route.ts      # GET /api/sectors - 获取所有板块列表
│   │   └── sectors/[id]/route.ts # GET /api/sectors/:id - 获取单个板块详情
│   ├── layout.tsx                # 根布局（Header + Footer）
│   ├── page.tsx                  # 首页仪表盘
│   └── globals.css               # 全局样式 + 金融主题色
├── components/
│   ├── ui/                       # shadcn/ui 组件库
│   ├── market-overview.tsx       # 市场概览条（指数、成交额、板块统计）
│   ├── sector-card.tsx           # 板块卡片（列表展示用）
│   └── sector-detail.tsx         # 板块详情（含涨幅/市值排行表）
└── lib/
    ├── types.ts                  # 数据类型定义
    ├── mock-data.ts              # 模拟数据层（后续可替换为真实 API）
    └── utils.ts                  # 通用工具函数
```

## 开发命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm ts-check     # TypeScript 类型检查
pnpm lint         # ESLint 检查
pnpm lint:style   # Stylelint 检查
```

## 数据说明

当前使用 `src/lib/mock-data.ts` 提供模拟数据，包含 8 个热门板块（电子、AI算力、新能源车、半导体、医药生物、国防军工、白酒、机器人）的完整数据。后续可替换为真实 Tushare API 调用。

## 设计规范

详见 `DESIGN.md`，核心要点：
- 暖白底色 (#FAFAF9)，A股红 (#DC2626) 表示涨/资金流入，青绿 (#0D9488) 表示跌/资金流出
- 数字使用等宽字体，卡片式布局，轻量动效
