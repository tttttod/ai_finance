-- ============================================
-- AI 投研平台 - Supabase 数据库表结构
-- ============================================

-- 用户反馈表
CREATE TABLE IF NOT EXISTS user_feedback (
  id BIGSERIAL PRIMARY KEY,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  selected_issues TEXT[] DEFAULT NULL,
  dimension_scores JSONB DEFAULT NULL,
  comment TEXT DEFAULT NULL,
  page TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_rating ON user_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_user_feedback_page ON user_feedback(page);

-- 市场快照缓存表（可选，用于持久化行情数据）
CREATE TABLE IF NOT EXISTS market_snapshot_cache (
  id BIGSERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL UNIQUE,
  snapshot_data JSONB NOT NULL,
  source TEXT DEFAULT 'tushare',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_market_snapshot_date ON market_snapshot_cache(snapshot_date DESC);

-- 行级安全策略（RLS）
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_snapshot_cache ENABLE ROW LEVEL SECURITY;

-- 允许匿名插入反馈（前端直接调用）
CREATE POLICY "Allow anonymous insert feedback" ON user_feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 只允许服务角色读取反馈（后台统计）
CREATE POLICY "Allow service role read feedback" ON user_feedback
  FOR SELECT
  TO service_role
  USING (true);

-- 市场快照：允许匿名读取，服务角色写入
CREATE POLICY "Allow anonymous read market snapshot" ON market_snapshot_cache
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service role write market snapshot" ON market_snapshot_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 注释
COMMENT ON TABLE user_feedback IS '用户反馈数据';
COMMENT ON COLUMN user_feedback.rating IS '总体评分 1-5';
COMMENT ON COLUMN user_feedback.selected_issues IS '选中的问题标签';
COMMENT ON COLUMN user_feedback.dimension_scores IS '各维度评分 JSON';
COMMENT ON COLUMN user_feedback.comment IS '用户留言';
COMMENT ON COLUMN user_feedback.page IS '反馈来源页面';

COMMENT ON TABLE market_snapshot_cache IS '市场快照缓存';
COMMENT ON COLUMN market_snapshot_cache.snapshot_date IS '快照日期';
COMMENT ON COLUMN market_snapshot_cache.snapshot_data IS '快照数据 JSON';
COMMENT ON COLUMN market_snapshot_cache.source IS '数据来源';
