# SGMastery 阶段 3 战略文档：HCM 实战

> 状态：草案 v2（2026-05-27 review 后修订）
> 日期：2026-05-27
> 范围：HCM 实战模块——SQL/Python 混合题目 + 混合判分（SQLite 精确 + AI 辅助）

---

## 1. 目标

让宋庚在真实 HCM 数据场景中练习 SQL 和 Python，从"看懂代码"升级为"自己动手写查询/脚本"，直接对应浪潮 HCM 实施中的数据导入、查验、清洗场景。

**非目标**（阶段 3 不做）：
- ❌ 用户系统、登录、历史记录
- ❌ 难度分级、闯关进度
- ❌ Python 沙箱执行（subprocess 不安全，docker 太重）
- ❌ AI 自动生成题目

---

## 2. 四大核心决策

---

### 决策 1：题目语言混合

**结论**：SQL : Python ≈ 60-70% : 30-40%

**理由**：
- 宋庚日常工作以 SQL 查数据为主（验数、对账、排查导入问题），SQL 占比更高符合实际需求
- Python 题覆盖数据清洗场景（pandas 处理员工表、编码转换等），作为补充
- `language` 字段取值 `"sql"` | `"python"`，与阶段 2 题库字段保持一致
- UI 不拆 tab，统一题目列表展示，按 `language` 标签区分即可

---

### 决策 2：判分机制（混合）

**SQL 题**：SQLite 精确判分（确定性 100%）
- 后端用 Python 标准库 `sqlite3` 建内存数据库
- 按题目 `schema` 建表、导入 `sample_data`
- 执行用户提交的 SQL，对比 result set 与 `expected_rows`
- 每道题携带 `result_ordered: bool`：`true` → normalize 后 list 直接比（顺序敏感）；`false` → normalize 后 sorted 再比（只看内容）；normalize 用 frozenset 归一化 key 大小写与 value 类型，消除 dict 列顺序差异
- 安全性：用 `threading.Timer` 实现 3 秒超时，超时后 cancel 连接，不依赖关键字黑名单
- 优先：确定性判分，不消耗 AI token，无幻觉风险

**Python 题**：DeepSeek AI 判分（修复代码形式）
- 题目预填一段有问题的 Python/pandas 代码（显示在 CodeMirror 编辑器中）
- 用户直接在编辑器里修改代码以修复 bug，同时填写说明（解释改了什么以及为什么）
- AI 根据修改后的代码 + 说明 + 题库中的 `bug_essence` 参考判分
- 不做 Python 沙箱执行（subprocess 有命令注入风险，docker 太重；AI 判代码逻辑足够）
- 复用阶段 2 的 DeepSeek 调用模式（三层 JSON 兜底、相同宋庚人设前缀）

**理由**：SQL 结果可精确对比，无需 AI；Python 逻辑灵活，AI 判分更自然。两者混合让判分质量最优、token 消耗最小。

---

### 决策 3：场景数据结构

每道题包含 4 个组成部分：

| 字段 | 类型 | 说明 |
|------|------|------|
| `scenario` | string | 业务场景描述（一段话，贴 HCM 实施场景） |
| `schema` | object[] | 表结构（字段名 + 类型 + 注释），供题目展示和 SQLite 建表 |
| `sample_data` | object[] | 3-5 行样例数据，供题目展示；SQL 题同时作为 SQLite 初始数据 |
| `expected_output` | string | 预期输出的文字描述（SQL 题额外有 `expected_rows` 精确数据）|

**核心约定**：SQL 题的 `sample_data` 即 SQLite 初始化数据——"用户看到的数据 = 后端跑的数据"，消除题目和执行环境的不一致。

额外字段（SQL 题专用）：
- `result_ordered`：bool，结果集是否顺序敏感（如题目要求 ORDER BY 时为 true）
- `expected_rows`：精确结果集（list of dicts），后端对比用
- `setup_sql`：建表 + 插入数据的 SQL 语句，由后端在内存库执行

额外字段（Python 题专用，继承阶段 2）：
- `expected_bug_lines` / `bug_essence`：供 AI 判分参考

---

### 决策 4：代码编辑器

**结论**：CodeMirror 6

**理由**：
- Monaco Editor：VS Code 同款，功能强大，但打包体积 > 2MB，首屏明显变慢，不适合轻量移动端
- 原生 `<textarea>`：无语法高亮、无自动缩进，SQL/Python 体验差
- CodeMirror 6：模块化设计，按需引入 SQL/Python 语言模式，打包后约 150-300KB；官方包 `@codemirror/lang-sql`、`@codemirror/lang-python` 开箱即用；Vite 下无特殊配置，ESM 原生支持

---

## 3. 工程约定（继承阶段 1/2）

以下约定已在前两阶段验证，阶段 3 直接沿用，不重述原因：

- `selectProblem()` 内显式全量 Reset（`selectedLines / code / judgeResult / answer` 全清）
- Pydantic schemas 追加到 `backend/app/models/schemas.py` 末尾，不动已有字段
- TypeScript 接口追加到 `frontend/src/types/index.ts`，字段名与后端严格对应
- AI 失败统一返回 `verdict="error"` + HTTP 200（不抛 500）
- 前端业务组件目录：`frontend/src/components/hcm-practice/`
- 每步完成后独立 commit，宋庚验证后才进下一步
