// ===== 游戏地图 — 类型定义与关卡配置 =====

export type GameType = "dialogue" | "quiz" | "brain" | "minigame";

export interface GameMapLevel {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  type: GameType;
  unlockAgents: string[];
  color: string;
  description: string;
}

export const GAME_MAP_LEVELS: GameMapLevel[] = [
  { id: 1, title: "开户日", subtitle: "Lead Agent", icon: "\u{1F3AF}", type: "dialogue", unlockAgents: ["lead"], color: "#3B82F6", description: "废弃交易大厅里，前基金经理问你：你会不会立刻下单？" },
  { id: 2, title: "数据黑市", subtitle: "Data Agent", icon: "\u{1F4CA}", type: "quiz", unlockAgents: ["data"], color: "#8B5CF6", description: "信息泛滥的时代，学会分辨真假数据源。" },
  { id: 3, title: "市场风暴", subtitle: "Market Agent", icon: "\u{1F32A}\uFE0F", type: "brain", unlockAgents: ["market"], color: "#06B6D4", description: "金融术语配对，测试你的市场词汇量。" },
  { id: 4, title: "政策密函", subtitle: "Industry Agent", icon: "\u{1F4DC}", type: "dialogue", unlockAgents: ["industry"], color: "#F59E0B", description: "一份政策文件摆在面前，如何解读它的真实含义？" },
  { id: 5, title: "财报夜审", subtitle: "Fundamental Agent", icon: "\u{1F4D1}", type: "minigame", unlockAgents: ["fundamental"], color: "#10B981", description: "深夜审财报，快速找出隐藏的危险信号。" },
  { id: 6, title: "价格审判庭", subtitle: "Valuation Agent", icon: "\u2696\uFE0F", type: "quiz", unlockAgents: ["valuation"], color: "#EC4899", description: "估值是艺术还是科学？翻开卡片寻找答案。" },
  { id: 7, title: "K线神谕", subtitle: "Technical Agent", icon: "\u{1F4C8}", type: "minigame", unlockAgents: ["technical"], color: "#F97316", description: "限时识别K线形态，读懂市场的语言。" },
  { id: 8, title: "舆论火场", subtitle: "Sentiment Agent", icon: "\u{1F525}", type: "brain", unlockAgents: ["sentiment"], color: "#EF4444", description: "新闻与概念配对，在信息洪流中保持清醒。" },
  { id: 9, title: "多空议会", subtitle: "Bull / Bear Analyst", icon: "\u{1F3DB}\uFE0F", type: "dialogue", unlockAgents: ["bull", "bear"], color: "#6366F1", description: "多头与空头的终极辩论，你站在哪一边？" },
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

