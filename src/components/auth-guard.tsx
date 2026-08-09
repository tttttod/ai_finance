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

    // Check if user chose to skip login
    const authSkipped = typeof window !== 'undefined' && localStorage.getItem('auth_skipped') === 'true';

    if (!isAuthenticated && !isPublicPath && !authSkipped) {
      router.replace('/login');
    }
  }, [isConfigLoading, isAuthLoading, isAuthenticated, pathname, router]);

  // Loading state
  if (isConfigLoading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFF8E1] via-[#FFF3CD] to-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#FFD93D] border-t-transparent animate-spin" />
          <span className="text-sm font-bold text-[#64748B]">加载中...</span>
        </div>
      </div>
    );
  }

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const authSkipped = typeof window !== 'undefined' && localStorage.getItem('auth_skipped') === 'true';

  // Always show login page when accessing /login directly
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Show content if authenticated OR if user skipped login
  if (isAuthenticated || authSkipped) {
    return <>{children}</>;
  }

  return null;
}
