import { useState } from 'react';
import { Play, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import CodeEditor from '../common/CodeEditor';
import Button from '../common/Button';
import PageTransition from '../common/PageTransition';
import { debugChallenges } from '../../data/mockData';
import { apiService } from '../../services/api';
import type { CodeExecutionResponse } from '../../types';

/**
 * CodeDebug 页面组件
 * 
 * 代码扫雷页面 - 提供代码调试挑战
 * 显示关卡进度、代码编辑器、提示信息和运行按钮
 * 
 * 需求: 5.1, 5.2, 5.3, 5.5, 5.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */
function CodeDebug() {
  // 使用第一个挑战作为当前关卡（可扩展为支持多关卡切换）
  const currentChallenge = debugChallenges[0];
  
  // 状态管理
  const [code, setCode] = useState<string>(currentChallenge.code);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CodeExecutionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * 处理运行按钮点击
   * 
   * 需求: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
   */
  const handleRunCode = async () => {
    // 验证代码不为空
    if (!code.trim()) {
      setError('请输入代码后再运行');
      setResult(null);
      return;
    }

    // 清除之前的结果和错误
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      // 调用 API 服务执行代码
      const response = await apiService.executeCode({
        code: code,
        language: 'python'
      });

      // 显示执行结果
      setResult(response);
    } catch (err) {
      // 处理错误情况
      const errorMessage = err instanceof Error 
        ? err.message 
        : '代码执行失败，请稍后重试';
      setError(errorMessage);
    } finally {
      // 恢复按钮状态
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 p-3 sm:p-6 pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* 页面标题和关卡进度 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">代码扫雷</h1>
            <p className="text-sm sm:text-base text-gray-400">找出代码中的 Bug 并修复它</p>
          </div>
          
          {/* 关卡进度信息 - 需求: 5.1 */}
          <div className="
            px-4 sm:px-6 
            py-2 sm:py-3 
            bg-blue-600/20 
            border 
            border-blue-500/30 
            rounded-lg
            backdrop-blur-sm
          ">
            <p className="text-sm sm:text-base text-blue-300 font-medium">
              第 {currentChallenge.level}/{currentChallenge.totalLevels} 关
            </p>
          </div>
        </div>

        {/* 提示信息卡片 - 需求: 5.5 */}
        <div className="
          p-3 sm:p-4 
          bg-yellow-900/20 
          border 
          border-yellow-600/30 
          rounded-lg
          backdrop-blur-sm
        ">
          <div className="flex items-start gap-2 sm:gap-3">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm sm:text-base text-yellow-300 font-medium mb-1">提示</h3>
              <p className="text-xs sm:text-sm text-yellow-100/80 leading-relaxed">
                {currentChallenge.hint}
              </p>
            </div>
          </div>
        </div>

        {/* 代码编辑器 - 需求: 5.2, 5.3 */}
        <div className="space-y-2 sm:space-y-3">
          <h2 className="text-base sm:text-lg font-semibold text-white">代码编辑器</h2>
          <CodeEditor
            value={code}
            onChange={setCode}
            language="python"
            filename="challenge.py"
            placeholder="# 在此编写或修改代码..."
          />
        </div>

        {/* 运行按钮 - 需求: 5.6, 8.7 */}
        <div className="flex justify-end">
          <Button
            onClick={handleRunCode}
            variant="gradient"
            loading={isLoading}
            disabled={isLoading}
            className="w-full sm:w-auto sm:min-w-[140px]"
          >
            <Play className="w-4 h-4" />
            {isLoading ? '运行中...' : '运行代码'}
          </Button>
        </div>

        {/* 执行结果显示 - 需求: 8.5 */}
        {result && (
          <div className={`
            p-3 sm:p-4 
            rounded-lg
            backdrop-blur-sm
            border
            animate-fadeIn
            ${result.status === 'success' 
              ? 'bg-green-900/20 border-green-500/30' 
              : 'bg-red-900/20 border-red-500/30'
            }
          `}>
            <div className="flex items-start gap-2 sm:gap-3">
              {result.status === 'success' ? (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`text-sm sm:text-base font-medium mb-1 ${
                  result.status === 'success' ? 'text-green-300' : 'text-red-300'
                }`}>
                  {result.status === 'success' ? '执行成功' : '执行失败'}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  result.status === 'success' ? 'text-green-100/80' : 'text-red-100/80'
                }`}>
                  {result.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 错误信息显示 - 需求: 8.6 */}
        {error && (
          <div className="
            p-3 sm:p-4 
            bg-red-900/20 
            border 
            border-red-500/30 
            rounded-lg
            backdrop-blur-sm
            animate-fadeIn
          ">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base text-red-300 font-medium mb-1">错误</h3>
                <p className="text-xs sm:text-sm text-red-100/80 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </PageTransition>
  );
}

export default CodeDebug;
