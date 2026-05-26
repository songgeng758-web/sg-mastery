# 阶段 2 实施计划：代码扫雷 × AI 判分

> 基于 `docs/phase2-strategy.md` v1 草案
> 生成时间：2026-05-26
> 执行者：Claude Code（逐步实施，每步宋庚验证后 commit）

---

## 前置检查：依赖现状

### 后端（Python）

`backend/requirements.txt` 当前已有：

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pytest==7.4.3
httpx==0.25.2
openai>=1.0.0       ← DeepSeek 兼容接口，已有
python-dotenv>=1.0.0
```

**结论：后端无需新增依赖。** DeepSeek SDK（openai 包）已就绪。

### 前端（Node / React）

`frontend/package.json` 当前已有：React 19、React Router 7、Tailwind 4、lucide-react、TypeScript 6。

**结论：前端无需新增 npm 包。**

代码行高亮用纯 Tailwind 实现（每行渲染为 `<div>`，点击切换背景色），不依赖外部语法高亮库。这意味着代码块**无关键词着色**，只有行选中高亮——详见下方"需补决策"第 3 条。

---

## 实施步骤（10 步，每步独立 commit）

---

### 步骤 1：写题库 JSON（10 道题）

**新建/修改文件：**

| 路径 | 操作 | 说明 |
|---|---|---|
| `backend/app/data/bug_hunt_problems.json` | **新建** | 10 道题全部数据，含 answer 字段（对外 API 屏蔽） |

**每道题的 JSON 结构：**

```
id（bh_001~bh_010）
title（题目标题）
description（场景背景，贴 HCM 实施）
code（题目代码，带 \n 换行）
language（"python" 或 "sql"）
tags（如 ["pandas", "NaN"]）
expected_bug_lines（正确答案行号列表，如 [5, 6]）
bug_essence（给 AI 判分用的"参考答案要点"，一两句话描述 bug 本质）
answer（用户主动求答时显示的详细解答）
```

题目涵盖策略文档 §2 决策 1 的 10 个错误类型，代码场景全部贴近 HCM 数据处理（员工表、薪资字段、入职日期、组织架构导入等）。

**验证方式：**

```powershell
python -c "import json; data=json.load(open('backend/app/data/bug_hunt_problems.json')); print(len(data['problems']), '道题 OK')"
```

**预计 commit message：**

```
feat(bug-hunt): add 10-question JSON problem bank with HCM scenarios
```

---

### 步骤 2：后端 `/problems` 列表 + 详情端点

**新建/修改文件：**

| 路径 | 操作 | 说明 |
|---|---|---|
| `backend/app/models/schemas.py` | **修改** | 添加 `BugHuntProblemSummary`、`BugHuntProblemDetail` 两个 Pydantic 模型，均不含 `answer` 字段 |
| `backend/app/api/bug_hunt.py` | **新建** | 定义 `bug_hunt_router`，实现 `GET /api/bug-hunt/problems` 和 `GET /api/bug-hunt/problems/{id}` |
| `backend/app/main.py` | **修改** | `app.include_router(bug_hunt_router)` 注册新路由 |

**每个文件做什么：**

- `schemas.py`：`BugHuntProblemSummary` 只含 id/title/tags/language（供列表页显示）；`BugHuntProblemDetail` 包含 id/title/description/code/language/tags（供答题页显示），两者均不暴露 `answer`、`expected_bug_lines`、`bug_essence`。
- `bug_hunt.py`：启动时从 JSON 加载题库到内存；列表端点返回 `BugHuntProblemSummary` 列表；详情端点按 id 查找，找不到返回 404。
- `main.py`：在现有 `include_router(router)` 下方追加一行 `app.include_router(bug_hunt_router, prefix="")`。

**验证方式：**

```bash
# 启动后端：cd backend && uvicorn app.main:app --reload
curl http://localhost:8000/api/bug-hunt/problems
curl http://localhost:8000/api/bug-hunt/problems/bh_001
curl http://localhost:8000/api/bug-hunt/problems/bh_999  # 应返回 404
```

**预计 commit message：**

```
feat(bug-hunt): add GET /problems list and detail endpoints
```

---

### 步骤 3：后端 `bug_hunt_service` + AI 判分 SYSTEM_PROMPT

**新建/修改文件：**

| 路径 | 操作 | 说明 |
|---|---|---|
| `backend/app/services/bug_hunt_service.py` | **新建** | 判分核心逻辑：构建 prompt、调用 DeepSeek、解析返回 JSON |

**这个文件做什么：**

- 从 `ai_service.py` import 现有的 `client` 单例（`from app.services.ai_service import client`，不重复初始化 DeepSeek 客户端，不修改 `ai_service.py`）。
- 定义 `BUG_HUNT_SYSTEM_PROMPT`：在本文件中**复制一份人设文字**（不从 `ai_service.py` import），在人设后追加判分专用指令（强制返回指定 JSON 格式、渐进式反馈原则、`real_world_link` 必须贴 HCM 场景、`answer` 字段固定为 `null`）。
- 定义 `judge_answer(problem_id, selected_lines, user_explanation)` 函数：从题库取 `expected_bug_lines` 和 `bug_essence` 拼入 user message，调用 DeepSeek，用 `response_format={"type": "json_object"}` 强制 JSON 输出（DeepSeek 支持此参数），解析为字典并返回。
- 兜底处理（三层）：第 1 次解析失败 → 用**同样 prompt 重试 1 次** → 还失败 → 正则提取响应文本中第一个 `{...}` 块再解析 → 还失败 → 返回 `verdict="error"` 的固定响应而非 500。

**验证方式：**

在后端目录下启动 Python REPL：
```powershell
cd backend
python -c "
from app.services.bug_hunt_service import judge_answer
r = judge_answer('bh_001', [5, 6], '我觉得第5行把字符串直接和数字比较了')
print(r)
"
```
应看到包含 `verdict`、`score`、`feedback`、`hint`、`real_world_link` 的字典。

**预计 commit message：**

```
feat(bug-hunt): add bug_hunt_service with DeepSeek judge prompt
```

---

### 步骤 4：后端 `/judge` 端点

**新建/修改文件：**

| 路径 | 操作 | 说明 |
|---|---|---|
| `backend/app/models/schemas.py` | **修改** | 添加 `JudgeRequest`、`JudgeResponse` Pydantic 模型 |
| `backend/app/api/bug_hunt.py` | **修改** | 添加 `POST /api/bug-hunt/judge` 路由处理器 |

**每个文件做什么：**

- `schemas.py`：`JudgeRequest` 包含 `problem_id: str`、`selected_lines: list[int]`（至少 1 个，否则 Pydantic 校验失败）、`user_explanation: str`（最小长度 5）；`JudgeResponse` 对应 AI 返回的六字段结构（`verdict` 用 `Literal["correct","partial","wrong","error"]`、`score: int`、`feedback`、`hint`、`answer=None`、`real_world_link`）。
- `bug_hunt.py`：调用 `bug_hunt_service.judge_answer`，problem_id 不存在时返回 404，AI 调用异常时返回 503 而非 500。

**验证方式：**

```bash
curl -X POST http://localhost:8000/api/bug-hunt/judge \
  -H "Content-Type: application/json" \
  -d '{"problem_id":"bh_001","selected_lines":[5,6],"user_explanation":"df里的age列是字符串，直接和整数比较会出问题"}'
