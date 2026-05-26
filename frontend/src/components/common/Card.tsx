import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface CardProps {
  /** 卡片标题 */
  title: string;
  /** 技术主题标签列表（可选） */
  tags?: string[];
  /** 卡片内容 */
  children: React.ReactNode;
  /** 展开按钮点击回调（可选） */
  onExpand?: () => void;
  /** 自定义类名（可选） */
  className?: string;
}

/**
 * Card 组件
 * 
 * 用于知识补给站页面的学习卡片容器
 * 提供圆角、半透明背景和深色主题样式
 * 
 * 需求: 10.4, 10.5
 */
const Card: React.FC<CardProps> = ({
  title,
  tags = [],
  children,
  onExpand,
  className = '',
}) => {
  return (
    <div
      className={`
        rounded-lg 
        bg-gray-800/50 
        backdrop-blur-sm 
        border border-gray-700/50
        p-4 sm:p-6 
        transition-all 
        duration-300 
        hover:bg-gray-800/70
        hover:border-gray-600/50
        hover:shadow-lg
        hover:shadow-blue-500/10
        hover:transform
        hover:scale-[1.02]
        ${className}
      `}
    >
      {/* 卡片标题 */}
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
        {title}
      </h3>

      {/* 标签列表 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="
                px-2 sm:px-3 
                py-0.5 sm:py-1 
                text-xs sm:text-sm 
                rounded-full 
                bg-blue-500/20 
                text-blue-300 
                border 
                border-blue-500/30
              "
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 卡片内容 */}
      <div className="text-sm sm:text-base text-gray-300 leading-relaxed">
        {children}
      </div>

      {/* 可选的展开按钮 */}
      {onExpand && (
        <button
          onClick={onExpand}
          className="
            mt-3 sm:mt-4 
            flex 
            items-center 
            gap-2 
            text-sm sm:text-base
            text-blue-400 
            hover:text-blue-300 
            transition-colors 
            duration-200
            group
          "
        >
          <span>展开阅读</span>
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200" />
        </button>
      )}
    </div>
  );
};

export default Card;
