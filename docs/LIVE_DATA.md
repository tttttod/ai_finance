# Live Data Guide

This document describes how to configure and use live market data from Tushare.

## Architecture

The platform uses a **"backend refresh, frontend read cache"** pattern:

- **Tushare API is only called by `POST /api/admin/refresh-market`**
- User pages only read from `GET /api/market-snapshot` (cached data)
- AI chat (`/api/chat`) reads the latest snapshot, never calls Tushare
- Browser-side code never sees the Tushare token

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
                                   │ reads
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

Run the SQL in `docs/database.sql` in your Supabase SQL Editor.

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
3. If no snapshot exists, returns mock data with `source: "mock"`
4. **No Tushare API call is made**

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
