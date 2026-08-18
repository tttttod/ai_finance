/**
 * Market snapshot orchestration service (server-side only).
 *
 * 统一处理：
 *  - 读取 Supabase / 文件中的历史真实快照
 *  - 首次部署无数据时同步初始化（不受交易时间限制）
 *  - 交易时间内快照过期时的后台刷新（fire-and-forget + 进程内刷新锁）
 *  - 刷新失败保留旧快照
 *  - mock 兜底
 *
 * 严禁在浏览器端 import 本模块。
 */

import { buildMarketSnapshotFromTushare } from "./market-snapshot-builder";
import {
  getLatestMarketSnapshot,
  saveMarketSnapshot,
  isTushareConfigured,
  isSupabaseConfigured,
  getEnvDiagnostic,
  type SaveSnapshotResult,
} from "./market-snapshot-store";
import { isSnapshotStale, isTradingTime } from "./market-refresh-policy";
import { TushareError } from "./tushare-client";
import { mockMarketData, mockRecommendedTargets } from "../mini-mock";
import type {
  MiniMarketSnapshot,
  MarketSnapshotResponse,
  MarketSnapshotSource,
} from "./market-types";

const LOG_PREFIX = "[market-snapshot]";

// 进程内刷新锁：避免高并发下多个请求同时打 Tushare
let refreshInFlight = false;
let lastRefreshAt = 0;
// 刷新最小间隔（毫秒），防止短时间重复刷新（首次初始化不受此限制）
const REFRESH_LOCK_MS = 60 * 1000;

export type RefreshOutcome = {
  ok: boolean;
  source: "tushare" | "mock";
  savedTo?: SaveSnapshotResult;
  tradeDate?: string;
  fetchedAt?: string;
  errorCode?: string;
  errorMessage?: string;
};

function buildMockSnapshot(): MiniMarketSnapshot {
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  return {
    snapshotDate: today,
    tradeDate: today,
    fetchedAt: new Date().toISOString(),
    source: "mock",
    stale: false,
    summary: mockMarketData.summary,
    indices: mockMarketData.indices,
    hotSectors: mockMarketData.hotSectors,
    activeStocks: mockMarketData.activeStocks,
    recommendedTargets: mockRecommendedTargets,
    events: mockMarketData.events as {
      time: string;
      title: string;
      impact: "positive" | "negative" | "neutral";
    }[],
  };
}

/**
 * 将内部快照归一化为对外响应结构。
 *  - 从存储（Supabase/文件）读出的真实快照，source 归一为 database/file
 *  - 本次请求实时拉取的保留 tushare
 *  - 增加 updatedAt / isStale / isDemo
 */
export function toResponse(
  snapshot: MiniMarketSnapshot,
  opts?: { justFetched?: boolean },
): MarketSnapshotResponse {
  let source: MarketSnapshotSource;
  if (snapshot.source === "mock") {
    source = "mock";
  } else if (opts?.justFetched) {
    source = "tushare";
  } else if (snapshot.persistedTo === "file") {
    source = "file";
  } else {
    // 真实快照且来自 Supabase（或未标记持久化位置），统一为 database
    source = "database";
  }

  const isStale = snapshot.stale === true;
  return {
    ...snapshot,
    source,
    updatedAt: snapshot.fetchedAt,
    isStale,
    isDemo: source === "mock",
  };
}

function classifyTushareError(err: unknown): { code: string; message: string } {
  if (err instanceof TushareError) {
    switch (err.code) {
      case "TOKEN_MISSING":
        return { code: "TUSHARE_TOKEN_MISSING", message: err.message };
      case "AUTH_FAILED":
        return { code: "TUSHARE_AUTH_FAILED", message: err.message };
      case "HTTP_ERROR":
        return { code: "TUSHARE_REQUEST_FAILED", message: err.message };
      case "NETWORK_ERROR":
        return { code: "TUSHARE_REQUEST_FAILED", message: err.message };
      case "API_ERROR":
      default:
        return { code: "TUSHARE_API_ERROR", message: err.message };
    }
  }
  const message = err instanceof Error ? err.message : "unknown error";
  if (message.startsWith("NO_TRADE_DATA")) {
    return { code: "NO_TRADE_DATA", message };
  }
  return { code: "TUSHARE_REQUEST_FAILED", message };
}

/**
 * 执行一次真实刷新：Tushare -> 保存 -> 返回结果。
 * 供 /api/market-snapshot 首次初始化、/api/admin/refresh-market、cron 复用。
 */
