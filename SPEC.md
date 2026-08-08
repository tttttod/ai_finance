# AI 投研平台 — 产品规格说明书 (Spec)

> **工作流规则**：所有功能改动必须先更新本 Spec 文档，经确认后再按 Spec 修改代码。
> 最后更新：2026-08-03
> 本次变更：第三Tab升级为「通用股票预测模型」，支持因子选择、随机拟合测试、蒙特卡洛模拟

---

## 1. 产品概述

**产品名称**：AI 投研平台（Intelligent Research Platform）

**产品定位**：AI 投资研究辅助系统（不是荐股系统）。帮助普通投资者按照专业金融机构的投研流程完成 A 股研究，输出结构化研究结论、风险提示和复盘任务。

**目标用户**：覆盖短线、波段、长期三类投资者。用户必须先选择投资风格，不同风格对应不同分析重点和因子权重。

**技术栈**：
- Framework: Next.js 16 (App Router)
- Core: React 19 + TypeScript 5
- UI: shadcn/ui + Tailwind CSS 4
- AI: coze-coding-dev-sdk (doubao-seed-2-0-lite)
- 包管理: pnpm

---

## 2. 页面结构

### 2.1 页面清单

| 路由 | 页面名称 | 功能定位 | 状态 |
|------|---------|---------|------|
| `/` | A股可视化投研Agent | 小程序MVP主页面，4Tab布局（市场/研究/模型/我的） | ✅ 已完成 |
| `/mini` | 小程序MVP（备用） | 与主页面相同的小程序MVP | ✅ 已完成 |
| `/chat` | AI 投研对话 | 左侧信息面资讯 + 右侧大面积AI对话 | ✅ 已完成 |
| `/knowledge` | 知识库 | 展示 Agent 分析逻辑框架 | ✅ 已完成 |
| `/analysis` | AI 分析工作台 | 已弃用 | 已弃用 |

### 2.2 全局布局

- **背景**：浅灰 #F5F5F7（小程序风格）
- **主页面**：移动端优先，max-w-md 居中，底部 4 Tab 导航
- **小程序风格**：模拟 iOS 状态栏，卡片式布局，圆角 ≤ 8px

---

## 3. 功能模块详细规格

### 3.1 每日研报看板 (`/`)

**数据源**：`GET /api/report` → 返回 `DailyReport` 对象

**Tab 导航**（5 个模块）：

#### Tab 1: 研报观点总结（默认）
- **组件**：`ResearchSummarySection`
- **展示内容**：
  - 综合观点（整体市场判断文字）
  - 核心主题列表（每个主题含：标题、看多/看空/中性标签、摘要、关联个股）
  - 机会亮点（编号列表）
  - 风险提示（编号列表）
- **数据来源**：`report.researchSummary`

#### Tab 2: 宏观分析
- **组件**：`MacroSummarySection` + `MacroBriefSection`
- **展示内容**：
  - 宏观观点总结（整体判断 + 关键要点列表，每个要点含利好/利空/中性标签）
  - 财经热点快照详情（新闻列表：标题、来源、主题标签、观点、关键数据、市场含义）
- **数据来源**：`report.macroSummary` + `report.macroBrief`

#### Tab 3: 基本面分析
- **组件**：`FundamentalSection`
- **展示内容**：
  - 共识股列表表格（排名、股票名称/代码、覆盖机构数、最新评级、目标价区间）
  - 每只共识股详情卡片（共识强度、评级、目标价、关键观点列表含标签）
- **数据来源**：`report.fundamental.consensusStocks`

#### Tab 4: 技术面分析
- **组件**：`TechnicalSection`
- **展示内容**：
  - 每只样本股的技术分析卡片（收盘价/涨跌幅、均线结构 MA20/MA60、趋势判断、支撑/压力位、分析师目标价空间、PE/PB/换手率、技术面结论文字）
- **数据来源**：`report.technical.analysis`

#### Tab 5: 荐股追踪
- **组件**：`StockTrackingSection`
- **展示内容**：
  - 按日期分组的荐股表现表格（代码、股票、荐股日收盘价、最新收盘价、累计涨跌幅、覆盖机构数、研报数）
  - 汇总统计（胜率、平均涨跌幅）
