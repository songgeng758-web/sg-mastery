import { useState } from 'react';
import CodeEditor from '../common/CodeEditor';
import Button from '../common/Button';
import PageTransition from '../common/PageTransition';
import { hcmScenarios } from '../../data/mockData';
import { apiService } from '../../services/api';
import type { CodeExecutionResponse } from '../../types';

/**
 * HCMPractice 页面组件
 * 
 * HCM 实战页面，提供 SQL 实战练习功能
 * 显示业务场景、员工数据表格和 SQL 编辑器
 * 
 * 需求: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */
function HCMPractice() {
  // 使用第一个场景作为默认场景
  const scenario = hcmScenarios[0];
  
  // 状态管理
  const [code, setCode] = useState(scenario.initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CodeExecutionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * 处理运行并检验按钮点击
   * 调用 API 执行 SQL 代码
   */
  const handleRunCode = async () => {
    // 验证代码不为空
    if (!code.trim()) {
      setError('请输入 SQL 代码后再运行');
      setResult(null);
      return;
    }

    // 重置状态
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      // 调用 API 执行代码
      const response = await apiService.executeCode({
        code,
        language: 'sql',
      });

      // 显示执行结果
      setResult(response);
    } catch (err) {
      // 处理错误情况
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen p-3 sm:p-6 pb-20 sm:pb-24">
        {/* 页面标题 */}
        <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">HCM 实战</h1>
        <p className="text-sm sm:text-base text-gray-400">SQL 实战练习 - 通过真实业务场景掌握数据库查询技能</p>
      </div>

      {/* 业务背景描述 */}
      <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-blue-400">业务场景</h2>
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{scenario.description}</p>
      </div>

      {/* 员工数据表格 */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-blue-400">员工数据</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-700/50 -mx-3 sm:mx-0">
          <table className="w-full bg-gray-800/50 min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap">
                  员工ID
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap">
                  姓名
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap">
                  职位
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap">
                  生效日期
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap">
                  失效日期
                </th>
              </tr>
            </thead>
            <tbody>
              {scenario.employees.map((employee, index) => (
                <tr
                  key={`${employee.id}-${index}`}
                  className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors duration-150 cursor-default"
                >
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-300 font-mono whitespace-nowrap">
                    {employee.id}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-300 whitespace-nowrap">
                    {employee.name}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-300 whitespace-nowrap">
                    {employee.position}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 font-mono whitespace-nowrap">
                    {employee.effectiveDate}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 font-mono whitespace-nowrap">
                    {employee.expirationDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SQL 编辑器 */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-blue-400">编写 SQL 查询</h2>
        <CodeEditor
          value={code}
          onChange={setCode}
          language="sql"
          filename="code.sql"
          placeholder="-- 在此编写 SQL 查询..."
        />
      </div>

      {/* 运行并检验按钮 */}
      <div className="mb-4 sm:mb-6">
        <Button
          onClick={handleRunCode}
          variant="gradient"
          loading={isLoading}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? '执行中...' : '运行并检验'}
        </Button>
      </div>

      {/* 执行结果显示 */}
      {result && (
        <div
          className={`
            p-4 sm:p-6 
            rounded-lg 
            border 
            animate-fadeIn
            ${
              result.status === 'success'
                ? 'bg-green-900/20 border-green-500/50'
                : 'bg-red-900/20 border-red-500/50'
            }
          `}
        >
          <h3
            className={`
              text-base sm:text-lg 
              font-semibold 
              mb-2 
              ${result.status === 'success' ? 'text-green-400' : 'text-red-400'}
            `}
          >
            {result.status === 'success' ? '✓ 执行成功' : '✗ 执行失败'}
          </h3>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{result.message}</p>
        </div>
      )}

      {/* 错误信息显示 */}
      {error && (
        <div className="p-4 sm:p-6 rounded-lg border bg-red-900/20 border-red-500/50 animate-fadeIn">
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-red-400">✗ 错误</h3>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{error}</p>
        </div>
      )}
      </div>
    </PageTransition>
  );
}

export default HCMPractice;
