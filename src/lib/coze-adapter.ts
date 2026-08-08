// Coze API 适配器（预留）
// 后续只需替换 API Key、Bot ID 或 Workflow ID 即可接入真实 Coze

export interface CozeConfig {
  apiKey: string;
  botId?: string;
  workflowId?: string;
  baseUrl?: string;
}

const DEFAULT_CONFIG: CozeConfig = {
  apiKey: process.env.NEXT_PUBLIC_COZE_API_KEY || "",
  botId: process.env.NEXT_PUBLIC_COZE_BOT_ID || "",
  workflowId: process.env.NEXT_PUBLIC_COZE_WORKFLOW_ID || "",
  baseUrl: "https://api.coze.cn",
};

export class CozeAdapter {
  private config: CozeConfig;

  constructor(config?: Partial<CozeConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async sendResearchRequest(params: {
    target: string;
    style: string;
    period: string;
    step: number;
  }): Promise<Response> {
    // TODO: 实现真实 Coze API 调用
    // 当前返回 Mock 响应
    console.log("CozeAdapter: 使用 Mock 模式", params);
    throw new Error("Coze API 未配置，当前使用 Mock 模式");
  }

  async sendChatMessage(_messages: unknown[], _context?: unknown): Promise<ReadableStream> {
    // TODO: 实现真实 Coze 流式对话
    throw new Error("Coze API 未配置，当前使用 Mock 模式");
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
}

export const cozeAdapter = new CozeAdapter();
