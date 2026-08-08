"use client";

import { useState, useEffect, useRef } from "react";
import { WORLD_MAP_PATHS } from "@/lib/world-map-paths";
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
  MOCK_GLOBAL_NEWS,
  TRADETI_QUESTIONS,
  calculateTradeTIResult,
} from "@/lib/mini-mock";

type TabId = "market" | "research" | "review" | "profile";

export default function MiniProgramPage() {
  const [activeTab, setActiveTab] = useState<TabId>("market");
  const [tradeTIUnlocked, setTradeTIUnlocked] = useState(false);
  const [tradeTICompleted, setTradeTICompleted] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
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
  const [selectedResearchTarget, setSelectedResearchTarget] = useState<RecommendedTarget | null>(null);

  // 水合安全：在 useEffect 中读取 localStorage
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
          setTradeTICompleted(true);
        }
      } catch { /* ignore */ }
    }
    setIsLoadingProfile(false);
  }, []);

  // tradeTI 通关
  const completeTradeTI = () => {
    setTradeTIUnlocked(true);
    setTradeTICompleted(true);
  };

  if (!tradeTICompleted && !isLoadingProfile) {
    return <TradeTITest onComplete={completeTradeTI} />;
  }

  if (isLoadingProfile) {
    return <TradeTITest onComplete={completeTradeTI} />;
  }

  if (tradeTICompleted && !tradeTIUnlocked) {
    return <TradeTITest onComplete={completeTradeTI} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col max-w-md mx-auto relative">
      {/* 状态栏模拟 */}
      <div className="bg-white px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
        <span>9:41</span>
        <span className="font-semibold text-sm text-slate-800">A股可视化投研Agent</span>
        <span>📶 </span>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto pb-16">
        {activeTab === "market" && (
          <MarketTab
            onFillResearch={(target) => {
              setSelectedResearchTarget(target);
              setActiveTab("research");
            }}
          />
        )}
        {activeTab === "research" && (
          <ResearchTab
            defaultStyle={(userProfile.recommended_style as InvestmentStyle) || "swing"}
            prefilledTarget={selectedResearchTarget}
            onClearPrefilled={() => setSelectedResearchTarget(null)}
          />
        )}
        {activeTab === "review" && <ModelTab />}
        {activeTab === "profile" && <ProfileTab profile={userProfile} tradeTIResult={tradeTIResult} onRetakeSurvey={() => {
              localStorage.removeItem("tradeti_state");
              localStorage.removeItem("user_profile_survey");
              localStorage.removeItem("sbti_result_v2");
              localStorage.removeItem("investment_style");
              localStorage.removeItem("completed_sbti_test");
              localStorage.removeItem("sbti_personality");
              setTradeTICompleted(false);
              setTradeTIUnlocked(false);
              setTradeTIResult(null);
            }} />}
      </div>

      {/* 底部 Tab 栏 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 flex">
        {[
          { id: "market" as TabId, label: "市场", icon: "📊" },
          { id: "research" as TabId, label: "研究", icon: "🔬" },
          { id: "review" as TabId, label: "模型", icon: "📊" },
          { id: "profile" as TabId, label: "我的", icon: "👤" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-colors ${
              activeTab === tab.id ? "text-blue-600" : "text-slate-500"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ===== 投资风格问卷 =====
// ===== SBTI 交易风格测试（多巴胺风格）=====
// ===== tradeTI 交易抽象人格测试 =====
type TradeTIScreen = "intro" | "questions" | "result" | "blocked";

function TradeTITest({ onComplete }: { onComplete: () => void }) {
  const [screen, setScreen] = useState<TradeTIScreen>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ question_id: number; type: "pass" | TradeTIPersonalityId }[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [resultPersonality, setResultPersonality] = useState<TradeTIPersonalityId | null>(null);
  const [resultPassScore, setResultPassScore] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [blockBtnClicked, setBlockBtnClicked] = useState<number | null>(null);

  const handleStart = () => setScreen("questions");

  const handleAnswer = (type: "pass" | TradeTIPersonalityId, idx: number) => {
    if (isTransitioning) return;
    const newAnswers = [...answers, { question_id: currentQ + 1, type }];
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
          setIsCalculating(false);
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
          if (result.is_unlocked) {
            setResultPersonality(result.personality_id);
            setResultPassScore(result.pass_score);
            setScreen("result");
          } else {
            setResultPersonality(result.personality_id);
            setResultPassScore(result.pass_score);
            setScreen("blocked");
          }
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
    setBlockBtnClicked(null);
    setScreen("intro");
  };

  const handleBlockBtn = (idx: number) => {
    setBlockBtnClicked(idx);
  };

  // ===== 首屏 =====
  if (screen === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8E1] to-white flex flex-col max-w-md mx-auto">
        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="text-center mb-10">
            <div className="text-6xl mb-4 animate-bounce">🏦</div>
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-[#FF6B35] via-[#FFD93D] to-[#00FF88] bg-clip-text text-transparent">tradeTI</h1>
            <p className="text-lg font-bold text-slate-700">交易抽象人格测试</p>
            <p className="text-xs text-slate-500 mt-1">Trade Type Indicator</p>
          </div>
          <div className="bg-white rounded-[24px] p-5 border-2 border-[#FFD93D] shadow-lg mb-6">
            <p className="text-sm text-slate-700 leading-relaxed font-bold">12道题，测出你是华尔街在逃交易员，还是市场需要重点保护的对象。</p>
          </div>
          <button onClick={handleStart} className="w-full py-4 rounded-2xl font-black text-white text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-lg" style={{ background: "linear-gradient(135deg, #FF6B35, #FF00FF, #00D4FF)" }}>开始测试 🔥</button>
          <button onClick={onComplete} className="w-full py-3 mt-3 rounded-2xl font-bold text-slate-500 text-sm border-2 border-slate-200 transition-all hover:border-slate-300 active:scale-95">跳过，直接进入 →</button>
          <p className="text-[10px] text-slate-400 text-center mt-4">本测试仅供娱乐和投资行为自省，不构成投资建议。</p>
        </div>
      </div>
    );
  }

  // ===== 计算中 =====
  if (isCalculating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8E1] to-white flex flex-col max-w-md mx-auto">
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mx-auto mb-6"><div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF6B35] via-[#FFD93D] to-[#00FF88] animate-spin" /><div className="absolute inset-1.5 rounded-full bg-white flex items-center justify-center text-3xl">🧬</div></div>
          <p className="text-base font-bold bg-gradient-to-r from-[#FF6B35] to-[#00FF88] bg-clip-text text-transparent text-center">正在解析你的交易人格...</p>
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
            <div className="text-6xl mb-3 animate-bounce">{p.emoji}</div>
            <h2 className="text-3xl font-black mb-2" style={{ color: p.color }}>{p.name}</h2>
            <div className="bg-[#0D9488]/10 rounded-2xl p-4 mb-4 border-2 border-[#0D9488]/20"><p className="text-sm text-slate-700 leading-relaxed">{p.description}</p></div>
            <p className="text-xs text-[#0D9488] font-bold">交易所门口没有你的通缉令，但市场已经注意到你了。</p>
            <p className="text-xs text-[#0D9488] font-bold mt-1">你已解锁完整A股可视化投研Agent。</p>
          </div>
          <button onClick={onComplete} className="w-full py-4 rounded-2xl font-black text-white text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-lg" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)` }}>进入完整功能区 🚀</button>
          <p className="text-[10px] text-slate-400 text-center mt-4">tradeTI仅供娱乐和投资行为自省，不构成投资建议。股票市场存在风险。</p>
        </div>
      </div>
    );
  }

  // ===== 拦截页 =====
  if (screen === "blocked" && resultPersonality) {
    const p = TRADETI_PERSONALITIES[resultPersonality];
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8E1] to-white flex flex-col max-w-md mx-auto">
        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 animate-bounce">{p.emoji}</div>
            <h2 className="text-3xl font-black mb-2" style={{ color: p.color }}>{p.name}</h2>
            <div className="bg-orange-50 rounded-2xl p-4 mb-3 border-2 border-orange-200"><p className="text-sm text-slate-700 leading-relaxed font-bold">{p.description}</p></div>
            <div className="bg-red-50 rounded-2xl p-4 border-2 border-red-200"><p className="text-xs text-red-600 font-bold mb-1">系统判断：当前暂不建议解锁完整投研功能。</p><p className="text-xs text-red-500">{p.block_reason}</p></div>
          </div>
          <div className="space-y-3 mb-4">
            {p.block_buttons.map((btn, i) => (
              <button key={i} onClick={() => handleBlockBtn(i)} className={`w-full py-3.5 rounded-2xl font-black text-white text-base transition-all hover:scale-[1.02] active:scale-95 shadow-lg ${blockBtnClicked === i ? "opacity-70 scale-95" : ""}`} style={{ background: i === 0 ? `linear-gradient(135deg, ${p.color}, ${p.color}cc)` : "linear-gradient(135deg, #64748B, #94A3B8)" }}>{blockBtnClicked === i ? "冷静是你今天最好的交易。" : btn}</button>
            ))}
          </div>
          {p.block_small_link && <button onClick={handleRetake} className="w-full text-center text-xs text-slate-400 hover:text-slate-600 py-2 transition-colors">{p.block_small_link}</button>}
          {!p.block_small_link && <button onClick={handleRetake} className="w-full py-3 rounded-2xl font-bold text-slate-500 text-sm border-2 border-slate-200 hover:bg-slate-50 transition-all">返回重测</button>}
          <p className="text-[10px] text-slate-400 text-center mt-4">tradeTI仅供娱乐和投资行为自省，不构成投资建议。股票市场存在风险。</p>
        </div>
      </div>
    );
  }

  // ===== 答题页 =====
  const question = TRADETI_QUESTIONS[currentQ];
  const dopamineColors = ["#FF6B35", "#FF00FF", "#FFD93D", "#00FF88"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E1] to-white flex flex-col max-w-md mx-auto">
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-xl font-black mb-2 bg-gradient-to-r from-[#FF6B35] via-[#FFD93D] to-[#00FF88] bg-clip-text text-transparent">tradeTI · 交易抽象人格测试</h1>
          <p className="text-xs text-slate-500 leading-relaxed">找到你的交易灵魂人格。只有真正的交易员才能通关。</p>
        </div>
        <div className="mb-6">
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full overflow-hidden ${i <= currentQ ? "bg-slate-200" : "bg-slate-100"}`}>
                {i <= currentQ && <div className="h-full bg-gradient-to-r from-[#FF6B35] via-[#FFD93D] to-[#00FF88] rounded-full" style={{ animation: "shimmer 2s infinite", backgroundSize: "200% 100%" }} />}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 font-bold">问题 {currentQ + 1} / 12</p>
        </div>
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 mb-4">{question.question_text}</h2>
          {question.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const color = dopamineColors[idx % 4];
            return (
              <button key={idx} onClick={() => handleAnswer(opt.type, idx)} disabled={isTransitioning}
                className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 ${isTransitioning && !isSelected ? "opacity-40 scale-[0.98]" : ""} ${isSelected ? "scale-[1.03] shadow-lg" : "hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95"}`}
                style={{ background: isSelected ? `${color}20` : `${color}08`, borderColor: isSelected ? color : `${color}40`, borderWidth: isSelected ? "3px" : "2px" }}>
                <div className="flex items-center gap-2">{isSelected && <span className="text-lg animate-bounce">👆</span>}<span className="text-sm font-bold text-slate-800">{opt.text}</span></div>
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
}: {
  defaultStyle: InvestmentStyle;
  prefilledTarget: RecommendedTarget | null;
  onClearPrefilled: () => void;
}) {
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
        setContextError(`查询太频繁，请稍后再试（${data.retryAfterSeconds || 60}秒后可重试）。`);
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
        return;
      }

      const stepInfo = WORKFLOW_STEPS[step];
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
        <div className="bg-white rounded-lg p-4 border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">开始研究</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">股票/板块</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="输入股票代码或名称"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
              {prefilledTarget && (
                <p className="text-[10px] text-blue-600 mt-1">
                  已从今日AI推荐研究标的填入：{prefilledTarget.name} {prefilledTarget.code}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">投资风格</label>
              <div className="flex gap-2">
                {(["short", "swing", "long"] as InvestmentStyle[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                      style === s
                        ? "bg-blue-50 border-blue-500 text-blue-600"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {s === "short" ? "短线" : s === "swing" ? "波段" : "长期"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">研究周期</label>
              <div className="flex gap-2">
                {[
                  { value: "short", label: style === "short" ? "5日" : style === "swing" ? "2周" : "6月" },
                  { value: "medium", label: style === "short" ? "10日" : style === "swing" ? "1月" : "1年" },
                  { value: "long", label: style === "short" ? "20日" : style === "swing" ? "3月" : "3年" },
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                      period === p.value
                        ? "bg-blue-50 border-blue-500 text-blue-600"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={startResearch}
              disabled={!target.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              开始研究
            </button>
          </div>
        </div>

        {/* Agent 团队展示 - 未来感升级 */}
        <div className="bg-white rounded-lg p-4 border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Agent 研究团队</h3>
          <div className="grid grid-cols-3 gap-2">
            {AGENT_TEAM.map((agent) => (
              <div key={agent.role} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-700">
                <span className="text-lg">{agent.icon}</span>
                <div>
                  <div className="text-[10px] font-medium text-blue-400">{agent.name}</div>
                  <div className="text-[10px] text-slate-300 font-medium">{agent.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* 16 步进度条 - 未来感升级 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800">研究进度</h3>
          <span className="text-xs text-slate-500">{currentStep}/16</span>
        </div>
        {/* 进度条 - 网格线风格 */}
        <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / 16) * 100}%` }}
          />
          {/* 网格线 */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 6.25%, rgba(255,255,255,0.3) 6.25%, rgba(255,255,255,0.3) 6.5%)",
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
            {stockContext.dataQuality.missing.length > 0 && <span className="text-amber-600">缺失: {stockContext.dataQuality.missing.join(", ")}</span>}
          </div>
        )}
        <div className="mt-3 grid grid-cols-4 gap-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`text-[10px] px-1.5 py-1 rounded text-center transition-colors ${
                step.status === "completed"
                  ? "bg-emerald-50 text-emerald-600"
                  : step.status === "active"
                  ? "bg-blue-50 text-blue-600 animate-pulse"
                  : "bg-slate-50 text-slate-600"
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
          <AgentCard key={i} response={resp} />
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
          <button className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg">
            一键创建复盘任务
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setCurrentStep(0);
              setTarget("");
              setResponses([]);
              setSteps(WORKFLOW_STEPS.map((s) => ({ ...s, status: "pending" as StepStatus })));
              onClearPrefilled();
            }}
            className="w-full py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            重新选择标的
          </button>
          <p className="text-[10px] text-center text-slate-500">
            以上内容仅供研究参考，不构成投资建议。
          </p>
        </div>
      )}
    </div>
  );
}

