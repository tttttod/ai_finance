import { NextRequest, NextResponse } from "next/server";
import { refreshMarketSnapshot } from "@/lib/data/market-snapshot-service";
import { isTushareConfigured } from "@/lib/data/market-snapshot-store";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/refresh-market
 *
 * 供外部 cron / 平台定时任务调用，复用统一刷新逻辑（带进程内锁防并发）。
 * 非交易时间调用会由 Tushare builder 自动回溯到最近一个交易日。
 *
 * 若服务端配置了 CRON_REFRESH_SECRET，则请求必须带 x-cron-secret 头；
 * 未配置则放行（建议在网关/基础设施层做限流）。
 */
export async function POST(request: NextRequest) {
  const expected = process.env.CRON_REFRESH_SECRET;
  if (expected) {
    const secret = request.headers.get("x-cron-secret");
    if (secret !== expected) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "x-cron-secret 不匹配" } },
        { status: 401 },
      );
    }
  }

  let hintDate: string | undefined;
  try {
    const body = await request.json();
    if (body && typeof body.trade_date === "string") {
      hintDate = body.trade_date;
    }
  } catch {
    // ignore
  }

  if (!isTushareConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TUSHARE_TOKEN_MISSING",
          message: "TUSHARE_TOKEN is not configured",
        },
      },
      { status: 500 },
    );
  }

  const outcome = await refreshMarketSnapshot(hintDate);
  if (!outcome.ok) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: outcome.errorCode || "REFRESH_FAILED",
          message: outcome.errorMessage || "refresh failed",
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      tradeDate: outcome.tradeDate,
      fetchedAt: outcome.fetchedAt,
      source: outcome.source,
      savedTo: outcome.savedTo,
    },
  });
}
