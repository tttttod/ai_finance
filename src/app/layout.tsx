import type { Metadata } from 'next';
import './globals.css';
import AgentImagePreloader from '@/components/agent-image-preloader';
import { SupabaseConfigProvider } from '@/lib/supabase-config-inject';
import { AuthProvider } from '@/lib/auth-context';
import AuthGuard from '@/components/auth-guard';

export const metadata: Metadata = {
  title: '市场冒险局 — AI 智能投研冒险',
  description: '每日市场副本，你的冒险从这里开始。面向A股普通投资者的AI投研辅助产品。',
  keywords: ['市场冒险局', 'A股', 'AI投研', '智能金融', '研报分析'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen bg-[#F5F5F7]">
        <SupabaseConfigProvider>
          <AuthProvider>
            <AuthGuard>
              <AgentImagePreloader />
              {children}
            </AuthGuard>
          </AuthProvider>
        </SupabaseConfigProvider>
      </body>
    </html>
  );
}
