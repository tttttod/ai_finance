import type { DialogueLevelData } from "./game-data";

export const DIALOGUE_DATA: Record<number, DialogueLevelData> = {
  1: {
    opening:
      "你第一次打开交易软件，手指悬在「买入」按钮上，迟迟不敢落下。\n\n屏幕上的 K 线像心电图一样跳动，每一条都像是在告诉你不同的故事。\n\nLead Agent 的声音从耳机里传来：\n\n「别急着下单。先看看你面前这三条线，它们讲的是同一个故事吗？」",
    nodes: [
      {
        id: 1,
        scene:
          "你点开一只股票的详情页。\n\n页面上有三种声音在争吵：\n\n• 一位分析师说：「业绩超预期，目标价上调 20%，买入！」\n• 另一位说：「估值偏高，技术面走弱，观望。」\n• 还有一位说：「行业景气度下行，建议减仓。」\n\n三个观点，三个方向。你不知道该听谁的。",
        options: [
          {
            id: "q1_a",
            text: "看多 — 跟着最乐观的那位走",
            correct: false,
            feedback:
              "Lead Agent 摇头：\n\n「最乐观的声音往往最诱人，但也最危险。你只看到了收益，没看到风险。」\n\n屏幕上的 K 线突然下跌，你的虚拟账户亏损了 5%。",
          },
          {
            id: "q1_b",
            text: "看空 — 跟着最谨慎的那位走",
            correct: false,
            feedback:
              "Lead Agent 叹气：\n\n「最谨慎的声音让你错过了机会。市场不是只有风险，还有收益。」\n\n屏幕上的 K 线稳步上涨，你的虚拟账户跑输了大盘。",
          },
          {
            id: "q1_c",
            text: "中性 — 综合所有信息，形成自己的判断",
            correct: true,
            feedback:
              "Lead Agent 点头：\n\n「这才是正确的思路。不是听某一个声音，而是把所有声音放在一起，形成自己的判断。」\n\n「记住：市场没有标准答案，只有你的逻辑是否自洽。」",
          },
        ],
      },
      {
        id: 2,
        scene:
          "你继续浏览，看到另一只股票。\n\n这次页面上显示的是：\n\n• 机构持仓比例上升 15%\n• 北向资金连续 3 日净流入\n• 但公司刚发布了一份减持公告\n\n数据在打架。你该怎么理解？",
        options: [
          {
            id: "q2_a",
            text: "机构在买，北向资金在进，肯定是利好",
            correct: false,
            feedback:
              "Lead Agent 提醒：\n\n「你只看到了买入的信号，没看到减持的警告。数据不会骗人，但你会选择性忽略。」",
          },
          {
            id: "q2_b",
            text: "减持公告是大股东不看好，应该避开",
            correct: false,
            feedback:
              "Lead Agent 摇头：\n\n「减持不一定代表不看好，可能是股东个人资金需求。只看一面之词，你会错过机会。」",
          },
          {
            id: "q2_c",
            text: "综合来看，机构和大资金在买，但减持需要关注，继续观察",
            correct: true,
            feedback:
              "Lead Agent 微笑：\n\n「这就对了。数据不是非黑即白，你需要在矛盾中找到平衡。」\n\n「记住：每一个信号都有它的语境，脱离语境的数据毫无意义。」",
          },
        ],
      },
      {
        id: 3,
        scene:
          "最后一道题。\n\n你看到一只股票今天涨停了，页面上全是红色的数字和欢呼的评论。\n\n你的手指再次悬在「买入」按钮上。\n\n这一次，你会怎么做？",
        options: [
          {
            id: "q3_a",
            text: "涨停了，momentum 很强，赶紧追",
            correct: false,
            feedback:
              "Lead Agent 警告：\n\n「追涨是最危险的操作之一。你看到的是过去的涨幅，不是未来的保证。」\n\n屏幕上的 K 线第二天低开，你的虚拟账户再次亏损。",
          },
          {
            id: "q3_b",
            text: "涨停了，可能是利好出尽，应该避开",
            correct: false,
            feedback:
              "Lead Agent 摇头：\n\n「涨停不一定代表利好出尽，可能是行情的起点。一刀切的判断会让你错过机会。」",
          },
          {
            id: "q3_c",
            text: "先看看涨停的原因、量能和后续走势再做决定",
            correct: true,
            feedback:
              "Lead Agent 点头：\n\n「这就是独立思考。不是盲目追涨，也不是盲目看空，而是理解背后的逻辑。」\n\n「你已经准备好了。让我们开始真正的旅程。」",
          },
        ],
      },
    ],
    goodEnding:
      "Lead Agent 的声音变得温和：\n\n「你做得不错。大多数新手第一次都会跟着某个声音走，但你选择了独立思考。」\n\n「记住这种感觉。在接下来的旅程里，你会遇到更多的声音、更多的数据、更多的诱惑。」\n\n「但只要你保持独立思考，你就不会迷失。」\n\n屏幕上的 K 线渐渐平稳，你的虚拟账户也稳定增长。\n\n你知道，这只是开始。但至少，你迈出了正确的第一步。",
    badEnding:
      "屏幕上的 K 线剧烈波动，你的虚拟账户亏损严重。\n\nLead Agent 没有责备你：\n\n「这就是市场的第一课。每一个交易员都会犯错，重要的是从错误中学习。」\n\n「回去看看你做的每一个选择，问问自己：当时为什么这么选？有没有更好的方式？」\n\n「当你准备好了，再试一次。」",
  },
  2: {
    opening: "你准备进入第一场 K 线交易，却发现同一只股票——岚海科技——出现了三张走势完全不同的图。\n\nData Agent 坐在行情修复台前，抬头看你：\n\n「先别急着下单。这三张图里，只有一张能用于交易。找出它。」\n\n背景：虚构股票「岚海科技」昨天收盘价为 30 元。公司今天执行每十股转增五股，除权参考价变为 20 元。",
    nodes: [
      {
        id: 1,
        scene: "【行情 A：断崖图】\n\n• 昨日收盘价：30 元\n• 今日开盘价：20.20 元\n• 图表显示跌幅：32.7%\n• 更新时间：今日 15 点\n• 复权方式：未复权\n\nK 线上出现一根巨大的阴线。\n\nLead Agent：\n「一天跌掉三成，这根线看着像公司出了大事。」",
        options: [
          { id: "a1", text: "检查复权方式——把「每十股转增五股」拖到缺口处", correct: true, feedback: "K 线重新计算，所谓暴跌变成上涨 1%。\n\nData Agent：\n「股价变低了，持股数量同时增加。图表忘了处理这件事。」\n\nLead Agent：\n「原来这根吓人的阴线，是数据画出来的。」\n\n行情 A 获得标签：「复权错误」" },
          { id: "a2", text: "出现这么大的阴线，准备卖出", correct: false, feedback: "Data Agent 皱眉：\n「你还没检查复权方式，就要交出持仓？」\n\nLead Agent：\n「图表吓你一下，你就把持仓交出去了？」" },
          { id: "a3", text: "忽略这根阴线，继续看下一张图", correct: false, feedback: "Data Agent 摇头：\n「不弄清楚原因就跳过？万一这是真的暴跌呢？」" },
        ],
      },
      {
        id: 2,
        scene: "【行情 B：完整图】\n\n• 昨日复权价格：20 元\n• 今日开盘价：20.20 元\n• 今日收盘价：20.80 元\n• 更新时间：今日 15 点\n• 成交量：完整\n• 停牌与除权记录：完整\n\n这张图显示股票上涨 4%，成交量温和增加。",
        options: [
          { id: "b1", text: "时间对齐，除权已处理，成交量完整——可用于交易", correct: true, feedback: "Data Agent 点头：\n「时间对齐，除权已经处理，价格和成交量也能互相核对。」\n\n行情 B 获得标签：「可用于交易」" },
          { id: "b2", text: "涨幅太小，不值得关注", correct: false, feedback: "Data Agent 摇头：\n「涨幅大小不是重点。重点是数据是否可靠。」" },
        ],
      },
      {
        id: 3,
        scene: "【行情 C：突破图】\n\n• 当前价格：21.60 元\n• 图表显示涨幅：8%\n• 更新时间：今日 14 点 50 分\n• 14 点 50 分后的成交量：空白\n• 收盘价格：系统自动估算\n\nK 线显示价格在收盘前突然突破。",
        options: [
          { id: "c1", text: "检查最后十分钟——把「行情延迟十分钟」拖到末尾 K 线上", correct: true, feedback: "最后一根 K 线随即消失。\n\nLead Agent：\n「我刚才已经开始想象明天继续上涨了。」\n\nData Agent：\n「市场还在走，图表替它写了结局。」\n\n行情 C 获得标签：「数据延迟」" },
          { id: "c2", text: "突破信号明确，准备追涨", correct: false, feedback: "Data Agent 拦住你：\n「最后十分钟的数据还没传回来，这根突破线来自系统估算。」\n\nLead Agent：\n「价格还没走完，你已经替它庆祝了。」" },
          { id: "c3", text: "忽略延迟问题，直接采用", correct: false, feedback: "Data Agent 摇头：\n「用不完整的数据做决策，和闭着眼睛过马路没区别。」" },
        ],
      },
      {
        id: 4,
        scene: "三张图摆在面前。\n\n• 行情 A：「复权错误」— 所谓暴跌是送股记录\n• 行情 B：「可用于交易」— 时间对齐，数据完整\n• 行情 C：「数据延迟」— 最后十分钟是系统估算\n\nData Agent：\n「现在，选一张图用于交易。」",
        options: [
          { id: "s1", text: "选择行情 B — 处理了除权，更新时间到收盘，成交量完整", correct: true, feedback: "Data Agent 微微一笑：\n「现在你看到的，才是同一把尺子量出来的价格。」\n\nLead Agent：\n「以后看见奇怪的 K 线，我得先问问图表做过什么。」" },
          { id: "s2", text: "选择行情 A — 出现大阴线，准备卖出", correct: false, feedback: "Data Agent：\n「你交易的是一次送股记录。」\n\nLead Agent：\n「图表吓你一下，你就把持仓交出去了。」\n\n——结局：「虚假暴跌」——" },
          { id: "s3", text: "选择行情 C — 突破信号明确，准备追涨", correct: false, feedback: "Data Agent：\n「最后十分钟的数据还没传回来，这根突破线来自系统估算。」\n\nLead Agent：\n「价格还没走完，你已经替它庆祝了。」\n\n——结局：「幽灵突破」——" },
        ],
      },
    ],
    goodEnding: "Data Agent 离开修复台，正式加入队伍。\n\n你解锁了技能「行情校验」：\n• K 线复权状态\n• 行情更新时间\n• 成交量缺失\n• 停牌与除权标记\n\n下一关进入 K 线交易。",
    badEnding: "你带着错误行情进入交易。\n\nData Agent 摇头：\n「三张图里有一张是对的，你没选到它。」\n\nLead Agent：\n「别灰心，下次先看数据再决策。」",
  },
  4: {
    opening: "\u4E00\u5C01\u5BC6\u5C01\u653E\u5728\u4F60\u684C\u4E0A\u3002\n\u4FE1\u5C01\u4E0A\u5199\u7740\uFF1A\u201C\u884C\u4E1A\u653F\u7B56\u8C03\u6574\u901A\u77E5\u201D\u3002\n\n\u4F60\u6253\u5F00\u4FE1\u5C01\uFF0C\u91CC\u9762\u53EA\u6709\u4E00\u53E5\u8BDD\uFF1A\n\u201C\u81EA\u4E0B\u6708\u8D77\uFF0C\u65B0\u80FD\u6E90\u8865\u8D34\u9000\u5761\uFF0C\u8BD5\u70B9\u57CE\u5E02\u6269\u5927\u81F3 30 \u4E2A\u3002\u201D\n\n\u884C\u4E1A\u5206\u6790\u5E08\u7AD9\u5728\u65C1\u8FB9\uFF0C\u7B49\u4F60\u7684\u5224\u65AD\u3002",
    nodes: [
      {
        id: 1,
        scene: "\u884C\u4E1A\u5206\u6790\u5E08\u95EE\uFF1A\n\u201C\u8FD9\u6761\u653F\u7B56\u5BF9\u65B0\u80FD\u6E90\u677F\u5757\u662F\u5229\u597D\u8FD8\u662F\u5229\u7A7A\uFF1F\u201D",
        options: [
          { id: "4-1A", text: "\u5F53\u7136\u5229\u597D\uFF0C\u8BD5\u70B9\u6269\u5927\u610F\u5473\u7740\u66F4\u5927\u5E02\u573A\u3002", correct: false, feedback: "\u201C\u4F60\u53EA\u770B\u5230\u8865\u8D34\u6269\u5927\uFF0C\u6CA1\u770B\u5230\u9000\u5761\u3002\u8FD9\u662F\u5178\u578B\u7684\u2018\u5229\u597D\u5DF2\u51FA\u2019\u4FE1\u53F7\u3002\u201D" },
          { id: "4-1B", text: "\u5206\u5F00\u770B\uFF1A\u8865\u8D34\u9000\u5761\u662F\u77ED\u671F\u5229\u7A7A\uFF0C\u8BD5\u70B9\u6269\u5927\u662F\u957F\u671F\u5229\u597D\u3002", correct: true, feedback: "\u201C\u4E0D\u9519\u3002\u653F\u7B56\u89E3\u8BFB\u4E0D\u80FD\u53EA\u770B\u4E00\u9762\u3002\u201D" },
          { id: "4-1C", text: "\u5229\u7A7A\uFF0C\u8865\u8D34\u9000\u5761\u610F\u5473\u7740\u4F01\u4E1A\u5229\u6DA6\u4E0B\u964D\u3002", correct: false, feedback: "\u201C\u4F60\u53EA\u770B\u5230\u9000\u5761\uFF0C\u6CA1\u770B\u5230\u5E02\u573A\u6269\u5BB9\u3002\u201D" },
          { id: "4-1D", text: "\u6CA1\u5F71\u54CD\uFF0C\u653F\u7B56\u53D8\u5316\u4E0D\u91CD\u8981\u3002", correct: false, feedback: "\u201C\u653F\u7B56\u662F\u884C\u4E1A\u5206\u6790\u7684\u6838\u5FC3\u53D8\u91CF\uFF0C\u4E0D\u53EF\u80FD\u6CA1\u5F71\u54CD\u3002\u201D" },
        ],
      },
      {
        id: 2,
        scene: "\u201C\u5982\u679C\u4F60\u8981\u7814\u7A76\u8FD9\u6761\u653F\u7B56\u7684\u5F71\u54CD\uFF0C\u7B2C\u4E00\u6B65\u505A\u4EC0\u4E48\uFF1F\u201D",
        options: [
          { id: "4-2A", text: "\u7ACB\u523B\u4E70\u5165\u65B0\u80FD\u6E90\u9F99\u5934\u3002", correct: false, feedback: "\u201C\u8FD8\u6CA1\u7814\u7A76\u5C31\u4E0B\u5355\uFF0C\u8FD9\u662F\u8D4C\u535A\u3002\u201D" },
          { id: "4-2B", text: "\u67E5\u770B\u653F\u7B56\u539F\u6587\uFF0C\u5BF9\u6BD4\u5386\u53F2\u7C7B\u4F3C\u653F\u7B56\u7684\u5E02\u573A\u53CD\u5E94\u3002", correct: true, feedback: "\u201C\u5148\u770B\u539F\u6587\uFF0C\u518D\u770B\u5386\u53F2\uFF0C\u6700\u540E\u4E0B\u7ED3\u8BBA\u3002\u201D" },
          { id: "4-2C", text: "\u95EE\u670B\u53CB\u5708\u91CC\u7684\u5927 V \u600E\u4E48\u770B\u3002", correct: false, feedback: "\u201C\u4F60\u7684\u7814\u7A76\u4E0D\u5E94\u5EFA\u7ACB\u5728\u522B\u4EBA\u89C2\u70B9\u4E0A\u3002\u201D" },
          { id: "4-2D", text: "\u7B49\u5E02\u573A\u6D88\u5316\u5B8C\u518D\u8BF4\u3002", correct: false, feedback: "\u201C\u88AB\u52A8\u7B49\u5F85\u4E0D\u662F\u7814\u7A76\uFF0C\u662F\u653E\u5F03\u4E3B\u52A8\u6743\u3002\u201D" },
        ],
      },
      {
        id: 3,
        scene: "\u201C\u4E00\u6761\u653F\u7B56\u51FA\u6765\u540E\uFF0C\u6700\u5BB9\u6613\u72AF\u7684\u9519\u8BEF\u662F\u4EC0\u4E48\uFF1F\u201D",
        options: [
          { id: "4-3A", text: "\u628A\u653F\u7B56\u7B49\u540C\u4E8E\u7ED3\u679C\uFF0C\u8BA4\u4E3A\u201C\u653F\u7B56\u51FA\u4E86=\u4E00\u5B9A\u6DA8\u201D\u3002", correct: true, feedback: "\u201C\u6B63\u786E\u3002\u653F\u7B56\u662F\u53D8\u91CF\uFF0C\u4E0D\u662F\u7ED3\u679C\u3002\u5E02\u573A\u5DF2\u5728\u4EF7\u683C\u91CC\u53CD\u6620\u4E86\u9884\u671F\u3002\u201D" },
          { id: "4-3B", text: "\u53EA\u770B\u653F\u7B56\u6807\u9898\u4E0D\u770B\u539F\u6587\u3002", correct: false, feedback: "\u201C\u8FD9\u4E5F\u662F\u5E38\u89C1\u9519\u8BEF\uFF0C\u4F46\u6700\u6838\u5FC3\u7684\u662F\u628A\u653F\u7B56\u7B49\u540C\u4E8E\u7ED3\u679C\u3002\u201D" },
          { id: "4-3C", text: "\u53EA\u7814\u7A76\u4E00\u4E2A\u884C\u4E1A\u4E0D\u770B\u5168\u5C40\u3002", correct: false, feedback: "\u201C\u8FD9\u662F\u89C6\u91CE\u95EE\u9898\uFF0C\u4E0D\u662F\u6700\u5BB9\u6613\u72AF\u7684\u9519\u3002\u201D" },
          { id: "4-3D", text: "\u4E0D\u5173\u6CE8\u653F\u7B56\u53D8\u5316\u3002", correct: false, feedback: "\u201C\u5B8C\u5168\u4E0D\u5173\u6CE8\u662F\u653E\u5F03\uFF0C\u4E0D\u662F\u9519\u8BEF\u3002\u201D" },
        ],
      },
    ],
    goodEnding: "\u884C\u4E1A\u5206\u6790\u5E08\u70B9\u70B9\u5934\uFF1A\n\u201C\u4F60\u80FD\u533A\u5206\u653F\u7B56\u4FE1\u53F7\u548C\u5E02\u573A\u7ED3\u679C\uFF0C\u8FD9\u5F88\u91CD\u8981\u3002\u201D\n\u201C\u6211\u662F\u4F60\u7684 Industry Agent\uFF0C\u4ECE\u73B0\u5728\u8D77\u8DDF\u4F60\u4E00\u8D77\u89E3\u8BFB\u653F\u7B56\u5BC6\u51FD\u3002\u201D\n\n\uD83C\uDFED Industry Agent \u5DF2\u89E3\u9501\uFF01",
    badEnding: "\u884C\u4E1A\u5206\u6790\u5E08\u6447\u5934\uFF1A\n\u201C\u4F60\u8FD8\u6CA1\u5B66\u4F1A\u8BFB\u61C2\u653F\u7B56\u8BED\u8A00\u3002\u201D\n\u201C\u56DE\u53BB\u7EC3\u4E60\u5206\u6790\u653F\u7B56\u539F\u6587\u5427\u3002\u201D",
  },
  9: {
    opening: "\u5706\u5F62\u8BAE\u4E8B\u5385\uFF0C\u4E24\u65B9\u5BF9\u5750\u3002\n\u5DE6\u8FB9\u662F\u725B\u65B9\u7814\u7A76\u5458\uFF0C\u53F3\u8FB9\u662F\u718A\u65B9\u7814\u7A76\u5458\u3002\n\n\u725B\u65B9\u8BF4\uFF1A\u201C\u6536\u5165\u8FDE\u7EED\u4E09\u5B63\u5EA6\u589E\u957F 30%\uFF0C\u8FD9\u662F\u6210\u957F\u80A1\u3002\u201D\n\u718A\u65B9\u8BF4\uFF1A\u201C\u4F46 PE \u5DF2\u7ECF 80 \u500D\uFF0C\u8FD9\u662F\u6CE1\u6CAB\u3002\u201D\n\n\u4ED6\u4EEC\u540C\u65F6\u770B\u5411\u4F60\uFF1A\u201C\u4F60\u600E\u4E48\u770B\uFF1F\u201D",
    nodes: [
      {
        id: 1,
        scene: "\u591A\u7A7A\u5206\u6B67\u65F6\uFF0C\u7B2C\u4E00\u6B65\u5E94\u8BE5\u505A\u4EC0\u4E48\uFF1F",
        options: [
          { id: "9-1A", text: "\u9009\u62E9\u4F60\u66F4\u4FE1\u4EFB\u7684\u4E00\u65B9\uFF0C\u7AD9\u961F\u3002", correct: false, feedback: "\u201C\u7814\u7A76\u4E0D\u662F\u7AD9\u961F\u3002\u4F60\u8981\u540C\u65F6\u7406\u89E3\u4E24\u65B9\u903B\u8F91\u3002\u201D" },
          { id: "9-1B", text: "\u62C6\u89E3\u53CC\u65B9\u8BBA\u636E\uFF0C\u68C0\u67E5\u5404\u81EA\u5047\u8BBE\u6761\u4EF6\u662F\u5426\u6210\u7ACB\u3002", correct: true, feedback: "\u201C\u6B63\u786E\u3002\u591A\u7A7A\u5206\u6790\u7684\u6838\u5FC3\u4E0D\u662F\u9009\u8FB9\u7AD9\uFF0C\u662F\u68C0\u9A8C\u5047\u8BBE\u3002\u201D" },
          { id: "9-1C", text: "\u4E24\u65B9\u90FD\u4E0D\u4FE1\uFF0C\u81EA\u5DF1\u91CD\u65B0\u7814\u7A76\u3002", correct: false, feedback: "\u201C\u5FFD\u89C6\u5DF2\u6709\u7814\u7A76\u6210\u679C\u662F\u6D6A\u8D39\u65F6\u95F4\u3002\u5148\u62C6\u89E3\uFF0C\u518D\u8865\u5145\u3002\u201D" },
          { id: "9-1D", text: "\u7B49\u5E02\u573A\u7ED9\u51FA\u65B9\u5411\u518D\u8BF4\u3002", correct: false, feedback: "\u201C\u7B49\u5E02\u573A\u7ED9\u65B9\u5411\u5C31\u665A\u4E86\u3002\u7814\u7A76\u7684\u4EF7\u503C\u5728\u63D0\u524D\u5224\u65AD\u3002\u201D" },
        ],
      },
      {
        id: 2,
        scene: "\u725B\u65B9\uFF1A\u201C\u673A\u6784\u6301\u4ED3\u589E\u52A0\uFF0C\u5317\u5411\u8D44\u91D1\u6D41\u5165\u3002\u201D\n\u718A\u65B9\uFF1A\u201C\u878D\u8D44\u4F59\u989D\u521B\u5386\u53F2\u65B0\u9AD8\u3002\u201D\n\n\u4F60\u600E\u4E48\u770B\u5F85\u8FD9\u4E24\u4E2A\u4FE1\u53F7\uFF1F",
        options: [
          { id: "9-2A", text: "\u673A\u6784\u4E70\u5C31\u662F\u597D\u80A1\uFF0C\u725B\u65B9\u8D62\u3002", correct: false, feedback: "\u201C\u673A\u6784\u4E5F\u4F1A\u88AB\u5957\u3002\u4E0D\u80FD\u7B80\u5355\u8DDF\u98CE\u3002\u201D" },
          { id: "9-2B", text: "\u878D\u8D44\u65B0\u9AD8\u8BF4\u660E\u5E02\u573A\u8FC7\u70ED\uFF0C\u718A\u65B9\u8D62\u3002", correct: false, feedback: "\u201C\u878D\u8D44\u65B0\u9AD8\u662F\u98CE\u9669\u4FE1\u53F7\uFF0C\u4F46\u4E0D\u7B49\u4E8E\u7ACB\u523B\u4E0B\u8DCC\u3002\u201D" },
          { id: "9-2C", text: "\u4E24\u4E2A\u90FD\u662F\u6709\u6548\u4FE1\u53F7\uFF0C\u8981\u7ED3\u5408\u4F30\u503C\u548C\u57FA\u672C\u9762\u7EFC\u5408\u5224\u65AD\u3002", correct: true, feedback: "\u201C\u6B63\u786E\u3002\u591A\u7A7A\u89C2\u70B9\u90FD\u662F\u8F93\u5165\u53D8\u91CF\uFF0C\u6700\u7EC8\u8981\u7EFC\u5408\u5224\u65AD\u3002\u201D" },
          { id: "9-2D", text: "\u4E24\u4E2A\u4FE1\u53F7\u77DB\u76FE\uFF0C\u65E0\u6CD5\u5224\u65AD\u3002", correct: false, feedback: "\u201C\u4FE1\u53F7\u77DB\u76FE\u6B63\u662F\u7814\u7A76\u7684\u8D77\u70B9\uFF0C\u4E0D\u662F\u7EC8\u70B9\u3002\u201D" },
        ],
      },
      {
        id: 3,
        scene: "\u201C\u591A\u7A7A\u8FA9\u8BBA\u7684\u771F\u6B63\u4EF7\u503C\u662F\u4EC0\u4E48\uFF1F\u201D",
        options: [
          { id: "9-3A", text: "\u627E\u5230\u6B63\u786E\u7B54\u6848\u3002", correct: false, feedback: "\u201C\u591A\u7A7A\u8FA9\u8BBA\u6CA1\u6709\u6B63\u786E\u7B54\u6848\uFF0C\u53EA\u6709\u66F4\u597D\u7684\u95EE\u9898\u3002\u201D" },
          { id: "9-3B", text: "\u5E2E\u4F60\u505A\u51FA\u6700\u7EC8\u51B3\u7B56\u3002", correct: false, feedback: "\u201C\u51B3\u7B56\u6C38\u8FDC\u662F\u4F60\u81EA\u5DF1\u505A\u7684\u3002\u201D" },
          { id: "9-3C", text: "\u66B4\u9732\u4F60\u6CA1\u60F3\u5230\u7684\u98CE\u9669\u548C\u673A\u4F1A\uFF0C\u8BA9\u7814\u7A76\u66F4\u5B8C\u6574\u3002", correct: true, feedback: "\u201C\u6B63\u786E\u3002\u591A\u7A7A\u8FA9\u8BBA\u7684\u4EF7\u503C\u5728\u4E8E\u66B4\u9732\u76F2\u533A\u3002\u201D" },
          { id: "9-3D", text: "\u8BC1\u660E\u81EA\u5DF1\u662F\u5BF9\u7684\u3002", correct: false, feedback: "\u201C\u7814\u7A76\u4E0D\u662F\u4E3A\u4E86\u8BC1\u660E\u81EA\u5DF1\u6B63\u786E\uFF0C\u662F\u4E3A\u4E86\u63A5\u8FD1\u771F\u76F8\u3002\u201D" },
        ],
      },
    ],
    goodEnding: "\u725B\u65B9\u548C\u718A\u65B9\u540C\u65F6\u7AD9\u8D77\u6765\uFF0C\u5411\u4F60\u4F38\u624B\u3002\n\u201C\u4F60\u4E0D\u9009\u8FB9\u7AD9\uFF0C\u4F60\u9009\u601D\u8003\u3002\u201D\n\u201C\u6211\u4EEC\u90FD\u662F\u4F60\u7684\u961F\u53CB\u3002\u201D\n\n\uD83D\uDC02 Bull Agent + \uD83D\uDC3B Bear Agent \u5DF2\u89E3\u9501\uFF01",
    badEnding: "\u725B\u65B9\u548C\u718A\u65B9\u540C\u65F6\u6447\u5934\uFF1A\n\u201C\u4F60\u8FD8\u6CA1\u5B66\u4F1A\u5982\u4F55\u540C\u65F6\u542C\u53D6\u4E24\u65B9\u89C2\u70B9\u3002\u201D\n\u201C\u56DE\u53BB\u7EC3\u4E60\u591A\u89D2\u5EA6\u601D\u8003\u5427\u3002\u201D",
  },
};