# 应看到 verdict/score/feedback/hint/real_world_link 五字段

curl -X POST http://localhost:8000/api/bug-hunt/judge \
  -H "Content-Type: application/json" \
  -d '{"problem_id":"bh_001","selected_lines":[],"user_explanation":"有问题"}'
# 应看到 422 校验错误
```

**预计 commit message：**

```
feat(bug-hunt): add POST /judge endpoint with input validation
```

---

### 步骤 5：后端 `/answer` 端点

**新建/修改文件：**

| 路径 | 操作 | 说明 |
|---|---|---|
| `backend/app/api/bug_hunt.py` | **修改** | 添加 `GET /api/bug-hunt/problems/{id}/answer` |

**这个文件做什么：**

从题库 JSON 取 `answer` 字段（一段详细解答字符串）直接返回，无需调用 AI。返回结构：`{"problem_id": "bh_001", "answer": "...详细解答..."}`。

**验证方式：**

```bash
curl http://localhost:8000/api/bug-hunt/problems/bh_001/answer
# 应看到详细答案文字
```

**预计 commit message：**

```
feat(bug-hunt): add GET /problems/{id}/answer reveal endpoint
```

---

### 步骤 6：前端 ApiService 4 个新方法 + 类型定义

**新建/修改文件：**

| 路径 | 操作 | 说明 |
|---|---|---|
| `frontend/src/types/index.ts` | **修改** | 追加 bug-hunt 相关 TypeScript 接口 |
| `frontend/src/services/api.ts` | **修改** | 在 `ApiService` 类中追加 4 个方法 |

**每个文件做什么：**

- `types/index.ts`：新增 `BugHuntProblemSummary`、`BugHuntProblemDetail`、`JudgeRequest`、`JudgeResponse`、`AnswerResponse` 五个接口，与后端 schemas 字段严格对应。
- `api.ts`：追加 `getBugHuntProblems(): Promise<BugHuntProblemSummary[]>`、`getBugHuntProblem(id: string): Promise<BugHuntProblemDetail>`、`judgeAnswer(req: JudgeRequest): Promise<JudgeResponse>`、`getBugHuntAnswer(id: string): Promise<AnswerResponse>` 四个 `async` 方法，统一走 `this.baseURL`，HTTP 非 2xx 时 `throw new Error`。

**验证方式：**

浏览器 DevTools 控制台（后端运行中）：
```javascript
// 在 /knowledge 页面控制台临时测试
const { apiService } = await import('/src/services/api.ts')
const problems = await apiService.getBugHuntProblems()
console.log(problems.length, problems[0].title)
```

**预计 commit message：**

```
feat(bug-hunt): add TypeScript types and 4 ApiService methods
```

---

### 步骤 7：前端 `CodeBlock` 组件（可选行号）

**新建/修改文件：**

| 路径 | 操作 | 说明 |
|---|---|---|
| `frontend/src/components/common/CodeBlock.tsx` | **新建** | 可交互的只读代码块，支持点击选行 |

**这个文件做什么：**

接收 `code: string`、`selectedLines: Set<number>`、`onLineClick: (line: number) => void` 三个 props。将 code 按 `\n` 拆成行数组，逐行渲染 `<div>`，左侧固定宽度显示行号，行号和代码行同行；被选中的行（`selectedLines.has(i)`）背景高亮为蓝色半透明；点击任意行触发 `onLineClick(lineNumber)`（行号从 1 起）；整个组件用等宽字体、深色背景，与现有 `CodeEditor` 视觉风格保持一致。

**验证方式：**

在 `/debug` 页面临时挂载组件，或启动前端后在浏览器直接访问包含该组件的页面：
- 点击第 3 行 → 第 3 行背景变蓝，再点击取消高亮
- 点击第 5、6 行 → 两行同时高亮
- 验证行号从 1 开始连续显示

**预计 commit message：**

```
feat(bug-hunt): add CodeBlock component with multi-line selection
```

---

### 步骤 8：前端 `BugHunt` 页面 + 路由注册

**新建/修改文件：**

| 路径 | 操作 | 说明 |
|---|---|---|
| `frontend/src/components/pages/BugHunt.tsx` | **新建** | 代码扫雷主页面，管理完整答题状态机 |
| `frontend/src/App.tsx` | **修改** | 新增 `/bug-hunt` 路由指向 `BugHunt` 组件 |
| `frontend/src/components/layout/NavigationBar.tsx` | **修改** | 导航栏"代码扫雷"条目的 `href` 改为 `/bug-hunt` |

**每个文件做什么：**

- `BugHunt.tsx`：进入页面后调用 `getBugHuntProblems()` 展示题目列表；选题后调用 `getBugHuntProblem(id)` 拉取详情并显示 `CodeBlock`；用户选行 + 填写说明后"提交答案"按钮变为可用；提交期间按钮 Loading 禁用（防重复提交）；调用 `judgeAnswer()` 后将结果传给 `JudgeResult` 组件；wrong/partial 时显示"再试一次"（清空已选行和说明）和"我放弃"按钮；"我放弃"点击后调用 `getBugHuntAnswer(id)` 展示完整解答。
- `App.tsx`：在 `<Routes>` 中追加 `<Route path="/bug-hunt" element={<BugHunt />} />`；原 `/debug` 路由**保留不动**（详见"需补决策"第 1 条）。
- `NavigationBar.tsx`：修改"代码扫雷"导航项的 `to` 属性为 `/bug-hunt`。

**验证方式：**

浏览器访问 `http://localhost:5173/bug-hunt`：
1. 看到题目列表
2. 点击一道题，看到代码和输入区域
3. 点击若干行高亮，填写说明，"提交答案"按钮激活
4. 点击提交，看到 Loading 状态，随后显示判分结果

