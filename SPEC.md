# AI 投研平台 — 产品规格说明书 (Spec)

> **工作流规则**：所有功能改动必须先更新本 Spec 文档，经确认后再按 Spec 修改代码。
> 最后更新：2026-08-13
> 本次变更：第四页"时讯"热点新闻数据源替换为新浪财经 RSS，停用 GDELT / Google News 等国外源

---

## 1. 产品概述

**产品名称**：AI 投研平台 — 市场冒险局

**产品定位**：AI 投资研究辅助系统（不是荐股系统）。帮助普通投资者按照专业金融机构的投研流程完成 A 股研究，输出结构化研究结论、风险提示和复盘任务。

**产品世界观**：市场冒险局 — 用户不是打开一个资讯终端，而是每天进入一次"今日市场副本"。内容可靠，包装亲切。用户的人格角色（tradeTI）成为长期"市场搭子"，贯穿产品体验。

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
| `/` | 市场冒险局 | 小程序MVP主页面，4Tab布局（冒险/任务/工坊/档案），人格搭子贯穿全局 | ✅ 已完成 |
| `/login` | 用户登录/注册 | 邮箱密码登录 + 注册，Supabase Auth | ✅ 已完成 |
| `/mini` | 小程序MVP（备用） | 与主页面相同的小程序MVP | ✅ 已完成 |
| `/chat` | AI 投研对话 | 左侧信息面资讯 + 右侧大面积AI对话 | ✅ 已完成 |
| `/knowledge` | 知识库 | 展示 Agent 分析逻辑框架 | ✅ 已完成 |
| `/analysis` | AI 分析工作台 | 已弃用 | 已弃用 |

### 2.2 全局布局

- **背景**：暖白 #FAFAF9（市场冒险局风格）
- **主页面**：移动端优先，max-w-md 居中，底部 4 Tab 导航
- **小程序风格**：模拟 iOS 状态栏，卡片式布局，圆角 8px-12px
- **人格搭子**：用户人格角色贯穿产品，每个页面都有搭子点评

### 2.3 用户认证系统

- **认证方式**：用户名 + 密码（底层使用 Supabase Auth，用户名映射为虚拟邮箱 `${username}@market-adventure.local`）
- **登录页** (`/login`)：用户名密码登录 + 注册（Tab 切换），展示应用图标和名称"市场冒险局"
- **跳过登录**：登录页提供"跳过登录，先逛逛"按钮，点击后设置 `localStorage.auth_skipped=true`，允许未登录访问主页（部分功能受限）
- **UI 风格**：与主网页一致 — 暖黄渐变背景、彩虹状态栏、大圆角卡片、渐变按钮
- **路由守卫**：未登录用户自动跳转到 `/login`，但 `auth_skipped=true` 时放行；登录页为唯一公开页面
- **登出**：档案 Tab 底部提供退出登录按钮（二次确认），登出后跳转登录页
- **配置注入**：通过 `/api/supabase-config` API 动态获取 Supabase URL 和 AnonKey

---

## 3. 功能模块详细规格

### 3.1 市场冒险局首页 (`/`)

**数据源**：`GET /api/report` → 返回 `DailyReport` 对象

**页面叙事逻辑**（由上到下）：
```
人格搭子打招呼 → 今日市场天气 → 主线任务 → 全球冒险地图 → 支线任务 → 今日认知经验
```

**Tab 导航**（4 个模块）：

| Tab | 名称 | 图标 | 功能 |
|-----|------|------|------|
| 冒险 | 🗺️ | 默认首页，市场冒险局核心看板 |
| 任务 | 📋 | 16步研究流程工作台 |
| 工坊 | 🔧 | 通用股票预测模型（因子/拟合/蒙特卡洛） |
| 档案 | 🎒 | 用户信息与设置 |

#### 首页模块详解（冒险 Tab）

##### 1. 人格搭子问候区（顶部）
- 展示用户人格头像/Emoji + 人格名称
- 个性化问候语（每人格专属，结合人格弱点提醒）
- 等级进度条：LV.X 市场调查员 + 今日研究进度
- 背景色跟随人格主色

