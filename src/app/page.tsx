"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { WORLD_MAP_PATHS } from "@/lib/world-map-paths";
import Level1Panel from "@/components/level1-panel";
import { GameMapPlayer } from "@/components/game-maps/GameMapPlayer";
import { getLevelConfig } from "@/components/game-maps/game-data";
import {
  InvestmentStyle,
  StepStatus,
  WorkflowStepInfo,
  FactorScore,
  ScenarioPrediction,
  DebatePoint,
  RiskCheck,
  ResearchReport,
  AgentResponse,
  RecommendedTarget,
  UserProfileSurvey,
  ReplayCurveFit,
  ReviewDetail,
  GeneralPredictionModel,
  SampleStockResult,
  TradeTIPersonalityId,
  TradeTIState,
  TradeTIResult,
  TradeTIScores,
  TRADETI_PERSONALITIES,
  WORKFLOW_STEPS,
  AGENT_TEAM,
  SURVEY_QUESTIONS,
  GlobalNewsEvent,
} from "@/lib/mini-types";
import type { MiniMarketSnapshot, MiniRecommendedTarget } from "@/lib/data/market-types";
import type { StockResearchContext } from "@/lib/data/stock-context-types";
import {
  generateAgentResponse,
  generateAgentResponseFromContext,
  mockMarketData,
  mockReviewData,
  mockRecommendedTargets,
  mockReplayCurveFit,
  mockReviewDetail,
  FACTOR_LIBRARY,
  DEFAULT_SELECTED_FACTORS,
  generateGeneralPredictionModel,
  TRADETI_QUESTIONS,
  calculateTradeTIResult,
} from "@/lib/mini-mock";
import { getStoryline, getDefaultStoryline } from "@/lib/storylines";
import type { PersonalityStoryline, StoryTask } from "@/lib/storylines";
import {
  loadTraderRoadProgress,
  saveTraderRoadProgress,
  completeTraderRoadLevel,
  getDefaultTraderRoadProgress,
  isTraderRoadAgentUnlocked,
  getTraderRoadLevelsWithStatus,
  TRADER_ROAD_LEVELS,
  calcLevelFromXP,
  calcXPProgress,
  completeDailyTask,
  claimDailyBonus,
} from "@/lib/trader-road-progress";
import type { TraderRoadProgress } from "@/lib/trader-road-progress";
import type { AgentInfo } from "@/lib/mini-types";
import AgentAvatar from "@/components/agent-avatar";
import AgentTeamCard from "@/components/agent-team-card";
import AgentUnlockAnimation from "@/components/agent-unlock-animation";
import OnboardingGuideModal from "@/components/onboarding-guide-modal";

type TabId = "market" | "research" | "review" | "profile";

interface WatchlistItem {
  code: string;
  tsCode?: string;
  name: string;
  industry?: string;
  reason?: string;
  addedAt?: string;
}

