import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui';
import { Empty } from '../components/Empty';
import { Loading } from '../components/Loading';
import { storageApi } from '../api/storage';
import { useUIStore } from '../store';
import type { StorageBucket } from '../types';

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const StorageView: React.FC = () => {
  const { addToast } = useUIStore();
  const [storages, setStorages] = useState<StorageBucket[]>([]);
  const [storageTypes, setStorageTypes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [res, typesRes] = await Promise.all([
          storageApi.query({ page: 1, size: 100 }),
          storageApi.type(),
        ]);
        setStorages((res as any).data?.data || []);
        setStorageTypes((typesRes as any).data || {});
      } catch {
        addToast('加载存储桶失败', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Loading fullscreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">存储桶</h1>

      {storages.length === 0 ? (
        <Empty title="暂无存储桶" description="系统暂未配置存储桶" />
      ) : (
        <div className="grid gap-4">
          {storages.map((storage) => (
            <Card key={storage.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{storage.name}</h3>
                  <p className="text-sm text-foreground/60">
                    {storageTypes[storage.type] || storage.type}
                    {' · '}
                    {storage.imgCount || 0} 张图片
                    {' · '}
                    {formatSize(storage.imgSize || 0)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StorageView;
