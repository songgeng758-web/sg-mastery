"""
代码扫雷 AI 判分服务

复用 ai_service 的 DeepSeek 客户端单例（from app.services.ai_service import client）。
人设文字在本文件中独立维护，不从 ai_service 导入、不修改 ai_service.py。
"""

import json
import logging
import re
from pathlib import Path

from app.services.ai_service import client

logger = logging.getLogger(__name__)

# ── 题库（模块加载时读入内存，与路由层的 _PROBLEMS 独立）──────────────────

_DATA_PATH = Path(__file__).parent.parent / "data" / "bug_hunt_problems.json"

with open(_DATA_PATH, encoding="utf-8") as _f:
    _PROBLEMS: dict[str, dict] = {
        p["id"]: p for p in json.load(_f)["problems"]
    }

# ── 系统提示词 ────────────────────────────────────────────────────────────────

BUG_HUNT_SYSTEM_PROMPT = """\
你是宋庚的私人技术导师。他正在通过 SGMastery 这个 APP 系统补技术基础。

【关于宋庚】

身份：郑州轻工业大学应届毕业生，目前在浪潮信息技术公司做实施顾问实习。
日常工作：在客户现场部署人事云 HCM 系统，配置参数，导入数据，解决报错，培训客户使用，处理客户反馈的 bug。
技术现状：大学没好好学编程，目前主要靠 AI 给代码。会基础 Python、pandas、简单 SQL，能看懂代码大意但写不出来。
真实痛点：看不懂报错日志在说什么；不知道一个系统的前端、后端、数据库各自负责什么；客户问"为什么这么慢""为什么报错"时答不上来；看 AI 给的代码会用，但改不动、扩展不了。
目标：先在实施岗站稳脚跟，能独立处理客户问题，转正拿到 5000 底薪。

【你现在的任务：代码扫雷判分】

宋庚会提交一道代码找 bug 的题目作答，告诉你他选择的出错行号和他的分析说明。
你会收到题目代码、参考答案要点（bug_essence）和正确行号（expected_lines）用于判分。
参考答案仅供你内部判分，绝对不要直接透露给宋庚。

【判分规则】

verdict 取值：
- "correct"：行号选对（完全一致或实质一致），且说明了 bug 的核心原因
- "partial"：行号选对但说明不完整，或说明基本正确但行号有偏差
- "wrong"：行号错误，且说明与 bug 本质无关

score 取值：
- correct → 85 ~ 100（说明越精准越高）
- partial → 40 ~ 70
- wrong   → 0 ~ 30

feedback：1~2 句话，针对宋庚的具体回答给出个性化点评。
- correct 时：肯定他找对了，顺带简述一句 bug 的核心机制
- partial 时：指出他哪里对了、哪里还差一点
- wrong 时：说明方向偏了，但不直接说出正确行号或完整解法

hint：渐进式反馈原则——
- correct 时：null
- partial/wrong 时：给一个方向性提示，引导他继续思考。
  绝对不要直接说出正确行号或完整解法，只给"往哪个方向想"的提示。

answer：固定为 null（答案通过单独的 /answer 端点获取，此处不暴露）

real_world_link：1~2 句话，把这个 bug 类型联系到宋庚的 HCM 实施工作。
必须贴近具体场景（员工表、薪资字段、入职日期、组织架构导入、考勤数据等），
禁止泛泛而谈"在实际工作中经常遇到"。

【输出格式】

严格输出以下 JSON，不加任何前缀说明文字或 markdown 代码块标记：
{
  "verdict": "correct 或 partial 或 wrong",
  "score": <整数 0-100>,
  "feedback": "<针对宋庚回答的个性化点评>",
  "hint": <字符串或 null>,
  "answer": null,
  "real_world_link": "<HCM 实施场景联系>"
}

【风格要求】

全程中文，朋友聊天口气，保持专业。
不要说"很简单""一学就会""不难理解"。
不要使用学术腔。
"""

# ── 固定 error 响应 ───────────────────────────────────────────────────────────

_ERROR_RESPONSE: dict = {
    "verdict": "error",
    "score": 0,
    "feedback": "AI 判分暂时不可用，请重试",
    "hint": None,
    "answer": None,
    "real_world_link": None,
}

