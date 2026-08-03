import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 投研平台 - 智能金融分析',
  description: 'AI驱动的智能投研平台，提供研报观点总结、宏观分析、基本面与技术面分析、荐股追踪等一站式金融服务。',
  keywords: ['AI投研', '智能金融', '研报分析', '宏观分析', '量化投资'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen bg-[#0a0e1a] text-[#e2e8f0]">
        {/* Animated background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 animate-pulse-slow" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/5 via-transparent to-blue-500/5 animate-pulse-slow-reverse" />
          <div className="grid-bg absolute inset-0 opacity-[0.03]" />
        </div>

        <header className="border-b border-white/5 bg-[#0d1220]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0d1220] animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  AI 投研平台
                </h1>
                <p className="text-[10px] text-slate-500 tracking-wider uppercase">Intelligent Research Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                实时连接
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Data Update</p>
                <p className="text-xs font-data text-slate-300" id="update-time">--</p>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 relative z-10">
          {children}
        </main>
        <footer className="border-t border-white/5 bg-[#0d1220]/50 mt-12 relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-slate-600">
            数据来源：Tushare | AI 分析仅供参考，不构成投资建议
          </div>
        </footer>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.getElementById('update-time').textContent = new Date().toLocaleString('zh-CN', { hour12: false });`,
          }}
        />
      </body>
    </html>
  );
}
