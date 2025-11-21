'use client'

import { useChat } from 'ai/react'
import { useState, useEffect } from 'react'
import { ProgressIndicator } from './progress-indicator'
import { ResumePreview } from './resume-preview'
import { generateResumeDoc } from '@/lib/word-generator'
import {
  CollectionStage,
  type PartialResume,
  type Resume,
  resumeSchema,
} from '@/lib/resume-schema'
import { getNextStage, isStageComplete, getStageDisplayName } from '@/lib/conversation-flow'

export function ResumeChat() {
  const [currentStage, setCurrentStage] = useState<CollectionStage>(CollectionStage.WELCOME)
  const [resumeData, setResumeData] = useState<PartialResume>({})
  const [showPreview, setShowPreview] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: {
      currentStage,
      resumeData,
    },
    onFinish: (message) => {
      console.log('[ResumeChat] Message finished:', { 
        role: message.role, 
        contentLength: message.content.length,
        currentStage 
      })
      // 尝试从对话中提取结构化数据
      extractDataFromMessages([...messages, message])
    },
  })

  // 当用户发送第一条消息时，自动进入个人信息收集阶段
  useEffect(() => {
    const hasUserMessage = messages.some(m => m.role === 'user')
    if (hasUserMessage && currentStage === CollectionStage.WELCOME) {
      console.log('[ResumeChat] First user message detected, moving to PERSONAL_INFO stage')
      setCurrentStage(CollectionStage.PERSONAL_INFO)
    }
  }, [messages, currentStage])

  // 从消息中提取结构化数据
  function extractDataFromMessages(allMessages: typeof messages) {
    const lastMessage = allMessages[allMessages.length - 1]
    if (!lastMessage || lastMessage.role !== 'assistant') {
      console.log('[extractDataFromMessages] No assistant message found')
      return
    }

    const content = lastMessage.content
    console.log('[extractDataFromMessages] Checking for JSON in message, content length:', content.length)
    
    // 提取JSON数据
    const jsonMatch = content.match(/<JSON>([\s\S]*?)<\/JSON>/)
    if (!jsonMatch) {
      console.log('[extractDataFromMessages] No JSON tag found in message')
      return
    }

    console.log('[extractDataFromMessages] JSON tag found, extracting...')
    try {
      const extracted = JSON.parse(jsonMatch[1])
      console.log('[extractDataFromMessages] Parsed JSON:', extracted)
      
      setResumeData((prev) => {
        const updated = { ...prev }
        
        if (extracted.personalInfo) {
          console.log('[extractDataFromMessages] Updating personalInfo:', extracted.personalInfo)
          updated.personalInfo = { ...prev.personalInfo, ...extracted.personalInfo }
        }
        if (extracted.jobIntention) {
          console.log('[extractDataFromMessages] Updating jobIntention:', extracted.jobIntention)
          updated.jobIntention = { ...prev.jobIntention, ...extracted.jobIntention }
        }
        if (extracted.education) {
          console.log('[extractDataFromMessages] Adding education:', extracted.education)
          updated.education = [...(prev.education || []), ...extracted.education]
        }
        if (extracted.workExperience) {
          console.log('[extractDataFromMessages] Adding workExperience:', extracted.workExperience)
          updated.workExperience = [...(prev.workExperience || []), ...extracted.workExperience]
        }
        if (extracted.projectExperience) {
          console.log('[extractDataFromMessages] Adding projectExperience:', extracted.projectExperience)
          updated.projectExperience = [...(prev.projectExperience || []), ...extracted.projectExperience]
        }
        if (extracted.selfEvaluation) {
          console.log('[extractDataFromMessages] Updating selfEvaluation')
          updated.selfEvaluation = extracted.selfEvaluation
        }
        
        console.log('[extractDataFromMessages] Updated resumeData:', updated)
        return updated
      })
    } catch (error) {
      console.error('[extractDataFromMessages] Failed to parse extracted JSON:', error)
      console.error('[extractDataFromMessages] JSON string:', jsonMatch[1])
    }
  }

  // 检查阶段是否完成，自动进入下一阶段
  useEffect(() => {
    const isComplete = isStageComplete(currentStage, resumeData)
    console.log('[Stage Check]', {
      currentStage,
      isComplete,
      resumeDataKeys: Object.keys(resumeData),
      personalInfo: !!resumeData.personalInfo,
      jobIntention: !!resumeData.jobIntention,
    })
    
    if (isComplete && currentStage !== CollectionStage.COMPLETE) {
      const nextStage = getNextStage(currentStage)
      console.log('[Stage Check] Stage complete, next stage:', nextStage)
      
      if (nextStage !== currentStage && nextStage !== CollectionStage.COMPLETE) {
        // 延迟一下，让用户看到确认消息
        const timer = setTimeout(() => {
          console.log('[Stage Check] Moving to next stage:', nextStage)
          setCurrentStage(nextStage)
        }, 1000)
        return () => clearTimeout(timer)
      } else if (nextStage === CollectionStage.COMPLETE) {
        console.log('[Stage Check] All stages complete!')
        setCurrentStage(CollectionStage.COMPLETE)
      }
    }
  }, [resumeData, currentStage])


  async function handleExport() {
    console.log('[handleExport] Starting export, resumeData:', resumeData)
    
    if (!isResumeComplete()) {
      console.warn('[handleExport] Resume not complete, missing data')
      alert('请先完成所有信息的收集')
      return
    }

    setIsExporting(true)
    try {
      console.log('[handleExport] Validating resume data...')
      // 验证数据
      const validatedResume = resumeSchema.parse(resumeData as Resume)
      console.log('[handleExport] Validation passed, generating Word document...')
      await generateResumeDoc(validatedResume)
      console.log('[handleExport] Word document generated successfully')
    } catch (error) {
      console.error('[handleExport] Export error:', error)
      if (error instanceof Error) {
        console.error('[handleExport] Error details:', error.message, error.stack)
      }
      alert('导出失败，请检查数据是否完整')
    } finally {
      setIsExporting(false)
    }
  }

  function isResumeComplete(): boolean {
    return (
      !!resumeData.personalInfo &&
      !!resumeData.jobIntention &&
      !!resumeData.education &&
      resumeData.education.length > 0 &&
      !!resumeData.workExperience &&
      resumeData.workExperience.length > 0 &&
      !!resumeData.projectExperience &&
      resumeData.projectExperience.length > 0 &&
      !!resumeData.selfEvaluation
    )
  }

  // 计算是否应该显示UI元素（有消息就显示，或者不在欢迎阶段）
  const shouldShowUI = messages.length > 0 || currentStage !== CollectionStage.WELCOME
  
  console.log('[ResumeChat Render]', {
    currentStage,
    messagesCount: messages.length,
    shouldShowUI,
    resumeDataKeys: Object.keys(resumeData),
    isResumeComplete: isResumeComplete(),
  })

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto p-4">
      {/* 进度指示器 - 有消息或不在欢迎阶段时显示 */}
      {shouldShowUI && (
        <ProgressIndicator currentStage={currentStage} />
      )}

      {/* 预览和导出按钮 - 有消息或不在欢迎阶段时显示 */}
      {shouldShowUI && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              console.log('[ResumeChat] Toggle preview, current state:', showPreview)
              setShowPreview(!showPreview)
            }}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {showPreview ? '隐藏预览' : '查看预览'}
          </button>
          {isResumeComplete() && (
            <button
              onClick={() => {
                console.log('[ResumeChat] Export button clicked')
                handleExport()
              }}
              disabled={isExporting}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? '正在生成...' : '导出Word文档'}
            </button>
          )}
        </div>
      )}

      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* 聊天区域 */}
        <div className={`flex flex-col ${showPreview ? 'w-1/2' : 'w-full'} transition-all`}>
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-gray-50 rounded-lg p-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <h2 className="text-2xl font-bold mb-2">AI 简历生成助手</h2>
                <p>我将引导您逐步填写简历信息，完成后可以导出为Word文档</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="输入您的信息..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              发送
            </button>
          </form>
        </div>

        {/* 预览区域 */}
        {showPreview && (
          <div className="w-1/2 overflow-y-auto">
            <ResumePreview resumeData={resumeData} />
          </div>
        )}
      </div>
    </div>
  )
}

