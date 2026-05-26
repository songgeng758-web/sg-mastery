# 阶段 1 实施计划：打通 AI 调用链路 + 知识补给站 AI 类比讲解

**范围**：仅限知识补给站模块，不涉及代码扫雷和 HCM 实战。  
**日期**：2026-05-26

---

## 一、文件清单总览

| 操作 | 文件 |
|------|------|
| 修改 | `backend/requirements.txt` |
| 检查/修改 | `.gitignore`（确保 `.env` 被排除，见优化 1） |
| 新建 | `backend/.env` |
| 新建 | `backend/.env.example` |
| 新建 | `backend/app/services/ai_service.py` |
| 修改 | `backend/app/models/schemas.py` |
| 修改 | `backend/app/api/routes.py` |
| 修改 | `frontend/src/types/index.ts` |
| 修改 | `frontend/src/services/api.ts` |
| 修改 | `frontend/src/components/pages/KnowledgeHub.tsx` |

共 10 个文件，2 新建 7 修改 1 检查/修改（只新增，不删除任何现有代码）。

---

## 二、后端逐文件计划

### `backend/requirements.txt` — 新增 2 行

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pytest==7.4.3
httpx==0.25.2
openai>=1.0.0        # 新增：兼容 DeepSeek 的 OpenAI SDK
python-dotenv>=1.0.0 # 新增：读取 .env 文件
```

---

### `.gitignore` — 前置检查（优化 1）

在创建 `backend/.env` 之前，先检查根目录 `.gitignore` 是否已包含 `.env` 排除规则。  
若缺少，追加以下两行：

```
backend/.env
.env
```

> 当前 `.gitignore` 已有 `backend/.env`，如检查通过则跳过此步，若缺少则追加。

---

### `backend/.env` — 新建（不提交 git）

```env
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

> 此文件受 `.gitignore` 保护，不会进入 git。创建后请将占位符替换为真实 API Key。

---

### `backend/.env.example` — 新建（提交 git，作为模板）

```env
# 复制此文件为 .env，填入真实的 API Key
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

---

### `backend/app/services/ai_service.py` — 新建（核心文件）

**整体结构**：

```python
import os
import logging
from openai import OpenAI
from dotenv import load_dotenv
from app.models.schemas import ExplainResponse, ExplainData, UsageInfo

load_dotenv()

logger = logging.getLogger(__name__)

# 优化 2：API Key 校验——启动时立即检测，而不是等到第一次调用才报错
_PLACEHOLDER = "sk-your-deepseek-api-key-here"
_api_key = os.getenv("DEEPSEEK_API_KEY", "")
if not _api_key or _api_key == _PLACEHOLDER:
    raise ValueError(
        "DEEPSEEK_API_KEY 未配置或仍为占位符，请在 backend/.env 中填入真实 API Key"
    )

SYSTEM_PROMPT = """..."""  # 见下方系统提示词

client = OpenAI(
    api_key=_api_key,
    base_url="https://api.deepseek.com/v1",
    timeout=30.0,
)

def generate_explanation(topic: str) -> ExplainResponse:
    # 优化 4：记录调用入参
    logger.info("调用 DeepSeek 解释 topic: %s", topic)
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",        # 优化 3：明确指定模型
            temperature=0.7,              # 优化 3：明确指定温度
            max_tokens=400,               # 优化 3：明确指定最大 token
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": topic},
            ],
        )
        tokens = response.usage.total_tokens
        content = response.choices[0].message.content
        logger.info("DeepSeek 调用成功，topic: %s，消耗 tokens: %d", topic, tokens)
        return ExplainResponse(
            success=True,
            data=ExplainData(content=content),
            usage=UsageInfo(tokens=tokens),
        )
    except Exception as e:
        # 优化 4：ERROR 级别记录失败信息
        logger.error("DeepSeek 调用失败，topic: %s，错误: %s", topic, str(e))
        raise
```

**系统提示词（完整版）**：

```
你是一名科技科普老师，专门用生活类比帮人理解技术概念。

每次解释请严格按照以下四段结构：

1. 【类比】用一句话给出核心类比，格式："[概念] 就像 [生活场景]"
2. 【展开】用这个类比解释技术的工作原理（3-5 句话，讲清楚类比中各角色对应什么）
3. 【差异】指出类比不准确的地方，以"不过，和[生活场景]不同的是……"开头
4. 【一句话总结】用一句直白的话说清楚这个技术的实际意义

风格要求：
- 全程中文，语气像朋友聊天，不像教科书
- 不堆砌专业术语，遇到术语必须先解释
- 总字数控制在 150-250 字
- 禁止使用 Markdown 标题、bullet point、加粗等格式，输出纯文字
```

**类比风格参考**（体现期望的行文风格）：
- 前后端通信 → 餐厅点餐（前端=顾客，后端=厨房，API=服务员）
- CPU vs GPU → 一个全能博士 vs 一群流水线工人

---

### `backend/app/models/schemas.py` — 追加新模型

在文件末尾追加，不修改已有的 `CodeExecutionRequest` / `CodeExecutionResponse`：

```python
class ExplainRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=200, description="要解释的技术概念")

class ExplainData(BaseModel):
    content: str

class UsageInfo(BaseModel):
    tokens: int

class ExplainResponse(BaseModel):
    success: bool
    data: ExplainData
    usage: UsageInfo