**问候语映射**：
| 人格 | 问候语 |
|------|--------|
| 华尔街在逃交易员 | "今天波动不小，但你的框架比市场稳。按计划走。" |
| 财报考古学家 | "别急着翻十年财报，今天有个短线机会值得先看。" |
| K线萨满 | "金叉很多，但上香之前，我们先看看基本面。" |
| 梭哈战神 | "欢迎回来。今天第一个任务仍然是：管住仓位。" |
| 回本就卖宗师 | "成本价不是宇宙中心。今天也要记住这一点。" |
| 蒙特卡洛诗人 | "模型说今天风平浪静。现实正在旁边冷笑。" |
| 老钱，老了才有钱 | "机会又来了。这次别观察三年，先看三分钟。" |
| 我是秦始皇，打钱！ | "没有人会直接给你打钱。但这里有条靠谱的分析路径。" |
| 利好已出尽还在冲 | "热搜第一的股票，三天前就该研究了。今天别追了。" |

##### 2. 今日市场天气
- 替代原"AI摘要"卡片
- 用"天气"隐喻市场状态：☀️晴天（普涨）、⛅多云（震荡）、🌧️雨天（下跌）
- 显示关键指数数据（沪指涨跌、成交额）
- 搭子角色给出简短点评

##### 3. 交易员的正确之路（Agent 解锁地图）
- 位于"今日市场天气"与"今日主线任务"之间
- 移动端大富翁式成长路径，10 个节点横向排列
- 节点列表：
  1. 开户日 Lead Agent — 你的第一个 Agent
  2. 数据黑市 — 学会获取和筛选数据
  3. 市场风暴 — 理解市场情绪与波动
  4. 政策密函 — 解读宏观政策影响
  5. 财报夜审 — 基本面分析入门
  6. 价格审判庭 — 估值与定价逻辑
  7. K线神谕 — 技术面分析基础
  8. 舆论火场 — 信息面与情绪管理
  9. 多空议会 — 多空观点对比与决策
  10. 回撤之门 — 风险管理与复盘
- 当前版本：仅第 1 关可点击（解锁），其余关卡锁定显示
- 点击第 1 关弹出简介弹窗，提示"即将开放"
- 游戏进度使用 localStorage 保存，key: `tradeti_game_progress`
- 视觉风格：深色地图背景 + 蓝色脉冲光效 + 节点连线，与"全球冒险地图"风格呼应

##### 3.1 进度与解锁系统（v1）

**核心模块**：`src/lib/trader-road-progress.ts`

**localStorage key**：`tradeti_game_progress`

**数据结构**：
```ts
interface TraderRoadProgress {
  version: 1;
  currentLevel: number;           // 当前可挑战关卡（最小 1）
  completedLevels: number[];      // 已完成关卡 ID（去重排序）
  unlockedAgents: TraderRoadAgentId[];  // 已解锁 Agent（去重）
  levelFailCounts: Record<string, number>;  // 每关失败次数
  failureRecords: TraderRoadFailureRecord[]; // 失败记录
  updatedAt: string;              // ISO 时间戳
}
```

**关卡与 Agent 映射**（10 关 → 12 Agent）：
| 关卡 | 标题 | 解锁 Agent |
|------|------|-----------|
| 1 | 开户日 | lead |
| 2 | 数据黑市 | data |
| 3 | 市场风暴 | market |
| 4 | 政策密函 | industry |
| 5 | 财报夜审 | fundamental |
| 6 | 价格审判庭 | valuation |
| 7 | K线神谕 | technical |
| 8 | 舆论火场 | sentiment |
| 9 | 多空议会 | bull, bear |
| 10 | 回撤之门 | risk, manager |

**关卡状态判定**：
- `completed`：completedLevels 包含该 levelId
- `available`：levelId === currentLevel
- `coming_soon`：levelId === currentLevel + 1
- `locked`：其他情况

**核心函数**：
- `loadTraderRoadProgress()` — SSR 安全读取
- `saveTraderRoadProgress(progress)` — SSR 安全写入
- `completeTraderRoadLevel(levelId)` — 完成关卡 + 解锁 Agent
- `unlockTraderRoadAgents(agentIds)` — 手动解锁 Agent
- `addTraderRoadFailure(levelId, reason, endingId)` — 记录失败
- `resetTraderRoadLevelFailures(levelId)` — 重置失败次数
- `isTraderRoadAgentUnlocked(progress, agentId)` — 判断 Agent 是否解锁
- `getTraderRoadLevelStatus(progress, levelId)` — 判断关卡状态
- `getTraderRoadLevelsWithStatus(progress)` — 返回带状态的关卡列表

