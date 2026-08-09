// ===== 游戏地图 — 类型定义与关卡配置 =====

export type GameType = "dialogue" | "quiz" | "brain" | "minigame" | "learning" | "quiz_choice";

export interface GameMapLevel {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  type: GameType;
  unlockAgents: string[];
  color: string;
  description: string;
  /** 关卡数据 - 运行时动态注入 */
  data?: any;
  /** 学习卡片索引范围 (0-based, into LEARNING_CARDS) */
  learningCardIndices?: number[];
  /** 选择题索引范围 (0-based, into QUIZ_QUESTIONS) */
  quizQuestionIndices?: number[];
}

export const GAME_MAP_LEVELS: GameMapLevel[] = [
  { id: 1, title: "开户日", subtitle: "Lead Agent", icon: "\u{1F3AF}", type: "dialogue", unlockAgents: ["lead"], color: "#3B82F6", description: "废弃交易大厅里，前基金经理问你：你会不会立刻下单？" },
  { id: 2, title: "数据黑市", subtitle: "Data Agent", icon: "\u{1F4CA}", type: "dialogue", unlockAgents: ["data"], color: "#8B5CF6", description: "地下交易厅里三块屏幕同时亮起，用行情扫描器找出能用于交易的那一张。" },
  { id: 3, title: "市场风暴", subtitle: "Market Agent", icon: "\u{1F32A}\uFE0F", type: "dialogue", unlockAgents: ["market"], color: "#06B6D4", description: "地下交易大厅响起警报，用市场观察仪拉远镜头，判断眼前的下跌来自个股、行业还是整个市场。" },
  { id: 4, title: "政策密函", subtitle: "Industry Agent", icon: "\u{1F4DC}", type: "dialogue", unlockAgents: ["industry"], color: "#F59E0B", description: "冷链升级政策发布，在档案室里读懂文件，找出政策真正支持的对象。" },
  { id: 5, title: "财报夜审", subtitle: "Fundamental Agent", icon: "\u{1F4D1}", type: "quiz_choice", unlockAgents: ["fundamental"], color: "#10B981", description: "交易规则知识选择题", quizQuestionIndices: Array.from({ length: 10 }, (_, i) => i + 10) },
  { id: 6, title: "价格审判庭", subtitle: "Valuation Agent", icon: "\u2696\uFE0F", type: "learning", unlockAgents: ["valuation"], color: "#EC4899", description: "学习盘面资金与主力逻辑知识卡片", learningCardIndices: Array.from({ length: 10 }, (_, i) => i + 20) },
  { id: 7, title: "K线神谕", subtitle: "Technical Agent", icon: "\u{1F4C8}", type: "quiz_choice", unlockAgents: ["technical"], color: "#F97316", description: "基础概念与估值指标选择题", quizQuestionIndices: Array.from({ length: 10 }, (_, i) => i + 20) },
  { id: 8, title: "舆论火场", subtitle: "Sentiment Agent", icon: "\u{1F525}", type: "learning", unlockAgents: ["sentiment"], color: "#EF4444", description: "学习宏观、周期与风控进阶知识卡片", learningCardIndices: Array.from({ length: 10 }, (_, i) => i + 30) },
  { id: 9, title: "多空议会", subtitle: "Bull / Bear Analyst", icon: "\u{1F3DB}\uFE0F", type: "quiz_choice", unlockAgents: ["bull", "bear"], color: "#6366F1", description: "交易术语与风控策略选择题", quizQuestionIndices: Array.from({ length: 10 }, (_, i) => i + 30) },
  { id: 10, title: "回撤之门", subtitle: "Risk Officer", icon: "\u{1F6E1}\uFE0F", type: "minigame", unlockAgents: ["risk", "manager"], color: "#14B8A6", description: "风险管理场景快速决策，守护你的本金。" },
];

// Alias for backward compatibility
export const GAME_LEVELS = GAME_MAP_LEVELS;

// Get level config by ID
export function getLevelConfig(levelId: number): GameMapLevel | undefined {
  return GAME_MAP_LEVELS.find((l) => l.id === levelId);
}

// ===== Dialogue 类型 =====
export interface DialogueOption {
  id: string;
  text: string;
  correct: boolean;
  feedback: string;
}

export interface DialogueNode {
  id: number;
  scene: string;
  options: DialogueOption[];
}

export interface DialogueLevelData {
  opening: string;
  nodes: DialogueNode[];
  goodEnding: string;
  badEnding: string;
  /** 场景背景图片（可选），用于视觉小说风格 */
  sceneImage?: string;
}

// ===== Quiz 类型 =====
export interface QuizCard {
  id: string;
  statement: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizLevelData {
  title: string;
  intro: string;
  cards: QuizCard[];
  passRate: number;
}

// ===== Brain 类型 =====
export interface BrainPair {
  term: string;
  definition: string;
}

export interface BrainLevelData {
  title: string;
  intro: string;
  pairs: BrainPair[];
}

// ===== MiniGame 类型 =====
export interface MiniGameRound {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MiniGameLevelData {
  title: string;
  intro: string;
  rounds: MiniGameRound[];
  timePerRound: number; // seconds
  passRate: number;
}