# ── 内部工具函数 ──────────────────────────────────────────────────────────────

def _call_deepseek(messages: list[dict]) -> str:
    """单次 DeepSeek 调用，返回响应文本字符串。"""
    response = client.chat.completions.create(
        model="deepseek-chat",
        temperature=0.3,
        max_tokens=600,
        response_format={"type": "json_object"},
        messages=messages,
    )
    return response.choices[0].message.content or ""


def _try_parse(text: str) -> dict | None:
    """尝试将文本解析为 JSON dict，失败返回 None。"""
    try:
        result = json.loads(text)
        if isinstance(result, dict):
            return result
    except (json.JSONDecodeError, ValueError):
        pass
    return None


def _regex_extract_and_parse(text: str) -> dict | None:
    """用正则从响应文本中提取第一个完整 {...} 块并解析。"""
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return _try_parse(match.group())
    return None


# ── 核心函数 ──────────────────────────────────────────────────────────────────

def judge_answer(
    problem_id: str,
    selected_lines: list[int],
    user_explanation: str,
) -> dict:
    """
    对宋庚的代码扫雷作答进行 AI 判分。

    Args:
        problem_id: 题目 id，如 "bh_001"
        selected_lines: 宋庚选择的出错行号列表，如 [6]
        user_explanation: 宋庚对 bug 的文字说明

    Returns:
        包含 verdict/score/feedback/hint/answer/real_world_link 的 dict。
        失败时返回固定 error 响应，不抛出异常。
    """
    # ── 取题目 ────────────────────────────────────────────────────────────────
    problem = _PROBLEMS.get(problem_id)
    if problem is None:
        logger.error("judge_answer: 题目 %s 不存在", problem_id)
        return {**_ERROR_RESPONSE, "feedback": f"题目 {problem_id} 不存在"}

    expected_lines = problem["expected_bug_lines"]
    bug_essence    = problem["bug_essence"]
    code           = problem["code"]

    # ── 构建 user message ─────────────────────────────────────────────────────
    user_message = (
        f"题目代码：\n```\n{code}\n```\n\n"
        f"宋庚选择的出错行号：{selected_lines}\n"
        f"宋庚的分析说明：{user_explanation}\n\n"
        f"【参考答案（仅供判分，不要透露给宋庚）】\n"
        f"正确行号：{expected_lines}\n"
        f"bug 要点：{bug_essence}\n\n"
        f"请根据以上信息判分，严格按照 JSON 格式输出。"
    )

    messages = [
        {"role": "system", "content": BUG_HUNT_SYSTEM_PROMPT},
        {"role": "user",   "content": user_message},
    ]

    raw = ""

    # ── 第 1 次调用 ───────────────────────────────────────────────────────────
    print(f"[judge_answer] 第 1 次调用 DeepSeek | problem={problem_id}")
    try:
        raw = _call_deepseek(messages)
        result = _try_parse(raw)
        if result is not None:
            print("[judge_answer] 第 1 次解析成功")
            return result
        print(f"[judge_answer] 第 1 次解析失败，原始响应（前 200 字）：{raw[:200]}")
    except Exception as exc:
        print(f"[judge_answer] 第 1 次调用异常：{exc}")

    # ── 第 2 次重试（相同 prompt）────────────────────────────────────────────
    print("[judge_answer] 第 2 次调用 DeepSeek（重试）")
    try:
        raw = _call_deepseek(messages)
        result = _try_parse(raw)
        if result is not None:
            print("[judge_answer] 第 2 次解析成功")
            return result
        print(f"[judge_answer] 第 2 次解析失败，原始响应（前 200 字）：{raw[:200]}")
    except Exception as exc:
        print(f"[judge_answer] 第 2 次调用异常：{exc}")

    # ── 第 3 层：正则提取 {...} ───────────────────────────────────────────────
    print("[judge_answer] 尝试正则提取 JSON 块")
    result = _regex_extract_and_parse(raw)
    if result is not None:
        print("[judge_answer] 正则提取解析成功")
        return result

    # ── 最终兜底 ──────────────────────────────────────────────────────────────
    print("[judge_answer] 全部兜底失败，返回固定 error 响应")
    return _ERROR_RESPONSE.copy()
