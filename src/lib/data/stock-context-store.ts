/**
 * Stock context cache + watchlist + rate-limit bucket persistence.
 *
 * Priority: Supabase (if configured) → local .cache JSON files.
 */

import type { StockResearchContext } from "./stock-context-types";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const STOCK_CTX_FILE = path.join(CACHE_DIR, "stock-context-cache.json");
const WATCHLIST_FILE = path.join(CACHE_DIR, "stock-watchlist.jsonl");
const RATE_LIMIT_FILE = path.join(CACHE_DIR, "rate-limit.json");

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

// ========== Stock Context Cache ==========

interface CacheFileShape {
  [cacheKey: string]: {
    tsCode: string;
    payload: StockResearchContext;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
  };
}

function readCacheFile(): CacheFileShape {
  try {
    if (fs.existsSync(STOCK_CTX_FILE)) {
      return JSON.parse(fs.readFileSync(STOCK_CTX_FILE, "utf-8"));
    }
  } catch {
    // ignore
  }
  return {};
}

function writeCacheFile(data: CacheFileShape) {
  ensureCacheDir();
  fs.writeFileSync(STOCK_CTX_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function getStockContextCache(
  cacheKey: string,
): Promise<StockResearchContext | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("stock_context_cache")
        .select("payload, expires_at")
        .eq("cache_key", cacheKey)
        .single();
      if (!error && data) {
        if (new Date(data.expires_at) > new Date()) {
          return data.payload as StockResearchContext;
        }
      }
    } catch {
      // fall through
    }
  }

  const file = readCacheFile();
  const entry = file[cacheKey];
  if (!entry) return null;
  if (new Date(entry.expiresAt) <= new Date()) return null;
  return entry.payload;
}

export async function saveStockContextCache(
  cacheKey: string,
  tsCode: string,
  context: StockResearchContext,
  ttlSeconds: number,
): Promise<void> {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from("stock_context_cache").upsert(
        {
          cache_key: cacheKey,
          ts_code: tsCode,
          payload: context as unknown as Record<string, unknown>,
          expires_at: expiresAt,
          updated_at: now,
        },
        { onConflict: "cache_key" },
      );
      return;
    } catch {
      // fall through
    }
  }

  const file = readCacheFile();
  file[cacheKey] = {
    tsCode,
    payload: context,
    expiresAt,
    createdAt: file[cacheKey]?.createdAt || now,
    updatedAt: now,
  };
  writeCacheFile(file);
}

// ========== Watchlist ==========

export async function appendWatchlistCandidate(
  tsCode: string,
  query: string,
): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from("stock_watchlist_candidates").insert({
        ts_code: tsCode,
        query,
      });
      return;
    } catch {
      // fall through
    }
  }

  ensureCacheDir();
  const line = JSON.stringify({
    tsCode,
    query,
    createdAt: new Date().toISOString(),
  });
  fs.appendFileSync(WATCHLIST_FILE, line + "\n", "utf-8");
}

// ========== Rate Limit ==========

interface RateLimitFileShape {
  [key: string]: {
    count: number;
    resetAt: string;
  };
}

function readRateLimitFile(): RateLimitFileShape {
  try {
    if (fs.existsSync(RATE_LIMIT_FILE)) {
      return JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, "utf-8"));
    }
  } catch {
    // ignore
  }
  return {};
}

function writeRateLimitFile(data: RateLimitFileShape) {
  ensureCacheDir();
  fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function getRateLimitBucket(
  key: string,
): Promise<{ count: number; resetAt: string } | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("rate_limit_buckets")
        .select("count, reset_at")
        .eq("key", key)
        .single();
      if (!error && data) {
        return { count: data.count, resetAt: data.reset_at };
      }
    } catch {
      // fall through
    }
  }

  const file = readRateLimitFile();
  return file[key] || null;
}

export async function incrementRateLimitBucket(
  key: string,
  windowSeconds: number,
  cost: number = 1,
): Promise<{ count: number; resetAt: string }> {
  const sb = getSupabase();
  const now = new Date();

  // Get or create bucket
  let bucket = await getRateLimitBucket(key);

  if (!bucket || new Date(bucket.resetAt) <= now) {
    // Reset window
    bucket = {
      count: cost,
      resetAt: new Date(now.getTime() + windowSeconds * 1000).toISOString(),
    };
  } else {
    bucket = { ...bucket, count: bucket.count + cost };
  }

  if (sb) {
    try {
      await sb.from("rate_limit_buckets").upsert(
        {
          key,
          count: bucket.count,
          reset_at: bucket.resetAt,
          updated_at: now.toISOString(),
        },
        { onConflict: "key" },
      );
      return bucket;
    } catch {
      // fall through
    }
  }

  const file = readRateLimitFile();
  file[key] = bucket;
  writeRateLimitFile(file);
  return bucket;
}
