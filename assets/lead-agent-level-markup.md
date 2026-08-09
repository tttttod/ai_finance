# 交易员的正确之路：第 1 关 Lead Agent 试玩规格

## 0. 执行要求

- 先更新 `SPEC.md`，补充“交易员的正确之路 / Agent 解锁地图”设计说明。
- 不要删除现有 `tradeTI`、市场、研究、模型、档案功能。
- 优先改主页面 `src/app/page.tsx`。
- 如果 `/mini` 页面也在使用同样 UI，可以同步 `src/app/mini/page.tsx`。
- 当前只做前端本地状态，不接后端。
- 游戏进度使用 `localStorage` 保存。
- 所有文案必须是中文。
- 这不是荐股游戏，不输出真实买卖建议。
- 股票情节使用虚构表达，例如“某热门科技股”。

## 1. 功能目标

在现有“市场冒险局”首页中加入一个大富翁式成长地图 UI。

玩家可以点击第 1 个关卡进入试玩。

当前只实现第 1 关：

- 关卡名：开户日
- 解锁角色：Lead Agent / 研究总控
- 角色中文名：顾明澈

通关后解锁 `Lead Agent`。

其他 Agent 暂时保持锁定状态。

## 2. 新增玩法名称

玩法名称：

```text
交易员的正确之路
```

模块标题：

```text
交易员的正确之路
```

模块副标题：

```text
补完你的投研 Agent 链路
```

## 3. 本地状态

新增 `localStorage` key：

```text
tradeti_game_progress
```

状态结构建议：

```ts
interface TraderRoadProgress {
  currentLevel: number;
  unlockedAgents: string[];
  completedLevels: number[];
  failCount: number;
  endings: string[];
}
```

默认值：

```json
{
  "currentLevel": 1,
  "unlockedAgents": [],
  "completedLevels": [],
  "failCount": 0,
  "endings": []
}
```

第 1 关通关后：

```json
{
  "currentLevel": 2,
  "unlockedAgents": ["lead"],
  "completedLevels": [1],
  "failCount": 0,
  "endings": []
}
```

## 4. 地图 UI

### 4.1 插入位置

在“冒险 / 市场”Tab 顶部，或“今日主线任务”模块之前，新增地图模块。

### 4.2 地图视觉

- 移动端优先。
- 保持当前项目的小程序卡片风格。
- 背景使用暖白色系。
- 卡片圆角控制在 `8px-12px`。
- 地图节点使用圆形按钮加路径连线。
- 显示约 10 个节点。
- 当前只有第 1 关可点击。
- 锁定关卡点击后提示：`先完成前置关卡。`

### 4.3 地图节点

地图节点列表：

```ts
const TRADER_ROAD_LEVELS = [
  { id: 1, title: "开户日", subtitle: "Lead Agent", agent: "lead", status: "available" },
  { id: 2, title: "数据黑市", subtitle: "Data Agent", agent: "data", status: "locked" },
  { id: 3, title: "市场风暴", subtitle: "Market Agent", agent: "market", status: "locked" },
  { id: 4, title: "政策密函", subtitle: "Industry Agent", agent: "industry", status: "locked" },
  { id: 5, title: "财报夜审", subtitle: "Fundamental Agent", agent: "fundamental", status: "locked" },
  { id: 6, title: "价格审判庭", subtitle: "Valuation Agent", agent: "valuation", status: "locked" },
  { id: 7, title: "K线神谕", subtitle: "Technical Agent", agent: "technical", status: "locked" },
  { id: 8, title: "舆论火场", subtitle: "Sentiment Agent", agent: "sentiment", status: "locked" },
  { id: 9, title: "多空议会", subtitle: "Bull / Bear Analyst", agent: "debate", status: "locked" },
  { id: 10, title: "回撤之门", subtitle: "Risk Officer / Research Manager", agent: "risk_manager", status: "locked" }
];
```

### 4.4 通关后的地图变化

第 1 关通关后：

- 第 1 关节点显示“已完成”。
- `Lead Agent` 卡片点亮。
- 第 2 关“数据黑市”显示“即将开放”或半解锁状态。
- 研究页 Agent 团队里 `Lead Agent` 显示已解锁，其余保持锁定视觉。

