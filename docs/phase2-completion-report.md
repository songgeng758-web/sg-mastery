# 阶段 2 完成报告：代码扫雷 × AI 判分

> 完成时间：2026-05-26
> 执行者：Claude Code（逐步实施，每步宋庚验证后 commit）

---

## 步骤 10 收尾项检查

| 项目 | 状态 | 依据 |
|------|------|------|
| **① AI JSON 兜底** | ✓ 代码已有 | `bug_hunt_service.py` 三层兜底：第 1 次调用 → 重试 → 正则提取 → `_ERROR_RESPONSE`（`verdict="error"`）；`JudgeResult` 有 `error` 专属灰色卡片 |
| **② 防抖** | ✓ 结构保证 | `handleSubmit` 第一行 `setPhase('judging')`，提交按钮只在 `phase === 'detail'` 时渲染，调用中按钮直接消失，不可能重复提交 |
| **③ 我放弃流程** | ✓ 已验证 | `handleGiveUp` → `setAnswer()` → `JudgeResult` 收到 `answer` prop → 展开底部解答，同时隐藏操作按钮 |
| **④ 未选行保护** | ✓ 双重保护 | 前端：`canSubmit = selectedLines.size > 0 && explanation.length >= 5`；后端：`selected_lines min_length=1`（422） |
| **⑤ 题目切换** | ✓ 代码已有 | `selectProblem()` 内显式 reset：`selectedLines/explanation/judgeResult/answer` 全部清空 |

---

## 全部 Commit 列表（阶段 2）

```
46d9219  feat(bug-hunt): add JudgeResult component with three-verdict display
fcc934b  feat(bug-hunt): add BugHunt page with full answer flow and route
453f6a7  feat(bug-hunt): add CodeBlock component with multi-line selection
a5c7855  feat(bug-hunt): add TypeScript types and 4 ApiService methods
dec6bcf  feat(bug-hunt): add GET /problems/{id}/answer endpoint
b59a7f3  docs: add phase 2 implementation plan
8d2e3a7  feat(phase1): commit AI explain feature (knowledge hub integration)
0149f7b  feat(bug-hunt): add POST /judge endpoint with input validation
fa9ce72  feat(bug-hunt): add bug_hunt_service with DeepSeek judge prompt
0a2b24b  feat(bug-hunt): add GET /problems list and detail endpoints
2c802ff  feat(bug-hunt): add 10-question JSON problem bank with HCM scenarios
bc2830b  docs: add phase 2 strategy for bug-hunt AI integration
```

---

## 后端新增/修改文件

| 文件 | 操作 | 内容 |
|------|------|------|
| `backend/app/data/bug_hunt_problems.json` | 新建 | 10 道 HCM 场景题库，含 answer/expected_bug_lines/bug_essence |
| `backend/app/api/bug_hunt.py` | 新建 | `GET /problems`、`GET /problems/{id}`、`GET /problems/{id}/answer`、`POST /judge` 四个端点 |
| `backend/app/services/bug_hunt_service.py` | 新建 | DeepSeek 判分核心：prompt 构建、三层 JSON 解析兜底 |
| `backend/app/models/schemas.py` | 修改 | 追加 `BugHuntProblemSummary`、`BugHuntProblemDetail`、`JudgeRequest`、`JudgeResponse`、`AnswerResponse` |
| `backend/requirements.txt` | 修改 | 新增 `openai>=1.0.0`、`python-dotenv>=1.0.0` |
| `backend/app/services/ai_service.py` | 新建（阶段 1 补归档）| DeepSeek 客户端单例 + `generate_explanation` |
| `backend/app/api/routes.py` | 修改（阶段 1 补归档）| `POST /api/ai/explain`、`GET /api/ai/health` |

---

## 前端新增/修改文件

| 文件 | 操作 | 内容 |
|------|------|------|
| `frontend/src/types/index.ts` | 修改 | 追加 5 个 bug-hunt 接口 + 阶段 1 的 ExplainRequest/Response |
| `frontend/src/services/api.ts` | 修改 | 追加 `getBugHuntProblems`、`getBugHuntProblem`、`judgeAnswer`、`getBugHuntAnswer` 四个方法 |
| `frontend/src/components/common/CodeBlock.tsx` | 新建 | 可选行只读代码块，蓝色高亮 + 行号 |
| `frontend/src/components/pages/BugHunt.tsx` | 新建 | 主页面：列表 → 答题 → 判分 → 重试/放弃 完整状态机 |
| `frontend/src/components/bug-hunt/JudgeResult.tsx` | 新建 | 判分结果卡片：correct/partial/wrong/error 四态，进度条 + hint + real_world_link |
| `frontend/src/App.tsx` | 修改 | 新增 `/bug-hunt` 路由，移除旧 `/debug` 引用 |
| `frontend/src/components/layout/NavigationBar.tsx` | 修改 | "代码扫雷"导航路径改为 `/bug-hunt` |
| `frontend/src/components/pages/KnowledgeHub.tsx` | 修改（阶段 1 补归档）| AI 类比讲解按钮 |

---

## 阶段 2 核心能力

1. 进入「代码扫雷」，看到 10 道 HCM 场景题目列表
2. 选题查看代码背景 + 只读代码块
3. 点击行号多选有问题的行，填写分析说明
4. 提交后 DeepSeek AI 实时判分，返回 verdict/score/feedback
5. wrong/partial → 看渐进式 hint，选择「再试一次」或「我放弃」
6. 「我放弃」拉取完整解答，展示在判分卡片底部
7. correct → 看个性化 HCM 实战联系说明

---

## 已知遗留事项

| 事项 | 说明 |
|------|------|
| `/debug` 路由 | 旧 CodeDebug 页面路由保留但导航栏已不指向它，属于阶段 1 历史遗产，后续可清理 |
| DeepSeek 响应格式强制 | 已用 `response_format={"type":"json_object"}`，实际触发纯文本兜底的概率极低 |
| 题目无难度分级 | 10 道题平铺显示，后续可按 tags 或难度分组 |
