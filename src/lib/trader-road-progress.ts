// ===== 交易员的正确之路 — 进度与解锁系统 =====
// localStorage key: tradeti_game_progress
// 与 tradeti_state（人格测试）独立共存，互不覆盖

// ===== 类型定义 =====

export type TraderRoadAgentId =
  | "lead"
  | "data"
  | "market"
  | "industry"
  | "fundamental"
  | "valuation"
  | "technical"
  | "sentiment"
  | "bull"
  | "bear"
  | "risk"
  | "manager";

export type TraderRoadLevelStatus =
  | "completed"
  | "available"
  | "coming_soon"
  | "locked";

export interface TraderRoadLevel {
  id: number;
  title: string;
  subtitle: string;
  unlockAgents: TraderRoadAgentId[];
  status?: TraderRoadLevelStatus;
}

export interface TraderRoadFailureRecord {
  levelId: number;
  reason: string;
  endingId: string;
  createdAt: string;
}

export interface TraderRoadProgress {
  version: 1;
  currentLevel: number;
  completedLevels: number[];
  unlockedAgents: TraderRoadAgentId[];
  levelFailCounts: Record<string, number>;
  failureRecords: TraderRoadFailureRecord[];
  /** 炒币 — 答题/学习奖励货币 */
  coins: number;
  /** 已学习的学习卡片ID */
  learnedCards: number[];
  /** 已答对的题目ID */
  correctQuizIds: number[];
  // ===== XP 成长系统 =====
  /** 累计经验值 */
  totalXP: number;
  /** 已发放关卡首次奖励的关卡ID（防重复） */
  rewardedLevels: number[];
  /** 已发放 Agent 首次解锁奖励的 Agent ID（防重复） */
  rewardedAgents: TraderRoadAgentId[];
  /** 每日任务完成记录的日期 (YYYY-MM-DD) */
  dailyTaskDate: string;
  /** 当天已完成的任务ID列表 */
  dailyCompletedTasks: string[];
  /** 当天全部主线任务的额外XP是否已领取 */
  dailyBonusClaimed: boolean;
  updatedAt: string;
}

// ===== 常量 =====

const STORAGE_KEY = "tradeti_game_progress";

export const TRADER_ROAD_LEVELS: TraderRoadLevel[] = [
  {
    id: 1,
    title: "开户日",
    subtitle: "Data Agent",
    unlockAgents: ["data"],
  },
  {
    id: 2,
    title: "数据黑市",
    subtitle: "Market Agent",
    unlockAgents: ["market"],
  },
  {
    id: 3,
    title: "市场风暴",
    subtitle: "Industry Agent",
    unlockAgents: ["industry"],
  },
  {
    id: 4,
    title: "政策密函",
    subtitle: "Valuation Agent",
    unlockAgents: ["valuation"],
  },
  {
    id: 5,
    title: "价格审判庭",
    subtitle: "Technical Agent",
    unlockAgents: ["technical"],
  },
  {
    id: 6,
    title: "K线神谕",
    subtitle: "Sentiment Agent",
    unlockAgents: ["sentiment"],
  },
  {
    id: 7,
    title: "多空议会",
    subtitle: "Bull Analyst",
    unlockAgents: ["bull"],
  },
  {
    id: 8,
    title: "舆论火场",
    subtitle: "Bear Analyst",
    unlockAgents: ["bear"],
  },
  {
    id: 9,
    title: "回撤之门",
    subtitle: "Risk Officer",
    unlockAgents: ["risk"],
  },
  {
    id: 10,
    title: "最终关",
    subtitle: "Research Manager",
    unlockAgents: ["manager"],
  },
];

// ===== XP 成长系统常量 =====

/** 等级阈值表：[最低XP, 等级, 称号] */
export const XP_LEVEL_TABLE: Array<{ minXP: number; level: number; title: string }> = [
  { minXP: 0, level: 1, title: "市场新手" },
  { minXP: 50, level: 2, title: "市场观察员" },
  { minXP: 120, level: 3, title: "市场调查员" },
  { minXP: 220, level: 4, title: "研究分析员" },
  { minXP: 350, level: 5, title: "独立研究员" },
  { minXP: 500, level: 6, title: "资深研究员" },
  { minXP: 700, level: 7, title: "首席分析师" },
  { minXP: 1000, level: 8, title: "研究总监" },
];

