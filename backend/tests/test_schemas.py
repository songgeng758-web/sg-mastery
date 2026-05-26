"""
Pydantic 数据模型单元测试

测试 CodeExecutionRequest 和 CodeExecutionResponse 模型的验证规则。
"""

import pytest
from pydantic import ValidationError
from app.models.schemas import CodeExecutionRequest, CodeExecutionResponse


class TestCodeExecutionRequest:
    """测试 CodeExecutionRequest 模型"""
    
    def test_valid_request_with_code_only(self):
        """测试只包含 code 字段的有效请求"""
        request = CodeExecutionRequest(code="print('Hello')")
        assert request.code == "print('Hello')"
        assert request.language is None
    
    def test_valid_request_with_python_language(self):
        """测试包含 Python 语言类型的有效请求"""
        request = CodeExecutionRequest(code="print('Hello')", language="python")
        assert request.code == "print('Hello')"
        assert request.language == "python"
    
    def test_valid_request_with_sql_language(self):
        """测试包含 SQL 语言类型的有效请求"""
        request = CodeExecutionRequest(code="SELECT * FROM users", language="sql")
        assert request.code == "SELECT * FROM users"
        assert request.language == "sql"
    
    def test_language_case_insensitive(self):
        """测试语言类型大小写不敏感"""
        request = CodeExecutionRequest(code="test", language="PYTHON")
        assert request.language == "python"
        
        request = CodeExecutionRequest(code="test", language="SQL")
        assert request.language == "sql"
    
    def test_empty_code_raises_validation_error(self):
        """测试空代码内容抛出验证错误"""
        with pytest.raises(ValidationError) as exc_info:
            CodeExecutionRequest(code="")
        
        errors = exc_info.value.errors()
        # Empty string fails min_length validation
        assert any(error['type'] == 'string_too_short' for error in errors)
    
    def test_whitespace_only_code_raises_validation_error(self):
        """测试仅包含空白字符的代码抛出验证错误"""
        with pytest.raises(ValidationError) as exc_info:
            CodeExecutionRequest(code="   \n\t  ")
        
        errors = exc_info.value.errors()
        assert any(error['type'] == 'value_error' for error in errors)
    
    def test_missing_code_raises_validation_error(self):
        """测试缺少 code 字段抛出验证错误"""
        with pytest.raises(ValidationError) as exc_info:
            CodeExecutionRequest()
        
        errors = exc_info.value.errors()
        assert any(error['loc'] == ('code',) for error in errors)
    
    def test_invalid_language_raises_validation_error(self):
        """测试无效的语言类型抛出验证错误"""
        with pytest.raises(ValidationError) as exc_info:
            CodeExecutionRequest(code="test", language="javascript")
        
        errors = exc_info.value.errors()
        assert any(error['type'] == 'value_error' for error in errors)
    
    def test_multiline_code(self):
        """测试多行代码"""
        code = """def hello():
    print('Hello, World!')
    return True"""
        request = CodeExecutionRequest(code=code)
        assert request.code == code
    
    def test_code_with_special_characters(self):
        """测试包含特殊字符的代码"""
        code = "print('Hello! @#$%^&*()')"
        request = CodeExecutionRequest(code=code)
        assert request.code == code


class TestCodeExecutionResponse:
    """测试 CodeExecutionResponse 模型"""
    
    def test_valid_success_response(self):
        """测试有效的成功响应"""
        response = CodeExecutionResponse(
            status="success",
            message="代码执行成功，发现 3 条重叠数据"
        )
        assert response.status == "success"
        assert response.message == "代码执行成功，发现 3 条重叠数据"
    
    def test_valid_error_response(self):
        """测试有效的错误响应"""
        response = CodeExecutionResponse(
            status="error",
            message="代码执行失败：语法错误"
        )
        assert response.status == "error"
        assert response.message == "代码执行失败：语法错误"
    
    def test_status_case_insensitive(self):
        """测试状态值大小写不敏感"""
        response = CodeExecutionResponse(status="SUCCESS", message="OK")
        assert response.status == "success"
        
        response = CodeExecutionResponse(status="ERROR", message="Failed")
        assert response.status == "error"
    
    def test_invalid_status_raises_validation_error(self):
        """测试无效的状态值抛出验证错误"""
        with pytest.raises(ValidationError) as exc_info:
            CodeExecutionResponse(status="pending", message="Processing")
        
        errors = exc_info.value.errors()
        assert any(error['type'] == 'value_error' for error in errors)
    
    def test_empty_message_raises_validation_error(self):
        """测试空消息内容抛出验证错误"""
        with pytest.raises(ValidationError) as exc_info:
            CodeExecutionResponse(status="success", message="")
        
        errors = exc_info.value.errors()
        # Empty string fails min_length validation
        assert any(error['type'] == 'string_too_short' for error in errors)
    
    def test_whitespace_only_message_raises_validation_error(self):
        """测试仅包含空白字符的消息抛出验证错误"""
        with pytest.raises(ValidationError) as exc_info:
            CodeExecutionResponse(status="success", message="   \n\t  ")
        
        errors = exc_info.value.errors()
        assert any(error['type'] == 'value_error' for error in errors)
    
    def test_missing_status_raises_validation_error(self):
        """测试缺少 status 字段抛出验证错误"""
        with pytest.raises(ValidationError) as exc_info:
            CodeExecutionResponse(message="Test message")
        
        errors = exc_info.value.errors()
        assert any(error['loc'] == ('status',) for error in errors)
    
    def test_missing_message_raises_validation_error(self):
        """测试缺少 message 字段抛出验证错误"""
        with pytest.raises(ValidationError) as exc_info:
            CodeExecutionResponse(status="success")
        
        errors = exc_info.value.errors()
        assert any(error['loc'] == ('message',) for error in errors)
    
    def test_long_message(self):
        """测试长消息内容"""
        long_message = "执行结果：" + "A" * 1000
        response = CodeExecutionResponse(status="success", message=long_message)
        assert response.message == long_message
    
    def test_message_with_special_characters(self):
        """测试包含特殊字符的消息"""
        message = "错误：语法错误 @行 10 (#$%^&*)"
        response = CodeExecutionResponse(status="error", message=message)
        assert response.message == message
