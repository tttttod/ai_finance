"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  Send,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Building2,
  BarChart3,
  Target,
  AlertTriangle,
  BookOpen,
  Lightbulb,
  Shield,
  Eye,
  Clock,
  Database,
  GitBranch,
  User,
} from "lucide-react";
import type {
  AnalysisStep,
  StrategyViewpoint,
  IndustryCandidate,
  StockCandidate,
  AnalysisHypothesis,
  RiskFactor,
  ChatMessage,
} from "@/lib/analysis-types";
import {
  mockStrategyViewpoints,
  mockIndustryCandidates,
  mockStockCandidates,
  mockHypotheses,
  mockRisks,
} from "@/lib/analysis-data";

const STEP_LABELS: { step: AnalysisStep; label: string; icon: React.ReactNode }[] = [
  { step: "step1_strategy", label: "策略观点", icon: <Lightbulb className="w-4 h-4" /> },
  { step: "step2_industry", label: "行业筛选", icon: <Building2 className="w-4 h-4" /> },
  { step: "step3_data", label: "深度分析", icon: <BarChart3 className="w-4 h-4" /> },
  { step: "step4_stock", label: "标的推荐", icon: <Target className="w-4 h-4" /> },
];

const STORAGE_KEY = "ai-analysis-session";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* empty */
  }
  return null;
}

function saveSession(data: unknown) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* empty */
  }
}