## 5. 第 1 关：开户日

### 5.1 角色设定

角色：

```text
顾明澈
```

身份：

```text
前明星基金经理，现失意交易员。
```

人设：

```text
顾明澈曾是明星基金经理，三年前因为一次过度自信的重仓判断失去团队。
他不是不会研究，而是被自己的成功经验困住了。
他的心魔是：“先有答案，再找证据。”
玩家要帮他重新学会：先问问题，再找答案。
```

关卡主题：

```text
玩家不是来判断“买不买”，而是帮助顾明澈重新建立研究问题框架。
```

解锁能力：

- 确认研究问题
- 拆解分析任务
- 调度后续 Agent
- 汇总最终结论

## 6. 关卡交互结构

本关分 3 个剧情节点。

每个剧情节点给玩家 4 个选择。

选择没有绝对正确，但明显冲动、甩锅、追涨、为结论找证据的选项会让本关 `failCount + 1`。

如果本关 `failCount >= 2`，触发坏结局。

坏结局后清空本关临时进度，让玩家从第 1 关重新开始。

坏结局不影响现有 `tradeTI`、市场、研究、模型、档案功能。

## 7. 关卡开场

开场文案：

```text
废弃交易大厅里，只剩下一块还亮着的屏幕。
屏幕上滚动着同一句话：
“热门科技股明日或高开 8%。”

一个穿着旧西装的男人坐在阴影里。
他没有回头，只问你：

“如果你是我，你会不会立刻下单？”

他的名牌已经褪色：
顾明澈，前明星基金经理。

他低声说：
“我以前从不犹豫。后来，我也因此失去了整支团队。”
```

## 8. 剧情节点 1：市场诱惑

剧情文案：

```text
顾明澈看着屏幕：
“高开 8%，资金涌入，所有人都在说这是新主线。”

“告诉我，我们现在第一个问题该问什么？”
```

选项：

```ts
[
  {
    id: "1A",
    text: "现在买，明天卖，先赚到再说。",
    failDelta: 1,
    feedback: "顾明澈沉默了一下：“我以前也是这么说的。”"
  },
  {
    id: "1B",
    text: "是谁推荐的？如果是大 V，就可以信。",
    failDelta: 1,
    feedback: "顾明澈冷笑：“你把研究外包给了陌生人的嗓门。”"
  },
  {
    id: "1C",
    text: "我们的研究对象、周期、假设和风险是什么？",
    failDelta: 0,
    feedback: "顾明澈抬头：“你没有先问答案。很好。”"
  },
  {
    id: "1D",
    text: "先看涨幅榜，涨得最猛的一定最强。",
    failDelta: 1,
    feedback: "顾明澈：“涨幅榜是结果，不是理由。”"
  }
]
```

## 9. 剧情节点 2：旧日心魔

剧情文案：

```text
顾明澈打开一份旧报告。
标题是：“确定性机会，建议重仓。”

报告日期下面，有一行红字：
“次日跌停，组合回撤 17%。”

他说：
“那天我也有数据，也有逻辑，也有掌声。错在哪里？”
```

选项：

```ts
[
  {
    id: "2A",
    text: "你只是运气不好，下次加倍赢回来。",
    failDelta: 1,
    feedback: "顾明澈的手指停住：“这句话我听过，在我自己嘴里。”"
  },
  {
    id: "2B",
    text: "你只寻找支持自己判断的证据。",
    failDelta: 0,
    feedback: "顾明澈：“是的。我当时不是在研究，是在为结论辩护。”"
  },
  {
    id: "2C",
    text: "你应该更早听消息。",
    failDelta: 1,
    feedback: "顾明澈：“更早听错消息，只会更早犯错。”"
  },
  {
    id: "2D",
    text: "市场太坏了，没人能负责。",
    failDelta: 1,
    feedback: "顾明澈：“交易员最危险的时刻，是把责任交给市场。”"
  }
]
```

## 10. 剧情节点 3：研究问题卡

剧情文案：

```text
顾明澈递给你一张空白卡片：
“如果你能写下这次研究真正要回答的问题，我就跟你走。”
```

选项：

