import React, { useEffect, useRef, useState } from 'react';
import type { ImageItem } from '../types';
import { ImageCard } from './ImageCard';
import { Loading } from './Loading';
import { Empty } from './Empty';

interface MasonryGridProps {
  items: ImageItem[];
  onItemClick: (item: ImageItem) => void;
  onCopy: (url: string) => void;
  onDelete?: (id: number) => void;
  canDelete?: boolean;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  items,
  onItemClick,
  onCopy,
  onDelete,
  canDelete = false,
  isLoading = false,
  hasMore = false,
  onLoadMore,
}) => {
  const [columns, setColumns] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Calculate columns based on container width
  useEffect(() => {
    const updateColumns = () => {
      const width = containerRef.current?.offsetWidth || window.innerWidth;
      if (width < 640) setColumns(2);
      else if (width < 1024) setColumns(3);
      else if (width < 1280) setColumns(4);
      else setColumns(5);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  // Distribute items into columns
  const distributeItems = () => {
    const cols: ImageItem[][] = Array.from({ length: columns }, () => []);
    items.forEach((item, index) => {
      cols[index % columns].push(item);
    });
    return cols;
  };

  if (!isLoading && items.length === 0) {
    return (
      <Empty
        title="暂无图片"
        description="还没有上传任何图片，点击上传按钮开始吧"
      />
    );
  }

  const columnItems = distributeItems();

  return (
    <div ref={containerRef}>
      <div className="flex gap-4">
        {columnItems.map((column, colIndex) => (
          <div key={colIndex} className="flex-1 flex flex-col gap-4">
            {column.map((item) => (
              <ImageCard
                key={item.id}
                image={item}
                onClick={() => onItemClick(item)}
                onCopy={() => onCopy(item.url)}
                onDelete={canDelete && onDelete ? () => onDelete(item.id) : undefined}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {isLoading && <Loading size="md" text="加载中..." />}
        </div>
      )}

      {/* Loading state for initial load */}
      {isLoading && items.length === 0 && (
        <div className="py-12 flex justify-center">
          <Loading size="lg" text="加载中..." />
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;
