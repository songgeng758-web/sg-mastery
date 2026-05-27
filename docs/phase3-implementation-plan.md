# 阶段 3 实施计划：HCM 实战

> 基于 `docs/phase3-strategy.md` v2
> 生成时间：2026-05-27（v3，含 review 修订）
> 执行者：Claude Code（逐步实施，每步宋庚验证后 commit）

---

## 前置检查：依赖现状

### 后端

`sqlite3` 和 `threading` 均为 Python 标准库，**无需新增 pip 包**。

### 前端（需新增 5 个 npm 包）

```
@codemirror/view        ^6
@codemirror/state       ^6
@codemirror/lang-sql    ^6
@codemirror/lang-python ^6
@codemirror/theme-one-dark ^6
```

---

## 实施步骤（10 步 + 1 个补充步骤）

---

### Step 1：先写 3 道题目 JSON（2 SQL + 1 Python）

**新建文件：**

| 路径 | 操作 |
|------|------|
| `backend/app/data/hcm_practice_problems.json` | 新建 |

**先写 3 道，覆盖各字段组合：**

- `hp_001`：SQL，日期过滤 + ORDER BY，`result_ordered: true`
- `hp_002`：SQL，GROUP BY 聚合，`result_ordered: false`
- `hp_003`：Python，pandas NaN 检测 + 链式赋值修复

**JSON 字段说明：**

```
id           (hp_001~hp_010)
title
language     ("sql" | "python")
tags
scenario     业务场景描述
schema       [{column, type, comment}]   供前端展示表结构
sample_data  [{...}]                     供前端展示；SQL 题同时是 SQLite 初始数据
expected_output  文字描述（面向用户）
result_ordered   bool | null            SQL 题专用
expected_rows    list[dict] | null      SQL 题专用，后端对比用
setup_sql        string | null          SQL 题专用，建表+插数据
code             string | null          Python 题专用，预填入编辑器的待修复代码
expected_bug_lines  list[int] | null    Python 题专用，供 AI 判分参考
bug_essence      string | null          Python 题专用，供 AI 判分参考
answer           string                 用户放弃时展示的完整解答
```

**验证方式：**

```powershell
cd backend
python -c "import json; d=json.load(open('app/data/hcm_practice_problems.json', encoding='utf-8')); print(len(d['problems']), '道题'); [print(p['id'], p['language']) for p in d['problems']]"
```

**预计 commit message：**

```
feat(hcm-practice): add initial 3-question JSON problem bank (2 SQL + 1 Python)
```

---

### Step 2：后端题库端点（列表 + 详情）

**新建/修改文件：**

| 路径 | 操作 | 说明 |
|------|------|------|
| `backend/app/api/hcm_practice.py` | 新建 | `GET /api/hcm-practice/problems`、`GET /api/hcm-practice/problems/{id}` |
| `backend/app/models/schemas.py` | 追加 | `HcmProblemSummary`、`HcmProblemDetail` |
| `backend/app/main.py` | 追加 | `include_router(hcm_practice_router)` |

`HcmProblemSummary`：id / title / language / tags（供列表页）  
`HcmProblemDetail`：id / title / language / tags / scenario / schema / sample_data / expected_output / code（均**不含** answer / expected_rows / setup_sql / bug_essence）

**预计 commit message：**

```
feat(hcm-practice): add GET /problems list and detail endpoints
```

---

### Step 3：后端 SQL 判分服务

**新建文件：**

| 路径 | 操作 |
|------|------|
| `backend/app/services/hcm_sql_service.py` | 新建 |

**核心逻辑：**

