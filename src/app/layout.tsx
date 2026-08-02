import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'A股板块追踪 - 主力资金流向日报',
  description: '每日追踪A股行业板块主力资金流向，筛选连续净流入的热门板块，展示板块内涨幅靠前和市值靠前的个股。',
  keywords: ['A股', '板块追踪', '主力资金', '行业板块', '资金流向'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen bg-[#fafaf9]">
        <header className="border-b border-[#e7e5e4] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#dc2626] flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[#1c1917]">A股板块追踪</h1>
                <p className="text-xs text-[#78716c]">主力资金流向日报</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#78716c]">数据更新时间</p>
              <p className="text-sm font-data text-[#1c1917]" id="update-time">
                --
              </p>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <footer className="border-t border-[#e7e5e4] bg-white/50 mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-[#78716c]">
            数据来源：Tushare | 仅供参考，不构成投资建议
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
