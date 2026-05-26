"""
API 路由定义

定义所有 API 端点的路由处理器。
"""

import logging

from fastapi import APIRouter, HTTPException
from app.models.schemas import CodeExecutionRequest, CodeExecutionResponse
from app.models.schemas import ExplainRequest, ExplainResponse, ExplainData, UsageInfo
from app.services.code_executor import execute_code_mock
from app.services.ai_service import generate_explanation

logger = logging.getLogger(__name__)

# 创建 API 路由器
router = APIRouter()


@router.post("/api/run-code", response_model=CodeExecutionResponse)
async def run_code(request: CodeExecutionRequest) -> CodeExecutionResponse:
    """
    代码执行端点
    
    接收前端发送的代码执行请求，调用 mock 执行服务并返回结果。
    
    Args:
        request: 包含代码内容和可选语言类型的请求体
    
    Returns:
        CodeExecutionResponse: 包含执行状态和结果消息的响应
        
    Raises:
        HTTPException: 当请求验证失败时返回 422 状态码
        
    Requirements: 9.1, 9.2, 9.5, 9.6, 9.7
    
    Example:
        POST /api/run-code
        {
            "code": "print('Hello, World!')",
            "language": "python"
        }
        
        Response:
        {
            "status": "success",
            "message": "代码执行成功，发现 3 条重叠数据"
        }
    """
    try:
        # 调用 mock 执行服务
        result = execute_code_mock(request.code)
        return result
    except Exception as e:
        # 处理意外错误
        raise HTTPException(
            status_code=500,
            detail=f"代码执行失败: {str(e)}"
        )


@router.post("/api/ai/explain", response_model=ExplainResponse)
async def explain_concept(request: ExplainRequest) -> ExplainResponse:
    """
    AI 类比讲解端点

    接收技术概念名称，调用 DeepSeek 生成针对宋庚实施工作场景的类比讲解。

    Args:
        request: 包含 topic 字段的请求体

    Returns:
        ExplainResponse: success=True 时含讲解内容和 token 消耗；
                         success=False 时含错误描述，usage.tokens=0
    """
    try:
        result = generate_explanation(request.topic)
        return result
    except Exception as e:
        logger.error("explain_concept 端点异常 | topic: %s | error: %s", request.topic, str(e))
        return ExplainResponse(
            success=False,
            data=ExplainData(content=f"AI 服务暂时不可用：{str(e)}"),
            usage=UsageInfo(tokens=0),
        )


@router.get("/api/ai/health")
async def ai_health_check():
    """
    DeepSeek 连通性检查

    用固定 topic 发起真实 API 调用，验证 API Key 和网络是否正常。
    返回 status='ok' 表示链路畅通。
    """
    try:
        result = generate_explanation("HTTP 请求")
        return {
            "status": "ok",
            "deepseek_reachable": True,
            "tokens_used": result.usage.tokens,
        }
    except Exception as e:
        return {
            "status": "error",
            "deepseek_reachable": False,
            "error": str(e),
        }
