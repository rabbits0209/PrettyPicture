import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ToastMessage, ToastType } from '../types';

// Toast 图标组件
const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  const iconClasses = 'w-5 h-5 flex-shrink-0';
  
  switch (type) {
    case 'success':
      return (
        <svg className={`${iconClasses} text-success`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg className={`${iconClasses} text-danger`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'warning':
      return (
        <svg className={`${iconClasses} text-warning`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg className={`${iconClasses} text-primary`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

// 关闭按钮组件
const CloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="ml-2 p-1 rounded-small hover:bg-content3 transition-colors flex-shrink-0"
    aria-label="关闭"
  >
    <svg className="w-4 h-4 text-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);

// 单个 Toast 组件
interface ToastItemProps extends ToastMessage {
  onRemove: () => void;
  duration?: number;
}

const ToastItem: React.FC<ToastItemProps> = ({ 
  message, 
  type, 
  onRemove, 
  duration = 3000 
}) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onRemove, 200); // 等待退出动画完成
  }, [onRemove]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  // 根据类型获取背景色
  const getBgColor = (): string => {
    switch (type) {
      case 'success':
        return 'border-l-success';
      case 'error':
        return 'border-l-danger';
      case 'warning':
        return 'border-l-warning';
      case 'info':
      default:
        return 'border-l-primary';
    }
  };

  return (
    <div
      className={`
        pointer-events-auto
        min-w-[280px] max-w-[400px]
        bg-content1 border border-divider
        border-l-4 ${getBgColor()}
        shadow-lg rounded-medium
        p-3 flex items-center gap-3
        ${isExiting ? 'animate-fade-out' : 'animate-slide-in'}
      `}
      role="alert"
    >
      <ToastIcon type={type} />
      <span className="text-sm font-medium text-foreground flex-1">{message}</span>
      <CloseButton onClick={handleClose} />
    </div>
  );
};

// Toast 容器组件
export interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
  duration?: number;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  removeToast,
  duration = 3000 
}) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div 
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2"
      style={{ pointerEvents: 'none' }}
      aria-live="polite"
      aria-label="通知消息"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onRemove={() => removeToast(toast.id)}
          duration={duration}
        />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
