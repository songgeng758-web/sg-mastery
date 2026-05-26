"""
Pydantic 数据模型定义

定义 API 请求和响应的数据模型，用于数据验证和序列化。
"""

from pydantic import BaseModel, Field, field_validator


class CodeExecutionRequest(BaseModel):
    """
    代码执行请求模型
    
    用于接收前端发送的代码执行请求。
    """
    code: str = Field(
        ...,
        min_length=1,
        description="要执行的代码内容",
        examples=["print('Hello, World!')"]
    )
    language: str | None = Field(
        default=None,
        description="代码语言类型（python 或 sql）",
        examples=["python", "sql"]
    )
    
    @field_validator('code')
    @classmethod
    def validate_code_not_empty(cls, v: str) -> str:
        """验证代码内容不为空或仅包含空白字符"""
        if not v or not v.strip():
            raise ValueError('代码内容不能为空')
        return v
    
    @field_validator('language')
    @classmethod
    def validate_language(cls, v: str | None) -> str | None:
        """验证语言类型为支持的值"""
        if v is not None:
            allowed_languages = ['python', 'sql']
            if v.lower() not in allowed_languages:
                raise ValueError(f'语言类型必须是 {", ".join(allowed_languages)} 之一')
            return v.lower()
        return v


class CodeExecutionResponse(BaseModel):
    """
    代码执行响应模型
    
    用于返回代码执行结果给前端。
    """
    status: str = Field(
        ...,
        description="执行状态（success 或 error）",
        examples=["success", "error"]
    )
    message: str = Field(
        ...,
        min_length=1,
        description="执行结果描述信息",
        examples=["代码执行成功，发现 3 条重叠数据"]
    )
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        """验证状态值为有效值"""
        allowed_statuses = ['success', 'error']
        if v.lower() not in allowed_statuses:
            raise ValueError(f'状态必须是 {", ".join(allowed_statuses)} 之一')
        return v.lower()
    
    @field_validator('message')
    @classmethod
    def validate_message_not_empty(cls, v: str) -> str:
        """验证消息内容不为空"""
        if not v or not v.strip():
            raise ValueError('消息内容不能为空')
        return v
