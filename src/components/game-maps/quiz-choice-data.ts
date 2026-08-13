/**
 * 股票入门交易知识选择题 (41-80)
 * 多邻国风格答题模式 — 四选一，即时反馈
 */

export interface QuizQuestion {
  id: number;
  question: string;
  options: [string, string, string, string]; // A, B, C, D
  answer: number; // 0=A, 1=B, 2=C, 3=D
  category: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 41, question: "A股的交易市场不包括？", options: ["上交所", "深交所", "北交所", "纽约交易所"], answer: 3, category: "基础知识" },
  { id: 42, question: "国内普通散户主要交易的股票是？", options: ["A股", "B股", "港股", "美股"], answer: 0, category: "基础知识" },
  { id: 43, question: "股票的本质是？", options: ["债权", "公司所有权份额、股权凭证", "存款", "保险"], answer: 1, category: "基础知识" },
  { id: 44, question: "买入股票后，投资者成为？", options: ["公司债权人", "公司股东", "公司员工", "银行客户"], answer: 1, category: "基础知识" },
  { id: 45, question: "股票涨跌的单位是？", options: ["元", "点/百分比", "斤", "份"], answer: 1, category: "基础知识" },
  { id: 46, question: "A股普通股票单日涨跌幅限制是？", options: ["5%", "10%", "20%", "无限制"], answer: 1, category: "交易规则" },
  { id: 47, question: "科创板、创业板股票单日涨跌幅限制是？", options: ["10%", "20%", "30%", "5%"], answer: 1, category: "交易规则" },
  { id: 48, question: "ST股票单日涨跌幅限制为？", options: ["5%", "10%", "20%", "0%"], answer: 0, category: "交易规则" },
  { id: 49, question: "A股交易时间（工作日）正确的是？", options: ["全天24小时", "上午9:30-11:30，下午13:00-15:00", "随意交易", "只有晚上"], answer: 1, category: "交易规则" },
  { id: 50, question: "周末和法定节假日，A股？", options: ["正常交易", "休市停盘", "半天交易", "涨跌不限"], answer: 1, category: "交易规则" },
  { id: 51, question: "股票开盘集合竞价时间是？", options: ["9:00", "9:15-9:25", "8:00", "10:00"], answer: 1, category: "交易规则" },
  { id: 52, question: "股票最小交易单位是？", options: ["1股", "1手（100股）", "10股", "1000股"], answer: 1, category: "交易规则" },
  { id: 53, question: "A股1手股票等于多少股？", options: ["10股", "100股", "500股", "1000股"], answer: 1, category: "交易规则" },
  { id: 54, question: "股票\"T+1交易\"指的是？", options: ["当天买当天卖", "当天买入，下一个交易日才能卖出", "随时买卖", "隔天买隔天卖"], answer: 1, category: "交易规则" },
  { id: 55, question: "A股股票实行的交易制度是？", options: ["T+0", "T+1", "T+2", "T+3"], answer: 1, category: "交易规则" },
  { id: 56, question: "股票分红的主要形式是？", options: ["公司给股东发红利、送股", "强制退钱", "股价必涨", "免费送股票"], answer: 0, category: "基础概念" },
  { id: 57, question: "股息指的是？", options: ["股票交易手续费", "公司分给股东的现金分红", "股票亏损", "股价涨幅"], answer: 1, category: "基础概念" },
  { id: 58, question: "市盈率（PE）主要用来判断？", options: ["公司市值估值高低", "公司员工数量", "公司地址", "公司成立时间"], answer: 0, category: "估值指标" },
  { id: 59, question: "市盈率越低，代表？", options: ["估值相对越低", "估值越高", "必然大涨", "必然大跌"], answer: 0, category: "估值指标" },
  { id: 60, question: "市净率（PB）参考的是？", options: ["公司股价和净资产比值", "营收比值", "利润比值", "销量比值"], answer: 0, category: "估值指标" },
  { id: 61, question: "大盘上证指数指的是？", options: ["深市所有股票指数", "上海证券综合指数", "创业板指数", "基金指数"], answer: 1, category: "指数代码" },
  { id: 62, question: "创业板股票代码开头是？", options: ["60开头", "00开头", "30开头", "88开头"], answer: 2, category: "指数代码" },
  { id: 63, question: "科创板股票代码开头是？", options: ["688开头", "300开头", "000开头", "600开头"], answer: 0, category: "指数代码" },
  { id: 64, question: "沪市主板股票代码多为？", options: ["60开头", "00开头", "30开头", "8开头"], answer: 0, category: "指数代码" },
  { id: 65, question: "深市主板股票代码多为？", options: ["00开头", "60开头", "30开头", "688开头"], answer: 0, category: "指数代码" },
  { id: 66, question: "股票\"建仓\"指的是？", options: ["第一次买入股票", "全部卖出股票", "加仓买入", "减仓卖出"], answer: 0, category: "交易术语" },
  { id: 67, question: "股票\"加仓\"指的是？", options: ["卖出股票", "持有股票基础上继续买入", "清仓", "销户"], answer: 1, category: "交易术语" },
  { id: 68, question: "股票\"减仓\"指的是？", options: ["增持股票", "卖出部分持仓股票", "全部卖出", "新开账户"], answer: 1, category: "交易术语" },
  { id: 69, question: "股票\"清仓\"指的是？", options: ["卖出手中全部股票", "买入更多股票", "持仓不动", "暂停交易"], answer: 0, category: "交易术语" },
  { id: 70, question: "\"持仓\"的意思是？", options: ["空仓没钱", "账户持有股票/基金资产", "刚卖出", "刚开户"], answer: 1, category: "交易术语" },
  { id: 71, question: "\"空仓\"指的是？", options: ["账户满仓股票", "账户无任何持仓、持现金状态", "亏损状态", "盈利状态"], answer: 1, category: "交易术语" },
  { id: 72, question: "\"满仓\"指的是？", options: ["资金全部买入资产，几乎无现金", "空仓状态", "半仓交易", "暂停交易"], answer: 0, category: "交易术语" },
  { id: 73, question: "股票\"套牢\"指的是？", options: ["卖出赚钱", "买入后股价下跌，卖出会亏损，舍不得割肉", "保本状态", "持续盈利"], answer: 1, category: "交易术语" },
  { id: 74, question: "\"割肉\"指的是？", options: ["盈利卖出", "亏损状态下卖出止损", "长期持有", "加仓"], answer: 1, category: "交易术语" },
  { id: 75, question: "\"止盈\"指的是？", options: ["亏损卖出", "达到预期收益，获利卖出锁定利润", "一直持有", "加仓"], answer: 1, category: "风控策略" },
  { id: 76, question: "\"止损\"指的是？", options: ["防止亏损扩大，亏损达标果断卖出", "越跌越买", "长期套牢", "持有不动"], answer: 0, category: "风控策略" },
  { id: 77, question: "换手率越高，代表股票？", options: ["交易越冷清", "交易越活跃、筹码交换频繁", "必然上涨", "必然下跌"], answer: 1, category: "盘面指标" },
  { id: 78, question: "成交量放大代表？", options: ["市场交易活跃度提升", "没人交易", "休市状态", "股价固定不变"], answer: 0, category: "盘面指标" },
  { id: 79, question: "利好消息一般会让股价？", options: ["大概率上涨", "必然大跌", "不变", "强制停牌"], answer: 0, category: "盘面指标" },
  { id: 80, question: "利空消息一般会让股价？", options: ["大概率下跌", "必然大涨", "不变", "涨停"], answer: 0, category: "盘面指标" },
];
