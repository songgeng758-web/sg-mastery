"""
代码扫雷 API 路由

题库在模块加载时一次性读入内存（_PROBLEMS 字典），
后续每次请求直接查字典，不重复读文件。
"""

import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.models.schemas import BugHuntProblemSummary, BugHuntProblemDetail, JudgeRequest, JudgeResponse, AnswerResponse
from app.services.bug_hunt_service import judge_answer

logger = logging.getLogger(__name__)

bug_hunt_router = APIRouter()

# ── 题库加载（模块导入时执行一次）──────────────────────────────────────────

_DATA_PATH = Path(__file__).parent.parent / "data" / "bug_hunt_problems.json"


def _load_problems() -> dict[str, dict]:
    with open(_DATA_PATH, encoding="utf-8") as f:
        raw = json.load(f)
    return {p["id"]: p for p in raw["problems"]}


_PROBLEMS: dict[str, dict] = _load_problems()
logger.info("题库加载完成，共 %d 道题", len(_PROBLEMS))


# ── 路由 ────────────────────────────────────────────────────────────────────

@bug_hunt_router.get(
    "/api/bug-hunt/problems",
    response_model=list[BugHuntProblemSummary],
)
async def list_problems():
    """返回全部题目的摘要列表（id/title/tags/language），不含代码和答案。"""
    return [
        BugHuntProblemSummary(
            id=p["id"],
            title=p["title"],
            tags=p["tags"],
            language=p["language"],
        )
        for p in _PROBLEMS.values()
    ]


@bug_hunt_router.get(
    "/api/bug-hunt/problems/{problem_id}",
    response_model=BugHuntProblemDetail,
)
async def get_problem(problem_id: str):
    """返回单道题的详情（含代码和题目描述），不含 answer/bug_essence/expected_bug_lines。"""
    p = _PROBLEMS.get(problem_id)
    if p is None:
        raise HTTPException(status_code=404, detail=f"题目 {problem_id} 不存在")
    return BugHuntProblemDetail(
        id=p["id"],
        title=p["title"],
        description=p["description"],
        code=p["code"],
        language=p["language"],
        tags=p["tags"],
    )


@bug_hunt_router.get(
    "/api/bug-hunt/problems/{problem_id}/answer",
    response_model=AnswerResponse,
)
async def get_answer(problem_id: str):
    """返回题目的完整解答，供用户答题后查看。"""
    p = _PROBLEMS.get(problem_id)
    if p is None:
        raise HTTPException(status_code=404, detail=f"题目 {problem_id} 不存在")
    return AnswerResponse(problem_id=problem_id, answer=p["answer"])


@bug_hunt_router.post(
    "/api/bug-hunt/judge",
    response_model=JudgeResponse,
)
async def judge(request: JudgeRequest):
    """
    对用户提交的答题进行 AI 判分。

    - problem_id 不存在 → 404
    - AI 调用本身抛出未捕获异常 → 503
    - service 内部兜底已返回 verdict='error' 的字典时，直接透传给前端（不再包装）
    """
    if request.problem_id not in _PROBLEMS:
        raise HTTPException(status_code=404, detail=f"题目 {request.problem_id} 不存在")

    try:
        result = judge_answer(
            problem_id=request.problem_id,
            selected_lines=request.selected_lines,
            user_explanation=request.user_explanation,
        )
    except Exception as exc:
        logger.error("judge 端点：service 层未捕获异常 | %s", exc)
        raise HTTPException(status_code=503, detail="AI 判分服务暂时不可用，请稍后重试")

    return JudgeResponse(**result)
