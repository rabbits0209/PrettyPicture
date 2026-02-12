import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui';
import { Loading } from '../../components/Loading';
import { userApi } from '../../api/user';
import type { LogItem } from '../../types';

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface HomeData {
  userCount: number;
  imgCount: number;
  imgSize: number;
  imgMyCount: number;
}

interface StorageData {
  name: string;
  value: number;
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [storageData, setStorageData] = useState<StorageData[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [homeRes, storageRes, logRes] = await Promise.all([
          userApi.home(),
          userApi.storage(),
          userApi.log({ page: 1, size: 10, type: 1, read: 0 }),
        ]);

        setData((homeRes as any).data);
        setStorageData((storageRes as any).data || []);
        setLogs((logRes as any).data?.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <Loading fullscreen />;
  }

  const totalStorageSize = storageData.reduce((sum, s) => sum + s.value, 0);

  const stats = [
    {
      label: '用户总数',
      value: data?.userCount || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-blue-500',
    },
    {
      label: '图片总数',
      value: data?.imgCount || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-green-500',
    },
    {
      label: '存储总量',
      value: formatSize(data?.imgSize || 0),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">系统概况</h1>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-foreground/60">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Storage usage */}
      {storageData.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">存储桶使用情况</h2>
          <div className="space-y-4">
            {storageData.map((storage, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{storage.name}</span>
                    <span className="text-sm text-foreground/60">
                      {storage.value.toFixed(2)} MB
                    </span>
                  </div>
                  <div className="w-full bg-content2 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full"
                      style={{
                        width: `${Math.min((storage.value / (totalStorageSize || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent logs */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">最近操作日志</h2>
        {logs.length === 0 ? (
          <p className="text-foreground/60 text-center py-8">暂无日志</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 bg-content2 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-medium">
                    {log.user?.username?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{log.user?.username || '未知用户'}</span>
                    {' '}{log.content}
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">
                    {formatDate(log.create_time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
