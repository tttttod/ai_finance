/**
 * Market snapshot persistence layer.
 *
 * Priority: Supabase (if SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set)
 * Fallback: local .cache/market-snapshot.json
 *
 * 安全说明：本模块仅在服务端使用，严禁在浏览器端 import。
 * 所有环境变量（TUSHARE_TOKEN / SUPABASE_SERVICE_ROLE_KEY / ADIN_*）绝不能
 * 以 NEXT_PUBLIC_ 前缀暴露给浏览器。
 */

import type { MiniMarketSnapshot } from "./market-types";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// 服务端启动时记录一次配置状态（不输出任何密钥值，仅 true/false）
const LOG_PREFIX = "[market-store]";

/**
 * 三级持久化（按优先级）：
 *  1. 进程内存（warm 实例零开销命中，Serverless 同一实例内复用）
 *  2. /tmp（生产环境唯一保证可写的目录；容器/函数重启后失效但可兜底）
 *  3. 项目 .cache（本地/dev 环境持久化，生产只读时写入会失败被忽略）
 * 4. Supabase（如已配置）
 */
let memorySnapshot: MiniMarketSnapshot | null = null;
let memoryStockBasic: { rows: unknown[]; cachedAt: number } | null = null;

// 生产环境（Vercel/Serverless 等）唯一可靠可写目录是 /tmp
const TMP_DIR = "/tmp";
const CACHE_DIR = (() => {
  // 优先使用 /tmp（生产可写），其次项目内 .cache（dev 环境）
  try {
    fs.mkdirSync(path.join(TMP_DIR, ".coze-market-cache"), { recursive: true });
    fs.accessSync(TMP_DIR, fs.constants.W_OK);
    return path.join(TMP_DIR, ".coze-market-cache");
  } catch {
    return path.join(process.cwd(), ".cache");
  }
})();
const SNAPSHOT_FILE = path.join(CACHE_DIR, "market-snapshot.json");
const STOCK_BASIC_FILE = path.join(CACHE_DIR, "stock-basic.json");

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn(`${LOG_PREFIX} cannot create cache dir ${CACHE_DIR}:`, err instanceof Error ? err.message : err);
  }
}

export type EnvDiagnostic = {
  tushareConfigured: boolean;
  supabaseConfigured: boolean;
  adminSecretConfigured: boolean;
  missing: string[];
};

/**
 * 返回服务端环境变量配置诊断。只返回布尔和缺失变量名，绝不返回变量值。
 */
export function getEnvDiagnostic(): EnvDiagnostic {
  const missing: string[] = [];
  const tushareConfigured = !!process.env.TUSHARE_TOKEN;
  const supabaseUrl = !!process.env.SUPABASE_URL;
  const supabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseConfigured = supabaseUrl && supabaseKey;
  const adminSecretConfigured = !!(
    process.env.ADMIN_REFRESH_SECRET || process.env.ADMIN_SECRET
  );

  if (!tushareConfigured) missing.push("TUSHARE_TOKEN");
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!supabaseKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!adminSecretConfigured) missing.push("ADMIN_REFRESH_SECRET");

  return { tushareConfigured, supabaseConfigured, adminSecretConfigured, missing };
}

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!(url && key);
}

/**
 * Check if Tushare is configured
 */
export function isTushareConfigured(): boolean {
  return !!process.env.TUSHARE_TOKEN;
}

/**
 * 获取 admin 刷新接口的 secret（兼容 ADMIN_REFRESH_SECRET 与 ADMIN_SECRET）。
 */
export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_REFRESH_SECRET || process.env.ADMIN_SECRET;
}

function isRealSnapshot(s: MiniMarketSnapshot | null | undefined): boolean {
  if (!s) return false;
  // 归一化：旧值 "cache" 视为真实数据
  return s.source === "tushare" || s.source === "cache" || (s as { source?: string }).source === "database";
}

// ---- Snapshot ----

/**
 * 读取最近一次真实行情快照。
 * 兼容两种历史表名：market_snapshots（docs/database.sql）与 market_snapshot_cache（supabase/schema.sql）。
 * 只返回真实快照（source=tushare/cache/database），mock 快照会被忽略。
 */
