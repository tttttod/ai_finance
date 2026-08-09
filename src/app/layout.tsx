import type { Metadata } from 'next';
import './globals.css';
import AgentImagePreloader from '@/components/agent-image-preloader';

export const metadata: Metadata = {
  title: 'A股可视化投研Agent - AI智能投研辅助',
  description: '面向A股普通投资者的AI投研辅助产品，提供市场雷达、Agent研究、证据卡片、正反方辩论、风险检查、三情景预测和复盘任务。',
  keywords: ['A股', 'AI投研', '智能金融', '研报分析', '量化投资', '可视化'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen bg-[#F5F5F7]">
        <AgentImagePreloader />
        {children}
      </body>
    </html>
  );
}
