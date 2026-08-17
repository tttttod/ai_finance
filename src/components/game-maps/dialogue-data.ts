import type { DialogueLevelData } from "./game-data";

export const DIALOGUE_DATA: Record<number, DialogueLevelData> = {
  1: {
    sceneImage: "/dialogue-scene-level1.webp",
    opening:
      "你准备进入第一场 K 线交易，却发现同一只股票出现三张走势完全不同的图。\n\nData Agent 坐在行情修复台前，等你找出能用于交易的数据。\n\n虚构股票「岚海科技」昨天收盘价为 30 元。公司今天执行每十股转增五股，除权参考价变为 20 元。\n\n三张图摆在面前：一张暴跌，一张突破，一张平稳。差异来自复权错误、行情延迟和成交量缺失。",
    nodes: [
      {
        id: 1,
        scene:
          "【行情 A：断崖图】\n\n• 昨日收盘价：30 元\n• 今日开盘价：20.20 元\n• 图表显示跌幅：32.7%\n• 更新时间：今日 15 点\n• 复权方式：未复权\n\nK 线上出现一根巨大的阴线。\n\nLead Agent：\n「一天跌掉三成，这根线看着像公司出了大事。」\n\n你需要检查这张图的问题所在。",
        options: [
          {
            id: "a1",
            text: "把「每十股转增五股」的公司通知拖到缺口处，检查复权方式",
            correct: true,
            feedback:
              "K 线重新计算，所谓暴跌变成上涨 1%。\n\nData Agent：\n「股价变低了，持股数量同时增加。图表忘了处理这件事。」\n\nLead Agent：\n「原来这根吓人的阴线，是数据画出来的。」\n\n行情 A 获得标签：「复权错误」",
          },
          {
            id: "a2",
            text: "出现这么大的阴线，准备卖出",
            correct: false,
            feedback:
              "Data Agent 皱眉：\n「你还没检查复权方式，就要交出持仓？」\n\nLead Agent：\n「图表吓你一下，你就把持仓交出去了？」",
          },
          {
            id: "a3",
            text: "忽略这根阴线，继续看下一张图",
            correct: false,
            feedback:
              "Data Agent 摇头：\n「不弄清楚原因就跳过？万一这是真的暴跌呢？」",
          },
        ],
      },
      {
        id: 2,
        scene:
          "【行情 B：完整图】\n\n• 昨日复权价格：20 元\n• 今日开盘价：20.20 元\n• 今日收盘价：20.80 元\n• 更新时间：今日 15 点\n• 成交量：完整\n• 停牌与除权记录：完整\n\n这张图显示股票上涨 4%，成交量温和增加。\n\n你需要判断这张图是否可用于交易。",
        options: [
          {
            id: "b1",
            text: "时间对齐，除权已处理，成交量完整——可用于交易",
            correct: true,
            feedback:
              "Data Agent 点头：\n「时间对齐，除权已经处理，价格和成交量也能互相核对。」\n\n行情 B 获得标签：「可用于交易」",
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
        id: 3,
        scene:
          "【行情 C：突破图】\n\n• 当前价格：21.60 元\n• 图表显示涨幅：8%\n• 更新时间：今日 14 点 50 分\n• 14 点 50 分后的成交量：空白\n• 收盘价格：系统自动估算\n\nK 线显示价格在收盘前突然突破。\n\n你需要检查这张图的问题所在。",
        options: [
          {
            id: "c1",
            text: "把「行情延迟十分钟」拖到末尾 K 线上，检查更新时间",
            correct: true,
            feedback:
              "最后一根 K 线随即消失。\n\nLead Agent：\n「我刚才已经开始想象明天继续上涨了。」\n\nData Agent：\n「市场还在走，图表替它写了结局。」\n\n行情 C 获得标签：「数据延迟」",
          },
          {
            id: "c2",
            text: "突破信号明确，准备追涨",
            correct: false,
            feedback:
              "Data Agent 拦住你：\n「最后十分钟的数据还没传回来，这根突破线来自系统估算。」\n\nLead Agent：\n「价格还没走完，你已经替它庆祝了。」",
          },
          {
            id: "c3",
            text: "忽略延迟问题，直接采用",
            correct: false,
            feedback:
              "Data Agent 摇头：\n「用不完整的数据做决策，和闭着眼睛过马路没区别。」",
          },
        ],
      },
      {
        id: 4,
        scene:
          "三张图摆在面前。\n\n• 行情 A：复权错误 — 所谓暴跌是送股记录\n• 行情 B：可用于交易 — 时间对齐，数据完整\n• 行情 C：数据延迟 — 最后十分钟是系统估算\n\nData Agent：\n「现在，选一张图用于交易。」",
        options: [
          {
            id: "s1",
            text: "选择行情 B — 处理了除权，更新时间到收盘，成交量完整",
            correct: true,
            feedback:
              "Data Agent 微微一笑：\n「现在你看到的，才是同一把尺子量出来的价格。」\n\nLead Agent：\n「以后看见奇怪的 K 线，我得先问问图表做过什么。」",
          },
          {
            id: "s2",
            text: "选择行情 A — 出现大阴线，准备卖出",
            correct: false,
            feedback:
              "Data Agent：\n「你交易的是一次送股记录。」\n\nLead Agent：\n「图表吓你一下，你就把持仓交出去了。」\n\n结局：「虚假暴跌」",
          },
          {
            id: "s3",
            text: "选择行情 C — 突破信号明确，准备追涨",
            correct: false,
            feedback:
              "Data Agent：\n「最后十分钟的数据还没传回来，这根突破线来自系统估算。」\n\nLead Agent：\n「价格还没走完，你已经替它庆祝了。」\n\n结局：「幽灵突破」",
          },
        ],
      },
    ],
    goodEnding:
      "Data Agent 离开修复台，正式加入队伍。\n\n你解锁了技能「行情校验」，能够检查：\n• K 线复权状态\n• 行情更新时间\n• 成交量缺失\n• 停牌与除权标记\n\n下一关进入 K 线交易。",
    badEnding:
      "你带着错误行情进入交易。\n\nData Agent 摇头：\n「三张图里有一张是对的，你没选到它。」\n\nLead Agent：\n「别灰心，下次先看数据再决策。」",
  },
  2: {
    sceneImage: "/dialogue-scene-level2.webp",
    opening:
      "地下交易大厅使用暗蓝色灯光。中央指数屏幕不断闪红，窗外落着大雨。\n\nMarket Agent 坐在远处的桌边倒茶。\n\nLead Agent 神情期待，身体靠近交易屏幕。\n\nLead Agent：\n「沧海指数跌了 4.8%，我们的青禾零售只跌了 0.8%。它明显比市场强，我觉得这是机会。」\n\nData Agent 神情平静，低头检查行情记录。\n\nData Agent：\n「价格已经核对，行情更新时间正常。青禾零售确实只跌了 0.8%。」\n\nLead Agent 看向角落，眉毛微微抬起。\n\nLead Agent：\n「警报都快把屋顶震掉了，他怎么还在喝茶？」\n\nData Agent 轻推眼镜：\n「警报正常，茶也正常。」\n\nMarket Agent 抬起一侧眉毛，目光从茶杯移向玩家。\n\nMarket Agent：\n「一只股票表现较强，只能说明它今天表现较强。想判断能否出手，先看看窗外是什么天气。」",
    nodes: [
      {
        id: 1,
        scene:
          "大厅灯光变暗，三块行情屏依次亮起。\n\nLead Agent 站在左侧，Data Agent 站在右侧，Market Agent 仍坐在背景中。\n\n玩家需要使用 Data Agent 的「行情校验」。\n\n【屏幕 A：我的自选】\n\n屏幕显示玩家关注的五只股票：\n• 青禾零售 -0.80%\n• 岚海科技 +1.2%\n• 星桥游戏 +0.6%\n• 原野食品 -1.50%\n• 北岸能源 +0.3%\n\nLead Agent 露出轻松笑意。\n\nLead Agent：\n「五只股票里有三只上涨，市场似乎也没那么差。」",
        options: [
          {
            id: "s1a",
            text: "使用「行情校验」检查屏幕 A",
            correct: true,
            feedback:
              "Data Agent 眉头轻皱，指向股票数量。\n\nData Agent：\n「数据正确，范围只有五只股票。它们都是你主动选进自选列表的。」\n\nMarket Agent 转动茶杯，嘴角带着笑意。\n\nMarket Agent：\n「你喜欢看的股票，当然容易长得像你的想法。」\n\n屏幕 A 获得标签：「观察范围过小」",
          },
          {
            id: "s1b",
            text: "相信自选股的表现，准备加仓",
            correct: false,
            feedback:
              "Data Agent 摇头：\n「五只股票不能代表整个市场。」\n\nMarket Agent：\n「你只看了自己想看的。」",
          },
        ],
      },
      {
        id: 2,
        scene:
          "【屏幕 B：全市场】\n\n中央屏幕变成一百个股票方格，其中八十四个呈红色。\n\n消费、科技、医疗和金融区域同时下跌。\n\n市场情况：\n• 上涨 7 只\n• 持平 9 只\n• 下跌 84 只\n\n青禾零售虽然跌幅较小，成交也在减少。\n\nData Agent 神情专注，确认日期和记录数量。\n\nData Agent：\n「数据更新到收盘，行业记录完整。八成以上的股票都在下跌。」\n\nLead Agent 的笑意消失，视线从青禾零售移向整片市场。\n\nLead Agent：\n「它跌得少，可它周围的股票都在往下走。」",
        options: [
          {
            id: "s2a",
            text: "使用「行情校验」检查屏幕 B",
            correct: true,
            feedback:
              "Market Agent 放下茶杯，神情变得认真。\n\nMarket Agent：\n「一百只股票里有八十四只在淋雨。这时候，一把暂时没湿透的伞也在风里。」\n\n屏幕 B 获得标签：「全市场下跌」",
          },
          {
            id: "s2b",
            text: "青禾零售跌得少，说明它很强",
            correct: false,
            feedback:
              "Market Agent：\n「跌得少不代表安全。它只是淋得少一点。」",
          },
        ],
      },
      {
        id: 3,
        scene:
          "【屏幕 C：热门行业榜】\n\n屏幕切换为绿色榜单，青禾零售位于第一名。\n\n屏幕显示零售行业上涨 3.6%，青禾零售排名第一。\n\nLead Agent 再次露出期待神情。\n\nLead Agent：\n「这张图更直接。它所在的行业正在上涨。」",
        options: [
          {
            id: "s3a",
            text: "使用「行情校验」检查屏幕 C",
            correct: true,
            feedback:
              "Data Agent 看向右下角日期，眉头轻皱。\n\nData Agent：\n「榜单来自昨天收盘。今天的零售行业已经下跌 3.1%。」\n\nLead Agent 眨了一下眼睛，神情有些尴尬。\n\nMarket Agent 看向窗外的雨，轻轻笑了一声。\n\nMarket Agent：\n「昨天的天气预报，挡不了今天的雨。」\n\n屏幕 C 获得标签：「时间过期」",
          },
          {
            id: "s3b",
            text: "行业排名第一，赶紧买入",
            correct: false,
            feedback:
              "Data Agent：\n「榜单是昨天的数据。」\n\nMarket Agent：\n「用昨天的天气决定今天穿什么？」",
          },
        ],
      },
      {
        id: 4,
        scene:
          "三块行情屏向两侧移开，中央升起圆形天气仪。\n\n仪表从浅蓝逐渐转向暗红。\n\n玩家把三块屏幕的标签放入市场天气仪。\n\n仪表提供三个判断：\n• 局部下雨\n• 行业换风\n• 全市场风暴",
        options: [
          {
            id: "w1",
            text: "判断为「全市场风暴」",
            correct: true,
            feedback:
              "玩家：\n「大部分股票和行业同时下跌，当前属于全市场风暴。」\n\n警报声逐渐减弱。\n\nLead Agent 神情开始犹豫，手指离开交易按钮。\n\nLead Agent：\n「所以青禾零售跌得少，也不能证明它已经安全。」\n\nData Agent 微微点头。\n\nMarket Agent 神情认真，嘴角出现轻微笑意。\n\nMarket Agent：\n「市场里的故事暂时失效，大家正在处理同一种恐惧。现在再看你的股票。」",
          },
          {
            id: "w2",
            text: "判断为「局部下雨」",
            correct: false,
            feedback:
              "Market Agent 轻敲桌面，眉头微微下压。\n\nMarket Agent：\n「八十四只股票同时下跌，这场雨的范围已经超过一条街。」\n\n天气仪退回选择状态。",
          },
          {
            id: "w3",
            text: "判断为「行业换风」",
            correct: false,
            feedback:
              "Data Agent 重新展示行业数据，神情保持专注。\n\nData Agent：\n「十个行业里有八个正在下跌，资金没有明显进入另一边。」\n\n天气仪退回选择状态。",
          },
        ],
      },
      {
        id: 5,
        scene:
          "中央屏幕显示玩家账户。\n\n大厅依旧闪着红光，警报音已经减弱。\n\n玩家账户拥有三万元资金，目前持有三千元青禾零售，原计划再投入一万元。\n\n• 总资金：30000 元\n• 青禾零售持仓：3000 元\n• 计划加仓：10000 元\n• 加仓后持仓：13000 元",
        options: [
          {
            id: "p1",
            text: "保留持仓，观察三天",
            correct: true,
            feedback:
              "玩家：\n「我保留现有的小仓位，取消一万元加仓计划。三天后重新观察市场和青禾零售。」\n\nLead Agent 神情犹豫。\n\nLead Agent：\n「这样明天上涨，我们手里还有股票。继续下跌，我们也留着大部分现金。」\n\nData Agent 轻推眼镜：\n「行情完整，资金记录清楚，观察期限已经写下。」\n\nMarket Agent 露出轻微笑意。\n\nMarket Agent：\n「计划已经写下。接下来别让一天的涨跌把它擦掉。」",
          },
          {
            id: "p2",
            text: "立即加仓一万元",
            correct: false,
            feedback:
              "玩家：\n「它比市场强这么多，风暴过去后肯定会先涨。」\n\nLead Agent 神情兴奋。\n\nData Agent 保持平静：\n「青禾零售跌幅较小，这条数据正确。未来会先上涨，这条结论没有数据支持。」\n\nMarket Agent 放下茶杯，眼神变得严肃。\n\nMarket Agent：\n「全市场都在下雨，你盯着一块暂时干燥的地砖。」\n\n玩家投入一万元，持仓增加到一万三千元。",
          },
        ],
      },
      {
        id: 6,
        scene:
          "【第二天：市场反弹】\n\n大厅屏幕转绿，青禾零售上涨 2.6%。\n\n买入按钮重新发出金色光芒。\n\nLead Agent 露出遗憾神情，身体再次向屏幕靠近。\n\nLead Agent：\n「它真的涨了。现在追进去还来得及吗？」",
        options: [
          {
            id: "d2a",
            text: "继续观察，遵守三天计划",
            correct: true,
            feedback:
              "玩家：\n「计划是观察三天，今天只是第二天。」\n\nLead Agent 仍然看着上涨数字，随后慢慢坐回原位。\n\nData Agent 微微点头：\n「计划保持有效。」\n\nMarket Agent 端起茶杯，神情平静。\n\nMarket Agent：\n「市场最会奖励一次冲动，再考验你能不能忍住下一次。」",
          },
          {
            id: "d2b",
            text: "立即追涨，投入一万元",
            correct: false,
            feedback:
              "玩家投入一万元。\n\nData Agent：\n「观察计划已经被提前结束。」\n\nMarket Agent 神情严肃。\n\nMarket Agent：\n「你躲过了风暴当天的冲动，却在第二天把计划交给了上涨。」",
          },
        ],
      },
    ],
    goodEnding:
      "【第三天：市场再次下跌】\n\n屏幕重新变红，青禾零售下跌 5.4%。\n\n玩家仍然保留大部分现金，账户变化较小。\n\nLead Agent 神情变得认真。\n\nLead Agent：\n「昨天的上涨，只是让人放松了一天。」\n\nData Agent 检查全市场数据。\n\nData Agent：\n「七十九只股票正在下跌，市场仍然摇晃。」\n\nMarket Agent 放下茶杯，神情变得温和。\n\nMarket Agent：\n「你没有猜每天的涨跌。你遵守了自己的观察计划，这个判断够用了。」\n\n---\n\n警报停止，红色灯光逐渐变成深蓝色。\n\nMarket Agent 从角落走到画面中央。\n\nMarket Agent 把一张市场天气卡交给玩家。\n\nMarket Agent 神情温和，嘴角带着笑意。\n\nMarket Agent：\n「个股故事每天都有，市场环境决定它们能讲多久。从今天开始，我负责看风向。」\n\nLead Agent 放松下来，露出自然笑容。\n\nLead Agent：\n「以后我准备追一只强股时，先看看周围还有多少股票站着。」\n\nData Agent 微微点头。\n\nData Agent：\n「我负责保证数字完整，他负责告诉你数字处在什么环境里。」\n\n---\n\n「Market Agent 已加入队伍」\n\n角色介绍：\n「他观察资金正在躲避什么，也观察整个市场正在相信什么。」\n\n玩家获得技能：「市场温度」\n\n技能可以查看：\n• 市场中上涨与下跌股票的比例\n• 不同行业是否同时下跌\n• 当前数据对应的交易日期\n• 个股走势与整个市场的差异",
    badEnding:
      "【第三天：市场再次下跌】\n\n屏幕重新变红，警报声再次响起。\n\n青禾零售下跌 5.4%，亏损数字出现在账户中央。\n\nLead Agent 的笑容消失，视线向下。\n\nLead Agent：\n「昨天的上涨，让我以为风暴已经过去了。」\n\nData Agent 神情失望，目光停在持仓金额上。\n\nData Agent：\n「持仓提高后，今天的损失也被放大了。」\n\nMarket Agent 眉头下压，轻轻摇头。\n\nMarket Agent：\n「一天的反弹改变不了市场仍在摇晃。你用更大的持仓，押了一次过早的判断。」\n\n---\n\n触发结局：「逆风开满帆」\n\nMarket Agent 拒绝加入。",
  },
  3: {
    sceneImage: "/policy-secret-letter.png",
    opening:
      "玩家正在团队办公室看盘，手机弹出政策通知。\n\n中央屏幕上的冷链板块快速上涨，鲜达生活接近涨停。\n\nLead Agent 神情兴奋，身体靠近行情屏幕：\n「政策刚发布，冷链板块已经涨了 7%。鲜达生活快涨停了，我们要不要跟上？」\n\nMarket Agent 神情平静，双手抱在胸前：\n「市场已经读完标题，正文读到哪一页还不好说。」\n\nData Agent 打开政策文件，轻推眼镜：\n「文件签章有效，发布时间是今天上午九点。原文共有六页，群聊里只转发了第一页。」\n\nLead Agent 的笑容收住了一些：\n「六页？我刚才只看见了'支持冷链发展'。」\n\n办公室侧门打开，里面是一间堆满文件的档案室。\n\nIndustry Agent 坐在文件堆后，手中拿着政策原文。他神情平静，抬眼看向玩家：\n「标题负责把人叫进来，第四页才告诉你钱准备给谁。」",

    nodes: [
      {
        id: 1,
        scene:
          "【阅读政策原文】\n\n档案室使用暖黄色灯光，墙上贴着城市地图和行业关系图。中央桌面放着六页政策文件。\n\nIndustry Agent 将三段文字推到玩家面前：\n• 支持冷链产业发展\n• 开展五座城市试点\n• 补贴完成备案的公共冷库改造项目\n\n系统提问：这份政策直接支持什么？",
        options: [
          {
            id: "a",
            text: "所有冷链相关公司",
            correct: false,
            feedback:
              "Lead Agent 神情期待：\n「文件里确实写了支持冷链产业。」\n\nIndustry Agent 抬起一侧眉毛：\n「前面是方向，后面才是范围。五座城市和备案项目都被你跳过去了。」",
          },
          {
            id: "b",
            text: "五座城市的备案冷库改造项目",
            correct: true,
            feedback:
              "玩家：\n「政策直接支持五座试点城市中完成备案的公共冷库改造项目。」\n\nData Agent 微微点头：\n「内容与原文一致。」\n\nIndustry Agent 露出轻微笑意：\n「范围找到了。现在看看谁站在这个范围里。」\n\n玩家获得政策标签：\n• 五座试点城市\n• 备案项目\n• 验收后补贴",
          },
          {
            id: "c",
            text: "生鲜购物平台",
            correct: false,
            feedback:
              "Data Agent 指向文件内容：\n「原文没有出现购物平台，也没有提供平台补贴。」\n\nIndustry Agent 轻轻敲了一下第四页：\n「名字里有生鲜，和拿到补贴隔着几道门。」",
          },
        ],
      },
      {
        id: 2,
        scene:
          "【完成受益关系图】\n\n墙上的行业图亮起。中心位置是「公共冷库改造」，周围有三个空位，分别标注「直接相关」「间接相关」和「关系较弱」。\n\n玩家需要把三张公司卡放到正确位置。\n\n北港仓储：\n• 在四座试点城市经营冷库\n• 拥有六个备案项目\n• 计划升级制冷设备",
        options: [
          {
            id: "a",
            text: "放在「直接相关」位置",
            correct: true,
            feedback:
              "Industry Agent：\n「它经营政策支持的项目，位置最近。」\n\n北港仓储获得标签：「直接相关」",
          },
          {
            id: "b",
            text: "放在「间接相关」位置",
            correct: false,
            feedback:
              "Industry Agent 摇头：\n「它经营的是政策支持的项目，不是供应商。箭头应该更直接。」",
          },
          {
            id: "c",
            text: "放在「关系较弱」位置",
            correct: false,
            feedback:
              "Industry Agent 摇头：\n「它在试点城市经营冷库，还有备案项目。关系不弱。」",
          },
        ],
      },
      {
        id: 3,
        scene:
          "【霜塔设备】\n\n公司卡显示：\n• 生产冷库压缩机\n• 尚未获得新订单\n• 客户包括冷库建设单位",
        options: [
          {
            id: "a",
            text: "放在「直接相关」位置",
            correct: false,
            feedback:
              "Industry Agent 摇头：\n「它还没有获得新订单，只是潜在客户。箭头还没连上。」",
          },
          {
            id: "b",
            text: "放在「间接相关」位置",
            correct: true,
            feedback:
              "Industry Agent：\n「项目开始采购后，它才可能获得订单。箭头多走了一步。」\n\n霜塔设备获得标签：「间接相关」",
          },
          {
            id: "c",
            text: "放在「关系较弱」位置",
            correct: false,
            feedback:
              "Industry Agent 摇头：\n「它的客户包括冷库建设单位，项目启动后会有订单。关系不只是较弱。」",
          },
        ],
      },
      {
        id: 4,
        scene:
          "【鲜达生活】\n\n公司卡显示：\n• 经营生鲜购物平台\n• 使用第三方冷库\n• 没有备案改造项目\n\nLead Agent 看着鲜达生活的涨停价格，神情困惑：\n「它和政策关系最远，今天却涨得最快。」\n\nMarket Agent 看向行情屏幕：\n「市场喜欢容易记住的名字。鲜达、冷链，两个词已经够热闹了。」\n\nIndustry Agent：\n「股价跑在前面，政策文件仍然留在原地。」",
        options: [
          {
            id: "a",
            text: "放在「直接相关」位置",
            correct: false,
            feedback:
              "Industry Agent 摇头：\n「它没有自营冷库，也没有备案项目。和政策没有直接关系。」",
          },
          {
            id: "b",
            text: "放在「间接相关」位置",
            correct: false,
            feedback:
              "Industry Agent 摇头：\n「它使用第三方冷库，不是政策补贴对象。箭头连不上。」",
          },
          {
            id: "c",
            text: "放在「关系较弱」位置",
            correct: true,
            feedback:
              "Industry Agent：\n「名字里有生鲜，但和业务关系不大。市场只是炒概念。」\n\n鲜达生活获得标签：「关系较弱」",
          },
        ],
      },
      {
        id: 5,
        scene:
          "【处理投资选择】\n\n画面回到团队办公室。中央屏幕同时显示三家公司和当日涨幅：\n\n• 北港仓储 +2.1% — 六个备案项目，等待地方项目名单\n• 霜塔设备 +5.4% — 暂无新增订单\n• 鲜达生活 +9.8% — 公司没有自营冷库\n\n系统提问：你准备如何处理这份政策信息？",
        options: [
          {
            id: "a",
            text: "追涨鲜达生活",
            correct: false,
            feedback:
              "玩家：\n「它涨得最快，市场肯定认为它最受益。」\n\nLead Agent 神情兴奋：\n「涨停附近的股票，通常最容易吸引注意。」\n\nData Agent：\n「公司业务已经核对，它没有自营冷库和备案改造项目。」\n\nIndustry Agent 神情失望，合上政策文件：\n「你选择了股价的反应，却放下了刚刚完成的关系图。」\n\n第二天，鲜达生活发布说明：\n「公司仓储服务全部由第三方提供，本次政策预计不会直接影响公司经营。」\n\n鲜达生活下跌 8%。\n\n---\n\n触发结局：「文件还没读完，股价已经读完」",
          },
          {
            id: "b",
            text: "买入整个冷链板块",
            correct: false,
            feedback:
              "玩家：\n「政策影响范围还在扩大，买一组公司更稳妥。」\n\nMarket Agent 眉头轻皱：\n「板块里的公司共享一个名字，收入来源却各不相同。」\n\nIndustry Agent 指向关系图：\n「你刚刚把它们放在三个位置，现在又用一个价格判断它们。」\n\n第二天，板块热度下降。关系较弱的公司跌幅明显。\n\n---\n\n触发结局：「一张文件买了一篮子名字」",
          },
          {
            id: "c",
            text: "将北港仓储加入研究清单",
            correct: true,
            feedback:
              "玩家：\n「北港仓储处在政策支持范围内，但补贴需要等项目验收。我先记录项目名单和进度。」\n\nLead Agent 神情有些遗憾：\n「所以这次什么都不买？」\n\nData Agent：\n「公司与政策关系已经确认，项目收入和财务影响仍需后续检查。」\n\nMarket Agent 露出认可神情：\n「市场今天给了它一个价格，你还可以给自己一点时间。」\n\nIndustry Agent 站起身，将政策关系图收进文件夹：\n「政策告诉你资金可能流向哪里，也告诉你需要等待多久。你读到了完整的句子。」",
          },
        ],
      },
    ],

    goodEnding:
      "档案室的文件柜依次亮起，墙上的政策关系图变成蓝色。Industry Agent 从文件堆后走到玩家面前。\n\nIndustry Agent 神情温和，手中拿着整理好的政策文件：\n「政策从来不只是一句口号。范围、对象和时间，少看一个，意思都会改变。」\n\nLead Agent 露出轻松笑容：\n「以后看到政策概念，我会先找文件里的具体对象。」\n\nData Agent 微微点头：\n「文件真实，范围明确，缺失信息也已经标出。」\n\nMarket Agent：\n「等市场开始讲故事时，我们至少知道故事从哪一页开始走样。」\n\nIndustry Agent 正式加入团队。\n\n玩家解锁技能「政策地图」，能够查看：\n• 政策影响范围\n• 直接与间接受益方向\n• 政策执行条件\n• 可能的落地时间",

    badEnding:
      "Industry Agent 留在档案室，关卡进入结算画面。\n\nIndustry Agent 恢复平静神情：\n「文件还在这里。愿意从第一页重读，随时回来。」",
  },
  5: {
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
  6: {
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
  7: {
    opening: `团队研究室使用深蓝色灯光。桌面放着远峰医疗的资料，中央屏幕显示当前价格 18.20 元。

Valuation Agent 神情平静，将估值报告放到桌上。

Valuation Agent：
"远峰医疗经营稳定，十七到十九元处于观察范围。公司值得关注，当前价格也没有离开范围。"

Lead Agent 神情期待，立刻打开交易界面。

Lead Agent：
"公司和价格都过关了，图上又刚好出现金叉。九千元计划资金可以直接投入了。"

Valuation Agent 眉头微微下压。

Valuation Agent：
"我确认公司值得观察，也确认当前价格仍在范围里。我没有要求你今天投入全部资金。"

Lead Agent：
"那还缺什么？"

墙上的 K 线图突然亮起，一扇白色房门出现在屏幕旁。

Technical Agent 的声音从门后传来：
"缺一个愿意看完图的人。"

系统提示：进入技术图表室。`,
    nodes: [
      {
        id: 1,
        scene: `房间四周挂满蜡烛图和均线，红绿 K 线像星座一样悬在空中。中央是一张巨大的远峰医疗走势图。

Technical Agent 坐在白色桌台后，手边放着绘图笔和价格尺。他抬起一侧眉毛，表情带着一点笑意。

Technical Agent：
"金叉、突破、十字星。有人把它们当工具，也有人把它们当神谕。"

Lead Agent 指向走势图，神情兴奋。

Lead Agent：
"价格连续上涨四天，短期均线也向上穿过。这个信号已经够清楚了。"

Technical Agent 站起身，将走势图分成价格和成交两个区域。

Technical Agent：
"图形提醒你观察。先看它走到哪里，再看有多少资金愿意一起走。"

走势图放大，16.80 元和 18.50 元出现两条横线。18.50 元附近留下三次回落痕迹。

系统提问：当前价格 18.20 元位于什么位置？`,
        options: [
          {
            id: "p1",
            text: "接近近期低点",
            correct: false,
            feedback: `Lead Agent：
"它距离最低点也没涨多少，应该还算安全。"

Technical Agent 用价格尺量了一下距离，神情严肃。

Technical Agent：
"低点在十六块八，当前已经来到十八块二。你的眼睛只看见了想要的答案。"`
          },
          {
            id: "p2",
            text: "位于普通区域",
            correct: false,
            feedback: `Technical Agent 指向 18.50 元附近的三次回落。

Technical Agent：
"同一个位置已经让价格退回三次，它在图上留下了记号。"`
          },
          {
            id: "p3",
            text: "接近多次回落的位置",
            correct: true,
            feedback: `玩家：
"当前价格靠近 18.50 元。这里曾经三次出现回落。"

Technical Agent 微微点头。

Technical Agent：
"这个位置像一扇反复关上的门。价格需要证明这次真能过去。"

玩家获得标签：「接近压力位置」`
          }
        ]
      },
      {
        id: 2,
        scene: `K 线下方出现成交柱。价格连续上涨，成交柱却逐日缩短。

Technical Agent：
"价格在向上走。现在看看有多少资金愿意一起推门。"

系统提问：当前成交情况说明什么？`,
        options: [
          {
            id: "v1",
            text: "成交越来越活跃",
            correct: false,
            feedback: `Lead Agent：
"价格连涨四天，参与的人应该越来越多。"

Technical Agent 用绘图笔敲了一下缩短的成交柱。

Technical Agent：
"价格在变高，成交却在变少。你又被上面的图吸走了视线。"`
          },
          {
            id: "v2",
            text: "成交保持稳定",
            correct: false,
            feedback: `Technical Agent 将四根成交柱并排放大。

Technical Agent：
"每一天都比前一天短，它们谈不上稳定。"`
          },
          {
            id: "v3",
            text: "成交逐渐减少",
            correct: true,
            feedback: `玩家：
"价格上涨时，参与交易的资金正在减少。"

Technical Agent 神情变得认真。

Technical Agent：
"有人把价格推到门口，愿意一起推门的人却越来越少。"

玩家获得标签：「上涨参与度不足」`
          }
        ]
      },
      {
        id: 3,
        scene: `房间中央出现一扇标有"18.50 元"的透明门。门后闪着金光，门前放着玩家的九千元计划资金。

Lead Agent 神情期待：
"公司值得观察，价格也在范围内。现在距离突破只差三毛钱。"

Valuation Agent 出现在侧边屏幕中，神情平静。

Valuation Agent：
"十八块二仍在观察范围。投入多少、什么时候投入，由交易计划决定。"

Technical Agent：
"你已经知道前方有门，也知道推门的资金正在减少。现在安排你的入场方式。"

系统提问：你准备如何投入资金？`,
        options: [
          {
            id: "e1",
            text: "现在投入全部 9000 元",
            correct: false,
            feedback: `玩家：
"价格还在观察范围，我现在投入全部资金，成本还能低一点。"

Lead Agent 露出兴奋笑容：
"提前一步，突破后我们就占到优势了。"

Valuation Agent 眉头轻皱。

Valuation Agent：
"价格处于范围里，不代表九千元必须同时进入。"

Technical Agent 神情严肃：
"你把一个可能出现的信号，提前当成了完成的信号。"

玩家以 18.20 元买入。`
          },
          {
            id: "e2",
            text: "价格碰到 18.50 元时投入全部资金",
            correct: false,
            feedback: `玩家：
"我等它碰到 18.50 元，突破的一刻投入全部资金。"

Technical Agent：
"碰到门和走过门，动作看起来接近，结果可能差得很远。"

第二天，远峰医疗快速上涨到 18.70 元，透明大门短暂打开。成交柱仍然较短。

Lead Agent 神情激动：
"突破了，现在买！"

玩家在 18.60 元附近投入全部资金。`
          },
          {
            id: "e3",
            text: "等收盘站稳 18.50 元，确认成交恢复，先投入 3000 元",
            correct: true,
            feedback: `玩家：
"我等价格收盘站稳 18.50 元，也等成交恢复。条件完成后，先投入 3000 元。"

Lead Agent 神情犹豫：
"它明天直接上涨的话，我们会错过一段。"

Valuation Agent 微微点头。

Valuation Agent：
"公司仍在观察清单里，资金也保留了调整空间。"

Technical Agent 露出轻微笑意：
"计划里有条件，也有投入上限。现在让市场自己回答。"`
          }
        ]
      },
      {
        id: 4,
        scene: `第二天

价格盘中升到 18.70 元，金色大门短暂打开。成交柱仍然较短。

Lead Agent 身体向交易按钮靠近。

Lead Agent：
"它已经过去了，现在算站稳了吗？"

Technical Agent 指向仍在进行的 K 线。

Technical Agent：
"交易还没结束。"

画面推进到收盘。价格回落至 17.30 元，透明大门重新关闭。

Lead Agent 的神情从遗憾变为惊讶。

Lead Agent：
"盘中看起来像突破，收盘时又回来了。"

Valuation Agent：
"公司判断没有变化。我们只是避开了一次条件尚未完成的买入。"

Technical Agent 微微点头。

Technical Agent：
"技术面帮你规定观察条件。条件完成前，资金留在手里。"`,
        options: [
          {
            id: "w1",
            text: "继续观察，等待下次机会",
            correct: true,
            feedback: `Technical Agent 收起价格尺。

Technical Agent：
"图形回答了市场正在尝试什么。它没有保证尝试一定成功。"

Valuation Agent 将远峰医疗的资料重新放回观察清单。

Valuation Agent：
"为什么值得关注，我已经给出范围。什么时候行动，现在有了新的规则。"`
          }
        ]
      }
    ],
    goodEnding: `房间里的蜡烛图停止闪烁，杂乱图形逐渐变成一张清楚的走势图。Technical Agent 从白色桌台后走到玩家面前。

Technical Agent 神情温和，将价格尺交给玩家。

Technical Agent：
"趋势告诉你方向，成交告诉你参与程度，价格位置告诉你风险靠得多近。"

Lead Agent 露出轻松笑容：
"以后看到漂亮图形，我会看它走到哪里，也会决定投入多少资金。"

Technical Agent：
"图形没有神谕。它只是帮助你安排时间和资金。"

Technical Agent 正式加入团队。

玩家解锁技能：「技术标尺」

技能可以查看：
• 当前趋势方向
• 成交活跃变化
• 价格支撑与压力位置
• 突破是否保持到收盘
• 单次计划投入比例`,
    badEnding: `金色大门突然关闭。K 线从 18.70 元快速回落，最终收在 17.30 元。

Lead Agent 神情震惊，随后低头看向交易记录。

Lead Agent：
"图形明明走出来了，怎么又掉回去了？"

Technical Agent 收起价格尺。

Technical Agent：
"价格短暂越过十八块五，收盘时又退了回来。成交也没有恢复。"

Valuation Agent 查看价格记录，神情严肃。

Valuation Agent：
"公司仍然值得观察，估值范围也没有改变。你因为一张漂亮图形，一次投入了全部计划资金。"

Lead Agent 神情懊恼：
"我把碰到压力位置，当成了突破完成。"

Technical Agent：
"图形回答了市场正在尝试什么。它没有保证尝试一定成功。"

触发结局：「图形崇拜」

Technical Agent 拒绝加入。

白色图表室的灯光变暗。Technical Agent 回到桌台后，Valuation Agent 收起观察报告。`
  },
  4: {
    opening: "深夜，办公室只亮着一盏台灯。\nLead Agent 将一叠财报放在你面前：\n\n\"这是星辉科技最新的季度报告，营收涨了，利润跌了，现金流方向变了。\n数字会撒谎，但勾稽关系不会。\n今晚，你的任务是——把这份财报的真相审出来。\"\n\nFundamental Agent 从阴影中走出来，推了推眼镜：\n\n\"每一行数字背后都有故事。跟我来。\"",
    nodes: [
      {
        id: 1,
        scene: "\"先看营收。营收同比增长 30%，但应收账款增长了 60%。这说明什么？\"",
        options: [
          { id: "11-1A", text: "公司卖货能力很强，增长势头好。", correct: false, feedback: "\"应收涨得比营收快，说明很多货卖了但没收到钱，回款能力有问题。\"" },
          { id: "11-1B", text: "可能有虚增收入的嫌疑，或者下游回款困难。", correct: true, feedback: "\"没错。应收/营收比例恶化是财报中最早出现的危险信号。\"" },
          { id: "11-1C", text: "营收增长正常，应收增长是季节性因素。", correct: false, feedback: "\"不能轻易归因于季节性。需要看同比数据是否也有这个趋势。\"" },
          { id: "11-1D", text: "说明公司账上现金变多了。", correct: false, feedback: "\"应收是别人欠你的钱，不是现金。恰恰相反，应收越多现金越紧。\"" },
        ],
      },
      {
        id: 2,
        scene: "\"再看利润表。毛利率从 45% 下滑到 38%，但净利润率反而从 10% 升到 15%。你觉得合理吗？\"",
        options: [
          { id: "11-2A", text: "毛利率下降说明成本上升，但净利润率上升说明费用控制得好。", correct: false, feedback: "\"逻辑上说得通，但要看具体数据。毛利率下降 7 个百分点，费用率得降多少才能补回来？\"" },
          { id: "11-2B", text: "不合理。净利润率升幅和毛利率降幅不匹配，可能有一笔非经常性收益。", correct: true, feedback: "\"一针见血。查看附注后发现，有一笔 5000 万的投资收益计入了当期利润。\"" },
          { id: "11-2C", text: "毛利率下降说明公司在降价抢市场。", correct: false, feedback: "\"可能，但利润率不匹配的问题还没解决。先看数字再看策略。\"" },
          { id: "11-2D", text: "两个指标方向不同，没法判断。", correct: false, feedback: "\"两个指标方向不同本身就是判断——说明表里有猫腻。\"" },
        ],
      },
      {
        id: 3,
        scene: "\"最后看现金流量表。经营活动现金流为负，但公司却宣布了高额分红。这代表着什么？\"",
        options: [
          { id: "11-3A", text: "公司对未来有信心，所以敢分红。", correct: false, feedback: "\"经营现金流为负还分红，不是有信心，是加杠杆或消耗存量现金。\"" },
          { id: "11-3B", text: "分红是好事，说明公司重视股东回报。", correct: false, feedback: "\"分红本身是好事，但用借款或投资回收来分红，就是坏事了。\"" },
          { id: "11-3C", text: "经营现金流为负却分红，要么是借债分红，要么是账面利润不真实。", correct: true, feedback: "\"完全正确。这就是典型的'纸面富贵'——利润表好看，但现金没回来。\"" },
          { id: "11-3D", text: "现金流是短期波动，不重要。", correct: false, feedback: "\"现金流是企业的血液。短期波动可以理解，但持续为负就是失血。\"" },
        ],
      },
    ],
    goodEnding: "Fundamental Agent 合上财报，露出难得的微笑：\n\n\"你通过了。三张表，你看到了别人看不到的勾稽关系。\n星辉科技的财报里确实有水分——应收虚增、非经常性收益、现金流和分红不匹配。\n这些都是基本面分析最经典的陷阱。\"\n\nLead Agent 拍拍你的肩：\n\"恭喜，你学会了读财报的真相。\"\n\n📊 Fundamental Agent 已解锁！",
    badEnding: "Fundamental Agent 叹了口气：\n\n\"你还没学会看穿数字背后的真相。\n财报不是阅读理解，是侦探工作。\n每一条数据，都要问一句：为什么？\n回去再练练吧。\"",
  },
  8: {
    sceneImage: "/dialogue-scene-level8.webp",
    opening:
      "虚构上市公司「星湾娱乐」刚刚开放新项目「云鲸岛乐园」。\n\n公司股价在一周内上涨 18%。你账户里持有两千元星湾娱乐，正在考虑增加八千元投入。\n\n议会厅中央放着一张圆桌。左侧屏幕显示绿色的订票曲线，右侧屏幕循环播放游客投诉。\n\nBull Analyst 坐在左侧，手里握着绿色激光笔。Bear Analyst 坐在右侧，面前摆着一枚红色印章。\n\nSentiment Agent 站在信息台后，身旁放着一台热搜粉碎机。\n\nLead Agent 抱着一桶爆米花坐在你旁边。\n\n议会钟声响起，中央屏幕弹出两条热搜：\n\n• 云鲸岛排队五小时\n• 云鲸岛游客集体退款",
    nodes: [
      {
        id: 1,
        scene:
          "Bull Analyst 站起身，将订票页面推到你面前：\n\n「连续两个周末门票售罄，这个项目已经火了。公司的增长才刚开始。」\n\nBear Analyst 在投诉视频上盖下红色印章：\n\n「排队、退款、服务混乱。热度正在透支游客的耐心。」\n\nLead Agent 放下爆米花：\n\n「左边让我想加仓，右边让我现在就卖。他们说得都挺像真的。」\n\nSentiment Agent 启动信息台：\n\n「两边都在用热搜讲故事。先看看这些声音来自多少件真实事件。」\n\n【信息 A：排队视频】\n• 相关帖子：5200 条\n• 使用相同视频的帖子：3600 条\n• 拍摄时间：开业第一天\n• 视频来源：同一位游客\n\nLead Agent：\n「我刷了十几次，还以为十几家门店都排成这样。」\n\n请为这条信息选择标签。",
        options: [
          {
            id: "8-1a",
            text: "重复传播 — 同一视频被转发 3600 次",
            correct: true,
            feedback:
              "Sentiment Agent 将重复视频送入粉碎机：\n\n「一件事被转发三千次，热度增加了，事件数量仍然是一件。」\n\nBear Analyst 抱起双臂：\n\n「排队问题真实存在，传播规模无法直接代表问题范围。」",
          },
          {
            id: "8-1b",
            text: "付费推广 — 有人花钱推这条视频",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「没有商业推广标记，这是游客自发拍摄的内容。」",
          },
          {
            id: "8-1c",
            text: "可核对信号 — 数据来自订票系统",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「这是视频内容，不是经营数据。」",
          },
        ],
      },
      {
        id: 2,
        scene:
          "【信息 B：打卡推荐】\n• 推荐帖子：3000 条\n• 标注商业推广：1800 条\n• 文案相似度：82%\n• 主要发布者：旅游博主\n\nBull Analyst：\n「这么多人推荐，乐园的口碑已经打开了。」\n\n请为这条信息选择标签。",
        options: [
          {
            id: "8-2a",
            text: "付费推广 — 1800 条帖子标注商业推广",
            correct: true,
            feedback:
              "Sentiment Agent 按下按钮，推广帖统一显示赞助标记：\n\n「这些内容能够带来关注。判断游客是否愿意再来，还得看消费记录。」\n\nBull Analyst 轻咳一声，收起了几张博主截图。",
          },
          {
            id: "8-2b",
            text: "重复传播 — 文案相似度 82%",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「文案相似是因为商业模板，不是用户自发转发。」",
          },
          {
            id: "8-2c",
            text: "可核对信号 — 来自旅游博主",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「博主推荐带有商业标记，不是独立的经营数据。」",
          },
        ],
      },
      {
        id: 3,
        scene:
          "【信息 C：经营记录】\n• 未来十四天订票率：92%\n• 二次到访券使用率：27%\n• 公司旧乐园二次到访券使用率：18%\n• 云鲸岛退款率：8%\n• 公司旧乐园退款率：3%\n• 平均排队时间：95 分钟\n• 公司计划排队时间：45 分钟\n\n请为这条信息选择标签。",
        options: [
          {
            id: "8-3a",
            text: "可核对信号 — 数据来自订票和退款系统",
            correct: true,
            feedback:
              "Sentiment Agent 将记录投到中央屏幕：\n\n「这些数据来自订票和退款系统，能够同时支持机会与风险。」\n\nBull Analyst 和 Bear Analyst 同时伸手拿向屏幕。\n\n议会主持人：\n「有效证据已经出现。接下来，由玩家决定证据交给谁。」",
          },
          {
            id: "8-3b",
            text: "重复传播 — 数据被多次引用",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「这是原始经营数据，不是传播内容。」",
          },
          {
            id: "8-3c",
            text: "付费推广 — 公司发布的数据",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「数据来自订票和退款系统，不是商业推广。」",
          },
        ],
      },
      {
        id: 4,
        scene:
          "桌面出现六张证据卡片。请将每张卡片分类到正确的区域。\n\n【卡片 1】未来十四天订票率达到 92%\n\n应该放到哪个区域？",
        options: [
          {
            id: "8-4a",
            text: "看多证据 — 订票率接近满额",
            correct: true,
            feedback:
              "Bull Analyst 眼睛亮了起来：\n「短期需求确实存在，游客也表达了再次到访的兴趣。」",
          },
          {
            id: "8-4b",
            text: "看空证据 — 订票率可能下降",
            correct: false,
            feedback:
              "Bear Analyst 摇头：\n「订票率高是需求信号，不是风险。」",
          },
          {
            id: "8-4c",
            text: "热度噪声 — 只是热搜数据",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「这是经营系统数据，不是热搜传播。」",
          },
        ],
      },
      {
        id: 5,
        scene:
          "【卡片 2】退款率高于旧乐园（8% vs 3%）\n\n应该放到哪个区域？",
        options: [
          {
            id: "8-5a",
            text: "看空证据 — 退款率是旧乐园两倍以上",
            correct: true,
            feedback:
              "Bear Analyst 将红色印章放到一旁：\n「我需要证明的是经营压力，热搜里的愤怒表情帮不了我。」",
          },
          {
            id: "8-5b",
            text: "看多证据 — 退款率绝对值不高",
            correct: false,
            feedback:
              "Bull Analyst 摇头：\n「退款率翻倍是风险信号，不能忽视。」",
          },
          {
            id: "8-5c",
            text: "热度噪声 — 退款视频被大量转发",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「这是经营系统数据，不是热搜传播。」",
          },
        ],
      },
      {
        id: 6,
        scene:
          "【卡片 3】同一段排队视频被转发 3600 次\n\n应该放到哪个区域？",
        options: [
          {
            id: "8-6a",
            text: "热度噪声 — 同一视频被大量转发",
            correct: true,
            feedback:
              "Sentiment Agent 看着被清空的热搜区：\n「现在他们讨论的是同一家公司，而不是两个互相吵架的话题。」",
          },
          {
            id: "8-6b",
            text: "看空证据 — 排队问题严重",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「传播规模不代表问题范围，这是噪声。」",
          },
          {
            id: "8-6c",
            text: "看多证据 — 说明关注度高",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「重复传播不是需求信号。」",
          },
        ],
      },
      {
        id: 7,
        scene:
          "Bull Analyst 将两张看多证据并排展示：\n\n「门票预订接近满额，二次到访券使用率也超过旧项目。云鲸岛已经表现出真实需求。」\n\n请评价这段发言。",
        options: [
          {
            id: "8-7a",
            text: "证据支持 — 使用了可核对记录",
            correct: true,
            feedback:
              "Sentiment Agent：\n「这段判断使用了可核对记录，也保留了适当范围。」\n\nBull Analyst 露出笑容：\n「终于有人允许我讲增长了。」",
          },
          {
            id: "8-7b",
            text: "表述过头 — 需求不能证明股价上涨",
            correct: false,
            feedback:
              "Bull Analyst 摇头：\n「我只说了需求存在，没有预测股价。」",
          },
          {
            id: "8-7c",
            text: "信息过期 — 数据是一周前的",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「数据来自订票系统，是最新的。」",
          },
        ],
      },
      {
        id: 8,
        scene:
          "Bear Analyst 展示退款率和排队时间：\n\n「退款率达到旧项目的两倍以上，排队时间也超过计划。服务能力还没有跟上热度。」\n\n请评价这段发言。",
        options: [
          {
            id: "8-8a",
            text: "证据支持 — 使用了可核对记录",
            correct: true,
            feedback:
              "Lead Agent：\n「奇怪，我同时同意了两个人。」\n\nBear Analyst 微微点头：\n「同一家公司可以同时拥有需求和问题。」",
          },
          {
            id: "8-8b",
            text: "表述过头 — 问题不严重",
            correct: false,
            feedback:
              "Bear Analyst 摇头：\n「退款率翻倍、排队超时，这些都是事实。」",
          },
          {
            id: "8-8c",
            text: "信息过期 — 数据是一周前的",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「数据来自退款系统，是最新的。」",
          },
        ],
      },
      {
        id: 9,
        scene:
          "Bull Analyst 再次发言：\n\n「既然需求这么强，股价接下来一定会继续上涨。」\n\n请评价这段发言。",
        options: [
          {
            id: "8-9a",
            text: "表述过头 — 需求不能证明股价一定上涨",
            correct: true,
            feedback:
              "Bull Analyst 停顿了一下：\n「好吧，需求能够支持我的判断，股价仍有自己的脾气。」",
          },
          {
            id: "8-9b",
            text: "证据支持 — 需求强股价就会涨",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「需求是基本面，股价还受市场情绪影响。」",
          },
          {
            id: "8-9c",
            text: "信息过期 — 股价已经涨了",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「问题不是信息过期，是逻辑跳跃。」",
          },
        ],
      },
      {
        id: 10,
        scene:
          "Bear Analyst 再次发言：\n\n「退款率这么高，这个项目已经失败了。」\n\n请评价这段发言。",
        options: [
          {
            id: "8-10a",
            text: "表述过头 — 问题存在但不能说已经失败",
            correct: true,
            feedback:
              "Bear Analyst 收回印章：\n「当前问题值得观察，现在给整个项目写结局确实太早。」",
          },
          {
            id: "8-10b",
            text: "证据支持 — 退款率确实很高",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「退款率高是问题，但不能直接得出项目失败的结论。」",
          },
          {
            id: "8-10c",
            text: "信息过期 — 退款率在下降",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「问题不是信息过期，是结论跳跃。」",
          },
        ],
      },
      {
        id: 11,
        scene:
          "玩家需要为两位分析师选择一份观察计划。\n\n【方案 A：看股价】\n• 股价下跌 5%，看多观点失效\n• 股价上涨 5%，看空观点失效\n\nBull Analyst：\n「股价每天都在投票，它无法单独解释游客还会不会来。」",
        options: [
          {
            id: "8-11a",
            text: "方案 B：看经营变化 — 订票率、二次到访、退款率、排队时间",
            correct: true,
            feedback:
              "Bull Analyst 将条件写进绿色报告：\n「需求消失时，我会承认增长故事失效。」\n\nBear Analyst 将条件写进红色报告：\n「经营问题改善时，我也会撤回警告。」",
          },
          {
            id: "8-11b",
            text: "方案 A：看股价 — 简单直接",
            correct: false,
            feedback:
              "Sentiment Agent 摇头：\n「股价受太多因素影响，不能单独作为判断依据。」",
          },
          {
            id: "8-11c",
            text: "方案 C：继续看热搜 — 跟踪舆情",
            correct: false,
            feedback:
              "Sentiment Agent 把两条热搜送入粉碎机：\n「这样研究下去，两位分析师每天都得跟着手机通知改口。」",
          },
        ],
      },
      {
        id: 12,
        scene:
          "现在做出你的最终决定。\n\n你持有两千元星湾娱乐，正在考虑增加八千元投入。\n\n• 订票率 92%，二次到访券使用率 27%\n• 退款率 8%，排队时间 95 分钟\n• 两周后检查经营数据\n\n你会怎么做？",
        options: [
          {
            id: "8-12a",
            text: "提交双向计划 — 保留持仓，暂不加仓，两周后根据经营数据决定",
            correct: true,
            feedback:
              "Lead Agent 点开日历：\n「这次两边都有发言时间，也都有退场条件。」\n\nBull Analyst 合上绿色报告，向你伸出手：\n「你愿意研究机会，也要求我拿出持续成立的证据。」\n\nBear Analyst 嘴角露出一点笑意：\n「你愿意检查风险，也给了公司改善问题的时间。」",
          },
          {
            id: "8-12b",
            text: "大幅加仓 — 订票接近满额，投入八千元",
            correct: false,
            feedback:
              "Bull Analyst 兴奋地举起激光笔：\n「市场终于看懂这个项目了。」\n\n两周后，订票率降至 63%，退款率升至 11%。公司宣布暂时限制入园人数。\n\nBull Analyst 看着屏幕：\n「也许下一条热搜能把游客带回来。」\n\n结局：「热搜追高团」",
          },
          {
            id: "8-12c",
            text: "卖出持仓 — 退款率太高，全部卖出",
            correct: false,
            feedback:
              "Bear Analyst 在报告上盖下印章：\n「风险已经足够明显。」\n\n两周后，园区增加服务人员，平均排队时间降到 48 分钟，退款率回落到 4%。订票率保持在 86%。\n\nBear Analyst 沉默地收起印章。\n\nLead Agent：\n「问题改善了，我们的结论却留在开业第一天。」\n\n结局：「一条差评退场」",
          },
        ],
      },
    ],
    goodEnding:
      "议会厅两侧的灯同时亮起。中央屏幕将看多报告和看空报告并排保存。\n\nSentiment Agent 关闭热搜粉碎机：\n「我的工作到这里。声音已经清理干净，接下来该由他们讨论未来了。」\n\nLead Agent：\n「我以前听谁说得顺耳，就容易坐到谁那边。现在我会问，他的观点靠什么成立，又会在什么时候失效。」\n\nBull Analyst 与 Bear Analyst 正式加入团队。\n\n你解锁了技能「多空辩论」，能够：\n• 生成看多逻辑\n• 生成看空逻辑\n• 标出双方使用的证据\n• 设置观点失效条件\n\n🌤️ Bull Analyst & Bear Analyst 已解锁！",
    badEnding:
      "议会厅的灯暗了下来。\n\nBull Analyst 和 Bear Analyst 暂时留在议会厅，没有加入团队。\n\nLead Agent 拍拍你的肩：\n「别灰心，下次两边都听完再决定。」",
  },
};
