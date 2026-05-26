import { useState, useEffect } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import CodeBlock from '../common/CodeBlock';
import PageTransition from '../common/PageTransition';
import JudgeResult from '../bug-hunt/JudgeResult';
import { apiService } from '../../services/api';
import type { BugHuntProblemSummary, BugHuntProblemDetail, JudgeResponse } from '../../types';

type Phase = 'list' | 'detail' | 'judging' | 'result';

export default function BugHunt() {
  const [phase, setPhase] = useState<Phase>('list');
  const [problems, setProblems] = useState<BugHuntProblemSummary[]>([]);
  const [currentProblem, setCurrentProblem] = useState<BugHuntProblemDetail | null>(null);
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
  const [explanation, setExplanation] = useState('');
  const [judgeResult, setJudgeResult] = useState<JudgeResponse | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getBugHuntProblems()
      .then(setProblems)
      .catch(e => setError(e instanceof Error ? e.message : '加载题库失败'))
      .finally(() => setListLoading(false));
  }, []);

  async function selectProblem(id: string) {
    setDetailLoading(true);
    setError(null);
    try {
      const detail = await apiService.getBugHuntProblem(id);
      setCurrentProblem(detail);
      setSelectedLines(new Set());
      setExplanation('');
      setJudgeResult(null);
      setAnswer(null);
      setPhase('detail');
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载题目失败');
    } finally {
      setDetailLoading(false);
    }
  }

  function toggleLine(line: number) {
    setSelectedLines(prev => {
      const next = new Set(prev);
      next.has(line) ? next.delete(line) : next.add(line);
      return next;
    });
  }

  async function handleSubmit() {
    if (!currentProblem) return;
    setPhase('judging');
    setError(null);
    try {
      const result = await apiService.judgeAnswer({
        problem_id: currentProblem.id,
        selected_lines: [...selectedLines],
        user_explanation: explanation,
      });
      setJudgeResult(result);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败，请重试');
      setPhase('detail');
    }
  }

  function handleRetry() {
    setSelectedLines(new Set());
    setExplanation('');
    setJudgeResult(null);
    setAnswer(null);
    setPhase('detail');
  }

  async function handleGiveUp() {
    if (!currentProblem) return;
    try {
      const data = await apiService.getBugHuntAnswer(currentProblem.id);
      setAnswer(data.answer);
    } catch {
      setAnswer('获取答案失败，请重试');
    }
  }

  function backToList() {
    setPhase('list');
    setCurrentProblem(null);
    setSelectedLines(new Set());
    setExplanation('');
    setJudgeResult(null);
    setAnswer(null);
    setError(null);
  }

  const canSubmit = selectedLines.size > 0 && explanation.length >= 5;

  // ── 题目列表 ─────────────────────────────────────────────────────────────
  if (phase === 'list') {
    return (
      <PageTransition>
        <div className="p-4 sm:p-6 pb-24 max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-white">代码扫雷</h1>
          <p className="text-gray-400 text-sm mb-6">找出代码里的 bug，选行号 + 写分析，AI 即时判分</p>

          {listLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {problems.map(p => (
              <button
                key={p.id}
                onClick={() => selectProblem(p.id)}
                disabled={detailLoading}
                className="w-full text-left bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700 hover:border-gray-500 rounded-xl p-4 transition-all duration-200 active:scale-[0.99] disabled:opacity-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500 font-mono">{p.id}</span>
                    <p className="text-white font-medium mt-0.5 truncate">{p.title}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0 mt-1 font-mono">{p.language}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  // ── 答题页 ────────────────────────────────────────────────────────────────
  return (
    <PageTransition>
      <div className="p-4 sm:p-6 pb-24 max-w-3xl mx-auto">

        {/* 返回按钮 */}
        <button
          onClick={backToList}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-200 text-sm mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          返回题目列表
        </button>

        {currentProblem && (
          <>
            {/* 题目标题 + 背景 */}
            <div className="mb-5">
              <span className="text-xs text-gray-500 font-mono">{currentProblem.id}</span>
              <h2 className="text-xl font-bold text-white mt-0.5 mb-2">{currentProblem.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{currentProblem.description}</p>
            </div>

            {/* 代码块 */}
            <div className="mb-5">
              <p className="text-xs text-gray-500 mb-2">
                点击行号选择你认为有问题的行（可多选）
              </p>
              <CodeBlock
                code={currentProblem.code}
                selectedLines={selectedLines}
                onLineClick={phase === 'detail' ? toggleLine : () => {}}
              />
              {selectedLines.size > 0 && (
                <p className="text-xs text-blue-400 mt-1.5 font-mono">
                  已选行：{[...selectedLines].sort((a, b) => a - b).join(', ')}
                </p>
              )}
            </div>

            {/* 分析说明输入框（答题阶段显示） */}
            {(phase === 'detail' || phase === 'judging') && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 block mb-1.5">
                  说明 bug 原因（至少 5 个字符）
                </label>
                <textarea
                  value={explanation}
                  onChange={e => setExplanation(e.target.value)}
                  disabled={phase === 'judging'}
                  placeholder="这段代码的问题在于……"
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-200 text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                />
              </div>
            )}

            {/* 提交按钮 */}
            {phase === 'detail' && (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-3 rounded-lg font-medium text-sm transition-all duration-200
                  bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                提交答案
              </button>
            )}

            {/* 判分中 */}
            {phase === 'judging' && (
              <div className="flex items-center justify-center gap-2 py-4 text-blue-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">AI 正在判分，稍等片刻…</span>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            {/* 判分结果 */}
            {phase === 'result' && judgeResult && (
              <JudgeResult
                result={judgeResult}
                onRetry={handleRetry}
                onGiveUp={handleGiveUp}
                answer={answer ?? undefined}
              />
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
