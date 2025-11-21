import { z } from 'zod'

// 教育经历
export const educationSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  schoolName: z.string(),
  major: z.string(),
  degree: z.string(),
  description: z.string().optional(),
})

// 工作经历
export const workExperienceSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  companyName: z.string(),
  position: z.string(),
  industry: z.string().optional(),
  salary: z.string().optional(),
  description: z.string(),
})

// 项目经历
export const projectExperienceSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  projectName: z.string(),
  position: z.string(),
  description: z.string(),
})

// 完整简历数据结构
export const resumeSchema = z.object({
  // 个人信息
  personalInfo: z.object({
    name: z.string(),
    gender: z.string(),
    age: z.string(),
    phone: z.string(),
    email: z.string(),
    household: z.string(),
    ethnicity: z.string(),
  }),
  // 求职意向
  jobIntention: z.object({
    position: z.string(),
    city: z.string(),
    salary: z.string(),
    jobType: z.string(),
  }),
  // 教育经历（数组）
  education: z.array(educationSchema),
  // 工作经历（数组）
  workExperience: z.array(workExperienceSchema),
  // 项目经历（数组）
  projectExperience: z.array(projectExperienceSchema),
  // 自我评价
  selfEvaluation: z.string(),
})

export type Education = z.infer<typeof educationSchema>
export type WorkExperience = z.infer<typeof workExperienceSchema>
export type ProjectExperience = z.infer<typeof projectExperienceSchema>
export type Resume = z.infer<typeof resumeSchema>

// 收集阶段枚举
export enum CollectionStage {
  WELCOME = 'welcome',
  PERSONAL_INFO = 'personal_info',
  JOB_INTENTION = 'job_intention',
  EDUCATION = 'education',
  WORK_EXPERIENCE = 'work_experience',
  PROJECT_EXPERIENCE = 'project_experience',
  SELF_EVALUATION = 'self_evaluation',
  COMPLETE = 'complete',
}

// 部分简历数据（用于逐步收集）
export interface PartialResume {
  personalInfo?: Resume['personalInfo']
  jobIntention?: Resume['jobIntention']
  education?: Resume['education']
  workExperience?: Resume['workExperience']
  projectExperience?: Resume['projectExperience']
  selfEvaluation?: string
}

