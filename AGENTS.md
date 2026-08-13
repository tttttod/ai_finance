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
│   │   ├── news/route.ts         # GET /api/news - 资讯数据
│   │   ├── report/route.ts       # GET /api/report - 获取每日完整报告
│   │   ├── sectors/route.ts      # GET /api/sectors - 获取所有板块列表
│   │   ├── sectors/[id]/route.ts # GET /api/sectors/:id - 获取单个板块详情
│   │   └── supabase-config/route.ts # GET /api/supabase-config - 获取Supabase配置
│   ├── page.tsx                  # 主页面：小程序MVP（4Tab：市场/研究/复盘/我的）
│   ├── login/page.tsx            # 用户登录/注册页面（Supabase Auth）
│   ├── mini/page.tsx             # 小程序MVP（备用路由）
│   ├── chat/page.tsx             # AI投研对话（万德/Choice风格）
│   ├── knowledge/page.tsx        # 知识库（Agent分析逻辑框架）
│   ├── bond-hunter/page.tsx      # 债券猎手：固收挑战游戏入口（/bond-hunter）
│   ├── layout.tsx                # 根布局（浅灰背景，小程序风格）
│   └── globals.css               # 全局样式
├── components/
│   ├── ui/                       # shadcn/ui 组件库
│   ├── auth-guard.tsx            # 路由守卫（未登录跳转 /login）
│   ├── game-maps/                # 游戏地图系统（10关关卡）
│   │   ├── game-data.ts          # 关卡类型定义 + 10关配置
│   │   ├── dialogue-data.ts      # 对话关卡数据（1/4/9关）
│   │   ├── quiz-data.ts          # 知识翻牌数据（2/6关）
│   │   ├── brain-data.ts         # 脑力配对数据（3/8关）
│   │   ├── minigame-data.ts      # 快速反应数据（5/7/10关）
│   │   ├── DialogueGame.tsx      # 对话闯关组件
│   │   ├── QuizGame.tsx          # 知识翻牌组件
│   │   ├── BrainGame.tsx         # 脑力配对组件
│   │   ├── MiniGame.tsx          # 快速反应组件
│   │   └── GameMapPlayer.tsx     # 地图主控制器
│   ├── bond-hunter/               # 债券猎手：固收挑战游戏（8关）
│   │   ├── types.ts              # 游戏类型定义
│   │   ├── game-engine.ts        # 游戏引擎（债券定价、久期计算、评分、市场生成）
│   │   ├── BondHunterGame.tsx    # 游戏主控制器
│   │   ├── GameUI.tsx            # 共享UI组件（GameHeader等）
│   │   ├── LandingPage.tsx       # 着陆页
│   │   ├── PlayerProfilePage.tsx # 玩家档案页
│   │   ├── Level1MacroRadar.tsx  # L1 宏观雷达
│   │   ├── Level2YieldCurve.tsx  # L2 收益率曲线
│   │   ├── Level3BondPricing.tsx # L3 债券定价实验室
│   │   ├── Level4DurationSniper.tsx # L4 久期狙击战
│   │   ├── Level5CreditDetective.tsx # L5 信用侦探
│   │   ├── Level6SpreadTrading.tsx  # L6 信用利差交易
│   │   ├── Level7PortfolioBuilder.tsx # L7 组合构建
│   │   ├── Level8MarketShock.tsx    # L8 市场危机模拟
│   │   ├── InvestmentCommittee.tsx  # 投资委员会（最终决策）
│   │   └── PerformanceReport.tsx    # 成绩单 + 排行榜
│   ├── ai-chat.tsx               # 全局AI对话浮动组件
│   ├── news-feed.tsx             # 资讯组件
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
    ├── mini-types.ts             # 小程序类型定义（16步工作流、12Agent团队）
    ├── mini-mock.ts              # 小程序Mock数据生成器
    ├── supabase-config-inject.tsx # Supabase配置注入Provider（客户端）
    ├── supabase-browser.ts       # Supabase浏览器客户端（单例+重试）
    ├── auth-context.tsx          # 全局认证Context（user/session/signOut）
    ├── coze-adapter.ts           # Coze API适配器（预留）
    ├── analysis-types.ts         # 分析工作台类型定义
    ├── analysis-data.ts          # 分析工作台模拟数据
    ├── mock-data.ts              # 每日报告模拟数据
    └── utils.ts                  # 通用工具函数
├── storage/
│   └── database/
│       └── supabase-client.ts    # Supabase服务端客户端（getSupabaseClient/getSupabaseCredentials）
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
- **用户认证** — Supabase Auth 邮箱密码登录/注册，路由守卫，登出（档案Tab底部）

### 交易员的正确之路 — 游戏地图系统
- **10 个关卡**，4 种游戏类型：对话闯关 (dialogue)、知识翻牌 (quiz)、脑力配对 (brain)、快速反应 (minigame)
- 关卡数据集中在 `src/components/game-maps/` 目录
- 进度通过 `src/lib/trader-road-progress.ts` 管理（localStorage，SSR 安全）
- 每关完成后解锁对应 Agent，下一关自动解锁
- `GameMapPlayer.tsx` 是统一入口，根据关卡类型分发到对应游戏组件
- 扩展新关卡：在 `game-data.ts` 的 `GAME_MAP_LEVELS` 添加配置，在对应 data 文件添加内容即可

### 债券猎手：Fixed Income Challenge (`/bond-hunter`)
- 固定收益投资模拟游戏，8个关卡 + 着陆页 + 档案页 + 投委会 + 成绩单
- 入口：游戏地图中点击"模型沼泽"位置，在新标签页打开
- 关卡流程：宏观雷达 → 收益率曲线 → 债券定价 → 久期狙击 → 信用侦探 → 利差交易 → 组合构建 → 市场危机
- 游戏引擎在 `src/components/bond-hunter/game-engine.ts`，包含债券定价、久期/凸性计算、评分系统
- 游戏状态通过 localStorage 持久化，支持断点续玩
- 排行榜数据存储在 localStorage
- 视觉风格：深色金融终端（Bloomberg Terminal 风格）

## 数据说明

当前使用 `src/lib/mock-data.ts` 提供模拟数据，包含 8 个热门板块（传媒、计算机、食品饮料、汽车、家用电器、农林牧渔、商贸零售、社会服务）及宏观/基本面/技术面/荐股追踪的完整数据。后续可替换为真实 Tushare API 调用。

## 设计规范

详见 `DESIGN.md`，核心要点：
- 暖白底色 (#FAFAF9)，A股红 (#DC2626) 表示涨/资金流入，青绿 (#0D9488) 表示跌/资金流出
- 数字使用等宽字体，卡片式布局，轻量动效
