"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Eye,
  BarChart3,
  Target,
  GitBranch,
  Shield,
  MessageSquare,
  Zap,
} from "lucide-react";
import NewsFeed from "@/components/news-feed";
import type {
  NewsItem,
  AnalysisStep,
  StepStatus,
  ChatOption,
  ChatMessage,
  PipelineStep,
} from "@/lib/analysis-types";

const PIPELINE_STEPS: { id: AnalysisStep; title: string; icon: React.ReactNode }[] = [
  { id: "step1_info", title: "信息处理", icon: <Zap className="w-3.5 h-3.5" /> },
  { id: "step2_evidence", title: "证据组织", icon: <GitBranch className="w-3.5 h-3.5" /> },
  { id: "step3_hypothesis", title: "假设生成", icon: <Eye className="w-3.5 h-3.5" /> },
  { id: "step4_fundamental", title: "基本面", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "step5_technical", title: "技术面", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: "step6_prediction", title: "综合预测", icon: <Target className="w-3.5 h-3.5" /> },
];

const DEFAULT_PIPELINE: PipelineStep[] = PIPELINE_STEPS.map((s) => ({
  id: s.id,
  title: s.title,
  description: "",
  status: "pending" as StepStatus,
}));

const STORAGE_KEY = "ai-research-chat-session";

interface ChatSessionState {
  messages: ChatMessage[];
  currentStep: AnalysisStep | "idle";
  pipeline: PipelineStep[];
}

function loadSession(): ChatSessionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveSession(state: ChatSessionState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<AnalysisStep | "idle">("idle");
  const [pipeline, setPipeline] = useState<PipelineStep[]>(DEFAULT_PIPELINE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setMessages(saved.messages);
      setCurrentStep(saved.currentStep);
      setPipeline(saved.pipeline);
    } else {
      const welcome: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content:
          "你好！我是 AI 投研分析师。我可以帮你：\n\n1. **信息处理** — 解读研报、新闻、宏观数据\n2. **证据组织** — 构建支持/反对/待验证证据链\n3. **假设生成** — 形成可追踪的投资假设\n4. **基本面分析** — 机构共识、评级、目标价\n5. **技术面分析** — 均线、支撑压力、趋势判断\n6. **综合预测** — 推荐标的 + 风险 + 复盘计划\n\n你可以直接提问，或点击左侧资讯让我深入分析。",
        timestamp: new Date().toLocaleString("zh-CN", { hour12: false }),
      };
      setMessages([welcome]);
    }
  }, []);

  useEffect(() => {
    saveSession({ messages, currentStep, pipeline });
  }, [messages, currentStep, pipeline]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string, metadata?: ChatMessage["metadata"]) => {
    if (!content.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toLocaleString("zh-CN", { hour12: false }),
      metadata,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            currentStep: currentStep === "idle" ? null : currentStep,
          },
        }),
      });

      if (!res.ok) throw new Error("请求失败");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("无响应流");

      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleString("zh-CN", { hour12: false }),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.content) {
              assistantContent += json.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id ? { ...m, content: assistantContent } : m
                )
              );
            }
            if (json.options) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id ? { ...m, options: json.options } : m
                )
              );
            }
            if (json.metadata?.action === "update_step") {
              const step = json.metadata.data as AnalysisStep;
              setCurrentStep(step);
              setPipeline((prev) =>
                prev.map((p) => ({
                  ...p,
                  status:
                    p.id === step
                      ? "active"
                      : PIPELINE_STEPS.findIndex((s) => s.id === p.id) <
                        PIPELINE_STEPS.findIndex((s) => s.id === step)
                      ? "completed"
                      : "pending",
                }))
              );
            }
          } catch {}
        }
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "抱歉，请求失败。请稍后重试。",
        timestamp: new Date().toLocaleString("zh-CN", { hour12: false }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (option: ChatOption) => {
    sendMessage(option.label, { action: "select_option", data: option });
  };

  const handleNewsClick = (news: NewsItem) => {
    sendMessage(
      `请分析这条${news.category === "flash" ? "快讯" : news.category === "research" ? "研报" : news.category === "macro" ? "宏观" : "公告"}：${news.title}`,
      { action: "analyze_news", data: news }
    );
  };

  const resetSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "会话已重置。有什么可以帮你的？",
        timestamp: new Date().toLocaleString("zh-CN", { hour12: false }),
      },
    ]);
    setCurrentStep("idle");
    setPipeline(DEFAULT_PIPELINE);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left: News Feed */}
      <div className="w-[320px] flex-shrink-0 border-r border-white/5 bg-[#0a0e1a] flex flex-col">
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-200">信息面资讯</h2>
        </div>
        <NewsFeed onNewsClick={handleNewsClick} />
      </div>

      {/* Right: Chat */}
      <div className="flex-1 flex flex-col bg-[#0a0e1a]">
        {/* Pipeline Bar */}
        <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2 overflow-x-auto">
          {PIPELINE_STEPS.map((step, i) => {
            const pipelineStep = pipeline.find((p) => p.id === step.id);
            const status = pipelineStep?.status || "pending";
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    status === "active"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                      : status === "completed"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-white/5 text-slate-500 border border-white/5"
                  }`}
                >
                  {status === "completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    step.icon
                  )}
                  {step.title}
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div
                    className={`w-6 h-px ${
                      status === "completed" ? "bg-emerald-500/30" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            );
          })}
          <button
            onClick={resetSession}
            className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            title="重置会话"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-blue-500/20 border border-blue-500/30 text-slate-100"
                    : "bg-[#0d1220] border border-white/5 text-slate-300"
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                  {msg.role === "assistant" &&
                    loading &&
                    msg.id === messages[messages.length - 1]?.id &&
                    messages[messages.length - 1]?.role === "assistant" &&
                    !msg.content && (
                      <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1" />
                    )}
                </div>
                {msg.options && msg.options.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleOptionClick(opt)}
                        disabled={loading}
                        className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-200 disabled:opacity-50 group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-200 group-hover:text-blue-300">
                            {opt.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{opt.reason}</div>
                        {opt.risk && (
                          <div className="text-[11px] text-amber-400/70 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {opt.risk}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-slate-600 mt-2">{msg.timestamp}</div>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="输入你的想法或问题..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#0d1220] border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/30 transition-colors"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
