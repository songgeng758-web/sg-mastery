# 需求文档

## 简介

SGMastery 是一个纯本地运行的全栈学习应用 MVP，旨在帮助用户通过互动式代码练习掌握编程和数据库技能。应用包含三个核心模块：知识补给站（学习内容推送）、代码扫雷（代码调试挑战）和 HCM 实战（SQL 实战练习）。本 MVP 版本专注于前后端通信和基础 UI 实现，使用 mock 数据和固定响应。

## 术语表

- **Frontend**: 基于 React + Vite + Tailwind CSS 的前端应用
- **Backend**: 基于 Python + FastAPI 的后端 API 服务
- **Code_Editor**: 用于输入代码的文本编辑区域（使用原生 textarea 或轻量级组件）
- **Navigation_Bar**: 底部带毛玻璃效果的导航栏，包含三个 Tab
- **Mock_User**: 全局写死的模拟用户数据
- **Run_Button**: 触发代码执行的按钮
- **API_Endpoint**: 后端提供的 /api/run-code 接口

## 需求

### 需求 1: 项目结构和技术栈

**用户故事**: 作为开发者，我希望项目使用明确的技术栈和清晰的目录结构，以便于开发和维护。

#### 验收标准

1. THE Frontend SHALL 使用 React + Vite + Tailwind CSS 技术栈
2. THE Frontend SHALL 使用 lucide-react 作为图标库
3. THE Backend SHALL 使用 Python + FastAPI 框架
4. THE 项目根目录 SHALL 包含 frontend 和 backend 两个独立文件夹
5. THE Frontend SHALL 运行在独立的开发服务器上（Vite dev server）
6. THE Backend SHALL 运行在独立的 API 服务器上（FastAPI/Uvicorn）

### 需求 2: 本地单机运行模式

**用户故事**: 作为用户，我希望应用完全在本地运行，无需注册登录，以便快速开始学习。

#### 验收标准

1. THE 应用 SHALL 不包含用户注册功能
2. THE 应用 SHALL 不包含用户登录功能
3. THE 应用 SHALL 不包含用户鉴权模块
4. THE Frontend SHALL 使用全局写死的 Mock_User 数据
5. WHEN 应用启动时，THE Frontend SHALL 自动使用 Mock_User 身份

### 需求 3: 底部导航栏

**用户故事**: 作为用户，我希望通过底部导航栏在三个功能模块间切换，以便访问不同的学习内容。

#### 验收标准

1. THE Navigation_Bar SHALL 固定显示在页面底部
2. THE Navigation_Bar SHALL 包含三个 Tab：知识补给站、代码扫雷、HCM 实战
3. THE Navigation_Bar SHALL 应用毛玻璃视觉效果（backdrop-filter blur）
4. WHEN 用户点击某个 Tab 时，THE Frontend SHALL 切换到对应的页面视图
5. THE Navigation_Bar SHALL 高亮显示当前激活的 Tab
6. THE Navigation_Bar SHALL 使用深色主题配色
7. THE Navigation_Bar SHALL 为每个 Tab 显示对应的图标（使用 lucide-react）

### 需求 4: 知识补给站页面

**用户故事**: 作为用户，我希望在知识补给站页面查看学习卡片，以便获取编程知识。

#### 验收标准

1. THE 知识补给站页面 SHALL 显示"今日精进推送"标题
2. THE 知识补给站页面 SHALL 显示多个学习卡片（至少 3 个）
3. WHEN 显示学习卡片时，THE Frontend SHALL 展示卡片标题、标签和"展开阅读"按钮
4. THE 学习卡片 SHALL 使用圆角和半透明背景样式
5. THE 学习卡片 SHALL 使用深色主题（深蓝/黑色背景）
6. THE 学习卡片数据 SHALL 使用前端硬编码的 mock 数据
7. THE 学习卡片 SHALL 包含技术主题标签（如"前后端"、"硬件"、"数据库"等）

### 需求 5: 代码扫雷页面

**用户故事**: 作为用户，我希望在代码扫雷页面看到代码挑战和编辑器，以便练习调试技能。

#### 验收标准

1. THE 代码扫雷页面 SHALL 显示关卡进度信息（如"第 3/10 关"）
2. THE 代码扫雷页面 SHALL 包含 Code_Editor 区域
3. THE Code_Editor SHALL 显示预填充的 Python 代码示例
4. THE Code_Editor SHALL 使用深色主题
5. THE 代码扫雷页面 SHALL 在编辑器下方显示提示信息
6. THE 代码扫雷页面 SHALL 包含 Run_Button
7. THE 关卡数据和预填充代码 SHALL 使用前端硬编码的 mock 数据

### 需求 6: HCM 实战页面

**用户故事**: 作为用户，我希望在 HCM 实战页面看到业务场景和 SQL 编辑器，以便练习 SQL 查询技能。

#### 验收标准

