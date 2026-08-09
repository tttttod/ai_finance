'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSupabaseConfig } from '@/lib/supabase-config-inject';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';
import { useAuth } from '@/lib/auth-context';
import type { SupabaseClient } from '@supabase/supabase-js';

const APP_ICON = 'https://coze-coding-project.tos.coze.site/gen_project_icon/2026-08-09/7671914089773301794_1786258169.png?sign=4908340915-fcc0eb84bc-0-6c2be93b6070b2a960d09b9a744986727596f8dacd594003ff778676d5b6d7d2';
const APP_NAME = 'AI 投研网站';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { isLoading: isConfigLoading } = useSupabaseConfig();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
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
      return '邮箱或密码错误，请重试';
    }
    if (msg.includes('email registered') || msg.includes('already registered')) {
      return '该邮箱已注册，请直接登录';
    }
    if (msg.includes('password should be at least')) {
      return '密码长度至少 6 位';
    }
    if (msg.includes('invalid email')) {
      return '请输入有效的邮箱地址';
    }
    return err.message || '操作失败，请稍后重试';
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('请填写邮箱和密码');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
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
    if (!email.trim() || !password || !confirmPassword) {
      setError('请填写所有字段');
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
        email: email.trim(),
        password,
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

  if (isConfigLoading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
        <Image
          src={APP_ICON}
          alt={APP_NAME}
          width={72}
          height={72}
          className="rounded-2xl mb-3"
          priority
        />
        <h1 className="text-xl font-bold text-[#1E293B]">{APP_NAME}</h1>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-sm bg-white rounded-lg border border-[#E2E8F0] p-6">
        {/* Tab Switch */}
        <div className="flex mb-6 border-b border-[#E2E8F0]">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]'
                : 'text-[#64748B]'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]'
                : 'text-[#64748B]'
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
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱地址"
              className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-md bg-white text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? '请输入密码' : '至少 6 位密码'}
                className="w-full px-3 py-2.5 pr-10 text-sm border border-[#E2E8F0] rounded-md bg-white text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
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
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-[#E2E8F0] rounded-md bg-white text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
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
            className="w-full py-2.5 bg-[#3B82F6] text-white text-sm font-medium rounded-md hover:bg-[#2563EB] active:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === 'login' ? '登录中...' : '注册中...'}
              </span>
            ) : (
              mode === 'login' ? '登录' : '注册'
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
                去注册
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#64748B]">
              已有账号？{' '}
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className="text-[#3B82F6] hover:underline"
              >
                去登录
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
