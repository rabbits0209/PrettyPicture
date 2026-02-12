import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../types';

export interface UseToastReturn {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  clearAll: () => void;
}

/**
 * Toast 消息管理 Hook
 * 提供添加、移除和快捷方法来管理 Toast 消息
 * 
 * @param maxToasts - 最大同时显示的 Toast 数量，默认为 5
 * @returns Toast 管理方法和当前 Toast 列表
 */
export const useToast = (maxToasts: number = 5): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      // 保持最多 maxToasts 条消息
      const newToasts = [...prev, { id, message, type }];
      if (newToasts.length > maxToasts) {
        return newToasts.slice(-maxToasts);
      }
      return newToasts;
    });
  }, [maxToasts]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => {
    addToast(message, 'success');
  }, [addToast]);

  const error = useCallback((message: string) => {
    addToast(message, 'error');
  }, [addToast]);

  const info = useCallback((message: string) => {
    addToast(message, 'info');
  }, [addToast]);

  const warning = useCallback((message: string) => {
    addToast(message, 'warning');
  }, [addToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
    clearAll,
  };
};

export default useToast;