**页面接入规则**：
- Agent 团队展示区：已解锁正常显示，未解锁降低透明度 + 灰色 + 🔒标记
- 第一版不阻断研究流程，仅做视觉提示
- tradeTI 状态（人格测试）与 traderRoadProgress（地图解锁）独立共存，互不覆盖

**与 tradeTI 的关系**：
- `tradeti_state`：用户人格测试结果（is_unlocked 表示人格测试是否通关）
- `tradeti_game_progress`：Agent 地图解锁进度（unlockedAgents 表示哪些 Agent 已解锁）
- 两套状态独立，不互相覆盖

##### 3.2 游戏地图系统（v2）

**概述**：10 个关卡各有独立的游戏地图，地图之间相互衔接，视觉风格保持一致。每关使用不同的交互玩法，融合人物对话、金融知识科普（Quiz 翻牌卡片弹窗）、金融知识考核、脑力闯关和轻松小游戏。

**核心模块**：`src/components/game-maps/`

**统一视觉风格**：
- 深色地图背景：`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900`
- 蓝色脉冲光效边框：`border-blue-500/30` + `shadow-[0_0_15px_rgba(59,130,246,0.2)]`
- 节点连线：渐变蓝紫色，已完成段为实线绿色
- 弹窗统一全屏覆盖，`bg-slate-950/95` 背景

**四种游戏类型**：

| 类型 | 玩法 | 使用关卡 |
|------|------|---------|
| `dialogue` | 角色对话 + 多选分支，错误累计 >=2 触发坏结局 | 1, 4, 9 |
| `quiz` | 金融知识翻牌卡片，逐张翻开判断对错，即时反馈 | 2, 6 |
| `brain` | 记忆翻牌配对，将金融术语与释义匹配 | 3, 8 |
| `minigame` | 快速判断/反应类小游戏，限时多轮 | 5, 7, 10 |

**10 关地图内容**：

| 关卡 | 标题 | 类型 | 核心玩法 | 解锁 Agent |
|------|------|------|---------|-----------|
| 1 | 开户日 | dialogue | 顾明澈对话，学习提问框架 | lead |
| 2 | 数据黑市 | quiz | 8 张翻牌，判断数据来源/方法正误 | data |
| 3 | 市场风暴 | brain | 8 张记忆翻牌，配对金融术语 | market |
| 4 | 政策密函 | dialogue | 解读政策信号，选择正确理解 | industry |
| 5 | 财报夜审 | minigame | 快速识别财报中的危险信号 | fundamental |
| 6 | 价格审判庭 | quiz | 8 张翻牌，估值基础知识判断 | valuation |
| 7 | K线神谕 | minigame | 限时识别 K 线形态 | technical |
| 8 | 舆论火场 | brain | 8 张翻牌，配对新闻术语 | sentiment |
| 9 | 多空议会 | dialogue | 多空辩论场景，选择合理观点 | bull, bear |
| 10 | 回撤之门 | minigame | 风险管理场景快速决策 | risk, manager |

**通关条件**：
- `dialogue`：错误选择 < 2 次即通关
- `quiz`：正确率 >= 70% 即通关
- `brain`：完成所有配对即通关
- `minigame`：正确率 >= 60% 即通关

**地图衔接逻辑**：
- 通关后自动更新 `tradeti_game_progress`，`currentLevel` +1
- 下一关在地图条上变为 `available` 状态
- 通关弹窗显示解锁的 Agent 信息
- 失败不阻断，可重复挑战

**组件结构**：
```
src/components/game-maps/
+-- game-data.ts          # 10关完整数据（对话/题目/配对/场景）
+-- DialogueGame.tsx      # 对话闯关组件
+-- QuizGame.tsx          # 知识翻牌测验组件
+-- BrainGame.tsx         # 脑力翻牌配对组件
+-- MiniGame.tsx          # 快速判断小游戏组件
+-- GameMapPlayer.tsx     # 主控制器（根据关卡类型分发）
```

