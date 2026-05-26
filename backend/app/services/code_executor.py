"""
代码执行服务

提供代码执行功能的服务层。当前版本使用 mock 实现，返回固定的成功响应。
"""

from app.models.schemas import CodeExecutionResponse


def execute_code_mock(code: str) -> CodeExecutionResponse:
    """
    Mock 代码执行函数
    
    返回固定的成功响应，用于 MVP 阶段验证前后端通信流程。
    未来可以扩展为真实的代码执行功能。
    
    Args:
        code: 要执行的代码内容（当前版本不实际执行）
    
    Returns:
        CodeExecutionResponse: 固定的成功响应
        
    Example:
        >>> result = execute_code_mock("print('hello')")
        >>> result.status
        'success'
        >>> result.message
        '代码执行成功，发现 3 条重叠数据'
    """
    return CodeExecutionResponse(
        status="success",
        message="代码执行成功，发现 3 条重叠数据"
    )
