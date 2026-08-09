'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSupabaseConfig } from '@/lib/supabase-config-inject';

const PUBLIC_PATHS = ['/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isLoading: isConfigLoading } = useSupabaseConfig();

  useEffect(() => {
    if (isConfigLoading || isAuthLoading) return;

    const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (!isAuthenticated && !isPublicPath) {
      router.replace('/login');
    }
  }, [isConfigLoading, isAuthLoading, isAuthenticated, pathname, router]);

  // Loading state
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

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Show login page for public paths when not authenticated
  if (!isAuthenticated && isPublicPath) {
    return <>{children}</>;
  }

  // Show content only if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}
