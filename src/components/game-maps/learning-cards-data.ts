/**
 * 金融中级科普知识学习卡片 (40张)
 * 多邻国风格学习模式 — 先学后练
 */

export interface LearningCard {
  id: number;
  category: string;
  title: string;
  content: string;
  highlight?: string; // 关键记忆点
}

export const LEARNING_CARDS: LearningCard[] = [
  // ===== 一、估值与基本面进阶 (1-10) =====
  {
    id: 1,
    category: "估值与基本面",
    title: "动态PE vs 静态PE",
    content: "静态PE用过去一年净利润，滞后性强；动态PE用当期预估净利润，更贴合当下增速，高增长行业通常看动态PE。",
    highlight: "高增长看动态，低增长看静态",
  },
  {
    id: 2,
    category: "估值与基本面",
    title: "PEG估值逻辑",
    content: "PEG＜1代表估值低于业绩增速，具备性价比；PEG＞1代表估值透支未来增长，高位题材股普遍PEG虚高。",
    highlight: "PEG<1 = 性价比，PEG>1 = 透支",
  },
  {
    id: 3,
    category: "估值与基本面",
    title: "PB适用场景",
    content: "PB（市净率）更适合重资产、金融、地产、制造业；轻资产科技、消费企业优先看PE、PS。",
    highlight: "重资产看PB，轻资产看PE",
  },
  {
    id: 4,
    category: "估值与基本面",
    title: "ROE核心判定",
    content: "长期ROE稳定＞15%是优质企业核心标准，代表企业自带造血能力，不靠融资赚钱。",
    highlight: "ROE > 15% = 优质企业",
  },
  {
    id: 5,
    category: "估值与基本面",
    title: "杜邦三拆解",
    content: "ROE = 销售净利率 × 资产周转率 × 权益乘数，分别对应赚钱能力、运营效率、杠杆高低。",
    highlight: "赚钱力 × 运营力 × 杠杆力",
  },
  {
    id: 6,
    category: "估值与基本面",
    title: "PS市销率",
    content: "适合未盈利、高成长、亏损科技股，靠营收增速判断企业扩张价值，规避纯靠利润做账的公司。",
    highlight: "亏损公司看PS，看营收增速",
  },
  {
    id: 7,
    category: "估值与基本面",
    title: "扣非净利润",
    content: "剔除政府补贴、资产变卖、一次性收益，最真实反映企业主营业务真实盈利能力。",
    highlight: "扣非 = 真实主营盈利",
  },
  {
    id: 8,
    category: "估值与基本面",
    title: "商誉风险",
    content: "高商誉公司若业绩不达标，会计提商誉减值，直接吞噬年度利润，是白马股暴雷核心诱因之一。",
    highlight: "高商誉 = 暴雷隐患",
  },
  {
    id: 9,
    category: "估值与基本面",
    title: "毛利率&净利率差值",
    content: "差值持续扩大，代表三费（管理/销售/财务）失控，企业内部运营成本恶化。",
    highlight: "差值扩大 = 费用失控",
  },
  {
    id: 10,
    category: "估值与基本面",
    title: "存货周转陷阱",
    content: "存货持续走高、营收不涨，大概率是产品滞销、库存积压，后续存在降价减值风险。",
    highlight: "存货↑ 营收→ = 滞销信号",
  },

  // ===== 二、A股交易机制进阶 (11-20) =====
  {
    id: 11,
    category: "交易机制",
    title: "9:15-9:20竞价规则",
    content: "可挂单、可撤单，主力常在此阶段虚假挂大单诱多/诱空，不具备真实参考性。",
    highlight: "可撤单 = 可造假，别信",
  },
  {
    id: 12,
    category: "交易机制",
    title: "9:20-9:25竞价规则",
    content: "只能挂单、不可撤单，此阶段价格和成交量代表真实开盘意愿。",
    highlight: "不可撤单 = 真实意愿",
  },
  {
    id: 13,
    category: "交易机制",
    title: "尾盘3分钟集合竞价",
    content: "深市、创业板和科创板14:57-15:00为竞价撮合，尾盘拉升/砸盘多为资金隔夜情绪博弈。",
    highlight: "尾盘竞价 = 隔夜博弈",
  },
  {
    id: 14,
    category: "交易机制",
    title: "T+1隐性规则",
    content: "当日买入无法卖出，但当日卖出的资金可以继续买入股票。",
    highlight: "当天买不能卖，卖的钱能再买",
  },
  {
    id: 15,
    category: "交易机制",
    title: "涨跌停封单逻辑",
    content: "封单量大、封单稳定代表资金高度一致；反复开板、烂板，代表多空分歧巨大，次日波动加剧。",
    highlight: "封单稳 = 一致，烂板 = 分歧",
  },
  {
    id: 16,
    category: "交易机制",
    title: "龙虎榜上榜条件",
    content: "当日涨跌幅、换手率、振幅达市场前列，披露机构、游资、北向资金真实买卖席位。",
    highlight: "看龙虎榜 = 跟踪聪明钱",
  },
  {
    id: 17,
    category: "交易机制",
    title: "北向资金属性",
    content: "沪股通+深股通统称北向，偏向长线价值配置，持续净流入代表市场估值具备安全垫。",
    highlight: "北向净流入 = 估值安全",
  },
  {
    id: 18,
    category: "交易机制",
    title: "融资融券杠杆",
    content: "融资=借钱买多（看涨），融券=借股做空（看跌），两融余额持续上升代表市场杠杆情绪升温。",
    highlight: "融资做多，融券做空",
  },
  {
    id: 19,
    category: "交易机制",
    title: "ST与*ST核心区别",
    content: "ST是经营异常，*ST是濒临退市风险，年报继续亏损将触发退市流程。",
    highlight: "ST = 异常，*ST = 退市预警",
  },
  {
    id: 20,
    category: "交易机制",
    title: "停牌机制",
    content: "异常波动、重大重组、财报造假核查均会停牌，重组停牌无固定期限，存在时间成本风险。",
    highlight: "停牌 = 资金冻结风险",
  },

  // ===== 三、盘面资金与主力逻辑 (21-30) =====
  {
    id: 21,
    category: "盘面资金",
    title: "量价核心关系",
    content: "涨价必须配增量，缩量上涨=情绪透支，放量滞涨=主力出货信号。",
    highlight: "缩量涨=透支，放量滞涨=出货",
  },
  {
    id: 22,
    category: "盘面资金",
    title: "缩量下跌意义",
    content: "无承接、无抛压，多为洗盘末期，恐慌盘已经出清。",
    highlight: "缩量跌 = 洗盘尾声",
  },
  {
    id: 23,
    category: "盘面资金",
    title: "放量下跌意义",
    content: "大量资金出逃、分歧崩盘，大概率是趋势反转信号，不是抄底时机。",
    highlight: "放量跌 = 别抄底",
  },
  {
    id: 24,
    category: "盘面资金",
    title: "主力洗盘特征",
    content: "大跌不放量、关键支撑不破、分时反复震荡，目的洗掉散户浮筹。",
    highlight: "跌不放量 = 洗盘不是出货",
  },
  {
    id: 25,
    category: "盘面资金",
    title: "主力出货特征",
    content: "高位反复冲高回落、放量滞涨、利好兑现冲高跳水。",
    highlight: "高位放量滞涨 = 出货",
  },
  {
    id: 26,
    category: "盘面资金",
    title: "筹码峰原理",
    content: "单峰密集=筹码稳定、拉升压力小；多峰散乱=筹码分歧大、震荡洗盘为主。",
    highlight: "单峰=稳定，多峰=分歧",
  },
  {
    id: 27,
    category: "盘面资金",
    title: "突破有效性判定",
    content: "突破压力位+放量站稳3日，才算有效突破；单日脉冲突破多为诱多。",
    highlight: "放量站稳3日 = 真突破",
  },
  {
    id: 28,
    category: "盘面资金",
    title: "分时承接强弱",
    content: "急跌后快速收回、不创新低=强承接；急跌阴跌不反弹=无承接。",
    highlight: "急跌快收 = 强承接",
  },
  {
    id: 29,
    category: "盘面资金",
    title: "板块轮动逻辑",
    content: "A股是结构性行情，极少全面牛，赚钱集中在当下主线赛道。",
    highlight: "A股 = 结构市，跟主线",
  },
  {
    id: 30,
    category: "盘面资金",
    title: "高低切行情",
    content: "高位题材退潮后，资金会切换低位低价、低位潜伏标的，是市场避险规律。",
    highlight: "高位退潮 → 切低位",
  },

  // ===== 四、宏观、周期与风控进阶 (31-40) =====
  {
    id: 31,
    category: "宏观与风控",
    title: "降息对股市逻辑",
    content: "降息降低企业融资成本、释放流动性，利好权益市场整体估值抬升。",
    highlight: "降息 = 放水利好股市",
  },
  {
    id: 32,
    category: "宏观与风控",
    title: "加息对股市逻辑",
    content: "资金回流理财、存款，市场流动性收紧，高估值成长股承压最明显。",
    highlight: "加息 = 收水利空成长股",
  },
  {
    id: 33,
    category: "宏观与风控",
    title: "通胀资产轮动",
    content: "高通胀利好消费、资源、大宗商品；低通胀利好科技、成长股。",
    highlight: "高通胀→资源，低通胀→科技",
  },
  {
    id: 34,
    category: "宏观与风控",
    title: "周期股交易逻辑",
    content: "赚业绩反转、景气上行的钱，不赚高位高业绩的钱，高业绩落地即兑现。",
    highlight: "周期股 = 买在低谷，卖在高峰",
  },
  {
    id: 35,
    category: "宏观与风控",
    title: "成长股交易逻辑",
    content: "赚估值扩张+增速预期，靠政策、技术突破、行业渗透率提升驱动。",
    highlight: "成长股 = 赚预期，看渗透率",
  },
  {
    id: 36,
    category: "宏观与风控",
    title: "价值股交易逻辑",
    content: "赚分红修复、估值修复，适合熊市防御、震荡市打底仓。",
    highlight: "价值股 = 吃分红，防御打底",
  },
  {
    id: 37,
    category: "宏观与风控",
    title: "右侧交易核心",
    content: "不猜底、不抄底，等趋势反转、信号确认再入场，容错率远高于左侧。",
    highlight: "右侧 = 等确认，不猜底",
  },
  {
    id: 38,
    category: "宏观与风控",
    title: "仓位管理中级逻辑",
    content: "震荡市5成仓、趋势市7-8成仓、弱势市2成仓或空仓。",
    highlight: "震荡5成，趋势8成，弱势2成",
  },
  {
    id: 39,
    category: "宏观与风控",
    title: "最大回撤概念",
    content: "账户从最高点到最低点的跌幅，是衡量交易稳定性的核心指标，比收益率更重要。",
    highlight: "最大回撤 > 收益率",
  },
  {
    id: 40,
    category: "宏观与风控",
    title: "市场有效边界",
    content: "短期股价由情绪和资金决定，中长期股价完全由企业业绩和估值决定。",
    highlight: "短期看情绪，长期看业绩",
  },
];

/** 按分类分组 */
export const LEARNING_CATEGORIES = [
  { name: "估值与基本面", range: "1-10", color: "#3B82F6" },
  { name: "交易机制", range: "11-20", color: "#8B5CF6" },
  { name: "盘面资金", range: "21-30", color: "#F59E0B" },
  { name: "宏观与风控", range: "31-40", color: "#059669" },
];
