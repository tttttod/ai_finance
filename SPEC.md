# AI 投研平台 — 产品规格说明书 (Spec)

> **工作流规则**：所有功能改动必须先更新本 Spec 文档，经确认后再按 Spec 修改代码。
> 最后更新：2026-08-03
> 本次变更：重构 AI 对话页，将分析工作流融入对话，左侧边栏显示管线进度

---

## 1. 产品概述

**产品名称**：AI 投研平台（Intelligent Research Platform）

**产品定位**：面向个人投资者的 AI 驱动智能投研工具，提供从宏观到个股的结构化分析能力。通过 AI Agent 引导用户完成完整的基本面分析流程，同时提供每日市场数据看板。

**目标用户**：对 A 股投资有兴趣的个人投资者，希望借助 AI 辅助进行投研决策。

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
| `/` | 每日研报看板 | 展示每日市场数据和研报摘要 | ✅ 已完成 |
| `/chat` | AI 对话分析页 | Agent 对话 + 左侧工作流管线，逐步引导分析 |  重构中 |
| `/analysis` | AI 分析工作台 | AI Agent 引导的结构化基本面分析（左右分栏） | ✅ 已完成（待后续整合） |
| `/knowledge` | 知识库 | 展示 Agent 分析逻辑框架 | ✅ 已完成 |

### 2.2 全局布局

- **Header**：品牌 Logo（AI 投研平台）+ 实时连接状态 + 数据更新时间
- **Footer**：免责声明 + 版权信息
- **全局 AI 对话**：右下角浮动按钮，点击展开聊天面板（独立于分析工作台）
- **背景**：深色科技主题（深蓝黑 #0a0e1a），动态渐变光效 + 网格纹理

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

### 3.2 AI 对话分析页 (`/chat`)

**布局**：左侧边栏 + 右侧对话区
- **左侧边栏**（~280px）：Agent 分析管线进度，显示 6 个步骤的完成状态
- **右侧对话区**（剩余宽度）：AI Agent 对话，包含结构化选项卡片和分析结果

#### Agent 分析管线（6 步）

| 步骤 | 标识 | 触发条件 | Agent 行为 | 用户交互 |
|------|------|---------|-----------|---------|
| ① 信息处理 | `info_processing` | 用户提问或点击"开始分析" | 读取研报/新闻/宏观快照，提取关键信息 | 查看信息摘要，可补充关注方向 |
| ② 证据组织 | `evidence_org` | 信息处理完成 | 构建支持/反对/待验证证据链 | 确认证据链，可补充或质疑 |
| ③ 假设生成 | `hypothesis` | 证据组织完成 | 生成行业/公司/风格/事件假设 | 选择感兴趣的假设方向 |
| ④ 基本面分析 | `fundamental` | 假设确认 | 分析机构共识、评级、目标价、关键观点 | 查看基本面数据，可深入个股 |
| ⑤ 技术面分析 | `technical` | 基本面完成 | 分析均线、支撑压力、趋势、目标价空间 | 查看技术面结论，可调整关注点 |
| ⑥ 综合预测 | `prediction` | 技术面完成 | 输出投资标的推荐 + 风险 + 复盘计划 | 查看完整报告，可重新开始 |

#### 左侧边栏设计

```
┌─────────────────────┐
│  AI 投研平台         │
│  ─────────────────  │
│                     │
│  分析管线            │
│                     │
│  ● ① 信息处理  ✓    │  ← 已完成（绿色勾）
│  ● ② 证据组织  ✓    │
│  ● ③ 假设生成  →    │  ← 当前步骤（蓝色脉冲）
│  ○ ④ 基本面分析      │  ← 待执行（灰色）
│  ○ ⑤ 技术面分析      │
│  ○ ⑥ 综合预测        │
│                     │
│  ─────────────────  │
│  投资偏好            │
│  风格: 成长 价值     │
│  风险: 稳健          │
│  周期: 中线          │
│                     │
│  ─────────────────  │
│  已选方向            │
│  · 传媒              │
│  · 电子              │
│                     │
│  [重新开始分析]      │
└─────────────────────┘
```

#### 对话区交互模式

**每个步骤中，Agent 在对话中展示结构化选项卡片：**

