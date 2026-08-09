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
    opening:
      "地下交易厅里，三块行情屏幕同时亮起。\n\n屏幕上都是「岚海科技」，走势却完全不同。\n\n行情 A 显示暴跌。\n行情 B 显示上涨。\n行情 C 显示突破。\n\nLead Agent：\n「同一只股票，三张图，三个结果。这里卖的到底是什么行情？」\n\n角落里传来键盘声。Data Agent 坐在行情修复台前，抬头看了一眼。\n\nData Agent：\n「这里什么数据都有，完整的、过期的，还有系统临时编出来的。」\n\nLead Agent：\n「你能找出真的那张吗？」\n\nData Agent：\n「我能。今天轮到你找。」\n\nData Agent 把「行情扫描器」交给玩家。\n\n扫描器只能检查三项内容：\n• 公司记录\n• 更新时间\n• 数据缺口\n\n玩家需要检查三张行情，从中找出能够用于交易的一张。",
    nodes: [
      {
        id: 1,
        scene:
          "【调查行情 A】\n\n行情 A 显示岚海科技从 30 元跌到 20.20 元，屏幕上出现一根巨大的下跌 K 线。\n\nLead Agent：\n「跌了三成。看起来有人提前逃跑了。」\n\n扫描器提示「发现公司记录」。\n\n玩家点击查看，屏幕弹出公告：\n「岚海科技今日调整股数，每十股变成十五股。」\n\n画面出现十枚股票筹码，随后变成十五枚。单枚价格从 30 元变成约 20 元，筹码总价值保持一致。\n\n巨大的下跌 K 线随即恢复，涨幅变为 1%。",
        options: [
          {
            id: "a1",
            text: "标记行情 A 的问题",
            correct: true,
            feedback:
              "Lead Agent：\n「屏幕只画了价格变化，漏掉了增加的股数。」\n\nData Agent：\n「旧价格和新价格放在一起比较，再普通的行情也能画成灾难。」\n\n行情 A 被标记为：「价格记录错误」",
          },
          {
            id: "a2",
            text: "相信暴跌，准备卖出",
            correct: false,
            feedback:
              "Data Agent 拦住你：\n「你还没检查公司记录，就要交出持仓？」\n\nLead Agent：\n「图表吓你一下，你就把持仓交出去了？」",
          },
          {
            id: "a3",
            text: "忽略这张图，直接看下一张",
            correct: false,
            feedback:
              "Data Agent 摇头：\n「不弄清楚原因就跳过？万一这是真的暴跌呢？」",
          },
        ],
      },
      {
        id: 2,
        scene:
          "【调查行情 C】\n\n行情 C 的最后一根 K 线快速上涨，屏幕不断闪烁「突破信号」。\n\nLead Agent：\n「这张图倒是挺会让人心动。」\n\n扫描器提示「更新时间异常」。\n\n玩家点击屏幕上的时间：\n「最后更新时间：14 点 50 分」\n\n当天收盘时间为 15 点。\n\n玩家继续扫描最后一根 K 线，发现一行小字：\n「收盘价格由系统估算」\n\n最后一根 K 线开始闪烁，随后从屏幕上消失。",
        options: [
          {
            id: "c1",
            text: "标记行情 C 的问题",
            correct: true,
            feedback:
              "Lead Agent：\n「市场还在交易，系统已经替它收盘了。」\n\nData Agent：\n「越像机会的数据，越值得多看一眼时间。」\n\n行情 C 被标记为：「行情尚未更新完成」",
          },
          {
            id: "c2",
            text: "相信突破信号，准备追涨",
            correct: false,
            feedback:
              "Data Agent 拦住你：\n「最后十分钟的数据还没传回来，这根突破线来自系统估算。」\n\nLead Agent：\n「价格还没走完，你已经替它庆祝了。」",
          },
          {
            id: "c3",
            text: "忽略时间问题，直接采用",
            correct: false,
            feedback:
              "Data Agent 摇头：\n「用不完整的数据做决策，和闭着眼睛过马路没区别。」",
          },
        ],
      },
      {
        id: 3,
        scene:
          "【调查行情 B】\n\n行情 B 显示岚海科技上涨 4%，成交量温和增加。\n\n扫描器依次检查：\n• 公司股数变化已经记录 ✓\n• 行情更新至 15 点 ✓\n• 价格和成交量记录完整 ✓\n\n屏幕上的三项检查全部亮起绿色提示。",
        options: [
          {
            id: "b1",
            text: "确认行情 B 数据完整",
            correct: true,
            feedback:
              "Lead Agent：\n「这张图看起来最普通。」\n\nData Agent：\n「完整的数据经常就是这样，看着没什么戏剧性。」\n\n行情 B 被标记为：「数据完整」",
          },
          {
            id: "b2",
            text: "涨幅太小，不值得关注",
            correct: false,
            feedback:
              "Data Agent 摇头：\n「涨幅大小不是重点。重点是数据是否可靠。」",
          },
        ],
      },
      {
        id: 4,
        scene:
          "【提交选择】\n\n三张行情并排显示。\n\n行情 A：「价格记录错误」\n行情 B：「数据完整」\n行情 C：「行情尚未更新完成」\n\nData Agent：\n「检查结束。选一张带进交易室。」",
        options: [
          {
            id: "s1",
            text: "选择行情 B — 公司记录完整，时间到了收盘，价格和成交量也能对应",
            correct: true,
            feedback:
              "玩家：\n「公司记录完整，时间到了收盘，价格和成交量也能对应。」\n\nData Agent：\n「这张行情可以进入交易室。」\n\nLead Agent：\n「原来最刺激的走势，反而最需要检查。」",
          },
          {
            id: "s2",
            text: "选择行情 A — 相信这场暴跌",
            correct: false,
            feedback:
              "玩家：\n「我相信这场暴跌。」\n\nLead Agent 按下卖出按钮。\n\n行情修复后，暴跌从屏幕上消失。\n\nData Agent：\n「你卖掉股票的原因，来自一条漏掉的公司记录。」\n\nLead Agent：\n「图表吓了我一下，我就把持仓交出去了。」\n\n——结局：「卖给一条假阴线」——",
          },
          {
            id: "s3",
            text: "选择行情 C — 相信这个突破",
            correct: false,
            feedback:
              "玩家：\n「我相信这个突破。」\n\nLead Agent 按下买入按钮。\n\n最后一根 K 线闪烁几次，随后消失。\n\nData Agent：\n「最后十分钟的数据刚刚传回来，系统估算的突破也跟着消失了。」\n\nLead Agent：\n「我追上了一根提前画好的线。」\n\n——结局：「买入系统的想象」——",
          },
        ],
      },
    ],
    goodEnding:
      "Data Agent 关闭修复台，起身加入队伍。\n\n屏幕显示：\n「Data Agent 已加入队伍」\n\n角色介绍：\n「他会检查行情从哪里来、更新到什么时候，以及中间缺了什么。」\n\n玩家获得技能：「行情扫描」\n\n技能可以检查：\n• 公司记录\n• 行情时间\n• 数据缺口\n\n交易室的大门打开，里面出现一张完整的 K 线图。\n\nLead Agent：\n「现在数据可信了，我总算能开始交易。」\n\nData Agent：\n「数据能告诉你发生了什么。接下来，你还得判断该怎么做。」\n\n下一关开启：「K 线交易」",
    badEnding:
      "你带着错误的行情进入交易。\n\nData Agent 摇头：\n「三张图里有一张是对的，你没选到它。」\n\nLead Agent：\n「别灰心，下次先看数据再决策。」\n\n点击「重新鉴定」返回最终选择。",
  },
  3: {
    opening:
      "地下交易大厅响起警报，窗外下着大雨。\n\n屏幕中央显示：\n• 沧海指数下跌 4.8%\n• 青禾零售下跌 0.8%\n\nLead Agent 靠近买入按钮：\n「整个市场跌了快 5%，青禾零售只跌了 0.8%。它明显更强，我想趁现在多买一点。」\n\nData Agent 检查行情：\n「数据已经更新到收盘，价格记录完整。」\n\nLead Agent：\n「数据是真的，机会应该也是真的。」\n\n大厅角落里，Market Agent 正在喝茶：\n「你现在只看见一只股票。把镜头拉远一点。」\n\nMarket Agent 打开一台市场观察仪。\n\n仪器中央显示青禾零售，旁边有一根「观察范围」拉杆。\n\n拉杆分成三档：\n• 青禾零售\n• 零售行业\n• 全市场",
    nodes: [
      {
        id: 1,
        scene:
          "【第一档 青禾零售】\n\n屏幕上只显示青禾零售。\n\n• 今日跌幅为 0.8%\n• 成交量有所减少\n• 表现强于沧海指数\n\nLead Agent：\n「单看这张图，它确实挺稳。」",
        options: [
          {
            id: "m1",
            text: "把拉杆拉到「零售行业」，继续拉远",
            correct: true,
            feedback:
              "Market Agent：\n「继续拉远。」",
          },
          {
            id: "m1w",
            text: "它比大盘强，直接加大仓位",
            correct: false,
            feedback:
              "Market Agent 摇头：\n「你还没看清楚周围是什么。」",
          },
        ],
      },
      {
        id: 2,
        scene:
          "【第二档 零售行业】\n\n镜头拉远，青禾零售周围出现其他零售股票。\n\n十只零售股票中，有八只正在下跌。\n\n青禾零售像一把暂时保持完整的雨伞，周围不断落雨。\n\nLead Agent：\n「它比同行跌得少，可整个零售行业都在下跌。」\n\nData Agent：\n「行业数据已经更新到今天收盘。」",
        options: [
          {
            id: "m2",
            text: "把拉杆推到「全市场」，看看行业外面",
            correct: true,
            feedback:
              "Market Agent：\n「再看看行业外面。」",
          },
          {
            id: "m2w",
            text: "行业在跌但它最强，足够了",
            correct: false,
            feedback:
              "Market Agent：\n「你只看见了一把伞，没看见雨有多大。」",
          },
        ],
      },
      {
        id: 3,
        scene:
          "【第三档 全市场】\n\n玩家把拉杆推到「全市场」。\n\n屏幕变成由一百个股票方格组成的市场地图。\n\n• 84 只股票下跌\n• 9 只股票持平\n• 7 只股票上涨\n• 10 个行业中有 8 个下跌\n\n大厅里的红灯全部亮起，窗外雨声加重。\n\n青禾零售只占市场地图中的一个小方格。\n\nLead Agent：\n「刚才它占满了整块屏幕。现在看起来，它只是风暴里的一只股票。」\n\nMarket Agent：\n「镜头离得太近，任何股票都像整个世界。」",
        options: [
          {
            id: "m3",
            text: "确认当前状态：全市场风暴",
            correct: true,
            feedback:
              "观察仪发出确认声。\n\nMarket Agent：\n「青禾零售表现较强，这条信息值得保留。整个市场还在摇晃，这条信息更加重要。」",
          },
          {
            id: "m3w1",
            text: "只是个股下雨，青禾零售没问题",
            correct: false,
            feedback:
              "Market Agent 指向屏幕：\n「雨已经落满整个大厅了。」",
          },
          {
            id: "m3w2",
            text: "只是行业下雨，零售行业的问题",
            correct: false,
            feedback:
              "Data Agent：\n「下跌同时出现在多个行业，不只是零售。」",
          },
        ],
      },
      {
        id: 4,
        scene:
          "【制定行动】\n\nLead Agent 原本准备大幅增加青禾零售的仓位。\n\n屏幕出现两个计划：\n• 现在加大仓位\n• 保留小仓位，观察三天\n\nMarket Agent：\n「市场每天都会给你一个改变计划的理由。」",
        options: [
          {
            id: "m4",
            text: "保留小仓位，观察三天",
            correct: true,
            feedback:
              "玩家取消加仓，保留原有小仓位。\n\nLead Agent：\n「它继续上涨时，我们手里还有一些。市场继续下跌时，大部分资金也还在。」\n\nData Agent：\n「三天观察计划已经记录。」",
          },
          {
            id: "m4w",
            text: "现在加大仓位，趁它比市场强",
            correct: false,
            feedback:
              "玩家买入青禾零售。\n\nLead Agent：\n「它比市场强，等风暴过去，它应该会先涨。」\n\nMarket Agent：\n「你看见了一把暂时完整的伞，于是把所有行李都放到了伞下。」",
          },
        ],
      },
      {
        id: 5,
        scene:
          "【第二天 绿色诱饵】\n\n大厅警报停止，所有屏幕突然转绿。\n\n• 沧海指数上涨 1.8%\n• 青禾零售上涨 2.6%\n\n买入按钮发出金色光芒，并不断跳动。\n\nLead Agent 立刻站起来：\n「它真的涨了。昨天多买一点就好了。」\n\n屏幕出现两个按钮：\n• 现在追涨\n• 继续观察",
        options: [
          {
            id: "m5",
            text: "继续观察，遵守三天计划",
            correct: true,
            feedback:
              "玩家点击「继续观察」。\n\n买入按钮的光芒逐渐变暗。\n\nLead Agent：\n「看着它上涨却不追，确实有点难受。」\n\nMarket Agent：\n「难受会过去，买入记录会留下。」",
          },
          {
            id: "m5w",
            text: "现在追涨，别错过机会",
            correct: false,
            feedback:
              "玩家按下买入按钮。\n\nMarket Agent 看向墙上的三天计划：\n「市场只用一天上涨，就换走了你的计划。」",
          },
        ],
      },
      {
        id: 6,
        scene:
          "【第三天 风暴返回】\n\n大厅再次响起警报。\n\n• 沧海指数下跌 3.1%\n• 青禾零售下跌 5.4%\n• 全市场有 79 只股票下跌\n\n第二天的绿色画面被雨水冲掉。",
        options: [
          {
            id: "m6",
            text: "坚持观察计划，保留小仓位",
            correct: true,
            feedback:
              "账户只出现小幅变化，大部分资金仍然保留。\n\nLead Agent：\n「青禾零售确实比市场强，可这三天里，它仍然被市场带着走。」\n\nData Agent：\n「三天数据完整，市场风险仍然存在。」",
          },
          {
            id: "m6w",
            text: "风暴来了，全部清仓",
            correct: false,
            feedback:
              "Market Agent：\n「风暴来的时候清仓，风暴走的时候追涨。你在替市场做贡献。」",
          },
        ],
      },
    ],
    goodEnding:
      "Market Agent 放下茶杯，走到队伍面前。\n\n「看一只股票，你会找到故事。看整个市场，你才知道这个故事遇上了什么天气。」\n\nLead Agent：\n「下次我看见一只逆势股票，会先把镜头拉远。」\n\nMarket Agent 正式加入队伍。\n\n屏幕显示：\n「Market Agent 已加入队伍」\n\n角色介绍：\n「他观察资金正在躲避什么，也观察整个市场正在相信什么。」\n\n玩家获得技能：「市场天气」\n\n使用技能后，观察范围会从个股扩大到全市场，并显示：\n• 上涨和下跌股票的比例\n• 行业整体表现\n• 个股与市场的差异\n\n窗外的雨逐渐减小。\n\nMarket Agent 拿起外套，走向交易室：\n「雨停之前，先学会控制仓位。雨停之后，再判断哪把伞真的结实。」\n\n下一关开启：「行业迷雾」",
    badEnding:
      "账户中的亏损数字快速扩大。\n\nLead Agent：\n「昨天那次上涨，让我以为风暴已经结束了。」\n\nData Agent：\n「仓位增加后，今天的损失也跟着增加。」\n\nMarket Agent：\n「你判断了明天的涨跌，却忘了自己还站在风暴里。」\n\n结局：「逆风开满帆」\n\n玩家可以返回制定行动的环节重新选择。",
  },
  4: {
    opening: `玩家正在团队办公室看盘，手机弹出政策通知。中央屏幕上的冷链板块快速上涨，鲜达生活接近涨停。

Lead Agent 神情兴奋，身体靠近行情屏幕。

Lead Agent：
"政策刚发布，冷链板块已经涨了 7%。鲜达生活快涨停了，我们要不要跟上？"

Market Agent 神情平静，双手抱在胸前。

Market Agent：
"市场已经读完标题，正文读到哪一页还不好说。"

Data Agent 打开政策文件，轻推眼镜。

Data Agent：
"文件签章有效，发布时间是今天上午九点。原文共有六页，群聊里只转发了第一页。"

Lead Agent 的笑容收住了一些。

Lead Agent：
"六页？我刚才只看见了'支持冷链发展'。"

办公室侧门打开，里面是一间堆满文件的档案室。

Industry Agent 坐在文件堆后，手中拿着政策原文。他神情平静，抬眼看向玩家。

Industry Agent：
"标题负责把人叫进来，第四页才告诉你钱准备给谁。"

系统提示：
进入政策档案室，找出政策真正支持的对象。`,
    nodes: [
      // 场景二：阅读政策原文
      {
        id: 1,
        scene: `【场景二 阅读政策原文】

档案室使用暖黄色灯光，墙上贴着城市地图和行业关系图。中央桌面放着六页政策文件。

Industry Agent 将三段文字推到玩家面前：

• 支持冷链产业发展
• 开展五座城市试点
• 补贴完成备案的公共冷库改造项目

系统提问：
这份政策直接支持什么？`,
        options: [
          {
            id: "r1_correct",
            text: "五座城市的备案冷库改造项目",
            correct: true,
            feedback: `玩家：
"政策直接支持五座试点城市中完成备案的公共冷库改造项目。"

Data Agent 微微点头：
"内容与原文一致。"

Industry Agent 露出轻微笑意：
"范围找到了。现在看看谁站在这个范围里。"

玩家获得政策标签：
• 五座试点城市
• 备案项目
• 验收后补贴`
          },
          {
            id: "r1_wrong1",
            text: "所有冷链相关公司",
            correct: false,
            feedback: `Lead Agent 神情期待：
"文件里确实写了支持冷链产业。"

Industry Agent 抬起一侧眉毛：
"前面是方向，后面才是范围。五座城市和备案项目都被你跳过去了。"`
          },
          {
            id: "r1_wrong2",
            text: "生鲜购物平台",
            correct: false,
            feedback: `Data Agent 指向文件内容：
"原文没有出现购物平台，也没有提供平台补贴。"

Industry Agent 轻轻敲了一下第四页：
"名字里有生鲜，和拿到补贴隔着几道门。"`
          }
        ]
      },
      // 场景三：完成受益关系图 - 北港仓储
      {
        id: 2,
        scene: `【场景三 完成受益关系图】

墙上的行业图亮起。中心位置是"公共冷库改造"，周围有三个空位，分别标注"直接相关""间接相关"和"关系较弱"。

【北港仓储】公司卡显示：
• 在四座试点城市经营冷库
• 拥有六个备案项目
• 计划升级制冷设备

Industry Agent：
"它经营政策支持的项目。应该放在哪个位置？"`,
        options: [
          {
            id: "r2_correct",
            text: `放在"直接相关"位置`,
            correct: true,
            feedback: `Industry Agent：
"它经营政策支持的项目，位置最近。"

北港仓储被放置在"直接相关"位置。`
          },
          {
            id: "r2_wrong1",
            text: `放在"间接相关"位置`,
            correct: false,
            feedback: `Industry Agent 摇头：
"它直接经营政策支持的项目，不是间接受益。"`
          },
          {
            id: "r2_wrong2",
            text: `放在"关系较弱"位置`,
            correct: false,
            feedback: `Industry Agent 摇头：
"它拥有六个备案项目，关系不弱。"`
          }
        ]
      },
      // 场景三：完成受益关系图 - 霜塔设备
      {
        id: 3,
        scene: `【霜塔设备】公司卡显示：
• 生产冷库压缩机
• 尚未获得新订单
• 客户包括冷库建设单位

Industry Agent：
"项目开始采购后，它才可能获得订单。应该放在哪个位置？"`,
        options: [
          {
            id: "r3_correct",
            text: `放在"间接相关"位置`,
            correct: true,
            feedback: `Industry Agent：
"项目开始采购后，它才可能获得订单。箭头多走了一步。"

霜塔设备被放置在"间接相关"位置。`
          },
          {
            id: "r3_wrong1",
            text: `放在"直接相关"位置`,
            correct: false,
            feedback: `Industry Agent 摇头：
"它还没有获得新订单，不是直接受益。"`
          },
          {
            id: "r3_wrong2",
            text: `放在"关系较弱"位置`,
            correct: false,
            feedback: `Industry Agent 摇头：
"它的客户包括冷库建设单位，关系不弱。"`
          }
        ]
      },
      // 场景三：完成受益关系图 - 鲜达生活
      {
        id: 4,
        scene: `【鲜达生活】公司卡显示：
• 经营生鲜购物平台
• 使用第三方冷库
• 没有备案改造项目

Lead Agent 看着鲜达生活的涨停价格，神情困惑。

Lead Agent：
"它和政策关系最远，今天却涨得最快。"

Market Agent 看向行情屏幕：
"市场喜欢容易记住的名字。鲜达、冷链，两个词已经够热闹了。"

Industry Agent：
"股价跑在前面，政策文件仍然留在原地。应该放在哪个位置？"`,
        options: [
          {
            id: "r4_correct",
            text: `放在"关系较弱"位置`,
            correct: true,
            feedback: `Industry Agent：
"名字里有生鲜，不等于拿到补贴。"

鲜达生活被放置在"关系较弱"位置。

玩家完成受益关系图。`
          },
          {
            id: "r4_wrong1",
            text: `放在"直接相关"位置`,
            correct: false,
            feedback: `Industry Agent 摇头：
"它没有自营冷库和备案改造项目。"`
          },
          {
            id: "r4_wrong2",
            text: `放在"间接相关"位置`,
            correct: false,
            feedback: `Industry Agent 摇头：
"它使用第三方冷库，连间接关系都算不上。"`
          }
        ]
      },
      // 场景四：处理投资选择
      {
        id: 5,
        scene: `【场景四 处理投资选择】

画面回到团队办公室。中央屏幕同时显示三家公司和当日涨幅。

| 公司 | 当日涨幅 | 当前信息 |
| 北港仓储 | +2.1% | 六个备案项目，等待地方项目名单 |
| 霜塔设备 | +5.4% | 暂无新增订单 |
| 鲜达生活 | +9.8% | 公司没有自营冷库 |

系统提问：
你准备如何处理这份政策信息？`,
        options: [
          {
            id: "r5_correct",
            text: "将北港仓储加入研究清单",
            correct: true,
            feedback: `玩家：
"北港仓储处在政策支持范围内，但补贴需要等项目验收。我先记录项目名单和进度。"

Lead Agent 神情有些遗憾：
"所以这次什么都不买？"

Data Agent：
"公司与政策关系已经确认，项目收入和财务影响仍需后续检查。"

Market Agent 露出认可神情：
"市场今天已经给了它一个价格，你还可以给自己一点时间。"

Industry Agent 站起身，将政策关系图收进文件夹。
"政策告诉你资金可能流向哪里，也告诉你需要等待多久。你读到了完整的句子。"`
          },
          {
            id: "r5_wrong1",
            text: "追涨鲜达生活",
            correct: false,
            feedback: `玩家：
"它涨得最快，市场肯定认为它最受益。"

Lead Agent 神情兴奋：
"涨停附近的股票，通常最容易吸引注意。"

Data Agent：
"公司业务已经核对，它没有自营冷库和备案改造项目。"

Industry Agent 神情失望，合上政策文件。
"你选择了股价的反应，却放下了刚刚完成的关系图。"

第二天，鲜达生活发布说明：
公司仓储服务全部由第三方提供，本次政策预计不会直接影响公司经营。

鲜达生活下跌 8%。

结局：「文件还没读完，股价已经读完」`
          },
          {
            id: "r5_wrong2",
            text: "买入整个冷链板块",
            correct: false,
            feedback: `玩家：
"政策影响范围还在扩大，买一组公司更稳妥。"

Market Agent 眉头轻皱：
"板块里的公司共享一个名字，收入来源却各不相同。"

Industry Agent 指向关系图：
"你刚刚把它们放在三个位置，现在又用一个价格判断它们。"

第二天，板块热度下降。关系较弱的公司跌幅明显。

结局：「一张文件买了一篮子名字」`
          }
        ]
      }
    ],
    goodEnding: `档案室的文件柜依次亮起，墙上的政策关系图变成蓝色。Industry Agent 从文件堆后走到玩家面前。

Industry Agent 神情温和，手中拿着整理好的政策文件。

Industry Agent：
"政策从来不只是一句口号。范围、对象和时间，少看一个，意思都会改变。"

Lead Agent 露出轻松笑容：
"以后看到政策概念，我会先找文件里的具体对象。"

Data Agent 微微点头：
"文件真实，范围明确，缺失信息也已经标出。"

Market Agent：
"等市场开始讲故事时，我们至少知道故事从哪一页开始走样。"

「Industry Agent 已加入队伍」

角色介绍：
"他会检查政策从哪里来、支持谁、以及什么时候落地。"

玩家解锁技能：「政策地图」

技能可以查看：
• 政策影响范围
• 直接与间接受益方向
• 政策执行条件
• 可能的落地时间`,
    badEnding: `文件还在这里。愿意从第一页重读，随时回来。

Industry Agent 恢复平静神情：
"文件还在这里。愿意从第一页重读，随时回来。"`
  },
  // 第5关：价格审判庭（Valuation Agent）
  5: {
    opening: `审判庭使用深色木质装饰，墙上挂着一块巨大的价格屏幕。中央被告席上摆着"32 元"的发光价签。

Valuation Agent 坐在高处，手边放着一把金色小锤。他神情严肃，目光落在价格标签上。

Lead Agent 站在左侧，怀里抱着北港仓储的研究文件。他神情自信。

Lead Agent：
"北港仓储经营稳定，还在四座试点城市拥有项目。我觉得这次终于找到一家值得长期持有的公司。"

Industry Agent 翻开政策关系图，神情平静。

Industry Agent：
"公司确实位于政策支持范围内，六个项目也完成了备案。"

Data Agent 轻推眼镜：
"近三年经营利润持续增长，公司目前没有明显经营异常。"

Lead Agent 露出笑容：
"公司和政策都确认了。三十二元应该还能接受。"

Market Agent 看向价格屏幕，眉毛微微抬起。

Market Agent：
"一个月前，它的价格是十九块五。现在市场里愿意谈它的人多了不少。"

Valuation Agent 拿起小锤，神情没有变化。

Valuation Agent：
"公司资料已经提交。现在接受审判的是三十二元的价签。"

系统提示：
听取证词，把三条信息放入估值天平。`,
    nodes: [
      // 证词卡一：现有业务
      {
        id: 1,
        scene: `【证词卡一 现有业务】

卡片内容：
"北港仓储目前在四座城市经营公共冷库，近三年经营利润保持增长。"

天平下方有三个区域：
• 已经发生
• 可能发生
• 市场想象

这张证词应该放在哪个区域？`,
        options: [
          {
            id: "t1_correct",
            text: `放在"已经发生"区域`,
            correct: true,
            feedback: `Data Agent 神情专注：
"这些数字来自已经完成的经营记录。"

Valuation Agent：
"已经发生的利润，可以进入价格计算。"

证词卡一放入"已经发生"区域，天平左侧微微下沉。`
          },
          {
            id: "t1_wrong1",
            text: `放在"可能发生"区域`,
            correct: false,
            feedback: `Valuation Agent 摇头：
"这是已经完成的经营记录，不是未来的可能性。"`
          },
          {
            id: "t1_wrong2",
            text: `放在"市场想象"区域`,
            correct: false,
            feedback: `Valuation Agent 摇头：
"这是实际发生的数据，不是市场的想象。"`
          }
        ]
      },
      // 证词卡二：六个备案项目
      {
        id: 2,
        scene: `【证词卡二 六个备案项目】

卡片内容：
"六个冷库改造项目已经备案，补贴将在项目验收后发放。"

这张证词应该放在哪个区域？`,
        options: [
          {
            id: "t2_correct",
            text: `放在"可能发生"区域`,
            correct: true,
            feedback: `Industry Agent 指向"验收后发放"几个字：
"项目已经进入政策范围，收入仍要等待建设和验收。"

Valuation Agent：
"可能发生的收益，可以给出空间，不能提前当作全部利润。"

证词卡二放入"可能发生"区域。`
          },
          {
            id: "t2_wrong1",
            text: `放在"已经发生"区域`,
            correct: false,
            feedback: `Valuation Agent 摇头：
"项目还没验收，补贴还没发放。这不是已经发生的事。"`
          },
          {
            id: "t2_wrong2",
            text: `放在"市场想象"区域`,
            correct: false,
            feedback: `Industry Agent 摇头：
"项目已经完成备案，是真实的政策范围，不是市场想象。"`
          }
        ]
      },
      // 证词卡三：全国扩张传闻
      {
        id: 3,
        scene: `【证词卡三 全国扩张传闻】

卡片内容：
"市场传言公司将在明年进入全国二十座城市。"

这张证词应该放在哪个区域？`,
        options: [
          {
            id: "t3_correct",
            text: `放在"市场想象"区域`,
            correct: true,
            feedback: `Market Agent 露出轻微笑意：
"这条消息在群聊里转了很多次，公司一直没有确认。"

Lead Agent 的表情出现犹豫：
"我刚才已经把全国扩张算进未来了。"

Valuation Agent：
"市场想象能够推高价格，却无法保证公司按时到达那里。"

证词卡三放入"市场想象"区域。估值天平整理完成。`
          },
          {
            id: "t3_wrong1",
            text: `放在"已经发生"区域`,
            correct: false,
            feedback: `Valuation Agent 摇头：
"公司还没有确认这个消息，怎么能算已经发生？"`
          },
          {
            id: "t3_wrong2",
            text: `放在"可能发生"区域`,
            correct: false,
            feedback: `Market Agent 摇头：
"连公司都没有确认，这连'可能'都算不上，只是市场的想象。"`
          }
        ]
      },
      // 查看价格尺
      {
        id: 4,
        scene: `【价格尺】

天平消失，中央出现一把横向价格尺。22 元到 27 元使用蓝色，30 元到 32 元变成红色。

Valuation Agent 用小锤指向三个区间：

• 22-24 元：现有业务支持（蓝色）
• 24-27 元：六个项目顺利完成（蓝色）
• 30-32 元：项目成功 + 全国扩张（红色）

Valuation Agent：
"三十二元已经把全国扩张和项目成功放进价格。任何一步走慢，价格都会失去支撑。"

Lead Agent 看着价格尺，笑容逐渐消失。

Lead Agent：
"所以我喜欢的是公司，市场卖给我的却是最乐观的未来。"

Market Agent：
"故事还在继续，价格已经提前跑到结局。"

审判庭灯光变暗，中央出现三个判决印章。`,
        options: [
          {
            id: "p1",
            text: "查看判决印章",
            correct: true,
            feedback: `三个判决印章并排显示：

• 印章一：公司不错，32 元也合适
• 印章二：公司不错，32 元偏贵
• 印章三：公司经营一般，政策关系也很弱

你如何判断北港仓储与当前价格？`
          }
        ]
      },
      // 价格判决
      {
        id: 5,
        scene: `【价格判决】

三个判决印章并排显示：

• 印章一：公司不错，32 元也合适
• 印章二：公司不错，32 元偏贵
• 印章三：公司经营一般，政策关系也很弱

你选择盖下哪个印章？`,
        options: [
          {
            id: "v_correct",
            text: `盖下印章二：公司不错，32 元偏贵`,
            correct: true,
            feedback: `玩家盖下第二个印章。

Lead Agent 神情犹豫：
"我们花了这么多时间研究它，现在却不买？"

Data Agent：
"研究结果仍然有效，价格判断可以单独记录。"

Industry Agent：
"政策方向也没有改变。"

Market Agent 露出认可神情：
"公司留在原地，市场每天都会给出新的价签。"

玩家设置价格提醒：
"27 元以下重新查看"

Valuation Agent 的神情逐渐放松。

Valuation Agent：
"你没有因为喜欢公司，就接受任何价格。判决成立。"`
          },
          {
            id: "v_wrong1",
            text: `盖下印章一：公司不错，32 元也合适`,
            correct: false,
            feedback: `玩家盖下第一个印章。

Lead Agent 重新露出期待神情：
"好公司总会越来越贵。早点买，至少不会错过。"

Valuation Agent 目光变得严厉：
"你认可了公司，随后放弃了价格。"

玩家以 32 元买入北港仓储。

【错误结局：信仰溢价】

画面切换到下一个季度。公司公告显示利润增长 8%，经营情况保持稳定，股价却从 32 元回落到 26 元。

Lead Agent 神情困惑：
"公司明明增长了，股价为什么还在跌？"

Data Agent：
"经营数据符合预期，没有出现明显问题。"

Industry Agent：
"政策项目仍在建设，进度符合原计划。"

Market Agent：
"大家期待的是更快增长。公司交出的答案，只够称得上正常。"

Valuation Agent 放下小锤：
"公司完成了自己的工作，价格没有完成市场的幻想。"

Lead Agent 低头看着亏损记录，神情懊恼。

Lead Agent：
"我买的是一家好公司，也买下了别人提前写好的最好结局。"`
          },
          {
            id: "v_wrong2",
            text: `盖下印章三：公司经营一般，政策关系也很弱`,
            correct: false,
            feedback: `玩家盖下第三个印章。

Industry Agent 眉头轻皱：
"公司与政策的关系已经确认，现有项目也真实存在。"

Data Agent：
"稳定经营记录同样有效。"

Valuation Agent 将印章退回桌面：
"价格偏贵，无法证明公司经营一般。重新判决。"

玩家返回选择界面。`
          }
        ]
      }
    ],
    goodEnding: `红色价格区域逐渐熄灭，蓝色估值区间留在屏幕中央。Valuation Agent 从审判席走下，将金色小锤交给玩家。

Valuation Agent 神情温和：
"好公司值得关注，好价格值得等待。两件事同时出现，买入才有余地。"

Lead Agent 露出轻松笑容：
"以后我找到喜欢的公司，还得问一句，市场已经收了多少钱。"

Data Agent 微微点头：
"公司数据保留在研究档案中。"

Industry Agent 合上政策文件：
"项目进度出现变化时，我会更新政策影响。"

Market Agent：
"价格回到观察范围时，我会提醒团队。"

Valuation Agent 正式加入团队。

玩家解锁技能：「估值天平」

技能可以查看：
• 当前价格包含了多少未来期待
• 公司现有经营支持的价格范围
• 乐观情况与普通情况的差距
• 等待价格与当前价格的距离`,
    badEnding: `Valuation Agent 拒绝加入。

审判庭的灯光恢复。Valuation Agent 回到审判席。

Valuation Agent：
"价签还在这里。愿意重新判决，随时回来。"`
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
