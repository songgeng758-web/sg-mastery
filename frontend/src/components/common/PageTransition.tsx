import React, { useEffect, useState } from 'react';

export interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition 组件
 * 
 * 为页面切换提供淡入淡出过渡动画效果
 * 提升用户体验，使页面切换更加流畅
 * 
 * 需求: 3.4
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 组件挂载时触发淡入动画
    setIsVisible(true);

    // 组件卸载时重置状态
    return () => {
      setIsVisible(false);
    };
  }, []);

  return (
    <div
      className={`
        transition-all 
        duration-300 
        ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {children}
    </div>
  );
};

export default PageTransition;
