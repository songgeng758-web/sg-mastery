# SGMastery MVP

一个纯本地运行的全栈学习应用，帮助用户通过互动式代码练习掌握编程和数据库技能。

## 功能模块

- **知识补给站**: 学习内容推送，提供编程知识卡片
- **代码扫雷**: 代码调试挑战，练习调试技能
- **HCM 实战**: SQL 实战练习，掌握数据库查询

## 技术栈

### 前端
- React 18 + TypeScript
- Vite (开发服务器和构建工具)
- Tailwind CSS (样式框架)
- React Router (路由管理)
- lucide-react (图标库)

### 后端
- Python 3.10+
- FastAPI (Web 框架)
- Uvicorn (ASGI 服务器)
- Pydantic (数据验证)

## 快速开始

### 前置要求

- Node.js 18+ 和 npm
- Python 3.10+
- Git

### 1. 克隆项目

```bash
git clone <repository-url>
cd sgmastery-mvp
```

### 2. 启动后端服务

```bash
# 进入后端目录
cd backend

# 创建并激活虚拟环境（首次运行）
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 安装依赖（首次运行）
pip install -r requirements.txt

# 启动后端服务器（端口 8000）
python start.py
```

后端服务将运行在 http://localhost:8000

### 3. 启动前端服务

打开新的终端窗口：

```bash
# 进入前端目录
cd frontend

# 安装依赖（首次运行）
npm install

# 启动前端开发服务器（端口 5173）
npm run dev
```

前端应用将运行在 http://localhost:5173

### 4. 访问应用

在浏览器中打开 http://localhost:5173

## 开发服务器端口

- **前端**: http://localhost:5173
- **后端**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

## 项目结构

```
sgmastery-mvp/
├── frontend/              # React 前端应用
│   ├── src/
│   │   ├── components/   # React 组件
│   │   ├── services/     # API 客户端
│   │   ├── data/         # Mock 数据
│   │   ├── types/        # TypeScript 类型定义
│   │   └── App.tsx       # 应用入口
│   ├── package.json
│   └── vite.config.ts
│
├── backend/              # FastAPI 后端服务
│   ├── app/
│   │   ├── api/         # API 路由
│   │   ├── models/      # 数据模型
│   │   ├── services/    # 业务逻辑
│   │   └── main.py      # 应用入口
│   ├── requirements.txt
│   └── start.py         # 启动脚本
│
└── README.md            # 本文件
```

## 可用脚本

### 前端

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
npm run lint     # 运行代码检查
```

### 后端

```bash
python start.py  # 启动开发服务器（推荐）
# 或
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## 功能特性

### 当前版本 (MVP)

- ✅ 前后端分离架构
- ✅ 深色主题 UI
- ✅ 三个功能模块页面
- ✅ 底部导航栏（毛玻璃效果）
- ✅ 代码编辑器组件
- ✅ 前后端 API 通信（Mock 响应）
- ✅ 响应式布局
- ✅ 本地单机运行（无需登录）

### 未来计划

- 真实代码执行功能
- 用户进度保存
- 更多学习内容和挑战
- 代码执行结果可视化
- 成就系统

## 开发说明

### Mock 数据

当前版本使用 mock 数据和固定响应来验证前后端通信流程：

- 学习卡片数据：前端硬编码
- 代码挑战数据：前端硬编码
- 员工数据：前端硬编码
- API 响应：后端返回固定的成功响应

### CORS 配置

后端已配置 CORS 中间件，允许来自前端开发服务器的跨域请求。

### 热重载

- 前端：Vite 提供快速的 HMR（热模块替换）
- 后端：Uvicorn 的 `--reload` 选项支持代码变更自动重启

## 故障排除

### 端口冲突

如果默认端口被占用，可以修改配置：

**前端** (frontend/vite.config.ts):
```typescript
server: {
  port: 5174,  // 修改为其他端口
}
```

**后端** (backend/start.py):
```python
uvicorn.run(
    "app.main:app",
    port=8001,  # 修改为其他端口
)
```

### 依赖安装问题

**前端**:
```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm install
```

**后端**:
```bash
# 升级 pip 并重新安装
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### API 连接失败

1. 确保后端服务正在运行（http://localhost:8000）
2. 检查浏览器控制台的 CORS 错误
3. 确认前端 API 客户端配置的 baseURL 正确

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