export default function AnalysisPage() {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedViewpoints, setSelectedViewpoints] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [investmentStyle, setInvestmentStyle] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState("moderate");
  const [holdingPeriod, setHoldingPeriod] = useState("medium");
  const [streamingContent, setStreamingContent] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState("");

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setCurrentStep(saved.currentStep || "idle");
      setMessages(saved.messages || []);
      setSelectedViewpoints(saved.stepResults?.selectedViewpoints || []);
      setSelectedIndustries(saved.stepResults?.selectedIndustries || []);
      setInvestmentStyle(saved.userPreferences?.investmentStyle || []);
      setRiskTolerance(saved.userPreferences?.riskTolerance || "moderate");
      setHoldingPeriod(saved.userPreferences?.holdingPeriod || "medium");
    } else {
      setMessages([
        {
          id: generateId(),
          role: "assistant",
          content:
            "你好！我是你的 AI 投研分析师。我将引导你完成一次完整的基本面分析流程：\n\n1. **获取策略研报观点** - 了解市场主流看法\n2. **筛选看好行业** - 结合宏观与策略找出机会\n3. **深度行业分析** - 构建证据链，评估风险\n4. **推荐投资标的** - 输出完整分析报告\n\n在每一步我都会与你确认，了解你的投资偏好。准备好开始了吗？",
          timestamp: new Date().toISOString(),
          step: "idle",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    saveSession({
      currentStep,
      messages,
      userPreferences: { investmentStyle, riskTolerance, holdingPeriod },
      stepResults: { selectedViewpoints, selectedIndustries },
    });
  }, [currentStep, messages, investmentStyle, riskTolerance, holdingPeriod, selectedViewpoints, selectedIndustries]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const addAssistantMessage = useCallback(
    (content: string, step?: AnalysisStep) => {
      const msg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
        step,
      };
      setMessages((prev) => [...prev, msg]);
    },
    []
  );

  const handleStart = () => {
    setCurrentStep("step1_strategy");
    addAssistantMessage(
      "好的，让我们开始第一步：**获取策略研报观点**。\n\n我整理了近期 4 份核心策略研报的主要观点，请在左侧查看。看完后告诉我你对哪些方向更感兴趣？",
      "step1_strategy"
    );
  };

  const handleConfirmStep1 = () => {
    if (selectedViewpoints.length === 0) {
      addAssistantMessage("请至少在左侧选择一个你感兴趣的方向，我们再继续。");
      return;
    }
    setCurrentStep("step1_confirm");
    addAssistantMessage(
      "收到！你选择了 " + selectedViewpoints.length + " 个感兴趣的方向。接下来进入第二步：**筛选看好行业**。\n\n我结合了策略研报和宏观研报，筛选出 4 个近期被看好的行业候选，请在左侧查看。每个行业都附有支持证据、反对证据和待验证项。\n\n另外，在继续之前我想了解一下你的投资偏好：\n- **投资风格**：你偏好成长、价值、红利还是周期？\n- **风险承受**：保守、稳健还是激进？\n- **持仓周期**：短线、中线还是长线？",
      "step2_industry"
    );
  };

  const handleConfirmStep2 = () => {
    if (selectedIndustries.length === 0) {
      addAssistantMessage("请至少在左侧选择一个你想深入分析的行业。");
      return;
    }
    setCurrentStep("step2_confirm");
    addAssistantMessage(
      "很好！你选择了 " + selectedIndustries.length + " 个行业进行深度分析。进入第三步：**行业深度数据分析**。\n\n我对每个选定行业进行了多维度分析：资金流向、机构覆盖、技术信号、景气度评估。同时构建了完整的证据链和风险评估。请在左侧查看。\n\n看完后告诉我：你认同这些行业的投资逻辑吗？有哪些风险点是你特别关注的？",
      "step3_data"
    );
  };

  const handleConfirmStep3 = () => {
    setCurrentStep("step3_confirm");
    addAssistantMessage(
      "明白了！进入最后一步：**推荐投资标的**。\n\n基于前面的分析，我筛选出了具体的投资标的，每个标的都包含：\n- 核心推荐理由\n- 风险因素\n- 机构目标价与潜在空间\n- 完整的投资假设（含观察指标和失效条件）\n\n请在左侧查看完整分析报告。",
      "step4_stock"
    );
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep("idle");
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: "分析已重置。准备好开始新的分析流程了吗？点击「开始分析」按钮，我们重新开始。",
        timestamp: new Date().toISOString(),
        step: "idle",
      },
    ]);
    setSelectedViewpoints([]);
    setSelectedIndustries([]);
    setInvestmentStyle([]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          context: {
            currentStep,
            selectedViewpoints,
            selectedIndustries,
            investmentStyle,
            riskTolerance,
            holdingPeriod,
          },
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              setStreamingContent(fullContent);
            }
          } catch {
            /* empty */
          }
        }
      }

      setStreamingContent("");
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: fullContent,
        timestamp: new Date().toISOString(),
        step: currentStep,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setStreamingContent("");
      addAssistantMessage("抱歉，连接出现了问题，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStyle = (style: string) => {
    setInvestmentStyle((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const toggleViewpoint = (id: string) => {
    setSelectedViewpoints((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleIndustry = (id: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const currentStepIndex = STEP_LABELS.findIndex((s) => s.step === currentStep);

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
        {/* Progress Steps */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#0d1220] border border-[rgba(59,130,246,0.15)]">
          {STEP_LABELS.map((s, i) => (
            <div key={s.step} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                  i < currentStepIndex
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : i === currentStepIndex
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse-subtle"
                    : "bg-white/5 text-slate-500 border border-white/5"
                }`}
              >
                {i < currentStepIndex ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.icon}
                {s.label}
              </div>
              {i < STEP_LABELS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
            </div>
          ))}
          <div className="ml-auto flex gap-2">
            {currentStep === "idle" && (
              <button onClick={handleStart} className="px-4 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                开始分析
              </button>
            )}
            {currentStep === "step1_strategy" && (
              <button onClick={handleConfirmStep1} className="px-4 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                确认选择，进入下一步
              </button>
            )}
            {currentStep === "step2_industry" && (
              <button onClick={handleConfirmStep2} className="px-4 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                确认选择，进入下一步
              </button>
            )}
            {currentStep === "step3_data" && (
              <button onClick={handleConfirmStep3} className="px-4 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                确认分析，查看标的
              </button>
            )}
            {(currentStep === "step4_stock" || currentStep === "completed") && (
              <button onClick={handleReset} className="px-4 py-1.5 rounded-md text-xs font-medium bg-white/10 text-slate-300 hover:bg-white/15 transition-all duration-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                重新开始
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {currentStep === "idle" && <IdlePanel onStart={handleStart} />}
          {(currentStep === "step1_strategy" || currentStep === "step1_confirm") && (
            <StrategyPanel viewpoints={mockStrategyViewpoints} selected={selectedViewpoints} onToggle={toggleViewpoint} />
          )}
          {(currentStep === "step2_industry" || currentStep === "step2_confirm") && (
            <IndustryPanel
              industries={mockIndustryCandidates}
              selected={selectedIndustries}
              onToggle={toggleIndustry}
              investmentStyle={investmentStyle}
              riskTolerance={riskTolerance}
              holdingPeriod={holdingPeriod}
              onStyleToggle={toggleStyle}
              onRiskChange={setRiskTolerance}
              onHoldingChange={setHoldingPeriod}
            />
          )}
          {(currentStep === "step3_data" || currentStep === "step3_confirm") && (
            <DataPanel
              industries={mockIndustryCandidates.filter((i) => selectedIndustries.includes(i.id))}
              hypotheses={mockHypotheses}
              risks={mockRisks}
              activePanel={activePanel}
              onSetActive={setActivePanel}
            />
          )}
          {(currentStep === "step4_stock" || currentStep === "completed") && (
            <StockPanel stocks={mockStockCandidates} hypotheses={mockHypotheses} risks={mockRisks} />
          )}
        </div>
      </div>

      {/* Right Panel - AI Chat */}
      <div className="w-[420px] flex flex-col rounded-lg bg-[#0d1220] border border-[rgba(59,130,246,0.15)] overflow-hidden flex-shrink-0">
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">AI 投研分析师</div>
            <div className="text-xs text-slate-500">基本面分析助手</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500">在线</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "bg-blue-500/20 text-blue-100 border border-blue-500/30" : "bg-white/5 text-slate-300 border border-white/5"}`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed bg-white/5 text-slate-300 border border-white/5">
                <div className="whitespace-pre-wrap">{streamingContent}</div>
                <span className="inline-block w-1.5 h-4 bg-blue-400 ml-0.5 animate-blink align-middle" />
              </div>
            </div>
          )}
          {isLoading && !streamingContent && (
            <div className="flex justify-start">
              <div className="rounded-lg px-3.5 py-2.5 bg-white/5 border border-white/5">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="输入你的想法或问题..."
              className="flex-1 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} className="px-3 py-2 rounded-md bg-gradient-to-r from-blue-500 to-cyan-400 text-white disabled:opacity-40 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-2 text-center">仅供参考，不构成投资建议</p>
        </div>
      </div>
    </div>
  );
}

function IdlePanel({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 border border-blue-500/30 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-blue-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-200 mb-2">AI 基本面分析工作台</h2>
      <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
        通过 4 步结构化流程，结合策略研报、宏观分析、行业数据和个股筛选，
        为你生成完整的投资分析报告。每一步都可交互确认。
      </p>
      <button onClick={onStart} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
        开始分析
      </button>
    </div>
  );
}

function StrategyPanel({ viewpoints, selected, onToggle }: { viewpoints: StrategyViewpoint[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-slate-200">策略研报观点</h3>
        <span className="text-xs text-slate-500 ml-auto">点击选择感兴趣的方向</span>
      </div>
      {viewpoints.map((vp) => (
        <div key={vp.id} onClick={() => onToggle(vp.id)} className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${selected.includes(vp.id) ? "bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5" : "bg-[#0d1220] border-white/5 hover:border-blue-500/20"}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selected.includes(vp.id) ? "bg-blue-500 border-blue-500" : "border-white/20"}`}>
              {selected.includes(vp.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${vp.direction === "bullish" ? "bg-red-500/20 text-red-400" : vp.direction === "bearish" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                  {vp.direction === "bullish" ? "看多" : vp.direction === "bearish" ? "看空" : "中性"}
                </span>
                <span className="text-xs text-slate-500">{vp.source}</span>
              </div>
              <h4 className="text-sm font-medium text-slate-200 mb-2">{vp.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">{vp.summary}</p>
              <div className="flex flex-wrap gap-1.5">
                {vp.relatedIndustries.map((ind) => (
                  <span key={ind} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-400 border border-white/5">{ind}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function IndustryPanel({ industries, selected, onToggle, investmentStyle, riskTolerance, holdingPeriod, onStyleToggle, onRiskChange, onHoldingChange }: { industries: IndustryCandidate[]; selected: string[]; onToggle: (id: string) => void; investmentStyle: string[]; riskTolerance: string; holdingPeriod: string; onStyleToggle: (s: string) => void; onRiskChange: (r: string) => void; onHoldingChange: (h: string) => void }) {
  const styles = ["成长", "价值", "红利", "周期"];
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-[#0d1220] border border-white/5">
        <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2"><User className="w-3.5 h-3.5 text-blue-400" /> 投资偏好</h4>
        <div className="space-y-3">
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5">投资风格</div>
            <div className="flex flex-wrap gap-1.5">
              {styles.map((s) => (
                <button key={s} onClick={() => onStyleToggle(s)} className={`px-2.5 py-1 rounded text-xs transition-colors ${investmentStyle.includes(s) ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/5 text-slate-400 border border-white/5 hover:border-white/10"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5">风险承受</div>
            <div className="flex gap-1.5">
              {["conservative", "moderate", "aggressive"].map((r) => (
                <button key={r} onClick={() => onRiskChange(r)} className={`px-2.5 py-1 rounded text-xs transition-colors ${riskTolerance === r ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/5 text-slate-400 border border-white/5 hover:border-white/10"}`}>{r === "conservative" ? "保守" : r === "moderate" ? "稳健" : "激进"}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5">持仓周期</div>
            <div className="flex gap-1.5">
              {["short", "medium", "long"].map((h) => (
                <button key={h} onClick={() => onHoldingChange(h)} className={`px-2.5 py-1 rounded text-xs transition-colors ${holdingPeriod === h ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/5 text-slate-400 border border-white/5 hover:border-white/10"}`}>{h === "short" ? "短线" : h === "medium" ? "中线" : "长线"}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">行业候选</h3>
          <span className="text-xs text-slate-500 ml-auto">点击选择深入分析</span>
        </div>
        {industries.map((ind) => (
          <div key={ind.id} onClick={() => onToggle(ind.id)} className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${selected.includes(ind.id) ? "bg-cyan-500/10 border-cyan-500/30 shadow-lg shadow-cyan-500/5" : "bg-[#0d1220] border-white/5 hover:border-cyan-500/20"}`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selected.includes(ind.id) ? "bg-cyan-500 border-cyan-500" : "border-white/20"}`}>
                {selected.includes(ind.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-slate-200">{ind.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${ind.confidence === "high" ? "bg-emerald-500/20 text-emerald-400" : ind.confidence === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-slate-500/20 text-slate-400"}`}>{ind.confidence === "high" ? "高确信" : ind.confidence === "medium" ? "中等" : "待观察"}</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{ind.reason}</p>
                <div className="space-y-1">
                  <div className="text-[10px] text-emerald-400 flex items-start gap-1"><CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" /><span>支持：{ind.supportingEvidence}</span></div>
                  <div className="text-[10px] text-red-400 flex items-start gap-1"><AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" /><span>反对：{ind.opposingEvidence}</span></div>
                  <div className="text-[10px] text-amber-400 flex items-start gap-1"><Eye className="w-3 h-3 mt-0.5 flex-shrink-0" /><span>待验证：{ind.pendingEvidence}</span></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataPanel({ industries, hypotheses, risks, activePanel, onSetActive }: { industries: IndustryCandidate[]; hypotheses: AnalysisHypothesis[]; risks: RiskFactor[]; activePanel: string; onSetActive: (p: string) => void }) {
  return (
    <div className="space-y-4">
      {industries.map((ind) => (
        <div key={ind.id} className="rounded-lg bg-[#0d1220] border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => onSetActive(activePanel === ind.id ? "" : ind.id)}>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-slate-200">{ind.name} - 深度分析</h4>
            <ChevronRight className={`w-4 h-4 text-slate-500 ml-auto transition-transform ${activePanel === ind.id ? "rotate-90" : ""}`} />
          </div>
          {(activePanel === ind.id || activePanel === "") && (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-white/5 border border-white/5">
                  <div className="text-[10px] text-slate-500 mb-1">资金流向</div>
                  <div className="text-sm font-mono text-emerald-400">+{ind.capitalFlow} 亿</div>
                </div>
                <div className="p-3 rounded-md bg-white/5 border border-white/5">
                  <div className="text-[10px] text-slate-500 mb-1">机构覆盖</div>
                  <div className="text-sm font-mono text-slate-200">{ind.institutionCoverage} 家</div>
                </div>
                <div className="p-3 rounded-md bg-white/5 border border-white/5">
                  <div className="text-[10px] text-slate-500 mb-1">景气度</div>
                  <div className={`text-sm font-medium ${ind.prosperity === "up" ? "text-emerald-400" : ind.prosperity === "stable" ? "text-amber-400" : "text-red-400"}`}>{ind.prosperity === "up" ? "上行" : ind.prosperity === "stable" ? "平稳" : "下行"}</div>
                </div>
                <div className="p-3 rounded-md bg-white/5 border border-white/5">
                  <div className="text-[10px] text-slate-500 mb-1">技术信号</div>
                  <div className={`text-sm font-medium ${ind.technicalSignal === "bullish" ? "text-emerald-400" : ind.technicalSignal === "neutral" ? "text-amber-400" : "text-red-400"}`}>{ind.technicalSignal === "bullish" ? "看多" : ind.technicalSignal === "neutral" ? "中性" : "看空"}</div>
                </div>
              </div>
              <div className="p-3 rounded-md bg-white/5 border border-white/5">
                <div className="text-[10px] text-slate-500 mb-2">证据链</div>
                <div className="space-y-1.5">
                  <div className="text-xs text-emerald-400 flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /><span>{ind.supportingEvidence}</span></div>
                  <div className="text-xs text-red-400 flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /><span>{ind.opposingEvidence}</span></div>
                  <div className="text-xs text-amber-400 flex items-start gap-1.5"><Eye className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /><span>{ind.pendingEvidence}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="rounded-lg bg-[#0d1220] border border-white/5 p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2"><GitBranch className="w-4 h-4 text-blue-400" /> 投资假设</h4>
        <div className="space-y-3">
          {hypotheses.map((h) => (
            <div key={h.id} className="p-3 rounded-md bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${h.type === "industry" ? "bg-blue-500/20 text-blue-400" : h.type === "company" ? "bg-purple-500/20 text-purple-400" : "bg-amber-500/20 text-amber-400"}`}>{h.type === "industry" ? "行业" : h.type === "company" ? "公司" : "风格"}</span>
                <span className="text-xs font-medium text-slate-200">{h.title}</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{h.description}</p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div><span className="text-slate-500">触发：</span><span className="text-slate-300">{h.trigger}</span></div>
                <div><span className="text-slate-500">观察：</span><span className="text-slate-300">{h.observer}</span></div>
                <div><span className="text-slate-500">失效：</span><span className="text-red-400">{h.invalidCondition}</span></div>
                <div><span className="text-slate-500">复盘：</span><span className="text-slate-300">{h.reviewCycle}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg bg-[#0d1220] border border-red-500/20 p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-red-400" /> 风险评估</h4>
        <div className="space-y-2">
          {risks.map((r) => (
            <div key={r.id} className="flex items-start gap-2 p-2 rounded-md bg-red-500/5 border border-red-500/10">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-slate-200">{r.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{r.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StockPanel({ stocks, hypotheses, risks }: { stocks: StockCandidate[]; hypotheses: AnalysisHypothesis[]; risks: RiskFactor[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-slate-200">推荐标的</h3>
      </div>
      {stocks.map((stock) => (
        <div key={stock.id} className="rounded-lg bg-[#0d1220] border border-white/5 p-4 hover:border-emerald-500/20 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100">{stock.name}</h4>
                <span className="text-xs text-slate-500 font-mono">{stock.code}</span>
              </div>
              <div className="text-xs text-slate-400">{stock.industry}</div>
            </div>
            <div className="ml-auto text-right">
              <div className={`text-sm font-mono font-bold ${stock.potentialUpside > 0 ? "text-emerald-400" : "text-red-400"}`}>{stock.potentialUpside > 0 ? "+" : ""}{stock.potentialUpside}%</div>
              <div className="text-[10px] text-slate-500">潜在空间</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="p-2 rounded bg-white/5 text-center">
              <div className="text-[10px] text-slate-500">现价</div>
              <div className="text-xs font-mono text-slate-200">{stock.currentPrice}</div>
            </div>
            <div className="p-2 rounded bg-white/5 text-center">
              <div className="text-[10px] text-slate-500">目标价</div>
              <div className="text-xs font-mono text-blue-400">{stock.targetPrice}</div>
            </div>
            <div className="p-2 rounded bg-white/5 text-center">
              <div className="text-[10px] text-slate-500">机构数</div>
              <div className="text-xs font-mono text-slate-200">{stock.institutionCount}</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/10">
              <div className="text-[10px] text-emerald-400 font-medium mb-0.5">推荐理由</div>
              <div className="text-xs text-slate-300">{stock.reason}</div>
            </div>
            <div className="p-2 rounded bg-red-500/5 border border-red-500/10">
              <div className="text-[10px] text-red-400 font-medium mb-0.5">风险因素</div>
              <div className="text-xs text-slate-300">{stock.risk}</div>
            </div>
          </div>
        </div>
      ))}
      <div className="rounded-lg bg-[#0d1220] border border-white/5 p-4">
        <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-amber-400" /> 复盘计划</h4>
        <div className="text-xs text-slate-400 space-y-1.5">
          <p>建议在第 1、5、20 个交易日复盘候选标的表现。</p>
          <p>重点关注：资金流与研报观点是否背离、行业景气逻辑是否被业绩验证。</p>
        </div>
      </div>
    </div>
  );
}
