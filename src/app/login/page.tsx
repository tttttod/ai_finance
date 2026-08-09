'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSupabaseConfig } from '@/lib/supabase-config-inject';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';
import { useAuth } from '@/lib/auth-context';

const APP_ICON = 'https://coze-coding-project.tos.coze.site/gen_project_icon/2026-08-09/7671914089773301794_1786258169.png?sign=4908340915-fcc0eb84bc-0-6c2be93b6070b2a960d09b9a744986727596f8dacd594003ff778676d5b6d7d2';
const APP_NAME = '市场冒险局';
const EMAIL_SUFFIX = '@market-adventure.local';

/** Convert username to virtual email for Supabase Auth */
const toVirtualEmail = (username: string): string => {
  return `${username.trim().toLowerCase()}${EMAIL_SUFFIX}`;
};

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { isLoading: isConfigLoading } = useSupabaseConfig();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!isConfigLoading && !isAuthLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isConfigLoading, isAuthLoading, isAuthenticated, router]);

  const getErrorMessage = (err: { message?: string }): string => {
    const msg = err.message?.toLowerCase() ?? '';
    if (msg.includes('invalid login credentials') || msg.includes('email or password')) {
      return '用户名或密码错误，请重试';
    }
    if (msg.includes('email registered') || msg.includes('already registered')) {
      return '该用户名已注册，请直接登录';
    }
    if (msg.includes('password should be at least')) {
      return '密码长度至少 6 位';
    }
    return err.message || '操作失败，请稍后重试';
  };

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('请填写用户名和密码');
      return;
    }
    if (username.trim().length < 2) {
      setError('用户名至少 2 个字符');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: toVirtualEmail(username),
        password,
      });
      if (signInError) {
        setError(getErrorMessage(signInError));
        return;
      }
      if (data.session) {
        router.replace('/');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }
    if (username.trim().length < 2) {
      setError('用户名至少 2 个字符');
      return;
    }
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username.trim())) {
      setError('用户名只能包含中英文、数字和下划线');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少 6 位');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: toVirtualEmail(username),
        password,
        options: {
          data: { display_name: username.trim() },
        },
      });
      if (signUpError) {
        setError(getErrorMessage(signUpError));
        return;
      }
      if (data.session) {
        router.replace('/');
      } else if (data.user) {
        setMode('login');
        setError('注册成功，请登录');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'login') handleLogin();
      else handleRegister();
    }
  };

  if (isConfigLoading || isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8E1] via-[#FFF3CD] to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#FFD93D] border-t-transparent animate-spin" />
          <span className="text-sm font-bold text-[#64748B]">加载中...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E1] via-[#FFF3CD] to-white flex flex-col max-w-md mx-auto relative">
      {/* 状态栏模拟 - 与主页一致 */}
      <div className="bg-gradient-to-r from-[#FF6B6B] via-[#FFE66D] to-[#4ECDC4] px-4 py-2 flex items-center justify-between text-xs text-white shadow-md">
        <span className="font-black">--:--</span>
        <span className="font-black text-sm">🗺️ 市场冒险局</span>
        <span className="font-black opacity-0">📶</span>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        {/* App Icon & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FF6B6B] via-[#FFD93D] to-[#4ECDC4] blur-lg opacity-40" />
            <Image
              src={APP_ICON}
              alt={APP_NAME}
              width={88}
              height={88}
              className="relative rounded-3xl border-3 border-white shadow-xl"
              priority
            />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-[#FF6B35] via-[#FFD93D] to-[#00FF88] bg-clip-text text-transparent">
            {APP_NAME}
          </h1>
          <p className="text-sm font-bold text-[#64748B] mt-1">每日市场副本，你的冒险从这里开始</p>
        </div>

        {/* Auth Card */}
        <div className="w-full bg-white rounded-3xl p-5 border-2 border-[#FFD93D] shadow-lg">
          {/* Tab Switch */}
          <div className="flex mb-5 bg-slate-50 rounded-2xl p-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-black rounded-2xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#FF6B35] shadow-sm'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              🗝️ 登录
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-black rounded-2xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#4ECDC4] shadow-sm'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              🚀 注册
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-2xl text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4" onKeyDown={handleKeyDown}>
            {/* Username */}
            <div>
              <label className="block text-xs font-black text-[#64748B] mb-1.5 ml-1">用户名</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFD93D]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full pl-10 pr-4 py-3 text-sm font-bold border-2 border-slate-200 rounded-2xl bg-white text-[#1E293B] placeholder:text-slate-300 focus:outline-none focus:border-[#FFD93D] transition-colors"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-[#64748B] mb-1.5 ml-1">密码</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFD93D]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? '请输入密码' : '至少 6 位密码'}
                  className="w-full pl-10 pr-11 py-3 text-sm font-bold border-2 border-slate-200 rounded-2xl bg-white text-[#1E293B] placeholder:text-slate-300 focus:outline-none focus:border-[#FFD93D] transition-colors"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-black text-[#64748B] mb-1.5 ml-1">确认密码</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFD93D]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full pl-10 pr-11 py-3 text-sm font-bold border-2 border-slate-200 rounded-2xl bg-white text-[#1E293B] placeholder:text-slate-300 focus:outline-none focus:border-[#FFD93D] transition-colors"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#4ECDC4] text-white text-sm font-black rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#FF6B6B]/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? '进入冒险中...' : '注册中...'}
                </span>
              ) : (
                mode === 'login' ? '🗺️ 进入冒险' : '🚀 开始冒险'
              )}
            </button>
          </div>

          {/* Switch Mode Link */}
          <div className="mt-4 text-center">
            {mode === 'login' ? (
              <p className="text-xs font-bold text-[#64748B]">
                还没有账号？{' '}
                <button
                  onClick={() => { setMode('register'); setError(''); }}
                  className="text-[#FF6B35] font-black hover:underline"
                >
                  注册新账号
                </button>
              </p>
            ) : (
              <p className="text-xs font-bold text-[#64748B]">
                已有账号？{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-[#4ECDC4] font-black hover:underline"
                >
                  返回登录
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-[10px] font-bold text-slate-300">
          登录即表示同意《市场冒险局用户协议》
        </p>
      </div>
    </div>
  );
}