**预计 commit message：**

```
feat(bug-hunt): add BugHunt page with full answer flow and route
```

---

### 步骤 9：前端 `JudgeResult` 组件

**新建/修改文件：**

| 路径 | 操作 | 说明 |
|---|---|---|
| `frontend/src/components/bug-hunt/JudgeResult.tsx` | **新建** | 判分结果展示卡，三种 verdict 不同样式 |

**这个文件做什么：**

接收 `result: JudgeResponse`、`onRetry: () => void`、`onGiveUp: () => void`、`answer?: string` 四个 props，根据 `verdict` 渲染不同颜色卡片（correct=绿、partial=黄、wrong=红），显示 `score`（数字+进度条）、`feedback`（个性化点评）；correct 时额外展示 `real_world_link` 模块；partial/wrong 时显示 `hint` + "再试一次"/"我放弃"两个按钮；`answer` 有值时在卡片底部展示完整解答区域。

**验证方式：**

在步骤 8 的 BugHunt 页面进行实际答题，分别触发三种 verdict：
- 填写完全正确答案 → 绿色卡片 + real_world_link
- 填写部分正确 → 黄色卡片 + hint + 两个按钮
- 填写明显错误 → 红色卡片 + hint + 两个按钮
- 点击"我放弃" → 解答区域展开

