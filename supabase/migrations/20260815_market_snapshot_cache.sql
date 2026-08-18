-- ============================================================
-- 行情快照缓存表（首页「今日市场」/api/market-snapshot 使用）
--
-- 设计要点：
--  1. market_snapshots 是主表，每次刷新 INSERT 一条历史快照；
--     读取时按 fetched_at DESC 取最近一条，失败时仍可返回旧数据。
--  2. market_aux_cache 缓存 stock_basic 等低频更新数据，减少 Tushare 调用。
--  3. service_role 拥有全部权限；anon 仅允许读取快照（便于直接走 Supabase
--     查询的场景），写入仅由后端用 SERVICE_ROLE_KEY 完成。
--  4. 本文件可重复执行（IF NOT EXISTS / ON CONFLICT）。
-- ============================================================

-- ---------- 1. market_snapshots ----------
CREATE TABLE IF NOT EXISTS public.market_snapshots (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date text       NOT NULL,
  trade_date   text        NOT NULL,
  fetched_at   timestamptz NOT NULL DEFAULT now(),
  source       text        NOT NULL DEFAULT 'tushare',
  stale        boolean     NOT NULL DEFAULT false,
  summary      text,
  snapshot_data jsonb      NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_snapshots_fetched_at
  ON public.market_snapshots (fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_snapshots_trade_date
  ON public.market_snapshots (trade_date DESC);

-- RLS：默认关闭（service_role 绕过 RLS 即可读写；如需开放 anon 只读再启用）
ALTER TABLE public.market_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "market_snapshots_anon_read" ON public.market_snapshots;
CREATE POLICY "market_snapshots_anon_read"
  ON public.market_snapshots
  FOR SELECT
  TO anon
  USING (true);

-- service_role 不走 RLS，默认拥有全表权限。

-- ---------- 2. market_aux_cache ----------
CREATE TABLE IF NOT EXISTS public.market_aux_cache (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key   text        NOT NULL UNIQUE,
  cache_data  jsonb       NOT NULL DEFAULT '[]'::jsonb,
  data        jsonb,                       -- 兼容历史列名
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 若旧库只有 data 列，这里做幂等补列
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'market_aux_cache'
      AND column_name = 'cache_data'
  ) THEN
    ALTER TABLE public.market_aux_cache ADD COLUMN cache_data jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END$$;

ALTER TABLE public.market_aux_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "market_aux_cache_anon_read" ON public.market_aux_cache;
CREATE POLICY "market_aux_cache_anon_read"
  ON public.market_aux_cache
  FOR SELECT
  TO anon
  USING (true);

-- ---------- 3. 兼容旧表 market_snapshot_cache ----------
-- 部分早期环境可能已存在 supabase/schema.sql 定义的 market_snapshot_cache 表，
-- 代码会自动读写该表作为兜底；这里仅在不存在时创建。
CREATE TABLE IF NOT EXISTS public.market_snapshot_cache (
  id            BIGSERIAL   PRIMARY KEY,
  snapshot_date DATE        NOT NULL UNIQUE,
  snapshot_data JSONB       NOT NULL,
  source        TEXT        DEFAULT 'tushare',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_snapshot_date
  ON public.market_snapshot_cache (snapshot_date DESC);

ALTER TABLE public.market_snapshot_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "market_snapshot_cache_anon_read" ON public.market_snapshot_cache;
CREATE POLICY "market_snapshot_cache_anon_read"
  ON public.market_snapshot_cache
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- 注意：
--  - 写入请始终使用服务端 SUPABASE_SERVICE_ROLE_KEY。
--  - 不要把 TUSHARE_TOKEN / SERVICE_ROLE_KEY / ADMIN_REFRESH_SECRET
--    以 NEXT_PUBLIC_ 形式暴露到浏览器。
-- ============================================================
