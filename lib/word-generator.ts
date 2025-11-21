import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx'
import { saveAs } from 'file-saver'
import type { Resume } from './resume-schema'

export async function generateResumeDoc(resume: Resume) {
  console.log('[generateResumeDoc] Starting, resume data:', resume)
  const { personalInfo, jobIntention, education, workExperience, projectExperience, selfEvaluation } = resume

  // 构建所有元素（Paragraph和Table）
  const allChildren: (Paragraph | Table)[] = []
  
  // 蓝色头部横幅
  allChildren.push(createHeaderBanner())
  console.log('[generateResumeDoc] Header banner added')
  
  // 个人信息区域（展开数组）
  const personalInfoSections = createPersonalInfoSection(personalInfo)
  allChildren.push(...personalInfoSections)
  console.log('[generateResumeDoc] Personal info added, sections:', personalInfoSections.length)
  
  // 求职意向（展开数组）
  const jobIntentionSections = createJobIntentionSection(jobIntention)
  allChildren.push(...jobIntentionSections)
  console.log('[generateResumeDoc] Job intention added, sections:', jobIntentionSections.length)
  
  // 教育经历（展开数组）
  const educationSections = createEducationSection(education)
  allChildren.push(...educationSections)
  console.log('[generateResumeDoc] Education added, sections:', educationSections.length)
  
  // 工作经历（展开数组）
  const workExperienceSections = createWorkExperienceSection(workExperience)
  allChildren.push(...workExperienceSections)
  console.log('[generateResumeDoc] Work experience added, sections:', workExperienceSections.length)
  
  // 项目经历（展开数组）
  const projectExperienceSections = createProjectExperienceSection(projectExperience)
  allChildren.push(...projectExperienceSections)
  console.log('[generateResumeDoc] Project experience added, sections:', projectExperienceSections.length)
  
  // 自我评价（展开数组）
  const selfEvaluationSections = createSelfEvaluationSection(selfEvaluation)
  allChildren.push(...selfEvaluationSections)
  console.log('[generateResumeDoc] Self evaluation added, sections:', selfEvaluationSections.length)
  
  console.log('[generateResumeDoc] Total children:', allChildren.length)

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: allChildren,
      },
    ],
  })

  console.log('[generateResumeDoc] Document created, generating blob...')
  const blob = await Packer.toBlob(doc)
  console.log('[generateResumeDoc] Blob generated, size:', blob.size, 'bytes')
  const fileName = `简历_${personalInfo.name || 'Resume'}_${Date.now()}.docx`
  console.log('[generateResumeDoc] Saving file:', fileName)
  saveAs(blob, fileName)
  console.log('[generateResumeDoc] File saved successfully')
}

function createHeaderBanner(): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: '个人 | 简历',
        color: 'FFFFFF',
        bold: true,
        size: 24,
      }),
      new TextRun({
        text: '    PERSONAL RESUME',
        color: 'FFFFFF',
        size: 18,
      }),
    ],
    alignment: AlignmentType.CENTER,
    shading: {
      type: ShadingType.SOLID,
      color: '4472C4', // 蓝色
    },
    spacing: { before: 0, after: 400 },
  })
}

function createPersonalInfoSection(personalInfo: Resume['personalInfo']): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = []
  
  // 姓名（大标题）
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: personalInfo.name,
          size: 32,
          bold: true,
          color: '2F2F2F',
        }),
      ],
      spacing: { before: 200, after: 300 },
    })
  )

  // 个人信息表格（两列布局）- 表格直接作为元素，不包裹在Paragraph中
  const infoTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `性别：${personalInfo.gender}`, size: 20 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `户籍：${personalInfo.household}`, size: 20 }),
                ],
              }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `年龄：${personalInfo.age}`, size: 20 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `邮箱：${personalInfo.email}`, size: 20 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `电话：${personalInfo.phone}`, size: 20 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `民族：${personalInfo.ethnicity}`, size: 20 }),
                ],
              }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  })

  // 表格直接作为元素添加
  elements.push(infoTable)
  elements.push(new Paragraph({ text: '', spacing: { after: 400 } }))

  console.log('[createPersonalInfoSection] Created', elements.length, 'elements for personal info')
  return elements
}

