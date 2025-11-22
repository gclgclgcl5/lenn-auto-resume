import { deepseek, model } from '@/lib/ai-config'
import { streamText } from 'ai'
import { CollectionStage } from '@/lib/resume-schema'
import { getStagePrompt } from '@/lib/conversation-flow'
import type { PartialResume } from '@/lib/resume-schema'

// Cloudflare Pages 使用 edge runtime
export const runtime = 'edge'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface RequestBody {
  messages: ChatMessage[]
  currentStage?: CollectionStage
  resumeData?: PartialResume
}

function extractStructuredData(
  stage: CollectionStage,
  userMessage: string,
  assistantResponse: string
): Partial<PartialResume> {
  const extracted: Partial<PartialResume> = {}

  // 简单的信息提取逻辑（实际应该使用更智能的NLP或让AI返回JSON）
  if (stage === CollectionStage.PERSONAL_INFO) {
    const nameMatch = userMessage.match(/(?:姓名|名字)[：:]\s*([^\n，,]+)/) || 
                     assistantResponse.match(/(?:姓名|名字)[：:]\s*([^\n，,]+)/)
    const genderMatch = userMessage.match(/(?:性别)[：:]\s*([男女])/) ||
                       assistantResponse.match(/(?:性别)[：:]\s*([男女])/)
    const ageMatch = userMessage.match(/(?:年龄)[：:]\s*(\d+)/) ||
                    assistantResponse.match(/(?:年龄)[：:]\s*(\d+)/)
    const phoneMatch = userMessage.match(/(?:电话|手机)[：:]\s*([\d-]+)/) ||
                      assistantResponse.match(/(?:电话|手机)[：:]\s*([\d-]+)/)
    const emailMatch = userMessage.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/) ||
                      assistantResponse.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)
    const householdMatch = userMessage.match(/(?:户籍|户口)[：:]\s*([^\n，,]+)/) ||
                          assistantResponse.match(/(?:户籍|户口)[：:]\s*([^\n，,]+)/)
    const ethnicityMatch = userMessage.match(/(?:民族)[：:]\s*([^\n，,]+)/) ||
                          assistantResponse.match(/(?:民族)[：:]\s*([^\n，,]+)/)

    if (nameMatch || genderMatch || ageMatch || phoneMatch || emailMatch || householdMatch || ethnicityMatch) {
      extracted.personalInfo = {
        name: nameMatch?.[1]?.trim() || '',
        gender: genderMatch?.[1] || '',
        age: ageMatch?.[1] || '',
        phone: phoneMatch?.[1] || '',
        email: emailMatch?.[1] || '',
        household: householdMatch?.[1]?.trim() || '',
        ethnicity: ethnicityMatch?.[1]?.trim() || '',
      }
    }
  }

  // 其他阶段的提取逻辑类似...
  // 注意：这是一个简化版本，实际应该让AI返回结构化JSON

  return extracted
}

