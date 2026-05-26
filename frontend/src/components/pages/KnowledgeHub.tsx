import { useState } from 'react';
import { Sparkles, Loader2, RotateCw } from 'lucide-react';
import Card from '../common/Card';
import PageTransition from '../common/PageTransition';
import { knowledgeCards } from '../../data/mockData';
import { apiService } from '../../services/api';
import type { KnowledgeCard as KnowledgeCardType } from '../../types';

// 每张卡片独立的 AI 讲解状态
interface CardAiState {
  loading: boolean;
  content: string | null;
  error: string | null;
}

/**
 * KnowledgeHub 页面组件
 *
 * 显示"今日精进推送"标题和学习卡片列表。
 * 每张卡片底部提供 AI 类比讲解功能，调用 DeepSeek 生成五段式讲解。
 *
 * 需求: 4.1, 4.2, 4.3, 4.7
 */
function KnowledgeHub() {
  // ── 原有状态：展开/收起 ──────────────────────────────────────────────────
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // ── 新增状态：每张卡片独立的 AI 讲解状态 ────────────────────────────────
  const [aiStates, setAiStates] = useState<Record<string, CardAiState>>({});

  // ── 原有逻辑：展开阅读 ───────────────────────────────────────────────────
  const handleExpand = (cardId: string) => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  };

  // ── 新增逻辑：调用 AI 讲解 ───────────────────────────────────────────────
  const handleAiExplain = async (card: KnowledgeCardType) => {
    // 进入 loading，清空上次的内容和错误
    setAiStates(prev => ({
      ...prev,
      [card.id]: { loading: true, content: null, error: null },
    }));

    try {
      const response = await apiService.explainConcept(card.title);

      if (response.success) {
        setAiStates(prev => ({
          ...prev,
          [card.id]: { loading: false, content: response.data.content, error: null },
        }));
      } else {
        // 后端返回 success: false（AI 服务异常）
        setAiStates(prev => ({
          ...prev,
          [card.id]: {
            loading: false,
            content: null,
            error: response.data.content || 'AI 服务返回异常',
          },
        }));
      }
    } catch (err) {
      // 网络错误或 HTTP 非 2xx
      const message = err instanceof Error ? err.message : '未知错误';
      setAiStates(prev => ({
        ...prev,
        [card.id]: { loading: false, content: null, error: message },
      }));
    }
  };

  return (
    <PageTransition>
      <div className="p-3 sm:p-6 pb-20 sm:pb-24 max-w-7xl mx-auto">

        {/* 页面标题 - 需求 4.1 */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">今日精进推送</h1>
        <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">每日精选技术知识，助你持续成长</p>

        {/* 学习卡片列表 - 需求 4.2, 4.3, 4.7 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {knowledgeCards.map((card: KnowledgeCardType) => {
            const isExpanded = expandedCardId === card.id;
            const aiState = aiStates[card.id];
            const isLoading = aiState?.loading ?? false;
            const aiContent = aiState?.content ?? null;
            const aiError = aiState?.error ?? null;
            const hasResult = aiContent !== null || aiError !== null;

            return (
              <Card
                key={card.id}
                title={card.title}
                tags={card.tags}
                onExpand={() => handleExpand(card.id)}
              >
                {/* ── 原有：展开/收起内容（不改动） ─────────────────────── */}
                {isExpanded ? (
                  <div className="whitespace-pre-line">
                    {card.content}
                  </div>
                ) : (
                  <div>
                    {card.content.length > 100
                      ? `${card.content.substring(0, 100)}...`
                      : card.content}
                  </div>
                )}

                {/* ── 新增：AI 类比讲解区域 ──────────────────────────────── */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">

                  {/* AI 内容 / 错误区域（仅在有结果时渲染） */}
                  {hasResult && (
                    <div className="mb-3">
                      {/* 区域标题 */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-xs font-medium text-purple-400 tracking-wide">
                          AI 类比讲解
                        </span>
                      </div>

                      {/* 成功：显示 AI 生成内容 */}
                      {aiContent && (
                        <p className="text-sm text-gray-300/90 leading-relaxed whitespace-pre-line">
                          {aiContent}
                        </p>
                      )}

                      {/* 失败：显示错误提示 */}
                      {aiError && (
                        <div className="rounded-lg bg-red-900/20 border border-red-500/30 p-3">
                          <p className="text-sm text-red-300">
                            AI 暂时开小差了，请稍后重试
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {aiError}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI 按钮：三种状态 */}
                  <button
                    onClick={() => handleAiExplain(card)}
                    disabled={isLoading}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${isLoading
                        ? 'opacity-50 cursor-not-allowed bg-purple-900/20 text-purple-400 border border-purple-500/30'
                        : 'bg-purple-900/20 text-purple-400 border border-purple-500/30 hover:bg-purple-900/40 hover:border-purple-500/50 active:scale-95'
                      }
                    `}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        生成中...
                      </>
                    ) : aiContent ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5" />
                        重新生成
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        AI 类比讲解
                      </>
                    )}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* 如果没有卡片数据，显示提示信息 */}
        {knowledgeCards.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            暂无学习内容
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default KnowledgeHub;