/** XP 奖励常量 */
export const XP_REWARDS = {
  /** 完成一个普通每日任务 */
  DAILY_TASK: 10,
  /** 完成当日全部主线任务额外奖励 */
  DAILY_BONUS: 20,
  /** 首次通关一个剧情关卡 */
  LEVEL_COMPLETE: 50,
  /** 首次解锁一个 Agent */
  AGENT_UNLOCK: 30,
} as const;

// ===== XP 计算函数 =====

/** 根据累计 XP 计算当前等级和称号 */
export function calcLevelFromXP(totalXP: number): { level: number; title: string } {
  let result = XP_LEVEL_TABLE[0];
  for (const entry of XP_LEVEL_TABLE) {
    if (totalXP >= entry.minXP) {
      result = entry;
    } else {
      break;
    }
  }
  return { level: result.level, title: result.title };
}

/** 获取当前等级到下一等级的 XP 进度 */
export function calcXPProgress(totalXP: number): {
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  xpToNext: number;
} {
  const { level } = calcLevelFromXP(totalXP);
  const currentEntry = XP_LEVEL_TABLE.find(e => e.level === level) || XP_LEVEL_TABLE[0];
  const nextEntry = XP_LEVEL_TABLE.find(e => e.level === level + 1);

  if (!nextEntry) {
    // 已满级
    return { currentLevelXP: totalXP - currentEntry.minXP, nextLevelXP: 0, progressPercent: 100, xpToNext: 0 };
  }

  const currentLevelXP = totalXP - currentEntry.minXP;
  const nextLevelXP = nextEntry.minXP - currentEntry.minXP;
  const progressPercent = Math.min(100, Math.max(0, (currentLevelXP / nextLevelXP) * 100));
  const xpToNext = nextLevelXP - currentLevelXP;

  return { currentLevelXP, nextLevelXP, progressPercent, xpToNext };
}

/** 获取今天的日期字符串 YYYY-MM-DD */
export function getTodayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ===== 工具函数 =====

/**
 * 判断是否浏览器环境（SSR 安全）
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * 返回默认进度（updatedAt 在调用时生成）
 */
