import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary/20">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mt-4 mb-2">
          页面未找到
        </h2>
        <p className="text-foreground/60 mb-8">
          抱歉，您访问的页面不存在或已被移除
        </p>
        <Link to="/">
          <Button color="primary">返回首页</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
