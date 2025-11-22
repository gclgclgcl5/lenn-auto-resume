// Cloudflare Pages Function for /api/chat - debug only
// This temporarily overrides the Next.js route to inspect environment variables.

export const onRequest = async () => {
  const envHasKey = !!process.env.DEEPSEEK_API_KEY
  const nodeEnv = process.env.NODE_ENV || null

  return new Response(
    JSON.stringify({
      envHasKey,
      nodeEnv,
      message: 'debug function: no DeepSeek call',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
