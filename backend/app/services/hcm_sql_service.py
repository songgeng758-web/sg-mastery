"""
HCM 实战 SQL 判分服务

每次请求建一个 SQLite 内存库，执行 setup_sql 初始化数据，
再执行用户提交的 SQL，与预期结果对比。

设计约定：
- judge_sql() 是同步函数，由 API 层用 asyncio.to_thread 调用
- check_same_thread=False 允许 Timer 线程调用 conn.interrupt()
- 所有异常均在本函数内捕获，永远不向外抛出
"""

import json
import logging
import sqlite3
import threading
from pathlib import Path

logger = logging.getLogger(__name__)

# ── 题库（模块加载时读入内存）────────────────────────────────────────────────

_DATA_PATH = Path(__file__).parent.parent / "data" / "hcm_practice_problems.json"

with open(_DATA_PATH, encoding="utf-8") as _f:
    _PROBLEMS: dict[str, dict] = {
        p["id"]: p for p in json.load(_f)["problems"]
    }

# ── 归一化工具 ───────────────────────────────────────────────────────────────

def normalize_row(row: dict) -> frozenset:
    """归一化一行结果：key 统一小写，value 统一 str()，None 保持 None。

    消除以下差异：
    - dict 列顺序（frozenset 无序）
    - 数值类型（sqlite3 返回 int，JSON expected_rows 也是 int，但 str() 统一）
    - key 大小写（SQL 别名大小写不稳定）
    """
    return frozenset(
        (k.lower(), str(v) if v is not None else None)
        for k, v in row.items()
    )

# ── 固定响应模板 ──────────────────────────────────────────────────────────────

_SERVICE_ERROR: dict = {
    "verdict": "error",
    "score": 0,
    "feedback": "SQL 判分服务暂时不可用，请重试",
    "hint": None,
    "real_world_link": None,
}

# ── 核心函数 ──────────────────────────────────────────────────────────────────

def judge_sql(problem_id: str, user_sql: str) -> dict:
    """
    用 SQLite 内存库精确判分用户提交的 SQL。

    Args:
        problem_id: 题目 id，如 "hp_001"
        user_sql:   用户提交的 SQL 语句

    Returns:
        包含 verdict/score/feedback/hint/real_world_link 的 dict。
        verdict 只取 "correct" | "wrong" | "error"，不含 partial。
    """
    problem = _PROBLEMS.get(problem_id)
    if problem is None:
        logger.error("judge_sql: 题目 %s 不存在", problem_id)
        return {**_SERVICE_ERROR, "feedback": f"题目 {problem_id} 不存在"}

    setup_sql      = problem["setup_sql"]
    expected_rows  = problem["expected_rows"]
    result_ordered = problem["result_ordered"]

    # ── 建立内存库（check_same_thread=False 允许 Timer 线程调用 interrupt）──
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    actual_rows: list[dict] = []

    try:
        # 建表 + 插入样例数据（内部操作，不设超时）
        conn.executescript(setup_sql)

        # ── 执行用户 SQL，3 秒超时 ────────────────────────────────────────
        timer = threading.Timer(3.0, conn.interrupt)
        timer.start()
        try:
            cursor = conn.execute(user_sql)

            # description 为 None 表示非 SELECT 语句（INSERT/UPDATE/DELETE 等）
            if cursor.description is None:
                return {
                    "verdict": "wrong",
                    "score": 0,
                    "feedback": "你的 SQL 没有返回结果集。HCM 实战题目需要提交 SELECT 查询语句，不是 INSERT / UPDATE / DELETE。",
                    "hint": "检查是否误写了非查询语句。",
                    "real_world_link": None,
                }

            raw_rows = cursor.fetchall()
            cols     = [d[0] for d in cursor.description]
            actual_rows = [dict(zip(cols, row)) for row in raw_rows]

        except sqlite3.OperationalError as exc:
            msg = str(exc)
            if "interrupted" in msg:
                logger.warning("judge_sql: 查询超时 | problem=%s", problem_id)
                return {
                    "verdict": "wrong",
                    "score": 0,
                    "feedback": "查询超时（超过 3 秒）。SQL 可能产生了笛卡尔积，例如多表 JOIN 时漏写 ON / WHERE 关联条件。",
                    "hint": "检查每个 JOIN 是否都写了 ON 条件，或在 WHERE 里加了表关联限制。",
                    "real_world_link": None,
                }
            logger.warning("judge_sql: SQL 执行出错 | problem=%s | %s", problem_id, msg)
            return {
                "verdict": "wrong",
                "score": 0,
                "feedback": f"SQL 执行出错：{msg}",
                "hint": None,
                "real_world_link": None,
            }
        finally:
            timer.cancel()

    except Exception as exc:
        logger.error("judge_sql: 意外异常 | problem=%s | %s", problem_id, exc)
        return {**_SERVICE_ERROR, "feedback": f"判分服务异常：{exc}"}
    finally:
        conn.close()

    # ── 结果对比 ──────────────────────────────────────────────────────────────
    norm_actual   = [normalize_row(r) for r in actual_rows]
    norm_expected = [normalize_row(r) for r in expected_rows]

    if result_ordered:
        match = norm_actual == norm_expected
    else:
        match = sorted(norm_actual, key=str) == sorted(norm_expected, key=str)

    if match:
        return {
            "verdict": "correct",
            "score": 100,
            "feedback": f"完全正确！查询返回了 {len(actual_rows)} 行，结果与预期完全一致。",
            "hint": None,
            "real_world_link": problem.get("real_world_link"),
        }

    # ── wrong：给出行数差异的具体 feedback ───────────────────────────────────
    actual_count   = len(actual_rows)
    expected_count = len(expected_rows)

    if actual_count == 0:
        feedback = "你的 SQL 没有返回任何行，检查 WHERE 条件是否过于严格，或筛选字段的值是否和数据一致（注意大小写）。"
        hint     = "先去掉所有 WHERE 条件跑一次，看看原始数据长什么样，再逐步加回过滤条件。"
    elif actual_count != expected_count:
        feedback = f"预期 {expected_count} 行，实际返回 {actual_count} 行。{'多了数据，检查是否漏了过滤条件。' if actual_count > expected_count else '少了数据，检查 WHERE 条件是否误排除了某些行。'}"
        hint     = "把你的 SQL 和样例数据对照着看：哪些行应该被包含、哪些不应该。"
    else:
        feedback = f"行数正确（{actual_count} 行），但内容或顺序不对。检查列值计算、别名、或 ORDER BY 是否符合要求。"
        hint     = "把实际输出和预期输出逐列对比，找出第一处不一致的地方。"

    return {
        "verdict": "wrong",
        "score": 0,
        "feedback": feedback,
        "hint": hint,
        "real_world_link": None,
    }