**预计 commit message：**

```
feat(bug-hunt): add JudgeResult component with three-verdict display
```

---

### 步骤 10：联调 + 体验打磨

**可能修改文件：** 上述任意文件，以及 `backend/app/api/bug_hunt.py`（CORS/错误处理），具体取决于联调发现的问题。

**这一步做什么：**

端到端跑通全部 10 道题的答题流程，重点检查：

1. **AI JSON 兜底**：DeepSeek 偶发返回非纯 JSON 时（带前缀说明文字），后端兜底解析生效，前端不崩溃。
2. **防抖**：提交按钮在 Loading 期间确实不可再点。
3. **"我放弃"流程**：从 wrong 状态 → 点放弃 → 拿到 answer → 显示解答，无报错。
4. **未选行保护**：未点击任何行时"提交答案"按钮为 `disabled` 状态（前端 + 后端双重校验）。
5. **题目切换**：从一道题切换到另一道题时，已选行和判分结果正确清空。

**验证方式：**

完整走通以下场景：
- 选 `bh_001`，正确作答 → 绿色结果
- 选 `bh_003`（pandas 题），错误作答 → 红色 + hint → 点放弃 → 看答案
- 选 `bh_007`（SQL 题），部分正确 → 黄色 → 再试一次 → 补充后再提交

**预计 commit message：**

```
feat(bug-hunt): end-to-end polish and edge case handling
```

---

## 需要宋庚补决策的点

以下几点战略文档没有说清楚，实施前需要你来拍板：

---

**决策 A：`/debug` 路由怎么处理？**

现有 `/debug` 路由指向旧的 `CodeDebug.tsx`（"运行代码"模式，和阶段 2 的"选行判分"完全不同）。有两个选项：