export async function refreshMarketSnapshot(
  hintDate?: string,
): Promise<RefreshOutcome> {
  if (!isTushareConfigured()) {
    return {
      ok: false,
      source: "mock",
      errorCode: "TUSHARE_TOKEN_MISSING",
      errorMessage: "TUSHARE_TOKEN is not configured",
    };
  }

  try {
    const fresh = await buildMarketSnapshotFromTushare(hintDate);
    const savedTo = await saveMarketSnapshot(fresh);
    lastRefreshAt = Date.now();
    console.info(LOG_PREFIX, "refresh ok", {
      tradeDate: fresh.tradeDate,
      storage: savedTo.storage,
      table: savedTo.table,
    });
    return {
      ok: true,
      source: "tushare",
      savedTo,
      tradeDate: fresh.tradeDate,
      fetchedAt: fresh.fetchedAt,
    };
  } catch (err) {
    const classified = classifyTushareError(err);
    console.error(LOG_PREFIX, "refresh failed", classified);
    return {
      ok: false,
      source: "mock",
      errorCode: classified.code,
      errorMessage: classified.message,
    };
  }
}

/**
 * 后台刷新（fire-and-forget），带进程内锁防并发。
 */
function triggerBackgroundRefresh(): { triggered: boolean; reason?: string } {
  if (refreshInFlight) {
    return { triggered: false, reason: "refresh_in_flight" };
  }
  if (Date.now() - lastRefreshAt < REFRESH_LOCK_MS) {
    return { triggered: false, reason: "rate_limited" };
  }
  refreshInFlight = true;
  // 不 await，后台执行
  (async () => {
    try {
      await refreshMarketSnapshot();
    } finally {
      refreshInFlight = false;
    }
  })();
  return { triggered: true };
}

/**
 * 核心入口：为首页请求返回一个快照。
 *
 * 流程：
 *  1) 读 Supabase / 文件，命中真实快照即返回（可能带 stale 标记，由刷新策略决定）
 *  2) 若无任何真实快照：
 *     - TUSHARE_TOKEN 已配置 -> 同步执行首次初始化（不受交易时间限制）
 *     - 未配置 -> 返回 mock
 *  3) 若有真实快照但已过期且在交易时间 -> 触发后台刷新；本次仍返回旧快照
 *  4) 任何 Tushare/数据库错误都不影响已存在的真实快照返回
 */
export async function getMarketSnapshotForRequest(): Promise<{
  snapshot: MiniMarketSnapshot;
  response: MarketSnapshotResponse;
  meta: {
    initialInit: boolean;
    backgroundRefresh: boolean;
    backgroundReason?: string;
  };
}> {
  const diag = getEnvDiagnostic();
  console.info(LOG_PREFIX, "env", {
    tushare: diag.tushareConfigured,
    supabase: diag.supabaseConfigured,
    adminSecret: diag.adminSecretConfigured,
    missing: diag.missing,
  });

  const existing = await getLatestMarketSnapshot();
  const trading = isTradingTime();

  if (existing) {
    const stale = isSnapshotStale(existing.fetchedAt);
    const returning: MiniMarketSnapshot = { ...existing, stale };
    let backgroundRefresh = false;
    let backgroundReason: string | undefined;

    if (stale && trading && isTushareConfigured()) {
      const r = triggerBackgroundRefresh();
      backgroundRefresh = r.triggered;
      backgroundReason = r.reason;
      if (r.triggered) {
        console.info(LOG_PREFIX, "background refresh triggered", {
          tradeDate: existing.tradeDate,
          fetchedAt: existing.fetchedAt,
        });
      }
    }

    return {
      snapshot: returning,
      response: toResponse(returning),
      meta: { initialInit: false, backgroundRefresh, backgroundReason },
    };
  }

  // 数据库与文件都没有真实快照 -> 首次初始化
  console.info(LOG_PREFIX, "no existing snapshot, first-time init", {
    tushare: isTushareConfigured(),
    trading,
  });

  if (isTushareConfigured()) {
    const outcome = await refreshMarketSnapshot();
    if (outcome.ok) {
      // 优先从持久化层读取完整快照返回
      const saved = await getLatestMarketSnapshot();
      if (saved) {
        const realSnapshot: MiniMarketSnapshot = { ...saved, stale: false };
        return {
          snapshot: realSnapshot,
          response: toResponse(realSnapshot, { justFetched: true }),
          meta: { initialInit: true, backgroundRefresh: false },
        };
      }
    }
    // 初始化失败：记录明确日志，回退 mock
    console.warn(LOG_PREFIX, "first-time init failed, fallback to mock", {
      errorCode: outcome.errorCode,
      errorMessage: outcome.errorMessage,
      tushareConfigured: isTushareConfigured(),
      supabaseConfigured: isSupabaseConfigured(),
    });
  } else {
    console.warn(
      LOG_PREFIX,
      "TUSHARE_TOKEN not configured, serving mock snapshot",
    );
  }

  const mock = buildMockSnapshot();
  return {
    snapshot: mock,
    response: toResponse(mock),
    meta: { initialInit: false, backgroundRefresh: false },
  };
}

// 便于管理/调试：判断 Supabase / Tushare 是否配置（仅服务端内部使用）
export function getRuntimeConfigStatus() {
  return {
    tushareConfigured: isTushareConfigured(),
    supabaseConfigured: isSupabaseConfigured(),
  };
}
