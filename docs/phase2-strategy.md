# SGMastery 阶段 2 战略文档：代码扫雷 × AI 判分

> 状态：草案 v1
> 日期：2026-05-26
> 范围：代码扫雷模块接入 DeepSeek，实现"题目 → 答题 → AI 判分 → 渐进式反馈"闭环

---

## 1. 目标

让代码扫雷模块从"静态题目展示"升级为"AI 真实判分 + 渐进式学习反馈"，帮助宋庚在 Python/pandas 找 bug 的能力上拿到真实训练。

**非目标**（阶段 2 不做）：
- ❌ AI 自动生成题目（放阶段 3）
- ❌ 答题历史记录、错题本（放阶段 3）
- ❌ 难度分级、闯关进度（放阶段 3）
- ❌ 用户系统、登录（暂不需要，单机自用）

---

## 2. 三大决策

### 决策 1：题目来源 → **预置 JSON 题库**

阶段 2 先内置 10 道精选题，覆盖典型错误类型：
- 索引越界（`IndexError`）
- 类型转换错误（`str` vs `int`）
- pandas 链式赋值警告（`SettingWithCopyWarning`）
- pandas 缺失值处理（`NaN` 比较陷阱）
- pandas `merge` 键不匹配
- SQL `JOIN` 漏条件导致笛卡尔积
- SQL `GROUP BY` 字段不一致
- Python 可变默认参数陷阱
- 字符串编码问题（HCM 导入数据常见）
- 日期格式解析错误（HCM 入职日期常见）

题目尽量贴 HCM 实施场景（人事数据、组织架构、薪资字段）。

### 决策 2：答题方式 → **点行号 + 文字说明**

UI 流程：
1. 代码以行号形式展示（类似 VSCode）
2. 用户点击代码行高亮选中（支持选多行）
3. 在下方文本框写"为什么这是 bug"
4. 点击提交，调用 AI 判分

### 决策 3：AI 判分返回结构 → **渐进式反馈**

```json
{
  "verdict": "correct | partial | wrong",
  "score": 0-100,
  "feedback": "针对用户回答的具体点评（个性化、贴宋庚的实施顾问视角）",
  "hint": "错了/部分对时给的下一步提示（不直接给答案）",
  "answer": null,
  "real_world_link": "这个 bug 在浪潮 HCM 实施中可能怎么遇到（个性化加成）"
}
```

`answer` 字段默认为 `null`，仅当用户主动点"我放弃，给我答案"时，前端发起独立请求获取。

---

## 3. 技术方案

### 3.1 后端

#### 新增文件
- `backend/app/data/bug_hunt_problems.json`：题库
- `backend/app/services/bug_hunt_service.py`：判分逻辑 + AI 调用
- `backend/app/api/bug_hunt.py`：路由

#### 新增端点
| Method | Path | 用途 |
|---|---|---|
| `GET` | `/api/bug-hunt/problems` | 拉取题目列表（不含 answer） |
| `GET` | `/api/bug-hunt/problems/{id}` | 拉取单题详情（不含 answer） |
| `POST` | `/api/bug-hunt/judge` | AI 判分 |
| `GET` | `/api/bug-hunt/problems/{id}/answer` | 主动求解（用户放弃时） |

#### 判分请求体
```json
{
  "problem_id": "bh_001",
  "selected_lines": [5, 6],
  "user_explanation": "我觉得第 5-6 行有问题，因为 df['age'] 可能是字符串，不能直接比较"
}
```

#### AI 判分 SYSTEM_PROMPT 设计要点
- 复用阶段 1 的"宋庚人设"前缀（实施顾问、浪潮 HCM、弱基础）
- 强制返回 JSON 格式
- 渐进式反馈原则：错了先给提示，不给答案
- `real_world_link` 强制贴 HCM 场景

### 3.2 前端

#### 改造文件
- `frontend/src/pages/BugHunt.tsx`（主页面重构）
- `frontend/src/services/ApiService.ts`（新增 4 个方法）

#### 新增组件
- `frontend/src/components/CodeBlock.tsx`：可选中行号的代码块
- `frontend/src/components/JudgeResult.tsx`：判分结果展示卡

#### 用户流程
```
进入页面
  ↓
拉取题目列表 → 选一道题
  ↓
看代码 → 点行号（高亮）→ 写说明
  ↓
点击「提交答案」→ Loading
  ↓
AI 返回判分 → 展示 verdict + score + feedback
  ↓
  ├─ correct → 鼓励 + real_world_link
  ├─ partial → feedback + hint，允许再答
  └─ wrong   → feedback + hint，允许再答 / 「我放弃」按钮
                                            ↓
                                       获取 answer 详解
```

---

## 4. 实施分步（每步独立 commit）

| 步骤 | 工作量 | 验证标准 |
|---|---|---|
| 1. 写题库 JSON（10 道题） | 中 | 文件存在，结构合法 |
| 2. 后端 `/problems` 列表 + 详情端点 | 小 | curl 能拉到题目 |
| 3. 后端 `bug_hunt_service` + AI 判分 SYSTEM_PROMPT | 中 | 单元测试或 curl 测一道题 |
| 4. 后端 `/judge` 端点 | 小 | curl 提交答案能拿到 JSON |
| 5. 后端 `/answer` 端点 | 小 | curl 能拉到答案 |
| 6. 前端 ApiService 4 个方法 | 小 | 控制台调用通 |
| 7. 前端 `CodeBlock` 组件（可选行号） | 中 | 点行号能高亮 |
| 8. 前端 `BugHunt` 页面重构 | 中 | 完整流程跑通 |
| 9. 前端 `JudgeResult` 展示组件 | 小 | 三种 verdict 显示正常 |
| 10. 联调 + 体验打磨 | 中 | 端到端 OK |

每步完成后：
- `git add . && git commit -m "feat(bug-hunt): xxx"`
- 宋庚验证 → 通过后才进下一步

---

## 5. 风险与对策

| 风险 | 对策 |
|---|---|
| DeepSeek 返回的 JSON 格式不稳定 | SYSTEM_PROMPT 强约束 + 后端兜底解析 + 失败重试 |
| 用户没选行号就提交 | 前端按钮禁用 + 后端校验 |
| AI 判分太严/太松 | 题库里每题写好 `expected_bug_lines` + `bug_essence`，让 AI 有"参考答案"对比 |
| 用户连续点提交浪费 token | 前端按钮 Loading 期间禁用 + 简单防抖 |

---

## 6. 协作约定

- Claude（战略 + Review）→ 出战略文档、Review Claude Code 的实施计划、Review 关键代码
- Claude Code（实施）→ 按战略文档分步落地
- 宋庚 → 每步验证 + git commit
- 重要决策（如"判分 prompt 改大幅"）→ 更新本文档
