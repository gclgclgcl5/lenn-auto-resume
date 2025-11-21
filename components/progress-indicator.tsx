'use client'

import { CollectionStage } from '@/lib/resume-schema'
import { getStageDisplayName } from '@/lib/conversation-flow'

interface ProgressIndicatorProps {
  currentStage: CollectionStage
}

const stages: CollectionStage[] = [
  CollectionStage.PERSONAL_INFO,
  CollectionStage.JOB_INTENTION,
  CollectionStage.EDUCATION,
  CollectionStage.WORK_EXPERIENCE,
  CollectionStage.PROJECT_EXPERIENCE,
  CollectionStage.SELF_EVALUATION,
]

export function ProgressIndicator({ currentStage }: ProgressIndicatorProps) {
  const currentIndex = stages.indexOf(currentStage)
  const isComplete = currentStage === CollectionStage.COMPLETE

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex || isComplete
          const stageName = getStageDisplayName(stage)

          return (
            <div key={stage} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className="mt-2 text-xs text-center text-gray-600 max-w-[80px]">
                  {stageName}
                </div>
              </div>
              {index < stages.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