- **数据来源**：`report.stockTracking`

#### 市场概览条（所有 Tab 顶部）
- **组件**：`MarketOverviewBar`
- **展示内容**：上证指数/涨跌幅、深证指数/涨跌幅、成交额、上涨板块数、下跌板块数、热门板块数
- **数据来源**：`report.overview`

---

### 3.2 AI 投研对话页 (`/chat`)

**布局**：参照万德/Choice 金融终端，左侧信息面资讯 + 右侧大面积 AI 对话

```
┌──────────────────────────┬───────────────────────────────────────┐
│                          │                                       │
│  信息面资讯               │   AI 投研对话                          │
│  (~380px)                │   (剩余宽度，大面积)                    │
│                          │                                       │
│  ┌─ 实时快讯 ──────────┐  │   ┌─────────────────────────────┐    │
│  │ · 央行降准50bp       │  │   │ Agent: 你好！我是投研顾问... │    │
│  │ · 美联储维持利率不变  │  │   │                             │    │
│  │ · 北向净流入82亿     │  │   │ [选项A: 传媒 (理由...)]     │    │
│  └─────────────────────┘  │   │ [选项B: 电子 (理由...)]     │    │
│                          │   │                             │    │
│  ┌─ 研报摘要 ──────────┐  │   │ 用户: 我看好传媒            │    │
│  │ · 中信: 科技成长...   │  │   │                             │    │
│  │ · 招商: 消费复苏...   │  │   │ Agent: 好的，传媒板块...    │    │
│  │ · 华泰: 红利资产...   │  │   │ [分析结果卡片]              │    │
│  └─────────────────────┘  │   │                             │    │
│                          │   │                             │    │
│  ┌─ 宏观快照 ──────────┐  │   │                             │    │
│  │ · Warsh: 通胀无容忍  │  │   │                             │    │
│  │ · 原油大涨           │  │   └─────────────────────────────┘    │
│  └─────────────────────┘  │                                       │
│                          │   ┌─────────────────────────────┐    │
│  ┌─ 公告速递 ──────────  │   │ 输入框 + 发送按钮            │    │
│  │ · 北方华创: 业绩预增  │  │   └─────────────────────────────┘    │
│  │ · 中芯国际: 产能扩张  │  │                                       │
│  └─────────────────────┘  │                                       │
└──────────────────────────┴───────────────────────────────────────┘
```

#### 左侧：信息面资讯

**设计参考**：万德/Choice 的资讯面板，信息密度高，分类清晰

| 模块 | 内容 | 数据来源 | 交互 |
|------|------|---------|------|
| 实时快讯 | 市场重要新闻（央行、美联储、北向资金等） | `macroBrief.news` | 点击可让 Agent 解读 |
| 研报摘要 | 策略研报核心观点（标题+方向+关联行业） | `strategyViewpoints` | 点击可让 Agent 深入分析 |
| 宏观快照 | 中外财经热点（标题+来源+市场含义） | `macroBrief.news` | 点击可让 Agent 分析影响 |
| 公告速递 | 重要公司公告（业绩预增、产能扩张等） | 后续接入真实数据 | 点击可让 Agent 解读 |

**样式**：
- 每个模块带标题栏，可折叠/展开
- 每条资讯显示时间戳
- 重要资讯带高亮标记（红色/蓝色）
- 点击任意资讯 → 自动发送到右侧对话区，Agent 开始分析

#### 右侧：AI 投研对话（大面积）

**Agent 12 步工作流**（集成在对话流程中）：

