"""
测试 API 路由端点

测试 /api/run-code 端点的功能和响应格式。
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """创建测试客户端"""
    with TestClient(app) as test_client:
        yield test_client


def test_run_code_endpoint_success(client):
    """
    测试 /api/run-code 端点返回成功响应
    
    验证需求: 9.1, 9.2, 9.5, 9.6, 9.7
    """
    response = client.post(
        "/api/run-code",
        json={"code": "print('Hello, World!')"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "message" in data
    assert data["status"] == "success"
    assert isinstance(data["message"], str)
    assert len(data["message"]) > 0


def test_run_code_endpoint_with_language(client):
    """
    测试 /api/run-code 端点接受可选的 language 参数
    
    验证需求: 9.2, 9.3
    """
    response = client.post(
        "/api/run-code",
        json={"code": "SELECT * FROM users;", "language": "sql"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


def test_run_code_endpoint_missing_code_field(client):
    """
    测试 /api/run-code 端点在缺少 code 字段时返回 422 错误
    
    验证需求: 9.2, 9.3
    """
    response = client.post(
        "/api/run-code",
        json={"wrong_field": "value"}
    )
    
    assert response.status_code == 422


def test_run_code_endpoint_empty_code(client):
    """
    测试 /api/run-code 端点在 code 为空时返回 422 错误
    
    验证需求: 9.3
    """
    response = client.post(
        "/api/run-code",
        json={"code": ""}
    )
    
    assert response.status_code == 422


def test_run_code_endpoint_cors_headers(client):
    """
    测试 /api/run-code 端点设置正确的 CORS 头
    
    验证需求: 9.8
    """
    response = client.post(
        "/api/run-code",
        json={"code": "print('test')"},
        headers={"Origin": "http://localhost:5173"}
    )
    
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_run_code_endpoint_returns_json(client):
    """
    测试 /api/run-code 端点返回 JSON 格式响应
    
    验证需求: 9.4
    """
    response = client.post(
        "/api/run-code",
        json={"code": "x = 1 + 1"}
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"


def test_run_code_endpoint_mock_response_format(client):
    """
    测试 /api/run-code 端点返回正确的 mock 响应格式
    
    验证需求: 9.9
    """
    response = client.post(
        "/api/run-code",
        json={"code": "def test(): pass"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["message"] == "代码执行成功，发现 3 条重叠数据"
