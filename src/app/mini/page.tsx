"use client";

import { useState, useEffect, useRef } from "react";
import {
  InvestmentStyle,
  WorkflowStep,
  StepStatus,
  WorkflowStepInfo,
  FactorScore,
  ScenarioPrediction,
  DebatePoint,
  RiskCheck,
  ResearchReport,
  ReviewTask,
  AgentResponse,
  WORKFLOW_STEPS,
  AGENT_TEAM,
  FACTOR_WEIGHTS,
} from "@/lib/mini-types";
import {
  generateAgentResponse,
  mockMarketData,
  mockReviewData,
} from "@/lib/mini-mock";

type TabId = "market" | "research" | "review" | "profile";

export default function MiniProgramPage() {
  const [activeTab, setActiveTab] = useState<TabId>("market");

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
        {activeTab === "market" && <MarketTab />}
        {activeTab === "research" && <ResearchTab />}
        {activeTab === "review" && <ReviewTab />}
        {activeTab === "profile" && <ProfileTab />}
      </div>

      {/* 底部 Tab 栏 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 flex">
        {[
          { id: "market" as TabId, label: "市场", icon: "📊" },
          { id: "research" as TabId, label: "研究", icon: "🔬" },
          { id: "review" as TabId, label: "复盘", icon: "📋" },
          { id: "profile" as TabId, label: "我的", icon: "👤" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-colors ${
              activeTab === tab.id ? "text-blue-600" : "text-slate-400"
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

// ===== 市场 Tab =====
function MarketTab() {
  return (
    <div className="p-4 space-y-4">
      {/* AI 摘要 */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-semibold">今日市场 AI 摘要</span>
        </div>
        <p className="text-xs leading-relaxed opacity-90">{mockMarketData.summary}</p>
      </div>

      {/* 指数卡片 */}
      <div className="grid grid-cols-2 gap-2">
        {mockMarketData.indices.map((idx) => (
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
          {mockMarketData.hotSectors.map((sector, i) => (
            <div key={sector.name} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-4">{i + 1}</span>
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
          {mockMarketData.activeStocks.map((stock) => (
            <div key={stock.code} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
              <div className="flex-1">
                <div className="text-xs font-medium text-slate-700">{stock.name}</div>
                <div className="text-[10px] text-slate-400">{stock.reason}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-slate-700">{stock.price}</div>
                <div className="text-xs font-mono text-red-600">+{stock.change}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 事件时间轴 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">重要事件</h3>
        <div className="space-y-3">
          {mockMarketData.events.map((event, i) => (
            <div key={i} className="flex gap-3">
              <div className="text-xs text-slate-400 w-10 font-mono">{event.time}</div>
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

// ===== 研究 Tab =====
function ResearchTab() {
  const [started, setStarted] = useState(false);
  const [target, setTarget] = useState("");
  const [style, setStyle] = useState<InvestmentStyle>("short");
  const [period, setPeriod] = useState<string>("short");
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<WorkflowStepInfo[]>([]);
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startResearch = () => {
    if (!target.trim()) return;
    setStarted(true);
    setIsRunning(true);
    setCurrentStep(0);
    setResponses([]);

    const initialSteps = WORKFLOW_STEPS.map((s) => ({
      ...s,
      status: "pending" as StepStatus,
    }));
    setSteps(initialSteps);

    // 模拟逐步执行
    let step = 0;
    timerRef.current = setInterval(() => {
      if (step >= WORKFLOW_STEPS.length) {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      const stepInfo = WORKFLOW_STEPS[step];
      const response = generateAgentResponse(step + 1, stepInfo.id, target, style);

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

        {/* Agent 团队展示 */}
        <div className="bg-white rounded-lg p-4 border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Agent 研究团队</h3>
          <div className="grid grid-cols-3 gap-2">
            {AGENT_TEAM.map((agent) => (
              <div key={agent.role} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                <span className="text-lg">{agent.icon}</span>
                <div>
                  <div className="text-[10px] font-medium text-slate-700">{agent.name}</div>
                  <div className="text-[9px] text-slate-400">{agent.title}</div>
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
      {/* 16 步进度条 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800">研究进度</h3>
          <span className="text-xs text-slate-500">{currentStep}/16</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / 16) * 100}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`text-[9px] px-1.5 py-1 rounded text-center transition-colors ${
                step.status === "completed"
                  ? "bg-emerald-50 text-emerald-600"
                  : step.status === "active"
                  ? "bg-blue-50 text-blue-600 animate-pulse"
                  : "bg-slate-50 text-slate-400"
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
          <p className="text-[10px] text-center text-slate-400">
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
          <div className="text-[10px] text-slate-400">第 {response.step} 步 · {agent?.title}</div>
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

      {/* 辩论观点 */}
      {response.data?.points ? (
        <div className="mt-3 space-y-2">
          {(response.data.points as DebatePoint[]).map((point) => (
            <div key={point.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-xs font-medium text-slate-700 mb-1">{point.title}</div>
              <div className="text-[10px] text-slate-500 mb-1">{point.content}</div>
              <div className="text-[10px] text-blue-600">证据：{point.evidence}</div>
              <div className="text-[10px] text-slate-400 mt-1">置信度：{point.confidence}%</div>
            </div>
          ))}
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
                <div className="text-[10px] text-slate-400 mt-1">¥{scenario.price}</div>
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

// ===== 复盘 Tab =====
function ReviewTab() {
  return (
    <div className="p-4 space-y-4">
      {/* 统计概览 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">复盘统计</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-blue-600">{mockReviewData.stats.directionAccuracy}%</div>
            <div className="text-[10px] text-slate-500">方向准确率</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-emerald-600">{mockReviewData.stats.rangeHitRate}%</div>
            <div className="text-[10px] text-slate-500">区间命中率</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-amber-600">+{mockReviewData.stats.vsHS300}%</div>
            <div className="text-[10px] text-slate-500">相对沪深300</div>
          </div>
        </div>
      </div>

      {/* 风格表现对比 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">风格表现对比</h3>
        <div className="space-y-2">
          {mockReviewData.stylePerformance.map((perf) => (
            <div key={perf.style} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 w-12">{perf.style}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${perf.accuracy}%` }} />
              </div>
              <span className="text-xs font-mono text-slate-700 w-10">{perf.accuracy}%</span>
              <span className="text-xs font-mono text-red-600 w-12">+{perf.avgReturn}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 历史研究列表 */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">历史研究</h3>
        <div className="space-y-3">
          {mockReviewData.history.map((item) => (
            <div key={item.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-700">{item.target}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  item.style === "short" ? "bg-red-50 text-red-600" :
                  item.style === "swing" ? "bg-blue-50 text-blue-600" :
                  "bg-purple-50 text-purple-600"
                }`}>
                  {item.style === "short" ? "短线" : item.style === "swing" ? "波段" : "长期"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <span>创建：{item.createdAt}</span>
                <span>复盘：{item.reviewDate}</span>
              </div>
              {item.actualResult && (
                <div className="mt-2 flex items-center gap-4 text-[10px]">
                  <span className={item.actualResult.priceChange >= 0 ? "text-red-600" : "text-emerald-600"}>
                    实际：{item.actualResult.priceChange > 0 ? "+" : ""}{item.actualResult.priceChange}%
                  </span>
                  <span className={item.actualResult.directionCorrect ? "text-emerald-600" : "text-red-600"}>
                    {item.actualResult.directionCorrect ? "✅ 方向正确" : "❌ 方向错误"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== 我的 Tab =====
function ProfileTab() {
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
            <div className="text-xs text-slate-500">默认风格：短线</div>
          </div>
        </div>
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