export function getDefaultTraderRoadProgress(): TraderRoadProgress {
  return {
    version: 1,
    currentLevel: 1,
    completedLevels: [],
    unlockedAgents: ["lead"],
    levelFailCounts: {},
    failureRecords: [],
    coins: 0,
    learnedCards: [],
    correctQuizIds: [],
    totalXP: 0,
    rewardedLevels: [],
    rewardedAgents: [],
    dailyTaskDate: getTodayDateStr(),
    dailyCompletedTasks: [],
    dailyBonusClaimed: false,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 规范化进度数据，兼容损坏的 localStorage 数据
 */
export function normalizeTraderRoadProgress(raw: unknown): TraderRoadProgress {
  const defaults = getDefaultTraderRoadProgress();

  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  const obj = raw as Record<string, unknown>;

  // completedLevels: 去重并排序
  const rawCompleted = Array.isArray(obj.completedLevels)
    ? obj.completedLevels.filter((v): v is number => typeof v === "number")
    : [];
  const completedLevels = [...new Set(rawCompleted)].sort((a, b) => a - b);

  // unlockedAgents: 去重
  const validAgentIds: TraderRoadAgentId[] = [
    "lead", "data", "market", "industry", "fundamental", "valuation",
    "technical", "sentiment", "bull", "bear", "risk", "manager",
  ];
  const rawAgents = Array.isArray(obj.unlockedAgents)
    ? obj.unlockedAgents.filter((v): v is TraderRoadAgentId =>
        typeof v === "string" && validAgentIds.includes(v as TraderRoadAgentId)
      )
    : [];
  const unlockedAgents = [...new Set(rawAgents)];

  // currentLevel: 至少为 1
  const rawCurrentLevel = typeof obj.currentLevel === "number" ? obj.currentLevel : 1;
  const currentLevel = Math.max(1, Math.floor(rawCurrentLevel));

  // levelFailCounts
  const levelFailCounts = (obj.levelFailCounts && typeof obj.levelFailCounts === "object" && !Array.isArray(obj.levelFailCounts))
    ? obj.levelFailCounts as Record<string, number>
    : {};

  // failureRecords
  const rawRecords = Array.isArray(obj.failureRecords) ? obj.failureRecords : [];
  const failureRecords: TraderRoadFailureRecord[] = rawRecords
    .filter((r): r is TraderRoadFailureRecord =>
      r && typeof r === "object" && typeof (r as TraderRoadFailureRecord).levelId === "number"
    )
    .map((r) => ({
      levelId: r.levelId,
      reason: typeof r.reason === "string" ? r.reason : "",
      endingId: typeof r.endingId === "string" ? r.endingId : "",
      createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString(),
    }));

  // updatedAt
  const updatedAt = typeof obj.updatedAt === "string" ? obj.updatedAt : new Date().toISOString();

  // coins
  const coins = typeof obj.coins === "number" ? Math.max(0, Math.floor(obj.coins)) : 0;

  // learnedCards
  const rawLearned = Array.isArray(obj.learnedCards)
    ? obj.learnedCards.filter((v): v is number => typeof v === "number")
    : [];
  const learnedCards = [...new Set(rawLearned)];

  // correctQuizIds
  const rawCorrect = Array.isArray(obj.correctQuizIds)
    ? obj.correctQuizIds.filter((v): v is number => typeof v === "number")
    : [];
  const correctQuizIds = [...new Set(rawCorrect)];

  // ===== XP 成长系统字段（兼容旧数据） =====
  const totalXP = typeof obj.totalXP === "number" ? Math.max(0, Math.floor(obj.totalXP)) : 0;

  const rawRewardedLevels = Array.isArray(obj.rewardedLevels)
    ? obj.rewardedLevels.filter((v): v is number => typeof v === "number")
    : [];
  const rewardedLevels = [...new Set(rawRewardedLevels)];

  const rawRewardedAgents = Array.isArray(obj.rewardedAgents)
    ? obj.rewardedAgents.filter((v): v is TraderRoadAgentId =>
        typeof v === "string" && validAgentIds.includes(v as TraderRoadAgentId)
      )
    : [];
  const rewardedAgents = [...new Set(rawRewardedAgents)];

  const dailyTaskDate = typeof obj.dailyTaskDate === "string" ? obj.dailyTaskDate : getTodayDateStr();
  const rawDailyCompleted = Array.isArray(obj.dailyCompletedTasks)
    ? obj.dailyCompletedTasks.filter((v): v is string => typeof v === "string")
    : [];
  const dailyCompletedTasks = [...new Set(rawDailyCompleted)];
  const dailyBonusClaimed = obj.dailyBonusClaimed === true;

  // 每日重置：如果不是今天，清空每日任务进度（但保留累计XP）
  const today = getTodayDateStr();
  const isToday = dailyTaskDate === today;

  return {
    version: 1,
    currentLevel,
    completedLevels,
    unlockedAgents,
    levelFailCounts,
    failureRecords,
    coins,
    learnedCards,
    correctQuizIds,
    totalXP,
    rewardedLevels,
    rewardedAgents,
    dailyTaskDate: isToday ? dailyTaskDate : today,
    dailyCompletedTasks: isToday ? dailyCompletedTasks : [],
    dailyBonusClaimed: isToday ? dailyBonusClaimed : false,
    updatedAt,
  };
}

// ===== 读写函数 =====

/**
 * 从 localStorage 读取进度
 * SSR 安全 / JSON 解析失败时返回默认进度
 */
export function loadTraderRoadProgress(): TraderRoadProgress {
  if (!isBrowser()) {
    return getDefaultTraderRoadProgress();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultTraderRoadProgress();
    }
    const parsed = JSON.parse(raw);
    return normalizeTraderRoadProgress(parsed);
  } catch {
    return getDefaultTraderRoadProgress();
  }
}

/**
 * 写入 localStorage
 * SSR 安全：非浏览器环境直接返回 progress，不报错
 */
export function saveTraderRoadProgress(progress: TraderRoadProgress): TraderRoadProgress {
  if (!isBrowser()) {
    return progress;
  }

  const toSave = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore quota errors
  }

  return toSave;
}

// ===== 业务函数 =====

