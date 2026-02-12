import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../store';
import { Dropdown } from './ui';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { setSidebarOpen, addToast } = useUIStore();

  const handleLogout = () => {
    logout();
    addToast('已退出登录', 'success');
    navigate('/login');
  };

  const userMenuItems = [
    { key: 'profile', label: '个人资料', onClick: () => navigate('/profile') },
    { key: 'password', label: '修改密码', onClick: () => navigate('/password') },
    { key: 'divider', label: '', isDivider: true },
    { key: 'logout', label: '退出登录', isDanger: true, onClick: handleLogout },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-content1/80 backdrop-blur-md border-b border-divider">
      <div className="flex items-center justify-between h-full px-4">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-content2 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Spacer for desktop */}
        <div className="hidden lg:block" />

        {/* User menu */}
        <div className="flex items-center gap-4">
          <Dropdown
            trigger={
              <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-content2 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary font-medium text-sm">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground">
                  {user?.username}
                </span>
                <svg className="w-4 h-4 text-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            }
            items={userMenuItems}
            placement="bottom-end"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
