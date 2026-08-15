# Supabase 配置指南

## 问题说明

当前用户反馈数据存储在本地文件 `.cache/user-feedback.jsonl` 中，部署后数据不会持久化。

## 解决方案

使用 Supabase 数据库持久化数据。

### 步骤 1：创建 Supabase 项目

1. 访问 https://supabase.com
2. 创建新项目
3. 获取项目 URL 和 Service Role Key

### 步骤 2：执行数据库脚本

在 Supabase 控制台的 SQL Editor 中执行 `supabase/schema.sql`：

```sql
-- 创建用户反馈表和市场快照缓存表
```

### 步骤 3：配置环境变量

在 `.env` 文件中添加：

```env
# Supabase 配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 步骤 4：验证配置

重启服务后，用户反馈会自动存储到 Supabase 数据库。

## 降级策略

如果未配置 Supabase，数据仍会保存到本地 `.cache/user-feedback.jsonl` 文件（仅开发环境有效）。

## 数据迁移

如果已有本地数据，可以手动导入：

```bash
# 读取本地 JSONL 文件并插入到 Supabase
cat .cache/user-feedback.jsonl | while read line; do
  # 使用 Supabase API 或控制台导入
done
```