// Agent 分析卡片组件
function AgentCard({ response }: { response: AgentResponse }) {
  const agent = AGENT_TEAM.find((a) => a.role === response.agent);

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{agent?.icon}</span>
        <div>
          <div className="text-xs font-semibold text-slate-700">{agent?.name}</div>
          <div className="text-[10px] text-slate-500">第 {response.step} 步 · {agent?.title}</div>
        </div>
      </div>
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

      {/* 因子库 - 未来感网格风格 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">因子库</h3>
        <div className="space-y-2">
          {FACTOR_LIBRARY.map((group) => (
            <div key={group.group} className="border border-slate-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedFactorGroup(expandedFactorGroup === group.group ? null : group.group)}
                className="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span className="text-xs font-medium text-slate-700">{group.group}</span>
                <svg
                  className={`w-3 h-3 text-slate-400 transition-transform ${expandedFactorGroup === group.group ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedFactorGroup === group.group && (
                <div className="p-2 bg-slate-900 border-t border-slate-700">
                  <div className="grid grid-cols-2 gap-1">
                    {group.metrics.map((factor) => (
                      <button
                        key={factor}
                        onClick={() => toggleFactor(factor)}
                        className={`text-[10px] px-2 py-1 rounded transition-colors ${
                          isFactorSelected(factor)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {factor}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 因子选择区 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">因子选择</h3>
          <span className="text-[10px] text-slate-500">已选 {selectedFactors.length} 个</span>
        </div>
        <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
          你可以选择自己信任的因子，系统会随机抽取10只股票进行拟合测试。因子越多不一定越好，过多因子可能导致过拟合。
        </p>

        <div className="space-y-2">
          {FACTOR_LIBRARY.map((group) => (
            <div key={group.group} className="border border-slate-100 rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                onClick={() => setExpandedFactorGroup(expandedFactorGroup === group.group ? null : group.group)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700">{group.group}</span>
                  <span className="text-[10px] text-slate-500">{group.metrics.length}个指标</span>
                </div>
                <svg
                  className={`w-3 h-3 text-slate-400 transition-transform ${expandedFactorGroup === group.group ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedFactorGroup === group.group && (
                <div className="p-3 space-y-2 bg-white">
                  <p className="text-[10px] text-slate-500 mb-2">{group.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.metrics.map((metric) => (
                      <button
                        key={metric}
                        className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                          isFactorSelected(metric)
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                        onClick={() => toggleFactor(metric)}
                      >
                        {isFactorSelected(metric) ? "✓ " : ""}{metric}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 text-[10px] py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            onClick={handleUseRecommended}
          >
            使用推荐因子组合
          </button>
          <button
            className="flex-1 text-[10px] py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={handleStartTest}
            disabled={isTesting || selectedFactors.length === 0}
          >
            {isTesting ? "测试中..." : "开始拟合测试"}
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
function ProfileTab({ profile, tradeTIResult, onRetakeSurvey }: { profile: UserProfileSurvey; tradeTIResult: TradeTIState | null; onRetakeSurvey: () => void }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const feedbackQuestions = [
    "数据是否足够及时？",
    "推荐研究标的是否有帮助？",
    "AI 解释是否容易理解？",
    "风险提示是否充分？",
    "页面操作是否顺手？",
    "你是否愿意继续使用这个工具？",
  ];

  const toggleIssue = (q: string) => {
    setSelectedIssues((prev) => prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]);
  };

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
          selectedIssues,
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
      {/* 用户信息 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
            Y
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">投资者</div>
            <div className="text-xs text-slate-500">
              默认风格：{profile.recommended_style === "short" ? "短线" : profile.recommended_style === "swing" ? "波段" : "长期"}
            </div>
          </div>
        </div>
      </div>

      {/* tradeTI 交易人格 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">tradeTI 交易抽象人格</h3>
        {tradeTIResult && tradeTIResult.result_type ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{TRADETI_PERSONALITIES[tradeTIResult.result_type]?.emoji || "🎭"}</span>
              <span className="text-sm font-bold text-slate-800">{TRADETI_PERSONALITIES[tradeTIResult.result_type]?.name || tradeTIResult.result_type}</span>
              {tradeTIResult.is_unlocked && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] font-bold">已通关</span>}
            </div>
            <p className="text-xs text-slate-500">{TRADETI_PERSONALITIES[tradeTIResult.result_type]?.description}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 mb-3">尚未完成测试</p>
        )}
        <button onClick={onRetakeSurvey} className="w-full mt-3 py-2 text-xs text-[#FF6B35] bg-[#FFF8E1] rounded-lg hover:bg-[#FFD93D]/20 transition-colors font-bold">🔄 重新测试</button>
      </div>

      {/* 关注股票 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">我的关注</h3>
        <div className="space-y-2">
          {["北方华创 002371", "中芯国际 688981", "比亚迪 002594"].map((stock) => (
            <div key={stock} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-xs text-slate-700">{stock}</span>
              <button className="text-[10px] text-blue-600">查看研究</button>
            </div>
          ))}
        </div>
      </div>

      {/* 历史档案 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">历史研究档案</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-mono font-bold text-slate-800">28</div>
            <div className="text-[10px] text-slate-500">总研究数</div>
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-blue-600">68%</div>
            <div className="text-[10px] text-slate-500">方向准确率</div>
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-emerald-600">52%</div>
            <div className="text-[10px] text-slate-500">区间命中率</div>
          </div>
        </div>
      </div>

      {/* 用户反馈 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <button
          onClick={() => { setFeedbackOpen(!feedbackOpen); if (!feedbackOpen) setSubmitted(false); }}
          className="w-full flex items-center justify-between"
        >
          <h3 className="text-sm font-semibold text-slate-800">💬 用户反馈</h3>
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
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-2">请评价以下问题（可多选）：</p>
                  <div className="space-y-1.5">
                    {feedbackQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => toggleIssue(q)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          selectedIssues.includes(q)
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100"
                        }`}
                      >
                        {selectedIssues.includes(q) ? "✅" : "○"} {q}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-1.5">总体评分：</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRating(n)}
                        className={`w-10 h-10 rounded-lg text-lg font-bold transition-all ${
                          n <= rating
                            ? "bg-blue-500 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {n}
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
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none h-20"
                  />
                  <p className="text-[10px] text-slate-400 text-right">{comment.length}/1000</p>
                </div>
                {submitError && <p className="text-xs text-red-500 font-bold">{submitError}</p>}
                <button
                  onClick={handleSubmitFeedback}
                  disabled={rating < 1 || submitting}
                  className="w-full py-2.5 text-sm font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
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
    </div>
  );
}

// ===== 市场 Tab =====
function MarketTab({ onFillResearch }: { onFillResearch: (target: RecommendedTarget) => void }) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [marketSnapshot, setMarketSnapshot] = useState<MiniMarketSnapshot | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(true);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

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

  const handleSelectEvent = (country: string) => {
    setSelectedCountry(country);
  };

  const selectedEvent = selectedCountry ? MOCK_GLOBAL_NEWS.find((e) => e.country === selectedCountry) : null;

  const summary = marketSnapshot?.summary || mockMarketData.summary;
  const indices = marketSnapshot?.indices?.length ? marketSnapshot.indices : mockMarketData.indices;
  const hotSectors = marketSnapshot?.hotSectors?.length ? marketSnapshot.hotSectors : mockMarketData.hotSectors;
  const activeStocks = marketSnapshot?.activeStocks?.length ? marketSnapshot.activeStocks : mockMarketData.activeStocks;
  const recommendedTargets: MiniRecommendedTarget[] = marketSnapshot?.recommendedTargets?.length
    ? marketSnapshot.recommendedTargets
    : mockRecommendedTargets;
  const events = marketSnapshot?.events?.length ? marketSnapshot.events : mockMarketData.events;

  return (
    <div className="p-4 space-y-4">
      {/* AI 摘要 */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-semibold">今日市场 AI 摘要</span>
          {marketSnapshot && (
            <span className="ml-auto text-[10px] opacity-70">
              {marketSnapshot.tradeDate} {marketSnapshot.stale ? "(缓存)" : ""}
            </span>
          )}
        </div>
        {snapshotLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-white/30 rounded w-3/4" />
            <div className="h-3 bg-white/30 rounded w-1/2" />
          </div>
        ) : (
          <p className="text-xs leading-relaxed opacity-90">{summary}</p>
        )}
        {snapshotError && <p className="text-[10px] mt-1 opacity-70">{snapshotError}，使用演示数据</p>}
      </div>

      {/* 全球新闻雷达 */}
      <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
        <div className="p-3 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-800">全球新闻雷达</span>
            <span className="text-[10px] text-slate-400">Demo 数据，仅用于产品演示，不代表实时新闻。</span>
          </div>
          <p className="text-[10px] text-slate-500">追踪全球宏观、政策、科技、商品与地缘事件对A股的潜在影响</p>
        </div>

      {/* 世界地图 - 未来感网格风格 */}
      <div className="relative bg-slate-950 h-[280px] overflow-hidden">
        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* 真实世界地图轮廓 - 网格线风格 */}
        <svg viewBox="0 0 360 180" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g fill="none" stroke="#3B82F6" strokeWidth="0.5" opacity="0.6" filter="url(#glow)">
            {WORLD_MAP_PATHS.map((path, i) => (
              <path key={i} d={path} />
            ))}
          </g>
        </svg>

        {/* 扫描线动画 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.1) 50%, transparent 100%)",
            animation: "scan 3s linear infinite",
          }}
        />

          {/* 闪光点 - 脉冲动画 */}
          {MOCK_GLOBAL_NEWS.map((event) => {
            // 将经纬度转换为地图坐标 (匹配新的SVG viewBox 360x180)
            const x = ((event.lng + 180) / 360) * 360;
            const y = ((90 - event.lat) / 180) * 180;
            const isSelected = selectedCountry === event.country;
            const isDimmed = selectedCountry && !isSelected;

            const colorMap: Record<string, string> = {
              red: "#DC2626",
              blue: "#3B82F6",
              orange: "#F59E0B",
              green: "#10B981",
              purple: "#8B5CF6",
            };
            const dotColor = colorMap[event.pulse_color] || "#3B82F6";
            const dotSize = event.importance === "高" ? 12 : event.importance === "中" ? 8 : 6;

            return (
              <button
                key={event.country_code}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isDimmed ? "opacity-30" : "opacity-100"}`}
                style={{ left: `${(x / 360) * 100}%`, top: `${(y / 180) * 100}%` }}
                onClick={() => handleSelectEvent(event.country)}
              >
                {/* 脉冲动画 */}
                <span
                  className={`absolute inset-0 rounded-full ${isSelected ? "animate-ping" : "animate-pulse"}`}
                  style={{
                    backgroundColor: dotColor,
                    width: dotSize * 2,
                    height: dotSize * 2,
                    marginLeft: -(dotSize * 2 - dotSize) / 2,
                    marginTop: -(dotSize * 2 - dotSize) / 2,
                    opacity: 0.4,
                  }}
                />
                {/* 中心点 */}
                <span
                  className="relative block rounded-full border-2 border-white shadow-lg"
                  style={{
                    backgroundColor: dotColor,
                    width: dotSize,
                    height: dotSize,
                  }}
                />
              </button>
            );
          })}

          {/* 选中国家标签 */}
          {selectedEvent && (
            <div className="absolute top-2 left-2 bg-slate-800/90 backdrop-blur-sm rounded px-2 py-1 text-[10px] text-white">
              {selectedEvent.country} · {selectedEvent.category}
            </div>
          )}
        </div>

        {/* 新闻卡片 */}
        {selectedEvent && (
          <div className="p-3 border-t border-slate-100 bg-slate-50">
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-800">{selectedEvent.country}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">{selectedEvent.category}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    selectedEvent.importance === "高" ? "bg-red-100 text-red-700" :
                    selectedEvent.importance === "中" ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>{selectedEvent.importance}</span>
                </div>
                <h4 className="text-xs font-medium text-slate-800 mb-1">{selectedEvent.title}</h4>
                <p className="text-[10px] text-slate-600 leading-relaxed mb-2">{selectedEvent.summary}</p>
              </div>
            </div>

            <div className="space-y-1.5 mb-2">
              <div>
                <span className="text-[10px] text-slate-500">可能影响A股：</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {selectedEvent.related_a_share_sectors.map((sector) => (
                    <span key={sector} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{sector}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">影响逻辑：</span>
                <span className="text-[10px] text-slate-700">{selectedEvent.impact_logic}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-600">风险提示：</span>
                <span className="text-[10px] text-slate-700">{selectedEvent.risk_note}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 text-[10px] py-1.5 rounded bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors">
                查看影响板块
              </button>
            </div>
          </div>
        )}

        {/* 今日全球事件列表 */}
        <div className="p-3 border-t border-slate-100">
          <h4 className="text-[10px] font-semibold text-slate-600 mb-2">今日全球事件</h4>
          <div className="space-y-1.5">
            {MOCK_GLOBAL_NEWS.map((event) => (
              <button
                key={event.country_code}
                className={`w-full text-left p-2 rounded border transition-colors ${
                  selectedCountry === event.country
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-100 hover:bg-slate-50"
                }`}
                onClick={() => handleSelectEvent(event.country)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-slate-700">{event.country}</span>
                  <span className="text-[10px] text-slate-500">|</span>
                  <span className="text-[10px] text-slate-600 truncate flex-1">{event.title}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  影响：{event.related_a_share_sectors.slice(0, 3).join("、")}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 指数卡片 */}
      <div className="grid grid-cols-2 gap-2">
        {indices.map((idx) => (
          <div key={idx.code} className="bg-white rounded-lg p-3 border border-slate-100">
            <div className="text-xs text-slate-500 mb-1">{idx.name}</div>
            <div className="text-lg font-mono font-bold text-slate-800">{idx.price.toFixed(2)}</div>
            <div className={`text-xs font-mono ${idx.change >= 0 ? "text-red-600" : "text-emerald-600"}`}>
              {idx.change >= 0 ? "+" : ""}{idx.change}%
            </div>
          </div>
        ))}
      </div>

      {/* 板块热度榜 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">板块热度榜</h3>
        <div className="space-y-2">
          {hotSectors.map((sector, i) => (
            <div key={sector.name} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-4">{i + 1}</span>
              <span className="text-xs font-medium text-slate-700 flex-1">{sector.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${sector.heat}%` }} />
                </div>
                <span className="text-xs font-mono text-red-600">+{sector.change}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 个股异动榜 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">个股异动榜</h3>
        <div className="space-y-2">
          {activeStocks.map((stock) => (
            <div key={stock.code} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
              <div className="flex-1">
                <div className="text-xs font-medium text-slate-700">{stock.name}</div>
                <div className="text-[10px] text-slate-500">{stock.reason}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-slate-700">{stock.price}</div>
                <div className="text-xs font-mono text-red-600">+{stock.change}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 今日AI推荐研究标的 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">今日AI推荐研究标的</h3>
          <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Demo数据</span>
        </div>
        <div className="space-y-3">
          {recommendedTargets.map((target) => (
            <div key={target.code} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold text-slate-800">{target.name}</span>
                  <span className="text-xs text-slate-500 ml-2">{target.code}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${
                  target.recommended_style === "short" ? "bg-red-50 text-red-600" :
                  target.recommended_style === "swing" ? "bg-blue-50 text-blue-600" :
                  "bg-purple-50 text-purple-600"
                }`}>
                  {target.recommended_style === "short" ? "短线" : target.recommended_style === "swing" ? "波段" : "长期"}
                </span>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">机会评分</span>
                  <span className="text-sm font-mono font-bold text-blue-600">{target.opportunity_score}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">风险</span>
                  <span className={`text-xs ${
                    target.risk_level === "高" ? "text-red-600" :
                    target.risk_level === "中" ? "text-amber-600" : "text-emerald-600"
                  }`}>{target.risk_level}</span>
                </div>
                <span className="text-[10px] text-slate-500">{target.industry}</span>
              </div>
              <p className="text-xs text-slate-600 mb-1">{target.reason}</p>
              <p className="text-[10px] text-red-500 mb-2">风险：{target.main_risk}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {target.trigger_source.map((src) => (
                  <span key={src} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{src}</span>
                ))}
              </div>
              <button
                onClick={() => onFillResearch(target as unknown as RecommendedTarget)}
                className="w-full py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                填入研究
              </button>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-3 text-center">
          Demo数据，仅用于产品演示，不代表实时行情。
        </p>
      </div>

      {/* 事件时间轴 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">重要事件</h3>
        <div className="space-y-3">
          {events.map((event, i) => (
            <div key={i} className="flex gap-3">
              <div className="text-xs text-slate-500 w-10 font-mono">{event.time}</div>
              <div className="flex-1">
                <div className="text-xs text-slate-700">{event.title}</div>
                <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded ${
                  event.impact === "positive" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                }`}>
                  {event.impact === "positive" ? "利好" : "利空"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