```python
def normalize_row(row: dict) -> frozenset:
    return frozenset(
        (k.lower(), str(v) if v is not None else None)
        for k, v in row.items()
    )

def judge_sql(problem_id, user_sql) -> dict:
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    timer = threading.Timer(3.0, conn.interrupt)
    try:
        timer.start()
        conn.executescript(setup_sql)          # 建表 + 插数据
        cursor = conn.execute(user_sql)
        cols = [d[0] for d in cursor.description]
        actual_rows = [dict(zip(cols, row)) for row in cursor.fetchall()]
    except OperationalError as e:
        # 超时或语法错误
        return {"verdict": "wrong", "feedback": str(e), ...}
    finally:
        timer.cancel()
        conn.close()

    expected = problem["expected_rows"]
    if problem["result_ordered"]:
        match = [normalize_row(r) for r in actual_rows] == [normalize_row(r) for r in expected]
    else:
        match = sorted([normalize_row(r) for r in actual_rows], key=str) == \
                sorted([normalize_row(r) for r in expected], key=str)
    ...
```

`judge_sql()` 写成**同步函数**，API 端点通过 `await asyncio.to_thread(judge_sql, ...)` 调用（避免阻塞 FastAPI event loop）。

**预计 commit message：**

```
feat(hcm-practice): add SQLite in-memory SQL judge service with 3s timeout
```

---

### Step 4：后端 Python 判分服务

**新建文件：**

| 路径 | 操作 |
|------|------|
| `backend/app/services/hcm_python_service.py` | 新建 |

**核心逻辑：**

- 复用 `from app.services.ai_service import client`（单例）
- 系统提示词 = 阶段 2 宋庚人设前缀（复制，不 import）+ HCM 实战 Python 判分专用指令
- 三层 JSON 兜底（原样复用 `_try_parse` / `_regex_extract_and_parse` 模式）
- 返回结构：`verdict / score / feedback / hint / real_world_link`

**预计 commit message：**

```
feat(hcm-practice): add AI Python judge service (reusing DeepSeek pattern)
```

---

### Step 5：后端 `/judge` + `/answer` 端点

**修改文件：**

| 路径 | 操作 |
|------|------|
| `backend/app/api/hcm_practice.py` | 追加两个端点 |
| `backend/app/models/schemas.py` | 追加 `HcmJudgeRequest`、`HcmJudgeResponse` |

`HcmJudgeRequest`：

```python
problem_id:       str
language:         Literal["sql", "python"]
user_code:        str          # SQL 题填 SQL 语句，Python 题填修复后的代码
user_explanation: str          # Python 题必填 min_length=5，SQL 题可为空字符串
```

路由分发逻辑：`language == "sql"` → `await asyncio.to_thread(judge_sql, ...)` ；`language == "python"` → `await judge_python(...)`。

**预计 commit message：**

```
feat(hcm-practice): add POST /judge and GET /answer endpoints
```

---

### Step 5.5：端到端跑通 3 道题后补剩余 7 道

**修改文件：**

| 路径 | 操作 |
|------|------|
| `backend/app/data/hcm_practice_problems.json` | 追加 `hp_004`~`hp_010` |

此步在 **Step 9 联调完成、3 道题流程跑通后** 才执行，确保题库 JSON 结构已稳定。  
SQL : Python 比例目标 6~7 : 3~4。

**预计 commit message：**

```
feat(hcm-practice): add remaining 7 questions to complete 10-question bank
```

---

### Step 6：前端类型 + ApiService 方法

**修改文件：**

| 路径 | 操作 |
|------|------|
| `frontend/src/types/index.ts` | 追加 5 个接口 |
| `frontend/src/services/api.ts` | 追加 4 个方法 |

新增类型：`HcmProblemSummary`、`HcmProblemDetail`、`HcmJudgeRequest`、`HcmJudgeResponse`、`HcmAnswerResponse`

新增方法：`getHcmProblems`、`getHcmProblem`、`judgeHcm`、`getHcmAnswer`

**预计 commit message：**

```
feat(hcm-practice): add TypeScript types and 4 ApiService methods
```

---

### Step 7：前端 CodeMirror 编辑器组件

**新建文件：**

| 路径 | 操作 |
|------|------|
| `frontend/src/components/hcm-practice/CodeEditor.tsx` | 新建 |

Props：`value: string`、`onChange: (v: string) => void`、`language: 'sql' | 'python'`、`readOnly?: boolean`