```

---

### `backend/app/api/routes.py` — 追加新端点

在现有 `/api/run-code` 之后追加：

```python
@router.post("/api/ai/explain", response_model=ExplainResponse)
async def explain_concept(request: ExplainRequest) -> ExplainResponse:
    """
    AI 类比讲解端点
    接收技术概念名称，返回 DeepSeek 生成的生活类比讲解
    """
    try:
        result = generate_explanation(request.topic)
        return result
    except Exception as e:
        return ExplainResponse(
            success=False,
            data=ExplainData(content=f"AI 服务暂时不可用：{str(e)}"),
            usage=UsageInfo(tokens=0)
        )
```

**响应格式**：

```json
{
  "success": true,
  "data": { "content": "前后端通信就像餐厅点餐……" },
  "usage": { "tokens": 187 }
}
```

**优化 5：健康检查端点**，同文件追加：

```python
@router.get("/api/ai/health")
async def ai_health_check():
    """
    DeepSeek 连通性检查
    用固定 topic 发起真实 API 调用，验证密钥和网络是否正常
    """
    try:
        result = generate_explanation("HTTP 请求")
        return {
            "status": "ok",
            "deepseek_reachable": True,
            "tokens_used": result.usage.tokens,
        }
    except Exception as e:
        return {
            "status": "error",
            "deepseek_reachable": False,
            "error": str(e),
        }
```

> 调用方式：`GET http://localhost:8000/api/ai/health`，返回 `"status": "ok"` 即表示 DeepSeek 链路正常。

---

## 三、前端逐文件计划

### `frontend/src/types/index.ts` — 追加新类型

```typescript
export interface ExplainRequest {
  topic: string;
}

export interface ExplainResponse {
  success: boolean;
  data: { content: string };
  usage: { tokens: number };
}
```

---

### `frontend/src/services/api.ts` — 追加新方法

在 `ApiService` 类中追加（`executeCode` 保持不变）：

```typescript
async explainConcept(topic: string): Promise<ExplainResponse> {
  const response = await fetch(`${this.baseURL}/api/ai/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`);
  }

  return await response.json() as ExplainResponse;
}
```

---

### `frontend/src/components/pages/KnowledgeHub.tsx` — UI 交互

**新增状态结构**（每张卡片独立，互不干扰）：

```typescript
const [aiStates, setAiStates] = useState<Record<string, {
  loading: boolean;
  content: string | null;
  error: string | null;
}>>({});
```

**交互流程**：

```
用户点击"✨ AI 重新讲解"
         ↓
该卡片显示：[旋转图标] 生成中...（按钮禁用）
         ↓
    调用 api.explainConcept(card.title)
         ↓
   ┌─────────────────┐
成功 │                 │ 失败
   ↓                 ↓
显示 AI 内容         显示"AI 暂时开小差了，请稍后重试"
按钮变为              按钮恢复可点击
"↺ 重新生成"
```

**卡片底部新增的 UI 区域**：

```
┌──────────────────────────────────────┐
│  [现有卡片内容]                        │
│                                      │
│  ─────────────── 分割线 ───────────── │
│  ✨ AI 类比讲解                        │
│  [AI 生成的文字内容]                   │
│                                      │
│        [✨ AI 重新讲解] 按钮           │  ← 默认状态
│        [⟳ 生成中...]   按钮（禁用）    │  ← loading 状态
│        [↺ 重新生成]    按钮            │  ← 已有内容后
└──────────────────────────────────────┘
```

---

## 四、关键决策说明

**1. 为什么错误时返回 200 而不是抛 500？**
后端路由捕获所有异常后统一返回 `success: false` 的 200 响应，前端只需判断 `success` 字段，避免 HTTP 状态码和业务错误混在一起处理。

**2. 为什么用 `Record<cardId, state>` 而不是单个状态？**
用户可能展开多张卡片并依次点击 AI 讲解，用 Map 结构让每张卡片独立持有 loading / content / error 状态，互不影响。

**3. `topic` 传什么值？**
传卡片的 `title`（如"秒懂前后端通信"），不传 `content`，让 AI 自由发挥类比，而不是改写现有内容。

**4. Timeout 设置多少？**
后端 `openai` client 设 30 秒 timeout，前端 `fetch` 不设额外超时（依赖后端超时）。若 30 秒后 DeepSeek 无响应，后端捕获异常并返回 `success: false`。

---

## 五、实施顺序

```
Step 1  →  requirements.txt（加依赖）
Step 2  →  .gitignore 检查（优化 1：确认 .env 已被排除）
Step 3  →  .env + .env.example（密钥配置，优化 2 依赖此步）
Step 4  →  schemas.py（加新 Pydantic 模型）
Step 5  →  ai_service.py（核心：API Key 校验 + 日志 + 模型参数，含优化 2/3/4）
Step 6  →  routes.py（加 /api/ai/explain 端点 + /api/ai/health 健康检查，含优化 5）
Step 7  →  types/index.ts（加前端类型）
Step 8  →  api.ts（加 explainConcept 方法）
Step 9  →  KnowledgeHub.tsx（UI 改动，最后做）
```

每步完成后暂停，等待确认后再继续下一步。

---

## 六、优化清单（Review 后追加，2026-05-26）

| # | 优化点 | 影响文件 | 说明 |
|---|--------|----------|------|
| 1 | `.gitignore` 前置检查 | `.gitignore` | 创建 `.env` 前先确认排除规则存在 |
| 2 | API Key 启动校验 | `ai_service.py` | 未配置或仍为占位符时立即抛 `ValueError` |
| 3 | 模型参数明确化 | `ai_service.py` | `model="deepseek-chat"`, `temperature=0.7`, `max_tokens=400` |
| 4 | 调用日志 | `ai_service.py` | `INFO` 记录 topic + token 消耗，`ERROR` 记录失败信息 |
| 5 | 健康检查端点 | `routes.py` | `GET /api/ai/health` 验证 DeepSeek 连通性 |
