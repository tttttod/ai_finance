"use client";

import { useState, useEffect } from "react";

interface DimensionStat {
  key: string;
  average: string;
  count: number;
}

interface FeedbackStats {
  source: "supabase" | "file" | "none";
  total: number;
  ratingDistribution: Record<number, number>;
  dimensionStats: DimensionStat[];
  recentFeedback: any[];
}

const DIMENSION_LABELS: Record<string, { label: string; emoji: string }> = {
  timeliness: { label: "数据及时性", emoji: "📡" },
  recommendation: { label: "推荐标的质量", emoji: "🎯" },
  ai_clarity: { label: "AI 解释易懂度", emoji: "💡" },
  risk_warning: { label: "风险提示充分度", emoji: "⚠️" },
  ux_smooth: { label: "页面操作流畅度", emoji: "🖐️" },
  retention: { label: "持续使用意愿", emoji: "🔄" },
};

export default function AdminFeedbackPage() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; savedTo?: string; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const loadStats = () => {
    fetch("/api/feedback-stats")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setStats(json.data);
        } else {
          setError(json.error || "加载失败");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const testFeedback = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/feedback-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": "914113884",
        },
        body: JSON.stringify({
          rating: 5,
          comment: `[TEST] Admin test at ${new Date().toISOString()}`,
          page: "admin-test",
        }),
      });
      const json = await res.json();
      setTestResult(json);
      // Reload stats after test
      setTimeout(loadStats, 500);
    } catch (err) {
      setTestResult({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    // 简单的访问控制：检查 URL 参数或 localStorage
    const params = new URLSearchParams(window.location.search);
    const hasAccess = params.get("access") === "admin" || localStorage.getItem("admin_access") === "true";
    
    if (!hasAccess) {
      // 提示输入访问码
      const code = prompt("请输入管理访问码：");
      if (code === "admin2024") {
        localStorage.setItem("admin_access", "true");
        setAuthorized(true);
      } else {
        setError("访问被拒绝");
        setLoading(false);
        return;
      }
    } else {
      setAuthorized(true);
    }

    loadStats();
  }, []);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="text-slate-500">验证中...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="text-red-500">错误：{error}</div>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">反馈统计（内部）</h1>
            <p className="text-slate-500 mb-4">暂无反馈数据</p>
            
            {/* 数据来源提示 */}
            {stats?.source === "none" && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-sm font-bold text-amber-800 mb-1">⚠️ Supabase 未配置</div>
                <div className="text-xs text-amber-700">
                  线上反馈需要配置 Supabase 环境变量：<br />
                  <code className="bg-amber-100 px-1 rounded">SUPABASE_URL</code> 和 <code className="bg-amber-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>
                </div>
              </div>
            )}
            
            {/* 测试按钮 */}
            <div className="space-y-3">
              <button
                onClick={testFeedback}
                disabled={testing}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {testing ? "测试中..." : " 测试提交反馈"}
              </button>
              
              {testResult && (
                <div className={`p-3 rounded-lg text-xs ${testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {testResult.success ? (
                    <>✅ 测试成功 · 保存到：{testResult.savedTo}</>
                  ) : (
                    <>❌ 测试失败：{testResult.error}</>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxRatingCount = Math.max(...Object.values(stats.ratingDistribution));

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 标题 */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-slate-800"> 用户反馈统计（内部）</h1>
            {/* 数据来源标签 */}
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
              stats.source === "supabase" 
                ? "bg-green-100 text-green-700" 
                : stats.source === "file"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-500"
            }`}>
              {stats.source === "supabase" ? "✓ Supabase" : stats.source === "file" ? "⚠ 本地文件" : "无数据"}
            </span>
          </div>
          <p className="text-sm text-slate-500">共收到 {stats.total} 条反馈 · 仅开发/产品团队可见</p>
          
          {/* Supabase 未配置提示 */}
          {stats.source !== "supabase" && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-xs text-amber-800">
                ⚠️ 当前数据来自{stats.source === "file" ? "本地文件" : "未知来源"}。线上环境请配置 Supabase 环境变量以持久化数据。
              </div>
            </div>
          )}
        </div>

        {/* 测试区域 */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-700"> 测试反馈链路</h2>
            <button
              onClick={testFeedback}
              disabled={testing}
              className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 disabled:opacity-50"
            >
              {testing ? "测试中..." : " 提交测试反馈"}
            </button>
          </div>
          {testResult && (
            <div className={`p-3 rounded-lg text-xs ${testResult.success ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {testResult.success ? (
                <>✅ 测试成功 · 保存到：{testResult.savedTo}</>
              ) : (
                <>❌ 测试失败：{testResult.error}</>
              )}
            </div>
          )}
        </div>

        {/* 总体评分分布 */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">⭐ 总体评分分布</h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const width = maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="w-16 text-sm font-bold text-slate-700">
                    {rating} 
                  </div>
                  <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg transition-all"
                      style={{ width: `${width}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-3 text-xs font-bold text-slate-700">
                      {count} 条 ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 各维度平均分 */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">📈 各维度平均分</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.dimensionStats.map((dim) => {
              const info = DIMENSION_LABELS[dim.key] || { label: dim.key, emoji: "" };
              const avg = parseFloat(dim.average);
              const avgDisplay = dim.count > 0 ? avg.toFixed(1) : "—";
              const bgColor =
                avg >= 2.5 ? "bg-green-100 text-green-700" : avg >= 1.5 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
              return (
                <div key={dim.key} className="p-4 rounded-xl bg-slate-50">
                  <div className="text-2xl mb-2">{info.emoji}</div>
                  <div className="text-xs font-bold text-slate-600 mb-1">{info.label}</div>
                  <div className={`text-2xl font-black ${bgColor} rounded-lg px-2 py-1 inline-block`}>
                    {avgDisplay}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{dim.count} 人评分</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 最近反馈 */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">📝 最近反馈</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats.recentFeedback.map((fb, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">
                      总体评分：{"⭐".repeat(fb.rating || 0)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {fb.created_at ? new Date(fb.created_at).toLocaleString("zh-CN") : "未知时间"}
                  </span>
                </div>
                {fb.dimension_scores && typeof fb.dimension_scores === "object" && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Object.entries(fb.dimension_scores).map(([key, value]) => {
                      const info = DIMENSION_LABELS[key] || { label: key, emoji: "📊" };
                      return (
                        <span
                          key={key}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200"
                        >
                          {info.emoji} {info.label}: {value === 3 ? "😊" : value === 2 ? "😐" : ""}
                        </span>
                      );
                    })}
                  </div>
                )}
                {fb.comment && (
                  <p className="text-xs text-slate-600 mt-2">💬 {fb.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
