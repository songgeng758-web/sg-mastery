"""
代码执行服务单元测试

测试 code_executor 模块的 mock 代码执行功能。
"""

import pytest
from app.services.code_executor import execute_code_mock
from app.models.schemas import CodeExecutionResponse


class TestExecuteCodeMock:
    """测试 execute_code_mock 函数"""
    
    def test_returns_code_execution_response(self):
        """测试返回 CodeExecutionResponse 类型"""
        result = execute_code_mock("print('test')")
        assert isinstance(result, CodeExecutionResponse)
    
    def test_returns_success_status(self):
        """测试返回成功状态 (需求 9.4)"""
        result = execute_code_mock("print('test')")
        assert result.status == "success"
    
    def test_returns_fixed_message(self):
        """测试返回固定的消息内容 (需求 9.9)"""
        result = execute_code_mock("print('test')")
        assert result.message == "代码执行成功，发现 3 条重叠数据"
    
    def test_message_not_empty(self):
        """测试消息内容不为空 (需求 9.6)"""
        result = execute_code_mock("print('test')")
        assert len(result.message) > 0
    
    def test_accepts_any_code_input(self):
        """测试接受任意代码输入"""
        test_cases = [
            "print('hello')",
            "SELECT * FROM users",
            "",
            "def foo():\n    pass",
            "x = 1 + 2",
        ]
        
        for code in test_cases:
            result = execute_code_mock(code)
            assert result.status == "success"
            assert result.message == "代码执行成功，发现 3 条重叠数据"
    
    def test_consistent_response(self):
        """测试多次调用返回一致的响应"""
        result1 = execute_code_mock("code1")
        result2 = execute_code_mock("code2")
        result3 = execute_code_mock("code3")
        
        assert result1.status == result2.status == result3.status
        assert result1.message == result2.message == result3.message
    
    def test_response_has_required_fields(self):
        """测试响应包含必需字段 (需求 9.5, 9.6)"""
        result = execute_code_mock("test")
        
        # 验证 status 字段存在
        assert hasattr(result, 'status')
        assert result.status is not None
        
        # 验证 message 字段存在
        assert hasattr(result, 'message')
        assert result.message is not None
