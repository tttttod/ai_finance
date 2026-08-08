-- AI Finance Platform - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables.

-- 1. Market Snapshots
-- Stores daily market snapshot data fetched from Tushare
CREATE TABLE IF NOT EXISTS market_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date text NOT NULL,
  trade_date text NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'tushare',
  stale boolean NOT NULL DEFAULT false,
  summary text,
  indices jsonb NOT NULL DEFAULT '[]'::jsonb,
  hot_sectors jsonb NOT NULL DEFAULT '[]'::jsonb,
  active_stocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_targets jsonb NOT NULL DEFAULT '[]'::jsonb,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Index for fast latest snapshot lookup
CREATE INDEX IF NOT EXISTS idx_market_snapshots_fetched_at ON market_snapshots (fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_snapshots_trade_date ON market_snapshots (trade_date DESC);

-- 2. Market Auxiliary Cache
-- Caches stock_basic and other auxiliary data to reduce Tushare API calls
CREATE TABLE IF NOT EXISTS market_aux_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key text NOT NULL UNIQUE,
  data jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- 3. User Feedback
-- Stores user feedback submissions from the "My" page
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  selected_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  comment text,
  page text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback (created_at DESC);