```ts
[
  {
    id: "3A",
    text: "这只股票明天会不会涨？",
    failDelta: 1,
    feedback: "问题过窄，只关注短期结果。"
  },
  {
    id: "3B",
    text: "在当前市场环境下，这个标的是否值得在我的周期内承担风险？",
    failDelta: 0,
    feedback: "这是一张合格的研究问题卡：环境、标的、周期、风险都在里面。"
  },
  {
    id: "3C",
    text: "大家都买了，我现在不买会不会错过？",
    failDelta: 1,
    feedback: "这是情绪问题，不是研究问题。"
  },
  {
    id: "3D",
    text: "我要怎么证明自己是对的？",
    failDelta: 1,
    feedback: "这是心魔，不是研究。"
  }
]
```

## 11. 坏结局

触发条件：

```ts
levelFailCount >= 2
```

坏结局标题：

```text
坏结局 · 先有答案的人
```

坏结局文案：

```text
顾明澈重新坐回屏幕前。
他开始删掉所有反对意见，只留下支持买入的证据。

第二天，屏幕变成一片刺眼的绿色。

他没有回头，只说：
“原来我从来没有离开过那一天。”
```

按钮：

```text
重新开始第 1 关
```

按钮行为：

- 重置本关剧情节点为第 1 节点。
- 重置本关临时 `failCount`。
- 不清空整个产品的其他本地状态。

## 12. 通关结局

触发条件：

```ts
完成第 3 个剧情节点，并且 levelFailCount < 2
```

通关标题：

```text
Lead Agent 已解锁
```

通关文案：

```text
顾明澈把那张“研究问题卡”收进口袋。
大厅里的第一盏灯亮了。

他说：
“从今天起，我不再替你给答案。”
“我会先帮你把问题问清楚。”
```

解锁说明：

```text
Lead Agent / 研究总控 已加入你的 Agent 链路。
```

能力解锁：

```text
确认研究问题
拆解分析任务
调度后续 Agent
汇总最终结论
```

按钮：

```text
返回地图
去研究页体验 Lead Agent
```

## 13. 关卡面板 UI

点击第 1 关后打开剧情面板。

剧情面板可以是弹窗，也可以是全屏面板。

必须包含：

- 角色头像或头像占位
- 角色名：`顾明澈`
- 角色身份：`Lead Agent / 研究总控`
- 关卡名：`开户日`
- 当前进度：`1/3`、`2/3`、`3/3`
- 剧情对白
- 4 个选择按钮
- 选择后的即时反馈
- 坏结局面板
- 通关面板

## 14. 研究页 Agent 锁定态

在研究页的 Agent 团队展示区域：

- `Lead Agent` 解锁后正常显示。
- 未解锁 Agent 显示灰色、锁图标或低透明度。
- 不要阻断现有研究流程运行。
- 第一版只是视觉锁定，避免影响已有 16 步工作流。

可选提示：

```text
完成地图关卡，逐步点亮完整 Agent 链路。
```

## 15. 验收标准

1. 首页能看到“交易员的正确之路”地图。
2. 点击第 1 关能进入剧情。
3. 三段选择可以推进。
4. 错误选择累计 2 次触发坏结局。
5. 坏结局点击“重新开始第 1 关”后，可以重新试玩本关。
6. 正常通过后，`localStorage.tradeti_game_progress` 保存 `Lead Agent` 解锁状态。
7. 返回地图后，第 1 关显示“已完成”。
8. 通关后，`Lead Agent` 卡片点亮。
9. 第 2 关“数据黑市”显示“即将开放”或半解锁状态。
10. 不影响现有 `tradeTI`、市场数据、研究工作流。
11. 页面保留免责声明语境，不构成真实投资建议。

## 16. 建议实现方式

建议新增或抽离以下常量：

```ts
const TRADER_ROAD_STORAGE_KEY = "tradeti_game_progress";
const TRADER_ROAD_LEVELS = [...];
const LEAD_AGENT_LEVEL = {...};
```

建议新增组件：

```ts
function TraderRoadMap(...)
function LeadAgentLevelDialog(...)
function AgentUnlockCard(...)
```

如果当前文件过大，可以先在 `src/app/page.tsx` 内实现 MVP，后续再拆组件。

第一版优先保证玩法闭环，不要过度抽象。
