# 部署配置说明

## 问题

部署后数据丢失的原因：
1. `.env` 文件被 `.gitignore` 忽略，不会提交到 git
2. `.cache` 目录被忽略，本地文件数据不会持久化

## 解决方案

### 方案 A：使用 Supabase 数据库（推荐）

1. 按照 `SUPABASE_SETUP.md` 配置 Supabase
2. 在部署平台配置环境变量：
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   TUSHARE_TOKEN=your-tushare-token
   ADMIN_REFRESH_SECRET=your-secret
   ```

### 方案 B：使用部署平台的环境变量功能

大多数部署平台（Vercel、Netlify、自建服务器）都支持配置环境变量。

#### Vercel 部署
1. 进入项目 Settings → Environment Variables
2. 添加以下变量：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TUSHARE_TOKEN`
   - `ADMIN_REFRESH_SECRET`

#### 自建服务器部署
1. 在服务器上创建 `.env` 文件
2. 确保 `.env` 文件不在 git 仓库中
3. 启动服务时会自动加载

### 方案 C：使用数据库替代文件存储

如果不想用 Supabase，可以：
1. 使用其他数据库（PostgreSQL、MySQL）
2. 修改 `feedback-store.ts` 和 `market-snapshot-store.ts` 的存储逻辑

## 验证部署

部署后检查：
1. 访问首页，查看行情数据是否正常
2. 提交用户反馈，检查是否保存成功
3. 重启服务后，数据是否仍然存在

## 当前数据存储位置

| 数据类型 | 存储位置 | 持久化 |
|---------|---------|--------|
| 用户反馈 | `.cache/user-feedback.jsonl` | ❌ 部署后丢失 |
| 市场快照 | `.cache/market-snapshot.json` | ❌ 部署后丢失 |
| 股票基础数据 | `.cache/stock-basic.json` | ❌ 部署后丢失 |

配置 Supabase 后，所有数据都会存储到数据库，部署后不会丢失。
