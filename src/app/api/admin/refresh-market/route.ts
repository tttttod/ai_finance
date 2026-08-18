import { NextRequest, NextResponse } from "next/server";
import { refreshMarketSnapshot } from "@/lib/data/market-snapshot-service";
import {
  getAdminSecret,
  isSupabaseConfigured,
  isTushareConfigured,
} from "@/lib/data/market-snapshot-store";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/refresh-market
 * 运维工具：强制从 Tushare 拉取最新行情并写入 Supabase。
 *
 * 鉴权：请求头 x-admin-secret 必须等于服务端环境变量
 *       ADMIN_REFRESH_SECRET（兼容 ADMIN_SECRET）。
 *
 * 请求体（可选 JSON）：{ "trade_date": "YYYYMMDD" }
 *
 * 成功返回：
 * {
 *   success: true,
 *   data: {
 *     tradeDate, fetchedAt, source, savedTo: { storage, table? },
 *     supabaseConfigured
 *   }
 * }
 *
 * 失败返回明确错误码：
 *   TUSHARE_TOKEN_MISSING / TUSHARE_AUTH_FAILED / TUSHARE_REQUEST_FAILED
 *   TUSHARE_API_ERROR / NO_TRADE_DATA / SUPABASE_NOT_CONFIGURED / SUPABASE_WRITE_FAILED
 *
 * 注意：本接口不删除或覆盖已有真实快照（INSERT 历史 + upsert 当日缓存）。
 */
export async function POST(request: NextRequest) {
  const expected = getAdminSecret();
  const secret = request.headers.get("x-admin-secret");

  if (!expected) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ADMIN_SECRET_NOT_CONFIGURED",
          message: "服务端未配置 ADMIN_REFRESH_SECRET，已拒绝刷新请求",
        },
      },
      { status: 500 },
    );
  }

  if (secret !== expected) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "x-admin-secret 不匹配",
        },
      },
      { status: 401 },
    );
  }

  // Optional: allow passing a specific trade_date
  let hintDate: string | undefined;
  try {
    const body = await request.json();
    if (body && typeof body.trade_date === "string") {
      hintDate = body.trade_date;
    }
  } catch {
    // no body or invalid JSON, ignore
  }

  if (!isTushareConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TUSHARE_TOKEN_MISSING",
          message: "服务端未配置 TUSHARE_TOKEN，无法拉取真实行情",
        },
      },
      { status: 500 },
    );
  }

  if (!isSupabaseConfigured()) {
    console.warn(
      "[admin/refresh-market] Supabase 未配置，本次将仅写入本地文件缓存（不推荐用于生产）",
    );
  }

  const outcome = await refreshMarketSnapshot(hintDate);

  if (!outcome.ok) {
    const status =
      outcome.errorCode === "TUSHARE_AUTH_FAILED" ? 502 :
      outcome.errorCode === "TUSHARE_TOKEN_MISSING" ? 500 :
      outcome.errorCode === "NO_TRADE_DATA" ? 502 : 500;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: outcome.errorCode || "REFRESH_FAILED",
          message: outcome.errorMessage || "刷新失败",
        },
      },
      { status },
    );
  }

  const savedToFile = outcome.savedTo?.storage === "file";
  if (savedToFile && isSupabaseConfigured()) {
    // Supabase 配置了但写到了文件，说明数据库写入失败
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SUPABASE_WRITE_FAILED",
          message: "Tushare 拉取成功，但写入 Supabase 失败（已回退本地文件）",
        },
        data: {
          tradeDate: outcome.tradeDate,
          fetchedAt: outcome.fetchedAt,
          source: outcome.source,
          savedTo: outcome.savedTo,
          supabaseConfigured: isSupabaseConfigured(),
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
      supabaseConfigured: isSupabaseConfigured(),
    },
  });
}
