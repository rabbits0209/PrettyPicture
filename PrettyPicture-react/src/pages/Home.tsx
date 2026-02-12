import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import { useAuthStore, useUIStore } from '../store';
import { imagesApi } from '../api/images';
import type { ImageItem } from '../types';

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 MB';
  const mb = bytes / 1024 / 1024;
  return mb.toFixed(2) + ' MB';
};

export const Home: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [recentImages, setRecentImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentImages = async () => {
      try {
        const res: any = await imagesApi.query({ page: 1, size: 8, type: 1, name: '' });
        setRecentImages(res.data?.data || res.data || []);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };
    loadRecentImages();
  }, []);

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      addToast('链接已复制', 'success');
    } catch {
      addToast('复制失败', 'error');
    }
  };

  const usedPercent = user ? (user.user_size / user.capacity) * 100 : 0;

  const quickActions = [
    {
      title: '上传图片',
      description: '上传新图片到图床',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      link: '/upload',
      color: 'bg-blue-500',
    },
    {
      title: '图库',
      description: '浏览和管理图片',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      link: '/gallery',
      color: 'bg-green-500',
    },
    {
      title: 'API 接口',
      description: '查看 API 文档',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      link: '/api-docs',
      color: 'bg-purple-500',
    },
    {
      title: '个人资料',
      description: '管理账户信息',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      link: '/profile',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            欢迎回来，{user?.username}
          </h1>
          <p className="text-foreground/60 mt-1">
            {user?.role?.name || '普通用户'}
          </p>
        </div>
        <Link to="/upload">
          <Button color="primary">上传图片</Button>
        </Link>
      </div>

      {/* Storage quota */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">存储空间</h2>
          <span className="text-sm text-foreground/60">
            {formatSize(user?.user_size || 0)} / {formatSize(user?.capacity || 0)}
          </span>
        </div>
        <div className="w-full bg-content2 rounded-full h-3 overflow-hidden">
          <div
            className="bg-primary h-full transition-all"
            style={{ width: `${Math.min(usedPercent, 100)}%` }}
          />
        </div>
        <p className="text-sm text-foreground/60 mt-2">
          已使用 {usedPercent.toFixed(1)}% 的存储空间
        </p>
      </Card>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">快速操作</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <Card className="p-4 hover:bg-content2 transition-colors cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{action.title}</h3>
                    <p className="text-sm text-foreground/60 mt-1">{action.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent uploads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">最近上传</h2>
          <Link to="/gallery" className="text-sm text-primary hover:underline">
            查看全部
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-content2 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentImages.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-foreground/60">还没有上传任何图片</p>
            <Link to="/upload" className="mt-4 inline-block">
              <Button color="primary">立即上传</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {recentImages.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-content2 cursor-pointer"
                onClick={() => handleCopy(image.url)}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">点击复制链接</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