function createJobIntentionSection(jobIntention: Resume['jobIntention']): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = []
  
  // 标题
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '求职意向',
          size: 24,
          bold: true,
          color: '4472C4',
        }),
      ],
      spacing: { before: 200, after: 200 },
    })
  )

  // 求职意向表格 - 表格直接作为元素
  const intentionTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `意向岗位：${jobIntention.position}`, size: 20 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `期望薪资：${jobIntention.salary}`, size: 20 }),
                ],
              }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `意向城市：${jobIntention.city}`, size: 20 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `求职类型：${jobIntention.jobType}`, size: 20 }),
                ],
              }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  })

  elements.push(intentionTable)
  elements.push(new Paragraph({ text: '', spacing: { after: 400 } }))

  console.log('[createJobIntentionSection] Created', elements.length, 'elements for job intention')
  return elements
}

function createEducationSection(education: Resume['education']): (Paragraph | Table)[] {
  const paragraphs: (Paragraph | Table)[] = []
  
  // 标题
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '教育经历',
          size: 24,
          bold: true,
          color: '4472C4',
        }),
      ],
      spacing: { before: 200, after: 200 },
    })
  )

  // 每条教育经历
  education.forEach((edu) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${edu.startTime}-${edu.endTime}`,
            bold: true,
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      })
    )
    
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: edu.schoolName,
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      })
    )
    
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${edu.major} | ${edu.degree}`,
            size: 20,
          }),
        ],
        spacing: { after: 200 },
      })
    )
  })

  paragraphs.push(new Paragraph({ text: '', spacing: { after: 400 } }))

  console.log('[createEducationSection] Created', paragraphs.length, 'paragraphs for', education.length, 'education entries')
  return paragraphs
}

function createWorkExperienceSection(workExperience: Resume['workExperience']): (Paragraph | Table)[] {
  const paragraphs: (Paragraph | Table)[] = []
  
  // 标题
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '工作经历',
          size: 24,
          bold: true,
          color: '4472C4',
        }),
      ],
      spacing: { before: 200, after: 200 },
    })
  )

  // 每条工作经历
  workExperience.forEach((work) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${work.startTime}-${work.endTime}`,
            bold: true,
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      })
    )
    
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: work.companyName,
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      })
    )
    
    const positionText = work.industry
      ? `${work.position} | ${work.industry}`
      : work.position
    const salaryText = work.salary ? `    ${work.salary}` : ''
    
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: positionText + salaryText,
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      })
    )
    
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: work.description,
            size: 20,
          }),
        ],
        spacing: { after: 200 },
      })
    )
  })

  paragraphs.push(new Paragraph({ text: '', spacing: { after: 400 } }))

  console.log('[createWorkExperienceSection] Created', paragraphs.length, 'paragraphs for', workExperience.length, 'work experience entries')
  return paragraphs
}

function createProjectExperienceSection(projectExperience: Resume['projectExperience']): (Paragraph | Table)[] {
  const paragraphs: (Paragraph | Table)[] = []
  
  // 标题
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '项目经历',
          size: 24,
          bold: true,
          color: '4472C4',
        }),
      ],
      spacing: { before: 200, after: 200 },
    })
  )

  // 每条项目经历
  projectExperience.forEach((project) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${project.startTime}-${project.endTime}`,
            bold: true,
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      })
    )
    
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: project.projectName,
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      })
    )
    
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: project.position,
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      })
    )
    
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: project.description,
            size: 20,
          }),
        ],
        spacing: { after: 200 },
      })
    )
  })

  paragraphs.push(new Paragraph({ text: '', spacing: { after: 400 } }))

  console.log('[createProjectExperienceSection] Created', paragraphs.length, 'paragraphs for', projectExperience.length, 'project entries')
  return paragraphs
}

function createSelfEvaluationSection(selfEvaluation: string): (Paragraph | Table)[] {
  const paragraphs: (Paragraph | Table)[] = []
  
  // 标题
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '自我评价',
          size: 24,
          bold: true,
          color: '4472C4',
        }),
      ],
      spacing: { before: 200, after: 200 },
    })
  )
  
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: selfEvaluation,
          size: 20,
        }),
      ],
      spacing: { after: 200 },
    })
  )

  console.log('[createSelfEvaluationSection] Created', paragraphs.length, 'paragraphs, selfEvaluation length:', selfEvaluation.length)
  return paragraphs
}

