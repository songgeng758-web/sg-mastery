import { useState, useEffect } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import PageTransition from '../common/PageTransition';
import { ProblemCard } from '../hcm-practice/ProblemCard';
import { JudgeResult } from '../hcm-practice/JudgeResult';
import { CodeEditor } from '../hcm-practice/CodeEditor';
import { apiService } from '../../services/api';
import type {
  HcmProblemSummary,
  HcmProblemDetail,
  HcmJudgeResponse,
} from '../../types';

type Phase = 'list' | 'detail' | 'judging' | 'result';

export default function HcmPractice() {
  const [phase, setPhase] = useState<Phase>('list');
  const [problems, setProblems] = useState<HcmProblemSummary[]>([]);
  const [currentProblem, setCurrentProblem] = useState<HcmProblemDetail | null>(null);
  const [userCode, setUserCode] = useState('');
  const [userExplanation, setUserExplanation] = useState('');
  const [judgeResult, setJudgeResult] = useState<HcmJudgeResponse | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getHcmProblems()
      .then(setProblems)
      .catch((e) => setError(e instanceof Error ? e.message : '加载题库失败'))
      .finally(() => setListLoading(false));
  }, []);

  async function selectProblem(id: string) {
    setDetailLoading(true);
    setError(null);
    setUserCode('');
    setUserExplanation('');
    setJudgeResult(null);
    setAnswer(null);
    try {
      const detail = await apiService.getHcmProblem(id);
      setCurrentProblem(detail);
      // Python 题：预填原始有问题的代码，供用户修改
      if (detail.language === 'python' && detail.code) {
        setUserCode(detail.code);
      }
      setPhase('detail');
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载题目失败');
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSubmit() {
    if (!currentProblem) return;
    setPhase('judging');
    setError(null);
    try {
      const result = await apiService.judgeHcm({
        problem_id: currentProblem.id,
        language: currentProblem.language as 'sql' | 'python',
        user_code: userCode,
        user_explanation: userExplanation,
      });
      setJudgeResult(result);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败，请重试');
      setPhase('detail');
    }
  }

  function handleRetry() {
    setJudgeResult(null);
    setAnswer(null);
    setPhase('detail');
    // userCode / userExplanation preserved
  }

  async function handleGiveUp() {
    if (!currentProblem) return;
    try {
      const data = await apiService.getHcmAnswer(currentProblem.id);
      setAnswer(data.answer);
    } catch {
      setAnswer('获取答案失败，请重试');
    }
  }

  function backToList() {
    setPhase('list');
    setCurrentProblem(null);
    setUserCode('');
    setUserExplanation('');
    setJudgeResult(null);
    setAnswer(null);
    setError(null);
  }

  const isPython = currentProblem?.language === 'python';
  const canSubmit =
    userCode.trim().length > 0 &&
    (!isPython || userExplanation.trim().length >= 5);

  // ── 题目列表 ──────────────────────────────────────────────────────────────
  if (phase === 'list') {
    return (
      <PageTransition>
        <div className="p-4 sm:p-6 pb-24 max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-white">HCM 实战</h1>
          <p className="text-gray-400 text-sm mb-6">
            用真实 HCM 场景练 SQL / Python，AI 即时判分
          </p>

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
            {problems.map((p) => (
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
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0 mt-1 font-mono">
                    {p.language}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  // ── 答题 / 判分中 / 结果 ──────────────────────────────────────────────────
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
            {/* 题目详情卡片 */}
            <div className="mb-5">
              <ProblemCard problem={currentProblem} />
            </div>

            {/* ── 答题区（detail / judging）─────────────────────────────── */}
            {(phase === 'detail' || phase === 'judging') && (
              <>
                {/* 代码编辑器 */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1.5">
                    {isPython ? '修改代码，修复 bug' : '编写 SQL 查询'}
                  </p>
                  <CodeEditor
                    value={userCode}
                    onChange={setUserCode}
                    language={currentProblem.language as 'sql' | 'python'}
                    readOnly={phase === 'judging'}
                  />
                </div>

                {/* Python 题：修改说明 */}
                {isPython && (
                  <div className="mb-4">
                    <label className="text-xs text-gray-500 block mb-1.5">
                      说明你改了什么、为什么这样改（至少 5 个字符）
                    </label>
                    <textarea
                      value={userExplanation}
                      onChange={(e) => setUserExplanation(e.target.value)}
                      disabled={phase === 'judging'}
                      placeholder="我把第 X 行改成了……，因为……"
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
                    className="w-full py-3 rounded-lg font-medium text-sm transition-all duration-200 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    提交答案
                  </button>
                )}

                {/* 判分中 */}
                {phase === 'judging' && (
                  <div className="flex items-center justify-center gap-2 py-4 text-blue-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">
                      {isPython ? 'AI 正在判分，稍等片刻…' : '判分中…'}
                    </span>
                  </div>
                )}

                {error && (
                  <div className="text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-3 mt-3 text-sm">
                    {error}
                  </div>
                )}
              </>
            )}

            {/* ── 结果区（result）──────────────────────────────────────── */}
            {phase === 'result' && judgeResult && (
              <>
                <div className="mb-4">
                  <JudgeResult result={judgeResult} />
                </div>

                {/* 完整解答 */}
                {answer && (
                  <div className="mb-4 px-4 py-3 bg-gray-800/60 border border-gray-600/30 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium mb-2">完整解答</p>
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                      {answer}
                    </p>
                  </div>
                )}

                {/* 操作按钮组 */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
                  >
                    再试一次
                  </button>
                  {!answer && judgeResult.verdict !== 'correct' && (
                    <button
                      onClick={handleGiveUp}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-700/40 hover:bg-gray-600/40 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      我放弃，看答案
                    </button>
                  )}
                  <button
                    onClick={backToList}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    换一题
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
