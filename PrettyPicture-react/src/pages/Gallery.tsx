import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Drawer } from '../components/Drawer';
import { Input, Button, Modal } from '../components/ui';
import { ImageCard } from '../components/ImageCard';
import { Loading } from '../components/Loading';
import { Empty } from '../components/Empty';
import { imagesApi } from '../api/images';
import { folderApi } from '../api/folder';
import { useAuthStore, useUIStore } from '../store';
import type { ImageItem, Folder } from '../types';

export const Gallery: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [images, setImages] = useState<ImageItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [folderId, setFolderId] = useState<number | undefined>();
  const [viewType, setViewType] = useState<'all' | 'mine'>('all');
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [columns, setColumns] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  // 批量管理状态
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveFolderId, setMoveFolderId] = useState<number>(0);
  const [moving, setMoving] = useState(false);

  const pageSize = 20;
  const canViewAll = user?.role?.is_read_all === 1 || user?.role?.is_admin === 1;
  const canDelete = user?.role?.is_del_own === 1 || user?.role?.is_del_all === 1 || user?.role?.is_admin === 1;

  // 计算列数
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

  // Load folders
  useEffect(() => {
    folderApi.query().then((res: any) => {
      setFolders(res.data || []);
    }).catch(() => {});
  }, []);

  // Load images
  const loadImages = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const res: any = await imagesApi.query({
        page: currentPage,
        size: pageSize,
        name: search || '',
        folder_id: folderId,
        type: viewType === 'mine' ? 1 : 0,
      });

      const data = res.data;
      const imageList = data?.data || data || [];
      setImages(imageList);
      
      const totalCount = data?.total || imageList.length;
      setTotal(totalCount);
      setTotalPages(Math.ceil(totalCount / pageSize) || 1);
    } catch (err) {
      addToast('加载图片失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, folderId, viewType, addToast]);

  // 筛选条件变化时重置到第一页
  useEffect(() => {
    setPage(1);
    loadImages(1);
  }, [search, folderId, viewType]);

  // 页码变化时加载数据
  useEffect(() => {
    loadImages(page);
  }, [page]);

  // 退出批量模式时清空选择
  useEffect(() => {
    if (!batchMode) {
      setSelectedIds(new Set());
    }
  }, [batchMode]);

  // 跳转页码
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Copy link
  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      addToast('链接已复制', 'success');
    } catch {
      addToast('复制失败', 'error');
    }
  };

  // Delete image
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这张图片吗？')) return;
    try {
      await imagesApi.delete(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
      setDrawerOpen(false);
      addToast('删除成功', 'success');
    } catch (err: any) {
      addToast(err.msg || '删除失败', 'error');
    }
  };

  // Open image detail
  const handleImageClick = (image: ImageItem) => {
    if (batchMode) {
      toggleSelect(image.id);
    } else {
      setSelectedImage(image);
      setDrawerOpen(true);
    }
  };

  // 切换选择
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 全选当前页
  const selectAll = () => {
    setSelectedIds(new Set(images.map(img => img.id)));
  };

  // 取消全选
  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      addToast('请先选择图片', 'warning');
      return;
    }
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 张图片吗？`)) return;

    setBatchDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        await imagesApi.delete(id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setImages(prev => prev.filter(img => !selectedIds.has(img.id)));
    setSelectedIds(new Set());
    setBatchDeleting(false);

    if (failCount === 0) {
      addToast(`成功删除 ${successCount} 张图片`, 'success');
    } else {
      addToast(`删除完成: ${successCount} 成功, ${failCount} 失败`, 'warning');
    }

    // 如果当前页删完了，回到上一页
    if (images.length === selectedIds.size && page > 1) {
      setPage(page - 1);
    } else {
      loadImages(page);
    }
  };

  // 批量复制链接
  const handleBatchCopy = async () => {
    if (selectedIds.size === 0) {
      addToast('请先选择图片', 'warning');
      return;
    }
    setCopyModalOpen(true);
  };

  // 获取选中图片的链接
  const getSelectedUrls = (format: 'url' | 'markdown' | 'html') => {
    const selectedImages = images.filter(img => selectedIds.has(img.id));
    return selectedImages.map(img => {
      switch (format) {
        case 'markdown':
          return `![${img.name}](${img.url})`;
        case 'html':
          return `<img src="${img.url}" alt="${img.name}" />`;
        default:
          return img.url;
      }
    }).join('\n');
  };

  const copyWithFormat = async (format: 'url' | 'markdown' | 'html') => {
    const text = getSelectedUrls(format);
    try {
      await navigator.clipboard.writeText(text);
      addToast(`已复制 ${selectedIds.size} 个链接`, 'success');
      setCopyModalOpen(false);
    } catch {
      addToast('复制失败', 'error');
    }
  };

  // 批量移动目录
  const handleBatchMove = async () => {
    if (selectedIds.size === 0) {
      addToast('请先选择图片', 'warning');
      return;
    }
    setMoveModalOpen(true);
  };

  const confirmMove = async () => {
    setMoving(true);
    try {
      await imagesApi.move(Array.from(selectedIds), moveFolderId);
      addToast(`成功移动 ${selectedIds.size} 张图片`, 'success');
      setMoveModalOpen(false);
      setSelectedIds(new Set());
      loadImages(page);
    } catch (err: any) {
      addToast(err.msg || '移动失败', 'error');
    } finally {
      setMoving(false);
    }
  };

  // 瀑布流分布
  const distributeItems = () => {
    const cols: ImageItem[][] = Array.from({ length: columns }, () => []);
    images.forEach((item, index) => {
      cols[index % columns].push(item);
    });
    return cols;
  };

  // 生成分页按钮
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const showPages = 5;
    
    let startPage = Math.max(1, page - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    
    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="flat"
          size="sm"
          onClick={() => goToPage(page - 1)}
          isDisabled={page === 1}
        >
          上一页
        </Button>
        
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => (
            typeof p === 'number' ? (
              <button
                key={idx}
                onClick={() => goToPage(p)}
                className={`min-w-[36px] h-9 px-3 rounded-lg text-sm transition-colors ${
                  p === page
                    ? 'bg-primary text-white'
                    : 'bg-content2 text-foreground hover:bg-content3'
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-2 text-foreground/50">...</span>
            )
          ))}
        </div>

        <Button
          variant="flat"
          size="sm"
          onClick={() => goToPage(page + 1)}
          isDisabled={page === totalPages}
        >
          下一页
        </Button>
      </div>
    );
  };

  const columnItems = distributeItems();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">图库</h1>
          {total > 0 && (
            <span className="text-sm text-foreground/60">共 {total} 张</span>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 批量管理按钮 */}
          <Button
            variant={batchMode ? 'solid' : 'flat'}
            color={batchMode ? 'primary' : 'default'}
            size="sm"
            onClick={() => setBatchMode(!batchMode)}
          >
            {batchMode ? '退出批量' : '批量管理'}
          </Button>

          {canViewAll && (
            <div className="flex rounded-lg overflow-hidden border border-divider">
              <button
                onClick={() => setViewType('all')}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  viewType === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-content1 text-foreground/70 hover:bg-content2'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setViewType('mine')}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  viewType === 'mine'
                    ? 'bg-primary text-white'
                    : 'bg-content1 text-foreground/70 hover:bg-content2'
                }`}
              >
                只看我的
              </button>
            </div>
          )}

          <select
            value={folderId || ''}
            onChange={(e) => setFolderId(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-1.5 bg-content1 border border-divider rounded-lg text-sm text-foreground"
          >
            <option value="">全部目录</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>

          <div className="w-48">
            <Input
              placeholder="搜索图片..."
              value={search}
              onChange={setSearch}
              startContent={
                <svg className="w-4 h-4 text-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* 批量操作栏 */}
      {batchMode && (
        <div className="flex items-center justify-between p-3 bg-content1 rounded-xl border border-divider">
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground/70">
              已选择 <span className="text-primary font-medium">{selectedIds.size}</span> 张图片
            </span>
            <Button variant="ghost" size="sm" onClick={selectAll}>全选本页</Button>
            <Button variant="ghost" size="sm" onClick={deselectAll}>取消全选</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="flat"
              size="sm"
              onClick={handleBatchCopy}
              isDisabled={selectedIds.size === 0}
            >
              复制链接
            </Button>
            <Button
              variant="flat"
              size="sm"
              onClick={handleBatchMove}
              isDisabled={selectedIds.size === 0}
            >
              移动目录
            </Button>
            {canDelete && (
              <Button
                variant="flat"
                size="sm"
                color="danger"
                onClick={handleBatchDelete}
                isLoading={batchDeleting}
                isDisabled={selectedIds.size === 0}
              >
                批量删除
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Gallery grid - Masonry */}
      <div ref={containerRef}>
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loading size="lg" text="加载中..." />
          </div>
        ) : images.length === 0 ? (
          <Empty
            title="暂无图片"
            description="还没有上传任何图片，点击上传按钮开始吧"
          />
        ) : (
          <>
            <div className="flex gap-4">
              {columnItems.map((column, colIndex) => (
                <div key={colIndex} className="flex-1 flex flex-col gap-4">
                  {column.map((item) => (
                    <div key={item.id} className="relative">
                      {/* 选择框 */}
                      {batchMode && (
                        <div
                          className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${
                            selectedIds.has(item.id)
                              ? 'bg-primary border-primary'
                              : 'bg-black/30 border-white/70 hover:border-white'
                          }`}
                          onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                        >
                          {selectedIds.has(item.id) && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      )}
                      <ImageCard
                        image={item}
                        onClick={() => handleImageClick(item)}
                        onCopy={batchMode ? undefined : () => { handleCopy(item.url); }}
                        onDelete={batchMode ? undefined : (canDelete ? () => { handleDelete(item.id); } : undefined)}
                        useThumbnail
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>

      {/* Image detail drawer */}
      <Drawer
        isOpen={drawerOpen}
        image={selectedImage}
        onClose={() => setDrawerOpen(false)}
        onCopy={handleCopy}
        onDelete={handleDelete}
        onOpenNew={(url: string) => window.open(url, '_blank')}
        canDelete={canDelete}
      />

      {/* 批量复制链接弹窗 */}
      <Modal
        isOpen={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        title="复制链接"
      >
        <div className="space-y-3">
          <p className="text-sm text-foreground/60">选择复制格式（共 {selectedIds.size} 张图片）</p>
          <div className="space-y-2">
            <Button
              variant="flat"
              className="w-full justify-start"
              onClick={() => copyWithFormat('url')}
            >
              URL 格式
            </Button>
            <Button
              variant="flat"
              className="w-full justify-start"
              onClick={() => copyWithFormat('markdown')}
            >
              Markdown 格式
            </Button>
            <Button
              variant="flat"
              className="w-full justify-start"
              onClick={() => copyWithFormat('html')}
            >
              HTML 格式
            </Button>
          </div>
        </div>
      </Modal>

      {/* 移动目录弹窗 */}
      <Modal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        title="移动到目录"
      >
        <div className="space-y-4">
          <p className="text-sm text-foreground/60">选择目标目录（共 {selectedIds.size} 张图片）</p>
          <select
            value={moveFolderId}
            onChange={(e) => setMoveFolderId(Number(e.target.value))}
            className="w-full px-3 py-2 bg-content1 border border-divider rounded-lg text-foreground"
          >
            <option value={0}>默认目录</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 justify-end">
            <Button variant="flat" onClick={() => setMoveModalOpen(false)}>
              取消
            </Button>
            <Button color="primary" onClick={confirmMove} isLoading={moving}>
              确认移动
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Gallery;