| 步骤 | 名称 | Agent 行为 | 对话展示 |
|------|------|-----------|----------|
| 1 | 明确研究问题 | 确认用户研究目标和投资风格 | 风格选择卡片（短线/波段/长期） |
| 2 | 收集数据 | 读取左侧资讯 + 研报/宏观数据 | 数据摘要卡片 |
| 3 | 市场环境分析 | 分析大盘趋势、资金面、情绪面 | 市场环境评估卡片 |
| 4 | 行业和板块分析 | 筛选候选行业，给出选项 | 行业选项卡片（含理由+风险） |
| 5 | 公司基本面分析 | 分析机构共识、财务数据 | 基本面数据卡片 |
| 6 | 估值分析 | PE/PB/PEG 等估值指标 | 估值分位卡片 |
| 7 | 技术面和资金面分析 | 均线/趋势/资金流向 | 技术面结论卡片 |
| 8 | 新闻公告与情绪分析 | 分析近期新闻和公告影响 | 情绪分析卡片 |
| 9 | 多因子评分 | 按投资风格权重计算综合评分 | 因子评分雷达图/表格 |
| 10 | 三情景预测 | 乐观/中性/悲观三种情景 | 情景预测卡片 |
| 11 | 生成研究结论 | 输出结构化研究报告 | 标准格式研究报告卡片 |
| 12 | 建立复盘任务 | 设定复盘日期、指标、判断标准 | 复盘计划卡片 |

**每步交互**：Agent 给出多个选项（含理由+风险），用户点击选择引导方向。

#### 投资风格与因子权重

| 因子 | 短线 | 波段 | 长期 |
|------|------|------|------|
| 资金流/资金持续性 | 25% | 15% | - |
| 技术趋势 | 25% | 15% | - |
| 板块热度/市场情绪 | 20%+10% | - | - |
| 事件催化 | 15% | 10% | - |
| 行业景气度 | - | 20% | - |
| 基本面趋势/财务质量 | - | 20% | 25% |
| 估值分位/合理性 | - | 20% | 15% |
| 商业模式与竞争格局 | - | - | 25% |
| 成长空间 | - | - | 20% |
| 现金流质量 | - | - | 10% |
| 短期市场因素 | - | - | 5% |

#### 标准输出格式

Agent 在第 11 步输出的研究报告必须遵循以下格式：

```
【研究对象】
股票/板块：
投资风格：
研究周期：

【核心结论】
结论方向：
置信度：
适合人群：

【核心逻辑】
1.
2.
3.

【关键证据】
1.
2.
3.

【情景预测】
乐观情景：
中性情景：
悲观情景：

【主要风险】
1.
2.
3.

【需要继续观察的指标】
1.
2.
3.

【复盘计划】
复盘日期：
复盘指标：
判断标准：

提示：以上内容仅供研究参考，不构成投资建议。
```

#### 行为规则（强制）

- 不得承诺收益
- 不得直接输出确定性买卖指令
- 不得跳过分析过程直接给结论
- 必须说明数据来源和更新时间
- 必须输出风险提示
- 必须输出复盘计划
- 每次回答最后必须提示：以上内容仅供研究参考，不构成投资建议

- **入口**：右下角浮动按钮（蓝青渐变圆形）
- **面板**：400x560px 聊天窗口
- **功能**：自由对话，基于当日市场数据回答金融问题
- **System Prompt**：包含当日市场摘要（热门板块、共识股、宏观环境、核心主题）
- **免责声明**：底部显示"仅供参考，不构成投资建议"

---

## 4. API 接口规格

### 4.1 接口清单

| 方法 | 路径 | 功能 | 状态 |
|------|------|------|------|
| GET | `/api/report` | 获取每日完整报告（含全部模块数据） | ✅ |
| GET | `/api/sectors` | 获取所有板块列表 | ✅ |
| GET | `/api/sectors/[id]` | 获取单个板块详情（含涨幅/市值排行） | ✅ |
| POST | `/api/chat` | AI 对话（支持流式 SSE 输出） | ✅ |
| GET | `/api/news` | 获取信息面资讯（快讯/研报摘要/宏观快照/公告） | 待实现 |

### 4.2 `/api/chat` 请求格式

```json
{
  "messages": [{ "role": "user" | "assistant", "content": "..." }],
  "context": {
    "currentStep": "info_processing" | "evidence_org" | "hypothesis" | "fundamental" | "technical" | "prediction",
    "pipelineProgress": {
      "info_processing": "completed" | "current" | "pending",
      "evidence_org": "completed" | "current" | "pending",
      "hypothesis": "completed" | "current" | "pending",
      "fundamental": "completed" | "current" | "pending",
      "technical": "completed" | "current" | "pending",
      "prediction": "completed" | "current" | "pending"
    },
    "investmentStyle": ["成长", "价值"],
    "riskTolerance": "conservative" | "moderate" | "aggressive",
    "holdingPeriod": "short" | "medium" | "long",
    "selectedIndustries": ["电子", "AI算力"],
    "selectedStocks": ["北方华创"],
    "selectedViewpoints": ["科技创新"],
    "evidenceChain": {
      "supporting": ["..."],
      "opposing": ["..."],
      "pending": ["..."]
    },
    "hypotheses": [{ "type": "industry", "title": "...", "description": "..." }]
  }
}
```

