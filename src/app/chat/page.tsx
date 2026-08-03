"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  FileText,
  GitBranch,
  Shield,
  Target,
  Sparkles,
  Search,
} from "lucide-react";
import {
  type ChatMessage,
  type ChatOption,
  type AnalysisStep,
  type StepStatus,
} from "@/lib/analysis-types";

const PIPELINE_STEPS: { key: AnalysisStep; label: string; icon: React.ReactNode }[] = [
  { key: "idle", label: "等待", icon: <Circle className="w-4 h-4" /> },
  { key: "step1_info", label: "信息处理", icon: <Search className="w-4 h-4" /> },
  { key: "step2_evidence", label: "证据组织", icon: <FileText className="w-4 h-4" /> },
  { key: "step3_hypothesis", label: "假设生成", icon: <GitBranch className="w-4 h-4" /> },
  { key: "step4_fundamental", label: "基本面分析", icon: <BarChart3 className="w-4 h-4" /> },
  { key: "step5_technical", label: "技术面分析", icon: <TrendingUp className="w-4 h-4" /> },
  { key: "step6_prediction", label: "综合预测", icon: <Target className="w-4 h-4" /> },
];

function getStepStatus(step: AnalysisStep, currentStep: AnalysisStep): StepStatus {
  const order: AnalysisStep[] = ["idle", "step1_info", "step2_evidence", "step3_hypothesis", "step4_fundamental", "step5_technical", "step6_prediction"];
  const si = order.indexOf(step);
  const ci = order.indexOf(currentStep);
  if (si < ci) return "completed";
  if (si === ci) return "active";
  return "pending";
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>("idle");
  const [pendingOptions, setPendingOptions] = useState<ChatOption[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
        step: currentStep,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
      setPendingOptions(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
            context: { currentStep, investmentStyle: [], riskTolerance: "moderate", holdingPeriod: "medium" },
          }),
        });

        if (!res.ok) throw new Error("请求失败");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("无响应流");

        const decoder = new TextDecoder();
        let fullContent = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    if (last?.role === "assistant") {
                      return [...prev.slice(0, -1), { ...last, content: fullContent }];
                    }
                    return [
                      ...prev,
                      {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: fullContent,
                        timestamp: new Date().toISOString(),
                        step: currentStep,
                      },
                    ];
                  });
                }
                if (parsed.step) {
                  setCurrentStep(parsed.step);
                }
                if (parsed.options) {
                  setPendingOptions(parsed.options);
                }
              } catch {
                // skip invalid JSON
              }
            }
          }
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "抱歉，请求出错，请稍后重试。",
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages, isLoading, currentStep],
  );

  const handleOptionClick = useCallback(
    (option: ChatOption) => {
      setPendingOptions(null);
      sendMessage(option.label);
    },
    [sendMessage],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const quickQuestions = [
    "目前比较好的行业是什么？",
    "有什么好的投资标的？",
    "帮我做完整的基本面分析",
    "最近宏观环境怎么样？",
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-200 flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-white/5 bg-[#0a0e1a]/80 backdrop-blur-md flex items-center px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI 对话分析</h1>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          在线
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Pipeline */}
        <aside className="w-56 border-r border-white/5 bg-[#080c16] flex-shrink-0 flex flex-col">
          <div className="px-4 py-3 border-b border-white/5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">分析管线</h2>
          </div>
          <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {PIPELINE_STEPS.map((step, idx) => {
              const status = getStepStatus(step.key, currentStep);
              return (
                <div key={step.key} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300">
                  {/* Connector line */}
                  {idx > 0 && (
                    <div className="absolute w-px h-4 bg-white/10 -mt-5 ml-[22px]" />
                  )}
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                    status === "completed"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : status === "active"
                        ? "bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/30"
                        : "bg-white/5 text-slate-600"
                  }`}>
                    {status === "completed" ? <CheckCircle2 className="w-4 h-4" /> : status === "active" ? <Loader2 className="w-4 h-4 animate-spin" /> : step.icon}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${
                    status === "completed" ? "text-emerald-400" : status === "active" ? "text-blue-400" : "text-slate-600"
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Quick actions */}
          <div className="px-3 py-3 border-t border-white/5">
            <button
              onClick={() => {
                setMessages([]);
                setCurrentStep("idle");
                setPendingOptions(null);
              }}
              className="w-full px-3 py-2 rounded-lg text-xs text-slate-400 bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
            >
              新建会话
            </button>
          </div>
        </aside>

        {/* Right - Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 border border-blue-500/30 flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-200 mb-2">投研顾问</h2>
                <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
                  我可以帮你分析行业趋势、筛选投资标的、解读研报观点。
                  试试下面的问题，或直接输入你的问题。
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="px-4 py-3 rounded-lg text-sm text-slate-300 bg-[#0d1220] border border-white/5 hover:border-blue-500/30 hover:text-blue-400 transition-all duration-300 text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${msg.role === "user" ? "order-first" : ""}`}>
                    <div
                      className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-500/20 border border-blue-500/30 text-slate-200 rounded-tr-sm"
                          : "bg-[#0d1220] border border-white/5 text-slate-300 rounded-tl-sm"
                      }`}
                    >
                      {msg.content.split("\n").map((line, i) => (
                        <p key={i} className={line === "" ? "h-2" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
                    <div className={`text-[10px] text-slate-600 mt-1 ${msg.role === "user" ? "text-right" : ""}`}>
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Pending Options */}
            {pendingOptions && pendingOptions.length > 0 && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-xs text-slate-500 mb-2">请选择一个方向：</div>
                  {pendingOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(opt)}
                      className="w-full text-left p-3 rounded-lg bg-[#0d1220] border border-white/5 hover:border-blue-500/30 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          opt.risk === "low" ? "bg-emerald-500/20 text-emerald-400" : opt.risk === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {opt.risk === "low" ? "低风险" : opt.risk === "medium" ? "中风险" : "高风险"}
                        </span>
                        <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{opt.label}</span>
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed">{opt.reason}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && !messages[messages.length - 1]?.content && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-xl bg-[#0d1220] border border-white/5 rounded-tl-sm">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/5 bg-[#0a0e1a]/80 backdrop-blur-md px-6 py-4 flex-shrink-0">
            <div className="flex items-end gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的问题... (Enter 发送, Shift+Enter 换行)"
                  rows={1}
                  className="w-full px-4 py-3 rounded-xl bg-[#0d1220] border border-white/10 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-blue-500/30 transition-colors max-h-32"
                  style={{ minHeight: "44px" }}
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] text-slate-600 text-center mt-2">
              仅供参考，不构成投资建议
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
