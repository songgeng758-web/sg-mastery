# SGMastery Frontend

基于 React + Vite + Tailwind CSS 的前端应用

## 技术栈

- **React 18**: 现代化的组件化 UI 框架
- **TypeScript**: 类型安全的 JavaScript 超集
- **Vite**: 快速的开发服务器和构建工具
- **Tailwind CSS**: 实用优先的 CSS 框架
- **React Router**: 客户端路由管理
- **lucide-react**: 轻量级图标库

## 安装依赖

```bash
npm install
```

## 启动开发服务器

```bash
npm run dev
```

应用将运行在 http://localhost:5173

## 可用脚本

```bash
npm run dev      # 启动开发服务器（带热模块替换）
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
npm run lint     # 运行 ESLint 代码检查
```

## 项目结构

```
frontend/
├── src/
│   ├── components/          # React 组件
│   │   ├── layout/         # 布局组件
│   │   │   ├── NavigationBar.tsx  # 底部导航栏
│   │   │   └── Layout.tsx         # 全局布局
│   │   ├── common/         # 通用组件
│   │   │   ├── CodeEditor.tsx     # 代码编辑器
│   │   │   ├── Button.tsx         # 按钮组件
│   │   │   └── Card.tsx           # 卡片组件
│   │   └── pages/          # 页面组件
│   │       ├── KnowledgeHub.tsx   # 知识补给站
│   │       ├── CodeDebug.tsx      # 代码扫雷
│   │       └── HCMPractice.tsx    # HCM 实战
│   ├── services/           # API 客户端
│   │   └── api.ts         # API 服务
│   ├── data/              # Mock 数据
│   │   └── mockData.ts    # 模拟数据
│   ├── types/             # TypeScript 类型定义
│   │   └── index.ts       # 类型接口
│   ├── App.tsx            # 应用入口
│   ├── main.tsx           # React 渲染入口
│   └── index.css          # 全局样式
├── public/                # 静态资源
├── index.html             # HTML 模板
├── vite.config.ts         # Vite 配置
├── tailwind.config.js     # Tailwind CSS 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖
```

## 组件说明

### 布局组件

- **NavigationBar**: 底部导航栏，包含三个 Tab（知识补给站、代码扫雷、HCM 实战），带毛玻璃效果
- **Layout**: 全局布局容器，包含深色主题背景和导航栏

### 通用组件

- **CodeEditor**: 代码编辑器组件，支持 Python 和 SQL 语法，深色主题
- **Button**: 可复用按钮组件，支持多种样式变体（primary, secondary, gradient）
- **Card**: 卡片容器组件，圆角和半透明背景

### 页面组件

- **KnowledgeHub**: 知识补给站页面，显示学习卡片
- **CodeDebug**: 代码扫雷页面，提供代码调试挑战
- **HCMPractice**: HCM 实战页面，提供 SQL 查询练习

## 开发说明

### 路由配置

应用使用 React Router 进行客户端路由管理：

- `/knowledge` - 知识补给站
- `/debug` - 代码扫雷
- `/practice` - HCM 实战

默认路由重定向到 `/knowledge`

### API 通信

前端通过 `src/services/api.ts` 中的 `ApiService` 与后端通信：

- **基础 URL**: `http://localhost:8000`
- **代码执行端点**: `POST /api/run-code`

### Mock 数据

当前版本使用前端硬编码的 mock 数据（`src/data/mockData.ts`）：

- `mockUser`: 模拟用户数据
- `knowledgeCards`: 学习卡片数据
- `debugChallenges`: 代码调试挑战数据
- `hcmScenarios`: HCM 实战场景数据

### 样式系统

使用 Tailwind CSS 实用类进行样式设计：

- **深色主题**: 全局使用深蓝/黑色背景
- **毛玻璃效果**: `backdrop-blur-lg bg-opacity-80`
- **渐变按钮**: `bg-gradient-to-r from-blue-500 to-purple-600`
- **响应式设计**: 使用 Tailwind 断点（sm, md, lg）

### 热模块替换 (HMR)

Vite 提供快速的 HMR 功能，代码修改后会立即在浏览器中更新，无需刷新页面。

## 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

## 故障排除

### 端口冲突

如果端口 5173 被占用，可以在 `vite.config.ts` 中修改端口：

```typescript
export default defineConfig({
  server: {
    port: 5174,  // 修改为其他端口
  },
})
```

### API 连接失败

1. 确保后端服务正在运行（http://localhost:8000）
2. 检查浏览器控制台的 CORS 错误
3. 确认 `src/services/api.ts` 中的 `baseURL` 配置正确

### 依赖安装问题

清除缓存并重新安装：

```bash
rm -rf node_modules package-lock.json
npm install
```

## 代码规范

项目使用 ESLint 进行代码检查：

```bash
npm run lint
```

建议在开发时配置编辑器自动格式化和 lint 检查。

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 相关链接

- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [React Router 文档](https://reactrouter.com/)
