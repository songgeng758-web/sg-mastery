import { useState } from 'react';
import Card from '../common/Card';
import PageTransition from '../common/PageTransition';
import { knowledgeCards } from '../../data/mockData';
import type { KnowledgeCard as KnowledgeCardType } from '../../types';

/**
 * KnowledgeHub 页面组件
 * 
 * 显示"今日精进推送"标题和学习卡片列表
 * 从 mockData 加载知识卡片数据
 * 使用 Card 组件渲染每个学习卡片
 * 
 * 需求: 4.1, 4.2, 4.3, 4.7
 */
function KnowledgeHub() {
  // 跟踪展开的卡片 ID
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  /**
   * 处理展开阅读交互
   * 切换卡片的展开/收起状态
   */
  const handleExpand = (cardId: string) => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  };

  return (
    <PageTransition>
      <div className="p-3 sm:p-6 pb-20 sm:pb-24 max-w-7xl mx-auto">
      {/* 页面标题 - 需求 4.1 */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">今日精进推送</h1>
      <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">每日精选技术知识，助你持续成长</p>

      {/* 学习卡片列表 - 需求 4.2, 4.3, 4.7 */}
      {/* 使用响应式网格布局：移动端单列，平板双列，桌面三列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {knowledgeCards.map((card: KnowledgeCardType) => {
          const isExpanded = expandedCardId === card.id;
          
          return (
            <Card
              key={card.id}
              title={card.title}
              tags={card.tags}
              onExpand={() => handleExpand(card.id)}
            >
              {/* 显示内容预览或完整内容 */}
              {isExpanded ? (
                // 展开状态：显示完整内容
                <div className="whitespace-pre-line">
                  {card.content}
                </div>
              ) : (
                // 收起状态：显示内容预览（前 100 个字符）
                <div>
                  {card.content.length > 100
                    ? `${card.content.substring(0, 100)}...`
                    : card.content}
                </div>
              )}
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
