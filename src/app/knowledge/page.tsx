"use client";

import { useState } from "react";
import {
  BookOpen,
  Lightbulb,
  Shield,
  Search,
  Database,
  GitBranch,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Link2,
} from "lucide-react";
import { mockKnowledgeBase as knowledgeBase } from "@/lib/analysis-data";
import Link from "next/link";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  信息处理: <Database className="w-4 h-4" />,
  证据组织: <GitBranch className="w-4 h-4" />,
  假设生成: <Lightbulb className="w-4 h-4" />,
  风险控制: <Shield className="w-4 h-4" />,
  复盘学习: <BarChart3 className="w-4 h-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  信息处理: "from-blue-500 to-blue-600",
  证据组织: "from-cyan-500 to-cyan-600",
  假设生成: "from-amber-500 to-amber-600",
  风险控制: "from-red-500 to-red-600",
  复盘学习: "from-emerald-500 to-emerald-600",
};

export default function KnowledgePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = knowledgeBase.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.includes(searchQuery)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 border border-blue-500/30 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-200">Agent 知识库</h1>
          <p className="text-xs text-slate-500">
            AI 投研分析师的分析逻辑框架与工作方法论
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索知识库..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0d1220] border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* Workflow Overview */}
      <div className="p-4 rounded-lg bg-[#0d1220] border border-[rgba(59,130,246,0.15)] mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-blue-400" />
          Agent 工作流概览
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-400 overflow-x-auto pb-1">
          {["信息处理", "证据组织", "假设生成", "风险控制", "复盘学习"].map(
            (cat, i) => (
              <div key={cat} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`px-3 py-1.5 rounded-md bg-gradient-to-r ${CATEGORY_COLORS[cat]} text-white font-medium`}
                >
                  {cat}
                </div>
                {i < 4 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
              </div>
            )
          )}
        </div>
      </div>

      {/* Knowledge Items */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-lg bg-[#0d1220] border border-white/5 overflow-hidden transition-all duration-300 hover:border-blue-500/20"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[item.category]} flex items-center justify-center text-white flex-shrink-0`}
                >
                  {CATEGORY_ICONS[item.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-200 mt-1">
                    {item.title}
                  </h3>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5">
                  <p className="text-xs text-slate-400 mt-3 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Link2 className="w-3 h-3" />
                      分析框架
                    </h4>
                    <div className="space-y-1.5">
                      {item.framework.map((step, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-slate-300 bg-white/5 rounded px-3 py-2"
                        >
                          <span className="text-blue-400 font-mono text-[10px] flex-shrink-0 mt-0.5">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  {item.examples.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        示例
                      </h4>
                      {item.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="text-xs text-slate-400 bg-amber-500/5 border border-amber-500/10 rounded px-3 py-2 font-mono leading-relaxed"
                        >
                          {ex}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          没有找到匹配的知识库条目
        </div>
      )}
    </div>
  );
}
