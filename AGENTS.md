# AGENTS.md

## 开发工作流（Spec → Code）

**所有功能改动必须遵循以下流程：**
1. 先阅读 `SPEC.md` 了解当前产品全貌
2. 在 `SPEC.md` 中更新相关规格（新增/修改功能描述）
3. 用户确认 Spec 变更
4. 按 Spec 修改代码
5. 更新 `SPEC.md` 的变更日志

**禁止跳过 Spec 直接改代码。**

## 项目概览

AI 投研平台 — AI 驱动的智能投研工具，提供每日市场数据看板 + AI Agent 引导的结构化基本面分析。

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
│   │   ├── chat/route.ts         # POST /api/chat - AI对话（SSE流式）
│   │   ├── report/route.ts       # GET /api/report - 获取每日完整报告
│   │   ├── sectors/route.ts      # GET /api/sectors - 获取所有板块列表
│   │   └── sectors/[id]/route.ts # GET /api/sectors/:id - 获取单个板块详情
│   ├── analysis/page.tsx         # AI分析工作台（左右分栏+4步工作流）
│   ├── knowledge/page.tsx        # 知识库（Agent分析逻辑框架）
│   ├── layout.tsx                # 根布局（Header + Footer + AI浮动按钮）
│   ├── page.tsx                  # 首页仪表盘（Tab切换5大模块）
│   └── globals.css               # 全局样式 + 深色科技主题
── components/
│   ├── ui/                       # shadcn/ui 组件库
│   ├── ai-chat.tsx               # 全局AI对话浮动组件
│   ├── market-overview.tsx       # 市场概览条
│   ├── research-summary.tsx      # 研报观点总结
│   ├── macro-summary.tsx         # 宏观观点总结
│   ├── macro-brief.tsx           # 宏观热点快照
│   ├── fundamental-section.tsx   # 基本面分析
│   ├── technical-section.tsx     # 技术面分析
│   ├── stock-tracking.tsx        # 荐股追踪
│   ├── sector-card.tsx           # 板块卡片
│   └── sector-detail.tsx         # 板块详情
└── lib/
    ├── types.ts                  # 数据类型定义
    ├── analysis-types.ts         # 分析工作台类型定义
    ├── analysis-data.ts          # 分析工作台模拟数据
    ├── mock-data.ts              # 每日报告模拟数据
    └── utils.ts                  # 通用工具函数
```

## 功能模块

### 页面一：每日研报看板 (`/`)
1. **研报观点总结** — 综合基本面+技术面+板块数据的整体观点，含核心主题、机会亮点、风险提示
2. **宏观分析** — 宏观观点总结（利好/利空/中性判断）+ 中外财经热点快照详情
3. **基本面分析** — 机构研报共识（覆盖机构数、评级、目标价、关键观点）
4. **技术面分析** — MA20/MA60 均线、20日支撑/压力位、趋势判断、分析师目标价空间
5. **荐股追踪** — 历史荐股累计涨跌幅表现，按日期分组，含胜率统计

### 页面二：AI 分析工作台 (`/analysis`)
- AI Agent 引导的 4 步结构化基本面分析流程
- 左侧交互面板 + 右侧全高 AI 对话
- 会话持久化（localStorage）

### 页面三：知识库 (`/knowledge`)
- Agent 分析逻辑框架展示（5个维度）

### 全局功能
- **AI 浮动对话** — 右下角浮动按钮，自由对话问答

## 数据说明

当前使用 `src/lib/mock-data.ts` 提供模拟数据，包含 8 个热门板块（传媒、计算机、食品饮料、汽车、家用电器、农林牧渔、商贸零售、社会服务）及宏观/基本面/技术面/荐股追踪的完整数据。后续可替换为真实 Tushare API 调用。

## 设计规范

详见 `DESIGN.md`，核心要点：
- 暖白底色 (#FAFAF9)，A股红 (#DC2626) 表示涨/资金流入，青绿 (#0D9488) 表示跌/资金流出
- 数字使用等宽字体，卡片式布局，轻量动效
