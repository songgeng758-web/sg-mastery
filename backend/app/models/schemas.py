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


# ── AI 类比讲解相关模型 ──────────────────────────────────────────────────────

class ExplainRequest(BaseModel):
    """AI 讲解请求：前端传入要解释的技术概念名称"""
    topic: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="要解释的技术概念",
        examples=["秒懂前后端通信", "CPU vs GPU"]
    )


class ExplainData(BaseModel):
    """AI 讲解内容体"""
    content: str = Field(..., description="DeepSeek 生成的类比讲解文字")


class UsageInfo(BaseModel):
    """Token 消耗信息"""
    tokens: int = Field(..., description="本次调用消耗的总 token 数")


class ExplainResponse(BaseModel):
    """AI 讲解响应：统一包装成功/失败两种情况"""
    success: bool = Field(..., description="调用是否成功")
    data: ExplainData = Field(..., description="讲解内容")
    usage: UsageInfo = Field(..., description="token 消耗")


# ── 代码扫雷相关模型 ─────────────────────────────────────────────────────────

class BugHuntProblemSummary(BaseModel):
    """题目列表项（用于题库列表页，不含题目代码和答案）"""
    id: str
    title: str
    tags: list[str]
    language: str


class BugHuntProblemDetail(BaseModel):
    """题目详情（用于答题页，不含 answer/expected_bug_lines/bug_essence）"""
    id: str
    title: str
    description: str
    code: str
    language: str
    tags: list[str]
