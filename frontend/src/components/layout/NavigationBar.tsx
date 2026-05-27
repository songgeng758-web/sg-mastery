import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Bug, Database } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * 导航栏 Tab 配置接口
 */
interface NavTab {
  /** Tab 唯一标识符 */
  id: string;
  /** Tab 显示标签 */
  label: string;
  /** Tab 图标组件 */
  icon: LucideIcon;
  /** Tab 对应的路由路径 */
  path: string;
}

/**
 * NavigationBar 组件属性接口
 */
export interface NavigationBarProps {
  /** 当前激活的 Tab ID（可选，如果不提供则从路由自动判断） */
  activeTab?: string;
  /** Tab 切换回调函数（可选） */
  onTabChange?: (tabId: string) => void;
}

/**
 * 导航栏配置
 * 
 * 定义三个主要功能模块的导航 Tab
 */
const NAV_TABS: NavTab[] = [
  {
    id: 'knowledge',
    label: '知识补给站',
    icon: BookOpen,
    path: '/knowledge',
  },
  {
    id: 'debug',
    label: '代码扫雷',
    icon: Bug,
    path: '/bug-hunt',
  },
  {
    id: 'practice',
    label: 'HCM 实战',
    icon: Database,
    path: '/hcm-practice',
  },
];

/**
 * NavigationBar 组件
 * 
 * 底部导航栏组件，提供三个功能模块间的切换
 * 
 * 功能特性：
 * - 固定在页面底部
 * - 毛玻璃视觉效果（backdrop-blur）
 * - 高亮显示当前激活的 Tab
 * - 为每个 Tab 显示对应的图标
 * - 深色主题配色
 * 
 * 需求: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 10.6
 */
const NavigationBar: React.FC<NavigationBarProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 根据当前路由路径确定激活的 Tab
   */
  const getActiveTabFromPath = (): string => {
    const currentPath = location.pathname;
    const tab = NAV_TABS.find(tab => tab.path === currentPath);
    return tab ? tab.id : 'knowledge';
  };

  // 使用传入的 activeTab 或从路由自动判断
  const currentActiveTab = activeTab || getActiveTabFromPath();

  /**
   * 处理 Tab 点击事件
   * 
   * @param tab - 被点击的 Tab 配置
   */
  const handleTabClick = (tab: NavTab) => {
    // 触发回调函数（如果提供）
    if (onTabChange) {
      onTabChange(tab.id);
    }
    
    // 导航到对应的路由
    navigate(tab.path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-t border-gray-800"
      role="navigation"
      aria-label="主导航"
    >
      <div className="max-w-screen-xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around h-16 sm:h-20">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentActiveTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`
                  flex flex-col items-center justify-center gap-0.5 sm:gap-1 
                  px-2 sm:px-6 py-2 rounded-lg
                  transition-all duration-200 min-w-[70px] sm:min-w-[100px]
                  transform active:scale-95
                  ${isActive
                    ? 'text-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 hover:scale-105'
                  }
                `}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'text-blue-400' : ''}`}
                  aria-hidden="true"
                />
                <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