```
Agent: 根据策略研报，以下行业近期被重点看好：

┌──────────────────────────────────────────────┐
│ 选项 A: 传媒                                  │
│ 理由: 连续2日主力资金净流入64.84亿，领涨股...   │
│ 风险: 估值偏高，机构观点拥挤                   │
│                    [选择] [跳过]               │
├──────────────────────────────────────────────┤
│ 选项 B: 电子                                  │
│ 理由: 半导体景气上行，北方华创涨停...           │
│ 风险: 技术面高位回撤                           │
│                    [选择] [跳过]               │
├──────────────────────────────────────────────┤
│ 选项 C: 医药生物                               │
│ 理由: 创新药政策利好，机构覆盖提升...           │
│ 风险: 行业景气逻辑尚未被业绩验证               │
│                    [选择] [跳过]               │
└──────────────────────────────────────────────┘
```

- 用户点击 **[选择]** → Agent 将该选项纳入分析，进入下一步
- 用户点击 **[跳过]** → Agent 排除该选项，继续展示其他候选
- 用户可**自由输入**补充条件（如"我只看成长股"）

**分析结果以结构化卡片展示在对话流中：**
- 行业数据卡片（资金流/机构覆盖/景气度/技术信号）
- 证据链卡片（支持/反对/待验证）
- 投资假设卡片（触发/观察/失效/复盘）
- 个股推荐卡片（现价/目标价/潜在空间/理由/风险）

#### 两种使用入口

1. **自由提问**：用户直接问"哪些行业好？" → Agent 判断意图，从对应步骤开始分析
2. **完整分析**：用户点击"开始完整分析" → Agent 从第  步逐步引导

#### 会话持久化

- **存储方式**：localStorage（key: `ai-chat-session`）
- **保存内容**：当前步骤、对话历史、投资偏好、已选行业/股票、管线进度
- **恢复逻辑**：页面加载时自动恢复上次会话

---

### 3.3 AI 分析工作台 (`/analysis`)

> 注：此页面为早期版本，后续将整合到 `/chat` 页面中。当前保留可用。

**布局**：左右分栏
- **左侧面板**（~55% 宽度）：根据分析步骤动态展示交互内容
- **右侧面板**（~45% 宽度）：AI Agent 对话（全高度）

#### 工作流步骤

| 步骤 | 标识 | 左侧展示 | 用户操作 | AI 行为 |
|------|------|---------|---------|--------|
| 空闲 | `idle` | 欢迎页 + "开始分析"按钮 | 点击开始 | 问候 + 介绍流程 |
| Step 1 | `step1_strategy` | 策略研报观点卡片（可勾选） | 勾选感兴趣方向 → 确认 | 总结策略观点 → 询问偏好 |
| Step 2 | `step2_industry` | 投资偏好设置 + 行业候选列表（可勾选） | 设置风格/风险/周期 + 勾选行业 → 确认 | 结合偏好推荐行业 → 询问确认 |
| Step 3 | `step3_data` | 行业深度数据 + 证据链 + 投资假设 + 风险评估 | 查看数据 → 确认逻辑 | 展示分析结果 → 询问是否认同 |
| Step 4 | `step4_stock` | 推荐标的详情 + 复盘计划 | 查看报告 → 可重新开始 | 输出完整分析报告 |

---

### 3.4 知识库 (`/knowledge`)

**展示内容**：Agent 分析逻辑框架的 5 个维度

| 维度 | 内容 |
|------|------|
| 信息处理 | 自动读取公告/新闻/研报，提取关键信息，聚合同主题观点 |
| 证据组织 | 将资金流/研报/技术面/宏观统一到观点下，区分支持/反对/待验证证据 |
| 假设生成 | 行业/公司/风格/事件假设，含触发原因、证据链、观察指标、失效条件、复盘周期 |
| 风险控制 | 估值/技术面/机构拥挤/资金背离/宏观环境/景气验证等风险维度 |
| 复盘学习 | 跟踪候选标的 1/5/20 日表现，统计信号有效性，调整打分权重 |

每个维度包含：分析框架说明 + 实际案例 + 关键指标

---

### 3.5 全局 AI 对话（浮动）

> 注：此浮动对话为轻量快捷入口，完整分析功能请使用 `/chat` 页面。

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
└── researchSummary: ResearchSummary     // 研报观点总结
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
