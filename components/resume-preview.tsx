'use client'

import type { PartialResume } from '@/lib/resume-schema'

interface ResumePreviewProps {
  resumeData: PartialResume
}

export function ResumePreview({ resumeData }: ResumePreviewProps) {
  const { personalInfo, jobIntention, education, workExperience, projectExperience, selfEvaluation } = resumeData

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">简历预览</h2>

      {/* 个人信息 */}
      {personalInfo && (
        <section className="mb-6">
          <h3 className="text-xl font-bold mb-2">{personalInfo.name}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p>性别：{personalInfo.gender}</p>
              <p>户籍：{personalInfo.household}</p>
            </div>
            <div>
              <p>年龄：{personalInfo.age}</p>
              <p>邮箱：{personalInfo.email}</p>
              <p>电话：{personalInfo.phone}</p>
              <p>民族：{personalInfo.ethnicity}</p>
            </div>
          </div>
        </section>
      )}

      {/* 求职意向 */}
      {jobIntention && (
        <section className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-blue-600">求职意向</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p>意向岗位：{jobIntention.position}</p>
              <p>期望薪资：{jobIntention.salary}</p>
            </div>
            <div>
              <p>意向城市：{jobIntention.city}</p>
              <p>求职类型：{jobIntention.jobType}</p>
            </div>
          </div>
        </section>
      )}

      {/* 教育经历 */}
      {education && education.length > 0 && (
        <section className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-blue-600">教育经历</h3>
          {education.map((edu, index) => (
            <div key={index} className="mb-4 text-sm">
              <p className="font-semibold">{edu.startTime}-{edu.endTime}</p>
              <p>{edu.schoolName}</p>
              <p>{edu.major} | {edu.degree}</p>
            </div>
          ))}
        </section>
      )}

      {/* 工作经历 */}
      {workExperience && workExperience.length > 0 && (
        <section className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-blue-600">工作经历</h3>
          {workExperience.map((work, index) => (
            <div key={index} className="mb-4 text-sm">
              <p className="font-semibold">{work.startTime}-{work.endTime}</p>
              <p>{work.companyName}</p>
              <p>{work.position} {work.industry && `| ${work.industry}`} {work.salary && `    ${work.salary}`}</p>
              <p className="mt-1">{work.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* 项目经历 */}
      {projectExperience && projectExperience.length > 0 && (
        <section className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-blue-600">项目经历</h3>
          {projectExperience.map((project, index) => (
            <div key={index} className="mb-4 text-sm">
              <p className="font-semibold">{project.startTime}-{project.endTime}</p>
              <p>{project.projectName}</p>
              <p>{project.position}</p>
              <p className="mt-1">{project.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* 自我评价 */}
      {selfEvaluation && (
        <section className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-blue-600">自我评价</h3>
          <p className="text-sm whitespace-pre-wrap">{selfEvaluation}</p>
        </section>
      )}

      {!personalInfo && !jobIntention && (
        <p className="text-gray-500 text-center">暂无数据，请先完成信息收集</p>
      )}
    </div>
  )
}

