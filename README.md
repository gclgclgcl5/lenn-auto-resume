# AI 简历生成器

一个基于 DeepSeek AI 的智能简历生成网站，通过渐进式对话收集用户信息，自动生成符合专业模板的 Word 简历文档。

## 功能特点

- 🤖 **AI 智能对话**：使用 DeepSeek AI 进行自然语言交互，引导用户填写简历信息
- 📋 **渐进式收集**：按模块逐步收集信息，降低填写压力
- 👁️ **实时预览**：随时查看已收集的简历内容
- 📄 **Word 导出**：生成符合专业模板的 Word 文档
- 🎨 **美观界面**：现代化的 UI 设计，响应式布局

## 技术栈

- **框架**：Next.js 14 (App Router)
- **AI SDK**：Vercel AI SDK
- **AI 模型**：DeepSeek Chat
- **文档生成**：docx
- **样式**：Tailwind CSS
- **类型安全**：TypeScript + Zod

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件（或使用 `.dev.vars`）：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 3. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
├── app/
│   ├── api/chat/route.ts      # DeepSeek AI API 路由
│   ├── layout.tsx              # 根布局
│   ├── page.tsx               # 主页面
│   └── globals.css            # 全局样式
├── components/
│   ├── resume-chat.tsx        # 主聊天组件
│   ├── resume-preview.tsx     # 简历预览组件
│   └── progress-indicator.tsx # 进度指示器
└── lib/
    ├── ai-config.ts           # AI 配置
    ├── word-generator.ts      # Word 文档生成器
    ├── resume-schema.ts       # 简历数据结构
    └── conversation-flow.ts  # 对话流程管理
```

## 使用说明

1. **开始对话**：打开网站后，AI 会引导您开始填写简历
2. **按模块填写**：
   - 个人信息（姓名、性别、年龄、电话、邮箱、户籍、民族）
   - 求职意向（岗位、城市、薪资、类型）
   - 教育经历（可多条）
   - 工作经历（可多条）
   - 项目经历（可多条）
   - 自我评价
3. **查看预览**：随时点击"查看预览"按钮查看已收集的信息
4. **导出 Word**：完成所有信息收集后，点击"导出Word文档"按钮

## 部署到 Cloudflare

### Cloudflare Pages

1. 连接 GitHub 仓库到 Cloudflare Pages
2. 构建命令：`npm run build`
3. 输出目录：`.next`
4. 环境变量：在 Cloudflare 控制台添加 `DEEPSEEK_API_KEY`

### 环境变量配置

在 Cloudflare Pages 设置中添加：
- `DEEPSEEK_API_KEY`：您的 DeepSeek API 密钥

## 注意事项

- API Key 请妥善保管，不要提交到代码仓库
- 简历数据仅在会话内保存，刷新页面后需要重新填写
- Word 文档在客户端生成，无需服务器处理

## 开发规范

- 使用 TypeScript 进行类型安全开发
- 遵循函数式编程风格
- 使用 Tailwind CSS 进行样式设计
- 优先使用 Server Components

## 许可证

MIT

