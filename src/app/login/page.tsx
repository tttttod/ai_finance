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
      // mailer_auto_confirm is true, so user is already logged in
      if (data.session) {
        router.replace('/');
      } else if (data.user) {
        // Fallback: switch to login mode
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
      if (mode === 'login') {
        handleLogin();
      } else {
        handleRegister();
      }
    }
  };

  if (isConfigLoading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#64748B]">加载中...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] px-4">
      {/* App Icon & Name */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <Image
            src={APP_ICON}
            alt={APP_NAME}
            width={80}
            height={80}
            className="rounded-2xl mb-3 shadow-md"
            priority
          />
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#3B82F6]/10 to-[#8B5CF6]/10 blur-sm -z-10" />
        </div>
        <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">{APP_NAME}</h1>
        <p className="text-xs text-[#64748B] mt-1">每日市场副本，你的冒险从这里开始</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-sm bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm">
        {/* Tab Switch */}
        <div className="flex mb-6 border-b border-[#E2E8F0]">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            注册
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4" onKeyDown={handleKeyDown}>
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">用户名</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#E2E8F0] rounded-md bg-white text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">密码</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? '请输入密码' : '至少 6 位密码'}
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-[#E2E8F0] rounded-md bg-white text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
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
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">确认密码</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-[#E2E8F0] rounded-md bg-white text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
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
            className="w-full py-2.5 bg-[#3B82F6] text-white text-sm font-medium rounded-md hover:bg-[#2563EB] active:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === 'login' ? '登录中...' : '注册中...'}
              </span>
            ) : (
              mode === 'login' ? '进入冒险' : '开始冒险'
            )}
          </button>
        </div>

        {/* Switch Mode Link */}
        <div className="mt-4 text-center">
          {mode === 'login' ? (
            <p className="text-xs text-[#64748B]">
              还没有账号？{' '}
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className="text-[#3B82F6] hover:underline"
              >
                注册新账号
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#64748B]">
              已有账号？{' '}
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className="text-[#3B82F6] hover:underline"
              >
                返回登录
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-[10px] text-[#94A3B8]">
        登录即表示同意《市场冒险局用户协议》
      </p>
    </div>
  );
}
