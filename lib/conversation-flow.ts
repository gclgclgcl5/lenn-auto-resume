import { CollectionStage, PartialResume, Resume } from './resume-schema'

export interface FlowState {
  currentStage: CollectionStage
  resumeData: PartialResume
  isCollectingArray: boolean // 是否正在收集数组类型数据（教育/工作/项目经历）
  currentArrayIndex: number // 当前数组索引
}

export function getInitialFlowState(): FlowState {
  return {
    currentStage: CollectionStage.WELCOME,
    resumeData: {},
    isCollectingArray: false,
    currentArrayIndex: 0,
  }
}

export function getStagePrompt(stage: CollectionStage): string {
  const prompts: Record<CollectionStage, string> = {
    [CollectionStage.WELCOME]: `欢迎使用AI简历生成助手！我将引导您逐步填写简历信息。
我们将按以下顺序收集信息：
1. 个人信息（姓名、性别、年龄、电话、邮箱、户籍、民族）
2. 求职意向（岗位、城市、薪资、类型）
3. 教育经历
4. 工作经历
5. 项目经历
6. 自我评价

请告诉我您的姓名，我们开始吧！`,

    [CollectionStage.PERSONAL_INFO]: `现在请提供您的个人信息。我需要以下信息：
- 姓名
- 性别（男/女）
- 年龄
- 电话
- 邮箱
- 户籍（所在城市）
- 民族

您可以一次性提供所有信息，或者逐个告诉我。`,

    [CollectionStage.JOB_INTENTION]: `接下来是求职意向，请提供：
- 意向岗位（例如：前端开发工程师）
- 意向城市（例如：北京）
- 期望薪资（例如：15000-20000元/月）
- 求职类型（例如：全职/兼职/实习）`,

    [CollectionStage.EDUCATION]: `请提供您的教育经历。每条教育经历需要：
- 开始时间（格式：YYYY.MM，例如：2018.9）
- 结束时间（格式：YYYY.MM，例如：2022.6）
- 学校名称
- 专业
- 学历（例如：本科/硕士/博士）

请先提供第一条教育经历。如果有多条，我会继续询问。`,

    [CollectionStage.WORK_EXPERIENCE]: `请提供您的工作经历。每条工作经历需要：
- 开始时间（格式：YYYY.MM，例如：2022.7）
- 结束时间（格式：YYYY.MM，例如：2024.1，如果是至今请写"至今"）
- 公司名称
- 职位
- 行业（可选，例如：IT服务）
- 薪资（可选，例如：25000元/月）
- 工作描述（重点描述工作内容、成果，使用数字说明成绩）

请先提供第一条工作经历（最新的放在最前）。如果有多条，我会继续询问。`,

    [CollectionStage.PROJECT_EXPERIENCE]: `请提供您的项目经历。每条项目经历需要：
- 开始时间（格式：YYYY.MM）
- 结束时间（格式：YYYY.MM）
- 项目名称
- 您在项目中的职位/角色
- 项目描述（包括项目内容、您的工作内容、项目成果）

请先提供第一条项目经历。如果有多条，我会继续询问。`,

    [CollectionStage.SELF_EVALUATION]: `最后是自我评价。我将根据您之前提供的信息，为您生成一段简洁专业的自我评价。
您也可以自己提供，或者告诉我需要强调的重点。`,

    [CollectionStage.COMPLETE]: `太好了！您的简历信息已经收集完成。
您现在可以：
1. 查看简历预览
2. 导出为Word文档
3. 修改任何部分的内容`,
  }

  return prompts[stage] || ''
}

export function getNextStage(currentStage: CollectionStage): CollectionStage {
  const stageOrder = [
    CollectionStage.WELCOME,
    CollectionStage.PERSONAL_INFO,
    CollectionStage.JOB_INTENTION,
    CollectionStage.EDUCATION,
    CollectionStage.WORK_EXPERIENCE,
    CollectionStage.PROJECT_EXPERIENCE,
    CollectionStage.SELF_EVALUATION,
    CollectionStage.COMPLETE,
  ]

  const currentIndex = stageOrder.indexOf(currentStage)
  if (currentIndex < stageOrder.length - 1) {
    return stageOrder[currentIndex + 1]
  }
  return currentStage
}

export function isStageComplete(
  stage: CollectionStage,
  resumeData: PartialResume
): boolean {
  switch (stage) {
    case CollectionStage.PERSONAL_INFO:
      return !!resumeData.personalInfo
    case CollectionStage.JOB_INTENTION:
      return !!resumeData.jobIntention
    case CollectionStage.EDUCATION:
      return !!resumeData.education && resumeData.education.length > 0
    case CollectionStage.WORK_EXPERIENCE:
      return !!resumeData.workExperience && resumeData.workExperience.length > 0
    case CollectionStage.PROJECT_EXPERIENCE:
      return !!resumeData.projectExperience && resumeData.projectExperience.length > 0
    case CollectionStage.SELF_EVALUATION:
      return !!resumeData.selfEvaluation
    default:
      return false
  }
}

export function getStageDisplayName(stage: CollectionStage): string {
  const names: Record<CollectionStage, string> = {
    [CollectionStage.WELCOME]: '欢迎',
    [CollectionStage.PERSONAL_INFO]: '个人信息',
    [CollectionStage.JOB_INTENTION]: '求职意向',
    [CollectionStage.EDUCATION]: '教育经历',
    [CollectionStage.WORK_EXPERIENCE]: '工作经历',
    [CollectionStage.PROJECT_EXPERIENCE]: '项目经历',
    [CollectionStage.SELF_EVALUATION]: '自我评价',
    [CollectionStage.COMPLETE]: '完成',
  }
  return names[stage]
}

