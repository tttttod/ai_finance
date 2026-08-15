import { DIALOGUE_DATA } from "./dialogue-data";
import { QUIZ_DATA } from "./quiz-data";
import { BRAIN_DATA } from "./brain-data";
import { MINIGAME_DATA } from "./minigame-data";

// ===== Level type definitions =====
export type GameMapLevelType = "dialogue" | "quiz" | "brain" | "minigame" | "learning" | "quiz_choice" | "sentiment" | "fundamental" | "risk" | "candlestick" | "parliament";

export interface GameMapLevel {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  type: GameMapLevelType;
  unlockAgents: string[];
  color: string;
  description: string;
  /** 学习关卡 — 卡片索引 */
  learningCardIndices?: number[];
  /** 答题关卡 — 题目索引 */
  quizQuestionIndices?: number[];
  /** 关卡数据 - 运行时动态注入 */
  data?: any;
}

// ===== 旧版数据类型定义（兼容游戏组件引用）=====
export interface DialogueOption {
  id: string;
  text: string;
  correct: boolean;
  feedback: string;
  nextNodeId?: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  options?: DialogueOption[];
  isEnd?: boolean;
  sceneImage?: string;
}

export type DialogueLevelData = any;
export type QuizLevelData = any;
export type BrainLevelData = any;
export type MiniGameLevelData = any;
export const DialogueData = DIALOGUE_DATA;
export const QuizData = QUIZ_DATA;
export const BrainData = BRAIN_DATA;
export const MinigameData = MINIGAME_DATA;

export const GAME_MAP_LEVELS: GameMapLevel[] = [
  // ===== 华尔堡（3 个子关卡，在二级地图内）=====
  { id: 1, title: "数据黑市", subtitle: "Data Agent", icon: "🎯", type: "dialogue", unlockAgents: ["data"], color: "#3B82F6", description: "地下交易厅里三块屏幕同时亮起，用行情扫描器找出能用于交易的那一张。" },
  { id: 2, title: "市场风暴", subtitle: "Market Agent", icon: "🌪️", type: "dialogue", unlockAgents: ["market"], color: "#06B6D4", description: "地下交易大厅响起警报，用市场观察仪拉远镜头，判断眼前的下跌来自个股、行业还是整个市场。" },
  { id: 3, title: "政策密函", subtitle: "Industry Agent", icon: "📜", type: "dialogue", unlockAgents: ["industry"], color: "#F59E0B", description: "冷链升级政策发布，在档案室里读懂文件，找出政策真正支持的对象。" },

  // ===== 主地图关卡 =====
  { id: 4, title: "信息迷雾群岛", subtitle: "Fundamental Agent", icon: "🔍", type: "dialogue", unlockAgents: ["fundamental"], color: "#8B5CF6", description: "在信息迷雾中辨别真伪，挖掘公司基本面真相。" },
  { id: 5, title: "财报考古遗迹", subtitle: "Valuation Agent", icon: "📋", type: "fundamental", unlockAgents: ["valuation"], color: "#8B5CF6", description: "深夜审查财报，从数字中挖掘公司的真实底色。" },
  { id: 6, title: "模型沼泽", subtitle: "Technical Agent", icon: "📈", type: "dialogue", unlockAgents: ["technical"], color: "#8B5CF6", description: "好公司也有价签 — 判断公司质量与买入价格能否同时成立。" },
  { id: 7, title: "K线图学习", subtitle: "Sentiment Agent", icon: "📊", type: "candlestick", unlockAgents: ["sentiment"], color: "#F97316", description: "图形会说话吗 — 检查价格位置和成交变化，决定入场时机与投入资金。" },
  { id: 8, title: "市场天气谷", subtitle: "Bull & Bear Analyst", icon: "🌤️", type: "sentiment", unlockAgents: ["bull", "bear"], color: "#6366F1", description: "多空观点对决，判断市场的晴雨方向。" },
  { id: 9, title: "证据岔路口", subtitle: "Risk Officer", icon: "🛡️", type: "quiz_choice", unlockAgents: ["risk"], color: "#EF4444", description: "风险管理场景快速决策，守护你的本金。", quizQuestionIndices: Array.from({ length: 10 }, (_, i) => i + 40) },
  { id: 10, title: "风险护盾桥", subtitle: "Risk Officer", icon: "🏆", type: "risk", unlockAgents: ["manager"], color: "#14B8A6", description: "集结所有 Agent 力量，完成最终的研究报告。" },
];

// Alias for backward compatibility
export const GAME_LEVELS = GAME_MAP_LEVELS;

// Get level config by ID
export function getLevelConfig(levelId: number): GameMapLevel | undefined {
  return GAME_MAP_LEVELS.find((l) => l.id === levelId);
}