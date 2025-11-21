import { createOpenAI } from '@ai-sdk/openai'

// 检查环境变量
const apiKey = process.env.DEEPSEEK_API_KEY
if (!apiKey) {
  console.warn('DEEPSEEK_API_KEY is not set in environment variables')
}

// DeepSeek 兼容 OpenAI API 格式
export const deepseek = createOpenAI({
  apiKey: apiKey || '',
  baseURL: 'https://api.deepseek.com/v1',
})

export const model = 'deepseek-chat'

