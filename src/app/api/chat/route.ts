import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";
import { getLatestMarketSnapshot } from "@/lib/data/market-snapshot-store";
import type { MiniMarketSnapshot } from "@/lib/data/market-types";

const SYSTEM_PROMPT_STATIC = `你是一位专业的 A 股市场投研顾问，名叫"小研"。你的职责是基于当前的市场数据为用户提供金融分析和投资策略建议。

## 你的角色定位
- 你是一位经验丰富、理性客观的投研分析师
- 你的分析基于数据，不做无根据的预测
- 你会用通俗易懂的语言解释专业概念
- 你会主动提示风险，不做过度乐观的判断

## 分析管线（6 步工作流）
当用户提出分析类问题时，你需要按照以下管线逐步引导：

1. **信息处理** — 读取研报观点、宏观快照、板块数据，提取关键信息
2. **证据组织** — 将资金流、研报覆盖、技术信号等统一到观点下，区分支持/反对/待验证证据
3. **假设生成** — 形成行业/公司/风格假设，包含触发原因、观察指标、失效条件
4. **基本面分析** — 机构共识、评级、目标价、关键观点
5. **技术面分析** — MA20/MA60、支撑压力位、趋势判断
6. **综合预测** — 输出投资标的推荐 + 风险 + 复盘计划

## 交互规则
- 每一步都要给出 2-4 个选项供用户选择
- 每个选项必须附带理由（为什么推荐这个方向）和风险等级（低/中/高）
- 用户选择后，再进入下一步
- 如果用户直接问具体问题（如"XX股票怎么样"），可以跳过管线直接回答

## 输出格式
在你的回答末尾，如果需要用户选择，请用以下 JSON 格式输出选项（放在 \`\`\`options 代码块中）：
\`\`\`options
[{"label":"选项名称","reason":"推荐理由","risk":"low|medium|high"}]
\`\`\`

如果需要推进到下一步，请用以下格式标记当前步骤（放在 \`\`\`step 代码块中）：
\`\`\`step
step1_info
\`\`\`

## 回答规范
1. 回答要简洁精炼，每次回答控制在 200 字以内
2. 涉及具体个股时，要结合技术面和基本面数据
3. 必须附带风险提示
4. 不要给出具体的买卖点位或保证收益
5. 用中文回答
6. 如果用户问的问题超出你的专业范围，礼貌引导回金融话题`;

function buildMarketPromptFromSnapshot(
  snapshot: MiniMarketSnapshot | null,
): string {
  if (!snapshot) {
    return `\n\n## 当前市场数据摘要\n当前无可用市场数据（Demo/缓存模式）。请在回答中提示用户数据可能不是最新的。`;
  }

  const tradeDate = `${snapshot.tradeDate.slice(0, 4)}-${snapshot.tradeDate.slice(4, 6)}-${snapshot.tradeDate.slice(6, 8)}`;
  const staleNote = snapshot.stale ? "\n**注意：当前为缓存数据，可能不是最新。**" : "";
  const sourceNote =
    snapshot.source === "mock"
      ? "\n**注意：当前使用 Demo/缓存数据。**"
      : "";

  const indexLines = snapshot.indices
    .map(
      (idx) =>
        `- ${idx.name}: ${idx.price.toFixed(2)} (${idx.change >= 0 ? "+" : ""}${idx.change}%)`,
    )
    .join("\n");

  const sectorLines = snapshot.hotSectors
    .slice(0, 8)
    .map(
      (s, i) =>
        `${i + 1}. ${s.name} ${s.change >= 0 ? "+" : ""}${s.change}% 热度:${s.heat}`,
    )
    .join("\n");

  const stockLines = snapshot.activeStocks
    .slice(0, 5)
    .map(
      (s) =>
        `- ${s.name} (${s.code}): ${s.price}元, ${s.change >= 0 ? "+" : ""}${s.change}%, ${s.reason}`,
    )
    .join("\n");

  const targetLines = snapshot.recommendedTargets
    .slice(0, 5)
    .map(
      (t) =>
        `- ${t.name} (${t.code}): ${t.industry}, 机会评分${t.opportunity_score}, 风险${t.risk_level}, ${t.reason}`,
    )
    .join("\n");

  return `\n\n## 当前市场数据摘要
以下是${tradeDate}的市场数据（更新时间: ${snapshot.fetchedAt}, 来源: ${snapshot.source}）:${staleNote}${sourceNote}

### 市场概览
${indexLines}

### 热门板块
${sectorLines}

### 活跃个股
${stockLines}

### AI推荐研究标的
${targetLines}

### 市场摘要
${snapshot.summary}`;
}

function buildAnalysisContext(context?: Record<string, unknown>): string {
  if (!context?.currentStep) return "";
  return `\n\n## 当前分析会话状态
- 当前步骤: ${context.currentStep}
- 用户投资风格: ${(context.investmentStyle as string[] || []).join("、") || "未设定"}
- 风险承受: ${context.riskTolerance || "未设定"}
- 持仓周期: ${context.holdingPeriod || "未设定"}

请根据当前分析步骤和用户偏好来回答。`;
}

export async function POST(request: NextRequest) {
  const { messages, context } = await request.json();
  const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

  // Read latest snapshot — never call Tushare here
  let snapshot: MiniMarketSnapshot | null = null;
  try {
    snapshot = await getLatestMarketSnapshot();
  } catch {
    // ignore, will use null fallback
  }

  const marketSection = buildMarketPromptFromSnapshot(snapshot);
  const fullSystemPrompt =
    SYSTEM_PROMPT_STATIC + marketSection + buildAnalysisContext(context);

  const config = new Config();
  const client = new LLMClient(config, customHeaders);

  const chatMessages = [
    { role: "system" as const, content: fullSystemPrompt },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const llmStream = client.stream(chatMessages, {
          model: "doubao-seed-2-0-lite-260215",
          temperature: 0.7,
        });

        let fullResponse = "";

        for await (const chunk of llmStream) {
          if (chunk.content) {
            const text = chunk.content.toString();
            fullResponse += text;
            const data = `data: ${JSON.stringify({ content: text })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        }

        // Parse options and step from full response
        const optionsMatch = fullResponse.match(/```options\n([\s\S]*?)\n```/);
        const stepMatch = fullResponse.match(/```step\n([\s\S]*?)\n```/);

        if (stepMatch) {
          const step = stepMatch[1].trim();
          const data = `data: ${JSON.stringify({ step })}\n\n`;
          controller.enqueue(encoder.encode(data));
        }

        if (optionsMatch) {
          try {
            const options = JSON.parse(optionsMatch[1].trim());
            const data = `data: ${JSON.stringify({ options })}\n\n`;
            controller.enqueue(encoder.encode(data));
          } catch {
            // invalid options JSON, skip
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        const data = `data: ${JSON.stringify({ error: errMsg })}\n\n`;
        controller.enqueue(encoder.encode(data));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
