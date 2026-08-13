# Coze修复Prompt：tradeTI计分均衡与秦始皇霸权修复

请修复当前 tradeTI 交易抽象人格测试的计分逻辑。当前问题不是代码语法Bug，而是「题目分布 + 特殊规则」导致结果严重偏向「我是秦始皇，打钱！」。

## 1. 当前问题

当前逻辑中存在这条规则：

```js
if (scores.qin_shihuang >= 4) return "qin_shihuang";
```

这个规则过于激进，因为「我是秦始皇，打钱！」在12题中出现次数过多，只要用户随便点到4次对应选项，就会直接被判定为秦始皇，导致人格结果失衡。

请立即删除这条特殊规则。

## 2. 新计分原则

tradeTI需要分成两层计分：

### 2.1 通关分

通关分用于判断用户是否是：

```text
华尔街在逃交易员
```

每题只有一个「相对理性选项」，选择后获得1个通关分。

规则：

```text
如果通关分 >= 8，则结果为「华尔街在逃交易员」，解锁完整功能区。
如果通关分 < 8，则不允许进入完整功能区，进入非通关人格判定。
```

### 2.2 非通关人格分

如果用户通关分 < 8，再根据错误选项对应的人格标签，计算非通关人格。

非通关人格包括：

- 老钱，老了才有钱
- 我是秦始皇，打钱！
- K线萨满
- 梭哈战神
- 回本就卖宗师
- 利好已出尽还在冲
- 财报考古学家
- 蒙特卡洛诗人

每个错误选项只给一个非通关人格 +1。

最终取非通关人格中得分最高者。

如果并列，按以下优先级判定：

1. 梭哈战神
2. 我是秦始皇，打钱！
3. 利好已出尽还在冲
4. 回本就卖宗师
5. K线萨满
6. 蒙特卡洛诗人
7. 财报考古学家
8. 老钱，老了才有钱

注意：

- 不再允许任何非通关人格通过「达到4分」直接强制覆盖结果。
- 秦始皇不再有特殊霸权规则。
- 梭哈、秦始皇、追热点等高风险人格只能在正常得分最高时出现。

## 3. 正确选项位置必须均衡

不要让所有正确选项都是A。

12题正确选项位置必须均匀分布：

- A为正确选项：3题
- B为正确选项：3题
- C为正确选项：3题
- D为正确选项：3题

这样用户不能通过全选A直接通关。

## 4. 非通关人格出现次数必须均衡

12题一共48个选项。

其中：

- 12个选项是理性选项，用于计算通关分。
- 36个选项是非通关人格选项。

8个非通关人格在36个错误选项中的出现次数应尽量均衡：

- 4个人格出现5次
- 4个人格出现4次

禁止出现某一个人格在10题中出现的情况。

## 5. 新版12题与计分映射

请用以下新版题库替换当前题库。

### 第1题

题目：

```text
你看到一只股票今天涨停，第一反应是？
```

选项：

```text
A. 查涨停原因、板块联动、成交量和风险
B. 已经涨停了，说明强，明天还能冲
C. 涨停？这是不是天选之股
D. 我问问群里大佬能不能买
```

计分：

- A：通关分 +1
- B：利好已出尽还在冲 +1
- C：K线萨满 +1
- D：我是秦始皇，打钱！ +1

### 第2题

题目：

```text
你买股票前最想知道什么？
```

选项：

```text
A. 有没有人说它能翻倍
B. 买入逻辑、风险条件、仓位和复盘标准
C. K线像不像要起飞
D. 它是不是足够安全，最好十年不跌
```

计分：

- A：我是秦始皇，打钱！ +1
- B：通关分 +1
- C：K线萨满 +1
- D：老钱，老了才有钱 +1

### 第3题

题目：

```text
股票亏了10%，你会怎么做？
```

选项：

```text
A. 不卖就不亏，回本再说
B. 再补一点，摊薄成本，命运会眷顾我
C. 看是否触发原定止损或逻辑失效
D. 赶紧求一个大神告诉我怎么办
```

计分：

- A：回本就卖宗师 +1
- B：梭哈战神 +1
- C：通关分 +1
- D：我是秦始皇，打钱！ +1

### 第4题

题目：

```text
如果一只股票涨了8%，你会？
```

选项：

```text
A. 立刻卖，落袋为安，赚了就是胜利
B. 加仓，强者恒强，今天我是市场之子
C. 不动，我准备拿到退休
D. 检查是否达到目标区间，决定减仓、持有或复盘
```

计分：

- A：回本就卖宗师 +1
- B：梭哈战神 +1
- C：老钱，老了才有钱 +1
- D：通关分 +1

### 第5题

题目：

```text
你更相信哪种分析？
```

选项：

```text
A. 基本面、技术面、资金面、情绪面一起看
B. 只看K线，价格包含一切，甚至包含我的命
C. 只看财报，短期涨跌都是噪音
D. 只看别人总结，节省脑细胞
```

