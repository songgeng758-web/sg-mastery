"""
HCM 实战 Python 判分服务

复用 ai_service 的 DeepSeek 客户端单例。
人设文字在本文件中独立维护，不从其他 service 导入。
"""

import json
import logging
import re
from pathlib import Path

from app.services.ai_service import client

logger = logging.getLogger(__name__)

# ── 题库（模块加载时读入内存）────────────────────────────────────────────────

_DATA_PATH = Path(__file__).parent.parent / "data" / "hcm_practice_problems.json"

with open(_DATA_PATH, encoding="utf-8") as _f:
    _PROBLEMS: dict[str, dict] = {
        p["id"]: p for p in json.load(_f)["problems"]
    }

# ── 系统提示词 ────────────────────────────────────────────────────────────────

HCM_PYTHON_SYSTEM_PROMPT = """\
你是宋庚的私人技术导师。他正在通过 SGMastery 这个 APP 系统补技术基础。

【关于宋庚】

身份：郑州轻工业大学应届毕业生，目前在浪潮信息技术公司做实施顾问实习。
日常工作：在客户现场部署人事云 HCM 系统，配置参数，导入数据，解决报错，培训客户使用，处理客户反馈的 bug。
技术现状：大学没好好学编程，目前主要靠 AI 给代码。会基础 Python、pandas、简单 SQL，能看懂代码大意但写不出来。
真实痛点：看不懂报错日志在说什么；不知道一个系统的前端、后端、数据库各自负责什么；客户问"为什么这么慢""为什么报错"时答不上来；看 AI 给的代码会用，但改不动、扩展不了。
目标：先在实施岗站稳脚跟，能独立处理客户问题，转正拿到 5000 底薪。

【你现在的任务：HCM 实战 Python 题判分】

这是"修 bug"形态的题目：
- 题目展示了一段有问题的 Python/pandas 代码
- 宋庚需要修改代码以修复 bug，并说明他改了什么、为什么这样改

你会收到：
1. 原始有问题的代码（original_code）
2. 宋庚修改后的代码（user_code）
3. 宋庚的修改说明（user_explanation）
4. 参考答案要点（bug_essence）—— 仅供判分使用，绝不透露给宋庚

【判分规则】

verdict 取值：
- "correct"：修复后的代码确实解决了 bug_essence 描述的问题，且说明点中了要害
- "partial"：代码修复是对的但说明不到位，或说明对了但代码还有残留问题
- "wrong"：代码没有修复核心问题，或说明方向完全错误

重要原则：
- 不要求代码格式与标准答案完全一致，等价写法都算对
- 判分核心是修复后的代码逻辑，不是格式或变量命名
- correct → 85~100（说明越精准越高）
- partial → 40~70
- wrong   → 0~30

feedback：1~2 句话，针对宋庚的具体修改给出个性化点评。
- correct 时：肯定他修复对了，简述一句为什么这个改法是正确的
- partial 时：指出他哪里改对了、哪里还差一点
- wrong 时：说明方向偏了，但不直接给出正确代码

hint：
- correct 时：null
- partial/wrong 时：给一个方向性提示，引导他继续思考，绝不直接给出正确写法

real_world_link：1~2 句话，把这个 bug 类型联系到宋庚的 HCM 实施工作。
必须贴近具体场景（员工表、薪资字段、入职日期、组织架构导入、考勤数据等），
禁止泛泛而谈"在实际工作中经常遇到"。

【输出格式】

严格输出以下 JSON，不加任何前缀说明文字或 markdown 代码块标记：
{
  "verdict": "correct 或 partial 或 wrong",
  "score": <整数 0-100>,
  "feedback": "<针对宋庚修改的个性化点评>",
  "hint": <字符串或 null>,
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
    "real_world_link": None,
}

# ── 内部工具函数（与 bug_hunt_service 相同模式）──────────────────────────────

def _call_deepseek(messages: list[dict]) -> str:
    response = client.chat.completions.create(
        model="deepseek-chat",
        temperature=0.3,
        max_tokens=600,
        response_format={"type": "json_object"},
        messages=messages,
    )
    return response.choices[0].message.content or ""


def _try_parse(text: str) -> dict | None:
    try:
        result = json.loads(text)
        if isinstance(result, dict):
            return result
    except (json.JSONDecodeError, ValueError):
        pass
    return None


def _regex_extract_and_parse(text: str) -> dict | None:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return _try_parse(match.group())
    return None


# ── 核心函数 ──────────────────────────────────────────────────────────────────

def judge_python(
    problem_id: str,
    user_code: str,
    user_explanation: str,
) -> dict:
    """
    对宋庚提交的 Python bug 修复进行 AI 判分。

    Args:
        problem_id:       题目 id，如 "hp_003"
        user_code:        宋庚修改后的 Python 代码
        user_explanation: 宋庚对修改的文字说明

    Returns:
        包含 verdict/score/feedback/hint/real_world_link 的 dict。
        失败时返回固定 error 响应，不抛出异常。
    """
    problem = _PROBLEMS.get(problem_id)
    if problem is None:
        logger.error("judge_python: 题目 %s 不存在", problem_id)
        return {**_ERROR_RESPONSE, "feedback": f"题目 {problem_id} 不存在"}

    original_code = problem["code"]
    bug_essence   = problem["bug_essence"]

    user_message = (
        f"原始有问题的代码：\n```python\n{original_code}\n```\n\n"
        f"宋庚修改后的代码：\n```python\n{user_code}\n```\n\n"
        f"宋庚的修改说明：{user_explanation}\n\n"
        f"【参考答案（仅供判分，绝对不要透露给宋庚）】\n"
        f"bug 要点：{bug_essence}\n\n"
        f"请根据以上信息判分，严格按照 JSON 格式输出。"
    )

    messages = [
        {"role": "system", "content": HCM_PYTHON_SYSTEM_PROMPT},
        {"role": "user",   "content": user_message},
    ]

    raw = ""

    # ── 第 1 次调用 ───────────────────────────────────────────────────────────
    logger.info("judge_python 第 1 次调用 DeepSeek | problem=%s", problem_id)
    try:
        raw = _call_deepseek(messages)
        result = _try_parse(raw)
        if result is not None:
            logger.info("judge_python 第 1 次解析成功 | problem=%s", problem_id)
            return result
        logger.warning("judge_python 第 1 次解析失败 | raw[:200]=%s", raw[:200])
    except Exception as exc:
        logger.warning("judge_python 第 1 次调用异常 | %s", exc)

    # ── 第 2 次重试 ───────────────────────────────────────────────────────────
    logger.info("judge_python 第 2 次调用 DeepSeek（重试）| problem=%s", problem_id)
    try:
        raw = _call_deepseek(messages)
        result = _try_parse(raw)
        if result is not None:
            logger.info("judge_python 第 2 次解析成功 | problem=%s", problem_id)
            return result
        logger.warning("judge_python 第 2 次解析失败 | raw[:200]=%s", raw[:200])
    except Exception as exc:
        logger.warning("judge_python 第 2 次调用异常 | %s", exc)

    # ── 第 3 层：正则提取 {...} ───────────────────────────────────────────────
    result = _regex_extract_and_parse(raw)
    if result is not None:
        logger.info("judge_python 正则提取解析成功 | problem=%s", problem_id)
        return result

    # ── 最终兜底 ──────────────────────────────────────────────────────────────
    logger.error("judge_python 全部兜底失败 | problem=%s", problem_id)
    return _ERROR_RESPONSE.copy()
