/**
 * 人格成长故事线 - 9种人格 × 9条专属故事线
 *
 * 每条故事线包含：
 * - title: 故事线标题
 * - opening: 角色开场白（搭子说的第一句话）
 * - tasks: 成长任务列表
 * - reward: 完成所有任务后的搭子结语
 */

export interface StoryTask {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  /** 任务关联的数据操作提示 */
  hint: string;
}

export interface PersonalityStoryline {
  id: string;
  title: string;
  opening: string;
  tasks: StoryTask[];
  reward: string;
}

export const PERSONALITY_STORYLINES: Record<string, PersonalityStoryline> = {
  /* ===== 偏激人格：成长故事线 ===== */

  all_in_warrior: {
    id: "all_in_warrior",
    title: "寻找失踪的仓位管理",
    opening: "我的全部筹码已经准备好了——等等，仓位管理去哪了？",
    tasks: [
      {
        id: "risk_shield_1",
        emoji: "🛡️",
        name: "护盾一：最大可承受亏损",
        desc: "查看当前板块资金流向，找到最大可承受亏损",
        hint: "在板块热度榜中，看看资金流入前三的板块，思考你能承受多少回调",
      },
      {
        id: "risk_shield_2",
        emoji: "🛡️",
        name: "护盾二：反面证据",
        desc: "找到推荐标的的至少1条利空因素",
        hint: "在推荐标的的风险提示中，找到至少一条看空理由",
      },
      {
        id: "risk_shield_3",
        emoji: "🛡️",
        name: "护盾三：退出条件",
        desc: "设定涨多少止盈 / 跌多少止损的条件",
        hint: "参考技术面分析的支撑位和压力位，设定你的退出计划",
      },
    ],
    reward: "仓位管理已归位。下次满仓前，先问问它。",
  },

  qin_shihuang: {
    id: "qin_shihuang",
    title: "真假财富秘境",
    opening: "朕刚收到一条百倍财富密令。爱卿，先替朕验验真假。",
    tasks: [
      {
        id: "source_check",
        emoji: "🔍",
        name: "信息来源检查",
        desc: "查看一条新闻的来源是否可靠",
        hint: "在资讯列表中，找到一条新闻并查看其来源媒体",
      },
      {
        id: "prob_check",
        emoji: "📊",
        name: "收益概率检查",
        desc: "查看推荐标的的历史收益分布",
        hint: "在推荐标的中，查看机会评分和风险等级",
      },
      {
        id: "stakeholder_check",
        emoji: "👥",
        name: "利益相关方检查",
        desc: "检查新闻背后是否有利益相关方",
        hint: "思考这条新闻对谁有利，谁在推动它",
      },
      {
        id: "evidence_check",
        emoji: "⚖️",
        name: "反面证据检查",
        desc: "找到至少一条看空观点",
        hint: "在基本面分析中，查找机构研报的分歧点",
      },
    ],
    reward: "爱卿慧眼。这世间没有免费的百倍密令，但有一份靠谱的研究报告。",
  },

  fomo_chaser: {
    id: "fomo_chaser",
    title: "追赶已经起飞的火箭",
    opening: "火箭已经飞了八百米。现在的问题不是追不追，而是燃料还剩多少。",
    tasks: [
      {
        id: "timing_check",
        emoji: "⏰",
        name: "消息时效检查",
        desc: "查看第一条消息出现的时间",
        hint: "在资讯列表中，找到最早报道该事件的时间",
      },
      {
        id: "gain_check",
        emoji: "📈",
        name: "当前涨幅检查",
        desc: "查看该板块或个股的累计涨幅",
        hint: "在板块热度榜中，查看热门板块的涨幅数据",
      },
      {
        id: "pricing_check",
        emoji: "💰",
        name: "预期计价检查",
        desc: "查看市场预期是否已充分反映",
        hint: "结合技术面分析，判断当前价格是否已透支利好",
      },
      {
        id: "fundamental_check",
        emoji: "🏗️",
        name: "基本面支撑检查",
        desc: "查看上涨是否有资金和基本面支撑",
        hint: "在基本面分析中，查看机构共识和资金流向",
      },
    ],
    reward: "火箭的燃料表你看了。追不追，你自己决定。",
  },

  breakeven_master: {
    id: "breakeven_master",
    title: "成本价不是宇宙中心",
    opening: "成本价不是宇宙中心。今天也要记住这一点。",
    tasks: [
      {
        id: "find_profit",
        emoji: "📌",
        name: "找到盈利标的",
        desc: "在当前板块中找一个正在盈利的标的",
        hint: "在板块热度榜中，寻找涨幅为正的板块和个股",
      },
      {
        id: "set_target",
        emoji: "🎯",
        name: "设定止盈位",
        desc: "根据技术面设定合理的止盈目标价",
        hint: "参考技术面分析的压力位，设定你的止盈目标",
      },
      {
        id: "write_note",
        emoji: "📝",
        name: "记录这句话",
        desc: "抄下这句话：'盈利不是罪过，持有到目标是本事'",
        hint: "记住：盈利不是罪过，持有到目标是本事",
      },
    ],
    reward: "成本价不会消失，但你可以选择看向远方。",
  },

  kline_shaman: {
    id: "kline_shaman",
    title: "蜡烛图外的世界",
    opening: "金叉很多，但点蜡烛之前，我们先看看基本面。",
    tasks: [
      {
        id: "check_fundamental",
        emoji: "📊",
        name: "查看基本面",
        desc: "打开一个技术形态好看的板块，查看其基本面数据",
        hint: "在板块热度榜中，选择一个涨幅靠前的板块，查看其基本面",
      },
      {
        id: "cross_verify",
        emoji: "🔄",
        name: "对比验证",
        desc: "对比K线信号和基本面是否一致",
        hint: "思考：这个板块的K线好看，但基本面真的支撑吗？",
      },
      {
        id: "find_counter",
        emoji: "⚠️",
        name: "找反例",
        desc: '找到一次"K线漂亮但基本面差"的案例',
        hint: "在板块中寻找技术面好但基本面一般的标的",
      },
    ],
    reward: "蜡烛图告诉你过去，基本面告诉你未来。两者都要看。",
  },

  monte_carlo_poet: {
    id: "monte_carlo_poet",
    title: "模型之外的现实",
    opening: "模型说今天风平浪静。现实正在旁边冷笑。",
    tasks: [
      {
        id: "check_reality",
        emoji: "🌍",
        name: "看现实",
        desc: '查看今日全球新闻中是否有"模型没预测到"的事件',
        hint: "在全球冒险地图中，查看今日突发事件",
      },
      {
        id: "compare_diff",
        emoji: "📉",
        name: "对比差异",
        desc: "对比模型预测与实际走势的差异",
        hint: "思考：实际走势和你的预期有什么不同？",
      },
      {
        id: "log_lesson",
        emoji: "📝",
        name: "记录教训",
        desc: '记录一次"模型失效"的认知',
        hint: "记住：模型是地图，不是领土",
      },
    ],
    reward: "模型是地图，不是领土。多看看现实世界在发生什么。",
  },

  report_archaeologist: {
    id: "report_archaeologist",
    title: "从财报到K线",
    opening: "别急着翻十年财报，今天的短线机会值得先看看。",
    tasks: [
      {
        id: "check_rotation",
        emoji: "🔄",
        name: "看轮动",
        desc: "查看今日板块轮动排名",
        hint: "在板块热度榜中，查看今日哪些板块在领涨",
      },
      {
        id: "compare_basic",
        emoji: "⚖️",
        name: "对比",
        desc: "对比基本面好的板块 vs 涨得好的板块",
        hint: "思考：好公司 = 好股票吗？",
      },
      {
        id: "find_gap",
        emoji: "💡",
        name: "找差距",
        desc: '找到一次"基本面好但没涨"的案例',
        hint: "在板块中找一个基本面好但涨幅不大的标的",
      },
    ],
    reward: "财报是体检报告，K线是体温计。两个都要看，但节奏不同。",
  },

  old_money: {
    id: "old_money",
    title: "从观察到行动",
    opening: "机会又来了。这次别观察三年，先看三分钟。",
    tasks: [
      {
        id: "pick_one",
        emoji: "🎯",
        name: "选一个标的",
        desc: "从推荐标的中选择一个",
        hint: "在推荐标的中，选择一个你感兴趣的",
      },
      {
        id: "set_period",
        emoji: "⏱️",
        name: "设观察期",
        desc: "设定一个不超过3天的观察期限",
        hint: "思考：3天内你能做出什么判断？",
      },
      {
        id: "make_decision",
        emoji: "✅",
        name: "做决定",
        desc: '在期限内做出"买/不买"的明确决定',
        hint: "行动不是赌博，是经过思考的选择",
      },
    ],
    reward: "行动不是赌博，是经过思考的选择。今天你选了。",
  },

  /* ===== 通关人格：无成长线 ===== */

  wall_street: {
    id: "wall_street",
    title: "每日研究任务",
    opening: "今天波动不小，但你的框架比市场稳。按计划走。",
    tasks: [
      {
        id: "daily_scan",
        emoji: "📋",
        name: "市场扫描",
        desc: "快速浏览今日板块轮动和异动信号",
        hint: "查看板块热度榜和个股异动，了解今日市场节奏",
      },
      {
        id: "deep_dive",
        emoji: "🔍",
        name: "深度研究",
        desc: "选择一个推荐标的进行基本面分析",
        hint: "在推荐标的中选择一个，完成完整的研究流程",
      },
    ],
    reward: "今天的市场课你上完了。明天见，交易员。",
  },
};

/** 获取人格的故事线，如果无人格或未定义则返回 null */
export function getStoryline(personalityId: string | null): PersonalityStoryline | null {
  if (!personalityId) return null;
  return PERSONALITY_STORYLINES[personalityId] || null;
}

/** 获取默认的日常任务（无测试用户） */
export function getDefaultStoryline(): PersonalityStoryline {
  return {
    id: "default",
    title: "日常研究任务",
    opening: "准备好开启今天的市场冒险了吗？",
    tasks: [
      {
        id: "daily_scan",
        emoji: "📋",
        name: "市场扫描",
        desc: "快速浏览今日板块轮动和异动信号",
        hint: "查看板块热度榜和个股异动，了解今日市场节奏",
      },
      {
        id: "deep_dive",
        emoji: "🔍",
        name: "深度研究",
        desc: "选择一个推荐标的进行基本面分析",
        hint: "在推荐标的中选择一个，完成研究流程",
      },
    ],
    reward: "每天进步一点点，市场会奖励认真的人。",
  };
}