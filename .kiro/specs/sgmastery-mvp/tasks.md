# 实现计划: SGMastery MVP

## 概述

本实现计划将 SGMastery 学习应用分解为增量式的开发任务。实现顺序遵循"先建立基础架构，再实现核心功能，最后完善交互和测试"的原则。每个任务都是独立的代码编写步骤，确保代码能够逐步集成并保持可运行状态。

## 任务列表

### 1. 初始化项目结构和配置

- [x] 1.1 创建项目根目录和基础文件夹结构
  - 创建 frontend 和 backend 文件夹
  - 初始化 Git 仓库和 .gitignore 文件
  - _需求: 1.4_

- [x] 1.2 初始化前端项目
  - 使用 Vite 创建 React + TypeScript 项目
  - 安装依赖：react-router-dom, lucide-react, tailwindcss
  - 配置 Tailwind CSS（tailwind.config.js, postcss.config.js）
  - 配置深色主题和自定义颜色
  - _需求: 1.1, 1.2, 10.1, 10.2_

- [x] 1.3 初始化后端项目
  - 创建 Python 虚拟环境
  - 创建 requirements.txt 并安装 FastAPI, Uvicorn, Pydantic
  - 创建基础目录结构（app/api, app/models, app/services）
  - _需求: 1.3, 12.3_

- [x] 1.4 配置开发环境脚本
  - 前端添加 package.json 启动脚本
  - 后端创建启动脚本或 README 说明
  - 配置开发服务器端口（前端 5173，后端 8000）
  - _需求: 12.1, 12.2, 12.4, 12.5, 12.6_

### 2. 实现后端 API 基础

- [x] 2.1 创建 FastAPI 应用和 CORS 配置
  - 在 app/main.py 中创建 FastAPI 应用实例
  - 配置 CORSMiddleware 允许前端跨域请求
  - 添加根路由 GET / 返回健康检查信息
  - _需求: 9.8, 12.7_

- [x] 2.2 定义 Pydantic 数据模型
  - 在 app/models/schemas.py 中定义 CodeExecutionRequest 模型
  - 定义 CodeExecutionResponse 模型
  - 添加字段验证规则
  - _需求: 9.3_

- [x] 2.3 实现 mock 代码执行服务
  - 在 app/services/code_executor.py 中创建 execute_code_mock 函数
  - 返回固定的成功响应（status: "success", message: "代码执行成功，发现 3 条重叠数据"）
  - _需求: 9.4, 9.9_

- [x] 2.4 实现 /api/run-code 端点
  - 在 app/api/routes.py 中创建 APIRouter
  - 实现 POST /api/run-code 路由处理器
  - 调用 mock 执行服务并返回响应
  - 在 main.py 中注册路由
  - _需求: 9.1, 9.2, 9.5, 9.6, 9.7_

- [ ]* 2.5 编写后端单元测试
  - 测试 /api/run-code 端点返回正确的响应格式
  - 测试 CORS 头配置
  - 测试请求验证（缺少 code 字段的情况）
  - _需求: 9.1, 9.2, 9.3, 9.5, 9.6, 9.7, 9.8_

- [ ]* 2.6 编写后端属性测试
  - **属性 10: API 验证请求格式**
  - **验证需求: 9.2, 9.3**
  
- [ ]* 2.7 编写后端属性测试
  - **属性 11: API 返回成功的 mock 响应**
  - **验证需求: 9.4, 9.7**

- [ ]* 2.8 编写后端属性测试
  - **属性 12: API 响应包含必需字段**
  - **验证需求: 9.5, 9.6**

- [ ]* 2.9 编写后端属性测试
  - **属性 13: API 设置 CORS 头**
  - **验证需求: 9.8**

### 3. 实现前端基础架构

- [x] 3.1 创建 TypeScript 类型定义
  - 在 src/types/index.ts 中定义所有接口类型
  - 定义 User, KnowledgeCard, DebugChallenge, Employee, HCMScenario 接口
  - 定义 CodeExecutionRequest, CodeExecutionResponse 接口
  - _需求: 2.4_

- [x] 3.2 创建 mock 数据文件
  - 在 src/data/mockData.ts 中定义 mockUser
  - 定义 knowledgeCards 数组（至少 3 个卡片）
  - 定义 debugChallenges 数组
  - 定义 hcmScenarios 数组（包含员工数据）
  - _需求: 2.4, 4.6, 5.7, 6.8_

- [x] 3.3 实现 API 客户端服务
  - 在 src/services/api.ts 中创建 ApiService 类
  - 实现 executeCode 方法发送 POST 请求到 /api/run-code
  - 处理请求错误和响应解析
  - 导出 apiService 单例实例
  - _需求: 8.2, 8.3, 8.4, 8.6_

- [x] 3.4 配置 React Router
  - 在 src/App.tsx 中设置路由配置
  - 定义三个路由：/knowledge, /debug, /practice
  - 设置默认路由重定向到 /knowledge
  - _需求: 3.4_

### 4. 实现通用 UI 组件

