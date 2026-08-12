# Coze 修改 Prompt：第三页工坊接入真实数据与模型回测

请改造当前项目第三页「工坊」，让它从 Demo 模型演示升级为真实数据驱动的股票涨跌预测与模型回测页面。

## 背景

当前底部第三个 Tab 是「工坊」，代码对应：

- `src/app/page.tsx` 里的 `ModelTab`
- 当前数据来自 `src/lib/mini-mock.ts` 的 `generateGeneralPredictionModel(...)`

现在的问题是：

1. 第三页只是 Demo 数据，不接真实行情；
2. 用户不能输入一只股票后得到真实数据驱动的涨跌预测；
3. 当前模型结果是随机生成的，不具备可解释的准确性评估；
4. 页面缺少“规则说明 / 使用说明”弹窗；
5. 页面没有用真实近 10 日走势和模型预测走势做对比。

请按以下要求改造。

## 一、第三页新增“规则说明 / 使用说明”按钮

在第三页「工坊」顶部模型总览区域增加一个按钮：

```txt
规则说明
```

或：

```txt
使用说明
```

点击后弹出 Modal。

弹窗内容需要包含：

1. 这个模型做什么：
   - 基于真实行情、估值、技术指标、市场环境等因子；
   - 输出未来短周期上涨/下跌倾向；
   - 展示预测曲线与真实走势对比；
   - 展示回测准确性指标。

2. 用户怎么用：
   - 输入股票名称或代码；
   - 选择因子；
   - 点击“开始预测 / 回测”；
   - 查看涨跌方向、概率、置信度、风险提示；
   - 查看近 10 日真实价格与模型拟合曲线对比。

3. 风险说明：
   - 模型只提供概率判断，不保证预测准确；
   - 历史拟合不代表未来表现；
   - 结果不构成投资建议；
   - 用户需要结合基本面、市场环境和风险承受能力独立判断。

4. 模型指标解释：
   - 方向准确率：预测涨跌方向与真实方向一致的比例；
   - MAE：平均绝对误差；
   - RMSE：均方根误差；
   - R²：拟合优度；
   - 区间命中率：真实价格是否落入预测区间。

## 二、接入真实数据，不再使用随机 Demo 结果作为主要结果

当前 `ModelTab` 使用：

```ts
generateGeneralPredictionModel(...)
```

请改成调用服务端 API。

建议新增 API：

```txt
POST /api/model/predict
```

请求体：

```ts
{
  query: string;              // 股票名称或代码，例如 "贵州茅台" / "600519"
  selectedFactors: string[];  // 用户选择的因子
  horizonDays: number;        // 默认 10
}
```

返回结构建议：

```ts
{
  success: true,
  data: {
    stock: {
      name: string;
      code: string;
      tsCode: string;
      industry: string;
    };
    dataQuality: {
      source: "tushare" | "cache" | "mock";
      fetchedAt: string;
      missing: string[];
      stale: boolean;
    };
    prediction: {
      direction: "up" | "down" | "neutral";
      directionLabel: string;       // 看涨 / 看跌 / 中性
      probability: number;          // 0-1
      confidence: "low" | "medium" | "high";
      expectedReturnPct: number;
      riskLevel: "low" | "medium" | "high";
      summary: string;
      riskWarnings: string[];
    };
    backtest: {
      dates: string[];
      actualPrices: number[];       // 近 10 日真实价格
      predictedPrices: number[];    // 模型拟合价格
      upperBand: number[];
      lowerBand: number[];
      dailyDirectionCorrect: boolean[];
      metrics: {
        directionAccuracy: number;
        intervalHitRate: number;
        mae: number;
        rmse: number;
        r2: number;
        mape: number;
        sampleDays: number;
      };
    };
    factors: {
      selected: string[];
      contributions: {
        factor: string;
        value: number;
        contribution: number;
        direction: "positive" | "negative" | "neutral";
        explanation: string;
      }[];
    };
  }
}
```

## 三、服务端真实数据来源

优先复用现有接口和能力：

- `src/app/api/stock-context/route.ts`
- `src/lib/data/stock-context-builder.ts`
- `src/lib/data/tushare-client.ts`
- `src/lib/data/stock-context-types.ts`

当前 `stock-context-builder.ts` 已经可以从 Tushare 获取：

- 股票身份；
- 最新行情；
- PE / PB / 换手率等估值数据；
- MA5 / MA20 / MA60；
- 5日涨跌幅；
- 20日涨跌幅；
- 20日波动率；
- 市场快照。

但是为了做 10 日回测，当前返回的数据不够。请扩展服务端能力。

### 要求 1：获取最近至少 60 个交易日数据

在服务端新增一个函数，例如：

```ts
buildStockPredictionContext(query: string)
```

需要从 Tushare 获取最近至少 60 个交易日的：

```txt
open, high, low, close, pre_close, pct_chg, vol, amount
```

以及最近 `daily_basic`：

```txt
pe, pe_ttm, pb, total_mv, circ_mv, turnover_rate, volume_ratio
```

注意：

- 不要在浏览器端调用 Tushare；
- 不要暴露 `TUSHARE_TOKEN`；
- 所有真实数据请求只能在 API route 或 server-side 工具函数中完成。

## 四、预测逻辑要求

先做一个可解释、可落地的轻量模型，不需要引入复杂机器学习库。

建议实现一个多因子打分模型。

### 因子方向示例

1. 动量因子：
   - 5日收益率；
   - 10日收益率；
   - 20日收益率；
   - MA5 / MA20 关系。

2. 波动率因子：
   - 20日波动率过高降低置信度；
   - 连续大涨后降低追涨评分。