/**
 * 完成某一关：
 * - 将 levelId 加入 completedLevels
 * - 解锁该关对应 unlockAgents
 * - currentLevel 更新为 Math.max(currentLevel, levelId + 1)
 * - 清空该关失败次数
 * - 首次通关发放关卡 XP + Agent 解锁 XP
 * - 保存并返回新 progress
 */
export function completeTraderRoadLevel(levelId: number): TraderRoadProgress {
  const progress = loadTraderRoadProgress();
  let xpGained = 0;

  // 加入 completedLevels（去重）
  if (!progress.completedLevels.includes(levelId)) {
    progress.completedLevels.push(levelId);
    progress.completedLevels.sort((a, b) => a - b);
  }

  // 解锁该关对应 Agent
  const level = TRADER_ROAD_LEVELS.find((l) => l.id === levelId);
  if (level) {
    const newAgents = level.unlockAgents.filter(
      (a) => !progress.unlockedAgents.includes(a)
    );
    progress.unlockedAgents.push(...newAgents);

    // 首次通关关卡 XP（防重复）
    if (!progress.rewardedLevels.includes(levelId)) {
      progress.rewardedLevels.push(levelId);
      xpGained += XP_REWARDS.LEVEL_COMPLETE;
    }

    // 首次解锁 Agent XP（每个 Agent 只奖励一次）
    for (const agentId of newAgents) {
      if (!progress.rewardedAgents.includes(agentId)) {
        progress.rewardedAgents.push(agentId);
        xpGained += XP_REWARDS.AGENT_UNLOCK;
      }
    }
  }

  // 累加 XP
  progress.totalXP += xpGained;

  // 更新 currentLevel
  progress.currentLevel = Math.max(progress.currentLevel, levelId + 1);

  // 清空该关失败次数
  delete progress.levelFailCounts[String(levelId)];

  return saveTraderRoadProgress(progress);
}

/**
 * 手动解锁一个或多个 Agent
 */
export function unlockTraderRoadAgents(agentIds: TraderRoadAgentId[]): TraderRoadProgress {
  const progress = loadTraderRoadProgress();

  const newAgents = agentIds.filter(
    (a) => !progress.unlockedAgents.includes(a)
  );
  progress.unlockedAgents.push(...newAgents);

  return saveTraderRoadProgress(progress);
}

/**
 * 记录一次失败
 */
export function addTraderRoadFailure(
  levelId: number,
  reason: string,
  endingId: string
): TraderRoadProgress {
  const progress = loadTraderRoadProgress();

  // levelFailCounts[levelId] + 1
  const key = String(levelId);
  progress.levelFailCounts[key] = (progress.levelFailCounts[key] || 0) + 1;

  // 追加失败记录
  progress.failureRecords.push({
    levelId,
    reason,
    endingId,
    createdAt: new Date().toISOString(),
  });

  return saveTraderRoadProgress(progress);
}

/**
 * 重置某一关失败次数
 */
export function resetTraderRoadLevelFailures(levelId: number): TraderRoadProgress {
  const progress = loadTraderRoadProgress();

  const key = String(levelId);
  delete progress.levelFailCounts[key];

  return saveTraderRoadProgress(progress);
}

// ===== 每日任务 XP 函数 =====

/**
 * 完成一个每日任务，返回获得的 XP（0 表示已领取过）
 */
export function completeDailyTask(taskId: string): { progress: TraderRoadProgress; xpGained: number } {
  const progress = loadTraderRoadProgress();
  const today = getTodayDateStr();

  // 日期变更时重置每日状态
  if (progress.dailyTaskDate !== today) {
    progress.dailyTaskDate = today;
    progress.dailyCompletedTasks = [];
    progress.dailyBonusClaimed = false;
  }

  // 已完成过 → 不重复发放
  if (progress.dailyCompletedTasks.includes(taskId)) {
    return { progress, xpGained: 0 };
  }

  progress.dailyCompletedTasks.push(taskId);
  progress.totalXP += XP_REWARDS.DAILY_TASK;

  return { progress: saveTraderRoadProgress(progress), xpGained: XP_REWARDS.DAILY_TASK };
}

/**
 * 领取每日全部完成的额外 XP 奖励（每天只能领一次）
 */