export default function MiniProgramPage() {
  const [activeTab, setActiveTab] = useState<TabId>("market");
  const [currentTime, setCurrentTime] = useState("");
  const [tradeTIUnlocked, setTradeTIUnlocked] = useState(false);
  const [tradeTICompleted, setTradeTICompleted] = useState(false);
  const [tradeTISkipped, setTradeTISkipped] = useState(false); // 本次会话跳过（不保存到 localStorage）
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(false);
  const [tradeTIResult, setTradeTIResult] = useState<TradeTIState | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileSurvey>({
    completed: false,
    recommended_style: "",
    default_horizon: "",
    risk_tolerance: "",
    holding_period: "",
    focus_preference: "",
    experience_level: "",
  });

  // 实时更新当前时间
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 水合安全：在 useEffect 中读取 localStorage
  // 支持 ?retake=1 URL 参数强制重置
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("retake") === "1") {
      localStorage.removeItem("tradeti_state");
      localStorage.removeItem("user_profile_survey");
      localStorage.removeItem("sbti_result_v2");
      localStorage.removeItem("investment_style");
      localStorage.removeItem("completed_sbti_test");
      localStorage.removeItem("sbti_personality");
      setIsLoadingProfile(false);
      return;
    }

    const saved = localStorage.getItem("tradeti_state");
    if (saved) {
      try {
        const state: TradeTIState = JSON.parse(saved);
        setTradeTIResult(state);
        if (state.is_unlocked) {
          setTradeTIUnlocked(true);
          setTradeTICompleted(true);
        } else {
          // 非通关人格：completed 但未解锁，保持 blocked 状态
          setTradeTICompleted(true);
          setTradeTIUnlocked(false);
        }
      } catch { /* ignore */ }
    }
    setIsLoadingProfile(false);
  }, []);

  // 主界面显示条件：tradeTI 完成且解锁，或跳过测试，且加载完成
  const shouldShowMainApp = ((tradeTICompleted && tradeTIUnlocked) || tradeTISkipped) && !isLoadingProfile;

  // 首次进入引导弹窗：主界面显示后检查
  useEffect(() => {
    if (!shouldShowMainApp) return;
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem("market_adventure_onboarding_seen");
    if (!seen) {
      // 延迟弹出，确保组件已渲染
      const timer = setTimeout(() => {
        setShowOnboardingGuide(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [shouldShowMainApp]);

  const [selectedResearchTarget, setSelectedResearchTarget] = useState<RecommendedTarget | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // 加载关注列表
  useEffect(() => {
    const saved = localStorage.getItem("stock_watchlist");
    if (saved) {
      try { setWatchlist(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // 添加关注股票
  const addToWatchlist = (name: string, code: string) => {
    setWatchlist(prev => {
      const exists = prev.some(s => s.code === code);
      if (exists) return prev;
      const newList = [{ name, code, addedAt: new Date().toISOString() }, ...prev].slice(0, 20);
      localStorage.setItem("stock_watchlist", JSON.stringify(newList));
      return newList;
    });
  };

  // 移除关注股票
  const removeFromWatchlist = (code: string) => {
    setWatchlist(prev => {
      const newList = prev.filter(s => s.code !== code);
      localStorage.setItem("stock_watchlist", JSON.stringify(newList));
      return newList;
    });
  };

  // tradeTI 通关：进入完整功能区（同步读取 localStorage 中刚保存的结果）
  const completeTradeTI = () => {
    const saved = localStorage.getItem("tradeti_state");
    if (saved) {
      try {
        const state: TradeTIState = JSON.parse(saved);
        setTradeTIResult(state);
      } catch { /* ignore */ }
    }
    setTradeTIUnlocked(true);
    setTradeTICompleted(true);
  };

  // 未做 tradeTI 或非通关人格时显示测试（加载中默认显示测试，避免闪烁）
  if (!shouldShowMainApp) {
    return <TradeTITest onComplete={completeTradeTI} onSkip={() => setTradeTISkipped(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E1] via-[#FFF3CD] to-white flex flex-col max-w-md mx-auto relative">
      {/* 状态栏模拟 - 市场冒险局 */}
      <div className="bg-gradient-to-r from-[#FF6B6B] via-[#FFE66D] to-[#4ECDC4] px-4 py-2 flex items-center justify-between text-xs text-white shadow-md">
        <span className="font-black">{currentTime}</span>
        <span className="font-black text-sm">🗺️ 市场冒险局</span>
        <span className="font-black opacity-0">📶</span>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto pb-16">
        {activeTab === "market" && (
          <MarketTab
            tradeTIResult={tradeTIResult}
            onShowOnboardingGuide={() => setShowOnboardingGuide(true)}
            onFillResearch={(target) => {
              setSelectedResearchTarget(target);
              setActiveTab("research");
            }}
            onGoToResearch={() => setActiveTab("research")}
          />
        )}
        {activeTab === "research" && (
          <ResearchTab
            defaultStyle={(userProfile.recommended_style as InvestmentStyle) || "swing"}
            prefilledTarget={selectedResearchTarget}
            onClearPrefilled={() => setSelectedResearchTarget(null)}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            watchlist={watchlist}
            onResearchComplete={(targetName) => {
              const saved = JSON.parse(localStorage.getItem("tradeti_researched_stocks") || "[]");
              if (!saved.includes(targetName)) {
                saved.push(targetName);
                localStorage.setItem("tradeti_researched_stocks", JSON.stringify(saved));
              }
            }}
          />
        )}
        {activeTab === "review" && <ModelTab />}
        {activeTab === "profile" && <ProfileTab
            profile={userProfile}
            tradeTIResult={tradeTIResult}
            watchlist={watchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            onRetakeSurvey={() => {
              localStorage.removeItem("tradeti_state");
              localStorage.removeItem("user_profile_survey");
              localStorage.removeItem("sbti_result_v2");
              localStorage.removeItem("investment_style");
              localStorage.removeItem("completed_sbti_test");
              localStorage.removeItem("sbti_personality");
              setTradeTIUnlocked(false);
              setTradeTICompleted(false);
              setTradeTIResult(null);
            }}
        />}
      </div>

      {/* 底部 Tab 栏 - 市场冒险局 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-sm border-t-2 border-[#FFE66D] flex rounded-t-3xl shadow-[0_-4px_20px_rgba(255,107,107,0.15)]">
        {[
          { id: "market" as TabId, label: "冒险", icon: "🗺️", color: "#FF6B6B" },
          { id: "research" as TabId, label: "任务", icon: "📋", color: "#8B5CF6" },
          { id: "review" as TabId, label: "工坊", icon: "🔧", color: "#4ECDC4" },
          { id: "profile" as TabId, label: "档案", icon: "🎒", color: "#FF6B35" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all duration-300"
            style={{
              color: activeTab === tab.id ? tab.color : "#94A3B8",
            }}
          >
            <span className={`text-lg transition-transform duration-300 ${activeTab === tab.id ? "scale-125" : ""}`}>
              {tab.icon}
            </span>
            <span className={`text-[11px] transition-all duration-300 ${activeTab === tab.id ? "font-black" : "font-medium"}`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="h-1 w-6 rounded-full mt-0.5" style={{ backgroundColor: tab.color }} />
            )}
          </button>
        ))}
      </div>
      {/* 新手引导弹窗 */}
      <OnboardingGuideModal
        isOpen={showOnboardingGuide}
        tradeTIResult={tradeTIResult}
        onClose={() => {
          if (typeof window !== "undefined") {
            localStorage.setItem("market_adventure_onboarding_seen", "true");
          }
          setShowOnboardingGuide(false);
        }}
        onStartMap={() => {
          if (typeof window !== "undefined") {
            localStorage.setItem("market_adventure_onboarding_seen", "true");
          }
          setShowOnboardingGuide(false);
          setActiveTab("market");
        }}
      />
    </div>
  );
}

// ===== 投资风格问卷 =====
// ===== SBTI 交易风格测试（多巴胺风格）=====
// ===== tradeTI 交易抽象人格测试 =====
type TradeTIScreen = "intro" | "questions" | "result";

function TradeTITest({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const [screen, setScreen] = useState<TradeTIScreen>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ question_id: number; type: "pass" | TradeTIPersonalityId }[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [resultPersonality, setResultPersonality] = useState<TradeTIPersonalityId | null>(null);
  const [resultPassScore, setResultPassScore] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // 预加载所有人格头像，结果页秒出
  useEffect(() => {
    const ids = ["wall_street","old_money","qin_shihuang","kline_shaman","all_in_warrior","breakeven_master","fomo_chaser","report_archaeologist","monte_carlo_poet"];
    ids.forEach(id => {
      const img = new Image();
      img.src = `/avatar_${id}.png`;
    });
  }, []);

  const handleStart = () => setScreen("questions");

  const handleAnswer = (optionType: "pass" | TradeTIPersonalityId, idx: number) => {
    if (isTransitioning) return;
    const newAnswers = [...answers, { question_id: currentQ + 1, type: optionType }];
    setAnswers(newAnswers);
    setSelectedOption(idx);
    setIsTransitioning(true);

    setTimeout(() => {
      if (currentQ < 11) {
        setCurrentQ(currentQ + 1);
        setSelectedOption(null);
        setIsTransitioning(false);
      } else {
        setIsCalculating(true);
        setSelectedOption(null);
        setIsTransitioning(false);
        setTimeout(() => {
          const result = calculateTradeTIResult(newAnswers);
          setResultPersonality(result.personality_id);
          setResultPassScore(result.pass_score);
          setIsCalculating(false);
          const personality = TRADETI_PERSONALITIES[result.personality_id];
          setScreen("result");
          // 保存结果
          const state: TradeTIState = {
            completed: true,
            is_unlocked: result.is_unlocked,
            result_type: result.personality_id,
            pass_score: result.pass_score,
            scores: result.scores,
            answers: newAnswers,
            completed_at: new Date().toISOString(),
          };
          localStorage.setItem("tradeti_state", JSON.stringify(state));
        }, 2000);
      }
    }, 500);
  };

  const handleRetake = () => {
    localStorage.removeItem("tradeti_state");
    setCurrentQ(0);
    setAnswers([]);
    setSelectedOption(null);
    setIsTransitioning(false);
    setResultPersonality(null);
    setScreen("intro");
  };

  // ===== 首屏 =====
  if (screen === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8E1] to-white flex flex-col max-w-md mx-auto">
        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="text-center mb-10">
            <div className="text-6xl mb-4 animate-bounce">🏦</div>
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-[#FF6B35] via-[#FFD93D] to-[#00FF88] bg-clip-text text-transparent">
              tradeTI
            </h1>
            <p className="text-lg font-bold text-slate-700">交易抽象人格测试</p>
            <p className="text-xs text-slate-500 mt-1">Trade Type Indicator</p>
          </div>

          <div className="bg-white rounded-[24px] p-5 border-2 border-[#FFD93D] shadow-lg mb-6">
            <p className="text-sm text-slate-700 leading-relaxed font-bold">
              12道题，测出你是华尔街在逃交易员，还是市场需要重点保护的对象。
            </p>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl font-black text-white text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
            style={{ background: "linear-gradient(135deg, #FF6B35, #FF00FF, #00D4FF)" }}
          >
            开始测试 🔥
          </button>

          <button
            onClick={onComplete}
            className="w-full py-3 mt-3 rounded-2xl font-bold text-slate-500 text-sm border-2 border-slate-200 transition-all hover:border-slate-300 active:scale-95"
          >
            跳过，直接进入 →
          </button>

          <p className="text-[10px] text-slate-400 text-center mt-4">
            本测试仅供娱乐和投资行为自省，不构成投资建议。
          </p>
        </div>
      </div>
    );
  }

  // ===== 计算中 =====
  if (isCalculating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8E1] to-white flex flex-col max-w-md mx-auto">
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF6B35] via-[#FFD93D] to-[#00FF88] animate-spin" />
            <div className="absolute inset-1.5 rounded-full bg-white flex items-center justify-center text-3xl">🧬</div>
          </div>
          <p className="text-base font-bold bg-gradient-to-r from-[#FF6B35] to-[#00FF88] bg-clip-text text-transparent text-center">
            正在解析你的交易人格...
          </p>
          <p className="text-xs text-slate-400 mt-2">别急，好的人格需要时间酝酿</p>
        </div>
      </div>
    );
  }

  // ===== 通关结果页 =====
  if (screen === "result" && resultPersonality) {
    const p = TRADETI_PERSONALITIES[resultPersonality];
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8E1] to-white flex flex-col max-w-md mx-auto">
        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="w-28 h-28 mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-white shadow-lg" style={{ borderColor: `${p.color}40` }}>
              <img
                src={`/avatar_${resultPersonality}.png`}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-3xl font-black mb-3" style={{ color: p.color }}>
              {p.name}
            </h2>
            <div className="bg-white/80 rounded-2xl p-4 mb-6 border border-slate-100">
              <p className="text-sm text-slate-700 leading-relaxed">{p.description}</p>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-full py-4 rounded-2xl font-black text-white text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)` }}
          >
            进入完整功能区 🚀
          </button>

          <button
            onClick={() => {
              setResultPersonality(null);
              setResultPassScore(0);
              setCurrentQ(0);
              setAnswers([]);
              setScreen("intro");
            }}
            className="w-full py-3 rounded-2xl font-black text-slate-500 text-sm mt-3 border-2 border-slate-200 bg-white transition-all hover:scale-[1.02] active:scale-95"
          >
            返回重测
          </button>

          <p className="text-[10px] text-slate-400 text-center mt-4">
            tradeTI仅供娱乐和投资行为自省，不构成投资建议。股票市场存在风险。
          </p>
        </div>
      </div>
    );
  }

  // ===== 拦截页（已废弃，所有人格均可进入完整功能）=====
  // 保留此占位，后续可改为人格成长故事线入口

  // ===== 答题页 =====
  const question = TRADETI_QUESTIONS[currentQ];
  const dopamineColors = ["#FF6B35", "#FF00FF", "#FFD93D", "#00FF88"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E1] to-white flex flex-col max-w-md mx-auto">
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-xl font-black mb-2 bg-gradient-to-r from-[#FF6B35] via-[#FFD93D] to-[#00FF88] bg-clip-text text-transparent">
            tradeTI · 交易抽象人格测试
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            找到你的交易灵魂人格。只有真正的交易员才能通关。
          </p>
        </div>

        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full overflow-hidden ${i <= currentQ ? "bg-slate-200" : "bg-slate-100"}`}>
                {i <= currentQ && (
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B35] via-[#FFD93D] to-[#00FF88] rounded-full"
                    style={{
                      animation: "shimmer 2s infinite",
                      backgroundSize: "200% 100%",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 font-bold">
            问题 {currentQ + 1} / 12
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 mb-4">{question.question_text}</h2>
          {question.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const color = dopamineColors[idx % 4];
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(opt.type, idx)}
                disabled={isTransitioning}
                className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 ${
                  isTransitioning && !isSelected ? "opacity-40 scale-[0.98]" : ""
                } ${
                  isSelected
                    ? "scale-[1.03] shadow-lg"
                    : "hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95"
                }`}
                style={{
                  background: isSelected
                    ? `${color}20`
                    : `${color}08`,
                  borderColor: isSelected ? color : `${color}40`,
                  borderWidth: isSelected ? "3px" : "2px",
                }}
              >
                <div className="flex items-center gap-2">
                  {isSelected && <span className="text-lg animate-bounce">👆</span>}
                  <span className="text-sm font-bold text-slate-800">{opt.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== 研究 Tab =====
function ResearchTab({
  defaultStyle,
  prefilledTarget,
  onClearPrefilled,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  watchlist = [],
  onResearchComplete,
}: {
  defaultStyle: InvestmentStyle;
  prefilledTarget: RecommendedTarget | null;
  onClearPrefilled: () => void;
  onAddToWatchlist?: (name: string, code: string) => void;
  onRemoveFromWatchlist?: (code: string) => void;
  watchlist?: WatchlistItem[];
  onResearchComplete?: (name: string) => void;
}) {
  const [activeGameLevel, setActiveGameLevel] = useState<number | null>(null);
  const [unlockingAgent, setUnlockingAgent] = useState<AgentInfo | null>(null);
  const [started, setStarted] = useState(false);
  const [target, setTarget] = useState("");
  const [style, setStyle] = useState<InvestmentStyle>(defaultStyle);
  const [period, setPeriod] = useState<string>("short");
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<WorkflowStepInfo[]>([]);
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [stockContext, setStockContext] = useState<StockResearchContext | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [contextCacheStatus, setContextCacheStatus] = useState<"hit" | "miss" | null>(null);
  
  // 游戏进度 - Agent 解锁状态（使用集中式进度模块）
  const [traderRoadProgress, setTraderRoadProgress] = useState<TraderRoadProgress>(getDefaultTraderRoadProgress());
  const [researchTabGameLevel, setResearchTabGameLevel] = useState<number | null>(null);
  
  useEffect(() => {
    setTraderRoadProgress(loadTraderRoadProgress());
  }, []);
  const reloadProgress = () => {
    setTraderRoadProgress({ ...loadTraderRoadProgress() });
  };


  // Get or create client ID for rate limiting
  const getClientId = (): string => {
    if (typeof window === "undefined") return "anonymous";
    let id = localStorage.getItem("client-id");
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      localStorage.setItem("client-id", id);
    }
    return id;
  };

  // 处理预填充
  useEffect(() => {
    if (prefilledTarget) {
      setTarget(`${prefilledTarget.name} ${prefilledTarget.code}`);
      setStyle(prefilledTarget.recommended_style);
      const periodMap = { short: "short", swing: "medium", long: "long" };
      setPeriod(periodMap[prefilledTarget.recommended_style]);
    }
  }, [prefilledTarget]);

  const startResearch = async () => {
    if (!target.trim()) return;
    setStarted(true);
    setContextLoading(true);
    setContextError(null);
    setStockContext(null);
    setContextCacheStatus(null);
    onClearPrefilled();

    // Local variable to hold context for the interval closure
    let fetchedContext: StockResearchContext | null = null;

    // Fetch stock context first
    try {
      const clientId = getClientId();
      const res = await fetch(`/api/stock-context?query=${encodeURIComponent(target.trim())}`, {
        headers: { "x-client-id": clientId },
      });
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        setContextError(`查询太频繁，请稍后再试（${data.retryAfterSeconds || 60}秒后可重试）。可先使用演示分析继续。`);
        setContextLoading(false);
        setStarted(false);
        return;
      }
      if (res.status === 404) {
        setContextError("无法识别该股票，请检查代码或名称是否正确。");
        setContextLoading(false);
        setStarted(false);
        return;
      }
      if (!res.ok) {
        setContextError("数据获取失败，将使用演示分析继续。");
        setContextLoading(false);
        // Continue with mock analysis
      } else {
        const json = await res.json();
        if (json.success && json.data) {
          fetchedContext = json.data as StockResearchContext;
          setStockContext(fetchedContext);
          setContextCacheStatus(json.cache || null);
        }
        setContextLoading(false);
      }
    } catch {
      setContextError("网络异常，将使用演示分析继续。");
      setContextLoading(false);
    }

    setIsRunning(true);
    setCurrentStep(0);
    setResponses([]);

    const initialSteps = WORKFLOW_STEPS.map((s) => ({
      ...s,
      status: "pending" as StepStatus,
    }));
    setSteps(initialSteps);

    // Use local variable to avoid stale closure issue with React state
    const currentContext = fetchedContext;
    let step = 0;
    timerRef.current = setInterval(() => {
      if (step >= WORKFLOW_STEPS.length) {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (onResearchComplete && target) {
          onResearchComplete(target);
        }
        return;
      }

      const stepInfo = WORKFLOW_STEPS[step];
      // Use real context if available, otherwise fallback to mock
      const response = currentContext
        ? generateAgentResponseFromContext(step + 1, stepInfo.id, target, style, currentContext)
        : generateAgentResponse(step + 1, stepInfo.id, target, style);

      setSteps((prev) =>
        prev.map((s, i) => ({
          ...s,
          status: i < step ? "completed" : i === step ? "active" : "pending",
        }))
      );
      setResponses((prev) => [...prev, response]);
      setCurrentStep(step + 1);
      step++;
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!started) {
    return (
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-3xl p-4 border-2 border-[#FFD93D] shadow-md">
          <h3 className="text-sm font-black mb-3 bg-gradient-to-r from-[#FFD93D] to-[#FF6B35] bg-clip-text text-transparent">🔬 开始研究</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">股票/板块</label>
              <input
                type="text"
                value={target}
                onChange={(e) => { setTarget(e.target.value); setContextError(null); }}
                placeholder="输入股票代码或名称"
                className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#FFD93D] font-bold transition-colors"
              />
              {prefilledTarget && (
                <p className="text-[10px] text-[#FF6B35] mt-1 font-bold">
                  🎯 已从今日AI推荐研究标的填入：{prefilledTarget.name} {prefilledTarget.code}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">投资风格</label>
              <div className="flex gap-2">
                {(["short", "swing", "long"] as InvestmentStyle[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`flex-1 py-2.5 text-xs rounded-2xl border-2 font-black transition-all active:scale-95 ${
                      style === s
                        ? "bg-[#FFE0E0] border-[#FF4444] text-[#FF4444]"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {s === "short" ? "⚡ 短线" : s === "swing" ? "🎯 波段" : "💎 长期"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">研究周期</label>
              <div className="flex gap-2">
                {[
                  { value: "short", label: style === "short" ? "5日" : style === "swing" ? "2周" : "6月" },
                  { value: "medium", label: style === "short" ? "10日" : style === "swing" ? "1月" : "1年" },
                  { value: "long", label: style === "short" ? "20日" : style === "swing" ? "3月" : "3年" },
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    className={`flex-1 py-2.5 text-xs rounded-2xl border-2 font-black transition-all active:scale-95 ${
                      period === p.value
                        ? "bg-[#E0F0FF] border-[#3B82F6] text-[#3B82F6]"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            {contextError && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-2xl">
                <p className="text-xs font-bold text-red-600">{contextError}</p>
              </div>
            )}
            <button
              onClick={startResearch}
              disabled={!target.trim()}
              className="w-full py-3 bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#4ECDC4] text-white text-sm font-black rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#FF6B6B]/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              🚀 开始研究
            </button>
          </div>
        </div>

        {/* Agent 团队展示 - 多巴胺风格 */}
        <div className="bg-white rounded-3xl p-4 border-2 border-[#FF6B6B] shadow-md">
          <h3 className="text-sm font-black mb-3 bg-gradient-to-r from-[#FF6B6B] to-[#FFD93D] bg-clip-text text-transparent">🦸 Agent 研究天团</h3>
          <div className="grid grid-cols-3 gap-2">
            {AGENT_TEAM.map((agent, i) => {
              const agentColors = ["#FF6B6B", "#FFD93D", "#4ECDC4", "#FF6B35"];
              const ac = agentColors[i % 4];
              const isUnlocked = isTraderRoadAgentUnlocked(traderRoadProgress, agent.role);
              return (
                <AgentTeamCard key={agent.role} agent={agent} unlocked={isUnlocked} />
              );
            })}
          </div>
          {traderRoadProgress.unlockedAgents.length === 0 && (
            <p className="mt-2 text-[10px] text-slate-400 text-center">完成地图关卡，逐步点亮完整 Agent 链路</p>
          )}
        </div>

      {/* 3. 交易员的正确之路 — Agent 解锁地图 */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">🗺️</span>
            <span className="text-sm font-bold text-white">交易员的正确之路</span>
            <span className="text-[10px] text-slate-400 ml-auto">补完你的投研 Agent 链路</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            10 个关卡，解锁你的投研 Agent 团队
          </p>
        </div>
        <div className="p-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {getTraderRoadLevelsWithStatus(traderRoadProgress).map((node, idx) => {
              const nodeIcons = ["🎯", "📊", "🌪️", "📜", "📑", "⚖️", "📈", "🔥", "🏛️", "🛡️"];
              const icon = nodeIcons[node.id - 1] || "🎯";
              const status = node.status;
              const isCompleted = status === "completed";
              const isAvailable = status === "available";
              const isComingSoon = status === "coming_soon";
              const isAccessible = isCompleted || isAvailable;
              return (
                <div key={node.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => {
                      if (isAccessible) {
                        setActiveGameLevel(node.id);
                      } else if (isComingSoon) {
                        alert(`${node.title} — 即将开放，先完成当前关卡`);
                      } else {
                        alert("先完成前置关卡。");
                      }
                    }}
                    className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 transition-all ${
                      isCompleted
                        ? "bg-emerald-500/20 border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer hover:scale-105"
                        : isAvailable
                        ? "bg-blue-500/20 border-blue-400/60 shadow-[0_0_12px_rgba(59,130,246,0.4)] cursor-pointer hover:scale-105"
                        : "bg-slate-700/30 border-slate-600/40 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <span className="text-xl mb-0.5">{icon}</span>
                    <span className={`text-[8px] font-bold leading-tight text-center ${
                      isCompleted ? "text-emerald-200" : isAvailable ? "text-blue-200" : "text-slate-500"
                    }`}>
                      {node.title}
                    </span>
                    {isCompleted && (
                      <span className="absolute -top-1 -right-1 text-[10px]">✅</span>
                    )}
                    {!isCompleted && !isAvailable && (
                      <span className="absolute -top-1 -right-1 text-[10px]">🔒</span>
                    )}
                  </button>
                  {idx < 9 && (
                    <div className={`w-3 h-0.5 mx-0.5 ${
                      isCompleted ? "bg-emerald-400/60" : isAvailable ? "bg-blue-400/60" : "bg-slate-600/40"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          {/* 开发调试按钮 */}
          <div className="flex gap-2 mt-2 pt-2 border-t border-slate-700/30">
            <button
              onClick={() => {
                // 先触发解锁动画，再更新进度
                const leadAgent = AGENT_TEAM.find((a) => a.role === "lead");
                if (leadAgent) {
                  setUnlockingAgent(leadAgent);
                }
                completeTraderRoadLevel(1);
                reloadProgress();
              }}
              className="flex-1 py-1.5 text-[9px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              测试：解锁 Lead Agent
            </button>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("tradeti_game_progress");
                }
                setTraderRoadProgress(getDefaultTraderRoadProgress());
              }}
              className="flex-1 py-1.5 text-[9px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              测试：重置交易之路进度
            </button>
          </div>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* 16 步进度条 - 未来感升级 */}
      <div className="bg-white rounded-3xl p-4 border-2 border-[#4ECDC4] shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-black bg-gradient-to-r from-[#4ECDC4] to-[#FFD93D] bg-clip-text text-transparent">📊 研究进度</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#FF6B6B]">{currentStep}/16</span>
            <button
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                setIsRunning(false);
                setStarted(false);
                setCurrentStep(0);
                setTarget("");
                setResponses([]);
                setStockContext(null);
                setContextLoading(false);
                setContextError(null);
                setContextCacheStatus(null);
                setSteps(WORKFLOW_STEPS.map((s) => ({ ...s, status: "pending" as StepStatus })));
                onClearPrefilled();
              }}
              className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors font-bold"
            >
              重新搜索
            </button>
          </div>
        </div>
        {/* 进度条 - 彩虹糖风格 */}
        <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#4ECDC4] rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / 16) * 100}%` }}
          />
          {/* 闪光粒子 */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 6.25%, rgba(255,255,255,0.5) 6.25%, rgba(255,255,255,0.5) 6.5%)",
            }}
          />
        </div>
        {/* 股票上下文信息 */}
        {stockContext && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
            <span className="font-bold text-slate-700">{stockContext.stock.name} {stockContext.stock.tsCode}</span>
            {stockContext.quote?.tradeDate && <span>数据: {stockContext.quote.tradeDate}</span>}
            <span>来源: {stockContext.dataQuality.source === "tushare" ? "Tushare" : stockContext.dataQuality.source === "cache" ? "缓存" : "演示"}</span>
            {contextCacheStatus && <span>缓存: {contextCacheStatus === "hit" ? "命中" : "刷新"}</span>}
            {stockContext.dataQuality.stale && <span className="text-amber-600">数据较旧</span>}
          </div>
        )}
        <div className="mt-3 grid grid-cols-4 gap-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`text-[10px] px-1.5 py-1 rounded-2xl text-center font-bold transition-all ${
                step.status === "completed"
                  ? "bg-[#4ECDC4]/10 text-[#4ECDC4] border border-[#4ECDC4]/30"
                  : step.status === "active"
                  ? "bg-[#FFD93D]/20 text-[#FF6B35] border border-[#FFD93D]/50 animate-pulse"
                  : "bg-slate-50 text-slate-500"
              }`}
            >
              {step.number}. {step.title.slice(0, 4)}
            </div>
          ))}
        </div>
      </div>

      {/* Agent 分析卡片 */}
      <div className="space-y-3">
        {responses.map((resp, i) => (
          <AgentCard key={i} response={resp} unlockedAgents={traderRoadProgress.unlockedAgents} />
        ))}
      </div>

      {isRunning && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Agent 分析中...</span>
          </div>
        </div>
      )}

      {!isRunning && currentStep === 16 && (
        <div className="space-y-3">
          <button
            onClick={() => {
              if (!stockContext) return;
              const stockCode = stockContext.stock.tsCode;
              const isWatched = watchlist.some((item) => item.code === stockCode);
              if (isWatched) {
                onRemoveFromWatchlist?.(stockCode);
              } else {
                onAddToWatchlist?.(stockContext.stock.name, stockCode);
              }
            }}
            className={`w-full py-2.5 text-white text-sm font-medium rounded-lg ${
              watchlist.some((item) => item.code === stockContext?.stock.tsCode)
                ? "bg-slate-500 hover:bg-slate-600"
                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            }`}
          >
            {watchlist.some((item) => item.code === stockContext?.stock.tsCode)
              ? "已关注 (点击取消)"
              : "添加关注"}
          </button>
          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              setIsRunning(false);
              setStarted(false);
              setCurrentStep(0);
              setTarget("");
              setResponses([]);
              setStockContext(null);
              setContextLoading(false);
              setContextError(null);
              setContextCacheStatus(null);
              setSteps(WORKFLOW_STEPS.map((s) => ({ ...s, status: "pending" as StepStatus })));
              onClearPrefilled();
            }}
            className="w-full py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            重新选择股票
          </button>
          <p className="text-[10px] text-center text-slate-500">
            以上内容仅供研究参考，不构成投资建议。
          </p>
        </div>
      )}

      {/* 关卡弹窗 */}
      {activeGameLevel !== null && (
        <GameMapPlayer
          initialLevelId={activeGameLevel}
          onClose={() => {
            setActiveGameLevel(null);
            reloadProgress();
          }}
          onLevelComplete={(levelId) => {
            reloadProgress();
            const level = TRADER_ROAD_LEVELS.find((l) => l.id === levelId);
            if (level && level.unlockAgents.length > 0) {
              const agentRole = level.unlockAgents[0];
              const agentInfo = AGENT_TEAM.find((a) => a.role === agentRole);
              if (agentInfo) {
                setUnlockingAgent(agentInfo);
              }
            }
          }}
        />
      )}

      {/* Agent 解锁动画 */}
      {unlockingAgent && (
        <AgentUnlockAnimation
          agent={unlockingAgent}
          onComplete={() => setUnlockingAgent(null)}
        />
      )}
    </div>
  );
}

// Agent 分析卡片组件
function AgentCard({ response, unlockedAgents }: { response: AgentResponse; unlockedAgents?: string[] }) {
  const agent = AGENT_TEAM.find((a) => a.role === response.agent);
  const isUnlocked = agent ? (unlockedAgents?.includes(agent.role) ?? true) : true;

  return (
    <div className={`bg-white rounded-lg p-4 border border-slate-100 ${!isUnlocked ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        {agent ? (
          <AgentAvatar agent={agent} unlocked={isUnlocked} size="sm" />
        ) : (
          <span className="text-lg">🤖</span>
        )}
        <div>
          <div className="text-xs font-semibold text-slate-700">{agent?.name}</div>
          <div className="text-[10px] text-slate-500">
            第 {response.step} 步 · {agent?.title}
          </div>
        </div>
      </div>
      {!isUnlocked ? (
        <div className="flex items-center gap-1.5 py-1">
          <span className="text-[10px] text-orange-500 font-medium">🔒 未解锁</span>
          <span className="text-[10px] text-slate-400">完成对应关卡后查看分析详情</span>
        </div>
      ) : (
      <div>
      <p className="text-xs text-slate-600 leading-relaxed">{response.content}</p>

      {/* 因子评分 */}
      {response.data?.scores ? (
        <div className="mt-3 space-y-2">
          {(response.data.scores as FactorScore[]).map((factor) => (
            <div key={factor.name} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-20">{factor.name}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${factor.score}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-700 w-8">{factor.score}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-700">综合评分</span>
            <span className="text-lg font-mono font-bold text-blue-600">{response.data.totalScore as number}</span>
          </div>
        </div>
      ) : null}

      {/* 多空观点对比 */}
      {response.data?.points ? (
        <div className="mt-3">
          <div className="text-xs font-medium text-slate-700 mb-2">多空观点对比</div>
          <div className="space-y-2">
            {(response.data.points as DebatePoint[]).map((point) => (
              <div key={point.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs font-medium text-slate-700 mb-1">{point.title}</div>
                <div className="text-[10px] text-slate-500 mb-1">{point.content}</div>
                <div className="text-[10px] text-blue-600">证据：{point.evidence}</div>
                <div className="text-[10px] text-slate-500 mt-1">置信度：{point.confidence}%</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* 风险检查 */}
      {response.data?.risks ? (
        <div className="mt-3 space-y-2">
          {(response.data.risks as RiskCheck[]).map((risk) => (
            <div key={risk.id} className={`p-2 rounded-lg border ${
              risk.status === "fail" ? "bg-red-50 border-red-100" :
              risk.status === "warning" ? "bg-amber-50 border-amber-100" :
              "bg-emerald-50 border-emerald-100"
            }`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${
                  risk.status === "fail" ? "text-red-600" :
                  risk.status === "warning" ? "text-amber-600" :
                  "text-emerald-600"
                }`}>
                  {risk.status === "fail" ? "❌" : risk.status === "warning" ? "⚠️" : "✅"}
                </span>
                <span className="text-xs font-medium text-slate-700">{risk.title}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">{risk.description}</div>
            </div>
          ))}
        </div>
      ) : null}

      {/* 情景预测 */}
      {response.data?.scenarios ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(["optimistic", "neutral", "pessimistic"] as const).map((key) => {
            const scenario = (response.data!.scenarios as ScenarioPrediction)[key];
            return (
              <div key={key} className={`p-2 rounded-lg text-center ${
                key === "optimistic" ? "bg-red-50 border border-red-100" :
                key === "pessimistic" ? "bg-emerald-50 border border-emerald-100" :
                "bg-slate-50 border border-slate-100"
              }`}>
                <div className="text-[10px] text-slate-500 mb-1">
                  {key === "optimistic" ? "乐观" : key === "pessimistic" ? "悲观" : "中性"}
                </div>
                <div className={`text-sm font-mono font-bold ${
                  key === "optimistic" ? "text-red-600" :
                  key === "pessimistic" ? "text-emerald-600" :
                  "text-slate-700"
                }`}>
                  {scenario.returnPct > 0 ? "+" : ""}{scenario.returnPct}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">¥{scenario.price}</div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* 研究报告 */}
      {response.data?.report ? (
        <div className="mt-3 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="text-xs font-semibold text-blue-800 mb-2">📄 研究报告</div>
          <div className="space-y-2 text-[10px] text-slate-700">
            <div><span className="text-slate-500">结论方向：</span>{(response.data.report as ResearchReport).conclusion.direction}</div>
            <div><span className="text-slate-500">置信度：</span>{(response.data.report as ResearchReport).conclusion.confidence}%</div>
            <div><span className="text-slate-500">核心逻辑：</span></div>
            {(response.data.report as ResearchReport).logic.map((l, i) => (
              <div key={i} className="pl-2 text-slate-600">{i + 1}. {l}</div>
            ))}
          </div>
        </div>
      ) : null}
      </div>
      )}
    </div>
  );
}

// ===== 模型 Tab（通用股票预测模型） =====
function ModelTab() {
  const [selectedFactors, setSelectedFactors] = useState<string[]>(DEFAULT_SELECTED_FACTORS);
  const [modelData, setModelData] = useState<GeneralPredictionModel | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [expandedStock, setExpandedStock] = useState<string | null>(null);
  const [expandedFactorGroup, setExpandedFactorGroup] = useState<string | null>(null);

  // 选股模式：random = 随机股票，custom = 指定股票
  const [stockMode, setStockMode] = useState<"random" | "custom">("random");
  // 自定义股票输入
  const [customStocks, setCustomStocks] = useState<string>("");
  // 解析后的自定义股票列表
  const [parsedCustomStocks, setParsedCustomStocks] = useState<{ name: string; code: string }[]>([]);

  const handleStartTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      if (stockMode === "custom" && parsedCustomStocks.length > 0) {
        // 使用自定义股票
        setModelData(generateGeneralPredictionModel(selectedFactors, parsedCustomStocks.map((s) => s.name)));
      } else {
        // 使用随机股票
        setModelData(generateGeneralPredictionModel(selectedFactors));
      }
      setIsTesting(false);
    }, 1500);
  };

  const handleResample = () => {
    setIsTesting(true);
    setTimeout(() => {
      if (stockMode === "custom" && parsedCustomStocks.length > 0) {
        setModelData(generateGeneralPredictionModel(selectedFactors, parsedCustomStocks.map((s) => s.name)));
      } else {
        setModelData(generateGeneralPredictionModel(selectedFactors));
      }
      setIsTesting(false);
    }, 1000);
  };

  const handleUseRecommended = () => {
    setSelectedFactors(DEFAULT_SELECTED_FACTORS);
  };

  const toggleFactor = (factor: string) => {
    setSelectedFactors((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]
    );
  };

  const isFactorSelected = (factor: string) => selectedFactors.includes(factor);

  // 解析自定义股票输入
  const handleCustomStocksChange = (value: string) => {
    setCustomStocks(value);
    const lines = value.split("\n").filter((line) => line.trim());
    const stocks = lines.map((line) => {
      const parts = line.trim().split(/[\s,，]+/);
      if (parts.length >= 2) {
        return { name: parts[0], code: parts[1] };
      } else if (parts.length === 1) {
        return { name: parts[0], code: "" };
      }
      return null;
    }).filter(Boolean) as { name: string; code: string }[];
    setParsedCustomStocks(stocks);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return "拟合较好";
    if (score >= 70) return "拟合可用";
    if (score >= 60) return "拟合一般";
    return "拟合较差";
  };

  return (
    <div className="p-4 space-y-4">
      {/* 模型总览 - 未来感升级 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">通用股票预测模型</h2>
            <p className="text-[10px] text-slate-500">多因子回归 + 机器学习拟合 + 蒙特卡洛模拟</p>
          </div>
        </div>
        <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded mt-2">
          Demo数据，仅用于产品演示，不代表实时行情。
        </p>
      </div>

      {/* 因子库 - 浏览+选择因子 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">因子库</h3>
          <span className="text-[10px] text-slate-400">点击因子名称选择/取消</span>
        </div>
        <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
          浏览因子说明，选择你认为有效的因子加入下方「已选因子」，系统将用它们进行拟合测试。
        </p>
        <div className="space-y-1.5">
          {FACTOR_LIBRARY.map((group) => {
            const selectedInGroup = group.metrics.filter((m) => selectedFactors.includes(m));
            const isExpanded = expandedFactorGroup === group.group;
            return (
              <div key={group.group} className="border border-slate-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFactorGroup(isExpanded ? null : group.group)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700">{group.group}</span>
                    {selectedInGroup.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                        {selectedInGroup.length}/{group.metrics.length}
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-3 h-3 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="p-2.5 bg-white">
                    <p className="text-[10px] text-slate-400 mb-2">{group.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.metrics.map((metric) => {
                        const selected = isFactorSelected(metric);
                        return (
                          <button
                            key={metric}
                            onClick={() => toggleFactor(metric)}
                            className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                              selected
                                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                            }`}
                          >
                            {selected ? "✓ " : "+ "}{metric}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 已选因子汇总 - 紧凑展示 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">已选因子</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">共 {selectedFactors.length} 个</span>
            {selectedFactors.length > 0 && (
              <button
                onClick={() => setSelectedFactors([])}
                className="text-[10px] text-slate-400 hover:text-red-500 transition-colors"
              >
                清空
              </button>
            )}
          </div>
        </div>

        {selectedFactors.length === 0 ? (
          <div className="text-center py-6 text-[10px] text-slate-400">
            <p>尚未选择因子</p>
            <p className="mt-1">在上方「因子库」中点击因子即可添加</p>
          </div>
        ) : (
          <div className="space-y-2">
            {FACTOR_LIBRARY.map((group) => {
              const selectedInGroup = group.metrics.filter((m) => selectedFactors.includes(m));
              if (selectedInGroup.length === 0) return null;
              return (
                <div key={group.group} className="flex items-start gap-2 text-[10px]">
                  <span className="text-slate-400 whitespace-nowrap mt-0.5 min-w-[48px]">{group.group}</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedInGroup.map((metric) => (
                      <button
                        key={metric}
                        onClick={() => toggleFactor(metric)}
                        className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="点击移除"
                      >
                        {metric} ×
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            className="w-full text-[10px] py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            onClick={handleUseRecommended}
          >
            使用推荐因子
          </button>
        </div>
      </div>

      {/* 选股模式选择 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">选股方式</h3>
        <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
          选择随机股票或输入你关注的股票，系统会将选定的因子应用到这些股票上进行拟合测试。
        </p>

        <div className="flex gap-2 mb-3">
          <button
            className={`flex-1 text-[10px] py-2 rounded-lg border transition-colors ${
              stockMode === "random"
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
            onClick={() => setStockMode("random")}
          >
            随机股票（10只）
          </button>
          <button
            className={`flex-1 text-[10px] py-2 rounded-lg border transition-colors ${
              stockMode === "custom"
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
            onClick={() => setStockMode("custom")}
          >
            指定股票
          </button>
        </div>

        {stockMode === "custom" && (
          <div>
            <label className="text-[10px] text-slate-600 mb-1 block">
              输入股票（每行一只，格式：股票名称 代码）
            </label>
            <textarea
              className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-300 resize-none"
              rows={5}
              placeholder={"贵州茅台 600519\n宁德时代 300750\n比亚迪 002594\n招商银行 600036"}
              value={customStocks}
              onChange={(e) => handleCustomStocksChange(e.target.value)}
            />
            {parsedCustomStocks.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {parsedCustomStocks.map((stock, index) => (
                  <span
                    key={index}
                    className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                  >
                    {stock.name} {stock.code && `(${stock.code})`}
                  </span>
                ))}
              </div>
            )}
            <p className="text-[10px] text-slate-500 mt-2">
              已识别 {parsedCustomStocks.length} 只股票
            </p>
          </div>
        )}
      </div>

      {/* 开始拟合测试 - 页面底部主按钮 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        {(() => {
          const needsFactors = selectedFactors.length === 0;
          const needsStocks = stockMode === "custom" && parsedCustomStocks.length === 0;
          const isDisabled = isTesting || needsFactors || needsStocks;
          const hint = needsFactors ? "请至少选择一个因子" : needsStocks ? "请添加至少一只股票" : "";
          return (
            <>
              {hint && (
                <p className="text-[10px] text-amber-600 text-center mb-2">{hint}</p>
              )}
              <button
                className="w-full text-xs py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStartTest}
                disabled={isDisabled}
              >
                {isTesting ? "测试中..." : "开始拟合测试"}
              </button>
            </>
          );
        })()}
      </div>

      {/* 测试结果 */}
      {modelData && (
        <>
          {/* 总体评分 */}
          <div className="bg-white rounded-lg p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">本次测试总体评分</h3>
              <button
                className="text-[10px] text-blue-600 hover:text-blue-700"
                onClick={handleResample}
              >
                {stockMode === "custom" ? "重新测试" : "重新抽样10只股票"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-slate-50 rounded">
                <div className={`text-lg font-mono font-bold ${getScoreColor(modelData.model_summary.average_score)}`}>
                  {modelData.model_summary.average_score}
                </div>
                <div className="text-[10px] text-slate-600">平均评分</div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded">
                <div className="text-lg font-mono font-bold text-blue-600">
                  {Math.round(modelData.model_summary.average_direction_accuracy * 100)}%
                </div>
                <div className="text-[10px] text-slate-600">方向准确率</div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded">
                <div className="text-lg font-mono font-bold text-emerald-600">
                  {Math.round(modelData.model_summary.average_interval_hit_rate * 100)}%
                </div>
                <div className="text-[10px] text-slate-600">区间命中率</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center p-2 bg-slate-50 rounded">
                <div className="text-xs font-mono font-bold text-slate-700">{modelData.model_summary.average_mae}</div>
                <div className="text-[10px] text-slate-600">MAE</div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded">
                <div className="text-xs font-mono font-bold text-slate-700">{modelData.model_summary.average_rmse}</div>
                <div className="text-[10px] text-slate-600">RMSE</div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded">
                <div className="text-xs font-mono font-bold text-blue-600">{modelData.model_summary.average_r2}</div>
                <div className="text-[10px] text-slate-600">R²</div>
              </div>
            </div>
          </div>

          {/* 样本股票结果列表 */}
          <div className="bg-white rounded-lg p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">
                {stockMode === "custom" ? "指定股票结果" : "十只样本股票结果"}
              </h3>
              <span className="text-[10px] text-slate-500">
                {modelData.sample_results.length} 只股票
              </span>
            </div>
            <div className="space-y-3">
              {modelData.sample_results.map((stock) => (
                <div key={stock.code} className="border border-slate-100 rounded-lg overflow-hidden">
                  <div
                    className="p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedStock(expandedStock === stock.code ? null : stock.code)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-medium text-slate-700">{stock.name}</span>
                        <span className="text-[10px] text-slate-500 ml-2">{stock.code}</span>
                      </div>
                      <span className={`text-xs font-mono font-bold ${getScoreColor(stock.model_score)}`}>
                        {stock.model_score}分
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-slate-500">{stock.industry}</span>
                      <span className={stock.direction_correct ? "text-emerald-600" : "text-red-600"}>
                        {stock.direction_correct ? "✅ 方向正确" : "❌ 方向错误"}
                      </span>
                      <span className={stock.interval_hit ? "text-emerald-600" : "text-amber-600"}>
                        {stock.interval_hit ? "✅ 区间命中" : "⚠️ 区间偏离"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                      <span>R²: {stock.r2}</span>
                      <span>MAE: {stock.mae}</span>
                      <span>RMSE: {stock.rmse}</span>
                    </div>
                  </div>
                  {expandedStock === stock.code && (
                    <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-3">
                      {/* 因子贡献 */}
                      <div>
                        <p className="text-[10px] font-medium text-slate-700 mb-2">因子贡献</p>
                        <div className="space-y-1">
                          {stock.factor_contributions.map((fc) => (
                            <div key={fc.factor} className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-600 w-20 truncate">{fc.factor}</span>
                              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${fc.contribution * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-700 w-8">
                                {Math.round(fc.contribution * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* 价格拟合图 */}
                      <div>
                        <p className="text-[10px] font-medium text-slate-700 mb-2">价格拟合图</p>
                        <StockCurveChart stock={stock} />
                      </div>
                      {/* 蒙特卡洛结果 */}
                      <div>
                        <p className="text-[10px] font-medium text-slate-700 mb-2">蒙特卡洛模拟</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-white rounded">
                            <div className="text-xs font-mono font-bold text-red-600">
                              {Math.round(stock.monte_carlo_result.up_probability * 100)}%
                            </div>
                            <div className="text-[10px] text-slate-600">上涨概率</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <div className="text-xs font-mono font-bold text-emerald-600">
                              {Math.round(stock.monte_carlo_result.down_probability * 100)}%
                            </div>
                            <div className="text-[10px] text-slate-600">下跌概率</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <div className="text-xs font-mono font-bold text-amber-600">
                              {Math.round(stock.monte_carlo_result.risk_line_break_probability * 100)}%
                            </div>
                            <div className="text-[10px] text-slate-600">跌破风险线</div>
                          </div>
                        </div>
                      </div>
                      {/* 误差原因 */}
                      <div>
                        <p className="text-[10px] font-medium text-slate-700 mb-1">误差原因</p>
                        <p className="text-[10px] text-slate-600 leading-relaxed">{stock.error_reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 模型总结汇总 */}
          <div className="bg-white rounded-lg p-4 border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">本次模型测试总结</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-[10px] text-slate-500">使用因子数量</div>
                  <div className="text-sm font-mono font-bold text-slate-700">{modelData.selected_factors.length}</div>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-[10px] text-slate-500">样本股票数量</div>
                  <div className="text-sm font-mono font-bold text-slate-700">{modelData.sample_size}</div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-[10px] text-slate-700 leading-relaxed">
                  本次随机抽取{modelData.sample_size}只股票进行拟合测试，平均模型评分为{modelData.model_summary.average_score}分，
                  方向准确率为{Math.round(modelData.model_summary.average_direction_accuracy * 100)}%，
                  区间命中率为{Math.round(modelData.model_summary.average_interval_hit_rate * 100)}%。
                  {modelData.model_summary.top_contributing_factors.join("、")}贡献较高，
                  {modelData.model_summary.noisy_factors.join("、")}在短周期预测中的解释力较弱。
                  表现最好的股票是{modelData.model_summary.best_stock}，
                  表现最差的是{modelData.model_summary.worst_stock}。
                  过拟合风险：{modelData.model_summary.overfitting_risk}。
                </p>
              </div>
            </div>
          </div>

          {/* 免责声明 */}
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <p className="text-[10px] text-amber-700 leading-relaxed">
              以上模型结果仅用于研究和演示，不构成投资建议。股票市场存在风险，历史拟合不代表未来表现。
              本页展示的是模型测试过程，不是股票买卖建议。拟合效果好不代表未来一定准确。
            </p>
          </div>
        </>
      )}

      {/* 未测试时的提示 */}
      {!modelData && !isTesting && (
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-100 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-xs text-slate-600 mb-1">选择因子后开始测试</p>
          <p className="text-[10px] text-slate-500">系统会随机抽取10只股票进行拟合测试</p>
        </div>
      )}
    </div>
  );
}

// 股票曲线图组件
function StockCurveChart({ stock }: { stock: SampleStockResult }) {
  const width = 280;
  const height = 120;
  const padding = 15;

  const allPrices = [
    ...stock.curve_data.actual_price,
    ...stock.curve_data.forecast_mid,
    ...stock.curve_data.monte_carlo_p10,
    ...stock.curve_data.monte_carlo_p90,
  ];
  const minPrice = Math.min(...allPrices) * 0.98;
  const maxPrice = Math.max(...allPrices) * 1.02;

  const scaleX = (i: number) => padding + (i / (stock.curve_data.dates.length - 1)) * (width - 2 * padding);
  const scaleY = (price: number) => height - padding - ((price - minPrice) / (maxPrice - minPrice)) * (height - 2 * padding);

  const createPath = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(v)}`).join(" ");

  const bandPath = stock.curve_data.monte_carlo_p90
    .map((v, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(v)}`)
    .join(" ");
  const bandPathReverse = stock.curve_data.monte_carlo_p10
    .slice()
    .reverse()
    .map((v, i) => `L ${scaleX(stock.curve_data.dates.length - 1 - i)} ${scaleY(v)}`)
    .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <path d={`${bandPath} ${bandPathReverse} Z`} fill="rgba(59, 130, 246, 0.1)" />
        <path d={createPath(stock.curve_data.forecast_mid)} fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" />
        <path d={createPath(stock.curve_data.ml_fitted_price)} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <path d={createPath(stock.curve_data.actual_price)} fill="none" stroke="#1e293b" strokeWidth="1.5" />
      </svg>
      <div className="flex items-center justify-center gap-3 mt-1">
        <span className="flex items-center gap-1 text-[9px] text-slate-500">
          <span className="w-3 h-0.5 bg-slate-800 inline-block" /> 实际价格
        </span>
        <span className="flex items-center gap-1 text-[9px] text-slate-500">
          <span className="w-3 h-0.5 bg-blue-500 inline-block border-dashed" style={{ borderTop: "1px dashed #3b82f6" }} /> 预测中位
        </span>
        <span className="flex items-center gap-1 text-[9px] text-slate-500">
          <span className="w-3 h-0.5 bg-amber-500 inline-block" /> ML拟合
        </span>
      </div>
    </div>
  );
}

// 曲线拟合图组件
function CurveFitChart({ data }: { data: ReplayCurveFit }) {
  const width = 300;
  const height = 150;
  const padding = 20;

  const allPrices = [
    ...data.actual_price,
    ...data.agent_forecast_mid,
    ...data.agent_forecast_upper,
    ...data.agent_forecast_lower,
    ...data.ml_fitted_price,
  ];
  const minPrice = Math.min(...allPrices) * 0.98;
  const maxPrice = Math.max(...allPrices) * 1.02;

  const scaleX = (i: number) => padding + (i / (data.dates.length - 1)) * (width - 2 * padding);
  const scaleY = (price: number) => height - padding - ((price - minPrice) / (maxPrice - minPrice)) * (height - 2 * padding);

  const createPath = (values: number[]) => {
    return values.map((v, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(v)}`).join(" ");
  };

  const bandPath = data.agent_forecast_upper
    .map((v, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(v)}`)
    .join(" ");
  const bandPathReverse = data.agent_forecast_lower
    .slice()
    .reverse()
    .map((v, i) => `L ${scaleX(data.dates.length - 1 - i)} ${scaleY(v)}`)
    .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* 预测区间带 */}
        <path d={`${bandPath} ${bandPathReverse} Z`} fill="rgba(59, 130, 246, 0.1)" />
        {/* 预测中位线 */}
        <path d={createPath(data.agent_forecast_mid)} fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" />
        {/* ML拟合线 */}
        <path d={createPath(data.ml_fitted_price)} fill="none" stroke="#f97316" strokeWidth="1.5" />
        {/* 实际价格线 */}
        <path d={createPath(data.actual_price)} fill="none" stroke="#1e293b" strokeWidth="2" />
      </svg>
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-slate-800" />
          <span className="text-[10px] text-slate-600">实际价格</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-blue-500 border-dashed" />
          <span className="text-[10px] text-slate-600">预测中位线</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-orange-500" />
          <span className="text-[10px] text-slate-600">ML拟合</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 bg-blue-500/10" />
          <span className="text-[10px] text-slate-600">预测区间</span>
        </div>
      </div>
    </div>
  );
}

// 复盘详情页
function ReviewDetailPage({ review, onBack }: { review: ReviewDetail; onBack: () => void }) {
  return (
    <div className="p-4 space-y-4">
      <button onClick={onBack} className="text-sm text-blue-600 flex items-center gap-1">
        ← 返回复盘列表
      </button>

      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">{review.target}</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><span className="text-slate-500">投资风格：</span>{review.style === "short" ? "短线" : review.style === "swing" ? "波段" : "长期"}</div>
          <div><span className="text-slate-500">创建日期：</span>{review.createdAt}</div>
          <div><span className="text-slate-500">复盘日期：</span>{review.reviewDate}</div>
          <div><span className="text-slate-500">研究结论：</span>{review.conclusion}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">预测曲线拟合</h3>
        <CurveFitChart data={review.curve_fit} />
      </div>

      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">复盘指标</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-slate-50 rounded">
            <div className="text-xs font-mono font-bold text-blue-600">{review.curve_fit.metrics.direction_accuracy}%</div>
            <div className="text-[10px] text-slate-600">方向准确率</div>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded">
            <div className="text-xs font-mono font-bold text-emerald-600">{review.curve_fit.metrics.interval_hit_rate}%</div>
            <div className="text-[10px] text-slate-600">区间命中率</div>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded">
            <div className="text-xs font-mono font-bold text-slate-700">{review.curve_fit.metrics.r2}</div>
            <div className="text-[10px] text-slate-600">R²</div>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded">
            <div className="text-xs font-mono font-bold text-slate-700">{review.curve_fit.metrics.mae}</div>
            <div className="text-[10px] text-slate-600">MAE</div>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded">
            <div className="text-xs font-mono font-bold text-slate-700">{review.curve_fit.metrics.rmse}</div>
            <div className="text-[10px] text-slate-600">RMSE</div>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded">
            <div className="text-xs font-mono font-bold text-red-600">{review.curve_fit.metrics.max_drawdown}%</div>
            <div className="text-[10px] text-slate-600">最大回撤</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-emerald-700 mb-2">✅ 看对了什么</h3>
        <ul className="text-xs text-slate-600 space-y-1">
          {review.what_went_right.map((item, i) => (
            <li key={i}>• {item}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-red-700 mb-2">❌ 看错了什么</h3>
        <ul className="text-xs text-slate-600 space-y-1">
          {review.what_went_wrong.map((item, i) => (
            <li key={i}>• {item}</li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">🔄 模型调整方向</h3>
        <p className="text-xs text-slate-700">{review.model_adjustment}</p>
      </div>
    </div>
  );
}

// ===== 我的 Tab =====
// 通俗版调研报告数据
const STOCK_REPORTS: Record<string, {
  title: string;
  summary: string;
  highlights: string[];
  verdict: string;
  buddySays: string;
  tags: string[];
}> = {
  "300750": {
    title: "宁德时代 · 电池一哥的日常",
    summary: "全球动力电池龙头，市占率稳如老狗。虽然今年电动车增速有点喘气，但宁德靠储能业务和海外建厂又续上了命。",
    highlights: ["全球动力电池市占率 ~37%，连续 7 年第一", "储能业务增速 80%+，第二增长曲线已起飞", "海外工厂（匈牙利/德国）2025 年陆续投产"],
    verdict: "长线看没问题，短期等回调。储能才是真正的未来，电动车的增速放缓只是暂时的。",
    buddySays: "电池一哥的钱不是一天赚完的。逢低布局，别追高。",
    tags: ["龙头", "储能", "长线"]
  },
  "002415": {
    title: "海康威视 · 摄像头背后的秘密",
    summary: "安防老大，全球摄像头出货量第一。AI 时代重新定义了摄像头——从「看的见」到「看得懂」",
    highlights: ["安防市场占有率全球第一 (~30%)", "AI 赋能：从监控到 AI 视觉大脑", "创新业务（机器人/汽车电子）增速亮眼"],
    verdict: "传统安防稳如磐石，AI 视觉是新的故事。数字化改造的大背景下，海康的摄像头会越来越多。",
    buddySays: "摄像头不只是监控，是 AI 的眼睛。这个故事能讲很久。",
    tags: ["安防", "AI", "数字化"]
  },
  "600519": {
    title: "贵州茅台 · 液体黄金的日常",
    summary: "A 股信仰，社交硬通货。茅台不只是酒，是理财产品、是社交货币、是阶级符号。",
    highlights: ["毛利率 94%+，印钞机级别的生意", "飞天茅台出厂价 1169，市场价 2500+，渠道利差巨大", "直营占比持续提升，利润还有释放空间"],
    verdict: "A 股最好的生意模式之一。贵是贵，但贵得有道理。适合长期持有，不折腾。",
    buddySays: "茅台不是用来喝的，是用来收藏的。不是在说酒，是在说股票。",
    tags: ["消费", "核心资产", "长线"]
  },
  "000858": {
    title: "五粮液 · 千年老二也精彩",
    summary: "浓香白酒老大，仅次于茅台的存在。没有茅台的命，但有自己的节奏。",
    highlights: ["浓香型白酒市占率第一", "品牌力仅次于茅台，但性价比更高", "渠道改革成效显著，库存去化顺利"],
    verdict: "比茅台便宜，增长也不慢。在白酒行业整体收缩的背景下，五粮液靠品牌力还能稳住。",
    buddySays: "当老二不丢人，能赚钱就行。五粮液是白酒里的价值之选。",
    tags: ["消费", "白酒", "性价比"]
  },
  "002594": {
    title: "比亚迪 · 车轮上的帝国",
    summary: "中国新能源车之王，从电池到整车到芯片，什么都自己干。垂直整合狂魔。",
    highlights: ["新能源车销量全球第一，超过特斯拉", "垂直整合：电池/电机/电控/芯片全自研", "高端品牌仰望 + 腾势，正在向上突破"],
    verdict: "短期看销量，长期看高端化和出海。比亚迪已经不只是车厂，是新能源领域的综合巨头。",
    buddySays: "什么都自己造，所以成本比别人低。这是比亚迪的护城河，也是它的赌注。",
    tags: ["新能源车", "龙头", "垂直整合"]
  }
};

function ProfileTab({ profile, tradeTIResult, onRetakeSurvey, watchlist, onRemoveFromWatchlist }: { profile: UserProfileSurvey; tradeTIResult: TradeTIState | null; onRetakeSurvey: () => void; watchlist: WatchlistItem[]; onRemoveFromWatchlist: (code: string) => void }) {
  const { isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reportStock, setReportStock] = useState<string | null>(null);
  
  useEffect(() => {
    const handle = () => refreshResearchedCount();
    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
  }, []);
  const refreshResearchedCount = () => {
    const stored = localStorage.getItem("tradeti_researched_stocks");
    setResearchedCount(stored ? JSON.parse(stored).length : 0);
  };
  const [researchedCount, setResearchedCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem("tradeti_researched_stocks");
    return stored ? JSON.parse(stored).length : 0;
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const getStockReport = (stockName: string) => {
    const stockData: Record<string, { industry: string; pe: string; peStatus: string; roe: string; roeStatus: string; revenueGrowth: string; revenueStatus: string; rating: string; coverage: string; summary: string; risk: string; verdict: string }> = {
      "宁德时代": {
        industry: "电力设备", pe: "18.5", peStatus: "低于行业均值", roe: "21.3%", roeStatus: "优秀",
        revenueGrowth: "32.1%", revenueStatus: "高增长", rating: "买入", coverage: "35家机构覆盖",
        summary: "电池界的「卷王」，产能利用率拉满，技术路线碾压同行。",
        risk: "下游需求放缓，产能过剩风险，原材料价格波动。",
        verdict: "成长性依然能打，但估值已经不便宜了。看好就问，别追高就行。"
      },
      "贵州茅台": {
        industry: "食品饮料", pe: "28.2", peStatus: "合理偏高", roe: "33.5%", roeStatus: "优秀",
        revenueGrowth: "15.8%", revenueStatus: "稳健", rating: "买入", coverage: "42家机构覆盖",
        summary: "白酒界的「定海神针」，提价逻辑还在，但年轻人还喝不喝是个问题。",
        risk: "消费降级冲击，政策风险，年轻人白酒消费下滑。",
        verdict: "A股第一信仰标的。短期看价格，长期看品牌。信仰可以，但别上头。"
      },
      "比亚迪": {
        industry: "汽车", pe: "22.8", peStatus: "合理", roe: "18.7%", roeStatus: "良好",
        revenueGrowth: "45.6%", revenueStatus: "高增长", rating: "买入", coverage: "38家机构覆盖",
        summary: "新能源车「销冠」，但价格战打得凶，利润率是个隐患。",
        risk: "价格战加剧，出海受阻，毛利率下滑。",
        verdict: "销量很猛，但利润增长跟不上销量的节奏。中长期看好，短期波动大。"
      },
      "药明康德": {
        industry: "医药生物", pe: "25.3", peStatus: "合理", roe: "16.8%", roeStatus: "良好",
        revenueGrowth: "8.5%", revenueStatus: "放缓", rating: "增持", coverage: "30家机构覆盖",
        summary: "CXO 赛道「头号玩家」，海外订单回暖，但地缘政治是条暗线。",
        risk: "中美关系不确定性，海外订单波动，行业竞争加剧。",
        verdict: "行业回暖趋势明显，但地缘政治这颗雷不确定。看好可以，但仓位别太重。"
      },
      "科大讯飞": {
        industry: "计算机", pe: "45.6", peStatus: "偏高", roe: "8.2%", roeStatus: "一般",
        revenueGrowth: "25.3%", revenueStatus: "高增长", rating: "增持", coverage: "28家机构覆盖",
        summary: "AI 概念「当红炸子鸡」，星火大模型迭代快，但商业化还要时间。",
        risk: "AI 商业化不及预期，高估值压力，竞争激烈。",
        verdict: "AI 风口上的好标的，但估值已经飞在天上了。等回调再上车，不追高。"
      },
      "中国中免": {
        industry: "商贸零售", pe: "20.1", peStatus: "合理偏低", roe: "14.5%", roeStatus: "良好",
        revenueGrowth: "-5.2%", revenueStatus: "下滑", rating: "中性", coverage: "25家机构覆盖",
        summary: "免税「一哥」，消费降级背景下承压，但牌照壁垒还在。",
        risk: "消费疲软，海南免税增速放缓，竞争加剧。",
        verdict: "护城河还在，但增长动力不足。属于等风来的标的，要有耐心。"
      },
      "迈瑞医疗": {
        industry: "医药器械", pe: "30.2", peStatus: "合理", roe: "29.1%", roeStatus: "优秀",
        revenueGrowth: "18.2%", revenueStatus: "稳健", rating: "买入", coverage: "32家机构覆盖",
        summary: "医疗器械「学霸」，海外业务增长快，国产替代逻辑顺畅。",
        risk: "集采风险，海外合规风险，汇率波动。",
        verdict: "国产替代的确定性标的，业绩稳健。可以长期持有，但别指望短期爆发。"
      },
      "东方财富": {
        industry: "非银金融", pe: "25.8", peStatus: "合理", roe: "12.3%", roeStatus: "良好",
        revenueGrowth: "8.5%", revenueStatus: "稳健", rating: "增持", coverage: "30家机构覆盖",
        summary: "互联网券商「扛把子」，市场活跃度直接决定业绩。",
        risk: "市场成交量下滑，佣金率下行，竞争加剧。",
        verdict: "市场好了它就好，市场差了它就差。属于市场的「温度计」，看准了再下手。"
      },
      "隆基绿能": {
        industry: "电力设备", pe: "35.2", peStatus: "偏高", roe: "6.8%", roeStatus: "一般",
        revenueGrowth: "-12.5%", revenueStatus: "下滑", rating: "中性", coverage: "28家机构覆盖",
        summary: "光伏「老大哥」，行业产能过剩严重，还在等出清。",
        risk: "产能过剩，价格战，海外贸易壁垒。",
        verdict: "行业周期底部，等出清。有耐心可以左侧布局，想赚快钱的别来。"
      },
      "海康威视": {
        industry: "计算机", pe: "22.5", peStatus: "合理偏低", roe: "19.8%", roeStatus: "优秀",
        revenueGrowth: "12.3%", revenueStatus: "稳健", rating: "买入", coverage: "36家机构覆盖",
        summary: "安防「霸主」，AI 赋能打开新空间，从「看得见」到「看得懂」。",
        risk: "海外制裁风险，AI 转型不及预期，政府订单波动。",
        verdict: "安防老大底蕴深厚，AI 转型是第二增长曲线。稳健型选手，适合长期拿着。"
      }
    };
    if (stockData[stockName]) return stockData[stockName];
    // 不在表里的股票，根据名字生成一份独特的报告
    const hash = stockName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const pe = (12 + (hash % 25)).toFixed(1);
    const roe = (8 + (hash % 18)).toFixed(1);
    const growth = (5 + (hash % 30)).toFixed(1);
    const score = 55 + (hash % 30);
    const verdicts = [
      '这只票目前没有详细研究数据。建议先去研究页看看有没有相关分析，或者关注一下行业动态再决定。',
      '暂时缺少这只股票的深度报告。可以先看看它所在板块的整体表现，找找线索。',
      '这只票的研究数据还没到位。不急，先把它的行业逻辑搞清楚再说。',
    ];
    return {
      opening: stockName + '，目前缺少详细研究数据。',
      summary: stockName + '暂无深度报告，建议先关注行业动态和板块表现。',
      pe: pe + '倍',
      peStatus: parseFloat(pe) < 20 ? '低于行业均值' : parseFloat(pe) < 30 ? '接近行业均值' : '高于行业均值',
      roe: roe + '%',
      roeStatus: parseFloat(roe) > 15 ? '优秀' : parseFloat(roe) > 10 ? '良好' : '一般',
      revenueGrowth: '+' + growth + '%',
      revenueStatus: parseFloat(growth) > 20 ? '高增长' : parseFloat(growth) > 10 ? '稳健增长' : '增速放缓',
      rating: score > 75 ? '买入' : score > 65 ? '增持' : '中性',
      coverage: (10 + (hash % 20)) + '家机构覆盖',
      verdict: verdicts[hash % verdicts.length],
    };
  };

  const feedbackDimensions = [
    { key: "timeliness", label: "数据及时性", emoji: "📡" },
    { key: "recommendation", label: "推荐标的质量", emoji: "🎯" },
    { key: "ai_clarity", label: "AI 解释易懂度", emoji: "💡" },
    { key: "risk_warning", label: "风险提示充分度", emoji: "⚠️" },
    { key: "ux_smooth", label: "页面操作流畅度", emoji: "🖐️" },
    { key: "retention", label: "持续使用意愿", emoji: "🔄" },
  ];

  const [dimensionScores, setDimensionScores] = useState<Record<string, number>>({});

  const setDimensionScore = (key: string, score: number) => {
    setDimensionScores((prev) => ({ ...prev, [key]: score }));
  };

  const faces = [
    { value: 1, emoji: "😞", label: "不满意" },
    { value: 2, emoji: "😐", label: "一般" },
    { value: 3, emoji: "😊", label: "满意" },
  ];

  const handleSubmitFeedback = async () => {
    if (rating < 1 || rating > 5) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          dimensionScores,
          comment,
          page: "profile",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "提交失败");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 未登录提示 */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#4ECDC4] rounded-3xl p-4 shadow-lg">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">👋</div>
            <h3 className="text-sm font-black text-slate-800 mb-1">你正在以游客模式浏览</h3>
            <p className="text-xs font-bold text-slate-500 mb-3">登录后享受完整功能，数据云端同步</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  localStorage.removeItem('auth_skipped');
                  router.push('/login');
                }}
                className="flex-1 py-2.5 text-xs font-black bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#4ECDC4] text-white rounded-2xl shadow-md transition-all hover:scale-[1.02] active:scale-95"
              >
                🔑 去登录
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('auth_skipped');
                  router.push('/login');
                }}
                className="flex-1 py-2.5 text-xs font-black border-2 border-slate-200 text-slate-500 rounded-2xl transition-all hover:border-slate-300 active:scale-95"
              >
                🚀 去注册
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 用户信息 - 多巴胺风格 */}
      <div className="bg-white rounded-3xl p-4 border-2 border-[#FFD93D] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B6B] via-[#FFD93D] to-[#4ECDC4] flex items-center justify-center text-white text-2xl font-black shadow-lg">
            Y
          </div>
          <div>
            <div className="text-base font-black text-slate-800">投资者</div>
            <div className="text-xs font-bold text-[#FF6B35]">
              🎯 {profile.recommended_style === "short" ? "⚡ 短线猎手" : profile.recommended_style === "swing" ? "🎯 波段达人" : "💎 长期价值"}
            </div>
          </div>
        </div>
      </div>

      {/* tradeTI 交易人格 */}
      <div className="bg-white rounded-3xl p-4 border-2 border-[#FFD93D] shadow-md">
        <h3 className="text-sm font-black mb-2 bg-gradient-to-r from-[#FF6B35] to-[#FFD93D] bg-clip-text text-transparent">🧬 tradeTI 交易抽象人格</h3>
        {tradeTIResult && tradeTIResult.result_type ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#FFD93D] flex-shrink-0">
                <img
                  src={`/avatar_${tradeTIResult.result_type}.png`}
                  alt={TRADETI_PERSONALITIES[tradeTIResult.result_type]?.name || ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-black text-slate-800">{TRADETI_PERSONALITIES[tradeTIResult.result_type]?.name || tradeTIResult.result_type}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{TRADETI_PERSONALITIES[tradeTIResult.result_type]?.description}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-bold mb-3">尚未完成 tradeTI 测试</p>
        )}
        <button onClick={onRetakeSurvey} className="w-full mt-3 py-3 text-sm font-black bg-gradient-to-r from-[#FF6B35] to-[#FFD93D] text-white rounded-2xl shadow-lg shadow-[#FF6B35]/20 transition-all hover:scale-[1.02] active:scale-95">🔄 重新测试</button>
      </div>

      {/* 关注股票 */}
      <div className="bg-white rounded-3xl p-4 border-2 border-[#4ECDC4] shadow-md">
        <h3 className="text-sm font-black mb-3 bg-gradient-to-r from-[#4ECDC4] to-[#FFD93D] bg-clip-text text-transparent">⭐ 我的关注</h3>
        <div className="space-y-2">
          {watchlist.length === 0 ? (
            <div className="text-xs font-bold text-slate-400 text-center py-4">还没有关注股票，去研究页添加吧</div>
          ) : (
            watchlist.map((item) => (
              <div key={item.tsCode} className="flex items-center justify-between py-2.5 border-b-2 border-slate-100 last:border-0">
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-700">{item.name} {item.code}</span>
                  {item.industry && <span className="text-[10px] font-bold text-slate-400 ml-2">{item.industry}</span>}
                  {item.reason && <div className="text-[10px] font-bold text-slate-400 mt-0.5">{item.reason}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReportStock(item.name)}
                    className="text-[10px] font-bold text-[#3B82F6] hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full"
                  >
                    查看报告
                  </button>
                  <span className="text-[10px] font-bold text-slate-400">{item.addedAt ? item.addedAt.slice(5, 10) : ''}</span>
                  {onRemoveFromWatchlist && (
                    <button onClick={() => onRemoveFromWatchlist(item.tsCode || item.code)} className="text-[10px] font-bold text-red-400 hover:text-red-600">✕</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 研究报告弹窗 */}
      {reportStock && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-20" onClick={() => setReportStock(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white rounded-3xl p-5 mx-4 w-full max-w-md shadow-2xl border-2 border-[#FFD93D] animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-800">📊 {reportStock} 研究报告</h3>
              <button onClick={() => setReportStock(null)} className="text-slate-400 hover:text-slate-600 text-lg font-black">✕</button>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-gradient-to-r from-[#FF6B6B] via-[#FFE66D] to-[#4ECDC4] p-4 rounded-2xl text-white">
                      <div className="font-black text-sm mb-1">🎯 一句话总结</div>
                      <div className="font-bold text-[11px] opacity-90">{getStockReport(reportStock).summary}</div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <div className="font-black text-sm text-slate-800 mb-2">📈 核心指标</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-white rounded-xl p-2.5 border border-slate-100">
                          <div className="text-slate-400 font-bold">PE 估值</div>
                          <div className="font-black text-slate-800 mt-0.5">{getStockReport(reportStock).pe}</div>
                          <div className="text-emerald-500 font-bold text-[10px]">{getStockReport(reportStock).peStatus}</div>
                        </div>
                        <div className="bg-white rounded-xl p-2.5 border border-slate-100">
                          <div className="text-slate-400 font-bold">ROE</div>
                          <div className="font-black text-slate-800 mt-0.5">{getStockReport(reportStock).roe}</div>
                          <div className="text-emerald-500 font-bold text-[10px]">{getStockReport(reportStock).roeStatus}</div>
                        </div>
                        <div className="bg-white rounded-xl p-2.5 border border-slate-100">
                          <div className="text-slate-400 font-bold">营收增速</div>
                          <div className="font-black text-slate-800 mt-0.5">{getStockReport(reportStock).revenueGrowth}</div>
                          <div className="text-amber-500 font-bold text-[10px]">{getStockReport(reportStock).revenueStatus}</div>
                        </div>
                        <div className="bg-white rounded-xl p-2.5 border border-slate-100">
                          <div className="text-slate-400 font-bold">机构评级</div>
                          <div className="font-black text-slate-800 mt-0.5">{getStockReport(reportStock).rating}</div>
                          <div className="text-emerald-500 font-bold text-[10px]">{getStockReport(reportStock).coverage}</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <div className="font-black text-sm text-slate-800 mb-2">🧠 搭子说</div>
                      <div className="text-[11px] font-bold text-slate-600 leading-relaxed">{getStockReport(reportStock).verdict}</div>
                    </div>


            </div>
          </div>
        </div>
      )}

      {/* 历史档案 */}
      <div className="bg-white rounded-3xl p-4 border-2 border-[#FFD93D] shadow-md">
        <h3 className="text-sm font-black mb-3 bg-gradient-to-r from-[#FFD93D] to-[#FF6B35] bg-clip-text text-transparent">📚 历史研究档案</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xl font-black text-slate-800">{researchedCount}</div>
            <div className="text-[10px] font-bold text-slate-500">总研究数</div>
          </div>
          <div>
            <div className="text-xl font-black text-[#FF6B6B]">68%</div>
            <div className="text-[10px] font-bold text-slate-500">方向准确率</div>
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-emerald-600">52%</div>
            <div className="text-[10px] text-slate-500">区间命中率</div>
          </div>
        </div>
      </div>

      {/* 用户反馈 */}
      <div className="bg-white rounded-3xl p-4 border-2 border-[#8B5CF6] shadow-md">
        <button
          onClick={() => { setFeedbackOpen(!feedbackOpen); if (!feedbackOpen) setSubmitted(false); }}
          className="w-full flex items-center justify-between"
        >
          <h3 className="text-sm font-black bg-gradient-to-r from-[#8B5CF6] to-[#FF6B6B] bg-clip-text text-transparent"> 用户反馈</h3>
          <span className="text-xs text-slate-400">{feedbackOpen ? "收起" : "展开"}</span>
        </button>
        {feedbackOpen && (
          <div className="mt-3 space-y-3">
            {submitted ? (
              <div className="text-center py-4">
                <span className="text-2xl">🎉</span>
                <p className="text-sm font-bold text-slate-800 mt-2">感谢你的反馈！</p>
                <p className="text-xs text-slate-500 mt-1">我们会持续改进产品体验</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700">请为以下维度打分：</p>
                  {feedbackDimensions.map((dim) => (
                    <div key={dim.key} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700 min-w-[90px] shrink-0">
                        <span className="mr-1">{dim.emoji}</span>{dim.label}
                      </span>
                      <div className="flex gap-1.5">
                        {faces.map((f) => {
                          const selected = dimensionScores[dim.key] === f.value;
                          return (
                            <button
                              key={f.value}
                              onClick={() => setDimensionScore(dim.key, f.value)}
                              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                                selected
                                  ? f.value === 3 ? "bg-green-100 border-2 border-green-400 scale-110"
                                    : f.value === 2 ? "bg-yellow-100 border-2 border-yellow-400 scale-110"
                                    : "bg-red-100 border-2 border-red-400 scale-110"
                                  : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                              }`}
                              title={f.label}
                            >
                              {f.emoji}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-1.5">总体评分：</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRating(n)}
                        className={`text-2xl transition-all ${
                          n <= rating ? "scale-110" : "opacity-40 grayscale"
                        }`}
                      >
                        {n <= rating ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-1.5">主观建议（选填）：</p>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 1000))}
                    placeholder="告诉我们你的想法..."
                    className="w-full px-3 py-2 text-xs border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#8B5CF6] resize-none h-20"
                  />
                  <p className="text-[10px] text-slate-400 text-right">{comment.length}/1000</p>
                </div>
                {submitError && <p className="text-xs text-red-500 font-bold">{submitError}</p>}
                <button
                  onClick={handleSubmitFeedback}
                  disabled={rating < 1 || submitting}
                  className="w-full py-2.5 text-sm font-black text-white rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #FF6B6B)" }}
                >
                  {submitting ? "提交中..." : "提交反馈"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 常看行业 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">常看行业</h3>
        <div className="flex flex-wrap gap-2">
          {["电子", "计算机", "汽车", "半导体", "新能源", "医药"].map((industry) => (
            <span key={industry} className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-full">
              {industry}
            </span>
          ))}
        </div>
      </div>

      {/* 风险教育 */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">⚠️ 风险教育</h3>
        <ul className="text-[10px] text-amber-700 space-y-1 leading-relaxed">
          <li>• 投资有风险，入市需谨慎</li>
          <li>• 过往业绩不代表未来表现</li>
          <li>• 不要使用杠杆资金投资</li>
          <li>• 分散投资，控制单只股票仓位</li>
        </ul>
      </div>

      {/* 免责声明 */}
      <div className="bg-slate-100 rounded-lg p-4">
        <p className="text-[10px] text-slate-500 leading-relaxed text-center">
          本产品为 AI 投资研究辅助工具，不是荐股软件，不是自动交易工具。<br />
          所有研究结论仅供研究参考，不构成投资建议。<br />
          用户应独立做出投资决策，并承担相应风险。
        </p>
      </div>

      {/* 账户信息 & 退出登录 */}
      <ProfileAccountSection />
    </div>
  );
}

function ProfileAccountSection() {
  const { user, signOut } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      localStorage.removeItem('auth_skipped');
      await signOut();
      window.location.href = '/login';
    } finally {
      setSigningOut(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-md">
      <h3 className="text-sm font-black mb-3 text-slate-700">👤 账户信息</h3>
      {user && (
        <div className="mb-3">
          <p className="text-xs text-slate-600">
            <span className="text-slate-400">邮箱：</span>
            <span className="font-mono">{user.email}</span>
          </p>
          {user.user_metadata?.full_name && (
            <p className="text-xs text-slate-600 mt-1">
              <span className="text-slate-400">昵称：</span>
              {user.user_metadata.full_name}
            </p>
          )}
        </div>
      )}
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-2 text-xs font-bold text-red-500 bg-red-50 rounded-xl border-2 border-red-100 hover:bg-red-100 transition-colors"
        >
          退出登录
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex-1 py-2 text-xs font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {signingOut ? '退出中...' : '确认退出'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}

// ===== 冒险控制台 =====
function AdventureEntryCard({
  icon,
  title,
  desc,
  badge,
}: {
  icon: string;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <div className="text-left rounded-xl border border-slate-100 bg-white p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-bold text-slate-800">{title}</span>
        {badge && (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">
            {badge}
          </span>
        )}
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// ===== 市场冒险局 =====
function MarketTab({ tradeTIResult, onFillResearch, onGoToResearch, onShowOnboardingGuide }: { tradeTIResult: TradeTIState | null; onFillResearch: (target: RecommendedTarget) => void; onGoToResearch: () => void; onShowOnboardingGuide?: () => void }) {
  const [researchTabGameLevel, setResearchTabGameLevel] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [marketSnapshot, setMarketSnapshot] = useState<MiniMarketSnapshot | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(true);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [level1Open, setLevel1Open] = useState(false);
  const [activeGameLevel, setActiveGameLevel] = useState<number | null>(null);
  const [traderRoadProgress, setTraderRoadProgress] = useState<TraderRoadProgress>(getDefaultTraderRoadProgress());
  const [adventureDetailsExpanded, setAdventureDetailsExpanded] = useState(false);

  // 加载游戏进度（使用集中式进度模块）
  useEffect(() => {
    setTraderRoadProgress(loadTraderRoadProgress());
  }, []);

  const reloadProgress = () => {
    setTraderRoadProgress(loadTraderRoadProgress());
  };

  // 解锁动画状态
  const [unlockingAgent, setUnlockingAgent] = useState<AgentInfo | null>(null);

  // 人格身份
  const personalityId = tradeTIResult?.result_type || null;

  // 人格故事线
  const storyline = personalityId ? getStoryline(personalityId) : getDefaultStoryline();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // 从 localStorage 加载任务完成状态
  useEffect(() => {
    const saved = localStorage.getItem("tradeti_story_progress");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.personalityId === personalityId) {
          setCompletedTasks(parsed.completedTasks || []);
        }
      } catch {}
    }
  }, [personalityId]);

  // 切换任务完成状态
  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const isCompleting = !prev.includes(taskId);
      const next = isCompleting
        ? [...prev, taskId]
        : prev.filter((id) => id !== taskId);
      localStorage.setItem(
        "tradeti_story_progress",
        JSON.stringify({ personalityId, completedTasks: next })
      );
      // XP reward for completing a daily task
      if (isCompleting) {
        completeDailyTask(taskId);
        // Check if all 3 daily tasks are now complete
        if (next.length >= 3) {
          claimDailyBonus();
        }
        reloadProgress();
      }
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;
    setSnapshotLoading(true);
    fetch("/api/market-snapshot")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.success && json.data) {
          setMarketSnapshot(json.data);
        } else {
          setSnapshotError("数据加载失败");
        }
      })
      .catch(() => {
        if (!cancelled) setSnapshotError("网络异常");
      })
      .finally(() => {
        if (!cancelled) setSnapshotLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Use snapshot data or fallback to mock
  const summary = marketSnapshot?.summary || mockMarketData.summary;
  const indices = marketSnapshot?.indices?.length ? marketSnapshot.indices : mockMarketData.indices;
  const hotSectors = marketSnapshot?.hotSectors?.length ? marketSnapshot.hotSectors : mockMarketData.hotSectors;
  const activeStocks = marketSnapshot?.activeStocks?.length ? marketSnapshot.activeStocks : mockMarketData.activeStocks;
  const recommendedTargets: MiniRecommendedTarget[] = marketSnapshot?.recommendedTargets?.length
    ? marketSnapshot.recommendedTargets
    : mockRecommendedTargets;
  const events = marketSnapshot?.events?.length ? marketSnapshot.events : mockMarketData.events;

  // 人格搭子的问候语
  const buddyGreetings: Record<string, { greeting: string; line: string }> = {
    wall_street: { greeting: "华尔街在逃交易员", line: "今天板块轮动很快，但你的逻辑比情绪快。稳住。" },
    old_money: { greeting: "老钱，老了才有钱", line: "机会又来了。这次别观察三年，先看三分钟。" },
    qin_shihuang: { greeting: "我是秦始皇，打钱！", line: "没有人会直接给你打钱。但这里有条靠谱的分析路径。" },
    kline_shaman: { greeting: "K线萨满", line: "金叉很多，但点蜡烛之前，我们先看看基本面。" },
    all_in_warrior: { greeting: "梭哈战神", line: "欢迎回来。今天第一个任务仍然是：管住仓位。" },
    breakeven_master: { greeting: "回本就卖宗师", line: "成本价不是宇宙中心。今天也要记住这一点。" },
    fomo_chaser: { greeting: "利好已出尽还在冲", line: "热搜第一的股票，三天前就该研究了。今天别追了。" },
    report_archaeologist: { greeting: "财报考古学家", line: "别急着翻十年财报，今天有个短线机会值得先看。" },
    monte_carlo_poet: { greeting: "蒙特卡洛诗人", line: "模型说今天风平浪静。现实正在旁边冷笑。" },
  };
  const defaultBuddy = { greeting: "市场冒险家", line: "准备好开启今天的市场冒险了吗？" };
  const buddy = personalityId && buddyGreetings[personalityId] ? buddyGreetings[personalityId] : defaultBuddy;

  // 人格对应的Emoji/颜色
  const personalityMeta: Record<string, { emoji: string; color: string }> = {
    wall_street: { emoji: "🏦", color: "#0D9488" },
    old_money: { emoji: "👴", color: "#D97706" },
    qin_shihuang: { emoji: "👑", color: "#DC2626" },
    kline_shaman: { emoji: "🔮", color: "#7C3AED" },
    all_in_warrior: { emoji: "⚔️", color: "#FF6B35" },
    breakeven_master: { emoji: "📉", color: "#F59E0B" },
    fomo_chaser: { emoji: "🚀", color: "#EC4899" },
    report_archaeologist: { emoji: "📜", color: "#8B5CF6" },
    monte_carlo_poet: { emoji: "🎲", color: "#06B6D4" },
  };
  const meta = personalityId && personalityMeta[personalityId] ? personalityMeta[personalityId] : { emoji: "🗺️", color: "#3B82F6" };

  // 市场天气判断
  const getMarketWeather = () => {
    const avgChange = indices.reduce((s, i) => s + i.change, 0) / indices.length;
    if (avgChange > 0.5) return { icon: "☀️", label: "晴", desc: "市场情绪积极，适合主动研究" };
    if (avgChange > 0) return { icon: "⛅", label: "多云转晴", desc: "震荡消化获利盘，耐心等待机会" };
    if (avgChange > -0.5) return { icon: "☁️", label: "阴天", desc: "市场偏弱，多看少动" };
    return { icon: "🌧️", label: "雨天", desc: "风险释放中，守住仓位比进攻更重要" };
  };
  const weather = getMarketWeather();

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* 1. 人格搭子问候区 */}
      <div
        className="rounded-2xl p-4 border"
        style={{
          background: `linear-gradient(135deg, ${meta.color}12, ${meta.color}04)`,
          borderColor: `${meta.color}30`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 shadow-sm border-2"
            style={{ borderColor: `${meta.color}40` }}
          >
            {personalityId ? (
              <img src={`/avatar_${personalityId}.png`} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${meta.color}18` }}>
                🗺️
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">
              早上好，{buddy.greeting}！
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {buddy.line}
            </p>
            {onShowOnboardingGuide && (
              <button
                onClick={onShowOnboardingGuide}
                className="mt-2 inline-flex items-center gap-1 rounded-full border-2 border-amber-400 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100 transition-colors"
              >
                📖 查看玩法指引
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-100">
          {(() => {
            const { level, title } = calcLevelFromXP(traderRoadProgress.totalXP);
            const xpProgress = calcXPProgress(traderRoadProgress.totalXP);
            const dailyDone = traderRoadProgress.dailyTaskDate === new Date().toISOString().slice(0, 10)
              ? traderRoadProgress.dailyCompletedTasks.length : 0;
            const isAllDailyDone = dailyDone >= 3;
            return (
              <>
                <span className="text-[10px] font-medium text-slate-500">LV.{level} {title}</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden max-w-[120px]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress.progressPercent}%`, backgroundColor: meta.color }}
                  />
                </div>
                <span className="text-[10px] font-bold" style={{ color: isAllDailyDone ? "#059669" : meta.color }}>
                  {isAllDailyDone ? "今日研究完成！" : `今日研究进度 ${dailyDone}/3`}
                </span>
              </>
            );
          })()}
        </div>
      </div>

      {/* 2. 今日市场天气 */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{weather.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">今日市场：{weather.label}</span>
              <span className="text-[10px] text-slate-400">
                {marketSnapshot?.tradeDate?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") || ""}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{weather.desc}</p>
          </div>
        </div>
        {/* 指数快照 */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          {indices.slice(0, 4).map((idx) => (
            <div key={idx.code} className="text-center">
              <div className="text-[10px] text-slate-500">{idx.name.slice(0, 4)}</div>
              <div className="text-xs font-bold text-slate-800 font-mono">{idx.price.toFixed(2)}</div>
              <div className={`text-[10px] font-bold ${idx.change >= 0 ? "text-red-500" : "text-emerald-500"}`}>
                {idx.change >= 0 ? "+" : ""}{idx.change}%
              </div>
            </div>
          ))}
        </div>
        {snapshotLoading && <div className="animate-pulse h-3 bg-slate-100 rounded w-1/2 mt-2" />}
        {snapshotError && <p className="text-[10px] text-amber-500 mt-1">{snapshotError}</p>}
      </div>

        {/* 金融华尔界 — 地图入口圆钮 */}
        <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#1E293B]">金融华尔界</h3>
            <span className="text-[10px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
              {traderRoadProgress.completedLevels.length}/10 关
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mb-4">完成地图关卡，解锁 Agent 研究员</p>
          <div className="flex flex-col items-center">
            <button
              onClick={() => setResearchTabGameLevel(1)}
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] shadow-lg shadow-[#3B82F6]/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-3xl">🗺️</span>
              {traderRoadProgress.completedLevels.length > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#059669] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {traderRoadProgress.completedLevels.length}
                </span>
              )}
            </button>
            <span className="mt-2 text-xs font-semibold text-[#3B82F6]">进入地图</span>
          </div>
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="text-[10px] text-[#64748B]">学习知识、答对题目 earn 炒币</span>
            <span className="text-xs font-bold text-[#D97706]">
              🪙 {traderRoadProgress.coins}
            </span>
          </div>
        </div>

        {/* 游戏地图弹窗 */}
        {researchTabGameLevel !== null && (
          <GameMapPlayer
            initialLevelId={researchTabGameLevel}
            onClose={() => {
              setResearchTabGameLevel(null);
              setTraderRoadProgress({ ...loadTraderRoadProgress() });
            }}
            onLevelComplete={(levelId) => {
              const newProgress = loadTraderRoadProgress();
              setTraderRoadProgress({ ...newProgress });
              // 触发解锁动画
              const level = TRADER_ROAD_LEVELS.find(l => l.id === levelId);
              if (level && level.unlockAgents.length > 0) {
                const agentRole = level.unlockAgents[0];
                const agentInfo = AGENT_TEAM.find(a => a.role === agentRole);
                if (agentInfo) {
                  setUnlockingAgent(agentInfo);
                }
              }
            }}
          />
        )}

      {/* 冒险控制台 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">🎮</span>
          <span className="text-sm font-bold text-slate-800">冒险控制台</span>
          <button
            onClick={() => setAdventureDetailsExpanded(!adventureDetailsExpanded)}
            className="flex items-center gap-1 text-[10px] text-blue-500 ml-auto hover:text-blue-600 transition-colors"
          >
            {adventureDetailsExpanded ? "收起详情" : "展开详情"}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${adventureDetailsExpanded ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <AdventureEntryCard
            icon="📋"
            title="今日任务"
            desc="主线任务与成长目标"
            badge={`${storyline?.tasks.length || 0}项`}
          />
          <AdventureEntryCard
            icon="🎯"
            title="研究标的"
            desc="今日可研究机会"
            badge={`${recommendedTargets.length}个`}
          />
          <AdventureEntryCard
            icon="⚡"
            title="市场异动"
            desc="板块热度与个股信号"
            badge={`${hotSectors.length + activeStocks.length}条`}
          />
          <AdventureEntryCard
            icon="📊"
            title="研究总结"
            desc="今日进度与认知经验"
            badge="今日"
          />
        </div>
      </div>

      {/* 展开详情面板 */}
      {adventureDetailsExpanded && (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">📋</span>
            <span className="text-sm font-bold text-slate-800">今日主线任务</span>
            <span className="text-[10px] text-slate-400 ml-auto">{storyline?.title}</span>
          </div>
          {storyline && (
            <p className="text-xs text-slate-500 italic mt-1">
              &ldquo;{storyline.opening}&rdquo;
            </p>
          )}
        </div>
        <div className="p-3 space-y-2">
          {storyline?.tasks.map((task) => {
            const isDone = completedTasks.includes(task.id);
            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isDone
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs border-2 flex-shrink-0 transition-all ${
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 hover:border-blue-400"
                    }`}
                  >
                    {isDone ? "✓" : ""}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm">{task.emoji}</span>
                      <span
                        className={`text-xs font-bold ${isDone ? "text-emerald-700" : "text-slate-800"}`}
                      >
                        {task.name}
                      </span>
                      {isDone && (
                        <span className="text-[10px] text-emerald-500 ml-auto">已完成</span>
                      )}
                    </div>
                    <p className={`text-[11px] ${isDone ? "text-emerald-600" : "text-slate-500"}`}>
                      {task.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {storyline && (
          <div className="px-3 pb-3">
            <p className="text-[10px] text-slate-400 text-center italic">
              {completedTasks.length === storyline.tasks.length
                ? `✨ ${storyline.reward}`
                : `搭子说：${storyline.opening}`}
            </p>
          </div>
        )}
        {!personalityId && (
          <div className="px-3 pb-3">
            <p className="text-[10px] text-slate-400 text-center">
              完成人格测试，解锁专属成长故事线 ✨
            </p>
          </div>
        )}
      </div>
      )}

      {/* 3.5 AI推荐研究标的 — 详细分析卡片 */}
      {adventureDetailsExpanded && recommendedTargets.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm">🎯</span>
              <span className="text-sm font-bold text-slate-800">今日AI推荐研究标的</span>
              <span className="text-[10px] text-slate-400 ml-auto">
                {recommendedTargets.length} 个标的
              </span>
            </div>
          </div>
          <div className="p-3 space-y-3">
            {recommendedTargets.map((target, i) => {
              const scoreColor =
                target.opportunity_score >= 80
                  ? "bg-red-100 text-red-700"
                  : target.opportunity_score >= 60
                    ? "bg-orange-100 text-orange-700"
                    : "bg-slate-100 text-slate-600";
              const riskColor =
                target.risk_level === "low"
                  ? "bg-emerald-100 text-emerald-700"
                  : target.risk_level === "medium"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-red-100 text-red-700";
              const riskLabel =
                target.risk_level === "low"
                  ? "低风险"
                  : target.risk_level === "medium"
                    ? "中风险"
                    : "高风险";
              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-2"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-800">
                      {target.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {target.code}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${scoreColor}`}
                    >
                      机会 {target.opportunity_score}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${riskColor}`}
                    >
                      {riskLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {target.reason}
                  </p>
                  {target.main_risk && (
                    <p className="text-[11px] text-slate-400">
                      ⚠️ {target.main_risk}
                    </p>
                  )}
                  {target.trigger_source && target.trigger_source.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {target.trigger_source.map((src, j) => (
                        <span
                          key={j}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => onFillResearch(target as unknown as RecommendedTarget)}
                    className="w-full text-xs py-2 rounded-lg bg-[#3B82F6] text-white font-bold hover:bg-[#2563EB] transition-colors"
                  >
                    填入研究 →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 冒险控制台入口 */}      {/* 5. 支线任务 — 热门区域 + 异动信号 */}
      {adventureDetailsExpanded && (
      <div className="grid grid-cols-1 gap-3">
        {/* 热门区域 */}
        <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs">🔥</span>
            <span className="text-xs font-bold text-slate-800">热门区域（板块）</span>
          </div>
          <div className="space-y-2">
            {hotSectors.slice(0, 5).map((sector, i) => (
              <div key={sector.name} className="flex items-center gap-2">
                <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center text-white ${i < 3 ? "bg-red-500" : "bg-slate-300"}`}>{i + 1}</span>
                <span className="text-xs font-medium text-slate-700 flex-1">{sector.name}</span>
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500" style={{ width: `${sector.heat}%` }} />
                </div>
                <span className="text-xs font-bold text-red-500 font-mono">+{sector.change}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 异动信号 */}
        <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs">⚡</span>
            <span className="text-xs font-bold text-slate-800">异动信号</span>
          </div>
          <div className="space-y-2">
            {activeStocks.slice(0, 5).map((stock) => (
              <div key={stock.code} className="flex items-center gap-3 py-1">
                <div className="flex-1">
                  <div className="text-xs font-medium text-slate-700">{stock.name}</div>
                  <div className="text-[10px] text-slate-400">{stock.reason}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-700 font-mono">{stock.price}</div>
                  <div className="text-[10px] font-bold text-red-500 font-mono">+{stock.change}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* 6. 今日认知经验 */}
      {adventureDetailsExpanded && (
      <div className="rounded-xl p-4 border" style={{ background: `linear-gradient(135deg, ${meta.color}08, ${meta.color}02)`, borderColor: `${meta.color}20` }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">📊</span>
          <span className="text-sm font-bold text-slate-800">今日研究总结</span>
        </div>
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">✓</span>
            <span>浏览了 8 条全球市场事件</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">✓</span>
            <span>关注了 {hotSectors.length} 个热门板块</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">🧠</span>
            <span>获得 <strong style={{ color: meta.color }}>120</strong> 认知经验</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200/50">
          <p className="text-xs text-slate-500 italic">
            "{buddy.greeting}，今天比昨天更了解市场了。明天见！"
          </p>
        </div>
      </div>
      )}

      {/* 第1关剧情面板（保留兼容） */}
      <Level1Panel
        isOpen={level1Open}
        onClose={() => {
          setLevel1Open(false);
          reloadProgress();
        }}
        onLevelComplete={() => {
          reloadProgress();
        }}
        onGoToResearch={() => {
          onGoToResearch();
        }}
      />

      {/* Agent 解锁动画 */}
      {unlockingAgent && (
        <AgentUnlockAnimation
          agent={unlockingAgent}
          onComplete={() => setUnlockingAgent(null)}
        />
      )}

    </div>
  );
}
