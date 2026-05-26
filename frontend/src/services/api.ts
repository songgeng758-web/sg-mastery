/**
 * API 客户端服务
 * 
 * 提供与后端 API 通信的方法
 */

import type { CodeExecutionRequest, CodeExecutionResponse, ExplainResponse } from '../types';

/**
 * API 服务类
 * 
 * 封装所有与后端 API 的通信逻辑
 */
class ApiService {
  private baseURL: string;

  /**
   * 构造函数
   * @param baseURL - 后端 API 的基础 URL，默认为 http://localhost:8000
   */
  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  /**
   * 执行代码
   * 
   * 发送代码到后端执行并返回结果
   * 
   * @param request - 代码执行请求对象
   * @returns Promise<CodeExecutionResponse> - 代码执行结果
   * @throws Error - 当网络请求失败或响应无效时抛出错误
   * 
   * @example
   * ```typescript
   * const result = await apiService.executeCode({
   *   code: 'print("Hello, World!")',
   *   language: 'python'
   * });
   * console.log(result.message);
   * ```
   */
  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    try {
      // 发送 POST 请求到 /api/run-code 端点
      const response = await fetch(`${this.baseURL}/api/run-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // 检查响应状态
      if (!response.ok) {
        // 尝试解析错误响应
        let errorMessage = `HTTP 错误: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // 如果无法解析 JSON，使用默认错误消息
        }
        
        throw new Error(errorMessage);
      }

      // 解析 JSON 响应
      const data: CodeExecutionResponse = await response.json();

      // 验证响应数据格式
      if (!data.status || !data.message) {
        throw new Error('无效的响应格式：缺少必需字段');
      }

      return data;
    } catch (error) {
      // 处理网络错误和其他异常
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络设置');
      }
      
      // 重新抛出其他错误
      throw error;
    }
  }

  /**
   * 请求 AI 类比讲解
   *
   * 将知识卡片标题发送给后端，由 DeepSeek 生成针对宋庚实施工作场景的五段式类比讲解。
   *
   * @param topic - 知识卡片标题，作为讲解主题
   * @returns Promise<ExplainResponse> - 包含讲解内容和 token 消耗的响应
   * @throws Error - HTTP 响应非 2xx 时抛出带状态码的错误
   */
  async explainConcept(topic: string): Promise<ExplainResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    return response.json() as Promise<ExplainResponse>;
  }
}

/**
 * API 服务单例实例
 * 
 * 导出一个预配置的 ApiService 实例供应用使用
 */
export const apiService = new ApiService();

/**
 * 导出 ApiService 类以便测试或自定义实例化
 */
export { ApiService };
