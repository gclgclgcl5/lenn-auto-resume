/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 使用 @cloudflare/next-on-pages 适配
  // 本地开发使用 standalone 输出
  output: process.env.CF_PAGES ? undefined : 'standalone',
  // 确保图片优化正常工作
  images: {
    unoptimized: true, // Cloudflare Pages 不支持 Next.js 图片优化
  },
}

module.exports = nextConfig

