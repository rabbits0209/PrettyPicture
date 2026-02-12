import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { useConfigStore } from '../store';

export const Landing: React.FC = () => {
  const { config } = useConfigStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-divider">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">PP</span>
            </div>
            <span className="font-semibold text-foreground text-lg">PrettyPicture</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">登录</Button>
            </Link>
            {config.is_reg === 1 && (
              <Link to="/register">
                <Button color="primary">注册</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            简洁优雅的
            <span className="text-primary">图床服务</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/60 mb-10 max-w-2xl mx-auto">
            快速、安全、稳定的图片托管平台，支持多种云存储，让您的图片管理更加轻松
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/login">
              <Button color="primary" size="lg">开始使用</Button>
            </Link>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Button variant="flat" size="lg">了解更多</Button>
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-content1">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">核心功能</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              }
              title="快速上传"
              description="支持拖拽上传、批量上传，一键获取图片链接"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              }
              title="多种存储"
              description="支持本地存储、阿里云OSS、腾讯云COS、七牛云等"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              }
              title="API 接口"
              description="提供完善的 API 接口，轻松集成到您的应用中"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              }
              title="目录管理"
              description="支持创建目录分类管理图片，井井有条"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              title="多用户"
              description="支持多用户注册，角色权限管理，团队协作"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="安全可靠"
              description="数据加密传输，权限精细控制，保障您的数据安全"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">准备好开始了吗？</h2>
          <p className="text-foreground/60 mb-8">立即注册，体验简洁高效的图片管理服务</p>
          <Link to={config.is_reg === 1 ? '/register' : '/login'}>
            <Button color="primary" size="lg">
              {config.is_reg === 1 ? '免费注册' : '立即登录'}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-divider">
        <div className="max-w-6xl mx-auto text-center text-sm text-foreground/50">
          <p>© {new Date().getFullYear()} PrettyPicture. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="p-6 rounded-2xl bg-background border border-divider hover:border-primary/30 transition-colors">
    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-foreground/60 text-sm">{description}</p>
  </div>
);

export default Landing;