3. 估值因子：
   - PE / PB 极高降低评分；
   - PE / PB 合理提升评分。

4. 流动性因子：
   - 成交额放大；
   - 换手率变化；
   - `volume_ratio`。

5. 市场环境因子：
   - 如果市场快照偏弱，降低看涨置信度；
   - 如果行业热度高，增加机会评分，但同时增加拥挤风险。

### 输出方向

根据综合分数生成：

```ts
if (score > 0.6) return "up";
if (score < 0.4) return "down";
return "neutral";
```

同时输出：

- 上涨概率；
- 预期收益率；
- 置信度；
- 风险等级；
- 风险提示。

请注意：不要写“保证准确”或“一定上涨/下跌”，只能写“模型倾向”“概率判断”“置信度”。

## 五、10 日回测与曲线对比

请实现一个 10 日回测逻辑。

### 思路

使用最近至少 60 日数据。

对最近 10 个交易日，每一天都只允许使用它之前的数据计算预测，不允许使用未来数据。

例如：

- 第 T-9 日预测 T-8 日方向；
- 第 T-8 日预测 T-7 日方向；
- ...
- 第 T-1 日预测 T 日方向。

生成：

```ts
actualPrices: number[];
predictedPrices: number[];
upperBand: number[];
lowerBand: number[];
dailyDirectionCorrect: boolean[];
```

### 图表展示

在第三页结果区展示一张对比图：

- 实际价格线；
- 模型预测价格线；
- 预测上沿；
- 预测下沿；
- 每日方向是否预测正确。

可以复用当前 `StockCurveChart`，但要改成使用真实 `backtest` 数据。

图表下方显示指标：

| 指标 | 说明 |
|---|---|
| 方向准确率 | 10 日内涨跌方向预测正确比例 |
| 区间命中率 | 实际价格落入预测区间比例 |
| MAE | 平均绝对误差 |
| RMSE | 均方根误差 |
| R² | 拟合优度 |
| MAPE | 平均绝对百分比误差 |

## 六、第三页 UI 改造

保留当前结构，但调整为真实预测流程。

### 页面顶部

显示：

```txt
通用股票预测模型
真实行情 + 因子评分 + 10日回测
```

右侧增加：

```txt
规则说明
```

按钮。

### 输入区

新增或强化单只股票输入：

```txt
输入股票名称或代码
```

例如：

```txt
贵州茅台
600519
宁德时代
300750
```

当前“随机股票 / 指定股票”可以保留，但主路径应该是“预测单只股票”。

建议改成三个模式：

1. 单股预测；
2. 指定多股回测；
3. 随机样本测试。

如果时间有限，优先实现“单股预测”。

### 因子区

保留：

- 因子库；
- 已选因子；
- 使用推荐因子；
- 清空因子。

### 按钮

把原来的：

```txt
开始拟合测试
```

改成：

```txt
开始预测与回测
```

### 结果区

结果区需要包含：

1. 预测结论卡片：
   - 看涨 / 看跌 / 中性；
   - 概率；
   - 置信度；
   - 预期收益率；
   - 风险等级；
   - 交易风险提示。

2. 10 日曲线对比：
   - 真实价格；
   - 模型预测；
   - 预测区间。

3. 模型准确性评价：
   - 方向准确率；
   - 区间命中率；
   - MAE；
   - RMSE；
   - R²；
   - MAPE。

4. 因子贡献：
   - 哪些因子推动看涨；
   - 哪些因子提示风险；
   - 每个因子的贡献权重和解释。

5. 风险声明：
   - 结果不构成投资建议；
   - 模型存在失效风险；
   - 突发政策、财报、黑天鹅、流动性变化可能导致预测失效。

## 七、错误与降级状态

请处理以下情况：

1. 没有配置 `TUSHARE_TOKEN`

   返回明确错误：

   ```txt
   当前未配置真实行情数据源，无法进行真实预测。
   ```

   前端不要展示随机结果冒充真实预测。

2. 股票无法识别

   显示：

   ```txt
   无法识别该股票，请输入 6 位股票代码或完整股票名称。
   ```

3. 数据不足 60 日

   显示：

   ```txt
   历史数据不足，无法完成 10 日回测。
   ```

4. 部分指标缺失

   允许预测，但需要在数据质量中显示缺失项。

## 八、验收标准

完成后请确认：

1. 第三页顶部有“规则说明 / 使用说明”按钮，点击能打开弹窗。
2. 用户输入一只股票后，可以点击“开始预测与回测”。
3. 前端调用真实 API，不再使用 `generateGeneralPredictionModel` 作为主要结果。
4. API 不暴露任何服务端 Key。
5. 配置 `TUSHARE_TOKEN` 后，可以拿到真实股票历史行情。
6. 页面展示模型对该股票的涨跌方向判断。
7. 页面展示上涨/下跌概率和置信度。
8. 页面展示近 10 日真实价格与模型预测价格对比图。
9. 页面展示方向准确率、区间命中率、MAE、RMSE、R²、MAPE。
10. 页面展示因子贡献和风险提示。
11. 如果数据源不可用，页面明确提示，不要用随机 Demo 数据伪装真实结果。
12. 所有结论必须带风险提示，不得出现“保证准确”“一定上涨”“一定下跌”等表述。

## 重要原则

用户希望结果“比较准确”，但金融预测不能承诺确定性。

请使用以下表达：

- “模型倾向看涨”
- “模型倾向看跌”
- “上涨概率约 xx%”
- “置信度：中/高/低”
- “历史 10 日回测方向准确率 xx%”
- “该结果仅供研究参考，不构成投资建议”

不要使用：

- “一定上涨”
- “一定下跌”
- “准确预测”
- “稳赚”
- “无风险”

