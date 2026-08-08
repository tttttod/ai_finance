/**
 * GET /api/stock-context?query=600519
 *
 * Returns stock research context for a given stock.
 * - Cache hit: returns cached data, no Tushare call
 * - Cache miss: checks rate limit, then fetches from Tushare
 *
 * Headers:
 * - x-client-id: optional client identifier for rate limiting
 */

import { NextRequest, NextResponse } from "next/server";
import {
  resolveTsCode,
  buildStockResearchContext,
  getStockContextCacheKey,
  getStockContextCache,
  saveStockContextCache,
  appendWatchlistCandidate,
  getStockContextTTL,
} from "@/lib/data/stock-context-builder";
import { checkAndConsumeRateLimit } from "@/lib/data/rate-limit";

function getClientId(request: NextRequest): string {
  // Prefer explicit client ID header
  const clientId = request.headers.get("x-client-id");
  if (clientId) return clientId;

  // Fallback to IP
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return "anonymous";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query || !query.trim()) {
      return NextResponse.json(
        { success: false, error: "缺少 query 参数" },
        { status: 400 },
      );
    }

    // 1. Resolve stock identity
    const identity = await resolveTsCode(query.trim());
    if (!identity) {
      return NextResponse.json(
        { success: false, error: `无法识别股票: ${query}` },
        { status: 404 },
      );
    }

    // 2. Check cache
    const cacheKey = getStockContextCacheKey(identity.tsCode);
    const cached = await getStockContextCache(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cache: "hit",
      });
    }

    // 3. Cache miss — check rate limit
    const userId = getClientId(request);
    const rateLimitResult = await checkAndConsumeRateLimit({
      userId,
      cost: 2, // daily + daily_basic = 2 Tushare calls
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.reason || "请求过于频繁",
          retryAfterSeconds: rateLimitResult.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfterSeconds || 60),
          },
        },
      );
    }

    // 4. Build context from Tushare
    const context = await buildStockResearchContext(query.trim());

    // 5. Save to cache
    const ttl = getStockContextTTL();
    await saveStockContextCache(cacheKey, identity.tsCode, context, ttl);

    // 6. Record watchlist candidate
    await appendWatchlistCandidate(identity.tsCode, query.trim());

    return NextResponse.json({
      success: true,
      data: context,
      cache: "miss",
    });
  } catch (err) {
    console.error("[/api/stock-context] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "获取股票上下文失败",
        detail: (err as Error).message,
      },
      { status: 500 },
    );
  }
}
