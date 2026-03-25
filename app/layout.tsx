import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '语文老师小助手 - 教师专属教学工具',
  description: '专为小学1-6年级语文教师设计的备课、教学、批改、教研一体化辅助工具',
  keywords: '语文教学,教师工具,备课,批改,教研',
  authors: [{ name: '教育科技团队' }],
  robots: 'noindex, nofollow', // 防止搜索引擎索引，保护教师隐私
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
