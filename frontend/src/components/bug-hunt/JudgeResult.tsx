import { CheckCircle, XCircle, AlertCircle, Briefcase } from 'lucide-react';
import type { JudgeResponse } from '../../types';

interface JudgeResultProps {
  result: JudgeResponse;
  onRetry: () => void;
  onGiveUp: () => void;
  answer?: string;
}

const VERDICT_CONFIG = {
  correct: {
    icon: CheckCircle,
    iconClass: 'text-green-400',
    borderClass: 'border-green-500/40',
    bgClass: 'bg-green-900/20',
    labelClass: 'text-green-400',
    barClass: 'bg-green-500',
    label: '✓ 答对了！',
  },
  partial: {
    icon: AlertCircle,
    iconClass: 'text-yellow-400',
    borderClass: 'border-yellow-500/40',
    bgClass: 'bg-yellow-900/20',
    labelClass: 'text-yellow-400',
    barClass: 'bg-yellow-500',
    label: '△ 部分正确',
  },
  wrong: {
    icon: XCircle,
    iconClass: 'text-red-400',
    borderClass: 'border-red-500/40',
    bgClass: 'bg-red-900/20',
    labelClass: 'text-red-400',
    barClass: 'bg-red-500',
    label: '✗ 方向不对',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-gray-400',
    borderClass: 'border-gray-500/40',
    bgClass: 'bg-gray-900/20',
    labelClass: 'text-gray-400',
    barClass: 'bg-gray-500',
    label: '判分出错',
  },
} as const;

export default function JudgeResult({ result, onRetry, onGiveUp, answer }: JudgeResultProps) {
  const cfg = VERDICT_CONFIG[result.verdict];
  const Icon = cfg.icon;
  const isCorrect = result.verdict === 'correct';
  const needsRetry = result.verdict === 'partial' || result.verdict === 'wrong';

  return (
    <div className={`rounded-xl border ${cfg.borderClass} ${cfg.bgClass} overflow-hidden`}>

      {/* ── 顶部：verdict + 分数 ───────────────────────────────────────── */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${cfg.iconClass}`} />
            <span className={`text-sm font-semibold ${cfg.labelClass}`}>{cfg.label}</span>
          </div>
          <span className="text-2xl font-bold text-white tabular-nums">{result.score}</span>
        </div>

        {/* 进度条 */}
        <div className="h-1.5 rounded-full bg-gray-700/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${cfg.barClass}`}
            style={{ width: `${result.score}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-600">0</span>
          <span className="text-xs text-gray-600">100 分</span>
        </div>
      </div>

      {/* ── 中部：feedback ────────────────────────────────────────────── */}
      <div className="px-4 pb-3">
        <p className="text-gray-200 text-sm leading-relaxed">{result.feedback}</p>
      </div>

      {/* ── hint（partial/wrong）────────────────────────────────────── */}
      {result.hint && (
        <div className="mx-4 mb-3 px-3 py-2 bg-gray-700/30 border border-gray-600/30 rounded-lg">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="text-gray-500 font-medium">提示 → </span>
            {result.hint}
          </p>
        </div>
      )}

      {/* ── real_world_link（correct）────────────────────────────────── */}
      {isCorrect && result.real_world_link && (
        <div className="mx-4 mb-3 px-3 py-2.5 bg-green-900/20 border border-green-500/20 rounded-lg flex gap-2">
          <Briefcase className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-300 leading-relaxed">{result.real_world_link}</p>
        </div>
      )}

      {/* ── 操作按钮（partial/wrong，未看答案时）──────────────────── */}
      {needsRetry && !answer && (
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={onRetry}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
          >
            再试一次
          </button>
          <button
            onClick={onGiveUp}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-700/40 hover:bg-gray-600/40 text-gray-400 hover:text-gray-200 transition-colors"
          >
            我放弃，看答案
          </button>
        </div>
      )}

      {/* ── 完整解答（用户放弃后）───────────────────────────────────── */}
      {answer && (
        <div className="mx-4 mb-4 px-3 py-3 bg-gray-800/60 border border-gray-600/30 rounded-lg">
          <p className="text-xs text-gray-500 font-medium mb-2">完整解答</p>
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}
