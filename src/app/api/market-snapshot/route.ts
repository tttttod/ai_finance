import { NextResponse } from "next/server";
import { getMarketSnapshotForRequest } from "@/lib/data/market-snapshot-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/market-snapshot
 *
 * 首页「今日市场」唯一行情来源。普通用户只读 Supabase 缓存：
 *  - 有真实快照：直接返回（可能 isStale），不阻塞
 *  - 无任何真实快照：若 TUSHARE_TOKEN 已配置则同步首次初始化
 *  - 交易时间内快照过期：fire-and-forget 后台刷新
 *  - 仅在无 token / 初始化失败且无历史快照时返回 mock（isDemo=true）
 *
 * 本接口响应不包含任何内部配置（token、secret、是否配置等）。
 */
export async function GET() {
  try {
    const { response, meta } = await getMarketSnapshotForRequest();
    return NextResponse.json({
      success: true,
      data: response,
      // meta 仅给前端做轻量行为判断（是否刚刚首次初始化、后台是否在刷新），
      // 不含任何敏感配置
      meta: {
        initialInit: meta.initialInit,
        backgroundRefresh: meta.backgroundRefresh,
      },
    });
  } catch (err) {
    console.error("[market-snapshot] unhandled error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: "市场数据暂时不可用，请稍后重试" },
      { status: 500 },
    );
  }
}
