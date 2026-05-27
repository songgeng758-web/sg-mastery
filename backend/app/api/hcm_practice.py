"""
HCM 实战 API 路由

题库在模块加载时一次性读入内存（_PROBLEMS 字典），后续每次请求直接查字典。
"""

import asyncio
import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    HcmProblemSummary,
    HcmProblemDetail,
    HcmSchemaField,
    HcmAnswerResponse,
    HcmJudgeRequest,
    HcmJudgeResponse,
)
from app.services.hcm_sql_service import judge_sql
from app.services.hcm_python_service import judge_python

logger = logging.getLogger(__name__)

hcm_practice_router = APIRouter()

# ── 题库加载（模块导入时执行一次）──────────────────────────────────────────

_DATA_PATH = Path(__file__).parent.parent / "data" / "hcm_practice_problems.json"


def _load_problems() -> dict[str, dict]:
    with open(_DATA_PATH, encoding="utf-8") as f:
        raw = json.load(f)
    return {p["id"]: p for p in raw["problems"]}


_PROBLEMS: dict[str, dict] = _load_problems()
logger.info("HCM 实战题库加载完成，共 %d 道题", len(_PROBLEMS))


# ── 路由 ────────────────────────────────────────────────────────────────────

@hcm_practice_router.get(
    "/api/hcm-practice/problems",
    response_model=list[HcmProblemSummary],
)
async def list_problems():
    """返回全部 HCM 实战题目的摘要列表（id/title/language/tags），不含题目正文和答案。"""
    return [
        HcmProblemSummary(
            id=p["id"],
            title=p["title"],
            language=p["language"],
            tags=p["tags"],
        )
        for p in _PROBLEMS.values()
    ]


@hcm_practice_router.get(
    "/api/hcm-practice/problems/{problem_id}",
    response_model=HcmProblemDetail,
)
async def get_problem(problem_id: str):
    """返回单道题详情（含 scenario/schema/sample_data/expected_output/code），
    不含 answer/expected_rows/setup_sql/bug_essence。"""
    p = _PROBLEMS.get(problem_id)
    if p is None:
        raise HTTPException(status_code=404, detail=f"题目 {problem_id} 不存在")
    return HcmProblemDetail(
        id=p["id"],
        title=p["title"],
        language=p["language"],
        tags=p["tags"],
        scenario=p["scenario"],
        schema=[HcmSchemaField(**f) for f in p["schema"]],
        sample_data=p["sample_data"],
        expected_output=p["expected_output"],
        code=p.get("code"),
    )


@hcm_practice_router.get(
    "/api/hcm-practice/problems/{problem_id}/answer",
    response_model=HcmAnswerResponse,
)
async def get_answer(problem_id: str):
    """返回题目的完整解答，供用户答题后或点击放弃时查看。"""
    p = _PROBLEMS.get(problem_id)
    if p is None:
        raise HTTPException(status_code=404, detail=f"题目 {problem_id} 不存在")
    return HcmAnswerResponse(problem_id=problem_id, answer=p["answer"])


@hcm_practice_router.post(
    "/api/hcm-practice/judge",
    response_model=HcmJudgeResponse,
)
async def judge(request: HcmJudgeRequest):
    """
    对用户提交的 HCM 实战答题进行判分。

    - language="sql"    → asyncio.to_thread(judge_sql, ...)   精确对比结果集
    - language="python" → asyncio.to_thread(judge_python, ...) DeepSeek AI 判分
    - problem_id 不存在 → 404
    - service 层未捕获异常 → 503
    """
    if request.problem_id not in _PROBLEMS:
        raise HTTPException(status_code=404, detail=f"题目 {request.problem_id} 不存在")

    try:
        if request.language == "sql":
            result = await asyncio.to_thread(
                judge_sql, request.problem_id, request.user_code
            )
        else:
            result = await asyncio.to_thread(
                judge_python,
                request.problem_id,
                request.user_code,
                request.user_explanation,
            )
    except Exception as exc:
        logger.error("judge 端点：service 层未捕获异常 | %s", exc)
        raise HTTPException(status_code=503, detail="判分服务暂时不可用，请稍后重试")

    return HcmJudgeResponse(**result)