export function claimDailyBonus(): { progress: TraderRoadProgress; xpGained: number } {
  const progress = loadTraderRoadProgress();
  const today = getTodayDateStr();

  if (progress.dailyTaskDate !== today) {
    progress.dailyTaskDate = today;
    progress.dailyCompletedTasks = [];
    progress.dailyBonusClaimed = false;
  }

  if (progress.dailyBonusClaimed) {
    return { progress, xpGained: 0 };
  }

  progress.dailyBonusClaimed = true;
  progress.totalXP += XP_REWARDS.DAILY_BONUS;

  return { progress: saveTraderRoadProgress(progress), xpGained: XP_REWARDS.DAILY_BONUS };
}

// ===== 查询函数 =====

/**
 * 判断 Agent 是否已解锁
 */
export function isTraderRoadAgentUnlocked(
  progress: TraderRoadProgress,
  agentId: TraderRoadAgentId | string
): boolean {
  return progress.unlockedAgents.includes(agentId as TraderRoadAgentId);
}

/**
 * 判断关卡状态
 */
export function getTraderRoadLevelStatus(
  progress: TraderRoadProgress,
  levelId: number
): TraderRoadLevelStatus {
  if (progress.completedLevels.includes(levelId)) {
    return "completed";
  }
  if (levelId === progress.currentLevel) {
    return "available";
  }
  if (levelId === progress.currentLevel + 1) {
    return "coming_soon";
  }
  return "locked";
}

/**
 * 返回带状态的关卡列表
 */
export function getTraderRoadLevelsWithStatus(
  progress: TraderRoadProgress
): (TraderRoadLevel & { status: TraderRoadLevelStatus })[] {
  return TRADER_ROAD_LEVELS.map((level) => ({
    ...level,
    status: getTraderRoadLevelStatus(progress, level.id),
  }));
}

// ===== React Hook =====

/**
 * React hook for reactive access to trader road progress.
 * Must be used in "use client" components.
 */
export function useTraderRoadProgress() {
  // Dynamic import to avoid SSR issues
  const { useState, useEffect, useCallback } = require("react");

  const [progress, setProgress] = useState(
    getDefaultTraderRoadProgress() as TraderRoadProgress
  );

  useEffect(() => {
    setProgress(loadTraderRoadProgress());
  }, []);

  const completeLevel = useCallback((levelId: number) => {
    const updated = completeTraderRoadLevel(levelId);
    setProgress(updated);
  }, []);

  const isLevelUnlocked = useCallback(
    (levelId: number) => {
      const status = getTraderRoadLevelStatus(progress, levelId);
      return status === "available" || status === "completed";
    },
    [progress]
  );

  const resetProgress = useCallback(() => {
    if (isBrowser()) {
      localStorage.removeItem(STORAGE_KEY);
    }
    setProgress(getDefaultTraderRoadProgress());
  }, []);

  /** 增加炒币 */
  const addCoins = useCallback((amount: number) => {
    setProgress((prev: TraderRoadProgress) => {
      const updated: TraderRoadProgress = {
        ...prev,
        coins: prev.coins + Math.max(0, amount),
        updatedAt: new Date().toISOString(),
      };
      saveTraderRoadProgress(updated);
      return updated;
    });
  }, []);

  /** 标记学习卡片为已学 */
  const markCardLearned = useCallback((cardId: number) => {
    setProgress((prev: TraderRoadProgress) => {
      if (prev.learnedCards.includes(cardId)) return prev;
      const updated: TraderRoadProgress = {
        ...prev,
        learnedCards: [...prev.learnedCards, cardId],
        coins: prev.coins + 5, // 学一张卡 +5 炒币
        updatedAt: new Date().toISOString(),
      };
      saveTraderRoadProgress(updated);
      return updated;
    });
  }, []);

  /** 记录答对的题目 */
  const markQuizCorrect = useCallback((quizId: number) => {
    setProgress((prev: TraderRoadProgress) => {
      if (prev.correctQuizIds.includes(quizId)) return prev;
      const updated: TraderRoadProgress = {
        ...prev,
        correctQuizIds: [...prev.correctQuizIds, quizId],
        coins: prev.coins + 10, // 答对一题 +10 炒币
        updatedAt: new Date().toISOString(),
      };
      saveTraderRoadProgress(updated);
      return updated;
    });
  }, []);

  return {
    progress,
    completeLevel,
    isLevelUnlocked,
    resetProgress,
    addCoins,
    markCardLearned,
    markQuizCorrect,
  };
}