- 用 `useRef` 挂载 `EditorView`，不直接 JSX 渲染
- 切题时通过 `useEffect` + `view.dispatch({changes: {from:0, to:doc.length, insert:''}})` 清空内容
- 按 `language` 动态加载 `sql()` 或 `python()` 扩展，统一 `oneDark` 主题

**预计 commit message：**

```
feat(hcm-practice): add CodeMirror 6 editor component (SQL/Python modes)
```

---

### Step 8a：前端纯展示组件

**新建文件：**

| 路径 | 操作 |
|------|------|
| `frontend/src/components/hcm-practice/ProblemCard.tsx` | 新建 |
| `frontend/src/components/hcm-practice/JudgeResult.tsx` | 新建 |

`ProblemCard.tsx`：展示 scenario 文字 + schema 表格 + sample_data 表格，两表均 `overflow-x-auto` 包裹应对长字段名。

`JudgeResult.tsx`：判分结果卡片，兼容两种结果：
- SQL：correct / wrong，显示实际 vs 期望行数，不含 hint
- Python：correct / partial / wrong，含 score + hint + real_world_link
- error 态灰色卡片（两种题型共用）

**预计 commit message：**

```
feat(hcm-practice): add ProblemCard and JudgeResult display components
```

---

### Step 8b：前端主页面状态机 + 路由

**新建/修改文件：**

| 路径 | 操作 |
|------|------|
| `frontend/src/components/pages/HcmPractice.tsx` | 新建 |
| `frontend/src/App.tsx` | 追加路由 |
| `frontend/src/components/layout/NavigationBar.tsx` | 追加导航入口 |

`HcmPractice.tsx`：`Phase = 'list' | 'detail' | 'judging' | 'result'`，`selectProblem()` 内显式全量 Reset，组合 `ProblemCard` + `CodeEditor` + `JudgeResult`。

**预计 commit message：**

```
feat(hcm-practice): add HcmPractice page with state machine, route and nav entry
```

---

### Step 9：联调 + 体验打磨

重点检查：
1. SQL correct / wrong / 超时三条路径均正常返回
2. `result_ordered=true` 和 `false` 对比逻辑均正确
3. Python AI error 态展示正常
4. CodeMirror 切题时内容归零
5. 移动端 schema / sample_data 表格横向滚动正常

**预计 commit message：**

```
feat(hcm-practice): end-to-end polish and edge case handling
```

---

## 关键技术点（潜在坑）

| # | 坑点 | 说明 |
|---|------|------|
| 1 | **sqlite3 跨线程 + async 隔离** | `sqlite3.connect(":memory:", check_same_thread=False)` 显式允许跨线程（Timer 调 `conn.interrupt()` 需要）；`judge_sql()` 写成同步函数，API 层用 `await asyncio.to_thread(judge_sql, ...)` 调用，避免阻塞 FastAPI event loop |
| 2 | **SQL 结果集对比方式** | 用 `normalize_row(row) -> frozenset` 归一化每行（key 统一小写、value 统一 `str()`、None 保持 None），消除 dict 列顺序差异；`result_ordered=true` → normalize 后 list 直接 `==`；`result_ordered=false` → normalize 后 `sorted(key=str)` 再比 |
| 3 | **SQL 执行超时** | `threading.Timer(3.0, conn.interrupt)` 启动后执行查询，完成后 `timer.cancel()`；超时触发 `OperationalError: interrupted`，捕获后返回 `verdict="wrong"` + "查询超时，检查是否有笛卡尔积" |
| 4 | **CodeMirror 6 在 Vite 下引入** | CM6 全是 ESM，Vite 天然支持；`EditorView` 是命令式 API，必须用 `useRef` 挂载 DOM 节点，不能直接 JSX 渲染 |
| 5 | **CodeMirror 内容重置** | 切题时调用 `view.dispatch({changes: {from:0, to:view.state.doc.length, insert:''}})` 清空，不能只改 React state |
| 6 | **schema 表格宽度** | HCM 字段名如 `monthly_salary` 较长，`ProblemCard` 的两个表格必须 `overflow-x-auto` 包裹 |