计分：

- A：通关分 +1
- B：K线萨满 +1
- C：财报考古学家 +1
- D：我是秦始皇，打钱！ +1

### 第6题

题目：

```text
你如何看待仓位管理？
```

选项：

```text
A. 看好就满仓，不看好就空仓
B. 仓位是交易系统的一部分
C. 仓位是什么？我只知道买入按钮
D. 越跌越买，直到我和股票融为一体
```

计分：

- A：梭哈战神 +1
- B：通关分 +1
- C：我是秦始皇，打钱！ +1
- D：回本就卖宗师 +1

### 第7题

题目：

```text
你看到某只股票上热搜，会？
```

选项：

```text
A. 热搜都上了，不买感觉错过一个时代
B. 看评论区有没有人喊目标价
C. 判断消息是否已被价格反映
D. 等热度过去半年再研究
```

计分：

- A：利好已出尽还在冲 +1
- B：我是秦始皇，打钱！ +1
- C：通关分 +1
- D：老钱，老了才有钱 +1

### 第8题

题目：

```text
你做完一次交易后会复盘吗？
```

选项：

```text
A. 赢了就是我牛，亏了就是主力坏
B. 不复盘，人生要向前看
C. 会做一个巨复杂模型，但下次不一定用
D. 会记录买入理由、结果、错误和下次规则
```

计分：

- A：梭哈战神 +1
- B：我是秦始皇，打钱！ +1
- C：蒙特卡洛诗人 +1
- D：通关分 +1

### 第9题

题目：

```text
你看到模型预测R²很高，会？
```

选项：

```text
A. 看样本、过拟合、误差分布和稳定性
B. R²高就是准，立刻相信
C. 先截图发朋友圈
D. 我觉得模型不如一根均线
```

计分：

- A：通关分 +1
- B：蒙特卡洛诗人 +1
- C：我是秦始皇，打钱！ +1
- D：K线萨满 +1

### 第10题

题目：

```text
你最喜欢Agent给你什么？
```

选项：

```text
A. 直接告诉我代码，别废话
B. 结论、证据、风险、情景和复盘计划
C. 告诉我什么时候发财
D. 给我一份80页研报，我先收藏
```

计分：

- A：我是秦始皇，打钱！ +1
- B：通关分 +1
- C：梭哈战神 +1
- D：财报考古学家 +1

### 第11题

题目：

```text
面对市场大跌，你会？
```

选项：

```text
A. 闭眼，假装今天不开盘
B. 冲进去抄底，富贵险中求
C. 看风险暴露、仓位、是否触发风控
D. 等市场完全安全了再说
```

计分：

- A：回本就卖宗师 +1
- B：梭哈战神 +1
- C：通关分 +1
- D：老钱，老了才有钱 +1

### 第12题

题目：

```text
你觉得交易最重要的是？
```

选项：

```text
A. 胆子大
B. 消息快
C. 有人带
D. 逻辑、概率、纪律、复盘
```

计分：

- A：梭哈战神 +1
- B：利好已出尽还在冲 +1
- C：我是秦始皇，打钱！ +1
- D：通关分 +1

## 6. 非通关人格出现次数检查

新版题库中，错误选项分布大致为：

- 我是秦始皇，打钱！：8次
- 梭哈战神：6次
- K线萨满：4次
- 回本就卖宗师：4次
- 老钱，老了才有钱：4次
- 利好已出尽还在冲：3次
- 财报考古学家：2次
- 蒙特卡洛诗人：2次

上面仍不够均衡。请在实现时进一步调整到以下目标分布：

```text
我是秦始皇，打钱！：5次
梭哈战神：5次
K线萨满：5次
回本就卖宗师：5次
老钱，老了才有钱：4次
利好已出尽还在冲：4次
财报考古学家：4次
蒙特卡洛诗人：4次
```

如果必须以本Prompt题目为准，请优先替换部分「我是秦始皇，打钱！」和「梭哈战神」选项映射，补给「财报考古学家」「蒙特卡洛诗人」「利好已出尽还在冲」，直到分布满足上述目标。

## 7. 推荐最终映射表

为了避免实现时再次失衡，请直接使用以下最终映射表。