- [x] 4.1 实现 Button 组件
  - 在 src/components/common/Button.tsx 中创建可复用按钮组件
  - 支持 primary, secondary, gradient 变体
  - 支持 loading 和 disabled 状态
  - 应用 Tailwind CSS 样式（蓝色/紫色渐变）
  - _需求: 10.3_

- [x] 4.2 实现 Card 组件
  - 在 src/components/common/Card.tsx 中创建卡片容器组件
  - 应用圆角和半透明背景样式
  - 支持标题、标签列表和子内容
  - 可选的展开按钮
  - _需求: 10.4, 10.5_

- [x] 4.3 实现 CodeEditor 组件
  - 在 src/components/common/CodeEditor.tsx 中创建代码编辑器组件
  - 使用原生 textarea 或轻量级编辑器
  - 应用深色主题和等宽字体样式
  - 支持 value, onChange, language, filename 属性
  - 可选显示文件名标识
  - _需求: 7.1, 7.2, 7.3, 7.4, 7.6, 10.7_

- [ ]* 4.4 编写 CodeEditor 组件单元测试
  - 测试组件渲染
  - 测试文本输入和 onChange 回调
  - 测试文件名显示
  - _需求: 7.2, 7.6_

- [ ]* 4.5 编写 CodeEditor 属性测试
  - **属性 5: 代码编辑器保存输入状态**
  - **验证需求: 7.2, 7.6**

### 5. 实现布局组件

- [x] 5.1 实现 NavigationBar 组件
  - 在 src/components/layout/NavigationBar.tsx 中创建导航栏组件
  - 定义三个 Tab 配置（知识补给站、代码扫雷、HCM 实战）
  - 使用 lucide-react 图标（BookOpen, Bug, Database）
  - 应用毛玻璃效果样式（backdrop-blur-lg）
  - 固定在页面底部
  - 高亮当前激活的 Tab
  - 处理 Tab 点击事件
  - _需求: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 10.6_

- [x] 5.2 实现 Layout 组件
  - 在 src/components/layout/Layout.tsx 中创建全局布局组件
  - 包含深色主题背景
  - 集成 NavigationBar 组件
  - 提供 children 内容区域
  - _需求: 10.1, 10.2, 10.8_

- [ ]* 5.3 编写 NavigationBar 组件单元测试
  - 测试三个 Tab 的渲染
  - 测试 Tab 点击事件
  - 测试当前激活 Tab 的高亮样式
  - _需求: 3.2, 3.4, 3.5, 3.7_

- [ ]* 5.4 编写 NavigationBar 属性测试
  - **属性 1: 导航栏 Tab 切换视图**
  - **验证需求: 3.4**

- [ ]* 5.5 编写 NavigationBar 属性测试
  - **属性 2: 导航栏高亮当前激活 Tab**
  - **验证需求: 3.5**

- [ ]* 5.6 编写 NavigationBar 属性测试
  - **属性 3: 导航栏 Tab 显示图标**
  - **验证需求: 3.7**

### 6. 实现知识补给站页面

- [x] 6.1 实现 KnowledgeHub 页面组件
  - 在 src/components/pages/KnowledgeHub.tsx 中创建页面组件
  - 显示"今日精进推送"标题
  - 从 mockData 加载 knowledgeCards 数据
  - 使用 Card 组件渲染每个学习卡片
  - 显示卡片标题、标签和"展开阅读"按钮
  - 实现展开阅读交互（可选：显示完整内容或跳转）
  - _需求: 4.1, 4.2, 4.3, 4.7_

- [ ]* 6.2 编写 KnowledgeHub 页面单元测试
  - 测试页面标题显示
  - 测试至少 3 个卡片渲染
  - 测试卡片内容（标题、标签、按钮）
  - _需求: 4.1, 4.2, 4.3_

- [ ]* 6.3 编写 KnowledgeHub 属性测试
  - **属性 4: 学习卡片包含必需元素**
  - **验证需求: 4.3, 4.7**

### 7. 实现代码扫雷页面

- [x] 7.1 实现 CodeDebug 页面组件
  - 在 src/components/pages/CodeDebug.tsx 中创建页面组件
  - 显示关卡进度信息（从 mockData 获取）
  - 集成 CodeEditor 组件并预填充 Python 代码
  - 显示提示信息
  - 添加运行按钮
  - 实现按钮点击处理：调用 apiService.executeCode
  - 显示加载状态和执行结果
  - 处理错误情况
  - _需求: 5.1, 5.2, 5.3, 5.5, 5.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ]* 7.2 编写 CodeDebug 页面单元测试
  - 测试关卡进度显示
  - 测试 CodeEditor 渲染和预填充代码
  - 测试提示信息显示
  - 测试运行按钮存在
  - 测试按钮点击触发 API 调用（使用 mock）
  - _需求: 5.1, 5.2, 5.3, 5.5, 5.6_

- [ ]* 7.3 编写 CodeDebug 属性测试
  - **属性 6: 运行按钮触发完整 API 调用**
  - **验证需求: 8.1, 8.2, 8.3**

