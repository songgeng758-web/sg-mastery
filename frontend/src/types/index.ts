/**
 * TypeScript 类型定义
 * 
 * 定义应用中使用的所有数据接口类型
 */

/**
 * 用户模型
 * 
 * 表示应用中的用户信息（本 MVP 使用 mock 数据）
 */
export interface User {
  /** 用户唯一标识符 */
  id: string;
  /** 用户名称 */
  name: string;
  /** 用户头像 URL */
  avatar: string;
}

/**
 * 知识卡片模型
 * 
 * 表示知识补给站页面中的学习卡片
 */
export interface KnowledgeCard {
  /** 卡片唯一标识符 */
  id: string;
  /** 卡片标题 */
  title: string;
  /** 技术主题标签列表 */
  tags: string[];
  /** 卡片内容 */
  content: string;
}

/**
 * 代码调试挑战模型
 * 
 * 表示代码扫雷页面中的调试关卡
 */
export interface DebugChallenge {
  /** 当前关卡编号 */
  level: number;
  /** 总关卡数 */
  totalLevels: number;
  /** 预填充的代码内容 */
  code: string;
  /** 提示信息 */
  hint: string;
}

/**
 * 员工模型
 * 
 * 表示 HCM 实战页面中的员工数据
 */
export interface Employee {
  /** 员工 ID */
  id: string;
  /** 员工姓名 */
  name: string;
  /** 员工职位 */
  position: string;
  /** 生效日期 */
  effectiveDate: string;
  /** 失效日期 */
  expirationDate: string;
}

/**
 * HCM 实战场景模型
 * 
 * 表示 HCM 实战页面的业务场景数据
 */
export interface HCMScenario {
  /** 业务背景描述 */
  description: string;
  /** 员工数据列表 */
  employees: Employee[];
  /** 初始 SQL 代码 */
  initialCode: string;
}

/**
 * 代码执行请求模型
 * 
 * 用于向后端发送代码执行请求
 */
export interface CodeExecutionRequest {
  /** 要执行的代码内容 */
  code: string;
  /** 代码语言类型（可选） */
  language?: 'python' | 'sql';
}

/**
 * 代码执行响应模型
 *
 * 表示后端返回的代码执行结果
 */
export interface CodeExecutionResponse {
  /** 执行状态（success 或 error） */
  status: 'success' | 'error';
  /** 执行结果描述信息 */
  message: string;
}

/**
 * AI 类比讲解请求模型
 *
 * 对应后端 ExplainRequest，传入知识卡片标题作为讲解主题
 */
export interface ExplainRequest {
  /** 要讲解的技术概念，通常为知识卡片标题 */
  topic: string;
}

/**
 * AI 类比讲解响应模型
 *
 * 对应后端 ExplainResponse，统一包装成功和失败两种情况
 */
export interface ExplainResponse {
  /** 调用是否成功 */
  success: boolean;
  /** 讲解内容 */
  data: {
    /** DeepSeek 生成的五段式类比讲解文字 */
    content: string;
  };
  /** Token 消耗信息 */
  usage: {
    /** 本次调用消耗的总 token 数 */
    tokens: number;
  };
}
