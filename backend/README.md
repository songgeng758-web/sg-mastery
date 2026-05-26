# SGMastery Backend

基于 FastAPI 的后端 API 服务

## 技术栈

- **Python 3.10+**
- **FastAPI**: 现代、快速的 Web 框架
- **Uvicorn**: ASGI 服务器
- **Pydantic**: 数据验证和序列化

## 安装依赖

### 1. 创建虚拟环境（如果还没有）

```bash
python -m venv venv
```

### 2. 激活虚拟环境

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

## 启动开发服务器

### 方法 1: 使用启动脚本（推荐）

```bash
python start.py
```

### 方法 2: 使用 uvicorn 命令

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## 服务器配置

- **主机**: `127.0.0.1` (localhost)
- **端口**: `8000`
- **开发模式**: 启用热重载（--reload）
- **API 文档**: http://localhost:8000/docs (Swagger UI)
- **备用文档**: http://localhost:8000/redoc (ReDoc)

## API 端点

### 健康检查
- **GET** `/` - 返回 API 运行状态

### 代码执行
- **POST** `/api/run-code` - 执行代码（当前返回 mock 响应）
  - 请求体: `{"code": "string", "language": "string (可选)"}`
  - 响应: `{"status": "success", "message": "执行结果信息"}`

## 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── api/
│   │   └── routes.py        # API 路由定义
│   ├── models/
│   │   └── schemas.py       # Pydantic 数据模型
│   └── services/
│       └── code_executor.py # 代码执行服务
├── requirements.txt         # Python 依赖
├── start.py                 # 启动脚本
└── README.md               # 本文件
```

## 开发说明

### CORS 配置

后端已配置 CORS 中间件，允许来自前端开发服务器（http://localhost:5173）的跨域请求。

### Mock 响应

当前版本的 `/api/run-code` 端点返回固定的 mock 响应，用于验证前后端通信。未来版本将实现真实的代码执行功能。

## 故障排除

### 端口已被占用

如果端口 8000 已被占用，可以修改 `start.py` 中的端口号：

```python
uvicorn.run(
    "app.main:app",
    host="127.0.0.1",
    port=8001,  # 修改为其他端口
    reload=True
)
```

### 虚拟环境未激活

确保在运行命令前激活了虚拟环境。可以通过命令行提示符前缀 `(venv)` 来确认。

### 依赖安装失败

尝试升级 pip：
```bash
python -m pip install --upgrade pip
```

然后重新安装依赖：
```bash
pip install -r requirements.txt
```
