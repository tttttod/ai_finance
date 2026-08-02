"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, X, MessageCircle, Bot, User, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("请求失败");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantContent += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return updated;
                });
              }
              if (parsed.error) {
                assistantContent += `\n\n抱歉，出现错误: ${parsed.error}`;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return updated;
                });
              }
            } catch {
              // skip parse errors
            }
          }
        }
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "网络请求失败";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `抱歉，连接失败: ${errMsg}。请稍后重试。`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "今天哪些板块值得关注？",
    "中国人寿还能买吗？",
    "宏观环境怎么看？",
    "有什么风险提示？",
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30"
        aria-label="AI 投研顾问"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[400px] flex-col rounded-xl border border-white/10 bg-[#0d1220] shadow-2xl shadow-blue-500/5 animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
                <Bot className="h-5 w-5 text-blue-400" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0d1220] animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">小研 · AI 投研顾问</h3>
              <p className="text-xs text-slate-500">基于今日市场数据，为你提供分析建议</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50 border border-white/5">
                  <Bot className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-400">你好，我是小研，你的 AI 投研顾问</p>
                <div className="flex flex-wrap justify-center gap-2 px-4">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => {
                          inputRef.current?.focus();
                        }, 0);
                      }}
                      className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-400"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        msg.role === "user"
                          ? "bg-slate-700"
                          : "bg-blue-500/15 border border-blue-500/20"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="h-3.5 w-3.5 text-slate-300" />
                      ) : (
                        <Bot className="h-3.5 w-3.5 text-blue-400" />
                      )}
                    </div>
                    <div
                      className={`max-w-[280px] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-slate-700 text-slate-100"
                          : "bg-slate-800/50 text-slate-300 border border-white/5"
                      }`}
                    >
                      {msg.content || (isLoading && i === messages.length - 1 ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                      ) : null)}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/5 px-4 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题..."
                rows={1}
                className="flex-1 resize-none rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-600">
              仅供参考，不构成投资建议
            </p>
          </div>
        </div>
      )}
    </>
  );
}
