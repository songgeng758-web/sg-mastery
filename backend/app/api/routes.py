"""
API 路由定义

定义所有 API 端点的路由处理器。
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import CodeExecutionRequest, CodeExecutionResponse
from app.services.code_executor import execute_code_mock

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
