# Live Data Guide

This document describes how to configure and use live market data from Tushare.

## Architecture

The platform uses a **"backend refresh, frontend read cache"** pattern:

- **Tushare API is only called server-side**, by `POST /api/admin/refresh-market`,
  `POST /api/cron/refresh-market`, or by the auto-init/background-refresh logic
  inside `GET /api/market-snapshot`.
- **First deploy auto-init (new)**: if Supabase / file cache has no real snapshot
  at all and `TUSHARE_TOKEN` is configured, the first user request triggers a
  real fetch **synchronously** (regardless of trading hours / weekends / holidays —
  Tushare builder walks back up to 7 days to find the latest trade date). No
  manual call to `refresh-market` is required for production to show real data.
- After first init, user pages only read Supabase / file cache; during trading
  hours a stale snapshot triggers a **background (fire-and-forget) refresh**,
  guarded by an in-process 60-second lock to avoid hammering Tushare under traffic.
- If a refresh fails, the previous real snapshot is **kept and returned** with
  `isStale: true`. Mock data is used only when there is no real snapshot AND
  Tushare is unavailable / unconfigured.
- Browser-side code never sees the Tushare token or any service-role key.

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Cron / Admin   │────▶│ POST /api/admin/     │────▶│  Tushare    │
│  (定时刷新)      │     │      refresh-market   │     │  API        │
└─────────────────┘     └──────────┬───────────┘     └─────────────┘
                                   │ saves
                                   ▼
                          ┌──────────────────┐
                          │  Supabase / File  │
                          │  (snapshot cache) │
                          └────────┬─────────┘
                                   │ reads / first-init / background refresh
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            GET /api/       GET /api/       POST /api/
            market-snapshot sectors/*       chat
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TUSHARE_TOKEN` | Yes (for live data) | Tushare API token. Server-side only. |
| `TUSHARE_BASE_URL` | No | Default: `http://api.tushare.pro` |
| `ADMIN_REFRESH_SECRET` | Yes (for refresh API) | Secret key for admin refresh endpoint |
| `DATA_MODE` | No | `live` (default) or `mock` |
| `SUPABASE_URL` | No | Supabase project URL. If not set, uses file cache. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key. Server-side only. |

**IMPORTANT**: Never expose `TUSHARE_TOKEN` or `SUPABASE_SERVICE_ROLE_KEY` to the browser. Do NOT use `NEXT_PUBLIC_` prefix for these variables.

## Setup Steps

### 1. Configure Environment Variables

Add to your deployment environment:

```bash
TUSHARE_TOKEN=your_tushare_token_here
ADMIN_REFRESH_SECRET=your_secret_key_here
DATA_MODE=live
# Optional: Supabase for persistent storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Create Database Tables (Optional, for Supabase)

Run the latest migration in Supabase SQL editor:

- `supabase/migrations/20260815_market_snapshot_cache.sql` (canonical, idempotent)

The migration creates `market_snapshots` (append-only history), `market_aux_cache`
(stock_basic cache, with both `cache_data` and legacy `data` columns), and the
legacy `market_snapshot_cache` table for backward compatibility. The server
code auto-detects which tables exist and writes to all compatible targets, so
upgrades from older schemas do not require data migration.

If Supabase is not configured, the system falls back to file-based cache in `.cache/` directory.

### 3. Manual Refresh

```bash
curl -X POST http://localhost:5000/api/admin/refresh-market \
  -H "x-admin-secret: your_secret_key_here" \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "success": true,
  "data": {
    "tradeDate": "20260313",
    "fetchedAt": "2026-03-13T16:30:00.000Z",
    "source": "tushare",
    "stale": false
  }
}
```

### 4. Scheduled Refresh (Recommended)

Set up a cron job or scheduled task to call the refresh API daily after market close (16:30 CST):

```bash
# Example crontab entry (runs at 16:30 CST / 08:30 UTC every weekday)
30 8 * * 1-5 curl -s -X POST http://localhost:5000/api/admin/refresh-market -H "x-admin-secret: your_secret"
```

Or use Coze scheduled workflow / external cron service.

## Data Flow

### User Page Load
1. Browser calls `GET /api/market-snapshot`
2. Server reads latest snapshot from Supabase / file cache
3. If a real snapshot exists, it is returned immediately (with `isStale` flag when older than 30 min)
4. If no real snapshot exists AND `TUSHARE_TOKEN` is configured, server performs a **synchronous first-time init** from Tushare (works outside trading hours), persists it, then returns the real snapshot
5. If the real snapshot is stale AND currently within A-share trading hours, a **background refresh** is triggered (in-process 60s lock); the current response still returns the old snapshot marked `isStale: true`
6. Refresh failures never delete/downgrade existing real snapshots
7. Only when there is no real snapshot AND Tushare is unavailable/unconfigured does the API return mock data (`source: "mock", isDemo: true`)

### AI Chat
1. Browser sends message to `POST /api/chat`
2. Server reads latest snapshot for context
3. Builds system prompt with market data from snapshot
4. If no snapshot, uses "Demo/缓存数据" label
5. **No Tushare API call is made**

### Admin Refresh
1. Admin/cron calls `POST /api/admin/refresh-market` with secret header
2. Server validates secret, then calls Tushare APIs
3. Builds new snapshot from Tushare data
4. Saves to Supabase / file cache
5. Returns metadata

## Fallback Behavior

- If Tushare API fails during refresh, the system keeps the old snapshot and marks it as `stale: true`
- If no snapshot exists at all, the frontend falls back to built-in mock data
- Users always see something — no blank screens

## File Cache (No Supabase)

If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are not set, data is stored in:

- `.cache/market-snapshot.json` — latest market snapshot
- `.cache/stock-basic.json` — cached stock basic info
- `.cache/user-feedback.jsonl` — user feedback entries (append-only)

These files are in `.gitignore` and should not be committed.

---

## Phase 2: Stock Context API (Per-Stock Research)

The second page (Research Tab) supports per-stock analysis with real-time data from Tushare.

### Architecture

```
User clicks "Start Research"
         │
         ▼
GET /api/stock-context?query=600519
         │
         ├─ Cache hit? → Return cached context (no Tushare call)
         │
         └─ Cache miss? → Check rate limit
                            │
                            ├─ Rate limited? → 429 Too Many Requests
                            │
                            └─ Allowed → Call Tushare (daily + daily_basic)
                                         → Build context → Cache → Return
```

### API Usage

```bash
# Get stock context (frontend calls this)
GET /api/stock-context?query=600519
GET /api/stock-context?query=贵州茅台

# Headers
x-client-id: <client-id>  # Generated by frontend, stored in localStorage
```

### Response Format

```json
{
  "success": true,
  "data": {
    "stock": { "tsCode": "600519.SH", "name": "贵州茅台", "industry": "白酒" },
    "quote": { "tradeDate": "20260807", "close": 1800, "pctChg": 1.5 },
    "valuation": { "pe": 35, "pb": 10, "totalMv": 2200000 },
    "technical": { "ma20": 1750, "ma60": 1700, "trend": "bullish" },
    "dataQuality": { "source": "tushare", "stale": false, "missing": [] }
  },
  "cache": "miss"
}
```

### Cache Strategy

- **TTL**: 10 minutes (covers intraday trading)
- **Cache key**: `stock-context:${tsCode}:v1`
- **Cache hit**: No Tushare API call, returns immediately
- **Cache miss**: Calls Tushare (2 API calls: daily + daily_basic)

### Rate Limiting

| Scope | Limit | Window |
|-------|-------|--------|
| Per user | 5 cache-miss refreshes | 1 minute |
| Per user | 50 cache-miss refreshes | 1 day |
| Global | 150 Tushare request budget | 1 minute |

- Cache hits do NOT consume rate limit (no Tushare call)
- Each cache miss costs 2 Tushare requests (daily + daily_basic)
- Rate limited requests return HTTP 429 with `retryAfterSeconds`

### Client ID

Frontend generates a unique client ID and stores it in `localStorage`:
```javascript
let clientId = localStorage.getItem("client-id");
if (!clientId) {
  clientId = crypto.randomUUID();
  localStorage.setItem("client-id", clientId);
}
```

This ID is sent as `x-client-id` header with each `/api/stock-context` request.

### Safety Budget (2000 Tushare Credits)

With a 2000-credit Tushare account:
- Global limit: 150 requests/minute ≈ 75 stock contexts/minute
- Daily safe budget: ~500 stock context refreshes (2 calls each)
- Per user: max 50 refreshes/day

### File Cache (No Supabase)

Stock context cache files:
- `.cache/stock-context-cache.json` — per-stock context cache
- `.cache/rate-limit.json` — rate limit buckets