function buildSystemPrompt(
  stage: CollectionStage,
  resumeData: PartialResume
): string {
  console.log('[buildSystemPrompt] Building prompt for stage:', stage)
  const basePrompt = getStagePrompt(stage)
  
  // 添加已收集数据的上下文
  let context = ''
  if (resumeData.personalInfo) {
    context += `\n已收集的个人信息：${JSON.stringify(resumeData.personalInfo)}\n`
  }
  if (resumeData.jobIntention) {
    context += `\n已收集的求职意向：${JSON.stringify(resumeData.jobIntention)}\n`
  }
  if (resumeData.education && resumeData.education.length > 0) {
    context += `\n已收集的教育经历：${JSON.stringify(resumeData.education)}\n`
  }
  if (resumeData.workExperience && resumeData.workExperience.length > 0) {
    context += `\n已收集的工作经历：${JSON.stringify(resumeData.workExperience)}\n`
  }
  if (resumeData.projectExperience && resumeData.projectExperience.length > 0) {
    context += `\n已收集的项目经历：${JSON.stringify(resumeData.projectExperience)}\n`
  }

  // 根据阶段添加JSON格式要求
  let jsonInstruction = ''
  let strictInstruction = ''
  
  switch (stage) {
    case CollectionStage.WELCOME:
      strictInstruction = `\n\n【重要指令】您必须严格按照阶段流程工作，不要一次性生成完整简历。现在请引导用户提供个人信息，只询问姓名即可开始。`
      break
    case CollectionStage.PERSONAL_INFO:
      jsonInstruction = `\n\n【必须遵守】当您确认收集到完整的个人信息后，请在回复末尾添加以下格式的JSON（用<JSON>和</JSON>包裹）：
<JSON>
{
  "personalInfo": {
    "name": "姓名",
    "gender": "性别",
    "age": "年龄",
    "phone": "电话",
    "email": "邮箱",
    "household": "户籍",
    "ethnicity": "民族"
  }
}
</JSON>`
      strictInstruction = `\n\n【重要】只收集个人信息，不要生成其他内容。如果信息不完整，继续询问缺失的部分。必须返回JSON格式的数据。`
      break
    case CollectionStage.JOB_INTENTION:
      jsonInstruction = `\n\n【必须遵守】当您确认收集到完整的求职意向后，请在回复末尾添加以下格式的JSON（用<JSON>和</JSON>包裹）：
<JSON>
{
  "jobIntention": {
    "position": "意向岗位",
    "city": "意向城市",
    "salary": "期望薪资",
    "jobType": "求职类型"
  }
}
</JSON>`
      strictInstruction = `\n\n【重要】只收集求职意向，不要生成其他内容。必须返回JSON格式的数据。`
      break
    case CollectionStage.EDUCATION:
      jsonInstruction = `\n\n【必须遵守】当用户提供一条教育经历后，请在回复末尾添加以下格式的JSON（用<JSON>和</JSON>包裹）：
<JSON>
{
  "education": [{
    "startTime": "开始时间（格式：YYYY.MM）",
    "endTime": "结束时间（格式：YYYY.MM）",
    "schoolName": "学校名称",
    "major": "专业",
    "degree": "学历"
  }]
}
</JSON>
如果用户有多条教育经历，每次添加一条。`
      strictInstruction = `\n\n【重要】只收集教育经历，每次一条。必须返回JSON格式的数据。`
      break
    case CollectionStage.WORK_EXPERIENCE:
      jsonInstruction = `\n\n【必须遵守】当用户提供一条工作经历后，请在回复末尾添加以下格式的JSON（用<JSON>和</JSON>包裹）：
<JSON>
{
  "workExperience": [{
    "startTime": "开始时间（格式：YYYY.MM）",
    "endTime": "结束时间（格式：YYYY.MM或'至今'）",
    "companyName": "公司名称",
    "position": "职位",
    "industry": "行业（可选）",
    "salary": "薪资（可选，格式：25000元/月）",
    "description": "工作描述（重点描述工作内容、成果，使用数字说明成绩）"
  }]
}
</JSON>
如果用户有多条工作经历，每次添加一条。`
      strictInstruction = `\n\n【重要】只收集工作经历，每次一条。必须返回JSON格式的数据。`
      break
    case CollectionStage.PROJECT_EXPERIENCE:
      jsonInstruction = `\n\n【必须遵守】当用户提供一条项目经历后，请在回复末尾添加以下格式的JSON（用<JSON>和</JSON>包裹）：
<JSON>
{
  "projectExperience": [{
    "startTime": "开始时间（格式：YYYY.MM）",
    "endTime": "结束时间（格式：YYYY.MM）",
    "projectName": "项目名称",
    "position": "职位/角色",
    "description": "项目描述（包括项目内容、工作内容、项目成果）"
  }]
}
</JSON>
如果用户有多条项目经历，每次添加一条。`
      strictInstruction = `\n\n【重要】只收集项目经历，每次一条。必须返回JSON格式的数据。`
      break
    case CollectionStage.SELF_EVALUATION:
      jsonInstruction = `\n\n【必须遵守】当您生成或确认自我评价后，请在回复末尾添加以下格式的JSON（用<JSON>和</JSON>包裹）：
<JSON>
{
  "selfEvaluation": "自我评价内容（篇幅不要太长，结合经验和特长，突出符合求职岗位的特点）"
}
</JSON>`
      strictInstruction = `\n\n【重要】生成自我评价后，必须返回JSON格式的数据。`
      break
  }

  const fullPrompt = `${basePrompt}\n\n${context}${strictInstruction}\n\n请友好地引导用户提供信息，并确认您理解的内容。如果信息不完整，请继续询问缺失的部分。${jsonInstruction}`
  
  console.log('[buildSystemPrompt] Prompt length:', fullPrompt.length)
  console.log('[buildSystemPrompt] Stage:', stage, 'Has context:', !!context, 'Has JSON instruction:', !!jsonInstruction)
  
  return fullPrompt
}

export async function POST(req: Request) {
  try {
    console.log('[API] POST /api/chat received')
    
    // 检查环境变量
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('[API] DEEPSEEK_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body: RequestBody = await req.json()
    const { messages, currentStage = CollectionStage.WELCOME, resumeData = {} } = body

    console.log('[API] Request data:', {
      messagesCount: messages?.length,
      currentStage,
      resumeDataKeys: Object.keys(resumeData || {}),
    })

    if (!messages || !Array.isArray(messages)) {
      console.error('[API] Invalid messages format')
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = buildSystemPrompt(currentStage, resumeData)
    console.log('[API] System prompt built, calling AI...')

    const result = await streamText({
      model: deepseek(model) as any, // 类型兼容性处理
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    })

    console.log('[API] AI response stream created')
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('[API] AI API Error:', error)
    if (error instanceof Error) {
      console.error('[API] Error stack:', error.stack)
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({
        error: errorMessage,
        message: errorMessage,
        details: String(error),
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