### 4.3 `/api/chat` 响应格式

SSE 流式响应，每行格式：
```
data: {"content": "文本片段"}
```
结束标记：
```
data: [DONE]
```

### 4.4 `GET /api/news` 信息面资讯

**响应格式：**
```json
{
  "success": true,
  "data": {
    "flashes": [NewsItem],
    "research": [NewsItem],
    "macro": [NewsItem],
    "announcements": [NewsItem]
  }
}
```

当前使用 `mockNewsFeed` 模拟数据。后续可接入：
- 财联社/东方财富快讯 API
- Tushare 研报接口
- 新闻 RSS 聚合


### 4.5 `POST /api/chat` AI 研究对话（增强版）

**请求格式：**
```json
{
  "messages": [{"role": "user"|"assistant", "content": "string"}],
  "context": {
    "currentStep": "step1"|"step2"|...|"step12",
    "investmentStyle": "short"|"swing"|"long",
    "riskTolerance": "conservative"|"moderate"|"aggressive",
    "holdingPeriod": "short"|"medium"|"long",
    "selectedIndustries": ["string"],
    "selectedStocks": ["string"],
    "researchTarget": "string"
  }
}
```

**响应：** SSE 流式输出，包含：
- `content`: 文本内容
- `options`: 选项列表（每步给出选项+理由+风险）
- `metadata`: 当前步骤、因子评分、情景预测等结构化数据
- `report`: 第 11 步输出的完整研究报告（标准格式）
- `reviewTask`: 第 12 步输出的复盘任务
---

## 5. 数据模型

### 5.1 核心类型

```
DailyReport
├── overview: MarketOverview        // 市场概览
── hotSectors: SectorSummary[]     // 热门板块
├── macroSummary: MacroSummary      // 宏观观点总结
── macroBrief: MacroBriefItem[]    // 宏观热点快照
├── fundamental: FundamentalData    // 基本面数据
│   ── consensusStocks: ConsensusStock[]
├── technical: TechnicalData        // 技术面数据
│   └── analysis: TechnicalAnalysis[]
├── stockTracking: StockTrackingGroup[]  // 荐股追踪
└└── researchSummary: ResearchSummary     // 研报观点总结

### 5.2 信息面资讯类型

```
NewsFeed
├── flashNews: FlashNews[]          // 实时快讯
├── researchDigest: ResearchDigest[] // 研报摘要
├── macroSnapshot: MacroSnapshot[]   // 宏观快照
└── announcements: Announcement[]    // 公告速递

FlashNews {
  id: string, title: string, source: string,
  publishTime: string, impact: "positive" | "negative" | "neutral",
  relatedSectors: string[], summary: string
}

ResearchDigest {
  id: string, title: string, institution: string,
  publishDate: string, rating: string, targetPrice?: number,
  relatedStocks: string[], keyPoints: string[]
}

MacroSnapshot {
  id: string, title: string, source: string,
  publishDate: string, topic: string, marketImpact: string
}

Announcement {
  id: string, stockCode: string, stockName: string,
  title: string, publishTime: string, type: string
}
```
    ├── overallView
    ├── coreThemes: CoreTheme[]
    ├── opportunities: string[]
    └── risks: string[]
```

### 5.2 分析工作台类型

```
AnalysisSession
├── currentStep: AnalysisStep
├── messages: ChatMessage[]
├── investmentStyle: string[]
── riskTolerance: string
├── holdingPeriod: string
├── selectedViewpoints: string[]
├── selectedIndustries: string[]
└── confirmedSteps: string[]

StrategyViewpoint { id, title, summary, direction, source, relatedIndustries }
IndustryCandidate { id, name, confidence, reasons, supportingEvidence, opposingEvidence, pendingEvidence }
StockCandidate { code, name, industry, reasons, risks, currentPrice, targetPrice, institutionCount, potentialUpside }
AnalysisHypothesis { type, title, description, trigger, evidenceChain, observer, invalidCondition, reviewCycle }
RiskFactor { type, title, description }
```