- 方案 1：新增 `/bug-hunt` 路由，导航栏"代码扫雷"改指向 `/bug-hunt`，旧 `CodeDebug.tsx` 和 `/debug` 路由**保留**（不影响，只是不再入口可达）。
- 方案 2：直接把 `/debug` 路由替换为新的 `BugHunt.tsx`，`CodeDebug.tsx` 删除或归档。

**建议：方案 1**（阶段 2 新建，不动旧代码，风险小）。

---

**决策 B：代码块要不要语法高亮（关键词着色）？**

前端目前没有语法高亮库。纯 Tailwind 实现的 `CodeBlock` 显示的是**纯白等宽文字 + 行选中背景色**，没有关键词颜色（Python 保留字、字符串、注释不会染色）。

- 方案 1：接受无语法着色，聚焦行选中交互，实现简单。
- 方案 2：加入 `react-syntax-highlighter`（约 1.5MB，树摇后更小），有 VSCode 主题风格。

**建议：方案 1** 先跑通流程，颜色可阶段 3 再加。如果你觉得纯白代码影响可读性，说一声，步骤 7 时顺手装库。

---

**决策 C：题目内容由谁来写？**

步骤 1 需要 10 道有具体代码的题目（每题 5-20 行、有真实 bug、贴 HCM 场景）。有两个选项：

- 方案 1：**Claude Code 直接按策略文档的 10 个错误类型编写**，代码场景由我自由发挥（会尽量贴 HCM 数据处理）。
- 方案 2：你（宋庚）先提供草稿或真实工作中遇到过的 bug 代码，我来整理成题目 JSON。

**建议：方案 1** 效率更高。你在步骤 1 验证时看一遍，如果哪道题场景不真实或难度不合适告诉我，当场改。

---

**决策 D：`answer` 字段的格式**

`/answer` 端点返回的是什么粒度的答案？

- 方案 1：**一段白话文解答**（"第 5 行的问题是… 正确写法是…"），存在 JSON 里作为字符串，直接显示。
- 方案 2：结构化对象（`correct_lines: [5]` + `explanation: "..."` + `fixed_code: "..."`），前端分区块渲染。

**建议：方案 1** 对维护题库更友好，前端也不需要额外处理。如果你想要"修复后代码"单独展示，说一声改结构。

---

**决策 E：`bug_hunt_service.py` 是否复用 `ai_service.py` 的 DeepSeek 客户端？**

**✅ 已确认（方案 2 精简版）**：`bug_hunt_service.py` 通过 `from app.services.ai_service import client` 复用 OpenAI client 单例（不重复初始化），但人设文字**在 `bug_hunt_service.py` 中复制一份**，不修改 `ai_service.py`。

---

**决策 F：AI 判分"强制 JSON"方式**

**✅ 已确认（三层兜底 + 重试）**：

1. 开启 `response_format={"type": "json_object"}`
2. 第 1 次解析失败 → 用**同样 prompt 重试 1 次**
3. 还失败 → 正则提取响应文本中第一个 `{...}` 块再解析
4. 还失败 → 返回固定 `{"verdict": "error", "score": 0, "feedback": "AI 判分暂时不可用，请重试", ...}`，不报 500

---

## 文件路径说明（与策略文档的差异）

策略文档 §3.2 写的是 `frontend/src/pages/BugHunt.tsx` 和 `frontend/src/services/ApiService.ts`，但项目实际约定不同：

| 策略文档写的路径 | 实际使用路径 | 原因 |
|---|---|---|
| `frontend/src/pages/BugHunt.tsx` | `frontend/src/components/pages/BugHunt.tsx` | 项目所有页面都在 `components/pages/` 下 |
| `frontend/src/services/ApiService.ts` | `frontend/src/services/api.ts` | 现有文件名，保持一致 |
| `frontend/src/components/CodeBlock.tsx` | `frontend/src/components/common/CodeBlock.tsx` | 通用组件统一放 `common/` |
| `frontend/src/components/JudgeResult.tsx` | `frontend/src/components/bug-hunt/JudgeResult.tsx` | 业务组件按功能模块分目录（需新建 `bug-hunt/` 子目录） |

以上路径调整均已体现在上方各步骤中，无需你额外操作。