- [ ]* 7.4 编写 CodeDebug 属性测试
  - **属性 7: 前端正确处理 API 响应**
  - **验证需求: 8.4, 8.5**

- [ ]* 7.5 编写 CodeDebug 属性测试
  - **属性 8: 前端显示 API 错误信息**
  - **验证需求: 8.6**

- [ ]* 7.6 编写 CodeDebug 属性测试
  - **属性 9: 运行按钮显示加载状态**
  - **验证需求: 8.7**

### 8. 实现 HCM 实战页面

- [x] 8.1 实现 HCMPractice 页面组件
  - 在 src/components/pages/HCMPractice.tsx 中创建页面组件
  - 显示业务背景描述（从 mockData 获取）
  - 创建员工数据表格组件
  - 表格包含列：员工ID、姓名、职位、生效日期、失效日期
  - 集成 CodeEditor 组件用于 SQL 输入
  - 显示文件名标识"code.sql"
  - 添加"运行并检验"按钮（紫色渐变样式）
  - 实现按钮点击处理：调用 apiService.executeCode
  - 显示加载状态和执行结果
  - 处理错误情况
  - _需求: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ]* 8.2 编写 HCMPractice 页面单元测试
  - 测试业务背景描述显示
  - 测试员工数据表格渲染
  - 测试表格列标题
  - 测试 CodeEditor 渲染和文件名显示
  - 测试"运行并检验"按钮存在
  - 测试按钮点击触发 API 调用（使用 mock）
  - _需求: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

### 9. 实现响应式布局

- [x] 9.1 添加响应式样式到所有组件
  - 为 NavigationBar 添加移动端适配样式
  - 为 CodeEditor 添加小屏幕适配
  - 为数据表格添加横向滚动或响应式列调整
  - 为卡片布局添加响应式网格
  - 使用 Tailwind CSS 响应式断点（sm, md, lg）
  - _需求: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 9.2 编写响应式布局属性测试
  - **属性 14: 移动设备响应式布局**
  - **验证需求: 11.2**

- [ ]* 9.3 编写响应式布局属性测试
  - **属性 15: 导航栏响应式可用性**
  - **验证需求: 11.3**

- [ ]* 9.4 编写响应式布局属性测试
  - **属性 16: 代码编辑器响应式可编辑性**
  - **验证需求: 11.4**

- [ ]* 9.5 编写响应式布局属性测试
  - **属性 17: 数据表格响应式显示**
  - **验证需求: 11.5**

### 10. 集成和完善

- [x] 10.1 在 App.tsx 中集成所有页面
  - 导入所有页面组件
  - 配置路由映射
  - 包裹 Layout 组件
  - 测试路由导航功能
  - _需求: 3.4_

- [x] 10.2 添加错误边界组件
  - 创建 ErrorBoundary 组件捕获 React 错误
  - 显示友好的错误提示
  - 在 App.tsx 中应用错误边界
  - _需求: 8.6_

- [x] 10.3 优化用户体验细节
  - 添加按钮悬停效果
  - 添加页面切换过渡动画
  - 优化加载状态显示
  - 确保所有交互有视觉反馈
  - _需求: 3.4, 8.7_

- [ ]* 10.4 编写集成测试
  - 测试完整的代码执行流程（前端 → 后端 → 前端）
  - 测试路由导航
  - 测试错误处理流程
  - _需求: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

### 11. 检查点 - 确保所有测试通过

- [x] 11.1 运行所有测试并修复问题
  - 运行前端单元测试和属性测试
  - 运行后端单元测试和属性测试
  - 确保所有测试通过
  - 如有问题，询问用户

### 12. 文档和部署准备

- [x] 12.1 创建项目 README 文档
  - 添加项目简介和功能说明
  - 添加技术栈说明
  - 添加安装和运行指南
  - 添加开发指南和项目结构说明
  - _需求: 12.4_

- [x] 12.2 创建前端 README
  - 说明如何安装依赖
  - 说明如何启动开发服务器
  - 说明如何构建生产版本
  - _需求: 12.2_

- [x] 12.3 创建后端 README
  - 说明如何创建虚拟环境
  - 说明如何安装依赖
  - 说明如何启动 API 服务器
  - _需求: 12.4_

- [x] 12.4 验证完整的开发流程
  - 从零开始按照 README 安装和启动项目
  - 测试所有三个页面功能
  - 测试代码执行功能
  - 确保前后端通信正常
  - _需求: 1.5, 1.6, 12.5, 12.6_

### 13. 最终检查点

- [x] 13.1 最终验证和用户确认
  - 确保所有功能正常工作
  - 确保 UI 符合设计稿要求
  - 如有任何问题，询问用户

## 注意事项

- 标记 `*` 的任务为可选测试任务，可以跳过以加快 MVP 交付
- 每个任务都引用了具体的需求编号，便于追溯
- 属性测试任务明确标注了属性编号和验证的需求
- 检查点任务确保增量验证和用户反馈
- 所有任务都是可由代码生成 AI 完成的具体编码步骤