export async function getLatestMarketSnapshot(): Promise<MiniMarketSnapshot | null> {
  // 1) 内存优先（warm 实例内最快）
  if (memorySnapshot && isRealSnapshot(memorySnapshot)) {
    return memorySnapshot;
  }

  const sb = getSupabase();
  if (sb) {
    // 1) 优先新表 market_snapshots
    try {
      const { data, error } = await sb
        .from("market_snapshots")
        .select("snapshot_data")
        .order("fetched_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data?.snapshot_data) {
        const snap = data.snapshot_data as MiniMarketSnapshot;
        if (isRealSnapshot(snap)) {
          memorySnapshot = { ...snap, persistedTo: "supabase" };
          return memorySnapshot;
        }
      }
    } catch (err) {
      console.warn(`${LOG_PREFIX} query market_snapshots failed:`, err instanceof Error ? err.message : err);
    }

    // 2) 兼容旧表 market_snapshot_cache
    try {
      const { data, error } = await sb
        .from("market_snapshot_cache")
        .select("snapshot_data")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data?.snapshot_data) {
        const snap = data.snapshot_data as MiniMarketSnapshot;
        if (isRealSnapshot(snap)) {
          memorySnapshot = { ...snap, persistedTo: "supabase" };
          return memorySnapshot;
        }
      } else if (error) {
        console.warn(`${LOG_PREFIX} query market_snapshot_cache failed:`, error.message);
      }
    } catch (err) {
      console.warn(`${LOG_PREFIX} query market_snapshot_cache failed:`, err instanceof Error ? err.message : err);
    }
  }

  // 3) File fallback (使用 /tmp 优先的 CACHE_DIR)
  try {
    if (fs.existsSync(SNAPSHOT_FILE)) {
      const raw = fs.readFileSync(SNAPSHOT_FILE, "utf-8");
      const snap = JSON.parse(raw) as MiniMarketSnapshot;
      if (isRealSnapshot(snap)) {
        memorySnapshot = { ...snap, persistedTo: "file" };
        return memorySnapshot;
      }
    }
  } catch (err) {
    console.warn(`${LOG_PREFIX} read file snapshot failed:`, err instanceof Error ? err.message : err);
  }
  return null;
}

export type SaveSnapshotResult = {
  storage: "supabase" | "file" | "memory";
  table?: string;
  tradeDate?: string;
  fetchedAt?: string;
};

/**
 * 保存真实行情快照。写入 Supabase 失败时回退本地文件。
 * 绝不删除或覆盖已有真实快照 —— 新快照是 INSERT，旧快照作为历史保留。
 * 同时写入进程内存，warm 实例后续零开销命中。
 */
export async function saveMarketSnapshot(
  snapshot: MiniMarketSnapshot,
): Promise<SaveSnapshotResult> {
  // 始终先更新内存缓存
  memorySnapshot = { ...snapshot, persistedTo: memorySnapshot?.persistedTo };

  const sb = getSupabase();
  if (sb) {
    // 1) 新表 market_snapshots
    try {
      const { error } = await sb.from("market_snapshots").insert({
        snapshot_date: snapshot.snapshotDate,
        trade_date: snapshot.tradeDate,
        source: "tushare",
        stale: false,
        snapshot_data: snapshot,
      });
      if (!error) {
        memorySnapshot = { ...snapshot, persistedTo: "supabase" };
        return { storage: "supabase", table: "market_snapshots", tradeDate: snapshot.tradeDate, fetchedAt: snapshot.fetchedAt };
      }
      console.warn(`${LOG_PREFIX} insert market_snapshots failed:`, error.message);
    } catch (err) {
      console.warn(`${LOG_PREFIX} insert market_snapshots threw:`, err instanceof Error ? err.message : err);
    }

    // 2) 兼容旧表 market_snapshot_cache（upsert by snapshot_date）
    try {
      const nowIso = new Date().toISOString();
      const { error } = await sb.from("market_snapshot_cache").upsert(
        {
          snapshot_date: snapshot.snapshotDate,
          snapshot_data: snapshot,
          source: "tushare",
          updated_at: nowIso,
        },
        { onConflict: "snapshot_date" },
      );
      if (!error) {
        memorySnapshot = { ...snapshot, persistedTo: "supabase" };
        return { storage: "supabase", table: "market_snapshot_cache", tradeDate: snapshot.tradeDate, fetchedAt: snapshot.fetchedAt };
      }
      console.warn(`${LOG_PREFIX} upsert market_snapshot_cache failed:`, error.message);
    } catch (err) {
      console.warn(`${LOG_PREFIX} upsert market_snapshot_cache threw:`, err instanceof Error ? err.message : err);
    }
  }

  // 3) File fallback (优先 /tmp，生产可写)
  try {
    ensureCacheDir();
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2), "utf-8");
    memorySnapshot = { ...snapshot, persistedTo: "file" };
    return { storage: "file", tradeDate: snapshot.tradeDate, fetchedAt: snapshot.fetchedAt };
  } catch (err) {
    console.warn(`${LOG_PREFIX} write file snapshot failed (will rely on memory cache):`, err instanceof Error ? err.message : err);
    // 文件也写失败时，内存仍有本次快照，至少当前实例可复用
    return { storage: "memory", tradeDate: snapshot.tradeDate, fetchedAt: snapshot.fetchedAt };
  }
}

