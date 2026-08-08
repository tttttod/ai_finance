/**
 * Market snapshot persistence layer.
 *
 * Priority: Supabase (if SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set)
 * Fallback: local .cache/market-snapshot.json
 */

import type { MiniMarketSnapshot } from "./market-types";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const SNAPSHOT_FILE = path.join(CACHE_DIR, "market-snapshot.json");
const STOCK_BASIC_FILE = path.join(CACHE_DIR, "stock-basic.json");

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

// ---- Snapshot ----

export async function getLatestMarketSnapshot(): Promise<MiniMarketSnapshot | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("market_snapshots")
        .select("snapshot_data")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (!error && data?.snapshot_data) {
        return data.snapshot_data as MiniMarketSnapshot;
      }
    } catch {
      // fall through to file
    }
  }

  // File fallback
  try {
    if (fs.existsSync(SNAPSHOT_FILE)) {
      const raw = fs.readFileSync(SNAPSHOT_FILE, "utf-8");
      return JSON.parse(raw) as MiniMarketSnapshot;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function saveMarketSnapshot(
  snapshot: MiniMarketSnapshot,
): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from("market_snapshots").insert({
        snapshot_date: snapshot.snapshotDate,
        trade_date: snapshot.tradeDate,
        source: snapshot.source,
        stale: snapshot.stale,
        snapshot_data: snapshot,
      });
      return;
    } catch {
      // fall through to file
    }
  }

  // File fallback
  ensureCacheDir();
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2), "utf-8");
}

// ---- Stock basic cache ----

export async function getLatestStockBasicCache(): Promise<unknown[] | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("market_aux_cache")
        .select("cache_data, updated_at")
        .eq("cache_key", "stock_basic")
        .single();
      if (!error && data?.cache_data) {
        // Check if older than 7 days
        const updated = new Date(data.updated_at);
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (updated.getTime() > sevenDaysAgo) {
          return data.cache_data as unknown[];
        }
      }
    } catch {
      // fall through
    }
  }

  // File fallback
  try {
    if (fs.existsSync(STOCK_BASIC_FILE)) {
      const raw = fs.readFileSync(STOCK_BASIC_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      // Check age
      if (parsed._cachedAt) {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (new Date(parsed._cachedAt).getTime() > sevenDaysAgo) {
          return parsed.rows;
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export async function saveStockBasicCache(rows: unknown[]): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      // Upsert
      await sb.from("market_aux_cache").upsert(
        {
          cache_key: "stock_basic",
          cache_data: rows,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "cache_key" },
      );
      return;
    } catch {
      // fall through
    }
  }

  // File fallback
  ensureCacheDir();
  fs.writeFileSync(
    STOCK_BASIC_FILE,
    JSON.stringify({ _cachedAt: new Date().toISOString(), rows }, null, 2),
    "utf-8",
  );
}