**页面接入**：
- `src/app/page.tsx` 的 MarketTab 中，点击关卡节点 -> 设置 `activeGameLevel` -> 渲染 `<GameMapPlayer>`
- 替换原有的 `alert()` 为实际游戏弹窗
- `onLevelComplete` 回调调用 `completeTraderRoadLevel()` 更新进度

##### 4. 主线任务
- 替代原"AI推荐研究标的"
- 每个推荐标的包装为"任务"，标注难度星级（⭐）
- 包含任务目标（如：完成基本面分析）、搭子提示
- 点击"接受任务"填入研究Tab
- **原则**：用"任务"包装降低荐股感，增强研究驱动

##### 4. 全球冒险地图
- 保留深色世界地图风格（探索感适配）
- 标题改为"全球冒险地图"
- 搭子引导语提示今日重要事件数量
- 事件卡片保留，交互不变

##### 5. 支线任务
- 合并原板块热度榜 + 个股异动榜
- 热门区域：板块热度排行，带进度条
- 异动信号：个股异动列表，带原因标签

##### 6. 今日认知经验（底部新增）
- 已完成的"今日研究"统计
- 搭子给一句鼓励/总结
- 强化"每天进步一点点"的认知

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

### 4.5 `GET /api/hot-news` 热点新闻（第四页时讯）

**数据源（唯一）**：新浪财经 RSS（国内可访问、免费、无需 API Key）。

订阅地址（并行拉取，合并去重）：
- 财经要闻：`https://rss.sina.com.cn/roll/finance/hot_roll.xml`
- 股市及时雨：`https://rss.sina.com.cn/finance/jsy.xml`
- 股票要闻：`https://rss.sina.com.cn/roll/stock/hot_roll.xml`
- 港股：`https://rss.sina.com.cn/finance/hkstock.xml`
- 美股：`https://rss.sina.com.cn/finance/usstock.xml`

**处理流程**：
1. 服务端并行 fetch 上述 5 个 RSS，单个超时 8s，单个失败不影响其他源
2. 解析 RSS `<item>`，提取 title / link / pubDate / source / description
3. 本地处理：情绪识别（关键词：恐慌 / 中性 / 狂热，仅作为辅助标签）、关联板块、热度评分、标签提取
4. 去重（URL + 标题前 20 字符）、按热度 + 时间排序、取 Top 30
5. 支持 `?q=` 查询参数，按标题 + 摘要做本地关键词过滤

**响应格式**：
```json
{
  "success": true,
  "data": [HotNewsItem],
  "meta": {
    "provider": "sina-finance-rss",
    "fetchedAt": "ISO 时间",
    "query": "default",
    "isFallback": false,
    "message": "可选说明"
  }
}
```

**降级策略**：所有新浪 RSS 子源均失败时返回 `data: []`、`isFallback: true`、`message: "暂无可用新闻数据，请稍后重试"`，**不回退到任何国外源，不使用 mock 数据**。

**前端 provider 映射**：`sina-finance-rss` → `新浪财经 RSS`。

情绪标签仅作内容归类，不构成投资建议。

### 4.6 `POST /api/chat` AI 研究对话（增强版）

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
| 2026-08-03 | 🗺️ 市场冒险局主题改造：首页改为市场冒险局叙事，人格搭子问候、市场天气、主线任务、全球冒险地图、支线任务、认知经验总结，底部 Tab 统一改名（冒险/任务/工坊/档案） |
| 2026-08-08 | 研究报告动态生成（基于股票名称 hash）、历史研究档案数量动态化（localStorage 联动 ResearchTab 和 ProfileTab）、备用页面 mini/page.tsx 同步更新 |
| 2026-08-08 | 新增「交易员的正确之路」进度与解锁系统：集中式进度模块 `trader-road-progress.ts`、10 关卡 + 12 Agent 映射、SSR 安全 localStorage 读写、Agent 团队锁定态视觉、开发调试按钮 |
| 2026-08-13 | 第四页「时讯」热点新闻数据源替换：停用 GDELT / Google News RSS 等国外源，`/api/hot-news` 改为聚合新浪财经 5 路 RSS（财经要闻 / 股市及时雨 / 股票要闻 / 港股 / 美股），失败仅返回空状态、不再回退国外源或 mock 数据 |

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