// ---- Stock basic cache ----
// 注意：docs/database.sql 把 market_aux_cache 的 JSON 列命名为 data，
// 而历史代码使用 cache_data。这里同时兼容两种列名。

export async function getLatestStockBasicCache(): Promise<unknown[] | null> {
  // 内存优先
  if (memoryStockBasic) {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (memoryStockBasic.cachedAt > sevenDaysAgo) {
      return memoryStockBasic.rows;
    }
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("market_aux_cache")
        .select("cache_data, data, updated_at")
        .eq("cache_key", "stock_basic")
        .maybeSingle();
      if (!error && data) {
        const rows = (data.cache_data ?? data.data) as unknown[] | null;
        if (rows && Array.isArray(rows)) {
          const updated = new Date((data.updated_at as string) ?? Date.now());
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          if (updated.getTime() > sevenDaysAgo) {
            memoryStockBasic = { rows, cachedAt: updated.getTime() };
            return rows;
          }
        }
      } else if (error) {
        console.warn(`${LOG_PREFIX} query market_aux_cache failed:`, error.message);
      }
    } catch (err) {
      console.warn(`${LOG_PREFIX} query market_aux_cache threw:`, err instanceof Error ? err.message : err);
    }
  }

  // File fallback
  try {
    if (fs.existsSync(STOCK_BASIC_FILE)) {
      const raw = fs.readFileSync(STOCK_BASIC_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed._cachedAt) {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (new Date(parsed._cachedAt).getTime() > sevenDaysAgo) {
          memoryStockBasic = { rows: parsed.rows, cachedAt: new Date(parsed._cachedAt).getTime() };
          return parsed.rows as unknown[];
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export async function saveStockBasicCache(rows: unknown[]): Promise<void> {
  // 始终更新内存
  memoryStockBasic = { rows, cachedAt: Date.now() };

  const sb = getSupabase();
  if (sb) {
    // 优先写 cache_data 列；若列不存在则回退 data 列
    try {
      const { error } = await sb.from("market_aux_cache").upsert(
        {
          cache_key: "stock_basic",
          cache_data: rows,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "cache_key" },
      );
      if (!error) return;
      console.warn(`${LOG_PREFIX} upsert market_aux_cache.cache_data failed:`, error.message);
    } catch (err) {
      console.warn(`${LOG_PREFIX} upsert market_aux_cache.cache_data threw:`, err instanceof Error ? err.message : err);
    }

    try {
      const { error } = await sb.from("market_aux_cache").upsert(
        {
          cache_key: "stock_basic",
          data: rows,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "cache_key" },
      );
      if (!error) return;
      console.warn(`${LOG_PREFIX} upsert market_aux_cache.data failed:`, error.message);
    } catch (err) {
      console.warn(`${LOG_PREFIX} upsert market_aux_cache.data threw:`, err instanceof Error ? err.message : err);
    }
  }

  // File fallback
  try {
    ensureCacheDir();
    fs.writeFileSync(
      STOCK_BASIC_FILE,
      JSON.stringify({ _cachedAt: new Date().toISOString(), rows }, null, 2),
      "utf-8",
    );
  } catch (err) {
    console.warn(`${LOG_PREFIX} write stock_basic file failed:`, err instanceof Error ? err.message : err);
  }
}