1. THE HCM 实战页面 SHALL 显示业务背景描述（如"找出生效日期冲突的人员"）
2. THE HCM 实战页面 SHALL 显示员工数据表格
3. THE 员工数据表格 SHALL 包含列：员工ID、姓名、职位、生效日期、失效日期
4. THE HCM 实战页面 SHALL 包含 Code_Editor 区域用于输入 SQL 代码
5. THE Code_Editor SHALL 显示文件名标识（如"code.sql"）
6. THE HCM 实战页面 SHALL 包含"运行并检验"按钮
7. THE "运行并检验"按钮 SHALL 使用紫色渐变样式
8. THE 员工数据 SHALL 使用前端硬编码的 mock 数据

### 需求 7: 代码编辑器组件

**用户故事**: 作为用户，我希望使用简洁的代码编辑器输入代码，以便完成练习任务。

#### 验收标准

1. THE Code_Editor SHALL 使用原生 textarea 或轻量级编辑器组件实现
2. THE Code_Editor SHALL 支持多行文本输入
3. THE Code_Editor SHALL 使用等宽字体
4. THE Code_Editor SHALL 使用深色主题配色
5. THE Code_Editor SHALL 显示行号（如果使用支持行号的组件）
6. WHEN 用户输入文本时，THE Code_Editor SHALL 保持输入状态

### 需求 8: 代码执行功能（前端）

**用户故事**: 作为用户，我希望点击运行按钮后能看到代码执行结果，以便验证我的代码。

#### 验收标准

1. WHEN 用户点击 Run_Button 时，THE Frontend SHALL 读取 Code_Editor 中的文本内容
2. WHEN 用户点击 Run_Button 时，THE Frontend SHALL 通过 HTTP POST 请求发送代码到 Backend
3. THE Frontend SHALL 将代码内容作为 JSON 格式发送到 /api/run-code 端点
4. WHEN Backend 返回响应时，THE Frontend SHALL 解析 JSON 响应数据
5. WHEN Backend 返回响应时，THE Frontend SHALL 在页面上显示执行结果
6. IF Backend 请求失败，THEN THE Frontend SHALL 显示错误提示信息
7. WHEN 代码执行期间，THE Run_Button SHALL 显示加载状态（如禁用或显示加载图标）

### 需求 9: 代码执行 API（后端）

**用户故事**: 作为系统，我需要提供代码执行 API 接口，以便前端能够提交代码并获取结果。

#### 验收标准

1. THE Backend SHALL 提供 POST /api/run-code API_Endpoint
2. WHEN 接收到 POST 请求时，THE API_Endpoint SHALL 接受 JSON 格式的请求体
3. THE 请求体 SHALL 包含 code 字段（字符串类型）
4. WHEN 处理请求时，THE API_Endpoint SHALL 返回固定的 mock JSON 响应
5. THE mock 响应 SHALL 包含 status 字段（值为 "success"）
6. THE mock 响应 SHALL 包含 message 字段（包含描述性文本）
7. THE API_Endpoint SHALL 返回 HTTP 200 状态码
8. THE API_Endpoint SHALL 设置 CORS 头以允许前端跨域请求
9. THE mock 响应示例 SHALL 为：{"status": "success", "message": "代码执行成功，发现 3 条重叠数据"}

### 需求 10: UI 视觉设计

**用户故事**: 作为用户，我希望应用界面美观且符合现代设计规范，以便获得良好的使用体验。

#### 验收标准

1. THE Frontend SHALL 使用深色主题作为全局配色方案
2. THE Frontend SHALL 使用深蓝色或黑色作为主要背景色
3. THE 按钮组件 SHALL 使用蓝色或紫色渐变样式
4. THE 卡片组件 SHALL 使用圆角边框
5. THE 卡片组件 SHALL 使用半透明背景（rgba 或 backdrop-filter）
6. THE Navigation_Bar SHALL 使用毛玻璃效果（backdrop-filter: blur）
7. THE Code_Editor SHALL 使用深色代码编辑器主题
8. THE 文字内容 SHALL 使用浅色（白色或浅灰色）以确保在深色背景上可读

### 需求 11: 响应式布局

**用户故事**: 作为用户，我希望应用在不同屏幕尺寸下都能正常显示，以便在各种设备上使用。

#### 验收标准

1. THE Frontend SHALL 使用响应式布局设计
2. WHEN 在移动设备上显示时，THE Frontend SHALL 调整布局以适应小屏幕
3. THE Navigation_Bar SHALL 在所有屏幕尺寸下保持可用性
4. THE Code_Editor SHALL 在小屏幕上保持可编辑性
5. THE 数据表格 SHALL 在小屏幕上支持横向滚动或响应式调整

### 需求 12: 开发环境配置

**用户故事**: 作为开发者，我希望能够快速启动开发环境，以便进行开发和测试。

#### 验收标准

1. THE Frontend SHALL 提供 package.json 配置文件
2. THE Frontend SHALL 包含 npm run dev 启动脚本
3. THE Backend SHALL 提供 requirements.txt 或 pyproject.toml 依赖文件
4. THE Backend SHALL 包含启动脚本或说明文档
5. THE Frontend 开发服务器 SHALL 默认运行在 localhost:5173 或类似端口
6. THE Backend API 服务器 SHALL 默认运行在 localhost:8000 或类似端口
7. THE Backend SHALL 配置 CORS 以允许 Frontend 开发服务器的请求
