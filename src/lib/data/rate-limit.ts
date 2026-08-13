/**
 * Rate limiting for /api/stock-context.
 *
 * Rules:
 * - User-level: max 5 cache-miss refreshes per minute, max 50 per day
 * - Global-level: max 150 Tushare requests per minute (each miss costs 2)
 * - Cache hits do NOT consume rate limit
 */

import {
  getRateLimitBucket,
  incrementRateLimitBucket,
} from "./stock-context-store";

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: string;
  retryAfterSeconds?: number;
}

export interface RateLimitParams {
  userId: string;
  cost: number; // typically 2 (daily + daily_basic)
}

const USER_MINUTE_LIMIT = 5;
const USER_DAY_LIMIT = 50;
const GLOBAL_MINUTE_TUSHARE_BUDGET = 150;

export async function checkAndConsumeRateLimit(
  params: RateLimitParams,
): Promise<RateLimitCheckResult> {
  const { userId, cost } = params;
  const now = Date.now();

  // 1. Check user per-minute bucket
  const userMinuteKey = `user:${userId}:minute`;
  const userMinuteBucket = await getRateLimitBucket(userMinuteKey);

  if (userMinuteBucket && new Date(userMinuteBucket.resetAt) > new Date(now)) {
    if (userMinuteBucket.count + cost > USER_MINUTE_LIMIT) {
      const retryAfter = Math.ceil(
        (new Date(userMinuteBucket.resetAt).getTime() - now) / 1000,
      );
      return {
        allowed: false,
        reason: `用户每分钟最多 ${USER_MINUTE_LIMIT} 次刷新，请稍后再试`,
        retryAfterSeconds: retryAfter,
      };
    }
  }

  // 2. Check user per-day bucket
  const userDayKey = `user:${userId}:day`;
  const userDayBucket = await getRateLimitBucket(userDayKey);

  if (userDayBucket && new Date(userDayBucket.resetAt) > new Date(now)) {
    if (userDayBucket.count + cost > USER_DAY_LIMIT) {
      const retryAfter = Math.ceil(
        (new Date(userDayBucket.resetAt).getTime() - now) / 1000,
      );
      return {
        allowed: false,
        reason: `用户每日最多 ${USER_DAY_LIMIT} 次刷新，明日再试`,
        retryAfterSeconds: retryAfter,
      };
    }
  }

  // 3. Check global Tushare budget
  const globalKey = "global:tushare:minute";
  const globalBucket = await getRateLimitBucket(globalKey);

  if (globalBucket && new Date(globalBucket.resetAt) > new Date(now)) {
    if (globalBucket.count + cost > GLOBAL_MINUTE_TUSHARE_BUDGET) {
      const retryAfter = Math.ceil(
        (new Date(globalBucket.resetAt).getTime() - now) / 1000,
      );
      return {
        allowed: false,
        reason: "系统繁忙，请稍后再试",
        retryAfterSeconds: retryAfter,
      };
    }
  }

  // All checks passed — consume the buckets
  await incrementRateLimitBucket(userMinuteKey, 60, cost);
  await incrementRateLimitBucket(userDayKey, 86400, cost);
  await incrementRateLimitBucket(globalKey, 60, cost);

  return { allowed: true };
}
