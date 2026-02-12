import React, { useEffect } from 'react';
import type { ImageItem } from '../types';
import { Button } from './ui';

interface DrawerProps {
  isOpen: boolean;
  image: ImageItem | null;
  onClose: () => void;
  onCopy: (url: string) => void;
  onDelete?: (id: number) => void;
  onOpenNew: (url: string) => void;
  canDelete?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  image,
  onClose,
  onCopy,
  onDelete,
  onOpenNew,
  canDelete = false,
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-content1 z-50 shadow-xl animate-slide-in overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-content1 border-b border-divider px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">图片详情</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-content2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Image preview */}
          <div className="rounded-xl overflow-hidden bg-content2">
            <img
              src={image.url}
              alt={image.name}
              className="w-full object-contain max-h-64"
            />
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-foreground/60 uppercase tracking-wide">文件名</label>
              <p className="text-foreground font-medium mt-1">{image.name}</p>
            </div>

            <div>
              <label className="text-xs text-foreground/60 uppercase tracking-wide">图片链接</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={image.url}
                  readOnly
                  className="flex-1 px-3 py-2 bg-content2 rounded-lg text-sm text-foreground border border-divider"
                />
                <Button
                  variant="flat"
                  size="sm"
                  onClick={() => onCopy(image.url)}
                >
                  复制
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-foreground/60 uppercase tracking-wide">文件大小</label>
                <p className="text-foreground mt-1">{formatFileSize(image.size)}</p>
              </div>
              <div>
                <label className="text-xs text-foreground/60 uppercase tracking-wide">尺寸</label>
                <p className="text-foreground mt-1">{image.width} × {image.height}</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-foreground/60 uppercase tracking-wide">上传时间</label>
              <p className="text-foreground mt-1">{formatDate(image.create_time)}</p>
            </div>

            {image.folder_name && (
              <div>
                <label className="text-xs text-foreground/60 uppercase tracking-wide">所属目录</label>
                <p className="text-foreground mt-1">{image.folder_name}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-divider">
            <Button
              variant="flat"
              className="flex-1"
              onClick={() => onOpenNew(image.url)}
            >
              新窗口打开
            </Button>
            {canDelete && onDelete && (
              <Button
                color="danger"
                className="flex-1"
                onClick={() => onDelete(image.id)}
              >
                删除图片
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Drawer;