### 5.3 AI 对话管线类型（`/chat` 页面用）

```
ChatSession
├── currentStep: PipelineStep          // 当前管线步骤
├── pipelineProgress: Record<PipelineStep, StepStatus>  // 每步状态
├── messages: ChatMessage[]            // 对话历史
├── investmentStyle: string[]          // 投资风格
── riskTolerance: string              // 风险承受
├── holdingPeriod: string              // 持仓周期
├── selectedViewpoints: string[]       // 已选观点方向
├── selectedIndustries: string[]       // 已选行业
├── selectedStocks: string[]           // 已选个股
├── evidenceChain: EvidenceChain       // 证据链
└── hypotheses: AnalysisHypothesis[]   // 生成的假设

PipelineStep = "info_processing" | "evidence_org" | "hypothesis" | "fundamental" | "technical" | "prediction"
StepStatus = "completed" | "current" | "pending"

EvidenceChain
├── supporting: string[]    // 支持证据
├── opposing: string[]      // 反对证据
└── pending: string[]       // 待验证证据

ChatOption                          // 对话中的可选项
├── id: string
├── label: string                   // 选项名称
├── reason: string                  // 推荐理由
├── risk: string                    // 风险说明
├── data?: object                   // 附加结构化数据
└── action: "select" | "skip"       // 用户操作类型
```

### 5.5 Agent 研究工作台类型（12 步工作流）

```
InvestmentStyle = "short" | "swing" | "long"  // 短线/波段/长期

ResearchStep =
  | "step1_question"      // 明确研究问题
  | "step2_data"          // 收集数据
  | "step3_market"        // 市场环境分析
  | "step4_industry"      // 行业和板块分析
  | "step5_fundamental"   // 公司基本面分析
  | "step6_valuation"     // 估值分析
  | "step7_technical"     // 技术面和资金面分析
  | "step8_sentiment"     // 新闻公告与情绪分析
  | "step9_scoring"       // 多因子评分
  | "step10_scenario"     // 三情景预测
  | "step11_conclusion"   // 生成研究结论
  | "step12_review"       // 建立复盘任务

FactorWeight                              // 因子权重配置
├── style: InvestmentStyle
── weights: Record<string, number>       // 因子名 -> 权重百分比

ScenarioPrediction                        // 情景预测
├── optimistic: { price: number; return: number; logic: string }
├── neutral: { price: number; return: number; logic: string }
└── pessimistic: { price: number; return: number; logic: string }

ResearchReport                            // 标准研究报告
├── target: string                        // 研究对象
├── style: InvestmentStyle
├── period: string                        // 研究周期
├── conclusion: { direction: string; confidence: number; audience: string }
├── logic: string[]                       // 核心逻辑（3条）
├── evidence: string[]                    // 关键证据（3条）
├── scenarios: ScenarioPrediction
├── risks: string[]                       // 主要风险（3条）
├── watchIndicators: string[]             // 需要继续观察的指标
└── reviewPlan: { date: string; indicators: string[]; criteria: string }

ReviewTask                                // 复盘任务
├── id: string
├── target: string
├── reviewDate: string
├── indicators: string[]
├── criteria: string
└── status: "pending" | "completed"
```

### 5.4 信息面资讯类型（`/chat` 页面左侧用）

```
NewsItem                              // 资讯条目
── id: string
├── type: "flash" | "research" | "macro" | "announcement"
├── title: string
├── summary: string                   // 摘要（50字内）
├── source: string                    // 来源（财联社/中信证券/WSJ等）
├── publishTime: string               // ISO时间
├── tags: string[]                    // 标签（行业/主题）
├── relevance: "high" | "medium" | "low"  // A股相关性
├── sentiment: "positive" | "negative" | "neutral"  // 情绪
├── url?: string                      // 原文链接
└── data?: object                     // 附加数据（股价/指标等）

NewsFeed                              // 信息面数据
├── flashes: NewsItem[]               // 实时快讯
├── research: NewsItem[]              // 研报摘要
├── macro: NewsItem[]                 // 宏观快照
└── announcements: NewsItem[]         // 公告速递
```

