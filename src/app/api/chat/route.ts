import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";
import { getDailyReport } from "@/lib/mock-data";

const SYSTEM_PROMPT = `你是一位专业的 A 股市场投研顾问，名叫"小研"。你的职责是基于当前的市场数据为用户提供金融分析和投资策略建议。

## 你的角色定位
- 你是一位经验丰富、理性客观的投研分析师
- 你的分析基于数据，不做无根据的预测
- 你会用通俗易懂的语言解释专业概念
- 你会主动提示风险，不做过度乐观的判断

## 当前市场数据摘要
以下是今日（${new Date().toISOString().split("T")[0]}）的市场数据：

### 市场概览
- 上证指数: 3356.78 (+1.12%)
- 深证成指: 10582.45 (+1.58%)
- 两市成交额: 12856 亿元
- 上涨板块: 42 个 | 下跌板块: 18 个

### 热门板块（连续2日主力资金净流入）
1. 传媒 +64.84亿 +2.18% 领涨: 电声股份
2. 食品饮料 +55.57亿 +0.85% 领涨: ST西王
3. 计算机 +23.58亿 +0.47% 领涨: 罗普特
4. 汽车 +25.07亿 +0.12% 领涨: 天海电子
5. 家用电器 +23.58亿 -0.10% 领涨: 亿田智能
6. 农林牧渔 +22.02亿 +0.60% 领涨: 天康生物
7. 商贸零售 +22.58亿 +1.13% 领涨: 博士眼镜
8. 社会服务 +6.11亿 +0.65% 领涨: 西藏旅游

### 机构共识股
- 中国人寿 (601628): 11家机构覆盖, 评级"优于大市", 目标价48.40元, 当前38.92元, 多头趋势
- 桐昆股份 (601233): 4家机构覆盖, 评级"买入", 目标价30.50元, 当前20.33元, 高位回撤
- 安井食品 (603345): 3家机构覆盖, 评级"买入", 目标价96.11元, 当前88.90元, 反弹修复

### 宏观环境
- 美联储: 紧缩预期持续，利率维持高位
- 原油: 地缘冲突推升油价，通胀压力上升
- 中美博弈: 贸易摩擦持续，影响出口和人民币定价

### 核心主题
1. 保险业绩兑现 — 中国人寿利润增速超预期
2. 化工景气上行 — 桐昆股份长丝高景气持续
3. 食品饮料需求改善 — 安井食品迎来新周期
4. 传媒资金涌入 — 主力资金连续大幅流入

## 回答规范
1. 回答要简洁精炼，每次回答控制在 200 字以内
2. 涉及具体个股时，要结合技术面和基本面数据
3. 必须附带风险提示
4. 不要给出具体的买卖点位或保证收益
5. 用中文回答
6. 如果用户问的问题超出你的专业范围，礼貌引导回金融话题`;

export async function POST(request: NextRequest) {
  const { messages } = await request.json();
  const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

  const config = new Config();
  const client = new LLMClient(config, customHeaders);

  const chatMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
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

        for await (const chunk of llmStream) {
          if (chunk.content) {
            const data = `data: ${JSON.stringify({ content: chunk.content.toString() })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const errMsg =
          error instanceof Error ? error.message : "Unknown error";
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
