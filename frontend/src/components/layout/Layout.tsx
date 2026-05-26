import React from 'react';
import NavigationBar from './NavigationBar';

/**
 * Layout 组件属性接口
 */
export interface LayoutProps {
  /** 页面内容 */
  children: React.ReactNode;
}

/**
 * Layout 组件
 * 
 * 全局布局组件，为应用提供统一的页面结构
 * 
 * 功能特性：
 * - 深色主题背景
 * - 集成底部导航栏
 * - 为页面内容提供合适的内边距，避免被导航栏遮挡
 * - 响应式布局支持
 * 
 * 需求: 10.1, 10.2, 10.8
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-gray-100">
      {/* 主内容区域 */}
      <main className="pb-24 min-h-screen">
        {children}
      </main>

      {/* 底部导航栏 */}
      <NavigationBar />
    </div>
  );
};

export default Layout;