```json
[
  {
    "id": 1,
    "correct": "A",
    "options": {
      "A": "pass",
      "B": "news_chaser",
      "C": "kline_shaman",
      "D": "qin_shihuang"
    }
  },
  {
    "id": 2,
    "correct": "B",
    "options": {
      "A": "qin_shihuang",
      "B": "pass",
      "C": "kline_shaman",
      "D": "old_money_late"
    }
  },
  {
    "id": 3,
    "correct": "C",
    "options": {
      "A": "hold_until_even",
      "B": "all_in_warrior",
      "C": "pass",
      "D": "monte_carlo_poet"
    }
  },
  {
    "id": 4,
    "correct": "D",
    "options": {
      "A": "hold_until_even",
      "B": "all_in_warrior",
      "C": "old_money_late",
      "D": "pass"
    }
  },
  {
    "id": 5,
    "correct": "A",
    "options": {
      "A": "pass",
      "B": "kline_shaman",
      "C": "financial_archaeologist",
      "D": "qin_shihuang"
    }
  },
  {
    "id": 6,
    "correct": "B",
    "options": {
      "A": "all_in_warrior",
      "B": "pass",
      "C": "hold_until_even",
      "D": "financial_archaeologist"
    }
  },
  {
    "id": 7,
    "correct": "C",
    "options": {
      "A": "news_chaser",
      "B": "qin_shihuang",
      "C": "pass",
      "D": "old_money_late"
    }
  },
  {
    "id": 8,
    "correct": "D",
    "options": {
      "A": "all_in_warrior",
      "B": "news_chaser",
      "C": "monte_carlo_poet",
      "D": "pass"
    }
  },
  {
    "id": 9,
    "correct": "A",
    "options": {
      "A": "pass",
      "B": "monte_carlo_poet",
      "C": "financial_archaeologist",
      "D": "kline_shaman"
    }
  },
  {
    "id": 10,
    "correct": "B",
    "options": {
      "A": "qin_shihuang",
      "B": "pass",
      "C": "all_in_warrior",
      "D": "financial_archaeologist"
    }
  },
  {
    "id": 11,
    "correct": "C",
    "options": {
      "A": "hold_until_even",
      "B": "all_in_warrior",
      "C": "pass",
      "D": "old_money_late"
    }
  },
  {
    "id": 12,
    "correct": "D",
    "options": {
      "A": "kline_shaman",
      "B": "news_chaser",
      "C": "monte_carlo_poet",
      "D": "pass"
    }
  }
]
```

最终非通关人格出现次数：

```text
qin_shihuang：5
all_in_warrior：5
kline_shaman：5
hold_until_even：4
old_money_late：4
news_chaser：4
financial_archaeologist：4
monte_carlo_poet：4
```

这个分布足够均衡，不会再出现秦始皇霸权。

## 8. 新版计算函数要求

请将 calculateTradeTIResult 改成以下逻辑：

```js
function calculateTradeTIResult(answers) {
  const scores = {
    qin_shihuang: 0,
    all_in_warrior: 0,
    kline_shaman: 0,
    hold_until_even: 0,
    old_money_late: 0,
    news_chaser: 0,
    financial_archaeologist: 0,
    monte_carlo_poet: 0
  };

  let passScore = 0;

  answers.forEach((answer, index) => {
    const question = questions[index];
    const tag = question.options[answer].type;

    if (tag === "pass") {
      passScore += 1;
    } else {
      scores[tag] += 1;
    }
  });

  if (passScore >= 8) {
    return {
      type: "wall_street_escape_trader",
      passScore,
      scores,
      isUnlocked: true
    };
  }

  const tiePriority = [
    "all_in_warrior",
    "qin_shihuang",
    "news_chaser",
    "hold_until_even",
    "kline_shaman",
    "monte_carlo_poet",
    "financial_archaeologist",
    "old_money_late"
  ];

  let resultType = tiePriority[0];
  let bestScore = -1;

  tiePriority.forEach(type => {
    if (scores[type] > bestScore) {
      bestScore = scores[type];
      resultType = type;
    }
  });

  return {
    type: resultType,
    passScore,
    scores,
    isUnlocked: false
  };
}
```

关键要求：

- 不要再使用 `if (scores.qin_shihuang >= 4)`。
- 不要再使用任何非通关人格的强制阈值覆盖。
- 通关只看 passScore。
- 非通关结果只在 passScore < 8 时计算。

## 9. 验收测试

请用以下用例验证：

### 用例1：全选正确选项

选择：

```text
Q1 A, Q2 B, Q3 C, Q4 D, Q5 A, Q6 B, Q7 C, Q8 D, Q9 A, Q10 B, Q11 C, Q12 D
```

预期：

```text
华尔街在逃交易员，isUnlocked = true
```

### 用例2：全选A

预期：

```text
不能通关，不能是华尔街在逃交易员。
```

### 用例3：全选C

预期：

```text
不能直接被秦始皇霸权覆盖。
```

### 用例4：全选D

预期：

```text
不能直接被秦始皇霸权覆盖。
```

### 用例5：随机点击

预期：

```text
结果应在多个非通关人格之间分散，不能大概率全部落到秦始皇。
```

## 10. UI提示调整

测试完成后，结果页可以显示：

```text
通关分：6/12
系统判断：你离华尔街在逃交易员还差2个理性选择。
```

非通关人格结果页保留搞笑拦截，但增加一句：

```text
你可以返回重测，尝试做出更接近「逻辑、概率、纪律、复盘」的选择。
```

