// Cloudflare Pages Functions middleware
// 这个文件会被 Cloudflare Pages 自动识别
// 注意：使用 @cloudflare/next-on-pages 时，Next.js 中间件会处理大部分逻辑

export const onRequest = async (context: any) => {
  // 添加安全头
  const response = await context.next()
  if (response instanceof Response) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }
  return response
}

