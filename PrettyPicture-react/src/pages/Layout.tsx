import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { userApi } from '../api/user';
import { useAuthStore } from '../store';

export const Layout: React.FC = () => {
  const { setUser, user, token } = useAuthStore();
  const [loading, setLoading] = useState(!user);

  // 页面加载时获取用户信息
  useEffect(() => {
    if (!user && token) {
      setLoading(true);
      userApi.info().then((res: any) => {
        setUser(res.data);
      }).catch(() => {
        // 获取失败会在拦截器中处理
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [user, token, setUser]);

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
