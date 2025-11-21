import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI 简历生成器',
  description: '使用 AI 生成专业简历',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