---

## 6. 设计规范

详见 `DESIGN.md`，核心要点：
- **主题**：深色科技风格，深蓝黑底色 (#0a0e1a)
- **品牌色**：蓝青渐变 from-blue-500 to-cyan-400
- **涨/正向**：亮红 #ef4444（带光晕）
- **跌/负向**：青绿 #2dd4a8
- **卡片**：#0d1220，border 1px rgba(59,130,246,0.15)
- **字体**：中文系统默认，数字等宽字体
- **动效**：卡片淡入、脉冲光效、双重旋转加载器、悬停微抬升
- **禁忌**：不用暖白主题、不用霓虹过度效果、不用圆角>8px、不用K线图、不用emoji

---

## 7. 当前数据状态

- **数据来源**：`src/lib/mock-data.ts`（模拟数据）
- **板块数据**：8 个热门板块（传媒、计算机、食品饮料、汽车、家用电器、农林牧渔、商贸零售、社会服务）
- **共识股**：中国人寿、桐昆股份、安井食品
- **技术面样本**：同上 3 只
- **荐股追踪**：2 组历史数据
- **后续计划**：接入真实 Tushare API + 真实研报数据源

---

## 8. 变更日志

| 日期 | 变更内容 |
|------|---------|
| 2026-08-02 | 项目初始化，实现板块追踪 Web 应用 |
| 2026-08-02 | 补齐宏观分析、基本面、技术面、荐股追踪四大模块 |
| 2026-08-02 | 新增研报观点总结和宏观观点总结，重排 Tab 顺序 |
| 2026-08-02 | 新增 AI 金融顾问 Agent（浮动对话） |
| 2026-08-03 | 升级为科技感深色主题，标题改为 AI 投研平台 |
| 2026-08-03 | 新增 AI 分析工作台（4 步工作流 + 会话持久化）和知识库页面 |
| 2026-08-03 | 建立 Spec → Code 工作流规范 |
| 2026-08-03 | 重构 AI 对话页：左侧边栏工作流进度 + 对话内嵌选项交互 + 6 步分析管线 |
| 2026-08-03 | 重构为万德/Choice 风格：左侧信息面资讯 + 右侧大面积 AI 对话，分析管线集成到对话流程 |
| 2026-08-03 | 完整产品设计：12 步 Agent 工作流 + 3 种投资风格因子权重 + 标准研究报告格式 + 复盘系统 + 行为规则 |

---

## 6. 微信小程序 MVP（「A股可视化投研Agent」）

### 6.1 产品定位
面向 A 股普通投资者的 AI 投研辅助小程序，不是荐股软件，不是自动交易工具。帮助散户按专业金融机构投研流程完成研究。

### 6.2 页面结构（4 个底部 Tab）

| Tab | 页面 | 核心功能 |
|-----|------|---------|
| 市场 | `/mini/market` | 今日 AI 摘要、指数卡片、板块热度榜、个股异动榜、事件时间轴、AI推荐研究标的 |
| 研究 | `/mini/research` | 股票输入、风格选择、16 步工作流、多 Agent 分析卡片、因子评分、辩论卡、情景预测 |
| 模型 | `/mini/model` | 通用股票预测模型、因子选择、随机拟合测试、蒙特卡洛模拟、模型总结 |
| 我的 | `/mini/profile` | 关注股票、默认风格、历史档案、风险教育、免责声明 |

### 6.3 Agent 团队（12 个角色）

| 角色 | 职责 |
|------|------|
| Lead Agent / 研究总控 | 确认问题、拆解任务、调度流程、合并输出 |
| 数据 Agent | 整理行情/财务/估值/行业/新闻数据，标记来源和可信度 |
| 市场环境 Agent | 分析大盘趋势、成交量、赚钱效应、风险偏好 |
| 行业与政策 Agent | 分析行业景气度、板块热度、政策和产业逻辑 |
| 公司基本面 Agent | 分析收入/利润/ROE/毛利率/现金流/负债率/财务红旗 |
| 估值建模 Agent | 分析 PE/PB/PS/PEG/历史分位/同行估值/估值区间 |
| 技术与资金 Agent | 分析趋势/均线/成交量/换手率/波动率/支撑压力/资金流 |
| 新闻公告与情绪 Agent | 分析公告/财报/政策/行业新闻/市场情绪 |
| Bull Agent / 正方研究员 | 提出看多逻辑和上涨驱动 |
| Bear Agent / 反方研究员 | 提出看空逻辑、反证和失效条件 |
| Risk Officer / 风险官 | 检查估值/流动性/情绪拥挤/财务/政策/合规风险 |
| Research Manager / 研究经理 | 综合所有意见，输出最终研究结论和复盘任务 |

### 6.4 16 步强制工作流

| 步骤 | 名称 | 展示形式 |
|------|------|---------|
| 1 | 确认研究问题 | 输入确认卡片 |
| 2 | 确认投资风格和周期 | 风格选择卡片 |
| 3 | 数据收集与缺失检查 | 数据清单卡片（含缺失标记） |
| 4 | 市场环境分析 | 市场环境评估卡片 |
| 5 | 行业与政策分析 | 行业分析卡片 |
| 6 | 公司基本面分析 | 基本面数据卡片 |
| 7 | 估值分析 | 估值分位卡片 |
| 8 | 技术与资金分析 | 技术面结论卡片 |
| 9 | 新闻公告与情绪分析 | 情绪分析卡片 |
| 10 | 多因子评分 | 因子评分雷达图 + 条形图 |
| 11 | Bull 正方观点 | 正方辩论卡（绿色） |
| 12 | Bear 反方观点 | 反方辩论卡（红色） |
| 13 | 风险官检查 | 风险检查卡（橙色） |
| 14 | 三情景预测 | 情景预测卡（乐观/中性/悲观） |
| 15 | 研究经理最终结论 | 标准格式研究报告卡 |
| 16 | 复盘任务生成 | 复盘计划卡 |

### 6.5 Mock 数据层设计

```
src/lib/mini-mock.ts          # 小程序 Mock 数据
src/lib/mini-agent.ts         # Mock Agent 工作流引擎
src/lib/mini-types.ts         # 小程序类型定义
```

Mock Agent 返回与 Coze API 一致的 JSON 结构：
```json
{
  "step": 10,
  "agent": "scoring_agent",
  "content": "多因子评分完成",
  "data": {
    "scores": { "资金流": 85, "技术趋势": 72, ... },
    "totalScore": 78
  },
  "options": [...],
  "metadata": { "source": "mock", "timestamp": "..." }
}
```

### 6.6 Coze API 适配模块（预留）

```
src/lib/coze-adapter.ts       # Coze API 适配器
```

后续只需替换 API Key、Bot ID 或 Workflow ID 即可接入真实 Coze。

### 6.7 视觉设计规范

- 背景：高级浅灰 `#F5F5F7` 或深色投研终端 `#0A0E1A`
- 卡片圆角：≤ 8px
- A 股红（涨）：`#DC2626`
- A 股绿（跌）：`#0D9488`
- 风险/警告：`#F59E0B`（琥珀色）
- 信息提示：`#3B82F6`（蓝色）
- 字体：数字用等宽字体，中文用系统默认
- 风格：高级、克制、可信、数据感强，不做营销页

### 6.8 变更日志

| 日期 | 变更内容 |
|------|---------|
| 2026-08-03 | 小程序 MVP 产品设计：4 Tab + 12 Agent 团队 + 16 步工作流 + Mock 数据层 + Coze 适配预留 |
| 2026-03-13 | 接入 Tushare 每日市场快照（后台刷新+前端读缓存模式）；新增 POST /api/admin/refresh-market、GET /api/market-snapshot、POST /api/feedback 接口；/api/chat 改用快照数据替代写死市场数据；/api/sectors 和 /api/report 兼容快照；市场 Tab 接入快照数据并显示数据日期/来源/stale 标记；去掉市场页"加入研究线索"功能；研究 Tab 增加"重新选择标的"返回按钮；"我的"页增加用户反馈功能（固定问题多选+主观建议+1-5评分）；新增 docs/database.sql 和 docs/LIVE_DATA.md |
